from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
import pandas as pd
import json
import numpy as np
import shap
import os
from collections import Counter
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, r2_score
from lime.lime_tabular import LimeTabularExplainer
from core.openai_client import openai_client
from core.supabase_client import supabase
from routers.auth import cleaned_data_cache, trained_models, prediction_cache, chat_history_cache, _get_user_id, _clean_dataframe

router = APIRouter()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# ─────────────────────────────────────────────────────────────────────────────
# Training logic
# ─────────────────────────────────────────────────────────────────────────────
class TrainRequest(BaseModel):
    chat_id: int
    target_column: str  # inferred by classifier or sent explicitly by frontend


def _run_train(chat_id: int, target_column: str) -> dict:
    """
    Called by /train endpoint and by /processQuestion when the target changes.
    """
    cache   = cleaned_data_cache[chat_id]
    df      = cache["df"].copy()
    id_cols = cache["id_columns"]

    # validate target column exists
    if target_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Column '{target_column}' not found. Available: {', '.join(df.columns)}"
        )

    # 1. build X and y
    cols_to_exclude    = list(set(id_cols + [target_column]))
    X                  = df.drop(columns=[c for c in cols_to_exclude if c in df.columns])
    y                  = df[target_column]
    feature_names_orig = X.columns.tolist()

    # store pre-encoding defaults so feature-input predictions can fill missing values
    raw_feature_defaults = {}
    for col in feature_names_orig:
        col_data = X[col].dropna()
        if pd.api.types.is_numeric_dtype(col_data):
            raw_feature_defaults[col] = float(col_data.median())
        else:
            raw_feature_defaults[col] = col_data.mode().iloc[0] if len(col_data) > 0 else ""

    if y.nunique() < 2:
        raise HTTPException(status_code=400, detail="Target column must have at least 2 unique values")

    task_type = "classification" if (y.dtype == "object" or y.nunique() <= 10) else "regression"

    # 2. encode categorical features in X
    encoders = {}
    for col in X.select_dtypes(include=["object"]).columns:
        n_unique = X[col].nunique()
        if n_unique == 2:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            encoders[col] = {"type": "label", "encoder": le}
        elif n_unique <= 10:
            X = pd.get_dummies(X, columns=[col], prefix=col, drop_first=True)
            generated_columns = [c for c in X.columns if c.startswith(f"{col}_")]
            encoders[col] = {"type": "one_hot", "generated_columns": generated_columns}
        else:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            encoders[col] = {"type": "label", "encoder": le}

    # 3. boolean → int
    bool_cols = X.select_dtypes(include=["bool"]).columns
    X[bool_cols] = X[bool_cols].astype(int)

    feature_names = X.columns.tolist()

    # 4. encode target y
    le_target    = None
    class_labels = None
    if task_type == "classification":
        le_target    = LabelEncoder()
        y_encoded    = le_target.fit_transform(y.astype(str))
        class_labels = le_target.classes_.tolist()
    else:
        y_encoded = y.astype(float).values

    # 5. 80/20 split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42
    )

    # 6. train RandomForest
    if task_type == "classification":
        model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1, max_depth=15)
        model.fit(X_train, y_train)
        score = accuracy_score(y_test, model.predict(X_test))
    else:
        model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1, max_depth=15)
        model.fit(X_train, y_train)
        score = r2_score(y_test, model.predict(X_test))

    # 7. top 5 features by importance
    top_features = sorted(
        zip(feature_names, model.feature_importances_),
        key=lambda x: x[1],
        reverse=True,
    )[:5]

    # 8. store in trained_models
    trained_models[chat_id] = {
        "model":                  model,
        "X":                      X,        # all rows encoded — for SHAP batch/analysis
        "X_train":                X_train,  # training split
        "feature_names":          feature_names,
        "feature_names_original": feature_names_orig,
        "raw_feature_defaults":   raw_feature_defaults,
        "target_column":          target_column,
        "task_type":              task_type,
        "class_labels":           class_labels,
        "le_target":              le_target,
        "encoders":               encoders,
    }

    metric_key = "accuracy" if task_type == "classification" else "r2_score"
    return {
        "task_type":    task_type,
        "top_features": top_features,
        metric_key:     round(score, 4),
    }


@router.post("/train")
async def train_model(body: TrainRequest, authorization: str = Header(None)):
    user_id = _get_user_id(authorization)
    chat_id = body.chat_id

    # 1. verify chat ownership
    try:
        chat_check = (
            supabase.table("Chat")
            .select("CHAT_ID")
            .eq("CHAT_ID", chat_id)
            .eq("USER_ID", user_id)
            .single()
            .execute()
        )
        if not chat_check.data:
            raise HTTPException(status_code=404, detail="Chat not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Chat lookup failed: {e}")

    # 2. check /parse was run
    if chat_id not in cleaned_data_cache:
        raise HTTPException(status_code=400, detail="Must call /parse first to clean the file")

    # 3. train
    try:
        result = _run_train(chat_id, body.target_column)
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
# Prediction logic
# ─────────────────────────────────────────────────────────────────────────────
def predict_local_single(
    chat_id: int,
    id_column: str | None,
    id_value: str | None,
    feature_values: dict | None = None,
) -> dict:
    data_cache    = cleaned_data_cache[chat_id]
    model_data    = trained_models[chat_id]
    df            = data_cache["df"]
    model         = model_data["model"]
    feature_names = model_data["feature_names"]
    task_type     = model_data["task_type"]
    le_target     = model_data["le_target"]
    encoders      = model_data["encoders"]
    target_col    = model_data["target_column"]
    id_cols       = data_cache["id_columns"]
    filled_columns: list[str] = []

    if feature_values is not None:
        # ── Feature-input branch: build a new row from user-provided values ──
        raw_defaults       = model_data["raw_feature_defaults"]
        feature_names_orig = model_data["feature_names_original"]

        raw_row        = {col: raw_defaults.get(col, 0) for col in feature_names_orig}
        filled_columns = [col for col in feature_names_orig if col not in feature_values]
        if len(filled_columns) > len(feature_names_orig) / 2:
            provided = len(feature_names_orig) - len(filled_columns)
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Sorry, I'm unable to generate a reliable prediction with the information provided — "
                    f"you supplied {provided} out of {len(feature_names_orig)} required features. "
                    f"When most features are missing, the model relies on dataset-wide averages instead of your specific case, "
                    f"which significantly reduces accuracy. "
                    f"Please also provide: {', '.join(filled_columns)}."
                ),
            )
        for col, val in feature_values.items():
            if col in raw_row:
                raw_row[col] = val

        row_df = pd.DataFrame([raw_row])

        for col, enc in encoders.items():
            if col not in row_df.columns:
                continue
            if enc["type"] == "label":
                try:
                    row_df[col] = enc["encoder"].transform(row_df[col].astype(str))
                except ValueError:
                    row_df[col] = 0  # unseen label — fall back to encoded 0
            elif enc["type"] == "one_hot":
                generated_cols = enc.get("generated_columns", [])
                user_val = str(row_df[col].iloc[0])
                for gc in generated_cols:
                    row_df[gc] = 0
                matching_col = f"{col}_{user_val}"
                if matching_col in generated_cols:
                    row_df[matching_col] = 1
                row_df = row_df.drop(columns=[col])

    else:
        # ── ID-lookup branch: find the existing row by id_column/id_value ──
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

    # ── Shared: boolean → int, align to training feature order, predict ──
    bool_cols = row_df.select_dtypes(include=["bool"]).columns
    row_df[bool_cols] = row_df[bool_cols].astype(int)

    row_df = row_df.reindex(columns=feature_names, fill_value=0)

    pred_encoded = model.predict(row_df)[0]

    confidence            = None
    predicted_class_index = None

    if task_type == "classification":
        pred_label            = le_target.inverse_transform([pred_encoded])[0]
        probas                = model.predict_proba(row_df)[0]
        predicted_class_index = int(list(model.classes_).index(pred_encoded))
        confidence            = round(float(probas[predicted_class_index]) * 100, 1)
    else:
        pred_label = round(float(pred_encoded), 4)

    prediction_cache[chat_id] = {
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
        "filled_columns":        filled_columns,
    }


def predict_local_batch(chat_id: int) -> dict:
    data_cache = cleaned_data_cache[chat_id]
    model_data = trained_models[chat_id]
    df         = data_cache["df"]
    X          = model_data["X"]      # fully encoded, all rows
    model      = model_data["model"]
    task_type  = model_data["task_type"]
    le_target  = model_data["le_target"]
    id_cols    = data_cache["id_columns"]
    id_col     = id_cols[0] if id_cols else None

    # 1. predict all rows at once
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

    # 2. pair each prediction with its row identifier
    results = []
    for i, idx in enumerate(X.index):
        entry = {
            "id_column":             id_col,
            "id_value":              str(df.loc[idx, id_col]) if id_col and id_col in df.columns else str(idx),
            "prediction":            str(pred_labels[i]),
            "confidence":            confidences[i],
            "predicted_class_index": predicted_class_indices[i],
        }
        results.append(entry)

    # 3. summary: total + count per label
    label_counts = Counter(pred_labels)
    summary = {"total": len(results), **{str(k): v for k, v in label_counts.items()}}

    return {
        "results":                 results,
        "summary":                 summary,
        "predicted_class_indices": predicted_class_indices,
    }


# ─────────────────────────────────────────────────────────────────────────────
# SHAP explanation logic
# ─────────────────────────────────────────────────────────────────────────────
def _shap_vals_for_row(shap_values, row_idx: int, class_idx, task_type: str) -> np.ndarray:
    """
    Extract the SHAP value vector for one row.
    Handles both SHAP API versions:
      - New SHAP (>=0.40): 3D ndarray  (n_samples, n_features, n_classes)
      - Old SHAP:          list of 2D arrays, one per class
    """
    if task_type == "classification" and class_idx is not None:
        if isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
            return shap_values[row_idx, :, class_idx]
        else:
            return np.array(shap_values[class_idx])[row_idx]
    else:
        # regression
        if isinstance(shap_values, np.ndarray) and shap_values.ndim == 2:
            return shap_values[row_idx]
        else:
            return np.array(shap_values[0] if isinstance(shap_values, list) else shap_values)[row_idx]


def explain_shap_local_single(chat_id: int) -> list:
    cache         = prediction_cache[chat_id]
    model_data    = trained_models[chat_id]
    row_df        = cache["row_df"]
    pred_idx      = cache["predicted_class_index"]
    task_type     = cache["task_type"]
    model         = model_data["model"]
    feature_names = model_data["feature_names"]

    explainer   = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(row_df)

    vals  = _shap_vals_for_row(shap_values, row_idx=0, class_idx=pred_idx, task_type=task_type)
    pairs = sorted(zip(feature_names, vals), key=lambda x: abs(x[1]), reverse=True)[:8]
    return [{"feature": f, "shap_value": round(float(v), 4)} for f, v in pairs]


def explain_shap_local_batch(chat_id: int, batch_result: dict) -> dict:
    model_data    = trained_models[chat_id]
    X             = model_data["X"]
    model         = model_data["model"]
    feature_names = model_data["feature_names"]
    task_type     = model_data["task_type"]
    results       = batch_result["results"]
    class_indices = batch_result["predicted_class_indices"]

    explainer   = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)   # computed once for all rows

    # per-row: top 3 factors
    per_row = []
    for i, row_result in enumerate(results):
        vals  = _shap_vals_for_row(shap_values, row_idx=i, class_idx=class_indices[i], task_type=task_type)
        pairs = sorted(zip(feature_names, vals), key=lambda x: abs(x[1]), reverse=True)[:3]
        per_row.append({
            **{k: v for k, v in row_result.items() if k != "predicted_class_index"},
            "shap_values": [{"feature": f, "shap_value": round(float(v), 4)} for f, v in pairs],
        })

    # aggregate: mean(abs(SHAP)) across all rows for the overall summary
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
    Signed mean SHAP across all rows — the full picture of how each feature influences the target.
    Positive value → feature generally pushes the prediction up.
    Negative value → feature generally pulls the prediction down.
    Ranked by absolute value so the strongest influences appear first regardless of direction.
    For classification uses class index 1 (the positive/higher-sorted class).
    """
    model_data    = trained_models[chat_id]
    X             = model_data["X"]
    model         = model_data["model"]
    feature_names = model_data["feature_names"]
    task_type     = model_data["task_type"]
    class_labels  = model_data["class_labels"]

    sample      = X.sample(min(500, len(X)), random_state=42)
    explainer   = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(sample)

    if task_type == "classification":
        # use class index 1 (positive class) for signed means — same convention as directional
        class_idx = 1 if class_labels and len(class_labels) >= 2 else 0
        if isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
            vals = shap_values[:, :, class_idx]
        else:
            vals = np.array(shap_values[class_idx])
    else:
        vals = shap_values if not isinstance(shap_values, list) else np.array(shap_values[0])

    # signed mean per feature, ranked by absolute value so strongest effects come first
    mean_vals = vals.mean(axis=0)
    pairs = sorted(zip(feature_names, mean_vals), key=lambda x: abs(x[1]), reverse=True)[:8]
    return [{"feature": f, "shap_value": round(float(v), 4)} for f, v in pairs]


def explain_shap_directional(chat_id: int, direction: str) -> list:
    """
    Signed mean SHAP — which features push the prediction up (increase) or down (decrease).
    For classification uses class index 1 (the positive/higher-sorted class).
    For regression uses raw SHAP values.
    """
    model_data   = trained_models[chat_id]
    X            = model_data["X"]
    model        = model_data["model"]
    feature_names = model_data["feature_names"]
    task_type    = model_data["task_type"]
    class_labels = model_data["class_labels"]

    sample      = X.sample(min(500, len(X)), random_state=42)
    explainer   = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(sample)

    if task_type == "classification":
        # class index 1 = the "positive" class after LabelEncoder sorts alphabetically
        class_idx = 1 if class_labels and len(class_labels) >= 2 else 0
        if isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
            vals = shap_values[:, :, class_idx]
        else:
            vals = np.array(shap_values[class_idx])
    else:
        vals = shap_values if not isinstance(shap_values, list) else np.array(shap_values[0])

    mean_vals = vals.mean(axis=0)   # signed mean per feature

    if direction == "increase":
        pairs = [(f, v) for f, v in zip(feature_names, mean_vals) if v > 0]
        pairs = sorted(pairs, key=lambda x: x[1], reverse=True)[:8]
    else:  # decrease
        pairs = [(f, v) for f, v in zip(feature_names, mean_vals) if v < 0]
        pairs = sorted(pairs, key=lambda x: x[1])[:8]   # most negative first

    return [{"feature": f, "shap_value": round(float(v), 4)} for f, v in pairs]

def explain_shap_class_specific(chat_id: int, target_class: str) -> list:
    """mean(abs(SHAP)) for one specific predicted class."""
    model_data    = trained_models[chat_id]
    X             = model_data["X"]
    model         = model_data["model"]
    feature_names = model_data["feature_names"]
    task_type     = model_data["task_type"]
    class_labels  = model_data["class_labels"]

    if task_type != "classification":
        raise HTTPException(
            status_code=400,
            detail="Class-specific analysis is only available for classification tasks."
        )
    if not class_labels or target_class not in class_labels:
        raise HTTPException(
            status_code=400,
            detail=f"Class '{target_class}' not found. Available classes: {', '.join(class_labels or [])}"
        )

    class_idx = list(class_labels).index(target_class)

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
# LIME explanation logic
# ─────────────────────────────────────────────────────────────────────────────
def explain_lime_local_single(chat_id: int) -> list:
    # 1. Get model and cached row 
    cache         = prediction_cache[chat_id]
    model_data    = trained_models[chat_id]
    row_df        = cache["row_df"]
    task_type     = cache["task_type"]
    model         = model_data["model"]
    X_train       = model_data["X_train"]
    feature_names = model_data["feature_names"]
    class_labels  = model_data["class_labels"]

    # 2. Create LIME explainer
    explainer = LimeTabularExplainer(
        training_data=np.array(X_train),
        feature_names=feature_names,
        class_names=class_labels if task_type == "classification" else None,
        mode=task_type,
    )
    # 3. Generate explanation
    exp = explainer.explain_instance(
        row_df.iloc[0].values,
        model.predict_proba if task_type == "classification" else model.predict,
    )

    # 4. Format result
    explanation = [
        {"feature": feature, "impact": float(weight)}
        for feature, weight in exp.as_list()
    ]
    return explanation

# ─────────────────────────────────────────────────────────────────────────────
# Conversation history 
# ─────────────────────────────────────────────────────────────────────────────
def _load_all_history_from_db(chat_id: int) -> list[dict]:
    try:
        result = (
            supabase.table("Query")
            .select("query_text, Response(answer)")
            .eq("CHAT_ID", chat_id)
            .order("created_at", desc=False)
            .execute()
        )
        pairs = []
        for row in (result.data or []):
            responses = row.get("Response") or []
            answer = responses[0]["answer"] if responses else ""
            if answer:
                pairs.append({"question": row["query_text"], "answer": answer})
        return pairs
    except Exception as e:
        print(f"[HISTORY DB ERROR] {e}")
        return []


# ─────────────────────────────────────────────────────────────────────────────
# Question Classifier
# ─────────────────────────────────────────────────────────────────────────────
CLASSIFIER_SYSTEM_PROMPT = """
You are a question classifier for Makeen, an AI data analysis platform.
Classify the user's question about their dataset into exactly one of 4 types.
TYPES:
1. DATA_QUERY — lookups, statistics, counts, comparisons, filters, aggregations.
   Examples: "How many rows?", "Average salary?", "Top 5 by revenue", "Count per region"
2. PREDICTION — predict an outcome using the trained ML model. Two sub-modes:
   - "local_single": the question targets one specific entity. Two sub-cases:
     a) ID lookup — user mentions a value that matches an existing row in the dataset.
        Look at all columns and sample rows to find which column the value belongs to.
        Examples:
          "Will applicant A005 be approved?"   → id_column="applicant_id", id_value="A005", feature_values=null
          "Will factory Tesla pass?"           → id_column="factory_name", id_value="Tesla", feature_values=null
        → set id_column and id_value; leave feature_values null
     b) Feature input — user provides feature values for a new/hypothetical instance not in the dataset.
        Examples:
          "Predict for age=35, salary=50000, credit=good"
            → feature_values={"age": 35, "salary": 50000, "credit": "good"}, id_column=null, id_value=null
          "What if someone has 5 years experience and a Bachelor degree?"
            → feature_values={"experience": 5, "education": "Bachelor"}, id_column=null, id_value=null
        → set feature_values with exact column names from the dataset context;
          leave id_column and id_value null.
          Only include columns the user actually mentioned — do NOT fill missing ones yourself.
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
     ("Why did you say that last week?", "explain the approval prediction",
      "what drove the churn analysis result?", "why was the batch result like that?")
   - Recent conversation history is provided — use it to confirm the follow-up context.
     Even if history is empty (server restart), classify as HISTORY_EXPLANATION;
     the handler will recover the context from the database.
   Also set history_mode:
   - "last" → short vague follow-up that refers to the most recent result only.
              Signals: few words, no named entity, no specific reference to an older turn.
              Examples: "explain", "why?", "what does that mean?", "tell me more",
                        "elaborate", "go deeper", "I don't understand", "how did you get that"
   - "full" → references something specific — a particular prediction,
              an older analysis, or anything that may not be in the last result.
              Examples: "Why did you say that last week?", "explain the batch prediction",
                        "what factors drove the churn analysis?", "go back to the first prediction"
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
  "feature_values": {"<column_name>": <value>, ...} | null,
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
- If ambiguous or type is DATA_QUERY/UNCLEAR, set to null
"""

class QuestionClassifier:
    def classify(self, question: str, df_context: dict, recent_history: list[dict] | None = None) -> dict:
        columns_str = ", ".join(df_context["columns"])
        target_str  = df_context["target_column"]
        sample_str  = "\n".join(
            "  " + ", ".join(f"{k}: {v}" for k, v in row.items())
            for row in df_context.get("sample_rows", [])[:5]
        )

        # Build a compact history block so the classifier can detect follow-ups accurately.
        # Answer is truncated to 200 chars — just enough context, not the full payload.
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

            result.setdefault("target_column", None)
            result.setdefault("prediction_mode", None)
            result.setdefault("id_column", None)
            result.setdefault("id_value", None)
            result.setdefault("feature_values", None)
            result.setdefault("analysis_mode", None)
            result.setdefault("direction", None)
            result.setdefault("target_class", None)
            result.setdefault("history_mode", None)
            result.setdefault("is_clear", result["type"] != "UNCLEAR")
            result.setdefault("clarifications", [])
            result.setdefault("unclear_answer", None)
            return result

        except Exception as e:
            print(f"[CLASSIFIER ERROR] {e}")
            non_id = [c for c in df_context["columns"]
                      if c not in df_context["id_columns"]
                      and c != df_context["target_column"]]
            target = df_context["target_column"]
            col0   = non_id[0] if non_id else "a feature"
            col1   = non_id[1] if len(non_id) > 1 else col0
            return {
                "type":            "UNCLEAR",
                "prediction_mode": None,
                "id_column":       None,
                "id_value":        None,
                "is_clear":        False,
                "clarifications": [
                    f"How is '{col0}' distributed across the dataset?",
                    f"Which {col1} values are most associated with a high '{target}'?",
                    f"What are the main factors that influence '{target}'?",
                ],
                "unclear_answer":  None,
            }


# ─────────────────────────────────────────────────────────────────────────────
# Question Processor (4 handlers)
# ─────────────────────────────────────────────────────────────────────────────
# Prompt 1: ask GPT to write a single pandas expression that answers the question.
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

        # Step 1: generate pandas expression
        code_prompt = _DATA_QUERY_CODE_PROMPT.format(
            columns=columns_str,
            sample=sample_str,
            question=question,
        )
        try:
            code_resp = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": code_prompt}],
                max_tokens=150,
                temperature=0,
            )
            code = code_resp.choices[0].message.content.strip()
            # strip any markdown GPT might add anyway
            code = code.strip("`").strip()
            if code.lower().startswith("python"):
                code = code[6:].strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate query code: {e}")

        # Step 2: execute on the real df
        raw_result = None
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
            print(f"[DATA_QUERY EXEC ERROR] code={code!r} error={exec_err}")
            result_str = None

        return {
            "type":       "DATA_QUERY",
            "raw_result": result_str or "execution failed",
        }

    # ── Handler 2: PREDICTION (local_single + local_batch) ───────────────────
    def handle_prediction(self, question: str, chat_id: int, classification: dict) -> dict:
        mode = classification["prediction_mode"]

        if mode == "local_single":
            id_column     = classification["id_column"]
            id_value      = classification["id_value"]
            feature_values = classification.get("feature_values")

            pred        = predict_local_single(chat_id, id_column, id_value, feature_values)
            shap_result = explain_shap_local_single(chat_id)
            lime_result = explain_lime_local_single(chat_id)

            result = {
                "type":        "PREDICTION",
                "mode":        "local_single",
                "id_column":   id_column,
                "id_value":    id_value,
                "prediction":  pred["prediction"],
                "confidence":  pred["confidence"],
                "shap_values": shap_result,
                "lime_values": lime_result,
            }
            if pred["filled_columns"]:
                result["filled_columns"] = pred["filled_columns"]
            return result

        else:  # local_batch
            batch       = predict_local_batch(chat_id)
            shap_result = explain_shap_local_batch(chat_id, batch)

            # group id_values by predicted label, cap at 50 per label
            predicted_as: dict = {}
            for row in shap_result["per_row"]:
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
                "shap_aggregate": shap_result["aggregate"],
                "results":        shap_result["per_row"],
            }

    # ── Handler 3: ANALYSIS (global, directional, class_specific) ─────────────
    def handle_analysis(self, chat_id: int, classification: dict) -> dict:
        model_data    = trained_models[chat_id]
        target_column = model_data["target_column"]
        class_labels  = model_data["class_labels"] or []
        mode          = classification.get("analysis_mode") or "global"
        direction     = classification.get("direction")
        target_class  = classification.get("target_class")

        if mode == "directional":
            if not direction:
                direction = "increase"   # safe fallback
            factors = explain_shap_directional(chat_id, direction)

        elif mode == "class_specific":
            if not target_class:
                raise HTTPException(
                    status_code=400,
                    detail=f"Could not determine which class you are asking about. "
                           f"Available classes: {', '.join(class_labels)}"
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
        if history_mode == "last":
            history = chat_history_cache.get(chat_id, [])
        else:  # "full" — specific reference, load everything from DB
            history = _load_all_history_from_db(chat_id)

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
                    "can take away from that (e.g. what to focus on to improve an outcome).\n"
                    "- If it was a DATA_QUERY: clarify or expand on the numbers/findings.\n"
                    "- Use plain language — no technical jargon, no mention of 'SHAP', 'model', "
                    "'features', or 'JSON'. Speak as if explaining to a business user.\n"
                    "- Be direct and specific. Do not repeat the raw numbers unless they add value.\n"
                    "- Maximum 120 words."
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
            print(f"[HISTORY_EXPLANATION ERROR] {e}")
            answer = "Sorry, I couldn't generate an explanation at this time."

        return {"type": "HISTORY_EXPLANATION", "answer": answer}

    # ── Handler 5: UNCLEAR ────────────────────────────────────────────────────
    def handle_unclear(self, clarifications: list, unclear_answer: str | None = None) -> dict:
        suggestions = [c for c in clarifications if isinstance(c, str) and c.strip()][:3]
        answer = unclear_answer or "Could you clarify what you meant? Here are some questions that might match what you're looking for:"
        return {
            "type":           "UNCLEAR",
            "answer":         answer,
            "clarifications": suggestions,
        }


# ─────────────────────────────────────────────────────────────────────────────
# Format answers
# ─────────────────────────────────────────────────────────────────────────────
async def _format_answer(question: str, result: dict, df: pd.DataFrame) -> str:
    if result.get("type") in ("UNCLEAR", "HISTORY_EXPLANATION"):
        return result.get("answer", "")

    return await process_ask_logic(
        question=question,
        result_type=result.get("type", ""),
        prediction_mode=result.get("mode", "") if result.get("type") == "PREDICTION" else "",
        analysis_mode=result.get("mode", "") if result.get("type") == "ANALYSIS" else "",
        target_column=result.get("target_column", ""),
        target_class=result.get("target_class", ""),
        prediction=str(result.get("prediction", "")),
        confidence=float(result.get("confidence", 0.0)),
        raw_result=result.get("raw_result", ""),
        shap_values=result.get("shap_values", []),
        lime_values=result.get("lime_values", []),
        summary=result.get("summary", {}),
        predicted_as=result.get("predicted_as", {}),
        shap_aggregate=result.get("shap_aggregate", []),
        results=result.get("results", []),
        df=df
    )

# ─────────────────────────────────────────────────────────────────────────────
# /processQuestion main endpoint
# ─────────────────────────────────────────────────────────────────────────────
class ProcessQuestionRequest(BaseModel):
    chat_id:  int
    question: str


@router.post("/processQuestion")
async def process_question(body: ProcessQuestionRequest, authorization: str = Header(None)):
    user_id  = _get_user_id(authorization)
    chat_id  = body.chat_id
    question = body.question.strip()

    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    # 1. verify chat belongs to this user
    try:
        chat_check = (
            supabase.table("Chat")
            .select("CHAT_ID")
            .eq("CHAT_ID", chat_id)
            .eq("USER_ID", user_id)
            .single()
            .execute()
        )
        if not chat_check.data:
            raise HTTPException(status_code=404, detail="Chat not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Chat lookup failed: {e}")

    # 2. get cached parsed data — auto-recover if missing (new session / server restart)
    data_cache = cleaned_data_cache.get(chat_id)
    if not data_cache:
        try:
            file_result = (
                supabase.table("File")
                .select("path, filetype")
                .eq("CHAT_ID", chat_id)
                .single()
                .execute()
            )
            if not file_result.data:
                raise HTTPException(status_code=400, detail="No file found for this chat. Please upload a file first.")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"File lookup failed: {e}")

        try:
            file_bytes = supabase.storage.from_("user-files").download(file_result.data["path"])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not reload your file: {e}")

        df_recovered, id_cols_recovered = _clean_dataframe(file_bytes, file_result.data["filetype"])
        cleaned_data_cache[chat_id] = {"df": df_recovered, "id_columns": id_cols_recovered}
        data_cache = cleaned_data_cache[chat_id]

    # 3. get trained model (may be None for DATA_QUERY / UNCLEAR)
    model_cache = trained_models.get(chat_id)

    # 4. build df context for the classifier
    df = data_cache["df"]
    df_context = {
        "columns":       df.columns.tolist(),
        "sample_rows":   df.head(5).to_dict(orient="records"),
        "id_columns":    data_cache["id_columns"],
        "target_column": (model_cache or {}).get("target_column", ""),
    }

    # 5. classify the question — pass recent history so it can detect follow-ups accurately
    classifier     = QuestionClassifier()
    classification = classifier.classify(question, df_context, chat_history_cache.get(chat_id, []))
    question_type  = classification["type"]

    # 6. route to the right handler
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

        # retrain if target changed or no model exists yet
        cached_target = (model_cache or {}).get("target_column")
        if cached_target != inferred_target:
            if inferred_target not in df.columns:
                raise HTTPException(
                    status_code=400,
                    detail=f"Column '{inferred_target}' not found. Available columns: {', '.join(df.columns)}",
                )
            try:
                _run_train(chat_id, inferred_target)
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Training failed: {e}")
            model_cache = trained_models[chat_id]
            processor   = QuestionProcessor(data_cache, model_cache)

        prediction_mode = classification.get("prediction_mode", "local_batch")

        if prediction_mode == "local_single":
            id_column      = classification.get("id_column")
            id_value       = classification.get("id_value")
            feature_values = classification.get("feature_values")

            if not feature_values and (not id_column or not id_value):
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Could not identify which row you are asking about. "
                        "Either mention a specific value (name, ID, etc.) or provide "
                        f"feature values — for example: age=35, salary=50000."
                    ),
                )
            if id_column and id_column not in df.columns:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"'{id_column}' is not a column in this dataset. "
                        f"Available columns: {', '.join(df.columns.tolist())}."
                    ),
                )
            result = processor.handle_prediction(question, chat_id, classification)

        elif prediction_mode == "local_batch":
            result = processor.handle_prediction(question, chat_id, classification)

        else:
            raise HTTPException(status_code=400, detail=f"Unknown prediction_mode: {prediction_mode}")

    elif question_type == "ANALYSIS":
        inferred_target = classification.get("target_column")
        if not inferred_target:
            raise HTTPException(
                status_code=400,
                detail="Could not determine which column to analyse. Please rephrase your question.",
            )

        # retrain if target changed or no model exists yet
        cached_target = (model_cache or {}).get("target_column")
        if cached_target != inferred_target:
            if inferred_target not in df.columns:
                raise HTTPException(
                    status_code=400,
                    detail=f"Column '{inferred_target}' not found. Available columns: {', '.join(df.columns)}",
                )
            try:
                _run_train(chat_id, inferred_target)
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Training failed: {e}")
            model_cache = trained_models[chat_id]
            processor   = QuestionProcessor(data_cache, model_cache)

        result = processor.handle_analysis(chat_id, classification)

    else:
        raise HTTPException(status_code=500, detail=f"Unexpected question type: {question_type}")

    # Update conversation history cache — keep last 4 Q&A pairs
    history = chat_history_cache.get(chat_id, [])
    history.append({"question": question, "answer": result})
    chat_history_cache[chat_id] = history[-3:]

    formatted_answer = await _format_answer(question, result, df)

    # Persist the Q&A pair to the DB.
    # UNCLEAR has no LLM step — its answer is the clarification prompt in result["answer"].
    # Every other type gets the GPT-formatted string.
    answer_to_save = result.get("answer", "") if question_type == "UNCLEAR" else formatted_answer
    response_id: int | None = None
    try:
        query_ins = supabase.table("Query").insert({
            "query_text": question,
            "CHAT_ID": chat_id,
        }).execute()
        query_id = query_ins.data[0]["QUERY_ID"]

        resp_ins = supabase.table("Response").insert({
            "answer": answer_to_save,
            "explanation": "",
            "QUERY_ID": query_id,
        }).execute()
        response_id = resp_ins.data[0]["RESPONSE_ID"]
    except Exception as db_err:
        print(f"[processQuestion] DB save failed: {db_err}")

    return {**result, "formatted_answer": formatted_answer, "response_id": response_id}

SYSTEM_PROMPT = """
You are an AI assistant inside a program called Makeen.

Your role:
Explain results to non-technical users in a clear, direct, and natural way.

You receive structured input including:
- result_type
- prediction_mode or analysis_mode
- prediction, confidence
- raw_result
- shap_values, lime_values
- summary, predicted_as, results
- target_column, target_class

Hard rules (never break):
- Do NOT use technical terms (no SHAP, LIME, model, algorithm, etc.)
- Do NOT explain how the system works
- Do NOT use uncertainty words
- Do NOT use bullet points
- 60–120 words only

---

EXAMPLES (follow these patterns strictly):

---

1. DATA_QUERY

Input example:
question: "How many customers churned?"
raw_result: "127"

Output example:
127 customers have churned so far, which represents a significant portion of the customer base. This indicates that a noticeable number of users are leaving, which may require attention to retention strategies. Overall, churn is at a level that should not be ignored.

---

2. PREDICTION (local_single)

Input example:
prediction: "Approved"
confidence: 87
shap_values: [
  {"feature": "credit_score", "shap_value": 0.42},
  {"feature": "income", "shap_value": 0.28},
  {"feature": "debt_ratio", "shap_value": -0.15}
]
lime_values: [
  {"feature": "credit_score > 700", "impact": 0.35},
  {"feature": "income high", "impact": 0.20},
  {"feature": "debt_ratio high", "impact": -0.10}
]

Output example:
This application is approved with 87% confidence. The strongest reason is a high credit score, which strongly supports the decision, followed by a solid income level that further strengthens approval. A higher debt level works slightly against the outcome, but not enough to change the result. Overall, strong financial stability clearly outweighs the risks, leading to approval.

---

3. PREDICTION (local_batch)

Input example:
summary: {"total": 500, "Churn": 187, "No Churn": 313}
shap_aggregate: [
  {"feature": "monthly_charges", "shap_value": 0.38},
  {"feature": "contract_type", "shap_value": 0.31},
  {"feature": "tenure", "shap_value": -0.24}
]
results: [
  {"id_value": "C001", "prediction": "Churn", "confidence": 91.2},
  {"id_value": "C002", "prediction": "No Churn", "confidence": 84.5}
]

Output example:
187 out of 500 customers are expected to churn, while 313 are likely to stay. High monthly charges are the biggest reason customers leave, with short-term contracts also increasing the risk. On the other hand, longer customer history helps keep customers from leaving. For example, customer C001 is very likely to churn due to high charges, while C002 is expected to stay because of longer engagement. Overall, pricing and contract length play the biggest role in customer retention.

---

4. ANALYSIS (global)

Input example:
target_column: "loan_status"
shap_values: [
  {"feature": "credit_score", "shap_value": 0.42},
  {"feature": "income", "shap_value": 0.31},
  {"feature": "debt_ratio", "shap_value": 0.21}
]

Output example:
Credit score is the most important factor influencing loan approval, standing out clearly above all others. Income also plays a major role, helping determine whether an applicant is financially capable. Debt level is another key factor, affecting decisions depending on how high it is. Overall, financial strength and risk indicators are the main drivers behind approval decisions.

---

5. ANALYSIS (directional: decrease)

Input example:
target_column: "churn"
analysis_mode: "directional"
direction: "decrease"
shap_values: [
  {"feature": "tenure", "shap_value": -0.24},
  {"feature": "contract_type", "shap_value": -0.19}
]

Output example:
Longer customer tenure is the strongest factor that keeps customers from leaving, as people who stay longer tend to remain loyal. Having a long-term contract also reduces the chances of churn by creating stability. These factors together make customers much more likely to stay. Overall, long-term commitment is the key to reducing churn.

---

6. ANALYSIS (class_specific)

Input example:
target_column: "loan_status"
target_class: "Rejected"
shap_values: [
  {"feature": "debt_ratio", "shap_value": 0.45},
  {"feature": "credit_score", "shap_value": 0.38},
  {"feature": "income", "shap_value": 0.22}
]

Output example:
Loan rejection is mainly driven by a high debt level, which signals financial risk. A lower credit score also strongly contributes, making the applicant less reliable. Limited income adds further concern about repayment ability. Together, these factors make rejection much more likely. Overall, financial pressure and risk indicators are the main reasons applications get rejected.

---

Execution rules:

- Match the structure of the closest example
- Always start with the conclusion
- Then explain the strongest reasons
- Keep it simple and natural
- Do not mention technical terms

Output only the final explanation.
"""
def get_llm_response(system_prompt: str, user_message: str) -> str:
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        max_tokens=400,
    )
    return response.choices[0].message.content.strip()

async def process_ask_logic(
    question: str,
    result_type: str,
    prediction_mode: str = "",
    analysis_mode: str = "",
    target_column: str = "",
    target_class: str = "",
    prediction: str = "",
    confidence: float = 0.0,
    raw_result: str = "",
    shap_values: list = None,
    lime_values: list = None,
    summary: dict = None,
    predicted_as: dict = None,
    shap_aggregate: list = None,
    results: list = None,
    df: pd.DataFrame = None,
    df_context: dict = None
):
    shap_values = shap_values or []
    lime_values = lime_values or []
    summary = summary or {}
    predicted_as = predicted_as or {}
    shap_aggregate = shap_aggregate or []
    results = results or []
    df_context = df_context or {}

    data_summary = ""
    sample_text = ""

    if df is not None:
        data_summary = f"{df.shape[0]} rows, {df.shape[1]} columns"
        sample_rows = df.head(5).to_dict(orient="records")
        sample_text = "\n".join(
            [", ".join(f"{k}: {v}" for k, v in row.items()) for row in sample_rows]
        )
    elif df_context:
        data_summary = str(df_context)

    context_block = {
        "result_type": result_type,
        "prediction_mode": prediction_mode,
        "analysis_mode": analysis_mode,
        "target_column": target_column,
        "target_class": target_class,
        "prediction": prediction,
        "confidence": confidence,
        "raw_result": raw_result,
        "summary": summary,
        "predicted_as": predicted_as,
        "shap_values": shap_values,
        "lime_values": lime_values,
        "shap_aggregate": shap_aggregate,
        "results": results
    }

    user_message = f"""
User question:
{question}

Result type:
{result_type}

Context:
{json.dumps(context_block, indent=2)}

Dataset summary:
{data_summary}

Sample data:
{sample_text}
"""

    return get_llm_response(SYSTEM_PROMPT, user_message)
