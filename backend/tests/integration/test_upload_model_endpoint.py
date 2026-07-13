"""
Integration tests for POST /uploadModel — the "bring your own model" upload endpoint.
Uses the shared `client` fixture (mocked Supabase + OpenAI, no real network calls).
"""
import io
import pickle

import pytest
from sklearn.linear_model import LogisticRegression

from routers.auth import cleaned_data_cache, trained_models


def _pickle_bytes(obj) -> bytes:
    buf = io.BytesIO()
    pickle.dump(obj, buf)
    return buf.getvalue()


CHAT_ID = 9001


@pytest.fixture
def seeded_cache(sample_df):
    cleaned_data_cache[CHAT_ID] = {"df": sample_df.copy(), "id_columns": []}
    yield CHAT_ID
    cleaned_data_cache.pop(CHAT_ID, None)
    trained_models.pop(CHAT_ID, None)


def _fitted_model_bytes(chat_id: int, target_column: str = "stroke") -> bytes:
    from routers.data_processor import _prepare_training_data
    prep = _prepare_training_data(chat_id, target_column)
    model = LogisticRegression(max_iter=1000).fit(prep["X_train"], prep["y_train"])
    return _pickle_bytes(model)


# ── Auth guard ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_upload_model_requires_auth(client):
    r = await client.post(
        "/uploadModel",
        files={"file": ("model.pkl", b"whatever", "application/octet-stream")},
        data={"chat_id": str(CHAT_ID), "target_column": "stroke", "task_type": "classification"},
    )
    assert r.status_code == 401


# ── Extension rejection ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_upload_model_rejects_non_pickle_extension(client, auth_header, seeded_cache):
    r = await client.post(
        "/uploadModel",
        files={"file": ("model.joblib", b"whatever", "application/octet-stream")},
        data={"chat_id": str(seeded_cache), "target_column": "stroke", "task_type": "classification"},
        headers=auth_header,
    )
    assert r.status_code == 400
    assert "pkl" in r.json()["detail"].lower() or "pickle" in r.json()["detail"].lower()


# ── Oversized rejection ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_upload_model_rejects_oversized_file(client, auth_header, seeded_cache):
    big = b"x" * (20 * 1024 * 1024 + 1)
    r = await client.post(
        "/uploadModel",
        files={"file": ("model.pkl", big, "application/octet-stream")},
        data={"chat_id": str(seeded_cache), "target_column": "stroke", "task_type": "classification"},
        headers=auth_header,
    )
    assert r.status_code == 400
    assert "20 mb" in r.json()["detail"].lower()


# ── Invalid task_type ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_upload_model_rejects_invalid_task_type(client, auth_header, seeded_cache):
    r = await client.post(
        "/uploadModel",
        files={"file": ("model.pkl", b"whatever", "application/octet-stream")},
        data={"chat_id": str(seeded_cache), "target_column": "stroke", "task_type": "clustering"},
        headers=auth_header,
    )
    assert r.status_code == 400
    assert "task_type" in r.json()["detail"]


# ── Must call /parse first ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_upload_model_requires_parse_first(client, auth_header):
    cleaned_data_cache.pop(CHAT_ID, None)
    r = await client.post(
        "/uploadModel",
        files={"file": ("model.pkl", b"whatever", "application/octet-stream")},
        data={"chat_id": str(CHAT_ID), "target_column": "stroke", "task_type": "classification"},
        headers=auth_header,
    )
    assert r.status_code == 400
    assert "parse" in r.json()["detail"].lower()


# ── Malicious pickle rejection ─────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_upload_model_rejects_malicious_pickle(client, auth_header, seeded_cache):
    import os

    class _Evil:
        def __reduce__(self):
            return (os.system, ("echo pwned",))

    r = await client.post(
        "/uploadModel",
        files={"file": ("model.pkl", _pickle_bytes(_Evil()), "application/octet-stream")},
        data={"chat_id": str(seeded_cache), "target_column": "stroke", "task_type": "classification"},
        headers=auth_header,
    )
    assert r.status_code == 400
    assert seeded_cache not in trained_models


# ── No .predict() method ───────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_upload_model_rejects_object_without_predict(client, auth_header, seeded_cache):
    r = await client.post(
        "/uploadModel",
        files={"file": ("model.pkl", _pickle_bytes({"not": "a model"}), "application/octet-stream")},
        data={"chat_id": str(seeded_cache), "target_column": "stroke", "task_type": "classification"},
        headers=auth_header,
    )
    assert r.status_code == 400
    assert "predict" in r.json()["detail"].lower()


# ── Happy path ──────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_upload_model_happy_path(client, auth_header, seeded_cache, mock_supabase):
    from unittest.mock import MagicMock
    mock_supabase.storage.from_.return_value.upload.return_value = MagicMock()

    model_bytes = _fitted_model_bytes(seeded_cache, "stroke")
    r = await client.post(
        "/uploadModel",
        files={"file": ("model.pkl", model_bytes, "application/octet-stream")},
        data={"chat_id": str(seeded_cache), "target_column": "stroke", "task_type": "classification"},
        headers=auth_header,
    )
    assert r.status_code == 200
    body = r.json()
    assert body["task_type"] == "classification"
    assert body["class_labels"] is not None
    assert trained_models[seeded_cache]["is_user_provided"] is True

    # storage.upload should have been called with the deterministic models/ path,
    # not the user's original filename.
    upload_call = mock_supabase.storage.from_.return_value.upload
    assert upload_call.called
    called_path = upload_call.call_args[0][0]
    assert called_path == f"test-user-id/models/{seeded_cache}.pkl"


# ── End-to-end through /processQuestion ────────────────────────────────────────

@pytest.mark.asyncio
async def test_uploaded_model_used_by_process_question(client, auth_header, seeded_cache, mock_supabase, mock_openai):
    from unittest.mock import MagicMock, AsyncMock
    import json

    model_bytes = _fitted_model_bytes(seeded_cache, "stroke")
    upload_r = await client.post(
        "/uploadModel",
        files={"file": ("model.pkl", model_bytes, "application/octet-stream")},
        data={"chat_id": str(seeded_cache), "target_column": "stroke", "task_type": "classification"},
        headers=auth_header,
    )
    assert upload_r.status_code == 200

    mock_openai.chat.completions.create = AsyncMock(return_value=MagicMock(
        choices=[MagicMock(message=MagicMock(content=json.dumps({
            "type": "PREDICTION",
            "target_column": "stroke",
            "prediction_mode": "local_batch",
        })))]
    ))
    mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(
        data=[{"QUERY_ID": 1, "RESPONSE_ID": 42}]
    )

    r = await client.post(
        "/processQuestion",
        json={"chat_id": seeded_cache, "question": "Who is likely to have a stroke?"},
        headers=auth_header,
    )
    assert r.status_code == 200
    # The uploaded model must still be the one in use — /processQuestion's retrain
    # guard should NOT have swapped it back to a fresh RandomForest since target_column
    # matches what was already cached (is_user_provided stays True).
    assert trained_models[seeded_cache]["is_user_provided"] is True
