import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, Cpu, Brain, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "../lib/utils";

const LOG_TEMPLATES = [
  { agent: "CODE_CONTEXT", type: "info", message: "Analyzing PR #402: detected semantic changes in Auth API." },
  { agent: "DEPENDENCY_GRAPH", type: "info", message: "Mapping blast radius... identified 4 downstream dependencies." },
  { agent: "RISK_PREDICTION", type: "warn", message: "Cross-referencing with historical incident #88... Risk Score: 84%." },
  { agent: "TEST_PRIORITIZATION", type: "info", message: "Optimizing test suite... selected 12 high-impact tests." },
  { agent: "RELEASE_DECISION", type: "critical", message: "CRITICAL: Potential regression detected in Payment Gateway." },
  { agent: "CODE_CONTEXT", type: "info", message: "Analyzing PR #403: minor UI update in Dashboard." },
  { agent: "RISK_PREDICTION", type: "success", message: "Risk Score: 12%... No significant impact detected." },
  { agent: "RELEASE_DECISION", type: "success", message: "Release approved for Canary deployment." },
];

export default function AgentThoughtStream() {
  const [logs, setLogs] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomLog = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
      setLogs(prev => [...prev.slice(-15), { ...randomLog, id: Date.now(), time: new Date().toLocaleTimeString() }]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <section className="py-32 px-6 bg-bg border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row-reverse gap-16 items-start">
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-accent font-bold uppercase tracking-[0.4em] text-xs mb-4"
            >
              Real-Time Intelligence
            </motion.div>
            <h2 className="text-5xl font-display font-bold text-white mb-6 tracking-tighter">
              Agent Thought <br />
              <span className="text-white/40">Stream</span>
            </h2>
            <p className="text-white/40 text-lg font-light leading-relaxed mb-8">
              Peek into the raw reasoning of our multi-agent system as it analyzes, cross-references, and decides the fate of every release.
            </p>
            
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="h-12 w-px bg-gradient-to-b from-accent/20 to-transparent" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-2">Multi-Agent Reasoning</h4>
                <p className="text-white/40 text-xs leading-relaxed">
                  Every decision is backed by a collaborative reasoning process between specialized AI agents.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:w-2/3 w-full rounded-[2.5rem] glass border-white/10 bg-black/60 overflow-hidden flex flex-col h-[500px] shadow-2xl">
            {/* Terminal Header */}
            <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4 text-accent" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Agent_Reasoning_Logs_v4.0</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-white/10" />
                ))}
              </div>
            </div>

            {/* Terminal Body */}
            <div 
              ref={scrollRef}
              className="flex-1 p-8 overflow-y-auto font-mono text-xs space-y-3 custom-scrollbar"
            >
              <AnimatePresence mode="popLayout">
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4 group"
                  >
                    <span className="text-white/20 shrink-0">[{log.time}]</span>
                    <span className={cn(
                      "font-bold shrink-0 w-32",
                      log.type === "critical" ? "text-red-400" : 
                      log.type === "warn" ? "text-yellow-400" : 
                      log.type === "success" ? "text-emerald-400" : "text-accent"
                    )}>
                      {log.agent}
                    </span>
                    <span className="text-white/60 leading-relaxed">{log.message}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {logs.length === 0 && (
                <div className="h-full flex items-center justify-center text-white/10 uppercase tracking-[0.4em]">
                  Initializing Agents...
                </div>
              )}
            </div>

            {/* Terminal Footer */}
            <div className="px-8 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-emerald-500/60 uppercase tracking-widest">System Online</span>
                </div>
                <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Active Agents: 05</div>
              </div>
              <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Latency: 12ms</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
