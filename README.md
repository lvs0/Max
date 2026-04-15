<div align="center">

<br/>

<p align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%">
</p>

```
    ███╗   ███╗ █████╗ ██╗  ██╗
    ████╗ ████║██╔══██╗╚██╗██╔╝
    ██╔████╔██║███████║ ╚███╔╝
    ██║╚██╔╝██║██╔══██║ ██╔██╗
    ██║ ╚═╝ ██║██║  ██║██╔╝ ██╗
    ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
```

# **MAX** — Multi-Agent eXecutor

### *Run AI. Own it. No cloud. No cost.*

<p align="center">
  <a href="https://github.com/lvs0/max/stargazers"><img src="https://img.shields.io/github/stars/lvs0/max?style=social" alt="Stars"></a>
  <a href="https://github.com/lvs0/max/network/members"><img src="https://img.shields.io/github/forks/lvs0/max?style=social" alt="Forks"></a>
  <img src="https://img.shields.io/badge/Python-3.11+-blue.svg" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-0.115-green.svg" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-18-61dafb.svg" alt="React">
  <a href="https://github.com/lvs0/max/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-teal.svg" alt="License"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/OS-Linux-cyan?style=flat-square&logo=linux" alt="Linux">
  <img src="https://img.shields.io/badge/CPU-Only-orange?style=flat-square" alt="CPU Only">
  <img src="https://img.shields.io/badge/GPU-Not Required-red?style=flat-square" alt="No GPU">
  <img src="https://img.shields.io/badge/Privacy-100%25-blueviolet?style=flat-square" alt="Privacy">
</p>

<p align="center">
  <b>⭐ 100% local AI agent. Your data never leaves your machine.</b>
</p>

</div>

---

## 💡 What is MAX?

MAX is a **fully autonomous AI agent** that runs entirely on YOUR hardware. No cloud. No subscriptions. No data harvesting.

- 🧠 **Autonomous agent loop** — MAX thinks, uses tools, and iterates until the task is complete
- 💻 **Runs on CPU** — no GPU required, designed for real hardware
- 🔒 **100% private** — your data stays on your machine, always
- 🆓 **Zero cost** — uses Ollama (free) or Groq's free tier
- ✨ **Beautiful UI** — glassmorphic dark interface with real-time visualization
- 🤖 **Sub-agents** — specialized AI workers for different tasks
- 🖥️ **Live terminal** — watch MAX execute commands in real-time

---

## ⚡ Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- [Ollama](https://ollama.ai) (optional but recommended)

```bash
# 1. Clone
git clone https://github.com/lvs0/max
cd max

# 2. Setup Backend
cd backend
pip install -r requirements.txt

# 3. Start Ollama (optional but recommended)
ollama pull llama3
# OR get a free key at https://console.groq.com
export GROQ_API_KEY="your_key_here"

# 4. Run Backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 5. In another terminal, run Frontend
cd ../frontend
npm install
npm run dev
```

Open **http://localhost:3000** — you're now running MAX. 🚀

---

## 🎨 Demo

<p align="center">
  <img src="https://i.imgur.com/demo-placeholder.gif" alt="MAX Demo" width="800">
</p>

```
You: "analyze my project and create a summary"

MAX: 🧠 Thinking...
    ⚙️ shell_command → ls -la ./project
    ↳ main.py, utils.py, tests/, README.md
    📖 read_file → ./project/main.py
    ✏️ write_file → summary.txt
    
✅ Done! Created summary.txt with:
   - 3 Python files
   - Test coverage: 78%
   - Full documentation
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MAX INTERFACE                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Agent   │  │ Terminal │  │  Tasks   │              │
│  │  Plan    │  │  Popup   │  │  Panel   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌─────────────────────────────────────────────────┐   │
│  │              AI Chat + Orb Visualization         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                     MAX AGENT LOOP                       │
│                                                          │
│   Input → [ THINK ] → [ PLAN ] → [ ACT ] → repeat       │
│              ↓          ↓         ↓                     │
│          Ollama/     Steps    Tools:                    │
│           Groq      (Plan)    • execute_code            │
│                      ↓       • read/write files         │
│                   Sub-agents • shell commands            │
│                             • remember/recall           │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│               Backend: FastAPI + SQLite                  │
│               Inference: Ollama ↔ Groq                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tools

| Tool | What it does |
|------|-------------|
| `execute_code` | Run Python in a sandboxed subprocess |
| `read_file` | Read any file on your system |
| `write_file` | Write/create files |
| `shell_command` | Execute shell commands safely |
| `remember` | Store info in persistent memory |
| `recall` | Retrieve from long-term memory |

---

## ⚙️ Configuration

Create a `.env` file in `backend/`:

```bash
# Required for Groq (free tier at console.groq.com)
GROQ_API_KEY=gsk_...

# Ollama settings (if using Ollama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# MAX settings
MAX_MODEL=llama3-8b-8192    # Groq model
MAX_DB=max_memory.db         # SQLite database path
```

---

## 📦 Hardware Requirements

MAX is built for **real hardware**:

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4GB | 8GB+ |
| CPU | Any x86_64 | i5/i7 or equivalent |
| Storage | 2GB | 10GB+ |
| GPU | ❌ Not needed | ❌ Not needed |

Tested on: **Lenovo ThinkPad X250** (i5-5300U, 8GB RAM, no GPU) ✅

---

## 🗺️ Roadmap

- [ ] Voice input with Whisper
- [ ] Web search integration
- [ ] Multi-agent orchestration
- [ ] Plugin system
- [ ] Electron desktop app
- [ ] Mobile companion app
- [ ] Docker deployment

---

## 🤝 Contributing

Contributions welcome! Open an issue or PR.

```bash
git clone https://github.com/lvs0/max
cd max
git checkout -b feature/my-feature
# make your changes
git push origin feature/my-feature
```

---

## 📜 License

MIT — do whatever you want with it.

---

## 🙏 Credits

Built with 💜 by [lvs0](https://github.com/lvs0)

- Email: lvs0@proton.me
- Instagram: @lvs393
- Discord: lvs0810_81613

---

<div align="center">

<p align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%">
</p>

**If this helped you, leave a ⭐**

*Built by a solo developer on real hardware.*

</div>
