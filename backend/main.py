from database.connection import engine
from sqlalchemy import text
from PythonClasses.Account import Account
import os

USERNAME = "testUser"
CSV_PATH = "uploads/TestFile.csv"

# check user
with engine.connect() as conn:
    result = conn.execute(
        text("SELECT * FROM \"User\" WHERE username = :username"),
        {"username": USERNAME}
    )
    user = result.fetchone()

if not user:
    print("User not found")
    exit()

print("User exists:", user)

# check file
if not os.path.exists(CSV_PATH):
    print("CSV file not found")
    exit()

if not CSV_PATH.lower().endswith(".csv"):
    print("Only CSV files allowed")
    exit()

# upload
account = Account("test@gmail.com", "Makeen@1234", USERNAME)

with open(CSV_PATH, "rb") as file:
    success, result = account.uploadFile(file)

print("Success:", success)
print("Result:", result)