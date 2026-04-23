"""
Integration tests for POST /processQuestion.
Uses the shared `client` fixture (mocked Supabase + OpenAI).
"""
import pytest
from routers.auth import cleaned_data_cache, trained_models


# ── Auth guard ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_requires_authorization(client):
    r = await client.post("/processQuestion", json={"chat_id": 1, "question": "test"})
    assert r.status_code == 401


# ── Input validation (runs after auth, before any Supabase/ML calls) ──────────

@pytest.mark.asyncio
async def test_empty_question_rejected(client, auth_header):
    r = await client.post("/processQuestion",
                          json={"chat_id": 1, "question": "   "},
                          headers=auth_header)
    assert r.status_code == 400
    assert "empty" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_question_over_500_chars_rejected(client, auth_header):
    r = await client.post("/processQuestion",
                          json={"chat_id": 1, "question": "x" * 501},
                          headers=auth_header)
    assert r.status_code == 400
    assert "500" in r.json()["detail"]


@pytest.mark.asyncio
async def test_exactly_500_chars_accepted_at_boundary(client, auth_header):
    # 500-char question is the max allowed — should NOT be rejected by validation.
    # It will fail later (no cached data), but NOT with the length-validation 400.
    r = await client.post("/processQuestion",
                          json={"chat_id": 1, "question": "x" * 500},
                          headers=auth_header)
    # Must not be the question-length 400
    if r.status_code == 400:
        assert "500" not in r.json()["detail"] or "too long" not in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_missing_body_returns_422(client, auth_header):
    r = await client.post("/processQuestion", headers=auth_header)
    assert r.status_code == 422


# ── No cached data (auto-recovery fails with mocked Supabase) ─────────────────

@pytest.mark.asyncio
async def test_no_data_cache_returns_400(client, auth_header):
    """
    When cleaned_data_cache is empty the endpoint tries to reload from Supabase.
    The mock Supabase returns a dict without a 'path' key, so the download step
    fails — endpoint should return 400, not 500.
    """
    cleaned_data_cache.pop(1, None)
    r = await client.post("/processQuestion",
                          json={"chat_id": 1, "question": "How many rows?"},
                          headers=auth_header)
    assert r.status_code == 400


# ── Seeded cache (full pipeline to classifier) ────────────────────────────────

@pytest.fixture
def seeded_cache(sample_df):
    chat_id = 1
    cleaned_data_cache[chat_id] = {"df": sample_df.copy(), "id_columns": []}
    from routers.data_processor import _run_train
    _run_train(chat_id, "stroke")
    yield chat_id
    cleaned_data_cache.pop(chat_id, None)
    trained_models.pop(chat_id, None)


@pytest.mark.asyncio
async def test_unclear_returns_streaming_response(client, auth_header, seeded_cache, mock_openai, mock_supabase):
    """
    With a seeded cache and classifier returning UNCLEAR, the endpoint streams
    an SSE response. We verify status 200 and content-type text/event-stream.
    The supabase insert mock must return real ints so the done-event JSON serializes.
    """
    import json
    from unittest.mock import MagicMock, AsyncMock

    # Classifier returns UNCLEAR
    mock_openai.chat.completions.create = AsyncMock(return_value=MagicMock(
        choices=[MagicMock(message=MagicMock(content=json.dumps({
            "type": "UNCLEAR",
            "is_clear": False,
            "clarifications": ["Q1?", "Q2?", "Q3?"],
            "unclear_answer": None,
        })))]
    ))

    # Make insert().execute() return serializable data so the 'done' SSE event
    # can json.dumps({'response_id': <int>}) without hitting MagicMock.
    mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(
        data=[{"QUERY_ID": 1, "RESPONSE_ID": 42}]
    )

    r = await client.post("/processQuestion",
                          json={"chat_id": 1, "question": "blah"},
                          headers=auth_header)
    assert r.status_code == 200
    assert "text/event-stream" in r.headers.get("content-type", "")
