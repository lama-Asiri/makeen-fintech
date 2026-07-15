from fastapi import APIRouter, Header, HTTPException

from routers.auth import _get_user_id, cleaned_data_cache, trained_models
from routers.data_processor import predict_local_batch, explain_shap_local_batch
from core.supabase_client import supabase
from core.dashboard_shaping import shape_dashboard_payload, save_dashboard_snapshot, load_dashboard_snapshot

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

    payload = shape_dashboard_payload(
        batch_result.get("results", []),
        shap_result.get("aggregate", []),
        target_column,
        task_type,
    )

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

    payload = build_dashboard_payload(chat_id)

    if payload.get("stage") == "trained":
        # Write-through: keep the durable copy fresh every time we have live data,
        # so a later restart (RAM caches wiped) has something real to fall back to.
        save_dashboard_snapshot(chat_id, payload)
        return payload

    # RAM cache is cold (e.g. right after a backend restart) — this is exactly the bug
    # being fixed: the chat may still have a real, durable snapshot from before the
    # restart even though cleaned_data_cache/trained_models don't have it anymore.
    snapshot = load_dashboard_snapshot(chat_id)
    return snapshot if snapshot else payload