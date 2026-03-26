import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Network, Zap, ShieldAlert, Info } from "lucide-react";
import { cn } from "../lib/utils";

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  type: "service" | "db" | "gateway";
  risk: number;
}

interface Edge {
  from: string;
  to: string;
}

const INITIAL_NODES: Node[] = [
  { id: "gw", x: 100, y: 250, label: "API Gateway", type: "gateway", risk: 0 },
  { id: "auth", x: 300, y: 150, label: "Auth Service", type: "service", risk: 0 },
  { id: "pay", x: 300, y: 350, label: "Payment Service", type: "service", risk: 0 },
  { id: "user", x: 500, y: 100, label: "User Profile", type: "service", risk: 0 },
  { id: "order", x: 500, y: 250, label: "Order Engine", type: "service", risk: 0 },
  { id: "db1", x: 700, y: 150, label: "PostgreSQL", type: "db", risk: 0 },
  { id: "db2", x: 700, y: 350, label: "Redis Cache", type: "db", risk: 0 },
];

const EDGES: Edge[] = [
  { from: "gw", to: "auth" },
  { from: "gw", to: "pay" },
  { from: "auth", to: "user" },
  { from: "pay", to: "order" },
  { from: "order", to: "db1" },
  { from: "user", to: "db1" },
  { from: "pay", to: "db2" },
];

export default function BlastRadiusSimulator() {
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const simulateImpact = (nodeId: string) => {
    setSelectedNode(nodeId);
    setIsSimulating(true);
    
    const newNodes = [...INITIAL_NODES];
    const affected = new Set([nodeId]);
    const queue = [nodeId];

    // Simple BFS to find blast radius
    while (queue.length > 0) {
      const current = queue.shift()!;
      EDGES.forEach(edge => {
        if (edge.from === current && !affected.has(edge.to)) {
          affected.add(edge.to);
          queue.push(edge.to);
        }
      });
    }

    setNodes(newNodes.map(n => ({
      ...n,
      risk: affected.has(n.id) ? (n.id === nodeId ? 1 : 0.6) : 0
    })));

    setTimeout(() => setIsSimulating(false), 2000);
  };

  return (
    <section className="py-32 px-6 bg-bg border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-accent font-bold uppercase tracking-[0.4em] text-xs mb-4"
            >
              Simulation Engine
            </motion.div>
            <h2 className="text-5xl font-display font-bold text-white mb-6 tracking-tighter">
              Blast Radius <br />
              <span className="text-white/40">Simulator</span>
            </h2>
            <p className="text-white/40 text-lg font-light leading-relaxed mb-8">
              Drop a hypothetical change into any service to visualize the ripple effect of risk across your entire architecture.
            </p>
            
            <div className="p-6 rounded-2xl glass border-white/10 bg-accent/5">
              <div className="flex items-center gap-3 mb-4 text-accent">
                <Info className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-widest">How to use</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Click on any node in the graph to simulate a code deployment. The red highlight indicates the "Blast Radius" of potential failures.
              </p>
            </div>
          </div>

          <div className="lg:w-2/3 w-full aspect-video glass rounded-[2.5rem] border-white/10 relative overflow-hidden bg-black/40">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-10" 
                 style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            
            <svg className="absolute inset-0 w-full h-full">
              {/* Edges */}
              {EDGES.map((edge, i) => {
                const from = nodes.find(n => n.id === edge.from)!;
                const to = nodes.find(n => n.id === edge.to)!;
                const isActive = from.risk > 0 && to.risk > 0;
                
                return (
                  <g key={i}>
                    <line
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={isActive ? "#ef4444" : "rgba(255,255,255,0.1)"}
                      strokeWidth={isActive ? "2" : "1"}
                      className="transition-all duration-700"
                    />
                    {isActive && (
                      <motion.circle
                        r="3"
                        fill="#ef4444"
                        animate={{ cx: [from.x, to.x], cy: [from.y, to.y] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => (
                <g key={node.id} onClick={() => simulateImpact(node.id)} className="cursor-pointer group">
                  <motion.circle
                    cx={node.x} cy={node.y}
                    r="30"
                    fill={node.risk > 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(255,255,255,0.02)"}
                    stroke={node.risk === 1 ? "#ef4444" : node.risk > 0 ? "#ef4444" : "rgba(255,255,255,0.1)"}
                    strokeWidth="2"
                    animate={node.risk > 0 ? { r: [30, 35, 30], opacity: [0.5, 1, 0.5] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="transition-colors duration-500"
                  />
                  <foreignObject x={node.x - 50} y={node.y + 40} width="100" height="40">
                    <div className="text-center">
                      <div className={cn(
                        "text-[10px] font-bold uppercase tracking-widest transition-colors",
                        node.risk > 0 ? "text-red-400" : "text-white/40"
                      )}>
                        {node.label}
                      </div>
                    </div>
                  </foreignObject>
                  {node.risk === 1 && (
                    <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <circle cx={node.x + 20} cy={node.y - 20} r="10" fill="#ef4444" />
                      <text x={node.x + 20} y={node.y - 17} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">!</text>
                    </motion.g>
                  )}
                </g>
              ))}
            </svg>

            {/* Simulation Overlay */}
            <AnimatePresence>
              {isSimulating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-8 right-8 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em]">Simulating Impact...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
