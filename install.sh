#!/bin/bash

echo "Installing Max..."

pip install -r requirements.txt -q

if ! command -v ollama &> /dev/null; then
    echo "Ollama not found. Install from: https://ollama.com"
    exit 1
fi

echo "Starting Max API..."
python backend/main.py &
PID=$!

sleep 2

if curl -s http://127.0.0.1:8000/ > /dev/null; then
    echo "Max is running at http://127.0.0.1:8000"
    open index.html || echo "Open index.html in your browser"
else
    echo "Failed to start API"
    exit 1
fi