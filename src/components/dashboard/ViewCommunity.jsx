import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const ViewCommunity = ({
    nodes = [],
    links = [],
    height = 520, // slightly smaller height
    title = "Community Network",
}) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [width, setWidth] = useState(0);

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

        const communityLinks = links.filter((l) => l.type === "community");

        const simulationNodes = nodes.map((n) => ({ ...n }));
        const simulationLinks = communityLinks.map((l) => ({ ...l }));

        const g = svg.append("g");

        // Zoom
        svg.call(
            d3.zoom()
                .scaleExtent([0.8, 2])
                .on("zoom", (event) => {
                    g.attr("transform", event.transform);
                })
        );

        const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

        // 🔥 ULTRA COMPACT FORCES
        const simulation = d3
            .forceSimulation(simulationNodes)
            .force(
                "link",
                d3.forceLink(simulationLinks)
                    .id((d) => d.id)
                    .distance(50) // very tight spacing
            )
            .force("charge", d3.forceManyBody().strength(-85)) // low repulsion
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(20)) // small gap
            .force("x", d3.forceX(width / 2).strength(0.1)) // pull inward
            .force("y", d3.forceY(height / 2).strength(0.1))
            .alphaDecay(0.08);

        // Links
        const link = g
            .append("g")
            .selectAll("line")
            .data(simulationLinks)
            .join("line")
            .attr("stroke", "#10b981")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4 3")
            .attr("opacity", 0.8);

        // Nodes
        const node = g
            .append("g")
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

        // 🔹 Smaller circles
        node.append("circle")
            .attr("r", 16)
            .attr("fill", (d) => colorScale(d.group))
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);

        // Smaller initials
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

        // Tooltip
        const tooltip = d3
            .select(containerRef.current)
            .append("div")
            .style("position", "absolute")
            .style("background", "#111827")
            .style("color", "#fff")
            .style("padding", "10px 14px")
            .style("border-radius", "12px")
            .style("font-size", "12px")
            .style("line-height", "1.4")
            .style("box-shadow", "0 10px 30px rgba(0,0,0,0.25)")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("transition", "opacity 0.15s ease")
            .style("max-width", "220px");

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
            link.attr("opacity", 0.8);
        }

        node
            .on("mousemove", (event, d) => {
                tooltip
                    .html(`
                        <div style="font-weight:600; margin-bottom:4px;">
                            ${d.label}
                        </div>
                        <div style="opacity:0.8; margin-bottom:4px;">
                            ${d.profession}
                        </div>
                        <div style="font-size:11px; opacity:0.7;">
                            Connections: 
                            <strong>${d.connections ?? 0}</strong>
                        </div>
                    `)
                    .style("opacity", 1);

                positionTooltip(event);
                highlightConnections(d);
            })
            .on("mouseleave", () => {
                tooltip.style("opacity", 0);
                resetHighlight();
            });

        simulation.on("tick", () => {
            link
                .attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);

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

            <div className="flex gap-4 mb-5 text-xs text-gray-600">
                <Legend color="bg-emerald-500" dashed label="Community" />
            </div>

            {nodes.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    No community data available
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
            className={`w-5 h-[3px] ${color} ${dashed ? "border-t border-dashed border-current" : ""
                }`}
        />
        <span>{label}</span>
    </div>
);

export default ViewCommunity;
