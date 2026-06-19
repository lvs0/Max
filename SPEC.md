# Max Dashboard — Specification

## 1. Concept & Vision

Max is a fully local, autonomous AI assistant with a glassmorphic JARVIS-like dashboard. Runs offline with Ollama, stores memory in SQLite, works entirely on your machine.

## 2. Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                    MAX                             │
├─────────────────────────────────────────────────────┤
│  Frontend: index.html (single file)                    │
│  - Glassmorphic UI                                │
│  - Chat interface                                │
│  - Tasks & System Stats                          │
├─────────────────────────────────────────────────────┤
│  Backend: FastAPI (Python)                        │
│  - /chat        → Ollama inference               │
│  - /tasks      → SQLite CRUD                   │
│  - /stats     → psutil monitoring              │
│  - /memory    → conversation history         │
├─────────────────────────────────────────────────────┤
│  Storage: SQLite (~/.max/memory.db)              │
│  - conversations table                         │
│  - tasks table                              │
│  - system table                             │
├─────────────────────────────────────────────────────┤
│  AI: Ollama (qwen3:8b default)                 │
│  - Fully local inference                       │
│  - No cloud, no API keys                    │
└─────────────────────────────────────────────────────┘
```

## 3. UI/UX Specification

**Colors:**
- Background: `#050510`
- Glass: `rgba(255,255,255,0.06)`
- Orb Idle: `#00F5F5` (cyan)
- Orb Speaking: `#FFD700` (gold)

**Layout:** Three-column (sidebar 280px | main flex | sidebar 280px)

**Fonts:**
- Primary: Syne
- Mono: Space Mono

## 4. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Health check |
| POST | /chat | Send message to AI |
| GET | /tasks | List tasks |
| POST | /tasks | Create task |
| PUT | /tasks/{id} | Update task |
| DELETE | /tasks/{id} | Delete task |
| GET | /stats | System stats |
| GET | /models | Available Ollama models |
| GET | /memory | Conversation history |
| DELETE | /memory | Clear history |

## 5. Files

```
Max/
├── index.html       # Dashboard UI
├── backend/
│   └── main.py    # FastAPI backend
├── requirements.txt
├── install.sh
├── README.md
└── SPEC.md
```

## 6. Installation

```bash
pip install -r requirements.txt
ollama serve
python backend/main.py
# Open index.html
```

## 7. Dependencies

- fastapi>=0.100.0
- uvicorn>=0.23.0
- ollama>=0.1.0
- psutil>=5.9.0
- pydantic>=2.0.0