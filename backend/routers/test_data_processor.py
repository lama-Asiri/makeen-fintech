"""
Test router — same logic as data_processor.py + auth.py parse/train/processQuestion
but with NO authentication and NO Supabase.

How to use from Swagger:
  1. POST /test/parse           — upload your CSV/XLSX file + set chat_id (e.g. 1)
  2. POST /test/train           — body: {"chat_id": 1, "target_column": "your_target"}
  3. POST /test/processQuestion — body: {"chat_id": 1, "question": "your question"}

Target column changes: /test/processQuestion auto-retrains if the question implies
a different target than the one currently trained. No manual re-call to /test/train needed.

HISTORY_EXPLANATION: follow-up questions (e.g. "why?", "explain more") are handled by
reading from the in-memory _chat_history_cache, same as the production endpoint.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import pandas as pd
import json
import io
import numpy as np
import shap
from collections import Counter
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, r2_score

from core.openai_client import openai_client

router = APIRouter(prefix="/test")

# ─────────────────────────────────────────────────────────────────────────────
# In-memory caches (isolated from the real auth.py caches)
# ─────────────────────────────────────────────────────────────────────────────

_cleaned_data_cache: dict = {}
_trained_models: dict = {}
_prediction_cache: dict = {}
_chat_history_cache: dict[int, list[dict]] = {}


# ─────────────────────────────────────────────────────────────────────────────
# /parse  — upload a file directly, no Supabase needed
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/parse")
async def test_parse(
    file: UploadFile = File(...),
    chat_id: int = Form(...),
):
    filename = file.filename or ""
    if not filename.lower().endswith((".csv", ".xlsx")):
        raise HTTPException(status_code=400, detail="Only CSV or XLSX files are supported")

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10 MB limit")

    try:
        if filename.lower().endswith(".csv"):
            df = pd.read_csv(io.BytesIO(file_bytes))
        else:
            df = pd.read_excel(io.BytesIO(file_bytes))

        if df.empty:
            raise HTTPException(status_code=400, detail="File is empty")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File parse failed: {e}")

    def clean_col(col):
        col = str(col).strip().replace(" ", "_").replace("-", "_")
        col = "".join(c if c.isalnum() or c == "_" else "" for c in col)
        while "__" in col:
            col = col.replace("__", "_")
        return col

    df.columns = [clean_col(c) for c in df.columns]

    id_patterns = {'id', 'user_id', 'customer_id', 'transaction_id', 'index', 'uid', 'pk'}
    id_columns = [c for c in df.columns
                  if c.lower() in id_patterns or c.lower().endswith(('_id', 'id'))]

    df = df.drop_duplicates(keep='first')
    df = df.dropna(axis=1, thresh=len(df) * 0.4)

    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].astype(str).str.strip()

    for col in df.select_dtypes(include=['object']).columns:
        if col in id_columns:
            continue
        try:
            numeric_version = pd.to_numeric(df[col], errors='coerce')
            if numeric_version.notna().sum() / len(numeric_version) > 0.9:
                df[col] = numeric_version
        except Exception:
            pass

    for col in df.columns:
        if col in id_columns:
            continue
        if df[col].isnull().any():
            if pd.api.types.is_numeric_dtype(df[col]):
                df[col].fillna(df[col].median(), inplace=True)
            else:
                mode_val = df[col].mode()[0] if len(df[col].mode()) > 0 else "UNKNOWN"
                df[col].fillna(mode_val, inplace=True)

    _cleaned_data_cache[chat_id] = {
        "df":         df,
        "id_columns": id_columns,
    }

    return {
        "message":    "File parsed and cached",
        "chat_id":    chat_id,
        "rows":       len(df),
        "columns":    df.columns.tolist(),
        "id_columns": id_columns,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Training
# ─────────────────────────────────────────────────────────────────────────────

class TrainRequest(BaseModel):
    chat_id: int
    target_column: str


def _run_train(chat_id: int, target_column: str) -> dict:
    cache   = _cleaned_data_cache[chat_id]
    df      = cache["df"].copy()
    id_cols = cache["id_columns"]

    if target_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Column '{target_column}' not found. Available: {', '.join(df.columns)}"
        )

    cols_to_exclude    = list(set(id_cols + [target_column]))
    X                  = df.drop(columns=[c for c in cols_to_exclude if c in df.columns])
    y                  = df[target_column]
    feature_names_orig = X.columns.tolist()

    if y.nunique() < 2:
        raise HTTPException(status_code=400, detail="Target column must have at least 2 unique values")

    task_type = "classification" if (y.dtype == "object" or y.nunique() <= 10) else "regression"

    encoders = {}
    for col in X.select_dtypes(include=["object"]).columns:
        n_unique = X[col].nunique()
        if n_unique == 2:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            encoders[col] = {"type": "label", "encoder": le}
        elif n_unique <= 10:
            X = pd.get_dummies(X, columns=[col], prefix=col, drop_first=True)
            encoders[col] = {"type": "one_hot"}
        else:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            encoders[col] = {"type": "label", "encoder": le}

    bool_cols = X.select_dtypes(include=["bool"]).columns
    X[bool_cols] = X[bool_cols].astype(int)
    feature_names = X.columns.tolist()

    le_target    = None
    class_labels = None
    if task_type == "classification":
        le_target    = LabelEncoder()
        y_encoded    = le_target.fit_transform(y.astype(str))
        class_labels = le_target.classes_.tolist()
    else:
        y_encoded = y.astype(float).values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42
    )

    if task_type == "classification":
        model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1, max_depth=15)
        model.fit(X_train, y_train)
        score = accuracy_score(y_test, model.predict(X_test))
    else:
        model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1, max_depth=15)
        model.fit(X_train, y_train)
        score = r2_score(y_test, model.predict(X_test))

    top_features = sorted(
        zip(feature_names, model.feature_importances_),
        key=lambda x: x[1], reverse=True,
    )[:5]

    _trained_models[chat_id] = {
        "model":                  model,
        "X":                      X,
        "X_train":                X_train,
        "feature_names":          feature_names,
        "feature_names_original": feature_names_orig,
        "target_column":          target_column,
        "task_type":              task_type,
        "class_labels":           class_labels,
        "le_target":              le_target,
        "encoders":               encoders,
    }

    metric_key = "accuracy" if task_type == "classification" else "r2_score"
    return {"task_type": task_type, "top_features": top_features, metric_key: round(score, 4)}


@router.post("/train")
async def test_train(body: TrainRequest):
    if body.chat_id not in _cleaned_data_cache:
        raise HTTPException(status_code=400, detail="Must call /test/parse first")
    try:
        result = _run_train(body.chat_id, body.target_column)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Training failed: {e}")

    metric_key = "accuracy" if result["task_type"] == "classification" else "r2_score"
    return {
        "message":      "Model trained successfully",
        "task_type":    result["task_type"],
        metric_key:     result[metric_key],
        "top_features": [{"name": n, "importance": round(i, 4)} for n, i in result["top_features"]],
    }


# ─────────────────────────────────────────────────────────────────────────────
# Prediction helpers
# ─────────────────────────────────────────────────────────────────────────────

def predict_local_single(chat_id: int, id_column: str, id_value: str) -> dict:
    data_cache    = _cleaned_data_cache[chat_id]
    model_data    = _trained_models[chat_id]
    df            = data_cache["df"]
    model         = model_data["model"]
    feature_names = model_data["feature_names"]
    task_type     = model_data["task_type"]
    le_target     = model_data["le_target"]
    encoders      = model_data["encoders"]
    target_col    = model_data["target_column"]
    id_cols       = data_cache["id_columns"]

    match = df[df[id_column].astype(str) == str(id_value)]
    if match.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No row found where {id_column} = '{id_value}'. Please check the value and try again."
        )
    row = match.iloc[[0]].copy()

    cols_to_drop = [c for c in id_cols + [target_col] if c in row.columns]
    row_df = row.drop(columns=cols_to_drop)

    for col, enc in encoders.items():
        if col in row_df.columns:
            if enc["type"] == "label":
                row_df[col] = enc["encoder"].transform(row_df[col].astype(str))
            elif enc["type"] == "one_hot":
                dummies = pd.get_dummies(row_df[col], prefix=col)
                row_df = pd.concat([row_df.drop(columns=[col]), dummies], axis=1)

    bool_cols = row_df.select_dtypes(include=["bool"]).columns
    row_df[bool_cols] = row_df[bool_cols].astype(int)
    row_df = row_df.reindex(columns=feature_names, fill_value=0)

    pred_encoded          = model.predict(row_df)[0]
    confidence            = None
    predicted_class_index = None

    if task_type == "classification":
        pred_label            = le_target.inverse_transform([pred_encoded])[0]
        probas                = model.predict_proba(row_df)[0]
        predicted_class_index = int(list(model.classes_).index(pred_encoded))
        confidence            = round(float(probas[predicted_class_index]) * 100, 1)
    else:
        pred_label = round(float(pred_encoded), 4)

    _prediction_cache[chat_id] = {
        "mode":                  "local_single",
        "row_df":                row_df,
        "id_column":             id_column,
        "id_value":              id_value,
        "prediction":            str(pred_label),
        "confidence":            confidence,
        "predicted_class_index": predicted_class_index,
        "task_type":             task_type,
    }

    return {
        "prediction":            str(pred_label),
        "confidence":            confidence,
        "predicted_class_index": predicted_class_index,
    }


def predict_local_batch(chat_id: int) -> dict:
    data_cache = _cleaned_data_cache[chat_id]
    model_data = _trained_models[chat_id]
    df         = data_cache["df"]
    X          = model_data["X"]
    model      = model_data["model"]
    task_type  = model_data["task_type"]
    le_target  = model_data["le_target"]
    id_cols    = data_cache["id_columns"]
    id_col     = id_cols[0] if id_cols else None

    pred_encoded_arr = model.predict(X)

    if task_type == "classification":
        pred_labels             = le_target.inverse_transform(pred_encoded_arr).tolist()
        probas                  = model.predict_proba(X)
        classes                 = list(model.classes_)
        confidences             = [round(float(probas[i, classes.index(pred_encoded_arr[i])]) * 100, 1)
                                   for i in range(len(pred_encoded_arr))]
        predicted_class_indices = [int(classes.index(p)) for p in pred_encoded_arr]
    else:
        pred_labels             = [round(float(p), 4) for p in pred_encoded_arr]
        confidences             = [None] * len(pred_encoded_arr)
        predicted_class_indices = [None] * len(pred_encoded_arr)

    results = []
    for i, idx in enumerate(X.index):
        results.append({
            "id_column":             id_col,
            "id_value":              str(df.loc[idx, id_col]) if id_col and id_col in df.columns else str(idx),
            "prediction":            str(pred_labels[i]),
            "confidence":            confidences[i],
            "predicted_class_index": predicted_class_indices[i],
        })

    label_counts = Counter(pred_labels)
    summary = {"total": len(results), **{str(k): v for k, v in label_counts.items()}}

    return {
        "results":                 results,
        "summary":                 summary,
        "predicted_class_indices": predicted_class_indices,
    }


# ─────────────────────────────────────────────────────────────────────────────
# SHAP helpers — must match data_processor.py exactly
# ─────────────────────────────────────────────────────────────────────────────

def _shap_vals_for_row(shap_values, row_idx: int, class_idx, task_type: str) -> np.ndarray:
    if task_type == "classification" and class_idx is not None:
        if isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
            return shap_values[row_idx, :, class_idx]
        else:
            return np.array(shap_values[class_idx])[row_idx]
    else:
        if isinstance(shap_values, np.ndarray) and shap_values.ndim == 2:
            return shap_values[row_idx]
        else:
            return np.array(shap_values[0] if isinstance(shap_values, list) else shap_values)[row_idx]


def explain_shap_local_single(chat_id: int) -> list:
    cache         = _prediction_cache[chat_id]
    model_data    = _trained_models[chat_id]
    row_df        = cache["row_df"]
    pred_idx      = cache["predicted_class_index"]
    task_type     = cache["task_type"]
    model         = model_data["model"]
    feature_names = model_data["feature_names"]

    explainer   = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(row_df)
    vals  = _shap_vals_for_row(shap_values, 0, pred_idx, task_type)
    pairs = sorted(zip(feature_names, vals), key=lambda x: abs(x[1]), reverse=True)[:8]
    return [{"feature": f, "shap_value": round(float(v), 4)} for f, v in pairs]


def explain_shap_local_batch(chat_id: int, batch_result: dict) -> dict:
    model_data    = _trained_models[chat_id]
    X             = model_data["X"]
    model         = model_data["model"]
    feature_names = model_data["feature_names"]
    task_type     = model_data["task_type"]
    results       = batch_result["results"]
    class_indices = batch_result["predicted_class_indices"]

    explainer   = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)

    per_row = []
    for i, row_result in enumerate(results):
        vals  = _shap_vals_for_row(shap_values, i, class_indices[i], task_type)
        pairs = sorted(zip(feature_names, vals), key=lambda x: abs(x[1]), reverse=True)[:3]
        per_row.append({
            **{k: v for k, v in row_result.items() if k != "predicted_class_index"},
            "shap_values": [{"feature": f, "shap_value": round(float(v), 4)} for f, v in pairs],
        })

    if task_type == "classification" and class_indices[0] is not None:
        dominant_class = Counter(class_indices).most_common(1)[0][0]
        if isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
            all_vals = shap_values[:, :, dominant_class]
        else:
            all_vals = np.array(shap_values[dominant_class])
    else:
        all_vals = np.array(shap_values) if not isinstance(shap_values, list) else np.array(shap_values[0])

    mean_abs  = np.abs(all_vals).mean(axis=0)
    agg_pairs = sorted(zip(feature_names, mean_abs), key=lambda x: x[1], reverse=True)[:8]
    aggregate = [{"feature": f, "shap_value": round(float(v), 4)} for f, v in agg_pairs]

    return {"per_row": per_row, "aggregate": aggregate}


def explain_shap_global(chat_id: int) -> list:
    """
    Signed mean SHAP across all rows — positive values push the prediction up,
    negative values pull it down. Ranked by absolute value.
    For classification uses class index 1 (the positive/higher-sorted class).
    """
    model_data    = _trained_models[chat_id]
    X             = model_data["X"]
    model         = model_data["model"]
    feature_names = model_data["feature_names"]
    task_type     = model_data["task_type"]
    class_labels  = model_data["class_labels"]

    sample      = X.sample(min(500, len(X)), random_state=42)
    explainer   = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(sample)

    if task_type == "classification":
        class_idx = 1 if class_labels and len(class_labels) >= 2 else 0
        if isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
            vals = shap_values[:, :, class_idx]
        else:
            vals = np.array(shap_values[class_idx])
    else:
        vals = shap_values if not isinstance(shap_values, list) else np.array(shap_values[0])

    mean_vals = vals.mean(axis=0)
    pairs = sorted(zip(feature_names, mean_vals), key=lambda x: abs(x[1]), reverse=True)[:8]
    return [{"feature": f, "shap_value": round(float(v), 4)} for f, v in pairs]


def explain_shap_directional(chat_id: int, direction: str) -> list:
    """
    Signed mean SHAP — features that push the prediction up (increase) or down (decrease).
    For classification uses class index 1 (the positive/higher-sorted class).
    """
    model_data    = _trained_models[chat_id]
    X             = model_data["X"]
    model         = model_data["model"]
    feature_names = model_data["feature_names"]
    task_type     = model_data["task_type"]
    class_labels  = model_data["class_labels"]

    sample      = X.sample(min(500, len(X)), random_state=42)
    explainer   = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(sample)

    if task_type == "classification":
        class_idx = 1 if class_labels and len(class_labels) >= 2 else 0
        if isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
            vals = shap_values[:, :, class_idx]
        else:
            vals = np.array(shap_values[class_idx])
    else:
        vals = shap_values if not isinstance(shap_values, list) else np.array(shap_values[0])

    mean_vals = vals.mean(axis=0)

    if direction == "increase":
        pairs = sorted([(f, v) for f, v in zip(feature_names, mean_vals) if v > 0],
                       key=lambda x: x[1], reverse=True)[:8]
    else:
        pairs = sorted([(f, v) for f, v in zip(feature_names, mean_vals) if v < 0],
                       key=lambda x: x[1])[:8]

    return [{"feature": f, "shap_value": round(float(v), 4)} for f, v in pairs]


def explain_shap_class_specific(chat_id: int, target_class: str) -> list:
    """mean(abs(SHAP)) for one specific predicted class."""
    model_data    = _trained_models[chat_id]
    X             = model_data["X"]
    model         = model_data["model"]
    feature_names = model_data["feature_names"]
    task_type     = model_data["task_type"]
    class_labels  = model_data["class_labels"]

    if task_type != "classification":
        raise HTTPException(status_code=400, detail="Class-specific analysis is only available for classification")
    if not class_labels or target_class not in class_labels:
        raise HTTPException(
            status_code=400,
            detail=f"Class '{target_class}' not found. Available: {', '.join(class_labels or [])}"
        )

    class_idx   = list(class_labels).index(target_class)
    sample      = X.sample(min(500, len(X)), random_state=42)
    explainer   = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(sample)

    if isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
        vals = shap_values[:, :, class_idx]
    else:
        vals = np.array(shap_values[class_idx])

    mean_abs = np.abs(vals).mean(axis=0)
    pairs    = sorted(zip(feature_names, mean_abs), key=lambda x: x[1], reverse=True)[:8]
    return [{"feature": f, "shap_value": round(float(v), 4)} for f, v in pairs]


# ─────────────────────────────────────────────────────────────────────────────
# Conversation history helper
# ─────────────────────────────────────────────────────────────────────────────

def _load_history_from_cache(chat_id: int) -> list[dict]:
    return _chat_history_cache.get(chat_id, [])


# ─────────────────────────────────────────────────────────────────────────────
# Question classifier
# ─────────────────────────────────────────────────────────────────────────────

CLASSIFIER_SYSTEM_PROMPT = """
You are a question classifier for Makeen, an AI data analysis platform.
Classify the user's question about their dataset into exactly one of 5 types.
TYPES:
1. DATA_QUERY — lookups, statistics, counts, comparisons, filters, aggregations.
   Examples: "How many rows?", "Average salary?", "Top 5 by revenue", "Count per region"
2. PREDICTION — predict an outcome using the trained ML model. Two sub-modes:
   - "local_single": the question targets one specific entity or row, identified by a concrete value
     the user mentions that matches a value in ANY column of the dataset (not just ID columns).
     Look at all columns and sample rows to find which column the user is referring to.
     Examples:
       "Will applicant A005 be approved?"     → id_column = "applicant_id", id_value = "A005"
       "Will factory Tesla pass the check?"   → id_column = "factory_name", id_value = "Tesla"
       "Predict for patient John Doe"         → id_column = "patient_name", id_value = "John Doe"
     → set prediction_mode to "local_single", id_column to the matching column name,
       id_value to the extracted value as a string
   - "local_batch": targets all rows or a group — no specific named entity or value mentioned.
     Example: "Which customers will churn?", "How many applicants pass?", "Who gets approved?"
     → set prediction_mode to "local_batch", id_column and id_value stay null
3. ANALYSIS — understand what drives the target outcome. Determine the analysis_mode:
   - "global":        No direction, no specific class mentioned. Returns signed SHAP means —
                      positive values push the outcome up, negative values pull it down.
                      Examples: "What drives churn?", "Which features matter most?", "What influences revenue?"
   - "directional":   User asks what increases OR decreases the target.
                      Examples: "What increases churn?" → direction = "increase"
                                "What reduces approval chances?" → direction = "decrease"
                                "What makes revenue go up?" → direction = "increase"
   - "class_specific": User asks about one specific outcome label.
                      Examples: "What makes someone get Approved?" → target_class = "Approved"
                                "Why do customers get Rejected?" → target_class = "Rejected"
   Rules:
   - target_column must be an exact column name from the dataset — do NOT invent names
   - target_class must be an exact label value the model predicts — only set for class_specific
   - direction is "increase" or "decrease" — only set for directional
4. HISTORY_EXPLANATION — the user is asking a follow-up, clarification, or deeper explanation
   about something that was already discussed in this conversation.
   Use this type when:
   - The question is clearly a continuation ("explain more", "why?", "tell me more", "elaborate",
     "what does that mean?", "I don't understand", "go deeper", "how did you get that",
     "can you clarify that?", "break it down")
   - The question references a specific past result
     ("explain the approval prediction", "what drove the churn analysis result?")
   - Recent conversation history is provided — use it to confirm the follow-up context.
     Even if history is empty (server restart), classify as HISTORY_EXPLANATION;
     the handler will recover context from what's available.
   Also set history_mode:
   - "last" → short vague follow-up that refers to the most recent result only.
              Signals: few words, no named entity, no specific reference to an older turn.
              Examples: "explain", "why?", "what does that mean?", "tell me more",
                        "elaborate", "go deeper", "I don't understand", "how did you get that"
   - "full" → references something specific — a particular prediction,
              an older analysis, or anything that may not be in the last result.
              Examples: "explain the batch prediction", "what factors drove the churn analysis?",
                        "go back to the first prediction"
5. UNCLEAR — question is too vague, generic, or cannot be answered with the available data.
   Also return UNCLEAR if the question looks like a PREDICTION or ANALYSIS but no column in
   the dataset clearly matches what the user wants to predict or analyse.
   IMPORTANT: any column in the dataset can be a target — not just the current model target.
   If the user explicitly names or clearly refers to a column that exists in the dataset,
   set that as target_column and do NOT return UNCLEAR.
   When UNCLEAR, generate EXACTLY 3 concrete clarification questions. Rules:
   - Use actual column names from the dataset context provided
   - Reference real values from the sample rows where useful
   - Cover different intents: one DATA_QUERY-style, one PREDICTION-style, one ANALYSIS-style
   - Make them specific and directly answerable — NOT generic placeholders
   For "unclear_answer":
   - If the user said a greeting (hi, hello, etc.): write a short welcome message that mentions
     Makeen by name and briefly says what it can do (predict outcomes, explore data, find patterns).
   - For all other UNCLEAR cases: set unclear_answer to null.

Return ONLY valid JSON, no extra text outside the object:
{
  "type": "DATA_QUERY" | "PREDICTION" | "ANALYSIS" | "UNCLEAR" | "HISTORY_EXPLANATION",
  "history_mode": "last" | "full" | null,
  "target_column": "<exact column name the user wants to predict or analyse>" | null,
  "prediction_mode": "local_single" | "local_batch" | null,
  "id_column": "<the ID column name to look up>" | null,
  "id_value": "<the extracted value as a string>" | null,
  "analysis_mode": "global" | "directional" | "class_specific" | null,
  "direction": "increase" | "decrease" | null,
  "target_class": "<exact class label>" | null,
  "is_clear": true | false,
  "clarifications": ["question1", "question2", "question3"] or [],
  "unclear_answer": "<friendly response>" | null
}

target_column rules:
- Only set for PREDICTION and ANALYSIS types
- Must be an exact column name from the dataset context — do NOT invent column names
- Infer it from the question (e.g. "will loan be approved?" → target_column = "loan_status")
- If ambiguous or type is DATA_QUERY/UNCLEAR/HISTORY_EXPLANATION, set to null
"""


class QuestionClassifier:
    def classify(self, question: str, df_context: dict, recent_history: list[dict] | None = None) -> dict:
        columns_str = ", ".join(df_context["columns"])
        target_str  = df_context["target_column"]
        sample_str  = "\n".join(
            "  " + ", ".join(f"{k}: {v}" for k, v in row.items())
            for row in df_context.get("sample_rows", [])[:5]
        )

        history_section = ""
        if recent_history:
            lines = []
            for i, turn in enumerate(recent_history, 1):
                answer_preview = (
                    json.dumps(turn["answer"])[:200]
                    if isinstance(turn["answer"], dict)
                    else str(turn["answer"])[:200]
                )
                lines.append(f"  Turn {i} — Q: {turn['question']}\n           A: {answer_preview}")
            history_section = "\nRecent conversation (last 3 turns):\n" + "\n".join(lines) + "\n"

        user_message = (
            f"Dataset context:\n"
            f"Columns: {columns_str}\n"
            f"Current model target (the column the model is currently trained on — but users may ask to predict ANY column): {target_str}\n\n"
            f"Sample rows (use these to recognise which column a user-mentioned value belongs to):\n{sample_str}\n"
            f"{history_section}\n"
            f"User question: {question}"
        )

        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": CLASSIFIER_SYSTEM_PROMPT},
                    {"role": "user",   "content": user_message},
                ],
                response_format={"type": "json_object"},
                max_tokens=300,
                temperature=0,
            )
            result = json.loads(response.choices[0].message.content)
            valid_types = {"DATA_QUERY", "PREDICTION", "ANALYSIS", "UNCLEAR", "HISTORY_EXPLANATION"}
            if result.get("type") not in valid_types:
                raise ValueError(f"Unexpected type: {result.get('type')}")
            result.setdefault("history_mode", None)
            result.setdefault("target_column", None)
            result.setdefault("prediction_mode", None)
            result.setdefault("id_column", None)
            result.setdefault("id_value", None)
            result.setdefault("analysis_mode", None)
            result.setdefault("direction", None)
            result.setdefault("target_class", None)
            result.setdefault("is_clear", result["type"] != "UNCLEAR")
            result.setdefault("clarifications", [])
            result.setdefault("unclear_answer", None)
            return result
        except Exception as e:
            print(f"[TEST CLASSIFIER ERROR] {e}")
            non_id = [c for c in df_context["columns"]
                      if c not in df_context["id_columns"]
                      and c != df_context["target_column"]]
            target = df_context["target_column"]
            col0   = non_id[0] if non_id else "a feature"
            col1   = non_id[1] if len(non_id) > 1 else col0
            return {
                "type":            "UNCLEAR",
                "history_mode":    None,
                "prediction_mode": None,
                "id_column":       None,
                "id_value":        None,
                "is_clear":        False,
                "clarifications": [
                    f"How is '{col0}' distributed across the dataset?",
                    f"Which {col1} values are most associated with a high '{target}'?",
                    f"What are the main factors that influence '{target}'?",
                ],
                "unclear_answer": None,
            }


# ─────────────────────────────────────────────────────────────────────────────
# Question processor handlers
# ─────────────────────────────────────────────────────────────────────────────

_DATA_QUERY_CODE_PROMPT = """\
You are a data analyst. A pandas DataFrame called `df` is available.
Write a single Python expression that answers the user's question.

Rules:
- Return ONLY the bare expression — no assignment, no print(), no import, no backticks, no explanation
- The expression must evaluate to a value (number, string, DataFrame, or Series)
- Use only pandas operations on `df`
- Column names are case-sensitive — use the exact names listed below

Columns: {columns}

Sample rows:
{sample}

User question: {question}

Expression:"""


class QuestionProcessor:
    def __init__(self, data_cache: dict, model_cache: dict | None):
        self.data_cache  = data_cache
        self.model_cache = model_cache

    # ── Handler 1: DATA_QUERY ─────────────────────────────────────────────────
    def handle_data_query(self, question: str, df: pd.DataFrame, df_context: dict) -> dict:
        columns_str = ", ".join(df_context["columns"])
        sample_str  = "\n".join(
            "  " + ", ".join(f"{k}: {v}" for k, v in row.items())
            for row in df_context.get("sample_rows", [])[:5]
        )
        code_prompt = _DATA_QUERY_CODE_PROMPT.format(
            columns=columns_str, sample=sample_str, question=question
        )
        try:
            code_resp = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": code_prompt}],
                max_tokens=150,
                temperature=0,
            )
            code = code_resp.choices[0].message.content.strip().strip("`").strip()
            if code.lower().startswith("python"):
                code = code[6:].strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate query code: {e}")

        result_str = None
        try:
            local_vars = {"df": df.copy(), "pd": pd, "np": np}
            exec(f"_result = {code}", local_vars)
            raw_result = local_vars["_result"]
            if isinstance(raw_result, pd.DataFrame):
                result_str = raw_result.head(10).to_string(index=False)
            elif isinstance(raw_result, pd.Series):
                result_str = raw_result.head(10).to_string()
            else:
                result_str = str(raw_result)
        except Exception as exec_err:
            print(f"[TEST DATA_QUERY EXEC ERROR] code={code!r} error={exec_err}")

        return {"type": "DATA_QUERY", "raw_result": result_str or "execution failed"}

    # ── Handler 2: PREDICTION (local_single + local_batch) ───────────────────
    def handle_prediction(self, question: str, chat_id: int, classification: dict) -> dict:
        mode = classification["prediction_mode"]

        if mode == "local_single":
            id_column = classification["id_column"]
            id_value  = classification["id_value"]
            pred      = predict_local_single(chat_id, id_column, id_value)
            shap_res  = explain_shap_local_single(chat_id)
            return {
                "type":        "PREDICTION",
                "mode":        "local_single",
                "id_column":   id_column,
                "id_value":    id_value,
                "prediction":  pred["prediction"],
                "confidence":  pred["confidence"],
                "shap_values": shap_res,
            }
        else:  # local_batch
            batch    = predict_local_batch(chat_id)
            shap_res = explain_shap_local_batch(chat_id, batch)
            predicted_as: dict = {}
            for row in shap_res["per_row"]:
                label = row["prediction"]
                if label not in predicted_as:
                    predicted_as[label] = []
                if len(predicted_as[label]) < 50:
                    predicted_as[label].append(row["id_value"])
            return {
                "type":           "PREDICTION",
                "mode":           "local_batch",
                "summary":        batch["summary"],
                "predicted_as":   predicted_as,
                "shap_aggregate": shap_res["aggregate"],
                "results":        shap_res["per_row"],
            }

    # ── Handler 3: ANALYSIS (global, directional, class_specific) ─────────────
    def handle_analysis(self, chat_id: int, classification: dict) -> dict:
        model_data    = _trained_models[chat_id]
        target_column = model_data["target_column"]
        class_labels  = model_data["class_labels"] or []
        mode          = classification.get("analysis_mode") or "global"
        direction     = classification.get("direction")
        target_class  = classification.get("target_class")

        if mode == "directional":
            if not direction:
                direction = "increase"
            factors = explain_shap_directional(chat_id, direction)
        elif mode == "class_specific":
            if not target_class:
                raise HTTPException(
                    status_code=400,
                    detail=f"Could not determine which class. Available: {', '.join(class_labels)}"
                )
            factors = explain_shap_class_specific(chat_id, target_class)
        else:  # global
            factors = explain_shap_global(chat_id)

        return {
            "type":          "ANALYSIS",
            "mode":          mode,
            "target_column": target_column,
            "direction":     direction,
            "target_class":  target_class,
            "shap_values":   factors,
        }

    # ── Handler 4: HISTORY_EXPLANATION ───────────────────────────────────────
    def handle_history_explanation(self, question: str, chat_id: int, history_mode: str) -> dict:
        history = _load_history_from_cache(chat_id)

        if not history:
            return {
                "type":   "HISTORY_EXPLANATION",
                "answer": "I don't have any previous results to refer to. Please ask a question first.",
            }

        messages = [
            {
                "role":    "system",
                "content": (
                    "You are Makeen, an AI data analysis assistant that explains machine learning results "
                    "in plain, friendly language.\n\n"
                    "The user is asking a follow-up or clarification question about a previous result "
                    "from this conversation. The conversation history is provided below.\n\n"
                    "Guidelines:\n"
                    "- Identify what result the user is referring to from the history.\n"
                    "- If it was a PREDICTION: explain what was predicted, why (use the SHAP factors "
                    "if available — name the top features and whether they pushed the result up or down), "
                    "and what that means in simple terms.\n"
                    "- If it was an ANALYSIS: explain which features matter most and what the user "
                    "can take away from that.\n"
                    "- If it was a DATA_QUERY: clarify or expand on the numbers/findings.\n"
                    "- Use plain language — no technical jargon, no mention of 'SHAP', 'model', "
                    "'features', or 'JSON'. Speak as if explaining to a business user.\n"
                    "- Be direct and specific. Maximum 180 words."
                ),
            }
        ]
        for turn in history:
            messages.append({"role": "user", "content": turn["question"]})
            answer_text = (
                json.dumps(turn["answer"]) if isinstance(turn["answer"], dict)
                else str(turn["answer"])
            )
            messages.append({"role": "assistant", "content": answer_text})
        messages.append({"role": "user", "content": question})

        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=300,
                temperature=0.3,
            )
            answer = response.choices[0].message.content.strip()
        except Exception as e:
            print(f"[TEST HISTORY_EXPLANATION ERROR] {e}")
            answer = "Sorry, I couldn't generate an explanation at this time."

        return {"type": "HISTORY_EXPLANATION", "answer": answer}

    # ── Handler 5: UNCLEAR ────────────────────────────────────────────────────
    def handle_unclear(self, clarifications: list, unclear_answer: str | None = None) -> dict:
        suggestions = [c for c in clarifications if isinstance(c, str) and c.strip()][:3]
        answer = unclear_answer or "Could you clarify what you meant? Here are some questions that might match:"
        return {"type": "UNCLEAR", "answer": answer, "clarifications": suggestions}


# ─────────────────────────────────────────────────────────────────────────────
# /processQuestion
# Auto-retrains if the question implies a different target column than what
# is currently trained. No manual /test/train call needed when target changes.
# Keeps last 3 Q&A pairs in _chat_history_cache so HISTORY_EXPLANATION works.
# ─────────────────────────────────────────────────────────────────────────────

class ProcessQuestionRequest(BaseModel):
    chat_id:  int
    question: str


@router.post("/processQuestion")
async def test_process_question(body: ProcessQuestionRequest):
    chat_id  = body.chat_id
    question = body.question.strip()

    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    data_cache = _cleaned_data_cache.get(chat_id)
    if not data_cache:
        raise HTTPException(status_code=400, detail="Please call /test/parse first")

    model_cache = _trained_models.get(chat_id)
    df = data_cache["df"]

    df_context = {
        "columns":       df.columns.tolist(),
        "sample_rows":   df.head(5).to_dict(orient="records"),
        "id_columns":    data_cache["id_columns"],
        "target_column": (model_cache or {}).get("target_column", ""),
    }

    classifier     = QuestionClassifier()
    classification = classifier.classify(question, df_context, _chat_history_cache.get(chat_id, []))
    question_type  = classification["type"]

    processor = QuestionProcessor(data_cache, model_cache)

    if question_type == "HISTORY_EXPLANATION":
        result = processor.handle_history_explanation(
            question,
            chat_id,
            classification.get("history_mode") or "last",
        )

    elif question_type == "UNCLEAR":
        result = processor.handle_unclear(classification["clarifications"], classification.get("unclear_answer"))

    elif question_type == "DATA_QUERY":
        result = processor.handle_data_query(question, df, df_context)

    elif question_type == "PREDICTION":
        inferred_target = classification.get("target_column")
        if not inferred_target:
            raise HTTPException(
                status_code=400,
                detail="Could not determine which column to predict. Please rephrase your question.",
            )

        cached_target = (model_cache or {}).get("target_column")
        if cached_target != inferred_target:
            if inferred_target not in df.columns:
                raise HTTPException(
                    status_code=400,
                    detail=f"Column '{inferred_target}' not found. Available: {', '.join(df.columns)}",
                )
            try:
                _run_train(chat_id, inferred_target)
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Training failed: {e}")
            model_cache = _trained_models[chat_id]
            processor   = QuestionProcessor(data_cache, model_cache)

        prediction_mode = classification.get("prediction_mode", "local_batch")

        if prediction_mode == "local_single":
            id_column = classification.get("id_column")
            id_value  = classification.get("id_value")
            if not id_column or not id_value:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Could not identify which row you are asking about. "
                        f"Please mention a specific value from: {', '.join(df.columns.tolist())}."
                    ),
                )
            if id_column not in df.columns:
                raise HTTPException(
                    status_code=400,
                    detail=f"'{id_column}' is not a column. Available: {', '.join(df.columns.tolist())}."
                )

        result = processor.handle_prediction(question, chat_id, classification)

    elif question_type == "ANALYSIS":
        inferred_target = classification.get("target_column")
        if not inferred_target:
            raise HTTPException(
                status_code=400,
                detail="Could not determine which column to analyse. Please rephrase your question.",
            )

        cached_target = (model_cache or {}).get("target_column")
        if cached_target != inferred_target:
            if inferred_target not in df.columns:
                raise HTTPException(
                    status_code=400,
                    detail=f"Column '{inferred_target}' not found. Available: {', '.join(df.columns)}",
                )
            try:
                _run_train(chat_id, inferred_target)
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Training failed: {e}")
            model_cache = _trained_models[chat_id]
            processor   = QuestionProcessor(data_cache, model_cache)

        result = processor.handle_analysis(chat_id, classification)

    else:
        raise HTTPException(status_code=500, detail=f"Unexpected question type: {question_type}")

    # Keep last 3 Q&A pairs for HISTORY_EXPLANATION follow-up questions
    entry   = {"question": question, "answer": result}
    history = _chat_history_cache.get(chat_id, [])
    history.append(entry)
    _chat_history_cache[chat_id] = history[-3:]

    return result
