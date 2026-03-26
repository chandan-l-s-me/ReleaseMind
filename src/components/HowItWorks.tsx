import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Code2, GitBranch, ShieldAlert, ListChecks, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

const steps = [
  {
    icon: Code2,
    title: "Code Context Agent",
    description: "Analyzes semantic changes and identifies impacted modules.",
  },
  {
    icon: GitBranch,
    title: "Dependency Graph Agent",
    description: "Builds a real-time graph of service dependencies.",
  },
  {
    icon: ShieldAlert,
    title: "Risk Prediction Agent",
    description: "Calculates risk scores based on historical data and impact.",
  },
  {
    icon: ListChecks,
    title: "Test Prioritization Agent",
    description: "Ranks tests to maximize coverage with minimal execution.",
  },
  {
    icon: CheckCircle2,
    title: "Release Decision Agent",
    description: "Recommends full, canary, or blocked release.",
  },
];

export default function HowItWorks() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextStep = () => {
    setActiveIndex((prev) => (prev + 1) % steps.length);
  };

  return (
    <section id="how-it-works" className="py-48 px-6 relative overflow-hidden bg-bg">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
        <div className="lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-accent font-bold uppercase tracking-[0.4em] text-xs mb-4"
          >
            Process
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-display font-bold text-white mb-8 tracking-tighter"
          >
            The Multi-Agent <br />
            <span className="text-white/40">Workflow</span>
          </motion.h2>
          <p className="text-white/40 text-xl font-light leading-relaxed mb-12 max-w-lg">
            Our specialized AI agents collaborate in a structured sequence to ensure every release is analyzed from every angle.
          </p>
          
          <div className="flex gap-4">
            <button 
              onClick={nextStep}
              className="px-8 py-4 rounded-full bg-white text-black font-bold text-sm uppercase tracking-widest hover:bg-accent hover:text-white transition-all flex items-center gap-3"
            >
              Next Agent
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 ml-4">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-500",
                    i === activeIndex ? "bg-accent w-8" : "bg-white/10"
                  )} 
                />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 relative h-[500px] w-full flex items-center justify-center" style={{ perspective: '2000px' }}>
          <AnimatePresence mode="popLayout">
            {steps.map((step, i) => {
              const isTop = i === activeIndex;
              const offset = (i - activeIndex + steps.length) % steps.length;
              
              if (offset > 2) return null; // Only show top 3

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, scale: 0.8, x: 100, rotateZ: 10 }}
                  animate={{ 
                    opacity: 1 - offset * 0.3,
                    scale: 1 - offset * 0.05,
                    x: offset * 20,
                    y: offset * -20,
                    rotateZ: offset * -2,
                    rotateX: offset * 5,
                    zIndex: steps.length - offset,
                  }}
                  exit={{ 
                    opacity: 0, 
                    x: -200, 
                    rotateZ: -20,
                    transition: { duration: 0.5 } 
                  }}
                  className="absolute w-full max-w-md aspect-[3/4] rounded-3xl glass border-white/10 p-12 flex flex-col shadow-2xl bg-white/[0.02] backdrop-blur-2xl"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="flex items-center justify-between mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-accent" />
                    </div>
                    <div className="text-accent font-bold text-xs uppercase tracking-widest">Agent 0{i + 1}</div>
                  </div>
                  
                  <h3 className="text-3xl font-display font-bold text-white mb-6">{step.title}</h3>
                  <p className="text-white/40 text-lg font-light leading-relaxed mb-auto">{step.description}</p>
                  
                  <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(dot => (
                        <div key={dot} className="w-1 h-1 rounded-full bg-accent/40" />
                      ))}
                    </div>
                    <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">System_Active</div>
                  </div>

                  {/* Paper fold effect */}
                  <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-2xl pointer-events-none" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
