import { useState } from "react";
import { api } from "../api/client";
import { Card, Spinner, ErrorBox, EmptyState } from "../components/ui";

const EXAMPLE_QUERIES = [
  "climate change policy debate",
  "mental health awareness",
  "cryptocurrency regulation",
  "misinformation on social media",
];

function ResultCard({ item, index }) {
  const meta = item.metadata || {};
  const score = meta.score ?? "—";
  const author = meta.author ?? "unknown";
  const subreddit = meta.subreddit ?? null;
  const domain = meta.domain ?? null;
  const flair = meta.flair && meta.flair !== "nan" ? meta.flair : null;
  const createdUtc = meta.created_utc
    ? new Date(meta.created_utc * 1000).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
      })
    : null;
  const similarity = item.distance != null
    ? (1 - item.distance).toFixed(3)
    : null;

  const simValue = similarity ? parseFloat(similarity) : 0;
  const simColor =
    simValue > 0.75 ? "var(--accent2)" :
    simValue > 0.55 ? "var(--accent)" :
    "var(--text-muted)";

  return (
    <div className="result-card">
      <div className="rc-rank">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="rc-body">
        <p className="rc-text">{item.document}</p>
        <div className="rc-meta">
          {author && (
            <span className="rc-chip rc-chip-author">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {author}
            </span>
          )}
          {subreddit && (
            <span className="rc-chip rc-chip-sub">r/{subreddit}</span>
          )}
          {flair && (
            <span className="rc-chip rc-chip-flair">{flair}</span>
          )}
          {domain && (
            <span className="rc-chip rc-chip-domain">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              {domain}
            </span>
          )}
          {createdUtc && (
            <span className="rc-chip rc-chip-date">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {createdUtc}
            </span>
          )}
        </div>
      </div>

      <div className="rc-stats">
        <div className="rc-stat-pill">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
          <span className="rc-stat-val">{score}</span>
          <span className="rc-stat-label">score</span>
        </div>

        {similarity && (
          <div className="rc-similarity">
            <div className="rc-sim-header">
              <span className="rc-stat-label">similarity</span>
              <span className="rc-sim-value" style={{ color: simColor }}>{similarity}</span>
            </div>
            <div className="rc-sim-track">
              <div
                className="rc-sim-fill"
                style={{ width: `${Math.min(simValue * 100, 100)}%`, background: simColor }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(10);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(q = query) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.search(q, topK);
      setResults(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="page-grid">
      <Card title="Vector Search" className="search-card">
        <div className="search-bar">
          <div className="search-input-wrap">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search posts semantically…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKey}
            />
          </div>
          <div className="search-controls">
            <label className="top-k-label">
              Top
              <select className="top-k-select" value={topK} onChange={(e) => setTopK(Number(e.target.value))}>
                {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              results
            </label>
            <button className="btn-primary" onClick={() => handleSearch()} disabled={loading || !query.trim()}>
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </div>

        <div className="example-queries">
          <span className="examples-label">Try:</span>
          {EXAMPLE_QUERIES.map((q) => (
            <button key={q} className="example-chip" onClick={() => { setQuery(q); handleSearch(q); }}>
              {q}
            </button>
          ))}
        </div>
      </Card>

      {loading && <Spinner />}
      {error && <ErrorBox message={error} onRetry={() => handleSearch()} />}

      {results && !loading && (
        <Card
          title="Results"
          action={<span className="result-count">{results.total} found</span>}
        >
          {results.results.length === 0 ? (
            <EmptyState message="No matching posts found." />
          ) : (
            <div className="results-list">
              {results.results.map((item, i) => (
                <ResultCard key={item.id ?? i} item={item} index={i} />
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}