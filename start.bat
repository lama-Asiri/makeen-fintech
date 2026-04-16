@echo off
echo Starting Makeen...

start "Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate && uvicorn app:app --reload --host 0.0.0.0"

timeout /t 2 /nobreak >nul

start "Frontend" cmd /k "cd /d "%~dp0frontend" && npx vite --host"

echo Both servers started. Backend on :8000, Frontend on :5173
