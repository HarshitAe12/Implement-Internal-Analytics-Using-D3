import { useEffect, useRef } from "react";
import * as d3 from "d3";

const ProfessionAnalyticChart = ({ data, height = 780, title }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // Map API data to D3-friendly format
  const mappedData = (() => {
    if (!data || !data.most_searched_professions || !data.most_viewed_professions) return [];

    const searchedMap = Object.fromEntries(
      data.most_searched_professions.map((item) => [item.profession_code, item.count])
    );
    const viewedMap = Object.fromEntries(
      data.most_viewed_professions.map((item) => [item.viewed_profile_profession_code, item.count])
    );

    const allKeys = Array.from(new Set([...Object.keys(searchedMap), ...Object.keys(viewedMap)]));
    return allKeys.map((key) => ({
      label: key.replace(/-/g, " "),
      searched: searchedMap[key] || 0,
      viewed: viewedMap[key] || 0,
    }));
  })();

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || mappedData.length === 0) return;

    const labelLength = Math.max(...mappedData.map((d) => d.label.length));
    const bottomMargin = Math.min(200, 40 + labelLength * 6); // 40px base + 6px per char, max 200
    const margin = { top: 20, right: 20, bottom: bottomMargin, left: 60 };

    const containerWidth = Math.max(containerRef.current.clientWidth, mappedData.length * 100);
    const w = containerWidth - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const groups = mappedData.map((d) => d.label);
    const subgroups = ["searched", "viewed"];
    const colors = ["#f59e0b", "#0ea5e9"]; // orange & blue

    const x0 = d3.scaleBand().domain(groups).range([0, w]).padding(0.25);
    const x1 = d3.scaleBand().domain(subgroups).range([0, x0.bandwidth()]).padding(0.05);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(mappedData, (d) => Math.max(d.searched, d.viewed)) || 0])
      .nice()
      .range([h, 0]);

    // X grid
    svg
      .append("g")
      .selectAll("line")
      .data(y.ticks(5))
      .join("line")
      .attr("x1", 0)
      .attr("x2", w)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", "#e5e7eb");

    // X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x0).tickSize(0))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .style("dominant-baseline", "ideographic");

    // Y axis
    svg.append("g").call(d3.axisLeft(y).ticks(5).tickSize(-4));

    // Tooltip (append to body for correct positioning)
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("opacity", 0);

    // Bar groups
    const barGroups = svg
      .selectAll(".bar-group")
      .data(mappedData)
      .join("g")
      .attr("transform", (d) => `translate(${x0(d.label)},0)`);

    subgroups.forEach((key, i) => {
      barGroups
        .append("rect")
        .attr("x", x1(key) || 0)
        .attr("width", x1.bandwidth())
        .attr("y", h)
        .attr("height", 0)
        .attr("fill", colors[i])
        .attr("rx", 2)
        .attr("opacity", 0.85)
        .on("mouseenter", function (event, d) {
          d3.select(this).attr("opacity", 1);
          const val = key === "searched" ? d.searched : d.viewed;
          tooltip
            .style("opacity", 1)
            .html(`<strong>${d.label}</strong><br/>${key}: ${val.toLocaleString()}`);
        })
        .on("mousemove", function (event) {
          const tooltipWidth = tooltip.node().offsetWidth;
          const tooltipHeight = tooltip.node().offsetHeight;
          let left = event.pageX + 12;
          let top = event.pageY + 12;
          if (left + tooltipWidth > window.innerWidth) left = event.pageX - tooltipWidth - 12;
          if (top + tooltipHeight > window.innerHeight) top = event.pageY - tooltipHeight - 12;
          tooltip.style("left", `${left}px`).style("top", `${top}px`);
        })
        .on("mouseleave", function () {
          d3.select(this).attr("opacity", 0.85);
          tooltip.style("opacity", 0);
        })
        .transition()
        .duration(600)
        .delay((_, j) => j * 40 + i * 200)
        .attr("y", (d) => y(key === "searched" ? d.searched : d.viewed))
        .attr("height", (d) => h - y(key === "searched" ? d.searched : d.viewed));
    });

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${w - 180}, -8)`);
    subgroups.forEach((key, i) => {
      const g = legend.append("g").attr("transform", `translate(${i * 95}, 0)`);
      g.append("rect").attr("width", 10).attr("height", 10).attr("rx", 2).attr("fill", colors[i]);
      g.append("text")
        .attr("x", 14)
        .attr("y", 9)
        .style("font-size", "12px")
        .text(key.charAt(0).toUpperCase() + key.slice(1));
    });

    return () => tooltip.remove();
  }, [data, height]);

  return (
    <div
      ref={containerRef}
      className="chart-container animate-slide-up overflow-x-auto border border-border rounded-lg bg-white p-4"
      style={{ minHeight: height + 140 }}
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-3 font-mono tracking-wide uppercase">
        {title}
      </h3>
      <svg ref={svgRef} height={height} />
    </div>
  );
};

export default ProfessionAnalyticChart;
