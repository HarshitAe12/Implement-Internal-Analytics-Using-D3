import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";

const ProfessionAnalyticChart = ({
  data,
  height = 780,
  title = "Profession Analytics",
}) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);


  const mappedData = useMemo(() => {
    if (
      !data ||
      !data.most_searched_professions ||
      !data.most_viewed_professions
    )
      return [];

    const searchedMap = Object.fromEntries(
      data.most_searched_professions.map((item) => [
        item.profession_code,
        item.count,
      ])
    );

    const viewedMap = Object.fromEntries(
      data.most_viewed_professions.map((item) => [
        item.viewed_profile_profession_code,
        item.count,
      ])
    );

    const allKeys = Array.from(
      new Set([...Object.keys(searchedMap), ...Object.keys(viewedMap)])
    );

    return allKeys.map((key) => ({
      label: key.replace(/-/g, " "),
      searched: searchedMap[key] || 0,
      viewed: viewedMap[key] || 0,
    }));
  }, [data]);

  useEffect(() => {
    // Always clear SVG first
    d3.select(svgRef.current).selectAll("*").remove();

    if (
      !svgRef.current ||
      !containerRef.current ||
      mappedData.length === 0
    )
      return;

    const margin = { top: 40, right: 40, bottom: 140, left: 80 };

    const minBarWidth = 70;
    const containerWidth = Math.max(
      mappedData.length * minBarWidth,
      containerRef.current.clientWidth
    );

    const width = containerWidth - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(mappedData.map((d) => d.label))
      .range([0, width])
      .padding(0.35);

    const yMax =
      d3.max(mappedData, (d) =>
        Math.max(d.searched, d.viewed)
      ) || 0;

    const y = d3
      .scaleLinear()
      .domain([0, yMax * 1.1])
      .range([h, 0])
      .nice();

    const colors = {
      searched: "#f59e0b",
      viewed: "#0ea5e9",
    };

    // Y Axis
    svg
      .append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-width)
      )
      .call((g) => g.select(".domain").remove())
      .selectAll("line")
      .attr("stroke", "#e5e7eb");

    // X Axis
    svg
      .append("g")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end")
      .style("font-size", "11px");

    // Tooltip inside container (safer)
    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .attr("class", "absolute bg-white border rounded-lg shadow-md px-3 py-2 text-xs pointer-events-none")
      .style("opacity", 0);

    // Connection lines
    svg
      .selectAll(".connection-line")
      .data(mappedData)
      .join("line")
      .attr("x1", (d) => x(d.label) + x.bandwidth() / 2)
      .attr("x2", (d) => x(d.label) + x.bandwidth() / 2)
      .attr("y1", (d) => y(d.searched))
      .attr("y2", (d) => y(d.viewed))
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 2)
      .attr("opacity", 0.6);

    // Dots
    ["searched", "viewed"].forEach((key) => {
      svg
        .selectAll(`.dot-${key}`)
        .data(mappedData)
        .join("circle")
        .attr("cx", (d) => x(d.label) + x.bandwidth() / 2)
        .attr("cy", (d) => y(d[key]))
        .attr("r", 6)
        .attr("fill", colors[key])
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseenter", function (event, d) {
          d3.select(this).attr("r", 8);

          tooltip
            .style("opacity", 1)
            .html(
              `<div class="font-medium">${d.label}</div>
               <div>${key}: ${d[key].toLocaleString()}</div>`
            );
        })
        .on("mousemove", function (event) {
          const rect =
            containerRef.current.getBoundingClientRect();

          tooltip
            .style(
              "left",
              `${event.clientX - rect.left + 12}px`
            )
            .style(
              "top",
              `${event.clientY - rect.top - 28}px`
            );
        })
        .on("mouseleave", function () {
          d3.select(this).attr("r", 6);
          tooltip.style("opacity", 0);
        });
    });

    // Legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 160}, -20)`);

    ["searched", "viewed"].forEach((key, i) => {
      const g = legend
        .append("g")
        .attr("transform", `translate(${i * 90},0)`);

      g.append("circle")
        .attr("r", 6)
        .attr("fill", colors[key]);

      g.append("text")
        .attr("x", 12)
        .attr("y", 4)
        .style("font-size", "12px")
        .text(
          key.charAt(0).toUpperCase() + key.slice(1)
        );
    });

    return () => tooltip.remove();
  }, [mappedData, height]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-x-auto border border-border rounded-lg bg-white p-4"
      style={{ minHeight: height + 120 }}
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-3 font-mono tracking-wide uppercase">
        {title}
      </h3>

      {mappedData.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-sm text-slate-500">
          No profession analytics data available
        </div>
      ) : (
        <svg ref={svgRef} />
      )}
    </div>
  );
};

export default ProfessionAnalyticChart;
