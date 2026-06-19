# MAX Backend API

**Version:** 1.1.0  
**Status:** Functional with security concerns  
**Path:** `/home/l-vs/Projets/Max/backend/main.py`

---

## Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/` | Health check, returns `{"status": "ok", "name": "Max", "version": "1.0.0"}` | None |
| `POST` | `/chat` | Send a message and receive AI response | None |
| `GET` | `/memory` | Retrieve last 20 conversation messages | None |
| `DELETE` | `/memory` | Clear all conversation history | None |
| `GET` | `/tasks` | List all tasks | None |
| `POST` | `/tasks` | Create a new task | None |
| `PUT` | `/tasks/{task_id}` | Update an existing task | None |
| `DELETE` | `/tasks/{task_id}` | Delete a task | None |
| `GET` | `/stats` | System stats (CPU, memory, disk, network) | None |
| `GET` | `/models` | List available Ollama models | None |

---

## Security Audit

### Critical Issues

1. **CORS Wildcard** (`allow_origins=["*"]`)
   - Allows requests from any origin
   - Risk: XSS, data theft from other origins
   - Fix: Specify exact allowed origins

2. **No Authentication/Authorization**
   - All endpoints are publicly accessible
   - Risk: Unauthorized access to AI chat, memory, tasks
   - Fix: Add API key or OAuth2 authentication

3. **No Input Validation**
   - `ChatRequest.message` has no length limit
   - `task_id` path parameter not validated (SQL injection vector via path traversal in DELETE/PUT)
   - Fix: Add Pydantic validators with max lengths

4. **No Rate Limiting**
   - `/chat` endpoint vulnerable to DoS
   - Fix: Add rate limiting middleware (e.g., slowapi)

### Moderate Issues

5. **Database Connection Pool Mismanagement**
   - `get_tasks()`, `add_task()`, `update_task()`, `delete_task()` create direct `sqlite3.connect()` instead of using `db_pool`
   - Risk: Connection leaks, pool starvation under load
   - Fix: Use `db_pool.get_connection()` consistently

6. **Background Task Race Condition**
   - `cleanup_old_conversations(conn)` runs after connection returned to pool
   - Risk: Cleanup may run on closed/alien connection
   - Fix: Execute cleanup before returning connection

7. **No Request Timeouts**
   - Ollama calls have no timeout
   - Fix: Add timeout to `ollama.chat()`

### Minor Issues

8. **Hardcoded Session ID** - All chats use `session_id='default'`
9. **Import inside function** - `import psutil` on line 314 should be at top
10. **Silent Exception Swallowing** - `/models` catches all exceptions without logging

---

## Dependencies

```
fastapi>=0.100.0
uvicorn>=0.23.0
ollama>=0.1.0
psutil>=5.9.0
pydantic>=2.0.0
```

---

## Running

```bash
cd /home/l-vs/Projets/Max/backend
python3 main.py
# Server runs on http://127.0.0.1:8000
```

---

## Database

- **Path:** `~/.max/memory.db` (SQLite)
- **Tables:** `conversations`, `tasks`, `system`
- **Indexes:** On `timestamp`, `session_id`, `created_at`, `completed`