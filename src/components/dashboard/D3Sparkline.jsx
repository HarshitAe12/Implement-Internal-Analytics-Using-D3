import { useEffect, useRef } from "react";
import * as d3 from "d3";

const D3Sparkline = ({
  data,
  width: propWidth,
  height = 48,
  color = "hsl(185, 72%, 48%)",
}) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const w = propWidth || containerRef.current.clientWidth;
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current).attr("width", w).attr("height", height);

    const x = d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range([2, w - 2]);

    const y = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.value) || 0, d3.max(data, (d) => d.value) || 0])
      .range([height - 4, 4]);

    const area = d3
      .area()
      .x((_, i) => x(i))
      .y0(height)
      .y1((d) => y(d.value))
      .curve(d3.curveBasis);

    const line = d3
      .line()
      .x((_, i) => x(i))
      .y((d) => y(d.value))
      .curve(d3.curveBasis);

    // Gradient
    const gradientId = `sparkline-gradient-${Math.random().toString(36).slice(2)}`;
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 0.2);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", 0);

    svg.append("path").datum(data).attr("fill", `url(#${gradientId})`).attr("d", area);

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 1.5)
      .attr("d", line);
  }, [data, propWidth, height, color]);

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
    </div>
  );
};

export default D3Sparkline;
