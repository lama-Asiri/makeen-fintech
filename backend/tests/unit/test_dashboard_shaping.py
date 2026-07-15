"""
Unit tests for core/dashboard_shaping.py — the pure payload-shaping logic extracted
from routers/dashboard.py, plus the best-effort snapshot save/load helpers.
"""
import json
from unittest.mock import MagicMock

import core.dashboard_shaping as ds


SAMPLE_RESULTS = [
    {"id_value": "A001", "prediction": "good", "confidence": 91.2},
    {"id_value": "A002", "prediction": "bad", "confidence": 77.5},
    {"id_value": "A003", "prediction": "good", "confidence": 88.0},
]
SAMPLE_AGGREGATE = [
    {"feature": "income", "shap_value": 0.42},
    {"feature": "credit_history", "shap_value": -0.31},
]


# ── shape_dashboard_payload — classification ──────────────────────────────────

def test_classification_shape_has_expected_keys():
    payload = ds.shape_dashboard_payload(SAMPLE_RESULTS, SAMPLE_AGGREGATE, "credit_risk", "classification")
    assert payload["stage"] == "trained"
    assert payload["target_column"] == "credit_risk"
    assert payload["task_type"] == "classification"
    assert payload["records_processed"] == 3
    assert "avg_confidence" in payload
    assert "outcome_split" in payload
    assert "prediction_stats" not in payload


def test_classification_outcome_split_counts_correctly():
    payload = ds.shape_dashboard_payload(SAMPLE_RESULTS, SAMPLE_AGGREGATE, "credit_risk", "classification")
    split_by_label = {s["label"]: s["count"] for s in payload["outcome_split"]}
    assert split_by_label == {"good": 2, "bad": 1}


def test_classification_avg_confidence():
    payload = ds.shape_dashboard_payload(SAMPLE_RESULTS, SAMPLE_AGGREGATE, "credit_risk", "classification")
    expected = round((91.2 + 77.5 + 88.0) / 3, 1)
    assert payload["avg_confidence"] == expected


def test_top_drivers_capped_at_six_and_ordered_as_given():
    aggregate = [{"feature": f"f{i}", "shap_value": i / 10} for i in range(10)]
    payload = ds.shape_dashboard_payload(SAMPLE_RESULTS, aggregate, "x", "classification")
    assert len(payload["top_drivers"]) == 6
    assert payload["top_drivers"][0]["feature"] == "f0"


def test_recent_results_capped_at_fifty():
    results = [{"id_value": f"R{i}", "prediction": "good", "confidence": 80.0} for i in range(120)]
    payload = ds.shape_dashboard_payload(results, SAMPLE_AGGREGATE, "x", "classification")
    assert len(payload["recent_results"]) == 50
    assert payload["records_processed"] == 120  # full count, not the capped display list


# ── shape_dashboard_payload — regression ───────────────────────────────────────

def test_regression_shape_has_expected_keys():
    results = [
        {"id_value": "R1", "prediction": "10.5", "confidence": None},
        {"id_value": "R2", "prediction": "20.0", "confidence": None},
    ]
    payload = ds.shape_dashboard_payload(results, SAMPLE_AGGREGATE, "price", "regression")
    assert "prediction_stats" in payload
    assert "avg_confidence" not in payload
    assert "outcome_split" not in payload
    assert payload["prediction_stats"]["avg"] == 15.25
    assert payload["prediction_stats"]["min"] == 10.5
    assert payload["prediction_stats"]["max"] == 20.0


def test_regression_handles_empty_results():
    payload = ds.shape_dashboard_payload([], [], "price", "regression")
    assert payload["records_processed"] == 0
    assert payload["prediction_stats"] == {"avg": None, "min": None, "max": None}


# ── save_dashboard_snapshot / load_dashboard_snapshot ─────────────────────────

def test_save_dashboard_snapshot_writes_json(monkeypatch):
    mock = MagicMock()
    monkeypatch.setattr(ds, "supabase", mock)

    ds.save_dashboard_snapshot(42, {"stage": "trained", "records_processed": 3})

    mock.table.assert_called_with("Chat")
    update_call_args = mock.table.return_value.update.call_args[0][0]
    assert json.loads(update_call_args["dashboard_snapshot"]) == {"stage": "trained", "records_processed": 3}
    mock.table.return_value.update.return_value.eq.assert_called_with("CHAT_ID", 42)


def test_save_dashboard_snapshot_never_raises_on_failure(monkeypatch):
    mock = MagicMock()
    mock.table.side_effect = Exception("db is down")
    monkeypatch.setattr(ds, "supabase", mock)

    ds.save_dashboard_snapshot(42, {"stage": "trained"})  # should not raise


def test_load_dashboard_snapshot_round_trips(monkeypatch):
    mock = MagicMock()
    stored = {"stage": "trained", "records_processed": 7}
    mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
        data={"dashboard_snapshot": json.dumps(stored)}
    )
    monkeypatch.setattr(ds, "supabase", mock)

    result = ds.load_dashboard_snapshot(42)
    assert result == stored


def test_load_dashboard_snapshot_returns_none_when_missing(monkeypatch):
    mock = MagicMock()
    mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
        data={"dashboard_snapshot": None}
    )
    monkeypatch.setattr(ds, "supabase", mock)

    assert ds.load_dashboard_snapshot(42) is None


def test_load_dashboard_snapshot_never_raises_on_failure(monkeypatch):
    mock = MagicMock()
    mock.table.side_effect = Exception("db is down")
    monkeypatch.setattr(ds, "supabase", mock)

    assert ds.load_dashboard_snapshot(42) is None
