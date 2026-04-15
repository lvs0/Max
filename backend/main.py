"""
MAX — Multi-Agent eXecutor
Backend core: autonomous agent loop with tool use, memory, and multi-provider inference.
"""

import os
import json
import time
import sqlite3
import asyncio
import subprocess
import tempfile
import httpx
from datetime import datetime
from typing import Optional, AsyncGenerator
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI(title="MAX Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Config ───────────────────────────────────────────────────────────────────

GROQ_API_KEY    = os.getenv("GROQ_API_KEY", "")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
DEFAULT_MODEL   = os.getenv("MAX_MODEL", "llama3-8b-8192")  # Groq default
DB_PATH         = os.getenv("MAX_DB", "max_memory.db")
MAX_LOOP_STEPS  = 12

# ─── Memory (SQLite) ──────────────────────────────────────────────────────────

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            role TEXT,
            content TEXT,
            timestamp TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE,
            value TEXT,
            updated_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            title TEXT,
            created_at TEXT,
            last_active TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            done INTEGER DEFAULT 0,
            due TEXT,
            session_id TEXT,
            created_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sub_agents (
            id TEXT PRIMARY KEY,
            name TEXT,
            emoji TEXT,
            status TEXT DEFAULT 'idle',
            active INTEGER DEFAULT 0
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS calendar (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            date TEXT,
            time TEXT,
            session_id TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

def save_message(session_id: str, role: str, content: str):
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO messages (session_id, role, content, timestamp) VALUES (?,?,?,?)",
        (session_id, role, content, datetime.utcnow().isoformat())
    )
    # Update session
    conn.execute("""
        INSERT INTO sessions (id, title, created_at, last_active)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET last_active=excluded.last_active
    """, (session_id, f"Session {session_id[:8]}", datetime.utcnow().isoformat(), datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()

def get_history(session_id: str, limit: int = 20):
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT role, content FROM messages WHERE session_id=? ORDER BY id DESC LIMIT ?",
        (session_id, limit)
    ).fetchall()
    conn.close()
    return [{"role": r[0], "content": r[1]} for r in reversed(rows)]

def get_all_sessions():
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT id, title, created_at, last_active FROM sessions ORDER BY last_active DESC"
    ).fetchall()
    conn.close()
    return [{"id": r[0], "title": r[1], "created_at": r[2], "last_active": r[3]} for r in rows]

# ─── Inference (Groq → Ollama fallback) ───────────────────────────────────────

async def call_llm(messages: list, stream: bool = False):
    """Try Groq first, fallback to Ollama."""

    if GROQ_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                    json={"model": DEFAULT_MODEL, "messages": messages, "stream": stream, "max_tokens": 2048}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"[MAX] Groq failed: {e}, trying Ollama...")

    # Ollama fallback
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={"model": "llama3", "messages": messages, "stream": False}
            )
            if resp.status_code == 200:
                return resp.json()["message"]["content"]
    except Exception as e:
        print(f"[MAX] Ollama failed: {e}")

    return "⚠️ No inference provider available. Set GROQ_API_KEY or start Ollama."

# ─── Tools ────────────────────────────────────────────────────────────────────

TOOLS_SCHEMA = [
    {
        "name": "execute_code",
        "description": "Execute Python code in a sandboxed subprocess. Returns stdout/stderr.",
        "parameters": {
            "type": "object",
            "properties": {
                "code": {"type": "string", "description": "Python code to run"},
                "timeout": {"type": "integer", "description": "Timeout in seconds (default 10)"}
            },
            "required": ["code"]
        }
    },
    {
        "name": "read_file",
        "description": "Read the contents of a local file.",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path to read"}
            },
            "required": ["path"]
        }
    },
    {
        "name": "write_file",
        "description": "Write content to a local file.",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path"},
                "content": {"type": "string", "description": "Content to write"}
            },
            "required": ["path", "content"]
        }
    },
    {
        "name": "shell_command",
        "description": "Run a safe shell command (ls, pwd, cat, echo, pip install, git, etc.).",
        "parameters": {
            "type": "object",
            "properties": {
                "command": {"type": "string", "description": "Shell command"}
            },
            "required": ["command"]
        }
    },
    {
        "name": "remember",
        "description": "Store a key-value pair in long-term memory.",
        "parameters": {
            "type": "object",
            "properties": {
                "key": {"type": "string"},
                "value": {"type": "string"}
            },
            "required": ["key", "value"]
        }
    },
    {
        "name": "recall",
        "description": "Retrieve a value from long-term memory by key.",
        "parameters": {
            "type": "object",
            "properties": {
                "key": {"type": "string"}
            },
            "required": ["key"]
        }
    }
]

BLOCKED_COMMANDS = ["rm -rf", "mkfs", "dd if=", "shutdown", "reboot", ":(){", "fork bomb"]

def execute_code(code: str, timeout: int = 10) -> str:
    with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False) as f:
        f.write(code)
        fname = f.name
    try:
        result = subprocess.run(
            ["python3", fname], capture_output=True, text=True, timeout=timeout
        )
        out = result.stdout[-3000:] if result.stdout else ""
        err = result.stderr[-1000:] if result.stderr else ""
        return f"STDOUT:\n{out}\nSTDERR:\n{err}" if err else out
    except subprocess.TimeoutExpired:
        return f"⏱ Timeout after {timeout}s"
    except Exception as e:
        return f"Error: {e}"
    finally:
        os.unlink(fname)

def shell_command(command: str) -> str:
    for blocked in BLOCKED_COMMANDS:
        if blocked in command:
            return f"🚫 Blocked command: '{blocked}'"
    try:
        result = subprocess.run(
            command, shell=True, capture_output=True, text=True, timeout=15
        )
        return (result.stdout + result.stderr)[-3000:]
    except subprocess.TimeoutExpired:
        return "⏱ Timeout"
    except Exception as e:
        return f"Error: {e}"

def read_file(path: str) -> str:
    try:
        with open(path, "r") as f:
            return f.read()[:5000]
    except Exception as e:
        return f"Error reading file: {e}"

def write_file(path: str, content: str) -> str:
    try:
        with open(path, "w") as f:
            f.write(content)
        return f"✅ Written to {path}"
    except Exception as e:
        return f"Error: {e}"

def remember(key: str, value: str) -> str:
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT OR REPLACE INTO memories (key, value, updated_at) VALUES (?,?,?)",
        (key, value, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()
    return f"✅ Stored: {key}"

def recall(key: str) -> str:
    conn = sqlite3.connect(DB_PATH)
    row = conn.execute("SELECT value FROM memories WHERE key=?", (key,)).fetchone()
    conn.close()
    return row[0] if row else f"❌ No memory for key '{key}'"

def dispatch_tool(name: str, args: dict) -> str:
    match name:
        case "execute_code":   return execute_code(args["code"], args.get("timeout", 10))
        case "read_file":      return read_file(args["path"])
        case "write_file":     return write_file(args["path"], args["content"])
        case "shell_command":  return shell_command(args["command"])
        case "remember":       return remember(args["key"], args["value"])
        case "recall":         return recall(args["key"])
        case _:                return f"Unknown tool: {name}"

# ─── Agent Loop ───────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are MAX, an autonomous AI agent. You run locally on the user's machine with zero cloud dependency.

You have access to the following tools. To use a tool, respond with a JSON block in this exact format:
```tool
{"name": "tool_name", "args": {"param": "value"}}
```

Available tools:
- execute_code(code, timeout): Run Python code
- read_file(path): Read a file
- write_file(path, content): Write a file  
- shell_command(command): Run shell commands
- remember(key, value): Save to long-term memory
- recall(key): Load from long-term memory

Rules:
1. Think step by step before acting
2. Use tools when needed — don't fake results
3. After getting a tool result, continue reasoning
4. When done, give a clear final answer
5. Be concise but complete
6. You run on the user's local machine — respect their files

You are MAX. Powerful, local, autonomous."""

import re

def extract_tool_call(text: str) -> Optional[dict]:
    match = re.search(r"```tool\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except:
            pass
    return None

async def run_agent_loop(session_id: str, user_message: str) -> AsyncGenerator[str, None]:
    save_message(session_id, "user", user_message)
    history = get_history(session_id, limit=10)

    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history

    yield json.dumps({"type": "status", "text": "🧠 Thinking..."}) + "\n"

    for step in range(MAX_LOOP_STEPS):
        response = await call_llm(messages)

        tool_call = extract_tool_call(response)

        if tool_call:
            tool_name = tool_call.get("name", "")
            tool_args = tool_call.get("args", {})

            yield json.dumps({"type": "tool_call", "tool": tool_name, "args": tool_args}) + "\n"

            result = dispatch_tool(tool_name, tool_args)

            yield json.dumps({"type": "tool_result", "tool": tool_name, "result": result[:500]}) + "\n"

            messages.append({"role": "assistant", "content": response})
            messages.append({"role": "user", "content": f"Tool result for {tool_name}:\n{result}"})

        else:
            # Final answer
            save_message(session_id, "assistant", response)
            yield json.dumps({"type": "answer", "text": response}) + "\n"
            break

    else:
        msg = "⚠️ Max loop steps reached."
        save_message(session_id, "assistant", msg)
        yield json.dumps({"type": "answer", "text": msg}) + "\n"

# ─── API Routes ───────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    session_id: str
    message: str

@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    return StreamingResponse(
        run_agent_loop(req.session_id, req.message),
        media_type="text/event-stream"
    )

@app.get("/sessions")
async def list_sessions():
    return get_all_sessions()

@app.get("/history/{session_id}")
async def get_session_history(session_id: str):
    return get_history(session_id, limit=50)

@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM messages WHERE session_id=?", (session_id,))
    conn.execute("DELETE FROM sessions WHERE id=?", (session_id,))
    conn.commit()
    conn.close()
    return {"ok": True}

@app.get("/memories")
async def list_memories():
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("SELECT key, value, updated_at FROM memories ORDER BY updated_at DESC").fetchall()
    conn.close()
    return [{"key": r[0], "value": r[1], "updated_at": r[2]} for r in rows]

@app.get("/health")
async def health():
    providers = []
    if GROQ_API_KEY:
        providers.append("groq")
    try:
        async with httpx.AsyncClient(timeout=2) as client:
            r = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if r.status_code == 200:
                providers.append("ollama")
    except:
        pass
    return {"status": "ok", "providers": providers, "model": DEFAULT_MODEL}

@app.get("/")
async def root():
    return {"name": "MAX", "version": "1.0.0", "status": "running"}

# ─── Tasks API ────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str
    due: Optional[str] = None
    session_id: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    done: Optional[bool] = None
    due: Optional[str] = None

@app.get("/tasks")
async def list_tasks(session_id: Optional[str] = None):
    conn = sqlite3.connect(DB_PATH)
    if session_id:
        rows = conn.execute("SELECT id, title, done, due, session_id FROM tasks WHERE session_id=?", (session_id,)).fetchall()
    else:
        rows = conn.execute("SELECT id, title, done, due, session_id FROM tasks").fetchall()
    conn.close()
    return [{"id": r[0], "title": r[1], "done": bool(r[2]), "due": r[3], "session_id": r[4]} for r in rows]

@app.post("/tasks")
async def create_task(task: TaskCreate):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute(
        "INSERT INTO tasks (title, due, session_id, created_at) VALUES (?,?,?,?)",
        (task.title, task.due, task.session_id, datetime.utcnow().isoformat())
    )
    conn.commit()
    task_id = cursor.lastrowid
    conn.close()
    return {"id": task_id, "title": task.title, "done": False, "due": task.due}

@app.patch("/tasks/{task_id}")
async def update_task(task_id: int, update: TaskUpdate):
    conn = sqlite3.connect(DB_PATH)
    if update.title is not None:
        conn.execute("UPDATE tasks SET title=? WHERE id=?", (update.title, task_id))
    if update.done is not None:
        conn.execute("UPDATE tasks SET done=? WHERE id=?", (int(update.done), task_id))
    if update.due is not None:
        conn.execute("UPDATE tasks SET due=? WHERE id=?", (update.due, task_id))
    conn.commit()
    conn.close()
    return {"ok": True}

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM tasks WHERE id=?", (task_id,))
    conn.commit()
    conn.close()
    return {"ok": True}

# ─── Sub-Agents API ───────────────────────────────────────────────────────────

@app.get("/agents")
async def list_agents():
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("SELECT id, name, emoji, status, active FROM sub_agents").fetchall()
    if not rows:
        default_agents = [
            ("code-runner", "Code Runner", "⚙️", "idle", 0),
            ("file-manager", "File Manager", "📁", "idle", 0),
            ("research", "Research", "🔍", "idle", 0),
            ("web-search", "Web Search", "🌐", "idle", 0),
        ]
        for agent in default_agents:
            conn.execute("INSERT OR IGNORE INTO sub_agents (id, name, emoji, status, active) VALUES (?,?,?,?,?)", agent)
        conn.commit()
        rows = conn.execute("SELECT id, name, emoji, status, active FROM sub_agents").fetchall()
    conn.close()
    return [{"id": r[0], "name": r[1], "emoji": r[2], "status": r[3], "active": bool(r[4])} for r in rows]

@app.patch("/agents/{agent_id}")
async def update_agent(agent_id: str, update: dict):
    conn = sqlite3.connect(DB_PATH)
    if "status" in update:
        conn.execute("UPDATE sub_agents SET status=? WHERE id=?", (update["status"], agent_id))
    if "active" in update:
        conn.execute("UPDATE sub_agents SET active=? WHERE id=?", (int(update["active"]), agent_id))
    conn.commit()
    conn.close()
    return {"ok": True}

# ─── Calendar API ─────────────────────────────────────────────────────────────

class CalendarEvent(BaseModel):
    title: str
    date: str
    time: Optional[str] = None
    session_id: Optional[str] = None

@app.get("/calendar")
async def list_events(date: Optional[str] = None):
    conn = sqlite3.connect(DB_PATH)
    if date:
        rows = conn.execute("SELECT id, title, date, time FROM calendar WHERE date=?", (date,)).fetchall()
    else:
        rows = conn.execute("SELECT id, title, date, time FROM calendar").fetchall()
    conn.close()
    return [{"id": r[0], "title": r[1], "date": r[2], "time": r[3]} for r in rows]

@app.post("/calendar")
async def create_event(event: CalendarEvent):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute(
        "INSERT INTO calendar (title, date, time, session_id) VALUES (?,?,?,?)",
        (event.title, event.date, event.time, event.session_id)
    )
    conn.commit()
    event_id = cursor.lastrowid
    conn.close()
    return {"id": event_id, "title": event.title, "date": event.date, "time": event.time}

@app.delete("/calendar/{event_id}")
async def delete_event(event_id: int):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM calendar WHERE id=?", (event_id,))
    conn.commit()
    conn.close()
    return {"ok": True}

# ─── File Browser API ─────────────────────────────────────────────────────────

@app.get("/browse")
async def browse_files(path: str = "."):
    try:
        entries = []
        full_path = os.path.abspath(path)
        parent = os.path.dirname(full_path)
        
        if os.path.isdir(full_path):
            for item in sorted(os.listdir(full_path)):
                item_path = os.path.join(full_path, item)
                try:
                    stat = os.stat(item_path)
                    entries.append({
                        "name": item,
                        "path": item_path,
                        "type": "dir" if os.path.isdir(item_path) else "file",
                        "size": stat.st_size if os.path.isfile(item_path) else 0,
                        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
                    })
                except:
                    pass
        return {"path": full_path, "parent": parent, "entries": entries}
    except Exception as e:
        return {"error": str(e)}

@app.get("/read")
async def read_file_api(path: str):
    try:
        with open(path, "r") as f:
            content = f.read()
        return {"content": content[:50000]}
    except Exception as e:
        return {"error": str(e)}
