import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";

const CityAnalytics = ({ data, size = 480, title }) => {
  const svgRef = useRef(null);

  const chartData = useMemo(() => {
    if (!data?.most_viewed_cities?.length) return [];

    return data.most_viewed_cities
      .map((c) => ({
        label: c.viewed_profile_city_code,
        value: Number(c.count) || 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);
  }, [data]);

  useEffect(() => {
    if (!chartData.length) return;

    d3.select(svgRef.current).selectAll("*").remove();
    d3.select(".city-tooltip").remove();

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "city-tooltip")
      .style("position", "absolute")
      .style("background", "#ffffff")
      .style("border", "1px solid #e5e7eb")
      .style("border-radius", "10px")
      .style("padding", "8px 12px")
      .style("font-size", "12px")
      .style("color", "black")
      .style("box-shadow", "0 10px 25px rgba(0,0,0,0.08)")
      .style("pointer-events", "none")
      .style("opacity", 0);

    const padding = 70;
    const radius = size / 2;
    const innerRadius = radius * 0.42;
    const outerRadius = radius * 0.82;
    const labelRadius = radius * 0.92;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [
        -radius - padding,
        -radius - padding,
        size + padding * 2,
        size + padding * 2,
      ])
      .append("g");

    const maxValue = d3.max(chartData, (d) => d.value);

    const angle = d3
      .scaleBand()
      .domain(chartData.map((d) => d.label))
      .range([0, Math.PI * 2])
      .padding(0.08);

    const r = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([innerRadius, outerRadius]);

    // Draw concentric circles
    [0.25, 0.5, 0.75, 1].forEach((t) => {
      svg
        .append("circle")
        .attr("r", innerRadius + (outerRadius - innerRadius) * t)
        .attr("fill", "none")
        .attr("stroke", "#e2e8f0");
    });

    // Color scale for bars (variation)
    const colorScale = d3
      .scaleOrdinal()
      .domain(chartData.map((d) => d.label))
      .range([
        "#a78bfa",
        "#7c3aed",
        "#f472b6",
        "#facc15",
        "#22c55e",
        "#3b82f6",
        "#f97316",
        "#10b981",
        "#6366f1",
        "#f59e0b",
        "#e11d48",
        "#06b6d4",
        "#8b5cf6",
        "#f43f5e",
        "#14b8a6",
        "#f97316",
        "#22d3ee",
        "#4ade80",
        "#c084fc",
        "#f87171",
      ]);

    const arc = d3
      .arc()
      .innerRadius(innerRadius + 2)
      .outerRadius((d) => r(d.value))
      .startAngle((d) => angle(d.label))
      .endAngle((d) => angle(d.label) + angle.bandwidth())
      .cornerRadius(8);

    svg
      .append("g")
      .selectAll("path")
      .data(chartData)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => colorScale(d.label)) // assign color from scale
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("opacity", 0.8);
        tooltip
          .style("opacity", 1)
          .html(
            `<div style="font-weight:600">${d.label}</div>
             <div style="color:#6366f1">${d.value.toLocaleString()} views</div>`
          );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 14 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseleave", function () {
        d3.select(this).attr("opacity", 1);
        tooltip.style("opacity", 0);
      });

    // Labels around the circle
    svg
      .append("g")
      .selectAll("text")
      .data(chartData)
      .enter()
      .append("text")
      .attr("font-size", "12px")
      .attr("fill", "#334155")
      .attr("alignment-baseline", "middle")
      .attr("text-anchor", (d) => {
        const a = angle(d.label) + angle.bandwidth() / 2;
        return a > Math.PI ? "end" : "start";
      })
      .attr("transform", (d) => {
        const a = angle(d.label) + angle.bandwidth() / 2;
        const rotate = (a * 180) / Math.PI - 90;
        const flip = a > Math.PI ? 180 : 0;
        return `rotate(${rotate}) translate(${labelRadius},0) rotate(${flip})`;
      })
      .text((d) => d.label);

    // Center number
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "28px")
      .attr("font-weight", 700)
      .attr("fill", "#0f172a")
      .attr("y", -6)
      .text(chartData.length);

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("fill", "#64748b")
      .attr("y", 16)
      .text("Top Cities");

    return () => tooltip.remove();
  }, [chartData, size]);

  return (
    <div className="flex flex-col w-full p-6 rounded-2xl">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 font-mono tracking-wide uppercase">
        {title}
      </h3>
      <div className="flex items-center justify-center">
        <svg ref={svgRef} width={size} height={size} className="overflow-visible" />
      </div>
    </div>
  );
};

export default CityAnalytics;
