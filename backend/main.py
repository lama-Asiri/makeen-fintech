from database.connection import engine
from sqlalchemy import text
from PythonClasses.Account import Account

# --- CONFIG ---
USERNAME_TO_CHECK = "existing_user"   # replace with the username you want to check
CSV_FILE_PATH = "uploads/TestFile.csv"          # path to your CSV file
BUCKET_NAME = "user-files"           # your public Supabase bucket

# Step 1: Check if user exists
with engine.connect() as conn:
    result = conn.execute(text("SELECT * FROM \"User\""))  # wrap SQL in text()
    user = result.fetchone()

if not user:
    print("Empty")
else:
    print("User exists:", user)