"""
Unit tests for _build_llm_user_message — the LLM context builder in data_processor.py.
No external calls; pure function.
"""
import json
import pytest
import pandas as pd
from routers.data_processor import _build_llm_user_message


# ── Question included ─────────────────────────────────────────────────────────

def test_question_appears_in_message():
    result = {"type": "DATA_QUERY", "raw_result": "42"}
    msg = _build_llm_user_message("How many rows?", result, None)
    assert "How many rows?" in msg


def test_result_type_appears_in_message():
    result = {"type": "PREDICTION"}
    msg = _build_llm_user_message("q", result, None)
    assert "PREDICTION" in msg


# ── raw_result truncation ─────────────────────────────────────────────────────

def test_long_raw_result_truncated():
    long_str = "x" * 3000
    result = {"type": "DATA_QUERY", "raw_result": long_str}
    msg = _build_llm_user_message("q", result, None)
    # Context block is JSON — parse it back out
    context_json = msg.split("Context:\n")[1].split("\n\nDataset summary:")[0].strip()
    context = json.loads(context_json)
    assert len(context["raw_result"]) <= 2030  # 2000 chars + "... (truncated)"
    assert "truncated" in context["raw_result"]


def test_short_raw_result_not_truncated():
    result = {"type": "DATA_QUERY", "raw_result": "42"}
    msg = _build_llm_user_message("q", result, None)
    assert "42" in msg


# ── Array capping at MAX_ROWS = 20 ────────────────────────────────────────────

def test_shap_values_capped_at_20():
    shap_values = [{"feature": f"f{i}", "shap_value": 0.1} for i in range(50)]
    result = {"type": "PREDICTION", "shap_values": shap_values}
    msg = _build_llm_user_message("q", result, None)
    context_json = msg.split("Context:\n")[1].split("\n\nDataset summary:")[0].strip()
    context = json.loads(context_json)
    assert len(context["shap_values"]) == 20


def test_lime_values_capped_at_20():
    lime_values = [{"feature": f"f{i}", "impact": 0.1} for i in range(40)]
    result = {"type": "PREDICTION", "lime_values": lime_values}
    msg = _build_llm_user_message("q", result, None)
    context_json = msg.split("Context:\n")[1].split("\n\nDataset summary:")[0].strip()
    context = json.loads(context_json)
    assert len(context["lime_values"]) == 20


def test_results_capped_at_20():
    results = [{"id_value": str(i), "prediction": "0"} for i in range(100)]
    result = {"type": "PREDICTION", "results": results}
    msg = _build_llm_user_message("q", result, None)
    context_json = msg.split("Context:\n")[1].split("\n\nDataset summary:")[0].strip()
    context = json.loads(context_json)
    assert len(context["results"]) == 20


# ── Dataset stats ─────────────────────────────────────────────────────────────

def test_none_df_produces_empty_stats():
    result = {"type": "DATA_QUERY", "raw_result": "5"}
    msg = _build_llm_user_message("q", result, None)
    assert "Dataset summary:" in msg
    # Empty stats when df is None
    assert "rows" not in msg.split("Dataset summary:")[1].split("Sample data:")[0]


def test_df_row_count_appears_in_message(sample_df):
    result = {"type": "DATA_QUERY", "raw_result": "5"}
    msg = _build_llm_user_message("q", result, sample_df)
    assert "10 rows" in msg  # sample_df has 10 rows


def test_df_column_count_appears_in_message(sample_df):
    result = {"type": "DATA_QUERY", "raw_result": "5"}
    msg = _build_llm_user_message("q", result, sample_df)
    assert "5 columns" in msg  # sample_df has 5 columns


def test_sample_data_included_when_df_provided(sample_df):
    result = {"type": "DATA_QUERY", "raw_result": "5"}
    msg = _build_llm_user_message("q", result, sample_df)
    # The sample rows should include at least one column name
    assert "age" in msg.split("Sample data:")[1]
