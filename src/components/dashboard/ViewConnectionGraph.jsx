import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { useNavigate } from "react-router-dom";

const ViewConnectionGraph = ({
    nodes = [],
    links = [],
    height = 560,
    title = "Connection Network",
}) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [width, setWidth] = useState(0);
    const navigate = useNavigate();

    /* ---------- Resize ---------- */
    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            setWidth(entries[0].contentRect.width);
        });

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!width || !nodes.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        /* ---------- Merge Links ---------- */
        const merged = new Map();

        links.forEach((l) => {
            const key = `${l.source}-${l.target}`;
            if (!merged.has(key)) {
                merged.set(key, {
                    source: l.source,
                    target: l.target,
                    types: new Set([l.type]),
                });
            } else {
                merged.get(key).types.add(l.type);
            }
        });

        const simulationLinks = Array.from(merged.values()).map((l) => ({
            source: l.source,
            target: l.target,
            type: l.types.size === 2 ? "both" : [...l.types][0],
        }));

        const simulationNodes = nodes.map((n) => ({ ...n }));

        /* ---------- Arrow ---------- */
        svg.append("defs")
            .append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 18)
            .attr("refY", 0)
            .attr("markerWidth", 5)
            .attr("markerHeight", 5)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#9ca3af");

        const g = svg.append("g");

        svg.call(
            d3.zoom()
                .scaleExtent([0.8, 2])
                .on("zoom", (event) => {
                    g.attr("transform", event.transform);
                })
        );

        const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

        const linkColor = (type) => {
            if (type === "view") return "#ef4444";
            if (type === "community") return "#10b981";
            if (type === "both") return "#8b5cf6";
            return "#cbd5e1";
        };

        const simulation = d3
            .forceSimulation(simulationNodes)
            .force(
                "link",
                d3.forceLink(simulationLinks)
                    .id((d) => d.id)
                    .distance(65)
            )
            .force("charge", d3.forceManyBody().strength(-110))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(22))
            .force("x", d3.forceX(width / 2).strength(0.08))
            .force("y", d3.forceY(height / 2).strength(0.08))
            .alphaDecay(0.07);

        const link = g.append("g")
            .selectAll("line")
            .data(simulationLinks)
            .join("line")
            .attr("stroke", (d) => linkColor(d.type))
            .attr("stroke-width", (d) => (d.type === "both" ? 3.5 : 2))
            .attr("stroke-dasharray", (d) =>
                d.type === "community" ? "5 3" : null
            )
            .attr("marker-end", "url(#arrow)")
            .attr("opacity", 0.85);

        const node = g.append("g")
            .selectAll("g")
            .data(simulationNodes)
            .join("g")
            .call(
                d3.drag()
                    .on("start", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    })
                    .on("drag", (event, d) => {
                        d.fx = event.x;
                        d.fy = event.y;
                    })
                    .on("end", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                    })
            );

        node.append("circle")
            .attr("r", 18)
            .attr("fill", (d) => colorScale(d.group))
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);

        node.append("text")
            .text((d) =>
                d.label
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase()
            )
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", "#fff")
            .attr("font-size", 10)
            .attr("font-weight", 600)
            .style("pointer-events", "none");

        /* ---------- Tooltip ---------- */
        const tooltip = d3.select(containerRef.current)
            .append("div")
            .style("position", "absolute")
            .style("background", "#111827")
            .style("color", "#fff")
            .style("padding", "10px 14px")
            .style("border-radius", "12px")
            .style("font-size", "12px")
            .style("line-height", "1.4")
            .style("box-shadow", "0 10px 30px rgba(0,0,0,0.25)")
            .style("pointer-events", "auto") // changed
            .style("opacity", 0)
            .style("transition", "opacity 0.15s ease");

        function positionTooltip(event) {
            const [x, y] = d3.pointer(event, containerRef.current);
            tooltip.style("left", x + 12 + "px").style("top", y + 12 + "px");
        }

        function highlightConnections(selectedNode) {
            const connectedIds = new Set();

            simulationLinks.forEach((l) => {
                if (l.source.id === selectedNode.id)
                    connectedIds.add(l.target.id);
                if (l.target.id === selectedNode.id)
                    connectedIds.add(l.source.id);
            });

            node.selectAll("circle").attr("opacity", (d) =>
                d.id === selectedNode.id || connectedIds.has(d.id) ? 1 : 0.2
            );

            link.attr("opacity", (l) =>
                l.source.id === selectedNode.id ||
                    l.target.id === selectedNode.id
                    ? 1
                    : 0.1
            );
        }

        function resetHighlight() {
            node.selectAll("circle").attr("opacity", 1);
            link.attr("opacity", 0.85);
        }

        node.on("mousemove", (event, d) => {
            tooltip.html(`
                <div style="display:flex; justify-content:space-between; align-items:start; gap:8px;">
                    <div>
                        <div style="font-weight:600; margin-bottom:4px;">
                            ${d.label}
                        </div>
                        <div style="opacity:0.8; margin-bottom:4px;">
                            ${d.profession ?? ""}
                        </div>
                        <div style="font-size:11px; opacity:0.7;">
                            Connections: <strong>${d.connections ?? 0}</strong>
                        </div>
                    </div>

                    <button id="redirect-btn"
                        style="background:#3b82f6;color:white;border:none;padding:4px 8px;border-radius:6px;cursor:pointer;font-size:11px;">
                        →
                    </button>
                </div>
            `).style("opacity", 1);

            tooltip.select("#redirect-btn")
                .on("click", (e) => {
                    e.stopPropagation();
                    navigate(`/user/${d.id}`);
                });

            positionTooltip(event);
            highlightConnections(d);
        });

        containerRef.current.addEventListener("mouseleave", () => {
            tooltip.style("opacity", 0);
            resetHighlight();
        });

        simulation.on("tick", () => {
            link
                .attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => {
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    return d.target.x - (dx / dist) * 22;
                })
                .attr("y2", (d) => {
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    return d.target.y - (dy / dist) * 22;
                });

            node.attr("transform", (d) => `translate(${d.x},${d.y})`);
        });

        return () => {
            simulation.stop();
            tooltip.remove();
        };
    }, [nodes, links, width, height]);

    return (
        <div
            ref={containerRef}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative"
        >
            <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">
                {title}
            </h3>

            <div className="flex gap-8 mb-5 text-xs text-gray-600">
                <Legend color="bg-red-500" label="View" />
                <Legend color="bg-emerald-500" dashed label="Community" />
                <Legend color="bg-purple-500" label="Both" />
            </div>

            {nodes.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    No connection data available
                </div>
            ) : (
                <svg ref={svgRef} width={width} height={height} />
            )}
        </div>
    );
};

const Legend = ({ color, label, dashed }) => (
    <div className="flex items-center gap-2">
        <div
            className={`w-5 h-[3px] ${color} ${dashed ? "border-t border-dashed border-current" : ""}`}
        />
        <span>{label}</span>
    </div>
);

export default ViewConnectionGraph;