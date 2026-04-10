<div align="center">

<br/>

```
███╗   ███╗ █████╗ ██╗  ██╗
████╗ ████║██╔══██╗╚██╗██╔╝
██╔████╔██║███████║ ╚███╔╝
██║╚██╔╝██║██╔══██║ ██╔██╗
██║ ╚═╝ ██║██║  ██║██╔╝ ██╗
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
```

**Multi-Agent eXecutor**

*Run AI. Own it. No cloud. No cost.*

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev)
[![Stars](https://img.shields.io/github/stars/YOUR_USERNAME/max?style=social)](https://github.com/YOUR_USERNAME/max)

</div>

---

## What is MAX?

MAX is a **fully local, autonomous AI agent** that runs on your machine with zero cloud dependency.

- 🧠 **Autonomous agent loop** — MAX thinks, uses tools, and iterates until the task is done
- 💻 **Runs anywhere** — works on CPU-only machines, no GPU required
- 🔒 **Fully private** — your data never leaves your computer
- 🆓 **Zero cost** — Ollama for offline use, Groq free tier as optional turbo mode
- ✨ **Beautiful UI** — glassmorphic dark interface with real-time tool visualization

---

## Demo

> *MAX writing and executing a Python script, reading files, and remembering context — all locally.*

```
User: analyze my project folder and write a summary to summary.txt

MAX: 🧠 Thinking...
     ⚙️ shell_command → ls -la /home/user/project
     ↳ main.py  utils.py  README.md  data/...
     📖 read_file → /home/user/project/main.py
     ↳ [file contents]
     ✏️ write_file → summary.txt
     ↳ ✅ Written to summary.txt

Done! I analyzed your project and created summary.txt with:
- 3 Python files (main.py, utils.py, tests.py)
- A data pipeline with SQLite storage
- Full documentation in README.md
```

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/max
cd max
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
export GROQ_API_KEY="your_key_here"   # optional, but faster
uvicorn main:app --reload
```

> No Groq key? Install [Ollama](https://ollama.ai) and run `ollama pull llama3`. MAX auto-detects it.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** and you're running MAX. ✅

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     MAX AGENT LOOP                   │
│                                                      │
│  User Input → [THINK] → [ACT] → [OBSERVE] → repeat  │
│                  ↓          ↓                        │
│              LLM Call    Tools:                      │
│           (Groq/Ollama)  • execute_code              │
│                          • read_file / write_file    │
│                          • shell_command             │
│                          • remember / recall         │
└─────────────────────────────────────────────────────┘

Backend  →  FastAPI + SQLite memory
Frontend →  React + Vite (glassmorphic UI)
Inference → Groq (cloud, free) → Ollama (local) fallback
```

---

## Tools

| Tool | Description |
|------|-------------|
| `execute_code` | Run Python in a sandboxed subprocess |
| `read_file` | Read any local file |
| `write_file` | Write content to disk |
| `shell_command` | Safe shell execution (ls, git, pip...) |
| `remember` | Persist key-value to SQLite memory |
| `recall` | Retrieve from long-term memory |

---

## Configuration

```bash
# .env
GROQ_API_KEY=gsk_...          # Optional (free at console.groq.com)
OLLAMA_BASE_URL=http://localhost:11434   # Ollama endpoint
MAX_MODEL=llama3-8b-8192      # Groq model
MAX_DB=max_memory.db          # SQLite path
```

---

## Hardware

MAX was designed to run on **real-world hardware**, including:

- ✅ Laptops without GPU
- ✅ 8GB RAM machines
- ✅ Intel i5/i7 from 2014+
- ✅ Ubuntu, macOS, Windows (WSL)

Tested on a **Lenovo ThinkPad X250 (i5-5300U, 8GB RAM, CPU-only)**.

---

## Roadmap

- [ ] Web search tool (DuckDuckGo + Brave)
- [ ] Telegram bot interface
- [ ] Voice input (Whisper local)
- [ ] Multi-agent mode (specialized sub-agents)
- [ ] Plugin system
- [ ] Docker compose deploy
- [ ] Electron desktop app

---

## Contributing

PRs are welcome. Keep it local-first and dependency-light.

```bash
git checkout -b feature/my-tool
# add your tool in backend/main.py under TOOLS_SCHEMA + dispatch_tool()
git commit -m "feat: add my-tool"
git push origin feature/my-tool
```

---

## License

MIT — do whatever you want with it.

---
by Hope

<div align="center">

Built by a solo developer on a ThinkPad with no GPU.

*If this helped you, star it.* ⭐

</div>
