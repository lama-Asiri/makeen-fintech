"""
Unit tests for _run_train — the ML training helper in routers/data_processor.py.
Populates cleaned_data_cache directly to avoid needing a real Supabase/file upload.
"""
import pytest
import pandas as pd
from fastapi import HTTPException
from routers.auth import cleaned_data_cache, trained_models
from routers.data_processor import _run_train

CHAT_ID = 7001


@pytest.fixture(autouse=True)
def seed_and_cleanup(sample_df):
    """Seed cleaned_data_cache before each test; clean both caches after."""
    cleaned_data_cache[CHAT_ID] = {"df": sample_df.copy(), "id_columns": []}
    yield
    cleaned_data_cache.pop(CHAT_ID, None)
    trained_models.pop(CHAT_ID, None)


# ── Successful training ───────────────────────────────────────────────────────

def test_classification_task_type():
    result = _run_train(CHAT_ID, "stroke")
    assert result["task_type"] == "classification"


def test_accuracy_in_valid_range():
    result = _run_train(CHAT_ID, "stroke")
    assert 0.0 <= result["accuracy"] <= 1.0


def test_top_features_returned():
    result = _run_train(CHAT_ID, "stroke")
    assert len(result["top_features"]) > 0
    name, importance = result["top_features"][0]
    assert isinstance(name, str)
    assert 0.0 <= importance <= 1.0


def test_model_stored_in_cache():
    _run_train(CHAT_ID, "stroke")
    assert CHAT_ID in trained_models
    assert "model" in trained_models[CHAT_ID]


def test_feature_names_exclude_target():
    _run_train(CHAT_ID, "stroke")
    assert "stroke" not in trained_models[CHAT_ID]["feature_names"]


def test_feature_names_include_input_columns():
    _run_train(CHAT_ID, "stroke")
    feature_names = trained_models[CHAT_ID]["feature_names"]
    # gender is categorical with 2 unique values → label-encoded, name preserved
    assert "age" in feature_names


def test_class_labels_set_for_classification():
    _run_train(CHAT_ID, "stroke")
    labels = trained_models[CHAT_ID]["class_labels"]
    assert labels is not None
    assert len(labels) == 2


def test_raw_feature_defaults_stored():
    _run_train(CHAT_ID, "stroke")
    defaults = trained_models[CHAT_ID]["raw_feature_defaults"]
    assert "age" in defaults
    assert isinstance(defaults["age"], float)


# ── Regression task ───────────────────────────────────────────────────────────

def test_regression_task_type():
    # Regression triggers when y.nunique() > 10; build a 30-row df to guarantee that
    import numpy as np
    rng = np.random.default_rng(0)
    df = pd.DataFrame({
        "age":   rng.integers(20, 80, size=30).tolist(),
        "score": rng.uniform(1.0, 100.0, size=30).tolist(),  # 30 unique floats > 10
    })
    cleaned_data_cache[CHAT_ID] = {"df": df, "id_columns": []}
    result = _run_train(CHAT_ID, "score")
    assert result["task_type"] == "regression"
    assert "r2_score" in result


# ── Error cases ───────────────────────────────────────────────────────────────

def test_missing_column_raises_400():
    with pytest.raises(HTTPException) as exc:
        _run_train(CHAT_ID, "nonexistent_column")
    assert exc.value.status_code == 400
    assert "not found" in exc.value.detail.lower()


def test_single_class_target_raises_400(sample_df):
    bad_df = sample_df.copy()
    bad_df["stroke"] = 0  # all zeros — only one unique value
    cleaned_data_cache[CHAT_ID]["df"] = bad_df
    with pytest.raises(HTTPException) as exc:
        _run_train(CHAT_ID, "stroke")
    assert exc.value.status_code == 400
