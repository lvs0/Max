import { useState, useEffect, useRef, useCallback } from "react";

const API = "http://localhost:8000";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ── Voice Input ────────────────────────────────────────────────────────────

function VoiceInput({ onTranscript, disabled }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      onTranscript(transcript);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  return (
    <button
      className={`voice-btn ${listening ? "listening" : ""}`}
      onClick={toggleListening}
      disabled={disabled}
      title="Voice input"
    >
      {listening ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      )}
    </button>
  );
}

// ── Aurora Background ──────────────────────────────────────────────────────

function Aurora() {
  return (
    <div className="aurora-wrap" aria-hidden>
      <div className="aurora a1" />
      <div className="aurora a2" />
      <div className="aurora a3" />
      <div className="aurora a4" />
    </div>
  );
}

// ── Orb with Particles ────────────────────────────────────────────────────

function Orb({ active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = 120;
    canvas.height = 120;

    particlesRef.current = Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      radius: 35 + Math.random() * 15,
      speed: 0.005 + Math.random() * 0.008,
      size: 1.5 + Math.random() * 1.5,
      opacity: 0.3 + Math.random() * 0.4,
      pulse: Math.random() * Math.PI * 2,
    }));

    function draw() {
      ctx.clearRect(0, 0, 120, 120);
      const centerX = 60;
      const centerY = 60;
      const orbColor = active ? { r: 255, g: 220, b: 50 } : { r: 45, g: 226, b: 214 };

      // Rings
      for (let i = 3; i >= 1; i--) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20 + i * 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${orbColor.r}, ${orbColor.g}, ${orbColor.b}, ${0.15 + (4 - i) * 0.08})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Core
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 18);
      gradient.addColorStop(0, `rgba(${orbColor.r}, ${orbColor.g}, ${orbColor.b}, 1)`);
      gradient.addColorStop(0.6, `rgba(${orbColor.r}, ${orbColor.g}, ${orbColor.b}, 0.7)`);
      gradient.addColorStop(1, `rgba(${orbColor.r}, ${orbColor.g}, ${orbColor.b}, 0)`);
      ctx.beginPath();
      ctx.arc(centerX, centerY, 18, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Glow
      ctx.shadowColor = `rgba(${orbColor.r}, ${orbColor.g}, ${orbColor.b}, 0.8)`;
      ctx.shadowBlur = active ? 30 : 15;

      // Particles
      particlesRef.current.forEach((p) => {
        p.angle += p.speed;
        p.pulse += 0.03;
        const r = p.radius + Math.sin(p.pulse) * 5;
        const x = centerX + Math.cos(p.angle) * r;
        const y = centerY + Math.sin(p.angle) * r;
        const alpha = p.opacity * (active ? 1.2 : 0.7);

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${orbColor.r}, ${orbColor.g}, ${orbColor.b}, ${alpha})`;
        ctx.fill();
      });

      ctx.shadowBlur = 0;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  return (
    <div className={`orb-wrap ${active ? "orb-active" : ""}`}>
      <canvas ref={canvasRef} className="orb-canvas" />
      <div className="orb-letter">M</div>
    </div>
  );
}

// ── Tool Badge ─────────────────────────────────────────────────────────────

const TOOL_ICONS = {
  execute_code: "⚙️",
  read_file: "📖",
  write_file: "✏️",
  shell_command: "🖥",
  remember: "🧠",
  recall: "💭",
};

function ToolEvent({ event }) {
  if (event.type === "tool_call") {
    return (
      <div className="tool-event tool-call">
        <span className="tool-icon">{TOOL_ICONS[event.tool] || "🔧"}</span>
        <span className="tool-name">{event.tool}</span>
        <span className="tool-args">
          {JSON.stringify(event.args).slice(0, 80)}
          {JSON.stringify(event.args).length > 80 ? "…" : ""}
        </span>
      </div>
    );
  }
  if (event.type === "tool_result") {
    return (
      <div className="tool-event tool-result">
        <span className="tool-icon">↳</span>
        <span className="tool-result-text">{event.result}</span>
      </div>
    );
  }
  if (event.type === "status") {
    return (
      <div className="tool-event tool-status">
        <span className="thinking-dots"><span /><span /><span /></span>
        <span>{event.text}</span>
      </div>
    );
  }
  return null;
}

// ── Message Bubble ─────────────────────────────────────────────────────────

function Bubble({ msg }) {
  const isUser = msg.role === "user";

  const renderContent = (text) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const lines = part.slice(3).split("\n");
        const lang = lines[0];
        const code = lines.slice(1).join("\n").replace(/```$/, "").trimEnd();
        return (
          <pre key={i} className="code-block">
            {lang && <span className="code-lang">{lang}</span>}
            <code>{code}</code>
          </pre>
        );
      }
      return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{part}</span>;
    });
  };

  return (
    <div className={`bubble-wrap ${isUser ? "bubble-user" : "bubble-agent"}`}>
      {!isUser && (
        <div className="bubble-avatar">
          <span>M</span>
        </div>
      )}
      <div className="bubble">
        {msg.events && msg.events.length > 0 && (
          <div className="bubble-events">
            {msg.events.map((e, i) => (
              <ToolEvent key={i} event={e} />
            ))}
          </div>
        )}
        <div className="bubble-content">{renderContent(msg.content)}</div>
        {msg.time && <div className="bubble-time">{msg.time}</div>}
      </div>
    </div>
  );
}

// ── Terminal Popup ─────────────────────────────────────────────────────────

function Terminal({ output, onClose }) {
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="terminal-overlay">
      <div className="terminal-popup">
        <div className="terminal-header">
          <div className="terminal-title">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span>max@terminal</span>
          </div>
          <button className="terminal-close" onClick={onClose}>×</button>
        </div>
        <div className="terminal-body" ref={terminalRef}>
          {output.map((line, i) => (
            <div key={i} className="terminal-line">{line}</div>
          ))}
          <div className="terminal-cursor">█</div>
        </div>
      </div>
    </div>
  );
}

// ── Left Panel: Agent Plan & Sub-Agents ─────────────────────────────────────

function AgentPanel({ currentPlan, subAgents }) {
  const [activeTab, setActiveTab] = useState("plan");

  return (
    <div className="agent-panel">
      <div className="agent-tabs">
        <button className={`agent-tab ${activeTab === "plan" ? "active" : ""}`} onClick={() => setActiveTab("plan")}>
          📋 Plan
        </button>
        <button className={`agent-tab ${activeTab === "agents" ? "active" : ""}`} onClick={() => setActiveTab("agents")}>
          🤖 Agents
        </button>
      </div>

      {activeTab === "plan" && (
        <div className="agent-plan">
          {currentPlan.length === 0 ? (
            <p className="agent-empty">No active plan</p>
          ) : (
            currentPlan.map((step, i) => (
              <div key={i} className="plan-step">
                <span className="plan-num">{i + 1}</span>
                <span className="plan-text">{step}</span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "agents" && (
        <div className="sub-agents-list">
          {subAgents.map((agent) => (
            <div key={agent.id} className={`sub-agent ${agent.active ? "active" : ""}`}>
              <span className="agent-emoji">{agent.emoji}</span>
              <div className="agent-info">
                <span className="agent-name">{agent.name}</span>
                <span className="agent-status">{agent.status}</span>
              </div>
              {agent.active && <span className="agent-badge">running</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Right Panel: Tasks & Calendar ─────────────────────────────────────────

function RightPanel({ tasks, onToggleTask, onAddTask }) {
  const [activeTab, setActiveTab] = useState("tasks");
  const [newTask, setNewTask] = useState("");
  const today = new Date();
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask(newTask.trim());
      setNewTask("");
    }
  };

  return (
    <div className="right-panel">
      <div className="right-tabs">
        <button className={`right-tab ${activeTab === "tasks" ? "active" : ""}`} onClick={() => setActiveTab("tasks")}>
          ✓ Tasks
        </button>
        <button className={`right-tab ${activeTab === "calendar" ? "active" : ""}`} onClick={() => setActiveTab("calendar")}>
          📅 Calendar
        </button>
      </div>

      {activeTab === "tasks" && (
        <div className="tasks-list">
          <div className="add-task">
            <input
              type="text"
              className="add-task-input"
              placeholder="Add task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            />
            <button className="add-task-btn" onClick={handleAddTask}>+</button>
          </div>
          {tasks.length === 0 ? (
            <p className="panel-empty">No tasks yet</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className={`task-item ${task.done ? "done" : ""}`}>
                <button className="task-check" onClick={() => onToggleTask(task.id)}>
                  {task.done ? "✓" : "○"}
                </button>
                <div className="task-info">
                  <span className="task-title">{task.title}</span>
                  {task.due && <span className="task-due">{task.due}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "calendar" && (
        <div className="calendar-view">
          <div className="calendar-header">
            <span className="calendar-date">{formatDate()}</span>
          </div>
          <div className="calendar-hours">
            {hours.map((h) => (
              <div key={h} className="calendar-hour">
                <span className="hour-label">{h}:00</span>
                <div className="hour-slot" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────

function Sidebar({ sessions, currentSession, onSelect, onNew, onDelete }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-max">MAX</span>
          <span className="logo-sub">agent</span>
        </div>
        <button className="btn-new" onClick={onNew} title="New session">+</button>
      </div>

      <div className="sidebar-sessions">
        {sessions.length === 0 && <p className="sidebar-empty">No sessions yet</p>}
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`session-item ${s.id === currentSession ? "session-active" : ""}`}
            onClick={() => onSelect(s.id)}
          >
            <span className="session-title">{s.title || s.id.slice(0, 8)}</span>
            <span className="session-time">{formatTime(s.last_active)}</span>
            <button className="session-delete" onClick={(e) => { e.stopPropagation(); onDelete(s.id); }} title="Delete">×</button>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <span className="sidebar-version">v1.0.0 · local</span>
      </div>
    </aside>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(uid());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentPlan, setCurrentPlan] = useState([]);
  const [subAgents, setSubAgents] = useState([]);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    fetchTasks();
    fetchSubAgents();
    fetch(`${API}/health`)
      .then((r) => r.json())
      .then((d) => setProviders(d.providers || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!currentSession) return;
    fetch(`${API}/history/${currentSession}`)
      .then((r) => r.json())
      .then((history) => {
        setMessages(history.map((m) => ({
          id: uid(),
          role: m.role,
          content: m.content,
          events: [],
          time: "",
        })));
      })
      .catch(() => setMessages([]));
  }, [currentSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchSessions() {
    try {
      const r = await fetch(`${API}/sessions`);
      setSessions(await r.json());
    } catch {}
  }

  async function fetchTasks() {
    try {
      const r = await fetch(`${API}/tasks`);
      setTasks(await r.json());
    } catch {}
  }

  async function fetchSubAgents() {
    try {
      const r = await fetch(`${API}/agents`);
      setSubAgents(await r.json());
    } catch {}
  }

  function newSession() {
    setCurrentSession(uid());
    setMessages([]);
    setCurrentPlan([]);
    fetchSessions();
  }

  async function deleteSession(id) {
    await fetch(`${API}/session/${id}`, { method: "DELETE" });
    if (id === currentSession) newSession();
    fetchSessions();
  }

  async function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    try {
      await fetch(`${API}/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !task.done }),
      });
      fetchTasks();
    } catch {}
  }

  async function addTask(title) {
    try {
      await fetch(`${API}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, session_id: currentSession }),
      });
      fetchTasks();
    } catch {}
  }

  function addTerminalLine(line) {
    setTerminalOutput((prev) => [...prev, line]);
    setTerminalOpen(true);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);
    setTerminalOpen(true);

    const userMsg = {
      id: uid(),
      role: "user",
      content: text,
      events: [],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const agentMsg = {
      id: uid(),
      role: "assistant",
      content: "",
      events: [],
      time: "",
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, agentMsg]);
    addTerminalLine(`$ ${text}`);

    try {
      const resp = await fetch(`${API}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: currentSession, message: text }),
      });

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const event = JSON.parse(line);
            setMessages((prev) => {
              const updated = [...prev];
              const idx = updated.findIndex((m) => m.id === agentMsg.id);
              if (idx === -1) return prev;
              const m = { ...updated[idx] };

              if (event.type === "answer") {
                m.content = event.text;
                m.streaming = false;
                m.time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              } else {
                m.events = [...m.events, event];
                if (event.type === "tool_call") {
                  addTerminalLine(`[tool] ${event.tool}`);
                }
              }
              updated[idx] = m;
              return updated;
            });
          } catch {}
        }
      }
    } catch (err) {
      addTerminalLine(`Error: ${err.message}`);
      setMessages((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((m) => m.id === agentMsg.id);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], content: "⚠️ Connection error. Is the MAX backend running?", streaming: false };
        }
        return updated;
      });
    } finally {
      setLoading(false);
      fetchSessions();
      inputRef.current?.focus();
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      <Aurora />
      {terminalOpen && <Terminal output={terminalOutput} onClose={() => setTerminalOpen(false)} />}
      <div className="layout">
        <Sidebar sessions={sessions} currentSession={currentSession} onSelect={(id) => setCurrentSession(id)} onNew={newSession} onDelete={deleteSession} />

        <AgentPanel currentPlan={currentPlan} subAgents={subAgents} />

        <main className="main">
          <header className="topbar">
            <div className="topbar-left">
              <Orb active={loading} />
              <div className="topbar-info">
                <span className="topbar-title">MAX</span>
                <span className="topbar-sub">Multi-Agent eXecutor</span>
              </div>
            </div>
            <div className="topbar-right">
              <button className="terminal-toggle" onClick={() => setTerminalOpen(!terminalOpen)} title="Toggle Terminal">
                🖥
              </button>
              <div className="topbar-providers">
                {providers.length === 0 ? (
                  <span className="provider-badge offline">⚠ no provider</span>
                ) : (
                  providers.map((p) => <span key={p} className="provider-badge online">{p}</span>)
                )}
              </div>
            </div>
          </header>

          <div className="messages">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-orb"><Orb active={false} /></div>
                <h2 className="empty-title">MAX is ready.</h2>
                <p className="empty-sub">Local autonomous AI agent. No cloud. No limits.</p>
                <div className="empty-chips">
                  {["Write a Python script", "Search my files", "Remember my name", "Run ls -la"].map((s) => (
                    <button key={s} className="chip" onClick={() => setInput(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => <Bubble key={msg.id} msg={msg} />)}

            {loading && messages[messages.length - 1]?.streaming && (
              <div className="streaming-indicator">
                <span className="thinking-dots"><span /><span /><span /></span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="input-bar">
            <div className="input-wrap">
              <textarea ref={inputRef} className="input-field" placeholder="Ask MAX anything…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} rows={1} disabled={loading} />
              <VoiceInput onTranscript={(t) => { setInput(t); inputRef.current?.focus(); }} disabled={loading} />
              <button className={`send-btn ${loading ? "send-loading" : ""}`} onClick={send} disabled={loading || !input.trim()}>
                {loading ? (
                  <span className="thinking-dots"><span /><span /><span /></span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
              </button>
            </div>
            <p className="input-hint">Enter to send · Shift+Enter for newline · 🎤 for voice</p>
          </div>
        </main>

        <RightPanel tasks={tasks} onToggleTask={toggleTask} onAddTask={addTask} />
      </div>
    </>
  );
}
