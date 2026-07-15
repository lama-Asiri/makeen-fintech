"""
Shared dashboard-payload shaping + durable snapshot persistence.

Why this exists: the Dashboard's numbers are computed live from cleaned_data_cache /
trained_models (routers/auth.py) — plain Python dicts that live only in this process's
RAM and are wiped on every backend restart. shape_dashboard_payload() turns an already-
computed batch prediction + SHAP result into the small JSON the Dashboard actually
renders; save/load_dashboard_snapshot() persist that small payload into the Chat row so
a chat that's been predicted-on at least once keeps showing real numbers after a
restart, instead of falling back to an empty state despite having real prior history.

No dependency on routers/dashboard.py or routers/data_processor.py here — both of those
import from this module, not the other way around, so there's no circular import.
"""
import json
from collections import Counter
from typing import Any

from core.supabase_client import supabase


def shape_dashboard_payload(
    results: list[dict],
    aggregate: list[dict],
    target_column: str | None,
    task_type: str | None,
) -> dict[str, Any]:
    """
    Pure shaping — no I/O. `results` is a list of {id_value, prediction, confidence, ...}
    (e.g. shap_result["per_row"]), `aggregate` is a list of {feature, shap_value}
    (e.g. shap_result["aggregate"]).
    """
    records_processed = len(results)

    top_drivers = [
        {"feature": e["feature"], "importance": e["shap_value"]}
        for e in aggregate[:6]
    ]

    recent_results = [
        {
            "id_value": r.get("id_value"),
            "prediction": r.get("prediction"),
            "confidence": r.get("confidence"),
        }
        for r in results[:50]
    ]

    payload: dict[str, Any] = {
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
        values = [float(r["prediction"]) for r in results if r.get("prediction") not in (None, "")]
        payload.update({
            "prediction_stats": {
                "avg": round(sum(values) / len(values), 2) if values else None,
                "min": round(min(values), 2) if values else None,
                "max": round(max(values), 2) if values else None,
            }
        })

    return payload


def save_dashboard_snapshot(chat_id: int, payload: dict) -> None:
    """
    Best-effort durable copy of a 'trained' dashboard payload. Never raises — a failed
    snapshot write must not break the live response it's piggybacking on (either a
    /dashboard/overview view or a /processQuestion batch prediction).
    """
    try:
        supabase.table("Chat").update({
            "dashboard_snapshot": json.dumps(payload),
        }).eq("CHAT_ID", chat_id).execute()
    except Exception:
        pass


def load_dashboard_snapshot(chat_id: int) -> dict | None:
    """Best-effort read of the last durable snapshot. Returns None on any failure."""
    try:
        res = (
            supabase.table("Chat")
            .select("dashboard_snapshot")
            .eq("CHAT_ID", chat_id)
            .single()
            .execute()
        )
        raw = (res.data or {}).get("dashboard_snapshot")
        return json.loads(raw) if raw else None
    except Exception:
        return None
