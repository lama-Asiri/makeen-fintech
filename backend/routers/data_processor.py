from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
import pandas as pd
import json
import numpy as np
import shap
from collections import Counter
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, r2_score

from core.openai_client import openai_client
from core.supabase_client import supabase
from routers.auth import cleaned_data_cache, trained_models, _get_user_id

router = APIRouter()

# prediction_cache[chat_id] — written by predict_local_single, read by /explain/lime (Reem)
# { mode, row_df, id_column, id_value, prediction, confidence, predicted_class_index, task_type }
prediction_cache: dict = {}

# ─────────────────────────────────────────────────────────────────────────────
# /train
# ─────────────────────────────────────────────────────────────────────────────

class TrainRequest(BaseModel):
    chat_id: int


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

    # 3. get cleaned data from cache
    cache               = cleaned_data_cache[chat_id]
    X                   = cache["X"].copy()
    y                   = cache["y"].copy()
    feature_names_orig  = cache["feature_names"]
    target_column       = cache["target_column"]
    task_type           = "classification" if (y.dtype == "object" or y.nunique() <= 10) else "regression"

    # 4. encode categorical features in X
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

    # 5. boolean → int
    bool_cols = X.select_dtypes(include=["bool"]).columns
    X[bool_cols] = X[bool_cols].astype(int)

    # 6. final feature names (one-hot may have added columns)
    feature_names = X.columns.tolist()

    # 7. encode target y
    le_target    = None
    class_labels = None
    if task_type == "classification":
        le_target    = LabelEncoder()
        y_encoded    = le_target.fit_transform(y.astype(str))
        class_labels = le_target.classes_.tolist()
    else:
        y_encoded = y.astype(float).values

    # 8. 80/20 split
    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Data split failed: {e}")

    # 9. train RandomForest
    try:
        if task_type == "classification":
            model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1, max_depth=15)
            model.fit(X_train, y_train)
            score = accuracy_score(y_test, model.predict(X_test))
        else:
            model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1, max_depth=15)
            model.fit(X_train, y_train)
            score = r2_score(y_test, model.predict(X_test))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Model training failed: {e}")

    # 10. top 5 features by importance
    top_features = sorted(
        zip(feature_names, model.feature_importances_),
        key=lambda x: x[1],
        reverse=True,
    )[:5]

    # 11. store in cache
    #     X (full encoded, all rows) is stored so SHAP can later run on the whole dataset,
    #     not just the training split.
    trained_models[chat_id] = {
        "model":                  model,
        "X":                      X,          # all rows, fully encoded — for SHAP batch/analysis
        "X_train":                X_train,    # training split — kept for LIME background data
        "feature_names":          feature_names,
        "feature_names_original": feature_names_orig,
        "target_column":          target_column,
        "task_type":              task_type,
        "class_labels":           class_labels,
        "le_target":              le_target,
        "encoders":               encoders,
    }

    # 12. return summary
    metric_key = "accuracy" if task_type == "classification" else "r2_score"
    return {
        "message":      "Model trained successfully",
        "task_type":    task_type,
        metric_key:     round(score, 4),
        "top_features": [{"name": n, "importance": round(i, 4)} for n, i in top_features],
    }


# ─────────────────────────────────────────────────────────────────────────────
# Prediction logic
# ─────────────────────────────────────────────────────────────────────────────

def predict_local_single(chat_id: int, id_column: str, id_value: str) -> dict:
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

    # 1. find the row the user is asking about
    match = df[df[id_column].astype(str) == str(id_value)]
    if match.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No row found where {id_column} = '{id_value}'. Please check the value and try again."
        )
    row = match.iloc[[0]].copy()

    # 2. drop id columns and target — same as what the model was trained on
    cols_to_drop = [c for c in id_cols + [target_col] if c in row.columns]
    row_df = row.drop(columns=cols_to_drop)

    # 3. apply the same encoders used at training time
    for col, enc in encoders.items():
        if col in row_df.columns:
            if enc["type"] == "label":
                row_df[col] = enc["encoder"].transform(row_df[col].astype(str))
            elif enc["type"] == "one_hot":
                dummies = pd.get_dummies(row_df[col], prefix=col)
                row_df = pd.concat([row_df.drop(columns=[col]), dummies], axis=1)

    # 4. boolean → int
    bool_cols = row_df.select_dtypes(include=["bool"]).columns
    row_df[bool_cols] = row_df[bool_cols].astype(int)

    # 5. align columns exactly to training feature order
    row_df = row_df.reindex(columns=feature_names, fill_value=0)

    # 6. predict
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

    # 7. write to prediction_cache so LIME (/explain/lime) can read it on-demand
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

    # per-row: top 5 factors
    per_row = []
    for i, row_result in enumerate(results):
        vals  = _shap_vals_for_row(shap_values, row_idx=i, class_idx=class_indices[i], task_type=task_type)
        pairs = sorted(zip(feature_names, vals), key=lambda x: abs(x[1]), reverse=True)[:5]
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
    aggregate = [{"feature": f, "importance": round(float(v), 4)} for f, v in agg_pairs]

    return {"per_row": per_row, "aggregate": aggregate}


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
3. ANALYSIS — understand what features or factors drive the target outcome across the whole dataset.
   Examples: "What drives churn?", "Which features matter most?", "What influences revenue?"
4. UNCLEAR — question is too vague, generic, or cannot be answered with the available data.
   When UNCLEAR, generate EXACTLY 3 concrete clarification questions. Rules:
   - Use actual column names from the dataset context provided
   - Reference real values from the sample rows where useful
   - Cover different intents: one DATA_QUERY-style, one PREDICTION-style, one ANALYSIS-style
   - Make them specific and directly answerable — NOT generic placeholders
   Also generate an "unclear_answer": a short, friendly, warm response (1-2 sentences) that
   acknowledges what the user said and gently lets them know you need more clarity.
   - If the user said a greeting (hi, hello, etc.), welcome them and introduce what Makeen can do
   - If the user asked something vague, acknowledge their intent and ask for more detail
   - Keep it conversational and kind — no robotic phrasing

Return ONLY valid JSON, no extra text outside the object:
{
  "type": "DATA_QUERY" | "PREDICTION" | "ANALYSIS" | "UNCLEAR",
  "prediction_mode": "local_single" | "local_batch" | null,
  "id_column": "<the ID column name to look up>" | null,
  "id_value": "<the extracted value as a string>" | null,
  "is_clear": true | false,
  "clarifications": ["question1", "question2", "question3"] or [],
  "unclear_answer": "<friendly response>" | null
}
"""

class QuestionClassifier:
    def classify(self, question: str, df_context: dict) -> dict:
        columns_str = ", ".join(df_context["columns"])
        target_str  = df_context["target_column"]
        sample_str  = "\n".join(
            "  " + ", ".join(f"{k}: {v}" for k, v in row.items())
            for row in df_context.get("sample_rows", [])[:5]
        )

        user_message = (
            f"Dataset context:\n"
            f"Columns: {columns_str}\n"
            f"Target column (what the model predicts): {target_str}\n\n"
            f"Sample rows (use these to recognise which column a user-mentioned value belongs to):\n{sample_str}\n\n"
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

            valid_types = {"DATA_QUERY", "PREDICTION", "ANALYSIS", "UNCLEAR"}
            if result.get("type") not in valid_types:
                raise ValueError(f"Unexpected type: {result.get('type')}")

            result.setdefault("prediction_mode", None)
            result.setdefault("id_column", None)
            result.setdefault("id_value", None)
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

# Prompt 2: turn the raw query result into a plain-English answer.
_DATA_QUERY_FORMAT_SYSTEM = """\
You are a helpful assistant inside Makeen, an AI data analysis platform.
A data query was run and returned a raw result. Rewrite it as a clear, natural answer.

Rules:
- Lead with the direct answer
- Use plain language — no technical terms, no "the DataFrame", no "the dataset"
- If the result is a table or list, summarize the key takeaways
- Maximum 80 words
- Output only the answer text, nothing else"""


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
            # fallback: let GPT answer from the sample data it already has
            result_str = None

        # Step 3: format as plain English
        if result_str is not None:
            user_msg = f"User question: {question}\n\nRaw result:\n{result_str}"
        else:
            user_msg = (
                f"User question: {question}\n\n"
                f"Columns: {columns_str}\n\n"
                f"Sample rows:\n{sample_str}\n\n"
                "(Note: answer based on the sample shown — exact computation was unavailable.)"
            )

        try:
            fmt_resp = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": _DATA_QUERY_FORMAT_SYSTEM},
                    {"role": "user",   "content": user_msg},
                ],
                max_tokens=200,
                temperature=0.3,
            )
            answer = fmt_resp.choices[0].message.content.strip()
        except Exception:
            answer = result_str or "Could not process your question. Please try rephrasing."

        return {
            "type":       "DATA_QUERY",
            "raw_result": result_str or "execution failed",
            "answer":     answer,
        }

    # ── Handler 2: PREDICTION (local_single + local_batch) ───────────────────
    def handle_prediction(self, question: str, chat_id: int, classification: dict) -> dict:
        mode = classification["prediction_mode"]

        if mode == "local_single":
            id_column = classification["id_column"]
            id_value  = classification["id_value"]

            pred        = predict_local_single(chat_id, id_column, id_value)
            shap_result = explain_shap_local_single(chat_id)

            return {
                "type":        "PREDICTION",
                "mode":        "local_single",
                "id_column":   id_column,
                "id_value":    id_value,
                "prediction":  pred["prediction"],
                "confidence":  pred["confidence"],
                "shap_values": shap_result,
            }

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

    # ── Handler 3: ANALYSIS ───────────────────────────────────────────────────
    def handle_analysis(self, question: str, chat_id: int) -> dict:
        # TODO: implement — Rahaf
        raise HTTPException(status_code=501, detail="ANALYSIS handler not yet implemented")

    # ── Handler 4: UNCLEAR ────────────────────────────────────────────────────
    def handle_unclear(self, clarifications: list, unclear_answer: str | None = None) -> dict:
        suggestions = [c for c in clarifications if isinstance(c, str) and c.strip()][:3]
        answer = unclear_answer or "Could you clarify what you meant? Here are some questions that might match what you're looking for:"
        return {
            "type":           "UNCLEAR",
            "answer":         answer,
            "clarifications": suggestions,
        }


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

    # 2. get cached parsed data
    data_cache = cleaned_data_cache.get(chat_id)
    if not data_cache:
        raise HTTPException(
            status_code=400,
            detail="Please upload and parse a file first before asking questions",
        )

    # 3. get trained model (may be None for DATA_QUERY / UNCLEAR)
    model_cache = trained_models.get(chat_id)

    # 4. build df context for the classifier
    df = data_cache["df"]
    df_context = {
        "columns":       df.columns.tolist(),
        "sample_rows":   df.head(5).to_dict(orient="records"),
        "id_columns":    data_cache["id_columns"],
        "target_column": data_cache["target_column"],
    }

    # 5. classify the question
    classifier     = QuestionClassifier()
    classification = classifier.classify(question, df_context)
    question_type  = classification["type"]

    # 6. route to the right handler
    processor = QuestionProcessor(data_cache, model_cache)

    if question_type == "UNCLEAR":
        result = processor.handle_unclear(classification["clarifications"], classification.get("unclear_answer"))

    elif question_type == "DATA_QUERY":
        result = processor.handle_data_query(question, df, df_context)

    elif question_type == "PREDICTION":
        if model_cache is None:
            raise HTTPException(
                status_code=400,
                detail="Please train the model first before asking prediction questions",
            )
        prediction_mode = classification.get("prediction_mode", "local_batch")

        if prediction_mode == "local_single":
            id_column = classification.get("id_column")
            id_value  = classification.get("id_value")
            if not id_column or not id_value:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Could not identify which row you are asking about. "
                        "Please mention a specific value — for example a name, ID, or any "
                        f"unique value from one of the columns: {', '.join(df.columns.tolist())}."
                    ),
                )
            if id_column not in df.columns:
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

    # TODO: elif question_type == "ANALYSIS":

    else:
        raise HTTPException(status_code=500, detail=f"Unexpected question type: {question_type}")

    return result
