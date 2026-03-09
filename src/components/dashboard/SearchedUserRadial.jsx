import { useEffect, useRef } from "react";
import * as d3 from "d3";

const SearchedUsersRadial = ({ data = [], title }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    d3.select(container).selectAll("*").remove();

    // ✅ EMPTY STATE
    if (!data?.length) {
      d3.select(container)
        .append("div")
        .style("height", "300px")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .style("color", "#9ca3af")
        .style("font-size", "14px")
        .text("No search data available");

      return;
    }

    const size = Math.min(container.clientWidth, 420);
    const radius = size / 2;

    const innerR = 50;
    const outerR = radius - 40;

    const maxVal = d3.max(data, (d) => d.searches) || 1;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", size)
      .attr("height", size)
      .append("g")
      .attr("transform", `translate(${radius}, ${radius})`);

    const angle = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, 2 * Math.PI])
      .padding(0.05);

    const r = d3
      .scaleLinear()
      .domain([0, maxVal])
      .range([innerR, outerR]);

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const arc = d3
      .arc()
      .innerRadius(innerR)
      .outerRadius((d) => r(d.searches))
      .startAngle((d) => angle(d.name))
      .endAngle((d) => angle(d.name) + angle.bandwidth())
      .cornerRadius(5);

    // Tooltip
    const tooltip = d3
      .select(container)
      .append("div")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "hsla(222,84%,5%,0.95)")
      .style("color", "hsl(210,40%,90%)")
      .style("padding", "8px 14px")
      .style("border-radius", "8px")
      .style("font-size", "13px")
      .style("box-shadow", "0 4px 24px rgba(0,0,0,0.4)")
      .style("opacity", 0)
      .style("z-index", 10);

    // Draw arcs
    svg
      .selectAll("path")
      .data(data)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (_, i) => color(i))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("opacity", 0.85)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 1)
          .attr("stroke-width", 2.5);

        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.name}</strong><br/>${d.searches} searches`);
      })
      .on("mousemove", (event) => {
        const rect = container.getBoundingClientRect();
        tooltip
          .style("left", event.clientX - rect.left + 14 + "px")
          .style("top", event.clientY - rect.top - 10 + "px");
      })
      .on("mouseleave", function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 0.85)
          .attr("stroke-width", 1);

        tooltip.style("opacity", 0);
      });

    // Center number
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.3em")
      .attr("fill", "#9ca3af")
      .attr("font-size", 20)
      .attr("font-weight", 700)
      .text(data.length);

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

export default SearchedUsersRadial;