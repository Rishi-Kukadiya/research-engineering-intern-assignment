import { useState } from "react";
import { api } from "../api/client";
import { Card, Spinner, ErrorBox, Badge, EmptyState } from "../components/ui";

const EXAMPLE_QUERIES = [
  "climate change policy debate",
  "mental health awareness",
  "cryptocurrency regulation",
  "misinformation on social media",
];

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
            <button
              key={q}
              className="example-chip"
              onClick={() => { setQuery(q); handleSearch(q); }}
            >
              {q}
            </button>
          ))}
        </div>
      </Card>

      {loading && <Spinner />}
      {error && <ErrorBox message={error} onRetry={() => handleSearch()} />}

      {results && !loading && (
        <Card
          title={`Results`}
          action={<span className="result-count">{results.total} found</span>}
        >
          {results.results.length === 0 ? (
            <EmptyState message="No matching posts found." />
          ) : (
            <div className="results-list">
              {results.results.map((item, i) => (
                <div key={i} className="result-item">
                  <div className="result-rank">#{i + 1}</div>
                  <div className="result-content">
                    <p className="result-text">{item.text || item.body || item.title || JSON.stringify(item)}</p>
                    <div className="result-meta">
                      {item.score !== undefined && (
                        <Badge variant="accent">Score {typeof item.score === "number" ? item.score.toFixed(3) : item.score}</Badge>
                      )}
                      {item.subreddit && <Badge>{item.subreddit}</Badge>}
                      {item.date && <span className="result-date">{item.date}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}