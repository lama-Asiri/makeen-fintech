from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form
from pydantic import BaseModel
import os
import io
import pandas as pd
from core.supabase_client import supabase, SUPABASE_SERVICE_KEY

router = APIRouter(prefix="/auth")


class SignUpRequest(BaseModel):
    email: str
    password: str
    username: str
    full_name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    access_token: str
    refresh_token: str
    new_password: str


@router.post("/signup")
async def signup(body: SignUpRequest):
    try:
        result = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {
                "data": {
                    "username": body.username,
                    "full_name": body.full_name,
                }
            }
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    if result.user is None:
        raise HTTPException(status_code=400, detail="Signup failed.")
    return {"message": "Account created! Check your email to verify before signing in."}


@router.post("/login")
async def login(body: LoginRequest):
    try:
        result = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password,
        })
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if not result.user.email_confirmed_at:
        raise HTTPException(status_code=403, detail="Please verify your email before signing in.")
    return {
        "access_token": result.session.access_token,
        "refresh_token": result.session.refresh_token,
    }


class UpdateProfileRequest(BaseModel):
    username: str
    avatar_url: str | None = None


def _get_user_id(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[1]
    try:
        user = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    # Reset PostgREST to service role — get_user() may switch auth context to user token
    supabase.postgrest.auth(SUPABASE_SERVICE_KEY)
    return str(user.user.id)


@router.get("/user/profile")
async def get_profile(authorization: str = Header(None)):
    user_id = _get_user_id(authorization)
    try:
        result = supabase.table("User").select("username, avatar_url").eq("USER_ID", user_id).single().execute()
    except Exception as e:
        print(f"[PROFILE GET ERROR] user_id={user_id} error={str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    return result.data


@router.put("/user/profile")
async def update_profile(body: UpdateProfileRequest, authorization: str = Header(None)):
    user_id = _get_user_id(authorization)
    update_data: dict = {"username": body.username}
    if body.avatar_url is not None:
        update_data["avatar_url"] = body.avatar_url
    try:
        supabase.table("User").update(update_data).eq("USER_ID", user_id).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Profile updated"}


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    try:
        supabase.auth.reset_password_email(
            body.email,
            options={"redirect_to": "http://localhost:5173"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Password reset email sent."}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest):
    try:
        supabase.auth.set_session(body.access_token, body.refresh_token)
        supabase.auth.update_user({"password": body.new_password})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Password reset successful."}

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    authorization: str = Header(None),
    chat_id: int = Form(...)
):
    # 1. Get user ID from auth token
    user_id = _get_user_id(authorization)

    # 2. Get username from database
    try:
        result = supabase.table("User") \
            .select("username") \
            .eq("USER_ID", user_id) \
            .single() \
            .execute()
        username = result.data["username"]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get username: {str(e)}")

    # 3. Get file name and validate type
    filename = os.path.basename(file.filename)
    if not filename.lower().endswith((".csv", ".xlsx")):
        raise HTTPException(status_code=400, detail="Only CSV or XLSX allowed")
    
    file_type = "xlsx" if filename.lower().endswith(".xlsx") else "csv"

    # 4. Set storage path
    path = f"{username}/{filename}"

    # 5. Read file bytes — Supabase storage requires bytes, not a SpooledTemporaryFile object.
    file_bytes = await file.read()

    # 6. Upload to Supabase storage.
    # upsert=True overwrites if the same path already exists (e.g. user re-uploads same filename).
    try:
        supabase.storage.from_("user-files").upload(path, file_bytes, file_options={"upsert": "true"})
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")

    # 7. Parse the file with pandas to extract column names for the frontend dropdown.
    # We reuse the bytes already read — no second read needed.
    try:
        if file_type == "csv":
            df = pd.read_csv(io.BytesIO(file_bytes))
        else:
            df = pd.read_excel(io.BytesIO(file_bytes))
        columns = df.columns.tolist()
    except Exception:
        columns = []  # non-fatal — frontend falls back gracefully if empty

    # 8. Save metadata in the database.
    # on_conflict="CHAT_ID" upserts so re-uploading a file for the same chat updates the row instead of failing.
    try:
        supabase.table("File").upsert({
            "name": filename,
            "filetype": file_type,
            "path": path,
            "CHAT_ID": chat_id
        }, on_conflict="CHAT_ID").execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"DB insert failed: {str(e)}")

    return {
        "message": "Uploaded",
        "columns": columns,   # list of column names for the target column picker
    }

class AddChatRequest(BaseModel):
    # Title sent as JSON body from the frontend (e.g. "Chat 1", "Chat 2", "Chat 3")
    Title: str = "New Chat"


@router.post("/addChat")
async def add_chat(
    body: AddChatRequest,
    authorization: str = Header(None),
):
    # Verify the token and extract the user's UUID from Supabase auth
    user_id = _get_user_id(authorization)

    # Count how many chats this user already has.
    # We enforce a max of 3 chats per user (project requirement).
    try:
        count_result = supabase.table("Chat") \
            .select("CHAT_ID", count="exact") \
            .eq("USER_ID", user_id) \
            .execute()
        chat_count = count_result.count or 0
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to count chats: {str(e)}")

    # Block creation if limit is already reached
    if chat_count >= 3:
        raise HTTPException(status_code=400, detail="You cannot have more than 3 chats")

    # Insert the new chat row — Supabase auto-generates CHAT_ID
    try:
        result = supabase.table("Chat").insert({
            "USER_ID": user_id,
            "Title": body.Title   # read from JSON body, not query param
        }).execute()
        chat = result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Chat creation failed: {str(e)}")

    # Return the CHAT_ID so the frontend can store it for future delete/rename calls
    return {
        "message": "Chat created",
        "CHAT_ID": chat["CHAT_ID"],
        "Title": chat["Title"]
    }


@router.get("/viewHistory")
async def view_history(authorization: str = Header(None)):
    # Verify token and get user ID
    user_id = _get_user_id(authorization)

    # Fetch all chats for this user, newest first.
    # Include File join so the frontend can restore the file chip after logout/login
    # without relying on localStorage (which is cleared on logout).
    try:
        result = supabase.table("Chat") \
            .select("*, File(name, filetype)") \
            .eq("USER_ID", user_id) \
            .order("Created_at", desc=True) \
            .execute()
        chats = result.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch chats: {str(e)}")

    return {
        "message": "User chat history",
        "chats": chats
    }


class RenameChatRequest(BaseModel):
    chat_id: int
    new_title: str


@router.patch("/renameChat")
async def rename_chat(body: RenameChatRequest, authorization: str = Header(None)):
    # Verify token and get user ID
    user_id = _get_user_id(authorization)

    # Confirm the chat belongs to this user before updating.
    # Without this check any logged-in user could rename someone else's chat.
    try:
        check = supabase.table("Chat") \
            .select("CHAT_ID") \
            .eq("CHAT_ID", body.chat_id) \
            .eq("USER_ID", user_id) \
            .single() \
            .execute()
        if not check.data:
            raise HTTPException(status_code=404, detail="Chat not found or does not belong to this user")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ownership check failed: {str(e)}")

    # Update the title
    try:
        supabase.table("Chat") \
            .update({"Title": body.new_title}) \
            .eq("CHAT_ID", body.chat_id) \
            .eq("USER_ID", user_id) \
            .execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to rename chat: {str(e)}")

    return {"message": "Chat renamed", "CHAT_ID": body.chat_id, "Title": body.new_title}


@router.delete("/deleteChat")
async def delete_chat(chat_id: int, authorization: str = Header(None)):
    # Verify token and get user ID
    user_id = _get_user_id(authorization)

    # Check the chat belongs to this user before deleting.
    # Without this check, any logged-in user could delete someone else's chat
    # by guessing a CHAT_ID.
    try:
        check = supabase.table("Chat") \
            .select("CHAT_ID", "Title") \
            .eq("CHAT_ID", chat_id) \
            .eq("USER_ID", user_id) \
            .single() \
            .execute()
        if not check.data:
            raise HTTPException(
                status_code=404,
                detail="Chat not found or does not belong to this user"
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error verifying chat: {str(e)}")

    # Safe to delete — ownership confirmed above
    try:
        supabase.table("Chat") \
            .delete() \
            .eq("CHAT_ID", chat_id) \
            .eq("USER_ID", user_id) \
            .execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete chat: {str(e)}")

    return {
        "message": "Chat deleted successfully",
        "CHAT_ID": chat_id,
        "Title": check.data["Title"]
    }


@router.delete("/deleteAllChats")
async def delete_all_chats(authorization: str = Header(None)):
    # Verify token and get user ID
    user_id = _get_user_id(authorization)

    # Fetch existing chats first so we can return what was deleted.
    # Also acts as a check — if no chats exist we return 404 instead of silently doing nothing.
    try:
        chats_result = supabase.table("Chat") \
            .select("CHAT_ID", "Title") \
            .eq("USER_ID", user_id) \
            .execute()
        user_chats = chats_result.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch user chats: {str(e)}")

    if not user_chats:
        raise HTTPException(status_code=404, detail="No chats found to delete")

    # Delete all rows for this user in one query
    try:
        supabase.table("Chat") \
            .delete() \
            .eq("USER_ID", user_id) \
            .execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete chats: {str(e)}")

    return {
        "message": "All chats deleted successfully",
        "deleted_chats": user_chats
    }


class SaveMessageRequest(BaseModel):
    chat_id: int
    query_text: str    # the user's message
    answer: str        # the AI's response text
    explanation: str = ""  # optional extra explanation (used later by SHAP/LLM)


@router.post("/saveMessage")
async def save_message(body: SaveMessageRequest, authorization: str = Header(None)):
    # Verify ownership — ensure the chat belongs to this user before saving
    user_id = _get_user_id(authorization)
    try:
        check = supabase.table("Chat") \
            .select("CHAT_ID") \
            .eq("CHAT_ID", body.chat_id) \
            .eq("USER_ID", user_id) \
            .single() \
            .execute()
        if not check.data:
            raise HTTPException(status_code=404, detail="Chat not found or does not belong to this user")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ownership check failed: {str(e)}")

    # Save the user's message to the Query table
    try:
        query_result = supabase.table("Query").insert({
            "query_text": body.query_text,
            "CHAT_ID": body.chat_id,
        }).execute()
        query_id = query_result.data[0]["QUERY_ID"]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to save query: {str(e)}")

    # Save the AI response to the Response table, linked to the query above.
    # QUERY_ID must reference a real Query row — requires the schema fix:
    # ALTER TABLE public."Response" ALTER COLUMN "QUERY_ID" DROP IDENTITY;
    try:
        supabase.table("Response").insert({
            "answer": body.answer,
            "explanation": body.explanation,
            "QUERY_ID": query_id,
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to save response: {str(e)}")

    return {"message": "Message saved", "QUERY_ID": query_id}


@router.get("/getMessages/{chat_id}")
async def get_messages(chat_id: int, authorization: str = Header(None)):
    # Verify ownership before returning messages
    user_id = _get_user_id(authorization)
    try:
        check = supabase.table("Chat") \
            .select("CHAT_ID") \
            .eq("CHAT_ID", chat_id) \
            .eq("USER_ID", user_id) \
            .single() \
            .execute()
        if not check.data:
            raise HTTPException(status_code=404, detail="Chat not found or does not belong to this user")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ownership check failed: {str(e)}")

    # Fetch all queries for this chat, oldest first so messages appear in order
    try:
        queries = supabase.table("Query") \
            .select("*, Response(answer, explanation, created_at)") \
            .eq("CHAT_ID", chat_id) \
            .order("created_at", desc=False) \
            .execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch messages: {str(e)}")

    return {"messages": queries.data}
