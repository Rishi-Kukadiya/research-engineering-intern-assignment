const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  chat: (message) =>
    request("/chat/message", { method: "POST", body: JSON.stringify({ message }) }),

  topics: () => request("/clusters/topics"),

  networkGraph: () => request("/network/graph"),

  search: (query, top_k = 10) =>
    request("/search/semantic", { method: "POST", body: JSON.stringify({ query, top_k }) }),

  timeseries: () => request("/timeseries/posts"),
  postById: (id) => request(`/posts/${id}`),
  analysisGraph1: () => request("/analytics/anomalies"),
  analysisGraph2: () => request("/analytics/polarization"),
};