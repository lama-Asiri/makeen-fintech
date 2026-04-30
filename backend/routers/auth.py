from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form
import numpy as np
from pydantic import BaseModel
import os
import io
import pandas as pd
from core.supabase_client import supabase, SUPABASE_SERVICE_KEY

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://makeen-topaz.vercel.app")

router = APIRouter(prefix="/auth")

# holds cleaned data after /parse runs
cleaned_data_cache = {}

# holds trained models after /train runs
trained_models = {}

# holds the last prediction result per chat — used by LIME and SHAP to explain without re-predicting.
prediction_cache: dict = {}

# holds the last 3 Q&A pairs per chat for fast follow-up resolution.
chat_history_cache: dict[int, list[dict]] = {}

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
    if result.user.identities is not None and len(result.user.identities) == 0:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
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
    # Reset to service role before get_user — guards against a prior request leaving
    # the shared postgrest client in user-token context under concurrent load.
    supabase.postgrest.auth(SUPABASE_SERVICE_KEY)
    try:
        user = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    # Reset again after get_user() — the SDK may flip auth context to the user token.
    supabase.postgrest.auth(SUPABASE_SERVICE_KEY)
    return str(user.user.id)


@router.get("/user/profile")
async def get_profile(authorization: str = Header(None)):
    user_id = _get_user_id(authorization)
    try:
        result = supabase.table("User").select("username, avatar_url").eq("USER_ID", user_id).execute()
    except Exception as e:
        print(f"[PROFILE GET ERROR] user_id={user_id} error={str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    # Return empty profile if no row exists yet (e.g. new Google OAuth user)
    if not result.data:
        return {"username": None, "avatar_url": None}
    return result.data[0]


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
            options={"redirect_to": FRONTEND_URL}
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
    # validate file size — reject anything over 10 MB before uploading.
    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10 MB limit")
    
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
            .select("*, File(name, filetype, target_column)") \
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
        # Changed: capture the insert result so we can return RESPONSE_ID.
        # RESPONSE_ID is needed by /addRating so the frontend can link a rating to a specific response.
        response_result = supabase.table("Response").insert({
            "answer": body.answer,
            "explanation": body.explanation,
            "QUERY_ID": query_id,
        }).execute()
        response_id = response_result.data[0]["RESPONSE_ID"]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to save response: {str(e)}")

    # Changed: added RESPONSE_ID to the return value.
    # The frontend stores this on the message so the thumbs up/down buttons can send it to /addRating.
    return {"message": "Message saved", "QUERY_ID": query_id, "RESPONSE_ID": response_id}


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
        # Added RESPONSE_ID to the join so the frontend can restore backendResponseId
        # on each message after login — needed for thumbs up/down ratings to work after refresh
        queries = supabase.table("Query") \
            .select("*, Response(RESPONSE_ID, answer, explanation, created_at)") \
            .eq("CHAT_ID", chat_id) \
            .order("created_at", desc=False) \
            .execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch messages: {str(e)}")

    return {"messages": queries.data}

# ─────────────────────────────────────────────────────────────────────────────
# Shared cleaning helper — used by /parse and by the auto-recovery in
# data_processor.py so both always apply identical transformations.
# ─────────────────────────────────────────────────────────────────────────────

def _clean_dataframe(file_bytes: bytes, file_type: str) -> tuple[pd.DataFrame, list[str]]:
    """
    Load raw file bytes into a cleaned DataFrame.
    Returns (df, id_columns).
    Raises HTTPException on empty file or parse failure.
    """
    try:
        if file_type == "csv":
            df = pd.read_csv(io.BytesIO(file_bytes))
        else:
            df = pd.read_excel(io.BytesIO(file_bytes))
        if df.empty:
            raise HTTPException(status_code=400, detail="File is empty")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File parse failed: {e}")

    # standardize column names
    def _clean_col(col):
        col = str(col).strip().replace(" ", "_").replace("-", "_")
        col = "".join(c if c.isalnum() or c == "_" else "" for c in col)
        while "__" in col:
            col = col.replace("__", "_")
        return col

    df.columns = [_clean_col(c) for c in df.columns]

    # detect ID columns — kept in df, excluded only when feeding the ML model
    id_patterns = {'id', 'user_id', 'customer_id', 'transaction_id', 'index', 'uid', 'pk'}
    id_columns = [c for c in df.columns
                  if c.lower() in id_patterns or c.lower().endswith(('_id', 'id'))]

    df = df.drop_duplicates(keep='first')
    df = df.dropna(axis=1, thresh=len(df) * 0.4)

    for col in df.select_dtypes(include=['object', 'str']).columns:
        df[col] = df[col].astype(str).str.strip()

    for col in df.select_dtypes(include=['object', 'str']).columns:
        if col in id_columns:
            continue
        try:
            numeric_version = pd.to_numeric(df[col], errors='coerce')
            if numeric_version.notna().sum() / len(numeric_version) > 0.9:
                df[col] = numeric_version
        except Exception:
            pass

    for col in df.columns:
        if col in id_columns:
            continue
        if df[col].isnull().any():
            if pd.api.types.is_numeric_dtype(df[col]):
                df[col] = df[col].fillna(df[col].median())
            else:
                mode_val = df[col].mode()[0] if len(df[col].mode()) > 0 else "UNKNOWN"
                df[col] = df[col].fillna(mode_val)

    # Convert datetime columns to Unix seconds (int) so RandomForest can use them
    for col in df.select_dtypes(include=['datetime64', 'datetimetz']).columns:
        try:
            df[col] = df[col].astype('int64') // 10 ** 9
        except Exception:
            df[col] = df[col].apply(lambda x: int(x.timestamp()) if pd.notna(x) else 0)

    return df, id_columns


# /parse — download the user's file, clean it, and cache it for the ML pipeline
class ParseRequest(BaseModel):
    chat_id: int

@router.post("/parse")
async def parse_file(body: ParseRequest, authorization: str = Header(None)):
    user_id = _get_user_id(authorization)
    chat_id = body.chat_id

    # 1. confirm this chat belongs to the requesting user
    try:
        chat_check = supabase.table("Chat") \
            .select("CHAT_ID") \
            .eq("CHAT_ID", chat_id) \
            .eq("USER_ID", user_id) \
            .single() \
            .execute()
        if not chat_check.data:
            raise HTTPException(status_code=404, detail="Chat not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Chat lookup failed: {e}")

    # 2. get the file path and type from the database
    try:
        file_result = supabase.table("File") \
            .select("path, filetype") \
            .eq("CHAT_ID", chat_id) \
            .maybe_single() \
            .execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File lookup failed: {e}")
    if not file_result or not file_result.data:
        raise HTTPException(status_code=404, detail="No file found for this chat")
    file_path = file_result.data["path"]
    file_type = file_result.data["filetype"]

    # 3. download from storage
    try:
        file_bytes = supabase.storage.from_("user-files").download(file_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File download failed: {e}")

    # 4. clean using shared helper
    df, id_columns = _clean_dataframe(file_bytes, file_type)

    # 5. cache cleaned data — target column and X/y are built later in /train
    cleaned_data_cache[chat_id] = {
        "df":         df,
        "id_columns": id_columns,
    }

    preview = df.head(5).fillna("").astype(str)
    return {
        "message":     "File parsed and ready",
        "rows":        len(df),
        "columns":     df.columns.tolist(),
        "id_columns":  id_columns,
        "preview_rows": preview.values.tolist(),
        "note":        "ID columns kept for row lookups; columns with >60% missing data removed",
    }

# Rating allowed categories
ALLOWED_CATEGORIES = [
    'Incorrect or incomplete',
    'Not what I asked for',
    'Slow or buggy',
    'Style or tone',
    'Safety or legal concern',
    'Other'
]

@router.post("/addRating")
async def add_rating(
    response_type: str,
    response_id: int,
    category: str = None,
    comment: str = None,
    authorization: str = Header(None)
):
    try:
        # Verify the user is logged in — rejects unauthenticated requests
        _get_user_id(authorization)

        # Normalize response_type
        response_type = response_type.capitalize()
        if response_type not in ['Good', 'Bad']:
            raise HTTPException(status_code=400, detail="response_type must be 'Good' or 'Bad'")

        # Logic for Good / Bad
        if response_type == 'Good':
            score_to_insert = 'Good'
            category_to_insert = None
            comment_to_insert = None
        else:  # Bad
            score_to_insert = 'Bad'
            if not category:
                raise HTTPException(status_code=400, detail="category is required for Bad responses")
            if category not in ALLOWED_CATEGORIES:
                raise HTTPException(status_code=400, detail=f"category must be one of {ALLOWED_CATEGORIES}")
            category_to_insert = category
            if category == 'Other' and not comment:
                raise HTTPException(status_code=400, detail="comment is required for 'Other' category")
            comment_to_insert = comment

        # Upsert instead of insert — if a rating already exists for this response,
        # update it. This ensures one rating per response (user's latest opinion),
        # not a new row every time they change their mind.
        # Requires a UNIQUE constraint on RESPONSE_ID in the Rating table.
        response = supabase.table("Rating").upsert({
            "Score": score_to_insert,
            "Comment": comment_to_insert,
            "category": category_to_insert,
            "RESPONSE_ID": response_id
        }, on_conflict="RESPONSE_ID").execute()

        return {
            "message": "Rating added successfully",
            "rating": response.data[0]
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

ALLOWED_BUG_CATEGORIES = [
    "Bug / Crash",
    "UI issue",
    "Performance",
    "Feature request",
    "Wrong answer",
    "Other"
]

@router.post("/reportBug")
async def report_bug(
    category: str,
    comment: str,
    authorization: str = Header(None)
):
    try:
        # Get user ID from token (you already have this helper)
        user_id = _get_user_id(authorization)

        # Validate category
        if category not in ALLOWED_BUG_CATEGORIES:
            raise HTTPException(
                status_code=400,
                detail=f"category must be one of {ALLOWED_BUG_CATEGORIES}"
            )

        # Comment is REQUIRED for all cases
        if not comment or comment.strip() == "":
            raise HTTPException(
                status_code=400,
                detail="comment is required for all bug reports"
            )

        # Insert into Supabase
        response = supabase.table("Bug").insert({
            "categoty": category,   # keep as your DB column name
            "comment": comment,
            "USER_ID": user_id
        }).execute()

        # Fixed: Supabase Python client doesn't expose .status_code — check .data instead
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to insert bug report")

        return {
            "message": "Bug reported successfully",
            "bug": response.data[0]
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
