
import { useState, useRef, useEffect } from "react";
import { api } from "../api/client";
import "./ChatPage.css";

const SUGGESTIONS = [
  "What are the most discussed topics?",
  "Summarize recent trends in the data.",
  "Which posts have the highest engagement?",
  "What themes appear most frequently?",
];

function Message({ msg, onPostClick }) {
  const isUser = msg.role === "user";
  // Just show the content as plain text (no clickable IDs in text)
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
            {msg.sources.map((s, i) => {
              // If s is an object with an id, make it clickable
              if (s && typeof s === "object" && s.id) {
                return (
                  <span
                    key={i}
                    className="source-chip post-link"
                    style={{ cursor: "pointer", color: "var(--accent)", textDecoration: "underline" }}
                    onClick={() => onPostClick?.(s.id)}
                  >
                    {s.id}
                  </span>
                );
              }
              // fallback for string or missing id
              return (
                <span key={i} className="source-chip">{typeof s === "string" ? s : s.title || s.id || `#${i + 1}`}</span>
              );
            })}
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
  const [postData, setPostData] = useState(null);
  const [postLoading, setPostLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, postData]);

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

  // Handler for clicking a post ID
  async function handlePostClick(postId) {
    setPostLoading(true);
    setPostData(null);
    try {
      const data = await api.postById(postId);
      setPostData(data);
    } catch (e) {
      setPostData({ error: e.message });
    } finally {
      setPostLoading(false);
    }
  }

  // Only show necessary fields
  function PostDetails({ post, onClose }) {
    if (!post) return null;
    if (post.error) return (
      <div className="post-details-modal">
        <div className="post-details-card">
          <button className="close-btn" onClick={onClose}>×</button>
          <div className="post-error">{post.error}</div>
        </div>
      </div>
    );
    return (
      <div className="post-details-modal">
        <div className="post-details-card">
          <button className="close-btn" onClick={onClose}>×</button>
          <h2 className="post-title">{post.title}</h2>
          <div className="post-meta">
            <span>By <b>{post.author}</b></span> | <span>Subreddit: <b>{post.subreddit}</b></span> | <span>Score: <b>{post.score}</b></span>
          </div>
          {post.thumbnail && post.thumbnail.startsWith("http") && (
            <img className="post-thumb" src={post.thumbnail} alt="thumbnail" />
          )}
          {post.selftext && <div className="post-body">{post.selftext}</div>}
          {post.url && (
            <div className="post-link"><a href={post.url} target="_blank" rel="noopener noreferrer">Read more</a></div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-shell">
      <div className="chat-messages">
        {messages.map((m, i) => (
          <Message key={i} msg={m} onPostClick={handlePostClick} />
        ))}
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

      {/* Post details modal/card */}
      {(postLoading || postData) && (
        <PostDetails post={postLoading ? null : postData} onClose={() => setPostData(null)} />
      )}
    </div>
  );
}