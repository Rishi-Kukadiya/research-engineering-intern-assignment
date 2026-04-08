import { useState, useRef, useEffect } from "react";
import { api } from "../api/client";

const SUGGESTIONS = [
  "What are the most discussed topics?",
  "Summarize recent trends in the data.",
  "Which posts have the highest engagement?",
  "What themes appear most frequently?",
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      {!isUser && (
        <div className="msg-avatar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      )}
      <div className="msg-bubble">
        <p className="msg-text">{msg.content}</p>
        {msg.sources?.length > 0 && (
          <div className="msg-sources">
            <span className="sources-label">Sources:</span>
            {msg.sources.map((s, i) => (
              <span key={i} className="source-chip">{typeof s === "string" ? s : s.title || s.id || `#${i + 1}`}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your AI research assistant. Ask me anything about the dataset — I'll use the knowledge base to give you grounded, cited answers." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text = input) {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);
    try {
      const data = await api.chat(q);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, sources: data.sources }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const showSuggestions = messages.length <= 1;

  return (
    <div className="chat-shell">
      <div className="chat-messages">
        {messages.map((m, i) => <Message key={i} msg={m} />)}
        {loading && (
          <div className="message-row assistant">
            <div className="msg-avatar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="msg-bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        {showSuggestions && (
          <div className="suggestions-grid">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="suggestion-chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-bar">
        <textarea
          className="chat-textarea"
          rows={1}
          placeholder="Ask about the dataset…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
        />
        <button
          className="chat-send-btn"
          onClick={() => send()}
          disabled={loading || !input.trim()}
          aria-label="Send"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}