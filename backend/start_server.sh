#!/bin/bash

# Dealio Backend Startup Script
# This script handles the directory path spaces issue

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMP_DIR="/tmp/dealio_backend_$$"

echo "Starting Dealio Backend Server..."

# Create temporary directory
mkdir -p "$TEMP_DIR"

# Copy necessary files to temp directory  
cp "$SCRIPT_DIR/main.py" "$TEMP_DIR/"

# Activate virtual environment and start server
cd "$TEMP_DIR"
source "$SCRIPT_DIR/venv/bin/activate"

echo "Server starting on http://localhost:8000"
echo "Health check: curl http://localhost:8000/health"
echo "API docs: http://localhost:8000/docs"
echo "Press Ctrl+C to stop the server"

python main.py 