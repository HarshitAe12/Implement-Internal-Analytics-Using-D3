import { useEffect, useRef } from "react";
import * as d3 from "d3";

const MostSearchUser = ({
  data,
  width: propWidth,
  height = "100%",
  title = "TOP SEARCH QUERIES",
}) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data?.length) return;

    //  Sort & rank data
    const chartData = data
      .map((item) => ({
        label: item.criteria,
        value: item.search_count,
      }))
      .sort((a, b) => b.value - a.value);

    const containerWidth = propWidth || containerRef.current.clientWidth;

    const margin = { top: 20, right: 60, bottom: 20, left: 180 };
    const w = containerWidth - margin.left - margin.right;
   const containerHeight = containerRef.current.clientHeight;
const h = containerHeight - margin.top - margin.bottom;


    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const y = d3
      .scaleBand()
      .domain(chartData.map((d) => d.label))
      .range([0, h])
      .padding(0.35);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.value)])
      .nice()
      .range([0, w]);

    // X Grid
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

    // Y Axis (labels)
    svg
      .append("g")
      .call(d3.axisLeft(y).tickSize(0))
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
      .attr("y", (d) => y(d.label))
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .attr("width", 0)
      .attr("rx", 8)
      .attr("fill", (d, i) =>
        i === 0
          ? "#f59e0b"
          : i === 1
          ? "#94a3b8"
          : i === 2
          ? "#fb7185"
          : "#e5e7eb"
      )
      .on("mouseenter", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${d.label}</strong><br/>Searches: ${d.value}`
          )
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
      .delay((_, i) => i * 80)
      .attr("width", (d) => x(d.value));

    // Value Labels
    svg
      .selectAll(".value")
      .data(chartData)
      .join("text")
      .attr("x", (d) => x(d.value) + 8)
      .attr("y", (d) => y(d.label) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .text((d) => d.value)
      .style("fill", "#0f172a")
      .style("font-size", "12px")
      .style("font-weight", "600");

    // Rank badges
    svg
      .selectAll(".rank")
      .data(chartData)
      .join("text")
      .attr("x", -150)
      .attr("y", (d) => y(d.label) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      // .text((_, i) =>
      //   i === 0 ? "#1" : i === 1 ? "#2" : i === 2 ? "#3" : `#${i + 1}`
      // )
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#64748b");

    return () => tooltip.remove();
  }, [data, propWidth, height]);

  return (
  <div
  ref={containerRef}
  className="chart-container h-full w-full max-w-full  animate-slide-up p-5 rounded-2xl "
>
  <h3 className="text-sm font-medium text-muted-foreground mb-3 font-mono tracking-wide uppercase">
    {title}
  </h3>
  <svg
    ref={svgRef}
    width="100%"
    height="100%"
    className="block"
  />
</div>

  );
};

export default MostSearchUser;
