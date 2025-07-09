#!/bin/bash

# Backend Startup Script for Local Development
# This script starts the FastAPI backend on localhost:8000

echo "🚀 Starting Dealio Backend for Local Development..."

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating one..."
    python3 -m venv venv
    echo "✅ Virtual environment created."
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
fi

# Start the server
echo "🎸 Starting FastAPI server on http://localhost:8000"
echo "📊 API docs will be available at http://localhost:8000/docs"
echo "💾 Health check: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 