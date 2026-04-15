# MAX v1.0.0 Release Notes

**Date:** April 2026  
**Tag:** v1.0.0

---

## 🎉 MAX v1.0.0 is Here!

MAX (Multi-Agent eXecutor) is now production-ready. Run AI locally, own your data, no cloud, no cost.

### Tagline
> *Run AI. Own it. No cloud. No cost.*

---

## What's New

### ✨ Core Features

| Feature | Description |
|---------|-------------|
| **Autonomous Agent Loop** | MAX thinks, plans, and executes tasks autonomously |
| **Glassmorphic UI** | Beautiful dark interface with aurora effects |
| **Canvas Orb** | Animated orb with particles (blue→yellow when active) |
| **Real-time Terminal** | Watch MAX execute commands live |
| **Voice Input** | Web Speech API for hands-free interaction |
| **Session Management** | Save and resume conversations |

### 🛠️ Tools

| Tool | Description |
|------|-------------|
| `execute_code` | Run Python in sandboxed subprocess |
| `read_file` | Read any local file |
| `write_file` | Write/create files |
| `shell_command` | Safe shell execution |
| `remember/recall` | Persistent memory |

### 📊 Panels

| Panel | Content |
|-------|---------|
| **Left - Agent Plan** | Current task plan with steps |
| **Left - Sub-Agents** | Agent status (Code Runner, File Manager, etc.) |
| **Right - Tasks** | Task list with add/complete |
| **Right - Calendar** | Schedule view |

### 🚀 DevOps

- **Docker** support with multi-stage build
- **docker-compose.yml** for easy deployment
- **GitHub Actions CI/CD** pipeline
- **One-command install** (`./install.sh`)
- **Unified launcher** (`./start.sh`)

### 🔒 Privacy

- 100% local inference with Ollama
- Optional Groq API (free tier)
- No data leaves your machine
- CPU-only operation supported

---

## Installation

```bash
git clone https://github.com/lvs0/Max && cd Max && ./install.sh
```

Or see [docs/QUICKSTART.md](QUICKSTART.md) for detailed instructions.

---

## Ecosystem

MAX is part of the **SOE (Self-Own Everything)** ecosystem:

- [Polygone](https://github.com/lvs0/Polygone) - Post-quantum privacy network
- [Loop](https://github.com/lvs0/Loop) - LLM fine-tuning format
- [Polygone-Petals](https://github.com/lvs0/Polygone-Petals) - Distributed inference

---

## Hardware

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4GB | 8GB+ |
| CPU | Any x86_64 | i5/i7 |
| GPU | ❌ Not needed | ❌ Not needed |

Tested on: **Lenovo ThinkPad X250** (i5-5300U, 8GB RAM, no GPU) ✅

---

## Known Issues

None reported in this release.

---

## Roadmap

### v1.1 (Planned)
- [ ] Whisper integration for better voice
- [ ] Web search tool
- [ ] Plugin system

### v1.2 (Planned)
- [ ] Multi-agent orchestration
- [ ] Polygone network integration
- [ ] Mobile companion app

### v2.0 (Vision)
- [ ] Fully distributed inference
- [ ] Electron desktop app
- [ ] Native integrations (file watcher, etc.)

---

## Credits

Built with 💜 by [lvs0](https://github.com/lvs0)

- Email: lvs0@proton.me
- Instagram: @lvs393
- Discord: lvs0810_81613

---

## License

MIT License - do whatever you want with it.

---

**If this helped you, leave a ⭐**

https://github.com/lvs0/Max
