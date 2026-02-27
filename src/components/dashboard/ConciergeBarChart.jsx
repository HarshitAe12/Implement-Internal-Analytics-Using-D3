import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useParams } from "react-router-dom";

const colors = [
  "#f87171", "#fb923c", "#facc15", "#4ade80", "#38bdf8",
  "#818cf8", "#a78bfa", "#f472b6", "#fbbf24", "#34d399"
];

export async function fetchAllCommunityPerUser({ user_id } = {}) {
  try {
    const response = await fetch(
      "https://api.proinsight.com/analytics/get_community_graph",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      }
    );
    if (!response.ok) throw new Error(`All Community data failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("[All Community data error]", error);
    return { nodes: [], links: [] };
  }
}

const ConciergeBarChart = ({ title = "Community Users" }) => {
  const { id } = useParams();
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const tooltipRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [nodesData, setNodesData] = useState([]);

  // Fetch data
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const data = await fetchAllCommunityPerUser({ user_id: id });
      const mappedNodes = (data.nodes || [])
        .filter(node => String(node.id) !== String(id))
        .map((node, i) => ({
          name: node.label || node.name || `User-${node.id}`,
          accounts: node.accounts || Math.floor(Math.random() * 15) + 1,
          color: colors[i % colors.length]
        }));
      setNodesData(mappedNodes);
    };
    fetchData();
  }, [id]);

  // Responsive resize
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        setDimensions({ width: wrapperRef.current.clientWidth, height: 500 });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Draw chart
  useEffect(() => {
    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Chart title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "400")
      .style("fill", "gray")
      .text(title);

    // Check for empty or zero data
    const hasData = nodesData.length > 0 && nodesData.some(d => d.accounts > 0);
    if (!hasData) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#888")
        .text("No Data Available");
      return; // skip rendering bars
    }

    // Margins and chart area
    const margin = { top: 60, right: 30, bottom: 120, left: 70 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(nodesData.map(d => d.name)).range([0, chartWidth]).padding(0.3);
    const y = d3.scaleLinear().domain([0, d3.max(nodesData, d => d.accounts) + 2]).range([chartHeight, 0]);

    // Gridlines
    chart.append("g")
      .call(d3.axisLeft(y).tickSize(-chartWidth).tickFormat(""))
      .selectAll("line")
      .attr("stroke", "#e0e0e0")
      .attr("stroke-dasharray", "2,2");

    // X Axis
    chart.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .style("fill", "#555");

    // Y Axis
    chart.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#555");

    const tooltip = d3.select(tooltipRef.current);

    // Bars
    chart.selectAll(".bar")
      .data(nodesData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.name))
      .attr("y", d => y(0))
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("rx", 6)
      .attr("fill", d => d.color)
      .style("filter", "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))")
      .on("mouseenter", (event, d) => {
        tooltip.style("opacity", 1)
               .html(`<strong>${d.name}</strong><br/>Connections: ${d.accounts}`);
        d3.select(event.currentTarget).transition().duration(200).attr("opacity", 0.7);
      })
      .on("mousemove", event => {
        tooltip.style("left", event.clientX + 15 + "px")
               .style("top", event.clientY - 30 + "px");
      })
      .on("mouseleave", (event, d) => {
        tooltip.style("opacity", 0);
        d3.select(event.currentTarget).transition().duration(200).attr("opacity", 1);
      })
      .transition()
      .duration(800)
      .attr("y", d => y(d.accounts))
      .attr("height", d => chartHeight - y(d.accounts));

    // Y Label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 3)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#333")
      .text("Connections");

  }, [nodesData, dimensions, title]);

  return (
    <div ref={wrapperRef} style={{ width: "100%", position: "relative" }}>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}></svg>
      <div ref={tooltipRef} style={{
        position: "fixed",
        pointerEvents: "none",
        opacity: 0,
        background: "rgba(0,0,0,0.8)",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: "8px",
        fontSize: "13px",
        zIndex: 9999
      }} />
    </div>
  );
};

export default ConciergeBarChart;