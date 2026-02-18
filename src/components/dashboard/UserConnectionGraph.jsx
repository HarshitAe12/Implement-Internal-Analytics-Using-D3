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

    /* ---------------- Resize Observer ---------------- */
    useEffect(() => {
        const obs = new ResizeObserver((entries) => {
            const { width } = entries[0].contentRect;
            if (width > 0) setDimensions({ width, height });
        });

        if (containerRef.current) obs.observe(containerRef.current);
        return () => obs.disconnect();
    }, [height]);

    /* ---------------- Main Graph ---------------- */
    useEffect(() => {
        if (!svgRef.current || dimensions.width === 0 || nodes.length === 0)
            return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const w = dimensions.width;
        const h = dimensions.height;

        const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

        // Clone data (avoid mutation)
        const simulationNodes = nodes.map((n) => ({ ...n }));
        const simulationLinks = links.map((l) => ({ ...l }));

        /* ----------- Better Radius Scaling ----------- */
        const getRadius = (d) => 12 + Math.sqrt(d.connections || 1) * 5;

        /* ----------- Handle Duplicate Initials ----------- */
        const initialsMap = {};

        simulationNodes.forEach((n) => {
            if (!n.label) return;

            const parts = n.label.split(" ");
            const base =
                parts.length > 1
                    ? parts[0][0] + parts[1][0]
                    : parts[0][0];

            initialsMap[base] = (initialsMap[base] || 0) + 1;
        });

        const getInitials = (label, id) => {
            if (!label) return id[0];

            const parts = label.split(" ");
            let initials =
                parts.length > 1
                    ? parts[0][0] + parts[1][0]
                    : parts[0][0];

            if (initialsMap[initials] > 1) {
                return parts[0].slice(0, 3).toUpperCase();
            }

            return initials.toUpperCase();
        };

        /* ----------- Simulation (Compact Layout) ----------- */
        const simulation = d3
            .forceSimulation(simulationNodes)
            .force(
                "link",
                d3
                    .forceLink(simulationLinks)
                    .id((d) => d.id)
                    .distance(55)     //  Reduced from 80 → closer links
                    .strength(1.1)      // Stronger attraction
            )
            .force(
                "charge",
                d3.forceManyBody().strength(-60) //  Reduced repulsion
            )
            .force(
                "collision",
                d3.forceCollide().radius((d) => getRadius(d) + 4) // Smaller padding
            )
            .force("center", d3.forceCenter(w / 2, h / 2))
            .alphaDecay(0.04); // Slightly faster stabilization


        const g = svg.append("g");

        /* ----------- Zoom ----------- */
        svg.call(
            d3.zoom().scaleExtent([0.4, 3]).on("zoom", (event) => {
                g.attr("transform", event.transform);
            })
        );

        /* ----------- Links ----------- */
        const link = g
            .append("g")
            .attr("stroke", "#cbd5e1")
            .attr("stroke-opacity", 0.5)
            .selectAll("line")
            .data(simulationLinks)
            .join("line")
            .attr("stroke-width", (d) => Math.sqrt(d.value || 1));

        /* ----------- Nodes ----------- */
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

        /* ----------- Circles ----------- */
        node
            .append("circle")
            .attr("r", (d) => getRadius(d))
            .attr("fill", (d) => colorScale(d.group))
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 1.5)
            .style("cursor", "pointer")
            .style(
                "filter",
                "drop-shadow(0px 3px 6px rgba(0,0,0,0.15))"
            );

        /* ----------- Initials ----------- */
        node
            .append("text")
            .text((d) => getInitials(d.label, d.id))
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", "#ffffff")
            .attr("font-weight", 600)
            .attr("font-size", (d) =>
                Math.max(9, getRadius(d) * 0.55)
            )
            .style("pointer-events", "none");

        /* ----------- Hover Interaction ----------- */
        node
            .on("mouseover", (event, d) => {
                const rect = containerRef.current.getBoundingClientRect();

                // Get directly connected nodes
                const connectedNodes = simulationLinks
                    .filter(
                        (l) =>
                            l.source.id === d.id ||
                            l.target.id === d.id
                    )
                    .map((l) =>
                        l.source.id === d.id ? l.target : l.source
                    );

                const connectedIds = new Set([
                    d.id,
                    ...connectedNodes.map((n) => n.id),
                ]);

                // Highlight logic
                node.select("circle").attr("opacity", (n) =>
                    connectedIds.has(n.id) ? 1 : 0.15
                );

                link.attr("stroke-opacity", (l) =>
                    l.source.id === d.id ||
                        l.target.id === d.id
                        ? 0.9
                        : 0.05
                );

                d3.select(event.currentTarget)
                    .select("circle")
                    .transition()
                    .duration(150)
                    .attr("stroke-width", 3);

                // Get first 3 connected names
                const topConnections = connectedNodes
                    .slice(0, 3)
                    .map((n) => n.label)
                    .join(", ");

                const remainingCount =
                    connectedNodes.length > 3
                        ? ` +${connectedNodes.length - 3} more`
                        : "";

                setTooltip({
                    show: true,
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top - 12,
                    content: `
      <div style="font-weight:600;margin-bottom:4px">
        ${d.label}
      </div>
      <div style="opacity:.7;margin-bottom:4px">
        ${d.connections || 0} Views
      </div>
      ${connectedNodes.length > 0
                            ? `<div style="font-size:11px;color:#555">
              <strong>Connected to:</strong><br/>
              ${topConnections}${remainingCount}
            </div>`
                            : ""
                        }
    `,
                });
            })
            .on("mouseout", (event) => {
                node.select("circle").attr("opacity", 1);
                link.attr("stroke-opacity", 0.5);

                d3.select(event.currentTarget)
                    .select("circle")
                    .transition()
                    .duration(150)
                    .attr("stroke-width", 1.5);

                setTooltip({
                    show: false,
                    x: 0,
                    y: 0,
                    content: "",
                });
            });

        /* ----------- Tick ----------- */
        simulation.on("tick", () => {
            link
                .attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);

            node.attr(
                "transform",
                (d) => `translate(${d.x},${d.y})`
            );
        });

        return () => simulation.stop();
    }, [dimensions, nodes, links]);

    /* ---------------- UI ---------------- */
    return (
        <div
            ref={containerRef}
            className="bg-card border border-border rounded-xl p-4 relative"
        >
            <h3 className="text-sm font-medium text-muted-foreground mb-3 font-mono tracking-wide uppercase">
                {title}
            </h3>

            <p className="text-xs text-muted-foreground mb-3">
                Drag · Zoom · Hover to highlight Views
            </p>

            <svg
                ref={svgRef}
                width={dimensions.width}
                height={height}
            />

            {tooltip.show && (
                <div
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
                        boxShadow:
                            "0 8px 24px rgba(0,0,0,0.25)",
                        maxWidth: "220px",
                    }}
                    dangerouslySetInnerHTML={{
                        __html: tooltip.content,
                    }}
                />
            )}
        </div>
    );
};

export default D3NetworkGraph;
