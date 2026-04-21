from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth
from routers import data_processor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://makeen-topaz.vercel.app",
        "http://localhost:5173",
        "http://localhost:4173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(data_processor.router)
