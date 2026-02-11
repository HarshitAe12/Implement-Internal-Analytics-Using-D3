import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const MostViewedProfile = ({
  data = [],
  height = 320,
  title = "Most Viewed Profiles",
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  // Responsive width
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setWidth(w);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!data.length || width === 0) return;

    const chartData = data.map(d => ({
      name: `${d.viewed_profile_firstname} ${d.viewed_profile_lastname}`,
      value: d.view_count,
    }));

    const total = d3.sum(chartData, d => d.value);

    const size = Math.min(width * 0.55, height); // chart portion
    const radius = size / 2 - 16;
    const innerRadius = radius * 0.4;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", size)
      .attr("height", size)
      .append("g")
      .attr("transform", `translate(${size / 2},${size / 2})`);

    const pie = d3.pie().value(d => d.value).sort(null);
    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(6);
    const hoverArc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(radius + 6)
      .cornerRadius(6);

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    svg
      .selectAll("path")
      .data(pie(chartData))
      .join("path")
      .attr("fill", (_, i) => color(i))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseenter", function (_, d) {
        d3.select(this)
          .raise()
          .transition()
          .duration(200)
          .attr("d", hoverArc(d))
          .attr("fill", d3.color(color(d.index)).brighter(0.6));
      })
      .on("mouseleave", function (_, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc(d))
          .attr("fill", color(d.index));
      })
      .transition()
      .duration(800)
      .attrTween("d", d => {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return t => arc(i(t));
      });

    // Center value
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.1em")
      .attr("class", "text-xl font-semibold fill-slate-900")
      .text(total.toLocaleString());

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.4em")
      .attr("class", "text-xs uppercase tracking-wider fill-slate-500")
      .text("Total Views");
  }, [data, width, height]);

  return (
    <div className="w-full overflow-x-auto bg-white border rounded-xl p-4">
      <div
        ref={containerRef}
        className="min-w-[500px] flex gap-8 items-center"
      >
        {/* Chart */}
        <div className="shrink-0">
          <h3 className="text-sm mb-4 font-mono uppercase text-slate-600">
            {title}
          </h3>
          <svg ref={svgRef} />
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 text-sm flex-1 min-w-[200px]">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: d3.schemeTableau10[i % 10] }}
              />
              <span className="text-slate-700 truncate">
                {d.viewed_profile_firstname} {d.viewed_profile_lastname}
              </span>
              <span className="ml-auto font-medium text-slate-900">
                {d.view_count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MostViewedProfile;
