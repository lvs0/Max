#!/bin/bash
# MAX — one-command launcher

set -e

echo ""
echo "  ███╗   ███╗ █████╗ ██╗  ██╗"
echo "  ████╗ ████║██╔══██╗╚██╗██╔╝"
echo "  ██╔████╔██║███████║ ╚███╔╝ "
echo "  ██║╚██╔╝██║██╔══██║ ██╔██╗ "
echo "  ██║ ╚═╝ ██║██║  ██║██╔╝ ██╗"
echo "  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝"
echo ""
echo "  Multi-Agent eXecutor — v1.0.0"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Install it first."
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install it first."
    exit 1
fi

# Install backend deps if needed
if [ ! -d "backend/__pycache__" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r backend/requirements.txt --quiet
fi

# Install frontend deps if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing Node dependencies..."
    cd frontend && npm install --silent && cd ..
fi

echo "🚀 Starting MAX backend on :8000..."
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

sleep 2

echo "🎨 Starting MAX frontend on :3000..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ MAX is running!"
echo "   → UI:  http://localhost:3000"
echo "   → API: http://localhost:8000"
echo ""
echo "   Press Ctrl+C to stop."
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo 'MAX stopped.'" EXIT

wait
