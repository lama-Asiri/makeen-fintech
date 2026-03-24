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

# -----------------------------
# TEST: delete a chat
# -----------------------------

chat_id_to_delete = 3

with engine.connect() as conn:
    delete_result = conn.execute(
        text("""
            DELETE FROM "Chat"
            WHERE "CHAT_ID" = :chat_id
            AND "USER_ID" = :user_id
            RETURNING "CHAT_ID", "Title"
        """),
        {"chat_id": chat_id_to_delete, "user_id": user.USER_ID}
    )
    deleted_chat = delete_result.fetchone()  # fetch **once**
    conn.commit()

# Use the result immediately, don’t call fetchone again
if deleted_chat is not None:
    print(f"Deleted chat: {deleted_chat}")
else:
    print("No chat was deleted (maybe it didn't exist or didn't belong to the user).")