import { useEffect, useRef } from "react";
import * as d3 from "d3";

const EngagementBubbles = ({ data, title }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data?.length || !containerRef.current) return;

    const container = containerRef.current;
    d3.select(container).selectAll("*").remove();

    const width = container.clientWidth;
    const height = 440;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const totalEngagement = (d) =>
      d.appScans + d.accountsCreated + d.searches;

    const maxEng = d3.max(data, totalEngagement) || 1;

    const radiusScale = d3
      .scaleSqrt()
      .domain([0, maxEng])
      .range([28, 72]);

    const colorScale = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.name))
      .range([
        "hsl(190, 80%, 55%)",
        "hsl(260, 70%, 60%)",
        "hsl(330, 70%, 60%)",
        "hsl(45, 85%, 55%)",
        "hsl(150, 60%, 50%)",
        "hsl(20, 80%, 58%)",
        "hsl(280, 60%, 55%)",
        "hsl(210, 70%, 55%)",
      ]);

    // Tooltip
    const tooltip = d3
      .select(container)
      .append("div")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "hsl(222, 47%, 11%)")
      .style("border", "1px solid hsl(215, 20%, 25%)")
      .style("color", "hsl(210, 40%, 90%)")
      .style("padding", "10px 14px")
      .style("border-radius", "10px")
      .style("font-size", "12px")
      .style("line-height", "1.6")
      .style("box-shadow", "0 8px 24px rgba(0,0,0,0.4)")
      .style("opacity", 0)
      .style("z-index", "10");

    const nodes = data.map((d) => ({
      ...d,
      r: radiusScale(totalEngagement(d)),
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height / 2 + (Math.random() - 0.5) * 100,
    }));

    const simulation = d3
      .forceSimulation(nodes)
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("charge", d3.forceManyBody().strength(5))
      .force(
        "collision",
        d3.forceCollide().radius((d) => d.r + 4).strength(0.9)
      )
      .on("tick", ticked);

    const node = svg
      .selectAll(".bubble")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "bubble")
      .style("cursor", "pointer")
      .call(
        d3
          .drag()
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

    // Glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "bubble-glow");
    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "blur");
    filter
      .append("feMerge")
      .selectAll("feMergeNode")
      .data(["blur", "SourceGraphic"])
      .enter()
      .append("feMergeNode")
      .attr("in", (d) => d);

    // Outer glow circle
    node
      .append("circle")
      .attr("r", (d) => d.r + 3)
      .attr("fill", "none")
      .attr("stroke", (d) => colorScale(d.name))
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.3)
      .attr("filter", "url(#bubble-glow)");

    // Main circle
    node
      .append("circle")
      .attr("r", (d) => d.r)
      .attr("fill", (d) => colorScale(d.name))
      .attr("opacity", 0.2)
      .attr("stroke", (d) => colorScale(d.name))
      .attr("stroke-width", 2);

    // Logo emoji
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .attr("font-size", (d) => Math.max(d.r * 0.45, 16))
      .text((d) => d.logo);

    // Name label
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.3em")
      .attr("fill", "hsl(210, 40%, 90%)")
      .attr("font-size", 10)
      .attr("font-weight", 600)
      .text((d) =>
        d.name.length > 12 ? d.name.slice(0, 11) + "…" : d.name
      );

    // Engagement number
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "2.6em")
      .attr("fill", "hsl(215, 20%, 55%)")
      .attr("font-size", 9)
      .text((d) => totalEngagement(d).toLocaleString());

    // Tooltip events
    node
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .select("circle:nth-child(2)")
          .transition()
          .duration(150)
          .attr("opacity", 0.35);

        tooltip.style("opacity", 1).html(
          `<strong>${d.logo} ${d.name}</strong><br/>` +
            `App Scans: <strong>${d.appScans.toLocaleString()}</strong><br/>` +
            `Accounts: <strong>${d.accountsCreated.toLocaleString()}</strong><br/>` +
            `Searches: <strong>${d.searches.toLocaleString()}</strong><br/>` +
            `<span style="color:hsl(190,80%,55%)">Total: ${totalEngagement(
              d
            ).toLocaleString()}</span>`
        );
      })
      .on("mousemove", (event) => {
        const rect = container.getBoundingClientRect();
        tooltip
          .style("left", event.clientX - rect.left + 14 + "px")
          .style("top", event.clientY - rect.top - 10 + "px");
      })
      .on("mouseleave", function () {
        d3.select(this)
          .select("circle:nth-child(2)")
          .transition()
          .duration(150)
          .attr("opacity", 0.2);
        tooltip.style("opacity", 0);
      });

    function ticked() {
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5">
      <h3 className="text-sm font-medium text-muted-foreground mb-1 font-mono tracking-wide uppercase">
        {title}
      </h3>
      <p className="text-[11px] text-muted-foreground mb-4">
        Bubble size = total engagement · drag to explore
      </p>
      <div
        ref={containerRef}
        style={{ position: "relative", width: "100%" }}
      />
    </div>
  );
};

export default EngagementBubbles;