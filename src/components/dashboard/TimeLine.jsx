import { useEffect, useRef } from "react";
import * as d3 from "d3";

const LINES = [
  { key: "views", color: "hsl(187, 72%, 50%)", label: "Views" },
  { key: "searches", color: "hsl(280, 65%, 60%)", label: "Searches" },
  { key: "engagements", color: "hsl(45, 90%, 55%)", label: "Engagements" },
];

const TimeLine = ({ data, title }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data?.length || !containerRef.current) return;

    const container = containerRef.current;
    d3.select(container).selectAll("*").remove();

    const margin = { top: 30, right: 20, bottom: 40, left: 50 };
    const width = container.clientWidth;
    const height = 320;
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const parseDate = d3.timeParse("%Y-%m-%d");

    const parsed = data.map((d) => ({
      ...d,
      dateObj: parseDate(d.date),
    }));

    const x = d3
      .scaleTime()
      .domain(d3.extent(parsed, (d) => d.dateObj))
      .range([0, innerW]);

    const allVals = parsed.flatMap((d) => [
      d.views,
      d.searches,
      d.engagements,
    ]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(allVals) * 1.15])
      .range([innerH, 0]);

    // ✨ Modern soft grid
    g.selectAll(".grid")
      .data(y.ticks(5))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerW)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", "rgba(148,163,184,0.08)")
      .attr("stroke-dasharray", "4,4");

    // Axes
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0, ${innerH})`)
      .call(
        d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%b %d"))
      );

    xAxis.selectAll("text")
      .attr("fill", "hsl(215, 20%, 55%)")
      .attr("font-size", 10);

    xAxis.selectAll(".domain, .tick line")
      .attr("stroke", "rgba(148,163,184,0.15)");

    const yAxis = g
      .append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0s")));

    yAxis.selectAll("text")
      .attr("fill", "hsl(215, 20%, 55%)")
      .attr("font-size", 10);

    yAxis.selectAll(".domain, .tick line")
      .attr("stroke", "rgba(148,163,184,0.15)");

    // Tooltip
    const tooltip = d3
      .select(container)
      .append("div")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "hsla(222, 84%, 5%, 0.96)")
      .style("color", "hsl(210, 40%, 90%)")
      .style("padding", "10px 14px")
      .style("border-radius", "10px")
      .style("font-size", "12px")
      .style("box-shadow", "0 8px 30px rgba(0,0,0,0.5)")
      .style("opacity", 0)
      .style("z-index", "20");

    const focusDots = {};

    LINES.forEach(({ key, color }) => {
      const gradientId = `gradient-${key}`;

      const defs = svg.append("defs");
      const gradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.4);

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color)
        .attr("stop-opacity", 1);

      const area = d3.area()
        .x((d) => x(d.dateObj))
        .y0(innerH)
        .y1((d) => y(d[key]))
        .curve(d3.curveMonotoneX);

      const areaPath = g.append("path")
        .datum(parsed)
        .attr("d", area)
        .attr("fill", color)
        .attr("opacity", 0);

      areaPath.transition()
        .duration(1000)
        .attr("opacity", 0.07);

      const line = d3.line()
        .x((d) => x(d.dateObj))
        .y((d) => y(d[key]))
        .curve(d3.curveMonotoneX);

      const path = g.append("path")
        .datum(parsed)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", `url(#${gradientId})`)
        .attr("stroke-width", 2.5)
        .attr("stroke-linecap", "round")
        .attr("filter", `drop-shadow(0 0 6px ${color})`);

      const length = path.node().getTotalLength();

      path
        .attr("stroke-dasharray", length)
        .attr("stroke-dashoffset", length)
        .transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0);

      focusDots[key] = g.append("circle")
        .attr("r", 5)
        .attr("fill", "#fff")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .style("opacity", 0);
    });

    const bisect = d3.bisector((d) => d.dateObj).left;

    const hoverLine = g.append("line")
      .attr("y1", 0)
      .attr("y2", innerH)
      .attr("stroke", "rgba(148,163,184,0.4)")
      .style("opacity", 0);

    svg.append("rect")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .attr("width", innerW)
      .attr("height", innerH)
      .attr("fill", "transparent")
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event);
        const date = x.invert(mx);
        const idx = Math.min(bisect(parsed, date), parsed.length - 1);
        const d = parsed[idx];

        hoverLine
          .attr("x1", x(d.dateObj))
          .attr("x2", x(d.dateObj))
          .style("opacity", 1);

        LINES.forEach(({ key }) => {
          focusDots[key]
            .attr("cx", x(d.dateObj))
            .attr("cy", y(d[key]))
            .style("opacity", 1);
        });

        const rect = container.getBoundingClientRect();

        tooltip
          .style("opacity", 1)
          .html(`
            <strong>${d3.timeFormat("%b %d")(d.dateObj)}</strong><br/>
            Views: ${d.views.toLocaleString()}<br/>
            Searches: ${d.searches.toLocaleString()}<br/>
            Engagements: ${d.engagements.toLocaleString()}
          `)
          .style("left", event.clientX - rect.left + 16 + "px")
          .style("top", event.clientY - rect.top - 20 + "px");
      })
      .on("mouseleave", () => {
        hoverLine.style("opacity", 0);
        tooltip.style("opacity", 0);
        Object.values(focusDots).forEach((dot) =>
          dot.style("opacity", 0)
        );
      });

  }, [data]);

  if (!data?.length) return null;

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 font-mono tracking-wide uppercase">
        {title}
      </h3>
      <div
        ref={containerRef}
        style={{ position: "relative", width: "100%" }}
      />
    </div>
  );
};

export default TimeLine;