import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { GraphData } from "@/src/types";

interface GraphViewProps {
  data: GraphData;
}

export default function GraphView({ data }: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation(data.nodes as any)
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "rgba(255, 255, 255, 0.1)")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", (d: any) => Math.sqrt(d.value));

    const node = svg.append("g")
      .attr("stroke", "rgba(255, 255, 255, 0.2)")
      .attr("stroke-width", 1)
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", 6)
      .attr("fill", (d: any) => d.group === 1 ? "#ff4e00" : "rgba(255, 255, 255, 0.4)")
      .call(drag(simulation) as any);

    node.append("title")
      .text((d: any) => d.id);

    const labels = svg.append("g")
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .attr("dy", -12)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255, 255, 255, 0.4)")
      .attr("font-size", "9px")
      .attr("font-weight", "500")
      .attr("font-family", "Inter, sans-serif")
      .text((d: any) => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    function drag(simulation: any) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  }, [data]);

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
