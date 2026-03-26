import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Cpu, 
  Network, 
  Brain, 
  MessageSquare, 
  Box, 
  Github, 
  Layout,
  Zap
} from "lucide-react";
import { cn } from "../lib/utils";

const techStack = [
  {
    name: "FastAPI",
    description: "High-performance Python backend for real-time agent coordination.",
    icon: Zap,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10"
  },
  {
    name: "NetworkX",
    description: "Complex graph algorithms for mapping service dependencies and blast radius.",
    icon: Network,
    color: "text-blue-400",
    bg: "bg-blue-400/10"
  },
  {
    name: "Machine Learning",
    description: "Predictive models for risk scoring and test prioritization based on historical data.",
    icon: Brain,
    color: "text-purple-400",
    bg: "bg-purple-400/10"
  },
  {
    name: "LLM Integration",
    description: "Semantic analysis of code changes and automated release notes generation.",
    icon: MessageSquare,
    color: "text-pink-400",
    bg: "bg-pink-400/10"
  },
  {
    name: "Docker",
    description: "Containerized agent environments for consistent and isolated execution.",
    icon: Box,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10"
  },
  {
    name: "GitHub Actions",
    description: "Seamless integration with your existing CI/CD pipelines and workflows.",
    icon: Github,
    color: "text-white",
    bg: "bg-white/10"
  },
  {
    name: "Streamlit",
    description: "Interactive internal dashboards for visualizing agent reasoning and metrics.",
    icon: Layout,
    color: "text-red-400",
    bg: "bg-red-400/10"
  }
];

export default function TechStack() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideWidth = 320; // Width of each card + gap

  const next = () => {
    if (currentIndex < techStack.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <section className="py-32 px-6 relative overflow-hidden bg-bg border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-accent font-bold uppercase tracking-[0.4em] text-xs mb-4"
            >
              The Engine
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter"
            >
              Built with <br />
              <span className="text-white/40">Cutting-Edge Tech</span>
            </motion.h2>
          </div>

          <div className="flex gap-4">
            <button
              onClick={prev}
              disabled={currentIndex === 0}
              className={cn(
                "w-14 h-14 rounded-full border flex items-center justify-center transition-all",
                currentIndex === 0 
                  ? "border-white/5 text-white/10 cursor-not-allowed" 
                  : "border-white/20 text-white hover:border-accent hover:text-accent"
              )}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={next}
              disabled={currentIndex === techStack.length - 1}
              className={cn(
                "w-14 h-14 rounded-full border flex items-center justify-center transition-all",
                currentIndex === techStack.length - 1 
                  ? "border-white/5 text-white/10 cursor-not-allowed" 
                  : "border-white/20 text-white hover:border-accent hover:text-accent"
              )}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="relative overflow-visible">
          <motion.div 
            className="flex gap-6"
            animate={{ x: -currentIndex * slideWidth }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                className={cn(
                  "min-w-[300px] p-8 rounded-[2.5rem] glass border-white/10 flex flex-col gap-6 transition-all duration-500",
                  currentIndex === i ? "opacity-100 scale-100 border-accent/30" : "opacity-40 scale-95"
                )}
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", tech.bg)}>
                  <tech.icon className={cn("w-7 h-7", tech.color)} />
                </div>
                
                <div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">{tech.name}</h3>
                  <p className="text-white/40 text-sm leading-relaxed font-light">
                    {tech.description}
                  </p>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Integrated</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((dot) => (
                      <div key={dot} className={cn("w-1 h-1 rounded-full", dot <= 2 ? "bg-accent" : "bg-white/10")} />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent -z-10" />
    </section>
  );
}
