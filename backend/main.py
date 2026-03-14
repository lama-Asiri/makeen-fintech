from database.connection import engine
from sqlalchemy import text
from PythonClasses.Account import Account
import os

# --- CONFIG ---
USERNAME_TO_CHECK = "testUser"   # replace with the username you want to check
CSV_FILE_PATH = "uploads/TestFile.csv"          # path to your CSV file
BUCKET_NAME = "user-files"           # your public Supabase bucket

# Step 1: Check if user exists
with engine.connect() as conn:
    result = conn.execute(
        text("SELECT * FROM \"User\" WHERE username = :username"),
        {"username": USERNAME_TO_CHECK}
    )
    user = result.fetchone()
if not user:
    print("Empty")
else:
    print("User exists:", user)

# --- STEP 2: Upload CSV file ---
if not CSV_FILE_PATH.lower().endswith(".csv"):
    print("Error: Only CSV files are allowed.")
elif not os.path.exists(CSV_FILE_PATH):
    print("Error: File does not exist.")
else:
    account = Account(email="test@gmail.com", password="123456", username=USERNAME_TO_CHECK)
    with open(CSV_FILE_PATH, "rb") as f:
        success, result = account.uploadFile(f)
        if success:
            print("CSV uploaded successfully:", result)
        else:
            print("Upload failed:", result)    