import { useState, useEffect, useRef, useCallback } from "react";

const API = "http://localhost:8000";

// ── Utilities ──────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

// ── Orb ────────────────────────────────────────────────────────────────────

function Orb({ active }) {
  return (
    <div className={`orb-wrap ${active ? "orb-active" : ""}`}>
      <div className="orb-ring r1" />
      <div className="orb-ring r2" />
      <div className="orb-ring r3" />
      <div className="orb-core">
        <span className="orb-letter">M</span>
      </div>
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
        <span className="thinking-dots">
          <span /><span /><span />
        </span>
        <span>{event.text}</span>
      </div>
    );
  }
  return null;
}

// ── Message Bubble ─────────────────────────────────────────────────────────

function Bubble({ msg }) {
  const isUser = msg.role === "user";

  // Render markdown-ish code blocks
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

// ── Sidebar ────────────────────────────────────────────────────────────────

function Sidebar({ sessions, currentSession, onSelect, onNew, onDelete }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-max">MAX</span>
          <span className="logo-sub">agent</span>
        </div>
        <button className="btn-new" onClick={onNew} title="New session">
          +
        </button>
      </div>

      <div className="sidebar-sessions">
        {sessions.length === 0 && (
          <p className="sidebar-empty">No sessions yet</p>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`session-item ${s.id === currentSession ? "session-active" : ""}`}
            onClick={() => onSelect(s.id)}
          >
            <span className="session-title">{s.title || s.id.slice(0, 8)}</span>
            <span className="session-time">{formatTime(s.last_active)}</span>
            <button
              className="session-delete"
              onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
              title="Delete"
            >×</button>
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
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load sessions & health
  useEffect(() => {
    fetchSessions();
    fetch(`${API}/health`)
      .then((r) => r.json())
      .then((d) => setProviders(d.providers || []))
      .catch(() => {});
  }, []);

  // Load history when session changes
  useEffect(() => {
    if (!currentSession) return;
    fetch(`${API}/history/${currentSession}`)
      .then((r) => r.json())
      .then((history) => {
        setMessages(
          history.map((m) => ({
            id: uid(),
            role: m.role,
            content: m.content,
            events: [],
            time: "",
          }))
        );
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

  function newSession() {
    setCurrentSession(uid());
    setMessages([]);
    fetchSessions();
  }

  async function deleteSession(id) {
    await fetch(`${API}/session/${id}`, { method: "DELETE" });
    if (id === currentSession) newSession();
    fetchSessions();
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);

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
              }
              updated[idx] = m;
              return updated;
            });
          } catch {}
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((m) => m.id === agentMsg.id);
        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            content: "⚠️ Connection error. Is the MAX backend running?",
            streaming: false,
          };
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
      <div className="layout">
        <Sidebar
          sessions={sessions}
          currentSession={currentSession}
          onSelect={(id) => setCurrentSession(id)}
          onNew={newSession}
          onDelete={deleteSession}
        />

        <main className="main">
          {/* Header */}
          <header className="topbar">
            <div className="topbar-left">
              <Orb active={loading} />
              <div className="topbar-info">
                <span className="topbar-title">MAX</span>
                <span className="topbar-sub">Multi-Agent eXecutor</span>
              </div>
            </div>
            <div className="topbar-providers">
              {providers.length === 0 ? (
                <span className="provider-badge offline">⚠ no provider</span>
              ) : (
                providers.map((p) => (
                  <span key={p} className="provider-badge online">{p}</span>
                ))
              )}
            </div>
          </header>

          {/* Messages */}
          <div className="messages">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-orb">
                  <Orb active={false} />
                </div>
                <h2 className="empty-title">MAX is ready.</h2>
                <p className="empty-sub">
                  Local autonomous AI agent. No cloud. No limits.
                </p>
                <div className="empty-chips">
                  {["Write a Python script", "Search my files", "Remember my name is Lévy", "Run ls -la"].map((s) => (
                    <button key={s} className="chip" onClick={() => setInput(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <Bubble key={msg.id} msg={msg} />
            ))}

            {loading && messages[messages.length - 1]?.streaming && (
              <div className="streaming-indicator">
                <span className="thinking-dots"><span /><span /><span /></span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="input-bar">
            <div className="input-wrap">
              <textarea
                ref={inputRef}
                className="input-field"
                placeholder="Ask MAX anything…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                disabled={loading}
              />
              <button
                className={`send-btn ${loading ? "send-loading" : ""}`}
                onClick={send}
                disabled={loading || !input.trim()}
              >
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
            <p className="input-hint">Enter to send · Shift+Enter for newline</p>
          </div>
        </main>
      </div>
    </>
  );
}
