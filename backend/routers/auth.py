from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.supabase_client import supabase

router = APIRouter(prefix="/auth")


class SignUpRequest(BaseModel):
    email: str
    password: str
    username: str
    full_name: str


class LoginRequest(BaseModel):
    email: str
    password: str


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
