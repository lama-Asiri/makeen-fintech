from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth
from routers import llm
from routers import data_processor
from routers import test_data_processor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://192.168.0.101:5173",  # local network — for mobile testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(llm.router)
app.include_router(data_processor.router)
app.include_router(test_data_processor.router)