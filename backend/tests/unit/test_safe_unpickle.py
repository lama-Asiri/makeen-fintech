"""
Unit tests for core/safe_unpickle.py — the restricted unpickling used for
user-uploaded "bring your own model" pickles.
"""
import io
import os
import pickle
import subprocess

import numpy as np
import pytest
from sklearn.linear_model import LogisticRegression

from core.safe_unpickle import safe_load_model, validate_uploaded_model


def _pickle_bytes(obj) -> bytes:
    buf = io.BytesIO()
    pickle.dump(obj, buf)
    return buf.getvalue()


# ── Legitimate sklearn objects round-trip through the allowlist ──────────────

def test_round_trips_fitted_logistic_regression():
    X = np.array([[0, 0], [1, 1], [2, 2], [3, 3]])
    y = np.array([0, 0, 1, 1])
    model = LogisticRegression().fit(X, y)

    loaded = safe_load_model(_pickle_bytes(model))

    assert isinstance(loaded, LogisticRegression)
    assert list(loaded.predict(X)) == list(model.predict(X))


def test_round_trips_numpy_array():
    arr = np.array([1.0, 2.0, 3.0])
    loaded = safe_load_model(_pickle_bytes(arr))
    assert np.array_equal(loaded, arr)


# ── Malicious payloads are rejected, not executed ─────────────────────────────

MARKER_PATH = os.path.join(os.path.dirname(__file__), "_safe_unpickle_pwned_marker.txt")


class _EvilReduceOSSystem:
    def __reduce__(self):
        return (os.system, (f'echo pwned > "{MARKER_PATH}"',))


class _EvilReduceSubprocess:
    def __reduce__(self):
        return (subprocess.Popen, (["python", "-c", f"open(r'{MARKER_PATH}','w').write('pwned')"],))


class _EvilReduceEval:
    def __reduce__(self):
        return (eval, (f"open(r'{MARKER_PATH}','w').write('pwned')",))


@pytest.mark.parametrize("evil_cls", [_EvilReduceOSSystem, _EvilReduceSubprocess, _EvilReduceEval])
def test_rejects_malicious_reduce_payloads(evil_cls):
    # MARKER_PATH only ever gets written if find_class() failed to block the reference
    # and the reduce call actually executed — its absence is the proof the restricted
    # unpickler stopped this before pickle could invoke anything.
    if os.path.exists(MARKER_PATH):
        os.remove(MARKER_PATH)
    payload = _pickle_bytes(evil_cls())

    with pytest.raises(ValueError, match="Refusing to unpickle|could not be loaded safely"):
        safe_load_model(payload)

    assert not os.path.exists(MARKER_PATH)
    if os.path.exists(MARKER_PATH):
        os.remove(MARKER_PATH)


def test_plain_dict_and_list_pickles_load_but_are_not_models():
    # Plain builtins are technically allowlisted (dict/list/tuple/etc. are needed for
    # sklearn's own pickling), so these load fine at the unpickler layer —
    # validate_uploaded_model is what actually rejects "not a model", not find_class.
    assert safe_load_model(_pickle_bytes({"not": "a model"})) == {"not": "a model"}
    assert safe_load_model(_pickle_bytes([1, 2, 3])) == [1, 2, 3]


def test_rejects_malformed_pickle_bytes():
    with pytest.raises(ValueError):
        safe_load_model(b"this is not a pickle file at all")


# ── validate_uploaded_model ────────────────────────────────────────────────────

def test_validate_rejects_object_without_predict():
    with pytest.raises(ValueError, match="predict"):
        validate_uploaded_model({"not": "a model"}, sample_row_df=None)


def test_validate_accepts_fitted_model_and_smoke_tests_it():
    import pandas as pd
    X = pd.DataFrame({"a": [0, 1, 2, 3], "b": [0, 1, 2, 3]})
    y = np.array([0, 0, 1, 1])
    model = LogisticRegression().fit(X, y)

    validate_uploaded_model(model, X.iloc[[0]])  # should not raise


def test_validate_rejects_schema_mismatch():
    import pandas as pd
    X = pd.DataFrame({"a": [0, 1, 2, 3], "b": [0, 1, 2, 3]})
    y = np.array([0, 0, 1, 1])
    model = LogisticRegression().fit(X, y)

    wrong_shape_row = pd.DataFrame({"only_one_column": [1]})
    with pytest.raises(ValueError, match="schema mismatch"):
        validate_uploaded_model(model, wrong_shape_row)
