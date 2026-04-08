import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import { Card, Spinner, ErrorBox, Badge } from "../components/ui";

const COLORS = [
  "#4f8ef7", "#38d9a9", "#ffd43b", "#ff6b6b", "#cc5de8",
  "#74c0fc", "#63e6be", "#a9e34b", "#f783ac", "#e8590c",
  "#20c997", "#339af0", "#e64980", "#7950f2", "#fd7e14",
];

const CustomTreemapContent = ({ x, y, width, height, index, name, value }) => {
  const color = COLORS[index % COLORS.length];
  const showLabel = width > 60 && height > 40;
  return (
    <g>
      <rect
        x={x + 1}
        y={y + 1}
        width={width - 2}
        height={height - 2}
        style={{ fill: color, fillOpacity: 0.85, stroke: "var(--surface)", strokeWidth: 2, rx: 6 }}
        rx={6}
      />
      {showLabel && (
        <>
          <text x={x + 10} y={y + 22} fill="#fff" fontSize={12} fontWeight={600} fontFamily="Poppins">
            {name?.length > 18 ? name.slice(0, 18) + "…" : name}
          </text>
          <text x={x + 10} y={y + 38} fill="rgba(255,255,255,0.75)" fontSize={11} fontFamily="Poppins">
            {value} posts
          </text>
        </>
      )}
    </g>
  );
};

const TooltipContent = ({ active, payload }) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label">{d.label || d.name}</div>
      <div className="tooltip-row">
        <span>Posts:</span><strong>{d.size || d.value}</strong>
      </div>
    </div>
  );
};

export default function ClustersPage() {
  const { data, loading, error, refetch } = useFetch(api.topics);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} onRetry={refetch} />;

  const topics = data?.topics || [];
  const treemapData = topics.map((t) => ({ name: t.label, value: t.size, ...t }));

  return (
    <div className="page-grid">
      <Card title="Topic Distribution" className="chart-card">
        <ResponsiveContainer width="100%" height={380}>
          <Treemap
            data={treemapData}
            dataKey="value"
            content={<CustomTreemapContent />}
          >
            <Tooltip content={<TooltipContent />} />
          </Treemap>
        </ResponsiveContainer>
      </Card>

      <Card title="Topic Details" className="topics-list-card">
        <div className="topics-list">
          {topics.map((t, i) => (
            <div key={t.id} className="topic-row">
              <div className="topic-index" style={{ background: COLORS[i % COLORS.length] + "22", color: COLORS[i % COLORS.length] }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="topic-info">
                <div className="topic-name">{t.label}</div>
                <div className="topic-keywords">
                  {t.keywords.map((kw) => (
                    <Badge key={kw}>{kw}</Badge>
                  ))}
                </div>
              </div>
              <div className="topic-size">{t.size.toLocaleString()} <span>posts</span></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}