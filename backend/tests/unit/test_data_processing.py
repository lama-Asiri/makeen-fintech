"""
Unit tests for _clean_dataframe — the shared cleaning helper in routers/auth.py.
"""
import io
import pytest
import pandas as pd
from fastapi import HTTPException
from routers.auth import _clean_dataframe


def _to_csv_bytes(df: pd.DataFrame) -> bytes:
    return df.to_csv(index=False).encode()


def _to_xlsx_bytes(df: pd.DataFrame) -> bytes:
    buf = io.BytesIO()
    df.to_excel(buf, index=False)
    return buf.getvalue()


# ── Happy path ────────────────────────────────────────────────────────────────

def test_returns_dataframe_and_id_columns(sample_df):
    df_out, id_cols = _clean_dataframe(_to_csv_bytes(sample_df), "csv")
    assert isinstance(df_out, pd.DataFrame)
    assert isinstance(id_cols, list)
    assert len(df_out) > 0


def test_expected_columns_present(sample_df):
    df_out, _ = _clean_dataframe(_to_csv_bytes(sample_df), "csv")
    for col in ["age", "bmi", "gender", "hypertension", "stroke"]:
        assert col in df_out.columns


# ── Column name cleaning ──────────────────────────────────────────────────────

def test_spaces_converted_to_underscores():
    df = pd.DataFrame({"first name": ["a", "b"], "stroke": [0, 1]})
    df_out, _ = _clean_dataframe(_to_csv_bytes(df), "csv")
    assert "first_name" in df_out.columns
    assert "first name" not in df_out.columns


def test_hyphens_converted_to_underscores():
    df = pd.DataFrame({"last-name": ["x", "y"], "stroke": [0, 1]})
    df_out, _ = _clean_dataframe(_to_csv_bytes(df), "csv")
    assert "last_name" in df_out.columns


def test_double_underscores_collapsed():
    df = pd.DataFrame({"first  name": ["a", "b"], "stroke": [0, 1]})
    df_out, _ = _clean_dataframe(_to_csv_bytes(df), "csv")
    assert "first_name" in df_out.columns


# ── ID column detection ───────────────────────────────────────────────────────

def test_column_ending_with_id_detected():
    df = pd.DataFrame({"patient_id": [1, 2], "age": [30, 40], "stroke": [0, 1]})
    _, id_cols = _clean_dataframe(_to_csv_bytes(df), "csv")
    assert "patient_id" in id_cols


def test_plain_id_column_detected():
    df = pd.DataFrame({"id": [1, 2], "age": [30, 40], "stroke": [0, 1]})
    _, id_cols = _clean_dataframe(_to_csv_bytes(df), "csv")
    assert "id" in id_cols


def test_non_id_column_not_flagged(sample_df):
    _, id_cols = _clean_dataframe(_to_csv_bytes(sample_df), "csv")
    assert "age" not in id_cols
    assert "stroke" not in id_cols


# ── Duplicate removal ─────────────────────────────────────────────────────────

def test_duplicate_rows_removed():
    df = pd.DataFrame({"age": [25, 25, 30], "stroke": [0, 0, 1]})
    df_out, _ = _clean_dataframe(_to_csv_bytes(df), "csv")
    assert len(df_out) == 2


# ── Null handling ─────────────────────────────────────────────────────────────

def test_numeric_nulls_filled():
    df = pd.DataFrame({"age": [10.0, None, 30.0], "stroke": [0, 1, 0]})
    df_out, _ = _clean_dataframe(_to_csv_bytes(df), "csv")
    assert df_out["age"].isnull().sum() == 0


def test_categorical_nulls_filled():
    df = pd.DataFrame({"gender": ["Male", None, "Male"], "stroke": [0, 1, 0]})
    df_out, _ = _clean_dataframe(_to_csv_bytes(df), "csv")
    assert df_out["gender"].isnull().sum() == 0


# ── Error cases ───────────────────────────────────────────────────────────────

def test_empty_csv_raises_400():
    empty_df = pd.DataFrame()
    with pytest.raises(HTTPException) as exc:
        _clean_dataframe(_to_csv_bytes(empty_df), "csv")
    assert exc.value.status_code == 400


def test_invalid_bytes_raise_400():
    with pytest.raises(HTTPException) as exc:
        _clean_dataframe(b"not a valid csv or xlsx file !!!", "csv")
    # Either parse fails or empty — both should be 400
    assert exc.value.status_code == 400


# ── XLSX support ──────────────────────────────────────────────────────────────

def test_xlsx_parsed_correctly(sample_df):
    df_out, _ = _clean_dataframe(_to_xlsx_bytes(sample_df), "xlsx")
    assert "age" in df_out.columns
    assert len(df_out) == len(sample_df)


# ── High-null column dropping ─────────────────────────────────────────────────

def test_column_with_over_60pct_nulls_dropped():
    # thresh = len(df) * 0.4 = 10 * 0.4 = 4 non-null required to survive.
    # sparse_col has only 1 non-null → dropped.
    df = pd.DataFrame({
        "age":        list(range(10)),
        "sparse_col": [None] * 9 + [1.0],
        "stroke":     [0, 1] * 5,
    })
    df_out, _ = _clean_dataframe(_to_csv_bytes(df), "csv")
    assert "sparse_col" not in df_out.columns
    assert "age" in df_out.columns


def test_column_with_under_60pct_nulls_kept():
    # 3 nulls out of 10 → 70% non-null → above the 40% threshold → kept.
    df = pd.DataFrame({
        "age":   list(range(10)),
        "score": [1.0, 2.0, None, 4.0, 5.0, 6.0, 7.0, None, 9.0, None],
        "stroke": [0, 1] * 5,
    })
    df_out, _ = _clean_dataframe(_to_csv_bytes(df), "csv")
    assert "score" in df_out.columns


# ── Numeric string conversion ─────────────────────────────────────────────────

def test_numeric_string_column_converted_to_float():
    # All values are numeric strings → >90% parseable → column becomes float.
    df = pd.DataFrame({
        "score":  ["1.5", "2.0", "3.5", "4.0", "5.5"],
        "stroke": [0, 1, 0, 1, 0],
    })
    df_out, _ = _clean_dataframe(_to_csv_bytes(df), "csv")
    assert pd.api.types.is_numeric_dtype(df_out["score"])


def test_mixed_string_column_stays_as_text():
    # Mixed values — fewer than 90% are numeric → column stays as text.
    df = pd.DataFrame({
        "label":  ["yes", "no", "maybe", "yes", "no"],
        "stroke": [0, 1, 0, 1, 0],
    })
    df_out, _ = _clean_dataframe(_to_csv_bytes(df), "csv")
    assert not pd.api.types.is_numeric_dtype(df_out["label"])
