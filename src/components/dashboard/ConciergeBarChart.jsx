import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "@/utils/apiclient";

const colors = [
  "#f87171","#fb923c","#facc15","#4ade80","#38bdf8",
  "#818cf8","#a78bfa","#f472b6","#fbbf24","#34d399"
];

export async function fetchAllCommunityPerUser({ user_id } = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/get_community_graph",
      {
        method: "POST",
        body: JSON.stringify({ user_id }),
      }
    );

    if (!response.ok) throw new Error(`All Community data failed`);

    return await response.json();
  } catch (error) {
    console.error("[All Community data error]", error);
    return { nodes: [], links: [] };
  }
}

const ConciergeBarChart = ({ title = "Community Users" }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const tooltipRef = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [nodesData, setNodesData] = useState([]);

  /* ---------------- Fetch Data ---------------- */

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const data = await fetchAllCommunityPerUser({ user_id: id });

      const mappedNodes = (data.nodes || []).map((node, i) => ({
        id: node.id,
        name: node.label || node.name || `User-${node.id}`,
        accounts: node.accounts || Math.floor(Math.random() * 15) + 1,
        color: colors[i % colors.length]
      }));

      setNodesData(mappedNodes);
    };

    fetchData();
  }, [id]);

  /* ---------------- Resize ---------------- */

  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        setDimensions({
          width: wrapperRef.current.clientWidth,
          height: 500
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ---------------- Draw Chart ---------------- */

  useEffect(() => {
    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 60, right: 30, bottom: 140, left: 70 };

    /* ---------- Dynamic Width ---------- */

    const minBarWidth = 80;

    const chartWidth = Math.max(
      width - margin.left - margin.right,
      nodesData.length * minBarWidth
    );

    const chartHeight = height - margin.top - margin.bottom;

    svg.attr("width", chartWidth + margin.left + margin.right);

    /* ---------- Title ---------- */

    svg.append("text")
      .attr("x", (chartWidth + margin.left + margin.right) / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "#64748b")
      .text(title);

    const hasData =
      nodesData.length > 0 &&
      nodesData.some(d => d.accounts > 0);

    if (!hasData) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("fill", "#888")
        .text("No Data Available");
      return;
    }

    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    /* ---------- Scales ---------- */

    const x = d3.scaleBand()
      .domain(nodesData.map(d => d.id))
      .range([0, chartWidth])
      .padding(0.5);

    const y = d3.scaleLinear()
      .domain([0, d3.max(nodesData, d => d.accounts) + 2])
      .range([chartHeight, 0]);

    /* ---------- Gridlines ---------- */

    chart.append("g")
      .call(
        d3.axisLeft(y)
          .tickSize(-chartWidth)
          .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-dasharray", "3,3");

    /* ---------- X Axis ---------- */

    chart.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).tickFormat(""));

    /* ---------- Y Axis ---------- */

    chart.append("g")
      .call(d3.axisLeft(y).ticks(5));

    const tooltip = d3.select(tooltipRef.current);

    /* ---------- Bars ---------- */

    chart.selectAll(".bar")
      .data(nodesData)
      .enter()
      .append("rect")
      .attr("x", d => x(d.id))
      .attr("y", chartHeight)
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("rx", 6)
      .attr("fill", d => d.color)
      .style("cursor", "pointer")
      .style("filter", "drop-shadow(2px 2px 4px rgba(0,0,0,0.15))")
      .on("click", (event, d) => navigate(`/user/${d.id}`))
      .on("mouseenter", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.name}</strong><br/>Connections: ${d.accounts}`);

        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("opacity", 0.7);
      })
      .on("mousemove", event => {
        tooltip
          .style("left", event.clientX + 15 + "px")
          .style("top", event.clientY - 30 + "px");
      })
      .on("mouseleave", event => {
        tooltip.style("opacity", 0);

        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("opacity", 1);
      })
      .transition()
      .duration(800)
      .attr("y", d => y(d.accounts))
      .attr("height", d => chartHeight - y(d.accounts));

    /* ---------- Custom Labels ---------- */

    const labelGroup = chart.append("g")
      .attr("transform", `translate(0,${chartHeight})`);

    labelGroup.selectAll(".custom-label")
      .data(nodesData)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x(d.id) + x.bandwidth() / 2},0)`)
      .each(function (d) {
        const g = d3.select(this);

        const name =
          d.name.length > 14
            ? d.name.slice(0, 13) + "…"
            : d.name;

        g.append("text")
          .attr("y", 28)
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-45)")
          .style("font-size", window.innerWidth < 640 ? "10px" : "12px")
          .style("fill", "#475569")
          .text(name);

        g.append("text")
          .attr("y", 28)
          .attr("x", 5)
          .attr("text-anchor", "start")
          .attr("transform", "rotate(-45)")
          .style("cursor", "pointer")
          .style("font-size", "12px")
          .style("fill", "#2563eb")
          .text("↗")
          .on("click", () => navigate(`/user/${d.id}`));
      });

    /* ---------- Y Label ---------- */

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 3)
      .attr("x", -(height / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#334155")
      .text("Connections");

  }, [nodesData, dimensions, title, navigate]);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        position: "relative",
        overflowX: "auto"
      }}
    >
      <svg
        ref={svgRef}
        height={dimensions.height}
      />

      <div
        ref={tooltipRef}
        style={{
          position: "fixed",
          pointerEvents: "none",
          opacity: 0,
          background: "rgba(0,0,0,0.85)",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: "8px",
          fontSize: "13px",
          zIndex: 9999
        }}
      />
    </div>
  );
};

export default ConciergeBarChart;