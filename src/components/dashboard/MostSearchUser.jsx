import { useEffect, useRef } from "react";
import * as d3 from "d3";

const MostSearchUser = ({
  data,
  width: propWidth,
  barHeight = 40, // fixed bar height
  barGap = 8, // gap between bars
  title = "TOP SEARCH QUERIES",
  barColor = "#f28e2c",
}) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data?.length) return;

    const chartData = data
      .map((item) => ({ label: item.criteria, value: item.search_count }))
      .sort((a, b) => b.value - a.value);

    const containerWidth = propWidth || containerRef.current.clientWidth;

    const margin = { top: 20, right: 40, bottom: 20, left: 140 };

    // Dynamically calculate chart height based on number of bars
    const h = chartData.length * (barHeight + barGap);
    const w = containerWidth - margin.left - margin.right;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", h + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Y scale: use index to position bars, not band
    const y = d3
      .scaleBand()
      .domain(chartData.map((d, i) => i))
      .range([0, h])
      .padding(0);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.value)])
      .nice()
      .range([0, w]);

    // X grid lines
    svg
      .append("g")
      .selectAll("line")
      .data(x.ticks(4))
      .join("line")
      .attr("x1", (d) => x(d))
      .attr("x2", (d) => x(d))
      .attr("y1", 0)
      .attr("y2", h)
      .attr("stroke", "#e5e7eb")
      .attr("stroke-dasharray", "2,4");

    // Y axis labels
    svg
      .append("g")
      .call(d3.axisLeft(y).tickFormat((i) => chartData[i].label).tickSize(0))
      .call((g) => g.select(".domain").remove())
      .selectAll("text")
      .style("fill", "#334155")
      .style("font-size", "12px")
      .style("font-weight", "500");

    // Tooltip
    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .attr("class", "d3-tooltip")
      .style("opacity", 0);

    // Bars
    svg
      .selectAll(".bar")
      .data(chartData)
      .join("rect")
      .attr("class", "bar")
      .attr("y", (_, i) => y(i))
      .attr("x", 0)
      .attr("height", barHeight)
      .attr("width", 0)
      .attr("rx", 4)
      .attr("fill", barColor)
      .on("mouseenter", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.label}</strong><br/>Searches: ${d.value}`)
          .style("left", `${event.pageX + 12}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.pageX + 12}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseleave", () => tooltip.style("opacity", 0))
      .transition()
      .duration(700)
      .delay((_, i) => i * 60)
      .attr("width", (d) => x(d.value));

    // Value labels
    svg
      .selectAll(".value")
      .data(chartData)
      .join("text")
      .attr("x", (d) => x(d.value) + 6)
      .attr("y", (_, i) => y(i) + barHeight / 2)
      .attr("dy", "0.35em")
      .text((d) => d.value)
      .style("fill", "#0f172a")
      .style("font-size", "12px")
      .style("font-weight", "600");

    return () => tooltip.remove();
  }, [data, propWidth, barColor, barHeight, barGap]);

  return (
    <div
      ref={containerRef}
      className="chart-container w-full animate-slide-up p-5 rounded-2xl"
      style={{ height: "auto" }}
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-3 font-mono tracking-wide uppercase">
        {title}
      </h3>
      <svg ref={svgRef} width="100%" className="block" />
    </div>
  );
};

export default MostSearchUser;
