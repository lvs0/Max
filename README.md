# Max — Local AI Assistant

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat&logo=github" alt="Version">
  <img src="https://img.shields.io/badge/platform-Linux%20%7C%20macOS-purple?style=flat&logo=linux" alt="Platform">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat" alt="License">
</p>

Max is a fully local, autonomous AI assistant with a glassmorphic dashboard interface. It runs offline with Ollama, stores memory in SQLite, and works entirely on your machine.

![Max Dashboard](https://via.placeholder.com/800x450/050510/00F5F5?text=Max+Dashboard)

## Features

- **Fully Local** — Runs with Ollama (no cloud, no API keys)
- **Persistent Memory** — SQLite stores conversations and tasks
- **Glassmorphic UI** — Futuristic JARVIS-like dashboard
- **System Stats** — Real-time CPU, Memory, Disk monitoring
- **Task Management** — Create and track tasks locally
- **Offline First** — Works without internet

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Start Ollama (if not running)
ollama serve

# Start Max API
python backend/main.py &

# Open the dashboard
open index.html
```

Or use the install script:

```bash
bash install.sh
```

## Requirements

- Python 3.10+
- [Ollama](https://ollama.com) installed
- Works on Linux/macOS

## Configuration

Edit `backend/main.py` to change:
- Default model: `qwen3:8b` (line 67)
- API port: `8000` (line 138)
- Database path: `~/.max/memory.db`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|------------|
| `/` | GET | Health check |
| `/chat` | POST | Send message to AI |
| `/tasks` | GET/POST | List or add tasks |
| `/stats` | GET | System statistics |
| `/memory` | GET | Conversation history |

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS
- **Backend**: FastAPI + SQLite
- **AI**: Ollama (qwen3:8b default)
- **Design**: Glassmorphism with Syne + Space Mono fonts

## License

MIT — Built by Lévy for local AI freedom.