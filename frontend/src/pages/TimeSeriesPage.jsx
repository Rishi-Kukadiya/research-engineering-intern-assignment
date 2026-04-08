import { useMemo } from "react";
import {
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { api } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import { Card, Spinner, ErrorBox, StatCard } from "../components/ui";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="tooltip-row">
          <span className="tooltip-dot" style={{ background: p.color }} />
          <span>{p.name}:</span>
          <strong>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function TimeSeriesPage() {
  const { data, loading, error, refetch } = useFetch(api.timeseries);

  const stats = useMemo(() => {
    if (!data?.series?.length) return null;
    const s = data.series;
    const total = s.reduce((a, b) => a + b.count, 0);
    const maxDay = s.reduce((a, b) => (b.count > a.count ? b : a));
    const avgScore = (s.reduce((a, b) => a + b.avg_score, 0) / s.length).toFixed(2);
    return { total, maxDay, avgScore, days: s.length };
  }, [data]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} onRetry={refetch} />;

  const series = data?.series || [];

  return (
    <div className="page-grid">
      {stats && (
        <div className="stats-row">
          <StatCard
            label="Total Posts"
            value={stats.total.toLocaleString()}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
          />
          <StatCard
            label="Days Tracked"
            value={stats.days}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          />
          <StatCard
            label="Peak Day"
            value={stats.maxDay.count.toLocaleString()}
            sub={stats.maxDay.date}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
          />
          <StatCard
            label="Avg Score"
            value={stats.avgScore}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
          />
        </div>
      )}

      <Card title="Post Volume Over Time" className="chart-card">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "Poppins" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.slice(5)}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "Poppins" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "Poppins" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontFamily: "Poppins", fontSize: 12, paddingTop: 12 }} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="count"
              name="Post Count"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#postGrad)"
              dot={false}
            />
            <Bar
              yAxisId="right"
              dataKey="avg_score"
              name="Avg Score"
              fill="var(--accent2)"
              opacity={0.7}
              radius={[2, 2, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}