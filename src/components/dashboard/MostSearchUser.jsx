import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { fetchSearchQueriesTable } from "@/utils/api";
import { showToast } from "@/utils/showToast";
import { SearchQueriesTable } from "./Table/SearchQueriesTable";


const MostSearchUser = ({
  data = [],
  width: propWidth,
  barHeight = 40,
  barGap = 12,
  title = "TOP SEARCH QUERIES",
  barColor = "#f28e2c",
}) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // table data 
  const [searchQuery, setSearchQuery] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSearchQuery();
  }, [])
  const fetchSearchQuery = async () => {
    try {
      setLoading(true);
      const data = await fetchSearchQueriesTable();
      setSearchQuery(data || []);
      setLoading(false);
    } catch (err) {
      showToast.error("Error while fetching 100 Search Query API");
      setLoading(false);
    }
  }

  useEffect(() => {
    // Always clear SVG first
    d3.select(svgRef.current).selectAll("*").remove();

    if (!svgRef.current || !containerRef.current || !data.length) return;

    const chartData = data
      .map((item) => ({
        label: item.criteria,
        value: item.search_count,
      }))
      .sort((a, b) => b.value - a.value);

    const containerWidth =
      propWidth || containerRef.current.clientWidth;

    const margin = { top: 10, right: 40, bottom: 10, left: 160 };

    const totalHeight =
      chartData.length * barHeight +
      (chartData.length - 1) * barGap;

    const width = containerWidth - margin.left - margin.right;
    const height = totalHeight;

    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const y = d3
      .scaleBand()
      .domain(chartData.map((_, i) => i))
      .range([0, height])
      .paddingInner(barGap / barHeight);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.value)])
      .nice()
      .range([0, width]);

    // Grid lines
    svg
      .append("g")
      .selectAll("line")
      .data(x.ticks(4))
      .join("line")
      .attr("x1", (d) => x(d))
      .attr("x2", (d) => x(d))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#e5e7eb")
      .attr("stroke-dasharray", "2,4");

    // Y Labels
    svg
      .append("g")
      .call(
        d3.axisLeft(y)
          .tickFormat((i) => chartData[i].label)
          .tickSize(0)
      )
      .call((g) => g.select(".domain").remove())
      .selectAll("text")
      .style("fill", "#334155")
      .style("font-size", "12px")
      .style("font-weight", "500");

    // Tooltip (relative to container)
    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .attr("class", "absolute bg-white border rounded-lg shadow-md px-3 py-2 text-xs pointer-events-none")
      .style("opacity", 0);

    // Bars
    svg
      .selectAll(".bar")
      .data(chartData)
      .join("rect")
      .attr("y", (_, i) => y(i))
      .attr("x", 0)
      .attr("height", barHeight)
      .attr("width", 0)
      .attr("rx", 6)
      .attr("fill", barColor)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("opacity", 0.85);

        tooltip
          .style("opacity", 1)
          .html(
            `<div class="font-medium">${d.label}</div>
             <div class="text-slate-500">Searches: ${d.value}</div>`
          );
      })
      .on("mousemove", function (event) {
        const rect = containerRef.current.getBoundingClientRect();

        tooltip
          .style("left", `${event.clientX - rect.left + 12}px`)
          .style("top", `${event.clientY - rect.top - 28}px`);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("opacity", 1);
        tooltip.style("opacity", 0);
      })
      .transition()
      .duration(700)
      .delay((_, i) => i * 60)
      .attr("width", (d) => x(d.value));

    // Value Labels
    svg
      .selectAll(".value")
      .data(chartData)
      .join("text")
      .attr("x", (d) =>
        Math.min(x(d.value) + 8, width - 40)
      )
      .attr("y", (_, i) => y(i) + barHeight / 2)
      .attr("dy", "0.35em")
      .text((d) => d.value)
      .style("fill", "#0f172a")
      .style("font-size", "12px")
      .style("font-weight", "600");

    return () => tooltip.remove();
  }, [data, propWidth, barColor, barHeight, barGap]);

  return (
    <div
      ref={containerRef}
      className="relative w-full p-5 rounded-2xl border bg-card shadow-sm"
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-3 font-mono tracking-wide uppercase">
        {title}
      </h3>

      {!data.length ? (
        <div className="flex items-center justify-center h-[220px] text-sm text-slate-500">
          No search data available
        </div>
      ) : (
        <>
          <svg ref={svgRef} width="100%" className="block" />

          {/* Bottom Right Button */}
          <div className="flex justify-end mt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={fetchSearchQuery} className="bg-gray-600 text-white shadow-sm border border-r-0">
                  View Last 100 Queries
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-6xl">
                <DialogHeader>
                  <DialogTitle>All Search Queries</DialogTitle>
                </DialogHeader>

                {loading ? (
                  <div className="py-10 text-center">Loading...</div>
                ) : (
                  <SearchQueriesTable data={searchQuery} />
                )}
              </DialogContent>
            </Dialog>
          </div>

        </>
      )}
    </div>
  );

};

export default MostSearchUser;
