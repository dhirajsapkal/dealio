@echo off

REM Backend Startup Script for Local Development (Windows)
REM This script starts the FastAPI backend on localhost:8000

echo 🚀 Starting Dealio Backend for Local Development...

REM Navigate to backend directory
cd backend

REM Check if virtual environment exists
if not exist "venv\" (
    echo ❌ Virtual environment not found. Creating one...
    python -m venv venv
    echo ✅ Virtual environment created.
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies if requirements.txt exists
if exist "requirements.txt" (
    echo 📦 Installing dependencies...
    pip install -r requirements.txt
)

REM Start the server
echo 🎸 Starting FastAPI server on http://localhost:8000
echo 📊 API docs will be available at http://localhost:8000/docs
echo 💾 Health check: http://localhost:8000/health
echo.
echo Press Ctrl+C to stop the server
echo ----------------------------------------

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 