import React from "react";
import {
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { api } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import { Card, Spinner, ErrorBox } from "../components/ui";


// Helper to truncate long titles
function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n - 1) + "…" : str;
}

// Custom YAxis tick for truncation + tooltip
const CustomYAxisTick = (props) => {
  const { x, y, payload } = props;
  const title = payload.value;
  return (
    <g transform={`translate(${x},${y})`}>
      <title>{title}</title>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#7b8285" fontSize={12}>
        {truncate(title, 40)}
      </text>
    </g>
  );
};

// Custom Tooltip with full title and author
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label" style={{ fontWeight: 600 }}>{data?.title}</div>
      {data?.author && <div>Author: {data.author}</div>}
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

export default function AnalysisPage() {
  const { data: graph1, loading: loading1, error: error1, refetch: refetch1 } = useFetch(api.analysisGraph1);
  const { data: graph2, loading: loading2, error: error2, refetch: refetch2 } = useFetch(api.analysisGraph2);


  return (
    <div className="page-grid">
      <Card title="Anomalies (Top Posts by Score)">
        {loading1 ? <Spinner /> : error1 ? <ErrorBox message={error1} onRetry={refetch1} /> : (
          <ResponsiveContainer width="100%" height={Math.max(360, (graph1?.anomalies?.length || 10) * 32)}>
            <ComposedChart
              data={graph1?.anomalies || []}
              margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="score" />
              <YAxis type="category" dataKey="title" width={220} tick={<CustomYAxisTick />} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="score" fill="#4f8ef7" name="Score" />
              <Bar dataKey="num_comments" fill="#7b8285" name="Comments" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Card>
      <Card title="Polarization (Citations by Source & Topic)">
        {loading2 ? <Spinner /> : error2 ? <ErrorBox message={error2} onRetry={refetch2} /> : (
          <ResponsiveContainer width="100%" height={Math.max(360, (graph2?.polarization?.length || 10) * 32)}>
            <ComposedChart
              data={graph2?.polarization || []}
              margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="citation_count" />
              <YAxis
                type="category"
                dataKey={d => `${truncate(d.topic_category, 18)} | ${truncate(d.media_source, 18)}`}
                width={260}
                tick={({ x, y, payload }) => {
                  const label = payload.value;
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <title>{label}</title>
                      <text x={0} y={0} dy={4} textAnchor="end" fill="#7b8285" fontSize={12}>{label}</text>
                    </g>
                  );
                }}
              />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="chart-tooltip">
                    <div className="tooltip-label" style={{ fontWeight: 600 }}>{d?.topic_category} | {d?.media_source}</div>
                    <div>Citations: {d?.citation_count}</div>
                    <div>Avg Engagement: {d?.avg_engagement}</div>
                  </div>
                );
              }} />
              <Legend />
              <Bar dataKey="citation_count" fill="#4f8ef7" name="Citations" />
              <Bar dataKey="avg_engagement" fill="#38d9a9" name="Avg Engagement" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
