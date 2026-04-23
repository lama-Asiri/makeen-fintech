"""
Shared fixtures for all backend tests.
Mocks OpenAI and Supabase so tests run offline with no API costs.
"""
import pytest
import pandas as pd
from unittest.mock import MagicMock, AsyncMock
from httpx import AsyncClient, ASGITransport
from fastapi import FastAPI


# ── Minimal stroke-like dataframe used across tests ─────────────────────────
@pytest.fixture
def sample_df() -> pd.DataFrame:
    return pd.DataFrame({
        "age":          [45, 60, 35, 70, 50, 40, 55, 65, 30, 48],
        "bmi":          [28.5, 32.1, 24.0, 35.0, 27.3, 29.0, 31.5, 26.0, 22.5, 30.2],
        "gender":       ["Male","Female","Male","Female","Male","Female","Male","Female","Male","Female"],
        "hypertension": [1, 0, 0, 1, 0, 1, 0, 0, 1, 0],
        "stroke":       [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    })


# ── Mock OpenAI async client ─────────────────────────────────────────────────
@pytest.fixture
def mock_openai(monkeypatch):
    mock_chunk = MagicMock()
    mock_chunk.choices = [MagicMock()]
    mock_chunk.choices[0].delta.content = "test response"

    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = '{"type":"DATA_QUERY","clarifications":[]}'

    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(return_value=mock_response)

    import routers.data_processor as dp
    monkeypatch.setattr(dp, "openai_client", mock_client)
    return mock_client


# ── Mock Supabase client ─────────────────────────────────────────────────────
@pytest.fixture
def mock_supabase(monkeypatch):
    mock = MagicMock()
    # auth
    mock.auth.get_user.return_value = MagicMock(user=MagicMock(id="test-user-id"))
    # postgrest chain: .table().select().eq().single().execute()
    mock_execute = MagicMock(data={"CHAT_ID": 1, "USER_ID": "test-user-id", "username": "testuser"})
    mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_execute
    mock.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value.execute.return_value = mock_execute
    mock.postgrest.auth = MagicMock()

    import routers.auth as auth_router
    import routers.data_processor as dp
    monkeypatch.setattr(auth_router, "supabase", mock)
    monkeypatch.setattr(dp, "supabase", mock)
    return mock


# ── Test HTTP client for integration tests ───────────────────────────────────
@pytest.fixture
async def client(mock_supabase, mock_openai):
    from app import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


# ── Auth header helper ───────────────────────────────────────────────────────
@pytest.fixture
def auth_header():
    return {"Authorization": "Bearer test-token"}
