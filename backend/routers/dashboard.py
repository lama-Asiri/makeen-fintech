from fastapi import APIRouter, Header, HTTPException
from collections import Counter
import pandas as pd

from routers.auth import _get_user_id, cleaned_data_cache, trained_models
from routers.data_processor import predict_local_batch, explain_shap_local_batch
from core.supabase_client import supabase

router = APIRouter(prefix="/dashboard")

# Dashboard overview endpoint — three stages based on chat state:
#   - "no_data"   : nothing uploaded yet
#   - "no_target" : file parsed, but no question has picked a target/trained
#                   a model yet — shows an empty-state message
#   - "trained"   : target exists — runs batch + SHAP, reflecting whichever
#                   target was most recently trained (works for both single
#                   and batch questions)

_dashboard_cache: dict[int, dict] = {}


def build_dashboard_payload(chat_id: int) -> dict:
    cache = cleaned_data_cache.get(chat_id)
    if not cache:
        return {
            "stage": "no_data",
            "message": "Upload a file to get started — once it's processed you'll see your results here.",
        }

    model_data = trained_models.get(chat_id)
    if not model_data:
        return {
            "stage": "no_target",
            "message": (
                "Your data is ready, but there's nothing to show yet. "
                "Ask a question about what you'd like to predict or understand, "
                "and this dashboard will fill in with results."
            ),
        }

    # Skip recompute if nothing changed since the last call for this chat.
    data_id, model_id = id(cache), id(model_data)
    cached = _dashboard_cache.get(chat_id)
    if cached and cached["data_id"] == data_id and cached["model_id"] == model_id:
        return cached["payload"]

    target_column = model_data.get("target_column")
    task_type = model_data.get("task_type")

    try:
        batch_result = predict_local_batch(chat_id)
    except Exception:
        batch_result = {"results": [], "summary": {"total": 0}, "predicted_class_indices": []}

    try:
        shap_result = explain_shap_local_batch(chat_id, batch_result)
    except Exception:
        shap_result = {"aggregate": []}

    results = batch_result.get("results", [])
    records_processed = len(results)

    top_drivers = [
        {"feature": e["feature"], "importance": e["shap_value"]}
        for e in shap_result.get("aggregate", [])[:6]
    ]

    recent_results = [
        {
            "id_value": r.get("id_value"),
            "prediction": r.get("prediction"),
            "confidence": r.get("confidence"),
        }
        for r in results[:50]
    ]

    payload = {
        "stage": "trained",
        "target_column": target_column,
        "task_type": task_type,
        "records_processed": records_processed,
        "top_drivers": top_drivers,
        "recent_results": recent_results,
    }

    if task_type == "classification":
        confidences = [r.get("confidence") for r in results if r.get("confidence") is not None]
        avg_confidence = round(sum(confidences) / len(confidences), 1) if confidences else None

        label_counts = Counter(r.get("prediction") for r in results)
        outcome_split = [
            {
                "label": label,
                "count": count,
                "rate": round(count / records_processed * 100, 1) if records_processed else 0,
            }
            for label, count in label_counts.most_common()
        ]

        payload.update({
            "avg_confidence": avg_confidence,
            "outcome_split": outcome_split,
        })

    else:  # Regression
        # Regression has no discrete labels or confidence — show a value summary (avg/min/max of predicted numbers) instead.
        values = [float(r["prediction"]) for r in results if r.get("prediction") not in (None, "")]
        payload.update({
            "prediction_stats": {
                "avg": round(sum(values) / len(values), 2) if values else None,
                "min": round(min(values), 2) if values else None,
                "max": round(max(values), 2) if values else None,
            }
        })

    # Store this computation so the next call can skip recompute if unchanged.
    _dashboard_cache[chat_id] = {"data_id": data_id, "model_id": model_id, "payload": payload}
    return payload


@router.get("/overview")
async def get_dashboard_overview(chat_id: int, authorization: str = Header(None)):
    user_id = _get_user_id(authorization)

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

    return build_dashboard_payload(chat_id)