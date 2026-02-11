import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const D3NetworkGraph = ({
    nodes = [],
    links = [],
    title = "Network Graph",
    height = 480,
}) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height });
    const [tooltip, setTooltip] = useState({
        show: false,
        x: 0,
        y: 0,
        content: "",
    });

    // Resize observer
    useEffect(() => {
        const obs = new ResizeObserver((entries) => {
            const { width } = entries[0].contentRect;
            if (width > 0) setDimensions({ width, height });
        });

        if (containerRef.current) obs.observe(containerRef.current);
        return () => obs.disconnect();
    }, [height]);

    useEffect(() => {
        if (!svgRef.current || dimensions.width === 0 || nodes.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const w = dimensions.width;
        const h = dimensions.height;

        const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

        // IMPORTANT: clone links so D3 mutation doesn't affect original
        const simulationLinks = links.map(l => ({ ...l }));

        const simulation = d3
            .forceSimulation(nodes)
            .force(
                "link",
                d3
                    .forceLink(simulationLinks)
                    .id(d => d.id)
                    .distance(50)
                    .strength(1)
            )
            .force("charge", d3.forceManyBody().strength(-80))
            .force("collision", d3.forceCollide().radius(d => 12 + (d.connections || 0)))
            .force("center", d3.forceCenter(w / 2, h / 2))
            .force("x", d3.forceX(w / 2).strength(0.05))
            .force("y", d3.forceY(h / 2).strength(0.05));

        const g = svg.append("g");

        // Zoom
        svg.call(
            d3.zoom().scaleExtent([0.3, 3]).on("zoom", (event) => {
                g.attr("transform", event.transform);
            })
        );

        // Links
        const link = g
            .append("g")
            .attr("stroke", "#cbd5e1")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(simulationLinks)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value || 1));

        // Nodes
        const node = g
            .append("g")
            .selectAll("g")
            .data(nodes)
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
            .attr("r", d => 12 + (d.connections || 0))
            .attr("fill", d => colorScale(d.group))
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .style("cursor", "pointer");

        node.append("text")
            .text(d => d.label || d.id[0])
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", "#fff")
            .attr("font-size", "8px")
            .attr("font-weight", 600)
            .style("pointer-events", "none");

        // ✅ FIXED: Get connection NAMES instead of IDs
        const getConnections = (nodeId) => {
            const connectedNames = new Set();

            simulationLinks.forEach((l) => {
                const sourceId = l.source.id;
                const targetId = l.target.id;

                if (sourceId === nodeId) {
                    connectedNames.add(l.target.label);
                }

                if (targetId === nodeId) {
                    connectedNames.add(l.source.label);
                }
            });

            return Array.from(connectedNames);
        };

        // Hover interaction
        node.on("mouseover", (event, d) => {
            const rect = containerRef.current.getBoundingClientRect();
            const connections = getConnections(d.id);
            const visible = connections.slice(0, 3);
            const remaining = connections.length - visible.length;

            const tooltipHtml = `
                <div style="font-weight:600;margin-bottom:4px">
                    ${d.label} · ${connections.length} connections
                </div>
                ${visible.map(name => `<div>${name}</div>`).join("")}
                ${
                    remaining > 0
                        ? `<div style="opacity:.7;margin-top:4px">+${remaining} more</div>`
                        : ""
                }
            `;

            setTooltip({
                show: true,
                x: event.clientX - rect.left,
                y: event.clientY - rect.top - 8,
                content: tooltipHtml,
            });

            const connectedIds = new Set([
                d.id,
                ...simulationLinks
                    .filter(l => l.source.id === d.id || l.target.id === d.id)
                    .flatMap(l => [l.source.id, l.target.id])
            ]);

            node.select("circle")
                .attr("opacity", n => (connectedIds.has(n.id) ? 1 : 0.2));

            link.attr("stroke-opacity", l =>
                l.source.id === d.id || l.target.id === d.id ? 0.9 : 0.1
            );
        })
        .on("mouseout", () => {
            setTooltip({ show: false, x: 0, y: 0, content: "" });
            node.select("circle").attr("opacity", 1);
            link.attr("stroke-opacity", 0.6);
        });

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        return () => simulation.stop();
    }, [dimensions, nodes, links]);

    return (
        <div
            ref={containerRef}
            className="bg-card border border-border rounded-xl p-4 relative"
        >
            <h3 className="text-sm font-medium text-muted-foreground mb-3 font-mono tracking-wide uppercase">
                {title}
            </h3>

            <p className="text-xs text-muted-foreground mb-3">
                Drag · Zoom · Hover To Highlight Connections
            </p>

            <svg ref={svgRef} width={dimensions.width} height={height} />

            {tooltip.show && (
                <div
                    className="d3-tooltip"
                    style={{
                        position: "absolute",
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: "translate(-50%, -100%)",
                        pointerEvents: "none",
                        background: "white",
                        color: "black",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                        maxWidth: "220px",
                    }}
                    dangerouslySetInnerHTML={{ __html: tooltip.content }}
                />
            )}
        </div>
    );
};

export default D3NetworkGraph;
