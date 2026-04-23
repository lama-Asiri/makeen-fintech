"""
Integration tests for /auth/* endpoints.
Uses the shared `client` fixture (mocked Supabase + OpenAI, no real network calls).
"""
import pytest


# ── Input validation (no auth needed — FastAPI rejects before handler) ────────

@pytest.mark.asyncio
async def test_signup_missing_body(client):
    r = await client.post("/auth/signup")
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_login_missing_body(client):
    r = await client.post("/auth/login")
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_forgot_password_missing_body(client):
    r = await client.post("/auth/forgot-password")
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_rename_chat_missing_body(client):
    r = await client.patch("/auth/renameChat")
    assert r.status_code == 422


# ── Auth required (401 when no Authorization header) ─────────────────────────

@pytest.mark.asyncio
async def test_profile_requires_auth(client):
    r = await client.get("/auth/user/profile")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_update_profile_requires_auth(client):
    r = await client.put("/auth/user/profile", json={"username": "new"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_add_chat_requires_auth(client):
    r = await client.post("/auth/addChat", json={"Title": "Chat 1"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_view_history_requires_auth(client):
    r = await client.get("/auth/viewHistory")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_rename_chat_requires_auth(client):
    r = await client.patch("/auth/renameChat", json={"chat_id": 1, "new_title": "X"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_delete_chat_requires_auth(client):
    r = await client.delete("/auth/deleteChat?chat_id=1")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_delete_all_chats_requires_auth(client):
    r = await client.delete("/auth/deleteAllChats")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_parse_requires_auth(client):
    r = await client.post("/auth/parse", json={"chat_id": 1})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_get_messages_requires_auth(client):
    r = await client.get("/auth/getMessages/1")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_save_message_requires_auth(client):
    r = await client.post("/auth/saveMessage", json={
        "chat_id": 1, "query_text": "q", "answer": "a"
    })
    assert r.status_code == 401


# ── Invalid token ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_invalid_token_rejected(client, mock_supabase):
    mock_supabase.auth.get_user.side_effect = Exception("invalid JWT")
    r = await client.get("/auth/user/profile",
                         headers={"Authorization": "Bearer bad-token"})
    assert r.status_code == 401


# ── addRating validation ──────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_add_rating_requires_auth(client):
    # addRating wraps everything in try/except → auth errors surface as 400
    r = await client.post("/auth/addRating", params={"response_type": "Good", "response_id": 1})
    assert r.status_code == 400
    assert "unauthorized" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_add_rating_invalid_type_rejected(client, auth_header):
    r = await client.post("/auth/addRating",
                          params={"response_type": "Invalid", "response_id": 1},
                          headers=auth_header)
    assert r.status_code == 400
    assert "response_type" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_add_rating_bad_without_category_rejected(client, auth_header):
    r = await client.post("/auth/addRating",
                          params={"response_type": "Bad", "response_id": 1},
                          headers=auth_header)
    assert r.status_code == 400
    assert "category" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_add_rating_bad_with_invalid_category_rejected(client, auth_header):
    r = await client.post("/auth/addRating",
                          params={"response_type": "Bad", "response_id": 1,
                                  "category": "Made up category"},
                          headers=auth_header)
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_add_rating_other_without_comment_rejected(client, auth_header):
    r = await client.post("/auth/addRating",
                          params={"response_type": "Bad", "response_id": 1,
                                  "category": "Other"},
                          headers=auth_header)
    assert r.status_code == 400
    assert "comment" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_add_rating_good_succeeds(client, auth_header, mock_supabase):
    from unittest.mock import MagicMock
    mock_supabase.table.return_value.upsert.return_value.execute.return_value = MagicMock(
        data=[{"Score": "Good", "RESPONSE_ID": 1}]
    )
    r = await client.post("/auth/addRating",
                          params={"response_type": "Good", "response_id": 1},
                          headers=auth_header)
    assert r.status_code == 200
    assert r.json()["message"] == "Rating added successfully"


@pytest.mark.asyncio
async def test_add_rating_bad_with_valid_category_succeeds(client, auth_header, mock_supabase):
    from unittest.mock import MagicMock
    mock_supabase.table.return_value.upsert.return_value.execute.return_value = MagicMock(
        data=[{"Score": "Bad", "category": "Style or tone", "RESPONSE_ID": 1}]
    )
    r = await client.post("/auth/addRating",
                          params={"response_type": "Bad", "response_id": 1,
                                  "category": "Style or tone"},
                          headers=auth_header)
    assert r.status_code == 200


# ── reportBug validation ──────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_report_bug_requires_auth(client):
    # reportBug wraps everything in try/except → auth errors surface as 400
    r = await client.post("/auth/reportBug",
                          params={"category": "Bug / Crash", "comment": "it crashed"})
    assert r.status_code == 400
    assert "unauthorized" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_report_bug_invalid_category_rejected(client, auth_header):
    r = await client.post("/auth/reportBug",
                          params={"category": "Not a real category", "comment": "details"},
                          headers=auth_header)
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_report_bug_empty_comment_rejected(client, auth_header):
    r = await client.post("/auth/reportBug",
                          params={"category": "Bug / Crash", "comment": "   "},
                          headers=auth_header)
    assert r.status_code == 400
    assert "comment" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_report_bug_valid_succeeds(client, auth_header, mock_supabase):
    from unittest.mock import MagicMock
    mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(
        data=[{"categoty": "Bug / Crash", "comment": "it crashed", "USER_ID": "test-user-id"}]
    )
    r = await client.post("/auth/reportBug",
                          params={"category": "Bug / Crash", "comment": "it crashed"},
                          headers=auth_header)
    assert r.status_code == 200
    assert r.json()["message"] == "Bug reported successfully"


# ── upload file validation ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_upload_requires_auth(client):
    r = await client.post("/auth/upload",
                          files={"file": ("data.csv", b"a,b\n1,2", "text/csv")},
                          data={"chat_id": "1"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_upload_rejects_non_csv_xlsx(client, auth_header):
    r = await client.post("/auth/upload",
                          files={"file": ("report.txt", b"hello", "text/plain")},
                          data={"chat_id": "1"},
                          headers=auth_header)
    assert r.status_code == 400
    assert "CSV or XLSX" in r.json()["detail"]


@pytest.mark.asyncio
async def test_upload_rejects_oversized_file(client, auth_header):
    big = b"x" * (10 * 1024 * 1024 + 1)  # 10 MB + 1 byte
    r = await client.post("/auth/upload",
                          files={"file": ("data.csv", big, "text/csv")},
                          data={"chat_id": "1"},
                          headers=auth_header)
    assert r.status_code == 400
    assert "10 MB" in r.json()["detail"]
