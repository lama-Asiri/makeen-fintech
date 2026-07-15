# backend/routers/report.py

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from services.report_generator import generate_report
from core.supabase_client import supabase
from core.openai_client import openai_client
import json

router = APIRouter()


# ----------------------------
# GET CHAT DATA FROM SUPABASE
# ----------------------------
def get_chat_data(chat_id: int):
    res = supabase.table("Query") \
        .select("*, Response(RESPONSE_ID, answer, explanation, created_at)") \
        .eq("CHAT_ID", chat_id) \
        .order("created_at", desc=False) \
        .execute()

    chat_data = []

    for row in res.data:
        query_text = row.get("query_text")

        responses = row.get("Response", [])

        # Ensure responses is iterable
        if isinstance(responses, str):
            try:
                responses = json.loads(responses)
            except:
                responses = [responses]

        for r in responses:

            # Normalize r to dict
            if isinstance(r, str):
                try:
                    r = json.loads(r)
                except:
                    r = {"answer": r, "explanation": None}

            if not isinstance(r, dict):
                continue

            shap_values = None
            prediction = None

            explanation_raw = r.get("explanation")

            if explanation_raw:
                try:
                    parsed = explanation_raw

                    # Handle string → dict
                    if isinstance(parsed, str):
                        parsed = json.loads(parsed)

                    # Handle double-encoded JSON
                    if isinstance(parsed, str):
                        parsed = json.loads(parsed)

                    if isinstance(parsed, dict):
                        # Direct keys
                        shap_values = (
                            parsed.get("shapValues")
                            or parsed.get("shap_values")
                            or parsed.get("limeValues")
                            or parsed.get("lime_values")
                        )

                        prediction = parsed.get("prediction")

                        # Nested fallback
                        if not shap_values:
                            for key in ["data", "result", "output"]:
                                if key in parsed and isinstance(parsed[key], dict):
                                    nested = parsed[key]
                                    shap_values = (
                                        nested.get("shapValues")
                                        or nested.get("limeValues")
                                    )
                                    if shap_values:
                                        break

                    # Ensure valid format
                    if shap_values and not isinstance(shap_values, dict):
                        shap_values = None

                except Exception:
                    pass

            chat_data.append({
                "query": {"query_text": query_text},
                "response": {
                    "answer": r.get("answer"),
                    "prediction": prediction,
                    "shapValues": shap_values
                }
            })

    return chat_data


# ----------------------------
# LLM CALL
# ----------------------------
def llm_generate_summary(prompt: str) -> str:
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You generate audit summaries."},
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content


# ----------------------------
# ENDPOINT
# ----------------------------
@router.post("/generate-report/{chat_id}")
def generate_report_endpoint(chat_id: int):

    chat_data = get_chat_data(chat_id)

    if not chat_data:
        raise HTTPException(status_code=404, detail="No data found")

    try:
        file_path = generate_report(chat_data, llm_generate_summary)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename="audit_report.pdf"
    )