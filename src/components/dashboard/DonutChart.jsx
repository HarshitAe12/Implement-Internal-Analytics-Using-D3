import { useEffect, useRef } from "react";
import * as d3 from "d3";

const DonutChart = ({ data = [], title }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data.length || !containerRef.current) return;
    const container = containerRef.current;

    // Clear previous chart
    d3.select(container).selectAll("*").remove();

    const size = Math.min(container.clientWidth, 380);
    const radius = size / 2;
    const innerR = radius * 0.55;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", size)
      .attr("height", size)
      .append("g")
      .attr("transform", `translate(${radius}, ${radius})`);

    // Use a more vivid color scheme
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const pie = d3.pie().value((d) => d.count).sort(null).padAngle(0.02);
    const arc = d3.arc().innerRadius(innerR).outerRadius(radius - 8).cornerRadius(4);
    const arcHover = d3.arc().innerRadius(innerR).outerRadius(radius - 2).cornerRadius(4);

    // Tooltip
    const tooltip = d3
      .select(container)
      .append("div")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "hsla(222, 84%, 5%, 0.95)")
      .style("color", "hsl(210, 40%, 90%)")
      .style("padding", "8px 14px")
      .style("border-radius", "8px")
      .style("font-size", "13px")
      .style("box-shadow", "0 4px 24px rgba(0,0,0,0.4)")
      .style("opacity", 0)
      .style("z-index", "10");

    svg
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (_, i) => color(i))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this).transition().duration(150).attr("d", arcHover);
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.data.profession}</strong><br/>${d.data.count.toLocaleString()}`);
      })
      .on("mousemove", function (event) {
        const rect = container.getBoundingClientRect();
        tooltip
          .style("left", event.clientX - rect.left + 14 + "px")
          .style("top", event.clientY - rect.top - 10 + "px");
      })
      .on("mouseleave", function () {
        d3.select(this).transition().duration(150).attr("d", arc);
        tooltip.style("opacity", 0);
      });

    // Center text
    const total = d3.sum(data, (d) => d.count);
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .attr("fill", "hsl(210, 40%, 90%)")
      .attr("font-size", 22)
      .attr("font-weight", 700)
      .text(total >= 1000 ? (total / 1000).toFixed(1) + "k" : total);

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.3em")
      .attr("fill", "hsl(215, 20%, 55%)")
      .attr("font-size", 11)
      .text("total");
  }, [data]);

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5">
   <h3 className="text-sm font-medium text-muted-foreground mb-3 font-mono tracking-wide uppercase">
        {title}
      </h3>
      <div
        ref={containerRef}
        className="flex justify-center"
        style={{ position: "relative" }}
      />
    </div>
  );
};

export default DonutChart;