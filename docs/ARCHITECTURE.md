# MAX Architecture

## Overview

MAX (Multi-Agent eXecutor) is a fully autonomous local AI agent with a glassmorphic web interface.

## System Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                            │
│  ┌──────────┐  ┌────────────────┐  ┌────────────────────────┐  │
│  │  Sidebar │  │   Main Chat    │  │  Right Panel           │  │
│  │ Sessions │  │   + Orb        │  │  Tasks / Calendar      │  │
│  └──────────┘  └────────────────┘  └────────────────────────┘  │
│                         │                                        │
│                    React + Vite                                 │
└─────────────────────────┼────────────────────────────────────────┘
                          │ HTTP/WebSocket
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                        BACKEND API                               │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────────┐  │
│  │  /chat      │  │  /tasks     │  │  /agents              │  │
│  │  /sessions  │  │  /calendar  │  │  /browse              │  │
│  └─────────────┘  └─────────────┘  └────────────────────────┘  │
│                         │                                        │
│                    FastAPI + SQLite                              │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                      INFERENCE LAYER                            │
│  ┌─────────────────────┐       ┌─────────────────────────────┐  │
│  │      Groq API       │       │        Ollama              │  │
│  │  (cloud, optional)  │       │  (local, recommended)      │  │
│  └─────────────────────┘       └─────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## Components

### Frontend (React + Vite)

| Component | Description |
|-----------|-------------|
| `App.jsx` | Main application with state management |
| `Orb` | Canvas-based animated orb with particles |
| `Sidebar` | Session management |
| `AgentPanel` | Plan & sub-agents visualization |
| `RightPanel` | Tasks & calendar |
| `Terminal` | Real-time command output |
| `VoiceInput` | Web Speech API integration |

### Backend (FastAPI)

| Endpoint | Method | Description |
|----------|---------|-------------|
| `/chat/stream` | POST | Streaming agent responses |
| `/sessions` | GET | List all sessions |
| `/history/{id}` | GET | Get session history |
| `/tasks` | GET/POST | Task management |
| `/agents` | GET | List sub-agents |
| `/calendar` | GET/POST | Calendar events |
| `/browse` | GET | File system browser |
| `/health` | GET | System status |

### Database Schema (SQLite)

```sql
-- Sessions
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    title TEXT,
    created_at TEXT,
    last_active TEXT
);

-- Messages
CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    session_id TEXT,
    role TEXT,
    content TEXT,
    timestamp TEXT
);

-- Tasks
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    title TEXT,
    done INTEGER DEFAULT 0,
    due TEXT,
    session_id TEXT
);

-- Sub-Agents
CREATE TABLE sub_agents (
    id TEXT PRIMARY KEY,
    name TEXT,
    emoji TEXT,
    status TEXT,
    active INTEGER DEFAULT 0
);

-- Calendar
CREATE TABLE calendar (
    id INTEGER PRIMARY KEY,
    title TEXT,
    date TEXT,
    time TEXT
);

-- Memory
CREATE TABLE memories (
    id INTEGER PRIMARY KEY,
    key TEXT UNIQUE,
    value TEXT,
    updated_at TEXT
);
```

## Agent Loop

```
User Input
    │
    ▼
┌─────────────┐
│  THINK     │ ← LLM analyzes request
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  PLAN      │ ← Determine tools needed
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  ACT       │ ← Execute tools
│  • execute_code
│  • read_file
│  • write_file
│  • shell_command
│  • remember/recall
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  OBSERVE   │ ← Get tool results
└──────┬──────┘
       │
       ▼
   Loop back or finish
```

## Security

- All inference can run locally via Ollama
- Groq is optional and requires API key
- No data leaves the machine by default
- Shell commands are sandboxed (blocked patterns)
- File access is user-controlled

## Performance

- CPU-only operation supported
- Minimum 4GB RAM
- Tested on 10-year-old hardware
- Streaming responses for UX
- SQLite for fast local storage
