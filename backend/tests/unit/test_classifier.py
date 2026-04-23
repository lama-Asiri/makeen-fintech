"""
Unit tests for QuestionClassifier — the GPT-backed question classifier.
OpenAI is always mocked so tests run offline.
"""
import json
import pytest
from unittest.mock import AsyncMock, MagicMock
from routers.data_processor import QuestionClassifier


@pytest.fixture
def df_context():
    return {
        "columns": ["age", "bmi", "gender", "hypertension", "stroke"],
        "sample_rows": [
            {"age": 45, "bmi": 28.5, "gender": "Male", "hypertension": 1, "stroke": 1}
        ],
        "id_columns": [],
        "target_column": "stroke",
    }


def _mock_openai(monkeypatch, response_dict: dict):
    """Patch dp.openai_client so classify() returns response_dict."""
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = json.dumps(response_dict)
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
    import routers.data_processor as dp
    monkeypatch.setattr(dp, "openai_client", mock_client)
    return mock_client


# ── Successful classifications ────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_data_query_type(monkeypatch, df_context):
    _mock_openai(monkeypatch, {"type": "DATA_QUERY", "clarifications": []})
    result = await QuestionClassifier().classify("How many rows?", df_context)
    assert result["type"] == "DATA_QUERY"


@pytest.mark.asyncio
async def test_prediction_local_single(monkeypatch, df_context):
    _mock_openai(monkeypatch, {
        "type": "PREDICTION",
        "prediction_mode": "local_single",
        "id_column": "age",
        "id_value": "45",
        "clarifications": [],
    })
    result = await QuestionClassifier().classify("Will patient 45 have a stroke?", df_context)
    assert result["type"] == "PREDICTION"
    assert result["prediction_mode"] == "local_single"
    assert result["id_column"] == "age"
    assert result["id_value"] == "45"


@pytest.mark.asyncio
async def test_prediction_local_batch(monkeypatch, df_context):
    _mock_openai(monkeypatch, {
        "type": "PREDICTION",
        "prediction_mode": "local_batch",
        "clarifications": [],
    })
    result = await QuestionClassifier().classify("Which patients will have a stroke?", df_context)
    assert result["type"] == "PREDICTION"
    assert result["prediction_mode"] == "local_batch"


@pytest.mark.asyncio
async def test_analysis_global(monkeypatch, df_context):
    _mock_openai(monkeypatch, {
        "type": "ANALYSIS",
        "analysis_mode": "global",
        "target_column": "stroke",
        "clarifications": [],
    })
    result = await QuestionClassifier().classify("What drives stroke?", df_context)
    assert result["type"] == "ANALYSIS"
    assert result["analysis_mode"] == "global"


@pytest.mark.asyncio
async def test_unclear_with_clarifications(monkeypatch, df_context):
    _mock_openai(monkeypatch, {
        "type": "UNCLEAR",
        "is_clear": False,
        "clarifications": ["Question 1?", "Question 2?", "Question 3?"],
    })
    result = await QuestionClassifier().classify("blah", df_context)
    assert result["type"] == "UNCLEAR"
    assert result["is_clear"] is False
    assert len(result["clarifications"]) == 3


@pytest.mark.asyncio
async def test_history_explanation_type(monkeypatch, df_context):
    _mock_openai(monkeypatch, {
        "type": "HISTORY_EXPLANATION",
        "history_mode": "last",
        "clarifications": [],
    })
    result = await QuestionClassifier().classify("explain more", df_context)
    assert result["type"] == "HISTORY_EXPLANATION"
    assert result["history_mode"] == "last"


# ── Default fields set ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_all_defaults_populated(monkeypatch, df_context):
    _mock_openai(monkeypatch, {"type": "DATA_QUERY", "clarifications": []})
    result = await QuestionClassifier().classify("avg age?", df_context)
    for key in ("target_column", "prediction_mode", "id_column", "id_value",
                "feature_values", "analysis_mode", "direction", "target_class",
                "history_mode", "is_clear", "clarifications", "unclear_answer"):
        assert key in result, f"missing key: {key}"


# ── Fallback on bad JSON ──────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_falls_back_to_unclear_on_invalid_json(monkeypatch, df_context):
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = "not valid json {"
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
    import routers.data_processor as dp
    monkeypatch.setattr(dp, "openai_client", mock_client)

    result = await QuestionClassifier().classify("???", df_context)
    assert result["type"] == "UNCLEAR"
    assert result["is_clear"] is False
    assert len(result["clarifications"]) == 3


@pytest.mark.asyncio
async def test_falls_back_to_unclear_on_api_error(monkeypatch, df_context):
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(side_effect=Exception("API timeout"))
    import routers.data_processor as dp
    monkeypatch.setattr(dp, "openai_client", mock_client)

    result = await QuestionClassifier().classify("???", df_context)
    assert result["type"] == "UNCLEAR"
