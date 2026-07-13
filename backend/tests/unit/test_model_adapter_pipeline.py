"""
Unit tests for the "bring your own model" adapter path in routers/data_processor.py:
_run_model_adapter, the is_user_provided branch in predict_local_single/_batch, and
get_shap_explainer's Kernel-vs-Tree selection.
"""
import numpy as np
import pandas as pd
import pytest
import shap
from fastapi import HTTPException
from sklearn.linear_model import LogisticRegression, LinearRegression

from routers.auth import cleaned_data_cache, trained_models, prediction_cache
from routers.data_processor import (
    _run_model_adapter,
    _run_train,
    predict_local_single,
    predict_local_batch,
    explain_shap_local_single,
    get_shap_explainer,
)

CHAT_ID = 8001


@pytest.fixture(autouse=True)
def seed_and_cleanup(sample_df):
    cleaned_data_cache[CHAT_ID] = {"df": sample_df.copy(), "id_columns": []}
    yield
    cleaned_data_cache.pop(CHAT_ID, None)
    trained_models.pop(CHAT_ID, None)
    prediction_cache.pop(CHAT_ID, None)


def _fit_logistic_regression_for(chat_id: int, target_column: str):
    """Fit a real LogisticRegression against this chat's already-encoded feature schema."""
    from routers.data_processor import _prepare_training_data
    prep = _prepare_training_data(chat_id, target_column)
    model = LogisticRegression(max_iter=1000)
    model.fit(prep["X_train"], prep["y_train"])
    return model


# ── _run_model_adapter ─────────────────────────────────────────────────────────

def test_run_model_adapter_sets_is_user_provided():
    model = _fit_logistic_regression_for(CHAT_ID, "stroke")
    _run_model_adapter(CHAT_ID, "stroke", "classification", model)
    assert trained_models[CHAT_ID]["is_user_provided"] is True


def test_run_model_adapter_le_target_is_none():
    model = _fit_logistic_regression_for(CHAT_ID, "stroke")
    _run_model_adapter(CHAT_ID, "stroke", "classification", model)
    assert trained_models[CHAT_ID]["le_target"] is None


def test_run_model_adapter_class_labels_from_model_classes():
    model = _fit_logistic_regression_for(CHAT_ID, "stroke")
    result = _run_model_adapter(CHAT_ID, "stroke", "classification", model)
    assert result["class_labels"] == [str(c) for c in model.classes_]
    assert trained_models[CHAT_ID]["class_labels"] == [str(c) for c in model.classes_]


def test_run_model_adapter_rejects_classification_without_classes_attr():
    class NoClassesModel:
        def predict(self, X):
            return np.zeros(len(X))

    with pytest.raises(HTTPException) as exc:
        _run_model_adapter(CHAT_ID, "stroke", "classification", NoClassesModel())
    assert exc.value.status_code == 400
    assert "classes_" in exc.value.detail


def test_run_model_adapter_rejects_schema_mismatch():
    # A model fit on totally different columns should fail validate_uploaded_model's
    # smoke test against this chat's actual feature schema.
    mismatched = LogisticRegression().fit([[1], [2]], [0, 1])
    with pytest.raises(ValueError):
        _run_model_adapter(CHAT_ID, "stroke", "classification", mismatched)


def test_run_model_adapter_top_features_none_without_importances():
    model = _fit_logistic_regression_for(CHAT_ID, "stroke")
    result = _run_model_adapter(CHAT_ID, "stroke", "classification", model)
    # LogisticRegression has no feature_importances_
    assert result["top_features"] is None


def test_run_model_adapter_does_not_touch_self_trained_flow():
    # Regression guard: running _run_model_adapter for one chat must not affect a
    # separately self-trained chat's cache entry.
    other_chat = CHAT_ID + 1
    cleaned_data_cache[other_chat] = cleaned_data_cache[CHAT_ID].copy()
    try:
        _run_train(other_chat, "stroke")
        assert trained_models[other_chat]["is_user_provided"] is False

        model = _fit_logistic_regression_for(CHAT_ID, "stroke")
        _run_model_adapter(CHAT_ID, "stroke", "classification", model)

        assert trained_models[other_chat]["is_user_provided"] is False
        assert trained_models[CHAT_ID]["is_user_provided"] is True
    finally:
        cleaned_data_cache.pop(other_chat, None)
        trained_models.pop(other_chat, None)


# ── predict_local_single / predict_local_batch skip inverse_transform for BYOM ──

def test_predict_local_batch_skips_inverse_transform_for_byom():
    model = _fit_logistic_regression_for(CHAT_ID, "stroke")
    _run_model_adapter(CHAT_ID, "stroke", "classification", model)

    result = predict_local_batch(CHAT_ID)
    X = trained_models[CHAT_ID]["X"]
    expected_raw = model.predict(X)
    actual = [r["prediction"] for r in result["results"]]
    assert actual == [str(p) for p in expected_raw]


def test_predict_local_single_skips_inverse_transform_for_byom():
    model = _fit_logistic_regression_for(CHAT_ID, "stroke")
    _run_model_adapter(CHAT_ID, "stroke", "classification", model)
    df = cleaned_data_cache[CHAT_ID]["df"]
    id_value = str(df.iloc[0]["age"])

    result = predict_local_single(CHAT_ID, id_column="age", id_value=id_value)
    assert result["prediction"] in [str(c) for c in model.classes_]
    assert result["confidence"] is not None  # LogisticRegression has predict_proba


def test_predict_local_single_regression_byom_no_confidence():
    # sample_df's numeric columns all have <=10 unique values (10 rows total), which
    # would trip the classification heuristic in _prepare_training_data — build a
    # dedicated 30-row frame with a genuinely continuous target instead, same
    # workaround test_ml_pipeline.py's own regression test uses.
    rng = np.random.default_rng(0)
    df = pd.DataFrame({
        "age":   rng.integers(20, 80, size=30).tolist(),
        "bmi":   rng.uniform(18.0, 40.0, size=30).tolist(),
        "score": rng.uniform(1.0, 100.0, size=30).tolist(),
    })
    cleaned_data_cache[CHAT_ID] = {"df": df, "id_columns": []}

    from routers.data_processor import _prepare_training_data
    prep = _prepare_training_data(CHAT_ID, "score")
    model = LinearRegression().fit(prep["X_train"], prep["y_train"])
    _run_model_adapter(CHAT_ID, "score", "regression", model)

    # df.iloc[0]["age"] would upcast to float64 (a mixed-dtype row-Series) — index the
    # column directly instead to keep age's real int64 value for the id_value lookup.
    result = predict_local_single(CHAT_ID, id_column="age", id_value=str(df["age"].iloc[0]))
    assert result["confidence"] is None


def test_self_trained_flow_still_uses_inverse_transform():
    # Regression guard: the existing self-trained path is untouched by the BYOM branch.
    _run_train(CHAT_ID, "stroke")
    result = predict_local_batch(CHAT_ID)
    class_labels = trained_models[CHAT_ID]["class_labels"]
    assert all(r["prediction"] in class_labels for r in result["results"])


# ── get_shap_explainer branches correctly ──────────────────────────────────────

def test_get_shap_explainer_returns_tree_for_self_trained():
    _run_train(CHAT_ID, "stroke")
    explainer, cap = get_shap_explainer(trained_models[CHAT_ID])
    assert isinstance(explainer, shap.TreeExplainer)
    assert cap == 500


def test_get_shap_explainer_returns_kernel_for_byom():
    model = _fit_logistic_regression_for(CHAT_ID, "stroke")
    _run_model_adapter(CHAT_ID, "stroke", "classification", model)
    explainer, cap = get_shap_explainer(trained_models[CHAT_ID])
    assert isinstance(explainer, shap.KernelExplainer)
    assert cap == 30


# ── End-to-end: real KernelExplainer through explain_shap_local_single ─────────

def test_explain_shap_local_single_end_to_end_kernel_path():
    model = _fit_logistic_regression_for(CHAT_ID, "stroke")
    _run_model_adapter(CHAT_ID, "stroke", "classification", model)

    df = cleaned_data_cache[CHAT_ID]["df"]
    predict_local_single(CHAT_ID, id_column="age", id_value=str(df.iloc[0]["age"]))

    explanation = explain_shap_local_single(CHAT_ID)
    assert len(explanation) > 0
    for item in explanation:
        assert "feature" in item and "shap_value" in item
        assert isinstance(item["shap_value"], float)
