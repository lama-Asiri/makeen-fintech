from database.connection import engine
from sqlalchemy import text

# Step 1: Check if user exists
with engine.connect() as conn:
    result = conn.execute(text("SELECT * FROM \"User\""))  # wrap SQL in text()
    user = result.fetchone()

if not user:
    print("Empty")
else:
    print("User exists:", user)