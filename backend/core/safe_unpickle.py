"""
Restricted pickle loading for user-uploaded pretrained models ("bring your own model").

SECURITY MODEL — read before touching this file.

`pickle.load()` on untrusted bytes can execute arbitrary code: a crafted pickle can
reference any importable callable via its `__reduce__` protocol (e.g. `os.system`,
`subprocess.Popen`, `builtins.eval`), and pickle will call it during deserialization.

Mitigation used here: `RestrictedUnpickler` overrides `find_class()` to only allow
importing classes/functions from an allowlist of ML-library module prefixes
(`sklearn.`, `numpy.`, `scipy.`) plus the small set of builtins/machinery that
numpy and sklearn's own pickling routes through. Everything else — `os`,
`subprocess`, `builtins.eval`/`exec`, arbitrary third-party modules — is rejected
before it can be instantiated.

Residual risk: this reduces but does not eliminate risk. A sufficiently creative
gadget chain built entirely out of allowlisted modules is theoretically possible
(restricted-unpickling is a well-known, standard mitigation for this scenario, not
a airtight sandbox). Loading also happens in a subprocess with a wall-clock timeout
as defense in depth, so a malicious or broken pickle can't hang or crash the main
API process. Full isolation (a separate no-network/no-filesystem container) is
listed as roadmap, not implemented here — this is an accepted MVP tradeoff.
"""
import io
import pickle
import multiprocessing
import queue
from typing import Any

# Allowed by exact module + name (things that aren't simply "any name under this prefix").
_ALLOWED_EXACT: set[tuple[str, str]] = {
    ("builtins", "dict"),
    ("builtins", "list"),
    ("builtins", "tuple"),
    ("builtins", "set"),
    ("builtins", "frozenset"),
    ("collections", "OrderedDict"),
    ("copyreg", "_reconstructor"),
    ("copyreg", "__newobj__"),
}

# Allowed by module prefix — anything importable from these packages. Necessary because
# sklearn Pipeline/ColumnTransformer/estimator objects reference many internal
# submodules that can't practically be enumerated class-by-class up front.
_ALLOWED_MODULE_PREFIXES: tuple[str, ...] = (
    "sklearn.",
    "numpy.",
    "scipy.",
)
_ALLOWED_MODULES_EXACT: set[str] = {"numpy"}


class RestrictedUnpickler(pickle.Unpickler):
    def find_class(self, module: str, name: str):
        if (module, name) in _ALLOWED_EXACT:
            return super().find_class(module, name)
        if module in _ALLOWED_MODULES_EXACT:
            return super().find_class(module, name)
        if any(module == p.rstrip(".") or module.startswith(p) for p in _ALLOWED_MODULE_PREFIXES):
            return super().find_class(module, name)
        raise pickle.UnpicklingError(
            f"Refusing to unpickle disallowed reference: {module}.{name}"
        )


def _unpickle_worker(file_bytes: bytes, result_queue: "multiprocessing.Queue") -> None:
    print(f"[safe_unpickle] worker started, {len(file_bytes)} bytes, header={file_bytes[:16]!r}")
    try:
        obj = RestrictedUnpickler(io.BytesIO(file_bytes)).load()
        print(f"[safe_unpickle] worker loaded OK -> {type(obj).__name__}")
        result_queue.put(("ok", obj))
    except Exception as e:  # noqa: BLE001 — deliberately broad, we relay it as a load failure
        print(f"[safe_unpickle] worker failed: {type(e).__name__}: {e}")
        result_queue.put(("error", f"{type(e).__name__}: {e}"))


def safe_load_model(file_bytes: bytes, timeout_seconds: int = 15) -> Any:
    """
    Deserialize a user-uploaded pickle using the restricted allowlist above, inside a
    subprocess with a wall-clock timeout. Raises ValueError with a friendly message
    on any failure (disallowed reference, malformed pickle, or timeout) — callers
    should turn this into an HTTP 400, not a 500.
    """
    print(f"[safe_unpickle] safe_load_model called with {len(file_bytes)} bytes, "
          f"header={file_bytes[:16]!r}")
    ctx = multiprocessing.get_context("spawn")
    result_queue: multiprocessing.Queue = ctx.Queue()
    proc = ctx.Process(target=_unpickle_worker, args=(file_bytes, result_queue))
    proc.start()

    # Must read from the queue before/instead of proc.join() — a Queue.put() on the
    # child side blocks once the unpickled object is larger than the OS pipe buffer,
    # until someone drains it. join()ing first (the old code) means the parent never
    # reads while the child is stuck writing: a guaranteed deadlock for any realistically
    # sized model, resolved only by hitting this function's own timeout. Small test
    # objects never hit the buffer limit, which is why this went unnoticed.
    try:
        status, payload = result_queue.get(timeout=timeout_seconds)
    except queue.Empty:
        if proc.is_alive():
            print(f"[safe_unpickle] worker still alive after {timeout_seconds}s, terminating "
                  f"(pid={proc.pid})")
            proc.terminate()
            proc.join()
            raise ValueError(f"Model file took too long to load (>{timeout_seconds}s) — rejected.")
        print(f"[safe_unpickle] worker exited with no result, exitcode={proc.exitcode} "
              f"(pid={proc.pid}) — likely crashed before it could put() anything")
        proc.join()
        raise ValueError("Model file could not be loaded (process exited unexpectedly).")

    proc.join()
    print(f"[safe_unpickle] safe_load_model returning status={status}")
    if status == "error":
        raise ValueError(f"Model file could not be loaded safely: {payload}")
    return payload


def validate_uploaded_model(model: Any, sample_row_df) -> None:
    """
    Confirm the unpickled object is actually a usable fitted estimator, not just any
    object that happened to survive restricted unpickling (e.g. a plain dict/list).
    Raises ValueError with a friendly message on any failure.
    """
    if not hasattr(model, "predict") or not callable(getattr(model, "predict")):
        raise ValueError(
            f"Uploaded file did not contain a usable model — expected an object with "
            f"a `.predict()` method, got `{type(model).__name__}`."
        )
    try:
        model.predict(sample_row_df)
    except Exception as e:  # noqa: BLE001 — relayed as a friendly validation error
        raise ValueError(
            f"Uploaded model failed a smoke-test prediction on your data "
            f"(likely a feature-schema mismatch): {type(e).__name__}: {e}"
        )
