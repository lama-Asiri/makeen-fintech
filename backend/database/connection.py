
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL is None:
    raise Exception("DATABASE_URL not found. Check your .env file.")

# Create engine
engine = create_engine(DATABASE_URL)

# Test connection
try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("Connected successfully:", result.scalar())
except Exception as e:
    print("Connection failed:", e)