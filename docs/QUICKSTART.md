# MAX Quick Start Guide

## Prerequisites

- Python 3.11+
- Node.js 18+ (optional, frontend can use pre-built files)
- Ollama (recommended) or Groq API key (optional)

## Installation

### Option 1: One-Command Install

```bash
git clone https://github.com/lvs0/Max && cd Max && ./install.sh
```

### Option 2: Manual Install

```bash
# Clone
git clone https://github.com/lvs0/Max && cd Max

# Backend
cd backend
pip install -r requirements.txt

# Frontend (optional)
cd ../frontend && npm install
```

## Running MAX

### Start Ollama (Recommended)

```bash
ollama pull llama3
ollama serve
```

### Run MAX

```bash
./start.sh
```

This will:
1. Check Python and Node.js
2. Setup virtual environment
3. Install dependencies
4. Start backend on port 8000
5. Start frontend on port 3000
6. Open browser (if supported)

### Access MAX

- **Web UI:** http://localhost:3000
- **API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## Configuration

Edit `backend/.env`:

```bash
# Groq API (optional - faster inference)
GROQ_API_KEY=gsk_...

# Ollama (local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# MAX settings
MAX_MODEL=llama3
MAX_DB=max_memory.db
```

## First Conversation

1. Open http://localhost:3000
2. Type in the chat: "Hello, what's your name?"
3. MAX will respond

## Example Tasks

### Write and Run Code

```
You: Write a Python script to calculate fibonacci numbers
MAX: [generates code and runs it]
```

### Manage Files

```
You: Create a file called notes.txt with today's date
MAX: [creates the file]
```

### Remember Information

```
You: Remember my name is Lévy
MAX: ✓ Stored: name

You: What's my name?
MAX: Your name is Lévy
```

### Run Shell Commands

```
You: Run `ls -la` in my home directory
MAX: [shows directory contents]
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
./start.sh logs

# Check port
lsof -i :8000
```

### Frontend won't load

```bash
# Check if running
curl http://localhost:3000

# Rebuild
cd frontend && npm run build
```

### Ollama not working

```bash
# Check if running
ollama list

# Pull model
ollama pull llama3

# Test
ollama run llama3
```

## Uninstall

```bash
# Stop services
./start.sh stop

# Remove files
cd .. && rm -rf Max
```
