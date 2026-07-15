import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth
from routers import data_processor
from routers import dashboard
from routers import report 

app = FastAPI()

# FRONTEND_URL is set in Railway's Variables tab and should match whatever
# domain is under Vercel's "Domains" section (the stable one, not a
# deployment-specific *-xxxx.vercel.app URL) — update it there, not here,
# whenever the frontend's domain changes.
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://makeen-fintech.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:4173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(data_processor.router)
app.include_router(dashboard.router)
app.include_router(report.router)
