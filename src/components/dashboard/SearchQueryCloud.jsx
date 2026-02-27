import { useEffect, useRef } from "react";
import * as d3 from "d3";

const SearchQueryCloud = ({ data = [], title }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data.length || !containerRef.current) return;

    const container = containerRef.current;
    d3.select(container).selectAll("*").remove();

    const margin = { top: 10, right: 20, bottom: 30, left: 140 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Sort and take top 8
    const sorted = [...data]
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const maxCount = d3.max(sorted, (d) => d.count);

    // X Scale
    const x = d3
      .scaleLinear()
      .domain([0, maxCount])
      .range([0, width]);

    // Y Scale
    const y = d3
      .scaleBand()
      .domain(sorted.map((d) => d.query))
      .range([0, height])
      .padding(0.3);

    // 🎨 Gradient color scale (light → dark)
    const colorScale = d3
      .scaleLinear()
      .domain([0, maxCount])
      .range(["#93c5fd", "#1e3a8a"]);

    // X Axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll("text")
      .attr("fill", "#888");

    // Y Axis
    svg
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("fill", "#bbb")
      .style("font-size", "12px");

    // Bars
    svg
      .selectAll("rect")
      .data(sorted)
      .enter()
      .append("rect")
      .attr("y", (d) => y(d.query))
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("width", (d) => x(d.count))
      .attr("fill", (d) => colorScale(d.count))
      .attr("rx", 8)
      .style("transition", "all 0.3s ease")
      .on("mouseenter", function () {
        d3.select(this).attr("opacity", 0.8);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("opacity", 1);
      });

    // Value Labels
    svg
      .selectAll(".label")
      .data(sorted)
      .enter()
      .append("text")
      .attr("x", (d) => x(d.count) + 8)
      .attr("y", (d) => y(d.query) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("fill", "#ddd")
      .style("font-size", "12px")
      .text((d) => d.count);

  }, [data]);

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
      
      {/* 🎯 Gradient Title */}
      <h3 className="text-sm font-medium text-muted-foreground mb-3 font-mono tracking-wide uppercase">
        {title}
      </h3>

      <div ref={containerRef} style={{ width: "100%" }} />
    </div>
  );
};

export default SearchQueryCloud;