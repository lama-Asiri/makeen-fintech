# backend/routers/report.py

from fastapi import APIRouter, HTTPException, Header
from services.report_generator import generate_report
from services.compliance import map_compliance_requirements
from core.supabase_client import supabase
from core.openai_client import openai_client
from routers.auth import _get_user_id
import json

router = APIRouter()

# ----------------------------
# GET CHAT DATA (ROBUST)
# ----------------------------
def get_chat_data(chat_id: int, target_column: str | None = None):
    # 1. Fetch queries
    query_res = supabase.table("Query") \
        .select("*") \
        .eq("CHAT_ID", chat_id) \
        .execute()

    if not query_res.data:
        return []

    chat_data = []

    for q in query_res.data:
        query_id = q.get("QUERY_ID")
        query_text = q.get("query_text")

        if not query_id:
            continue

        # 2. Fetch responses per query (NO JOINS)
        resp_res = supabase.table("Response") \
            .select("*") \
            .eq("QUERY_ID", query_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()

        if not resp_res.data:
            continue

        r = resp_res.data[0]

        shap_values = None
        prediction = None
        # Defaults to the chat-level target passed in; overridden below if this
        # specific case saved its own target_column (see data_processor.py).
        # Falls back here for responses saved before that field existed.
        case_target_column = target_column

        explanation_raw = r.get("explanation")

        if explanation_raw:
            try:
                parsed = explanation_raw

                # handle string → dict
                if isinstance(parsed, str):
                    parsed = json.loads(parsed)

                # handle double-encoded JSON
                if isinstance(parsed, str):
                    parsed = json.loads(parsed)

                if isinstance(parsed, dict):
                    shap_values = (
                        parsed.get("shapValues")
                        or parsed.get("shap_values")
                        or parsed.get("limeValues")
                        or parsed.get("lime_values")
                    )

                    prediction = parsed.get("prediction")

                    # Per-case target — a chat can retrain on a different target
                    # between questions, so each case's own saved target_column
                    # takes precedence over the chat-level fallback.
                    case_target_column = parsed.get("target_column") or target_column

                    # nested fallback
                    if not shap_values:
                        for key in ["data", "result", "output"]:
                            nested = parsed.get(key)
                            if isinstance(nested, dict):
                                shap_values = (
                                    nested.get("shapValues")
                                    or nested.get("limeValues")
                                )
                                if shap_values:
                                    break

                if shap_values and not isinstance(shap_values, dict):
                    shap_values = None

            except Exception:
                shap_values = None
                prediction = None

        # Build compliance mapping for this case — needs top_features as a sorted
        # list of {feature, shap_value}, but shap_values here is a flat dict
        # ({feature: value}), so convert before calling the mapper.
        top_features = []
        if shap_values:
            top_features = [
                {"feature": f, "shap_value": v}
                for f, v in sorted(shap_values.items(), key=lambda kv: abs(kv[1]), reverse=True)[:3]
            ]
        compliance = map_compliance_requirements(case_target_column, prediction, top_features)

        chat_data.append({
            "query": {"query_text": query_text},
            "response": {
                "answer": r.get("answer"),
                "prediction": prediction,
                "shapValues": shap_values,
                "compliance": compliance,
            },
        })

    return chat_data


# ----------------------------
# LLM CALL
# ----------------------------
async def llm_generate_summary(prompt: str) -> str:
    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4o-mini",
           messages = [
    {
        "role": "system",
        "content": (
    "You generate a concise overall summary of multiple cases.\n"
    "Do NOT repeat or restate the cases.\n"
    "Do NOT include 'Case' sections.\n\n"
    "Only output:\n"
    "- Key patterns across cases\n"
    "- Main risk drivers\n"
    "- Any anomalies or inconsistencies\n\n"
    "Maximum 120 words."
)
    },
    {
        "role": "user",
        "content": prompt
    }
]
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Summary generation failed: {str(e)}"


# ----------------------------
# ENDPOINT
# ----------------------------
@router.post("/generate-report/{chat_id}")
async def generate_report_endpoint(chat_id: int, authorization: str = Header(None)):
    user_id = _get_user_id(authorization)

    # Verify chat ownership — mirrors the pattern used by /train, /uploadModel, etc.
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

    # Fallback target column — used only for cases saved before target_column
    # started being stored per-response (see data_processor.py). New cases
    # carry their own target_column and take precedence in get_chat_data.
    try:
        file_res = (
            supabase.table("File")
            .select("target_column")
            .eq("CHAT_ID", chat_id)
            .maybe_single()
            .execute()
        )
        target_column = (file_res.data or {}).get("target_column") if file_res else None
    except Exception:
        target_column = None  # non-fatal — compliance mapping just omits domain-specific text

    chat_data = get_chat_data(chat_id, target_column)

    # IMPORTANT: only fail if truly nothing exists
    if not chat_data:
        raise HTTPException(
            status_code=404,
            detail="No valid query-response data found for this chat"
        )

    try:
        report_data = await generate_report(chat_data, llm_generate_summary)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return report_data