import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { api } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import { Spinner, ErrorBox } from "../components/ui";

function NetworkCanvas({ nodes, links }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!nodes?.length || !svgRef.current) return;

    const el = svgRef.current;
    const rect = el.getBoundingClientRect();
    const W = rect.width || 900;
    const H = rect.height || 560;

    d3.select(el).selectAll("*").remove();

    const svg = d3.select(el)
      .attr("viewBox", `0 0 ${W} ${H}`)
      .style("width", "100%")
      .style("height", "100%");

    // Zoom
    const g = svg.append("g");
    svg.call(
      d3.zoom()
        .scaleExtent([0.15, 4])
        .on("zoom", (e) => g.attr("transform", e.transform))
    );

    // Degree map for sizing
    const degMap = {};
    links.forEach(({ source, target }) => {
      degMap[source] = (degMap[source] || 0) + 1;
      degMap[target] = (degMap[target] || 0) + 1;
    });
    const maxDeg = Math.max(...Object.values(degMap), 1);

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    // Simulation
    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance(80).strength(0.4))
      .force("charge", d3.forceManyBody().strength(-220))
      .force("center", d3.forceCenter(W / 2, H / 2))
      .force("collision", d3.forceCollide().radius((d) => nodeR(d) + 4))
      .alphaDecay(0.03);

    function nodeR(d) {
      const deg = degMap[d.id] || 1;
      return 5 + (deg / maxDeg) * 22;
    }

    // Edges
    const link = g.append("g").attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "var(--border)")
      .attr("stroke-width", (d) => Math.sqrt(d.weight || 1) * 0.8 + 0.5)
      .attr("stroke-opacity", 0.5);

    // Nodes
    const node = g.append("g").attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(
        d3.drag()
          .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
          .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      )
      .on("mouseenter", (e, d) => setTooltip({ x: e.clientX, y: e.clientY, d }))
      .on("mouseleave", () => setTooltip(null));

    node.append("circle")
      .attr("r", nodeR)
      .attr("fill", (d) => colorScale(d.group || d.community || 0))
      .attr("fill-opacity", 0.88)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .style("cursor", "grab");

    node.append("text")
      .text((d) => {
        const label = d.label || d.id || "";
        const r = nodeR(d);
        return r > 12 ? (label.length > 14 ? label.slice(0, 14) + "…" : label) : "";
      })
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#fff")
      .attr("font-size", (d) => Math.max(8, nodeR(d) * 0.55))
      .attr("font-family", "Poppins, sans-serif")
      .attr("font-weight", "600")
      .style("pointer-events", "none")
      .style("user-select", "none");

    sim.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => sim.stop();
  }, [nodes, links]);

  return (
    <div className="network-wrap" style={{ position: "relative" }}>
      <svg ref={svgRef} style={{ width: "100%", height: 560, display: "block" }} />
      {tooltip && (
        <div
          className="chart-tooltip"
          style={{ position: "fixed", left: tooltip.x + 12, top: tooltip.y - 8, pointerEvents: "none", zIndex: 99 }}
        >
          <div className="tooltip-label">{tooltip.d.label || tooltip.d.id}</div>
          {tooltip.d.group !== undefined && (
            <div className="tooltip-row"><span>Group:</span><strong>{tooltip.d.group}</strong></div>
          )}
        </div>
      )}
      <div className="network-hint">Scroll to zoom · Drag to pan · Drag nodes to reposition</div>
    </div>
  );
}

export default function NetworkPage() {
  const { data, loading, error, refetch } = useFetch(api.networkGraph);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} onRetry={refetch} />;

  const nodes = data?.nodes || [];
  const links = data?.edges || data?.links || [];

  return (
    <div className="page-grid">
      <div className="network-stats-bar">
        <div className="net-stat"><span>{nodes.length}</span> Nodes</div>
        <div className="net-stat"><span>{links.length}</span> Edges</div>
        <div className="net-divider" />
        <p className="net-hint">Node size = connection degree · Color = community group</p>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <NetworkCanvas nodes={nodes} links={links} />
      </div>
    </div>
  );
}