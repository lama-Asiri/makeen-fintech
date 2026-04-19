from fastapi import APIRouter, Form, HTTPException
from pydantic import BaseModel
import json
from backend.routers.data_processor import process_ask_logic

router = APIRouter()

# ─────────────────────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────────────────────
class LLMResponse(BaseModel):
    answer: str

# ─────────────────────────────────────────────────────────────
# Endpoint
# ─────────────────────────────────────────────────────────────
@router.post("/ask", response_model=LLMResponse)
async def ask_llm(
    question: str = Form(...),
    result_type: str = Form(...),

    prediction_mode: str = Form(default=""),
    analysis_mode: str = Form(default=""),
    target_column: str = Form(default=""),
    target_class: str = Form(default=""),
    prediction: str = Form(default=""),
    confidence: float = Form(default=0.0),
    raw_result: str = Form(default=""),
    shap_values: str = Form(default="[]"),
    lime_values: str = Form(default="[]"),
    summary: str = Form(default="{}"),
    predicted_as: str = Form(default="{}"),
    shap_aggregate: str = Form(default="[]"),
    results: str = Form(default="[]"),
    df_context: str = Form(default="{}"),
):
    try:
        # ── Safe JSON parsing ─────────────────────
        def safe_json(val, default):
            try:
                return json.loads(val)
            except:
                return default

        shap_data = safe_json(shap_values, [])
        lime_data = safe_json(lime_values, [])
        summary_data = safe_json(summary, {})
        predicted_as_data = safe_json(predicted_as, {})
        shap_agg_data = safe_json(shap_aggregate, [])
        results_data = safe_json(results, [])
        df_context_data = safe_json(df_context, {})

        # ── Call shared logic ─────────────────────
        answer = await process_ask_logic(
            question=question,
            result_type=result_type,
            prediction_mode=prediction_mode,
            analysis_mode=analysis_mode,
            target_column=target_column,
            target_class=target_class,
            prediction=prediction,
            confidence=confidence,
            raw_result=raw_result,
            shap_values=shap_data,
            lime_values=lime_data,
            summary=summary_data,
            predicted_as=predicted_as_data,
            shap_aggregate=shap_agg_data,
            results=results_data,
            df=None,
            df_context=df_context_data
        )

        return LLMResponse(answer=answer)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))