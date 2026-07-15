"""
Integration tests for GET /dashboard/overview — specifically the durable-snapshot
fallback that keeps a chat's Dashboard numbers alive across a backend restart (which
wipes cleaned_data_cache/trained_models, both RAM-only).

Note: routers/dashboard.py and core/dashboard_shaping.py each do their own
`from core.supabase_client import supabase` import, separate from the ones the shared
`mock_supabase` fixture patches (routers.auth.supabase, routers.data_processor.supabase)
— so these tests patch those two references directly via monkeypatch.
"""
import json
from unittest.mock import MagicMock

import pytest

from routers.auth import cleaned_data_cache, trained_models

CHAT_ID = 9101


@pytest.fixture(autouse=True)
def cleanup():
    yield
    cleaned_data_cache.pop(CHAT_ID, None)
    trained_models.pop(CHAT_ID, None)


def _patch_dashboard_supabase(monkeypatch, mock_supabase, chat_owner_id="test-user-id", snapshot=None):
    """
    Wires the shared mock_supabase mock into routers.dashboard and core.dashboard_shaping
    (their own separate `supabase` name bindings), with the ownership-check chain
    (two .eq()) returning an owned chat, and the snapshot-load chain (one .eq())
    returning `snapshot` (or nothing, if None).
    """
    import routers.dashboard as dashboard_router
    import core.dashboard_shaping as ds

    monkeypatch.setattr(dashboard_router, "supabase", mock_supabase)
    monkeypatch.setattr(ds, "supabase", mock_supabase)

    owner_execute = MagicMock(data={"CHAT_ID": CHAT_ID, "USER_ID": chat_owner_id})
    snapshot_execute = MagicMock(data={"dashboard_snapshot": json.dumps(snapshot) if snapshot else None})

    # Two different .select(...) chains share the same `mock.table.return_value.select`
    # node in a plain MagicMock, so distinguish them by mocking `.select` itself to
    # branch on its argument.
    def select_side_effect(*args, **kwargs):
        col = args[0] if args else ""
        m = MagicMock()
        if col == "dashboard_snapshot":
            m.eq.return_value.single.return_value.execute.return_value = snapshot_execute
        else:
            m.eq.return_value.eq.return_value.single.return_value.execute.return_value = owner_execute
        return m

    mock_supabase.table.return_value.select.side_effect = select_side_effect


@pytest.mark.asyncio
async def test_overview_requires_auth(client):
    r = await client.get("/dashboard/overview", params={"chat_id": CHAT_ID})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_cold_cache_no_snapshot_returns_no_data(client, auth_header, mock_supabase, monkeypatch):
    """Genuinely never-trained chat, RAM cold (post-restart) — must show the empty
    state, not a stale/fabricated 'trained' payload. The "actually empty" case."""
    _patch_dashboard_supabase(monkeypatch, mock_supabase, snapshot=None)

    r = await client.get("/dashboard/overview", params={"chat_id": CHAT_ID}, headers=auth_header)
    assert r.status_code == 200
    assert r.json()["stage"] == "no_data"


@pytest.mark.asyncio
async def test_cold_cache_with_snapshot_returns_durable_data(client, auth_header, mock_supabase, monkeypatch):
    """The bug being fixed: RAM cache is cold (simulating a restart), but a durable
    snapshot from before the restart exists — the dashboard must show it instead of
    the empty state."""
    stored_snapshot = {
        "stage": "trained",
        "target_column": "credit_risk",
        "task_type": "classification",
        "records_processed": 42,
        "top_drivers": [{"feature": "income", "importance": 0.3}],
        "recent_results": [{"id_value": "A001", "prediction": "good", "confidence": 91.0}],
        "avg_confidence": 88.5,
        "outcome_split": [{"label": "good", "count": 30, "rate": 71.4}],
    }
    _patch_dashboard_supabase(monkeypatch, mock_supabase, snapshot=stored_snapshot)

    # Deliberately do NOT seed cleaned_data_cache/trained_models — simulates the
    # exact post-restart condition.
    assert CHAT_ID not in cleaned_data_cache
    assert CHAT_ID not in trained_models

    r = await client.get("/dashboard/overview", params={"chat_id": CHAT_ID}, headers=auth_header)
    assert r.status_code == 200
    body = r.json()
    assert body["stage"] == "trained"
    assert body["records_processed"] == 42
    assert body["target_column"] == "credit_risk"


@pytest.mark.asyncio
async def test_warm_cache_writes_through_snapshot(client, auth_header, mock_supabase, monkeypatch, sample_df):
    """When the RAM cache IS warm (live data available), the endpoint should write a
    fresh durable snapshot so a later restart has something to fall back to."""
    _patch_dashboard_supabase(monkeypatch, mock_supabase, snapshot=None)

    cleaned_data_cache[CHAT_ID] = {"df": sample_df.copy(), "id_columns": []}
    from routers.data_processor import _run_train
    _run_train(CHAT_ID, "stroke")

    r = await client.get("/dashboard/overview", params={"chat_id": CHAT_ID}, headers=auth_header)
    assert r.status_code == 200
    assert r.json()["stage"] == "trained"

    # save_dashboard_snapshot should have fired an update() against the Chat table.
    update_calls = mock_supabase.table.return_value.update.call_args_list
    assert any("dashboard_snapshot" in call.args[0] for call in update_calls)
