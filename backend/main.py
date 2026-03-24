from database.connection import engine
from sqlalchemy import text
import os
from fastapi import UploadFile
from routers.auth import upload_file  # adjust import path

USERNAME = "testUser"

# check user
with engine.connect() as conn:
    result = conn.execute(
        text("SELECT * FROM \"User\" WHERE username = :username"),
        {"username": USERNAME}
    )
    user = result.fetchone()

if not user:
    print("User not found")
    exit()

print("User exists:", user)

# -----------------------------
# TEST: add chat
# -----------------------------
with engine.connect() as conn:
    # 1. insert new chat
    insert_result = conn.execute(
        text("""
            INSERT INTO "Chat" ("USER_ID", "Title")
            VALUES (:user_id, :Title)
            RETURNING "CHAT_ID", "USER_ID", "Title"
        """),
        {
            "user_id": user.USER_ID,   # make sure this matches your column name
            "Title": "Test Chat from main3"
        }
    )

    chat = insert_result.fetchone()
    conn.commit()

print("Created chat:", chat)

# -----------------------------
# VERIFY: fetch it back
# -----------------------------
with engine.connect() as conn:
    verify_result = conn.execute(
        text("""
            SELECT * FROM "Chat"
            WHERE "CHAT_ID" = :chat_id
        """),
        {"chat_id": chat.CHAT_ID}
    )

    fetched_chat = verify_result.fetchone()

print("Fetched from DB:", fetched_chat)

# -----------------------------
# TEST: view all chats for this user
# -----------------------------
with engine.connect() as conn:
    history_result = conn.execute(
        text("""
            SELECT * FROM "Chat"
            WHERE "USER_ID" = :user_id
            ORDER BY "Created_at" DESC
        """),
        {"user_id": user.USER_ID}
    )

    all_chats = history_result.fetchall()

print(f"All chats for {USERNAME}:")
for c in all_chats:
    print(c)
