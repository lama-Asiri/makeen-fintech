from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form
from pydantic import BaseModel
import os
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

    # 5. Upload file to Supabase storage
    try:
        supabase.storage.from_("user-files").upload(path, file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")

    # 6. Save metadata in the database
    try:
        supabase.table("File").insert({
            "name": filename,
            "filetype": file_type,
            "path": path,
            "CHAT_ID": chat_id
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"DB insert failed: {str(e)}")

    return {
        "message": "Uploaded",
    }

@router.post("/addChat")
async def add_chat(
    authorization: str = Header(None),
    Title: str = "New Chat"
):
    # 1. Get user ID
    user_id = _get_user_id(authorization)

    # 2. Count existing chats
    try:
        count_result = supabase.table("Chat") \
            .select("CHAT_ID", count="exact") \
            .eq("USER_ID", user_id) \
            .execute()
        chat_count = count_result.count or 0
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to count chats: {str(e)}")

    # 3. Limit to 3 chats
    if chat_count >= 3:
        raise HTTPException(status_code=400, detail="You cannot have more than 3 chats")

    # 4. Insert new chat
    try:
        result = supabase.table("Chat").insert({
            "USER_ID": user_id,
            "Title": Title
        }).execute()

        chat = result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Chat creation failed: {str(e)}")

    # 5. Return chat info
    return {
        "message": "Chat created",
        "CHAT_ID": chat["CHAT_ID"],
        "Title": chat["Title"]
    }

    