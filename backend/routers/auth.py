from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form
from pydantic import BaseModel
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, r2_score, mean_squared_error
import numpy as np
import os
import io
import pandas as pd
from core.supabase_client import supabase, SUPABASE_SERVICE_KEY

router = APIRouter(prefix="/auth")

# holds cleaned data after /parse runs
# lets /predict reuse it without re-downloading and re-cleaning the file on every request.
cleaned_data_cache = {}

# holds trained models after /train runs
# lets /predict and /explain reuse the model without re-training.
trained_models = {}

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


class UpdateFileColumnRequest(BaseModel):
    chat_id: int       # used to find the File row (CHAT_ID is unique in File table)
    target_column: str # the column the user picked for AI analysis


@router.patch("/updateFileColumn")
async def update_file_column(body: UpdateFileColumnRequest, authorization: str = Header(None)):
    # Verify token and confirm the chat belongs to this user before updating
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

    # Save the selected target column to the File row for this chat
    try:
        supabase.table("File") \
            .update({"target_column": body.target_column}) \
            .eq("CHAT_ID", body.chat_id) \
            .execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to save target column: {str(e)}")

    return {"message": "Target column saved", "target_column": body.target_column}


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

# /parse — download the user's file, clean it, and prepare it for the ML model 
class ParseRequest(BaseModel):
    chat_id: int
    target_column: str
 
 
@router.post("/parse")
async def parse_file(body: ParseRequest, authorization: str = Header(None)):
    user_id = _get_user_id(authorization)
    chat_id = body.chat_id
    target_column = body.target_column
 
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
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Chat lookup failed: {e}")
 
    # 2. get the file path and type from the database
    try:
        file_result = supabase.table("File") \
            .select("path, filetype") \
            .eq("CHAT_ID", chat_id) \
            .single() \
            .execute()
        if not file_result.data:
            raise HTTPException(status_code=404, detail="No file found for this chat")
        file_path = file_result.data["path"]
        file_type = file_result.data["filetype"]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File lookup failed: {e}")
 
    # 3. download from storage and load into a dataframe
    try:
        file_bytes = supabase.storage.from_("user-files").download(file_path)
        if file_type == "csv":
            df = pd.read_csv(io.BytesIO(file_bytes))
        else:
            df = pd.read_excel(io.BytesIO(file_bytes))
 
        if df.empty:
            raise HTTPException(status_code=400, detail="File is empty")
        if target_column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Target column '{target_column}' not found in file")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File parse failed: {e}")
 
    # 4. standardize column names
    def clean_column_name(col):
        col = str(col).strip()
        col = col.replace(" ", "_")
        col = col.replace("-", "_")
        col = "".join(c if c.isalnum() or c == "_" else "" for c in col)
        while "__" in col:
            col = col.replace("__", "_")
        return col
    
    df.columns = [clean_column_name(col) for col in df.columns]
    # update target_column to match cleaned name
    target_column = clean_column_name(target_column)
 
    # 5. drop ID columns
    id_patterns = ['id', 'user_id', 'customer_id', 'transaction_id', 'index', 'uid', 'pk']
    cols_to_drop = [col for col in df.columns 
                    if col.lower() in id_patterns or col.lower().endswith('_id')]
    if cols_to_drop:
        df = df.drop(columns=cols_to_drop)
 
    # 6. remove duplicate rows
    df = df.drop_duplicates(keep='first')
 
    # 7. drop columns where more than 60% of values are missing
    df = df.dropna(axis=1, thresh=len(df) * 0.4)
 
    # 8. strip leading/trailing whitespace from text columns
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].astype(str).str.strip()
 
    # 9. convert text columns that are actually numbers
    #     only converts if 90%+ of the column's values are valid numbers.
    for col in df.select_dtypes(include=['object']).columns:
        try:
            numeric_version = pd.to_numeric(df[col], errors='coerce')
            if numeric_version.notna().sum() / len(numeric_version) > 0.9:
                df[col] = numeric_version
        except Exception:
            pass
 
    # 10. fill remaining empty cells: numbers get the median, text gets the most common value
    for col in df.columns:
        if df[col].isnull().any():
            if pd.api.types.is_numeric_dtype(df[col]):
                df[col].fillna(df[col].median(), inplace=True)
            else:
                mode_val = df[col].mode()[0] if len(df[col].mode()) > 0 else "UNKNOWN"
                df[col].fillna(mode_val, inplace=True)

    # 11. split into inputs (X) and the thing we want to predict (y)
    X = df.drop(columns=[target_column])
    y = df[target_column]
 
    if y.nunique() < 2:
        raise HTTPException(status_code=400, detail="Target column must have at least 2 unique values")
 
    # 12. cache cleaned raw data
    cleaned_data_cache[chat_id] = {
        "X": X,
        "y": y,
        "target_column": target_column,
        "feature_names": X.columns.tolist()
    }
 
    # 13. return summary with cleaning details
    return {
        "message": "File parsed and ready",
        "rows": len(df),
        "features": len(X.columns),
        "task": "classification" if y.dtype == 'object' or y.nunique() <= 10 else "regression",
        "target_column": target_column,
        "target_sample": y.value_counts().head(3).to_dict(),
        "columns_dropped": cols_to_drop if cols_to_drop else [],
        "note": "ID columns and columns with >60% missing data removed"
    }

class TrainRequest(BaseModel):
    chat_id: int

@router.post("/train")
async def train_model(body: TrainRequest, authorization: str = Header(None)):
    user_id = _get_user_id(authorization)
    chat_id = body.chat_id
    
    # 1. verify chat ownership
    try:
        chat_check = supabase.table("Chat") \
            .select("CHAT_ID") \
            .eq("CHAT_ID", chat_id) \
            .eq("USER_ID", user_id) \
            .single() \
            .execute()
        if not chat_check.data:
            raise HTTPException(status_code=404, detail="Chat not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Chat lookup failed: {e}")
    
    # 2. check if /parse was run
    if chat_id not in cleaned_data_cache:
        raise HTTPException(status_code=400, detail="Must call /parse first to clean the file")
    
    # 3. get cleaned data from cache
    cache = cleaned_data_cache[chat_id]
    X = cache["X"].copy()
    y = cache["y"].copy()
    feature_names_original = cache["feature_names"]
    target_column = cache["target_column"]
    task_type = "classification" if (y.dtype == 'object' or y.nunique() <= 10) else "regression"
    
    # 4. encode categorical features in X — convert text to numbers
    encoders = {}
    for col in X.select_dtypes(include=['object']).columns:
        unique_values = X[col].nunique()
        if unique_values == 2:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            encoders[col] = {"type": "label", "encoder": le}
        elif unique_values <= 10:
            X = pd.get_dummies(X, columns=[col], prefix=col, drop_first=True)
            encoders[col] = {"type": "one_hot"}
        else:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            encoders[col] = {"type": "label", "encoder": le}
    
    # 5. convert boolean columns to integers
    bool_cols = X.select_dtypes(include=['bool']).columns
    X[bool_cols] = X[bool_cols].astype(int)
    
    # 6. update feature names after encoding (one-hot may add columns)
    feature_names = X.columns.tolist()
    
    # 7. encode target (y) if categorical
    le_target = None
    class_labels = None
    if task_type == "classification":
        le_target = LabelEncoder()
        y_encoded = le_target.fit_transform(y.astype(str))
        class_labels = le_target.classes_.tolist()
    else:
        y_encoded = y.astype(float).values
    
    # 8. split into train/test (80/20)
    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Data split failed: {e}")
    
    # 9. train the model
    try:
        if task_type == "classification":
            model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1, max_depth=15)
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            score = accuracy_score(y_test, y_pred)
            metric_name = "accuracy"
        else:
            model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1, max_depth=15)
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            score = r2_score(y_test, y_pred)
            metric_name = "r2_score"
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Model training failed: {e}")
    
    # 10. get feature importances (top 5)
    importances = model.feature_importances_
    top_features = sorted(
        zip(feature_names, importances),
        key=lambda x: x[1],
        reverse=True
    )[:5]
    
    # 11. store model in memory for /predict and /explain
    trained_models[chat_id] = {
        "model": model,
        "X_train": X_train,
        "feature_names": feature_names,
        "feature_names_original": feature_names_original,
        "target_column": target_column,
        "task_type": task_type,
        "class_labels": class_labels,
        "le_target": le_target,
        "encoders": encoders
    }
    
    # 12. return training summary
    if task_type == "classification":
        return {
            "message": "Model trained successfully",
            "task_type": task_type,
            "accuracy": round(score, 4),
            "top_features": [{"name": name, "importance": round(imp, 4)} for name, imp in top_features]
        }
    else:
        return {
            "message": "Model trained successfully",
            "task_type": task_type,
            "r2_score": round(score, 4),
            "top_features": [{"name": name, "importance": round(imp, 4)} for name, imp in top_features]
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
    authorization: str = Header(None)  # keep this in signature but ignore it
):
    try:
        # TEMPORARILY ignore JWT for testing
        # supabase.auth.set_session({"access_token": token})  <-- remove or comment out

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

        # Insert into Supabase
        response = supabase.table("Rating").insert({
            "Score": score_to_insert,
            "Comment": comment_to_insert,
            "category": category_to_insert,
            "RESPONSE_ID": response_id
        }).execute()

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

        if response.status_code != 201:
            raise HTTPException(status_code=400, detail=response.data)

        return {
            "message": "Bug reported successfully",
            "bug": response.data[0]
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
