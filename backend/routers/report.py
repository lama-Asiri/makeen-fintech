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

        for r in row.get("Response", []):

            shap_values = None
            prediction = None

            explanation_raw = r.get("explanation")

            if explanation_raw:
                try:
                    parsed = json.loads(explanation_raw)

                    shap_values = parsed.get("shapValues")
                    prediction = parsed.get("prediction")

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
# LLM CALL (USES YOUR CLIENT)
# ----------------------------
def llm_generate_summary(prompt: str) -> str:
    """
    Adapt this to how your openai_client works.
    Below is a typical pattern.
    """

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

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename="audit_report.pdf"
    )