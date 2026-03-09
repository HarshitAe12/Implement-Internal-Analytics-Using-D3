import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const stages = [
  { key: "appScans", label: "App Scans", color: "hsl(190, 80%, 55%)" },
  { key: "accountsCreated", label: "Accounts", color: "hsl(260, 70%, 60%)" },
  { key: "searches", label: "Searches", color: "hsl(330, 70%, 60%)" },
];

const DrillDownBarChart = ({ data, title }) => {
  const svgRef = useRef(null);
  const [activeStage, setActiveStage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  /* Detect screen size */

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!data?.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const visibleStages = activeStage
      ? stages.filter((s) => s.key === activeStage)
      : stages;

    const margin = isMobile
      ? { top: 20, right: 10, bottom: 10, left: 90 }
      : { top: 24, right: 80, bottom: 16, left: 12 };

    const width = svgRef.current.clientWidth || 500;

    const rowH = isMobile ? 42 : 52;

    const height = data.length * rowH + margin.top + margin.bottom;

    svgRef.current.setAttribute("height", String(height));

    const innerW = width - margin.left - margin.right;

    const maxVal =
      d3.max(data, (d) =>
        d3.max(visibleStages, (s) => d[s.key])
      ) || 1;

    const y0 = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([margin.top, height - margin.bottom])
      .padding(0.3);

    const y1 = d3
      .scaleBand()
      .domain(visibleStages.map((s) => s.key))
      .range([0, y0.bandwidth()])
      .padding(0.1);

    const x = d3
      .scaleLinear()
      .domain([0, maxVal * 1.05])
      .range([0, innerW]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},0)`);

    /* Grid */

    g.selectAll(".grid")
      .data(x.ticks(4))
      .enter()
      .append("line")
      .attr("x1", (d) => x(d))
      .attr("x2", (d) => x(d))
      .attr("y1", margin.top - 6)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "hsl(215, 20%, 18%)")
      .attr("stroke-dasharray", "2,3");

    /* Tick labels */

    g.selectAll(".tick-label")
      .data(x.ticks(4))
      .enter()
      .append("text")
      .attr("x", (d) => x(d))
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "hsl(215, 20%, 45%)")
      .attr("font-size", isMobile ? 8 : 9)
      .text((d) => d3.format("~s")(d));

    const rows = g
      .selectAll(".row")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(0,${y0(d.name)})`);

    rows.each(function (d) {
      const row = d3.select(this);

      visibleStages.forEach((s, i) => {
        row.append("rect")
          .attr("x", 0)
          .attr("y", y1(s.key))
          .attr("width", 0)
          .attr("height", y1.bandwidth())
          .attr("rx", 4)
          .attr("fill", s.color)
          .attr("opacity", 0.85)
          .transition()
          .duration(500)
          .delay(isMobile ? i * 60 : i * 100)
          .attr("width", x(d[s.key]));

        row.append("text")
          .attr("x", x(d[s.key]) + 6)
          .attr("y", y1(s.key) + y1.bandwidth() / 2)
          .attr("dy", "0.35em")
          .attr("fill", s.color)
          .attr("font-size", isMobile ? 9 : 10)
          .attr("font-weight", 600)
          .attr("opacity", 0)
          .text(d[s.key].toLocaleString())
          .transition()
          .duration(500)
          .delay(i * 100 + 200)
          .attr("opacity", 1);
      });
    });

    /* Partner labels */

    data.forEach((d) => {
      const yPos = y0(d.name) + y0.bandwidth() / 2;

      svg.append("text")
        .attr("x", isMobile ? 4 : width - 4)
        .attr("y", yPos)
        .attr("dy", "0.35em")
        .attr("text-anchor", isMobile ? "start" : "end")
        .attr("fill", "gray")
        .attr("font-size", isMobile ? 9 : 11)
        .attr("font-weight", 600)
        .text(
          d.name.length > (isMobile ? 10 : 14)
            ? d.name.slice(0, isMobile ? 9 : 13) + "…"
            : d.name
        );
    });

  }, [data, activeStage, isMobile]);

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5">

      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">

        <h3 className="text-sm font-medium text-muted-foreground font-mono tracking-wide uppercase">
          {title}
        </h3>

        <div className="flex flex-wrap gap-1">

          <button
            onClick={() => setActiveStage(null)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              !activeStage
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>

          {stages.map((s) => (
            <button
              key={s.key}
              onClick={() =>
                setActiveStage(activeStage === s.key ? null : s.key)
              }
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                activeStage === s.key
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}

        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-2">

        {stages.map((s) => (
          <div
            key={s.key}
            className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
          >
            <span
              className="w-2 h-2 rounded-sm"
              style={{ background: s.color }}
            />
            {s.label}
          </div>
        ))}

      </div>

   <div className="w-full overflow-x-auto">
  <svg
    ref={svgRef}
    className="min-w-[600px]"
    width="100%"
    height={isMobile ? 320 : 440}
  />
</div>

    </div>
  );
};

export default DrillDownBarChart;