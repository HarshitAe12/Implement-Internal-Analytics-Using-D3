import { useEffect, useRef } from "react";
import * as d3 from "d3";

const ProfileBarChart = ({ data = [], title, valueKey = "views" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Clear previous chart
    d3.select(container).selectAll("*").remove();

    // ✅ EMPTY STATE
    if (!data?.length) {
      d3.select(container)
        .append("div")
        .style("width", "100%")
        .style("height", "200px")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .style("color", "#888")
        .style("font-size", "14px")
        .text("No profile views found");

      return;
    }

    const margin = { top: 8, right: 60, bottom: 8, left: 120 };
    const width = container.clientWidth;
    const barH = 36;
    const height = data.length * barH + margin.top + margin.bottom;
    const maxVal = d3.max(data, (d) => d[valueKey]) || 1;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3
      .scaleLinear()
      .domain([0, maxVal])
      .range([0, width - margin.left - margin.right]);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([margin.top, height - margin.bottom])
      .padding(0.35);

    const colorScale = d3.scaleSequential(d3.interpolateCool).domain([0, data.length]);

    const g = svg.append("g").attr("transform", `translate(${margin.left}, 0)`);

    // Bars
    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d) => y(d.name))
      .attr("width", (d) => x(d[valueKey]))
      .attr("height", y.bandwidth())
      .attr("rx", 6)
      .attr("fill", (_, i) => colorScale(i))
      .attr("opacity", 0.85)
      .on("mouseenter", function () {
        d3.select(this).transition().duration(120).attr("opacity", 1);
      })
      .on("mouseleave", function () {
        d3.select(this).transition().duration(120).attr("opacity", 0.85);
      });

    // Value labels
    g.selectAll(".val")
      .data(data)
      .enter()
      .append("text")
      .attr("x", (d) => x(d[valueKey]) + 8)
      .attr("y", (d) => y(d.name) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("fill", "hsl(215, 20%, 65%)")
      .attr("font-size", 12)
      .attr("font-weight", 600)
      .text((d) => d[valueKey].toLocaleString());

    // Name labels
    svg.selectAll(".name")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "name")
      .attr("x", margin.left - 10)
      .attr("y", (d) => y(d.name) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", "gray")
      .attr("font-size", 14)
      .attr("font-weight", 400)
      .attr("font-family", "Inter, system-ui, sans-serif")
      .text((d) =>
        d.name.length > 18 ? d.name.slice(0, 17) + "…" : d.name
      );

  }, [data, valueKey]);

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 font-mono tracking-wide uppercase">
        {title}
      </h3>
      <div ref={containerRef} style={{ width: "100%" }} />
    </div>
  );
};

export default ProfileBarChart;