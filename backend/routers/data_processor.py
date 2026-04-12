from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
import pandas as pd
import json
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, r2_score

from core.openai_client import openai_client
from core.supabase_client import supabase
from routers.auth import cleaned_data_cache, trained_models, _get_user_id

router = APIRouter()

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
# Question Classifier
# ─────────────────────────────────────────────────────────────────────────────

CLASSIFIER_SYSTEM_PROMPT = """
You are a question classifier for Makeen, an AI data analysis platform.
Classify the user's question about their dataset into exactly one of 4 types.
TYPES:
1. DATA_QUERY — lookups, statistics, counts, comparisons, filters, aggregations.
   Examples: "How many rows?", "Average salary?", "Top 5 by revenue", "Count per region"
2. PREDICTION — predict an outcome using the trained ML model. Two sub-modes:
   - "single": the question targets one specific entity or row, identified by a concrete value
     the user mentions that matches a value in ANY column of the dataset (not just ID columns).
     Look at all columns and sample rows to find which column the user is referring to.
     Examples:
       "Will applicant A005 be approved?"     → id_column = "applicant_id", id_value = "A005"
       "Will factory Tesla pass the check?"   → id_column = "factory_name", id_value = "Tesla"
       "Predict for patient John Doe"         → id_column = "patient_name", id_value = "John Doe"
     → set prediction_mode to "single", id_column to the matching column name,
       id_value to the extracted value as a string
   - "batch": targets all rows or a group — no specific named entity or value mentioned.
     Example: "Which customers will churn?", "How many applicants pass?", "Who gets approved?"
     → set prediction_mode to "batch", id_column and id_value stay null
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
  "prediction_mode": "single" | "batch" | null,
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

    # ── Handler 2: PREDICTION ─────────────────────────────────────────────────
    def handle_prediction(self, question: str, chat_id: int, classification: dict) -> dict:
        # TODO: implement — Rahaf
        raise HTTPException(status_code=501, detail="PREDICTION handler not yet implemented")

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

    # TODO: elif question_type == "PREDICTION":

    # TODO: elif question_type == "ANALYSIS":

    else:
        raise HTTPException(status_code=500, detail=f"Unexpected question type: {question_type}")

    return result
