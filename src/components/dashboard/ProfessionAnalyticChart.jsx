import { useEffect, useRef } from "react";
import * as d3 from "d3";

const ProfessionAnalyticChart = ({ data, height = 780, title }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // Map API data
  const mappedData = (() => {
    if (!data || !data.most_searched_professions || !data.most_viewed_professions)
      return [];

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

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 40, right: 40, bottom: 160, left: 80 };
    const minBarWidth = 60; // each bar minimum width for mobile readability
    const containerWidth = Math.max(mappedData.length * minBarWidth, containerRef.current.clientWidth);
    const w = containerWidth - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth) // allow overflow scroll
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3
      .scaleBand()
      .domain(mappedData.map((d) => d.label))
      .range([0, w])
      .padding(0.3); // reduce padding to fit more bars

    // Y scale
    const yMax = d3.max(mappedData, (d) => Math.max(d.searched, d.viewed)) || 0;
    const y = d3.scaleLinear().domain([0, yMax * 1.1]).range([h, 0]).nice();

    const color = { searched: "#f59e0b", viewed: "#0ea5e9" };

    // Y axis
    svg.append("g").call(d3.axisLeft(y).ticks(5).tickSize(-4));

    // X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-35)")
      .style("text-anchor", "end")
      .style("font-size", "12px");

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("opacity", 0);

    // Lines connecting dots
    svg
      .selectAll(".connection-line")
      .data(mappedData)
      .join("line")
      .attr("x1", (d) => x(d.label) + x.bandwidth() / 2)
      .attr("x2", (d) => x(d.label) + x.bandwidth() / 2)
      .attr("y1", (d) => y(d.searched))
      .attr("y2", (d) => y(d.viewed))
      .attr("stroke", "#999")
      .attr("stroke-width", 2)
      .attr("opacity", 0.7);

    // Dots for searched/viewed
    ["searched", "viewed"].forEach((key) => {
      svg
        .selectAll(`.dot-${key}`)
        .data(mappedData)
        .join("circle")
        .attr("cx", (d) => x(d.label) + x.bandwidth() / 2)
        .attr("cy", (d) => y(d[key]))
        .attr("r", 6)
        .attr("fill", color[key])
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer")
        .on("mouseenter", function (event, d) {
          d3.select(this).attr("r", 8);
          tooltip
            .style("opacity", 1)
            .html(`<strong>${d.label}</strong><br/>${key}: ${d[key].toLocaleString()}`);
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
          d3.select(this).attr("r", 6);
          tooltip.style("opacity", 0);
        });
    });

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${w - 150}, -20)`);
    ["searched", "viewed"].forEach((key, i) => {
      const g = legend.append("g").attr("transform", `translate(${i * 100},0)`);
      g.append("circle").attr("r", 6).attr("fill", color[key]);
      g.append("text")
        .attr("x", 12)
        .attr("y", 4)
        .style("font-size", "12px")
        .text(key.charAt(0).toUpperCase() + key.slice(1));
    });

    return () => tooltip.remove();
  }, [data, height, mappedData]);

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
