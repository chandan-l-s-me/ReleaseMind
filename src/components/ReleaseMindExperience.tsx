import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Share2, 
  Code, 
  Brain, 
  Activity, 
  ArrowRight, 
  Zap,
  ShieldAlert,
  Cpu,
  Network,
  GitBranch
} from "lucide-react";
import { cn } from "../lib/utils";

// --- Types ---
type ExperienceState = "hero" | "transitioning" | "modules";

// --- Components ---

const NetworkGraph = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    const particleCount = 40;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(139, 92, 246, 0.3)";
        ctx.fill();
      }
    }

    const init = () => {
      resize();
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        p.update();
        p.draw();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      animate={{
        scale: active ? 1.5 : 1,
        opacity: active ? 0.5 : 0.3,
        filter: active ? "blur(4px)" : "blur(0px)",
      }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
    />
  );
};

const ModuleCard = ({ 
  title, 
  description, 
  icon: Icon, 
  index,
  children 
}: { 
  title: string; 
  description: string; 
  icon: any; 
  index: number;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ 
        duration: 0.8, 
        delay: 0.2 + index * 0.2,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="group relative bento-card overflow-hidden p-8 flex flex-col gap-6 h-full"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl glass border-white/10 flex items-center justify-center group-hover:border-accent/50 transition-colors">
          <Icon className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h3 className="text-xl font-display font-bold text-white tracking-tight">{title}</h3>
          <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Module 0{index + 1}</p>
        </div>
      </div>
      
      <div className="flex-grow min-h-[200px] relative">
        {children}
      </div>

      <p className="text-white/60 text-sm font-light leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

// --- Module Visuals ---

const RiskReasoningVisual = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 200 200">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="riskGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Central Node */}
        <motion.circle
          cx="100" cy="100" r="12"
          fill="url(#nodeGlow)"
          animate={{ r: [12, 16, 12], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <circle cx="100" cy="100" r="4" fill="#8b5cf6" />
        
        {/* Branching Nodes & Blast Radius */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const x = 100 + Math.cos((angle * Math.PI) / 180) * 70;
          const y = 100 + Math.sin((angle * Math.PI) / 180) * 70;
          const isRisky = i % 3 === 0;
          
          return (
            <React.Fragment key={i}>
              {/* Connection Line with Flow */}
              <motion.line
                x1="100" y1="100" x2={x} y2={y}
                stroke={isRisky ? "rgba(239, 68, 68, 0.3)" : "rgba(139, 92, 246, 0.2)"}
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: "easeOut" }}
              />
              
              {/* Flowing Particle */}
              <motion.circle
                r="2"
                fill={isRisky ? "#ef4444" : "#8b5cf6"}
                animate={{
                  cx: [100, x],
                  cy: [100, y],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: 1 + i * 0.2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />

              {/* End Node */}
              <motion.circle
                cx={x} cy={y} r="8"
                fill={isRisky ? "url(#riskGlow)" : "url(#nodeGlow)"}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1.5 + i * 0.1 }}
              />
              <motion.circle
                cx={x} cy={y} r="3"
                fill={isRisky ? "#ef4444" : "#8b5cf6"}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: 1,
                  filter: isRisky ? ["drop-shadow(0 0 0px #ef4444)", "drop-shadow(0 0 10px #ef4444)", "drop-shadow(0 0 0px #ef4444)"] : "none"
                }}
                transition={{ 
                  scale: { duration: 0.5, delay: 1.5 + i * 0.1 },
                  filter: { duration: 2, repeat: Infinity }
                }}
              />
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
};

const ContextAwareVisual = () => {
  return (
    <div className="absolute inset-0 flex flex-col gap-3 p-6 justify-center bg-black/20 font-mono">
      {[
        { label: "auth_service.ts", active: false },
        { label: "payment_gateway.ts", active: true },
        { label: "user_controller.ts", active: false },
        { label: "database_adapter.ts", active: true },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1 + i * 0.15 }}
          className={cn(
            "h-10 rounded-lg border flex items-center px-4 gap-4 transition-all duration-500",
            item.active 
              ? "bg-accent/10 border-accent/40 shadow-[0_0_15px_rgba(139,92,246,0.1)]" 
              : "bg-white/5 border-white/5 opacity-40"
          )}
        >
          <div className={cn(
            "w-1.5 h-1.5 rounded-full shadow-sm", 
            item.active ? "bg-accent animate-pulse shadow-accent" : "bg-white/20"
          )} />
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-white/80 font-bold">{item.label}</div>
            <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className={cn("h-full", item.active ? "bg-accent" : "bg-white/20")}
                initial={{ width: 0 }}
                animate={{ width: item.active ? "80%" : "30%" }}
                transition={{ duration: 1, delay: 1.5 + i * 0.1 }}
              />
            </div>
          </div>
          {item.active && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="text-[9px] text-accent font-black ml-auto border border-accent/30 px-1.5 py-0.5 rounded tracking-tighter"
            >
              ANALYZING
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

const MultiAgentVisual = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1200px' }}>
      <div className="relative w-44 h-60">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, rotateY: -20, rotateX: 20 }}
            animate={{ 
              opacity: 1,
              y: [i * -15, i * -15 - 20, i * -15],
              rotateY: [-20, -15, -20],
              rotateX: [20, 25, 20],
              rotateZ: [i * 2, i * 2 + 5, i * 2],
            }}
            transition={{ 
              duration: 6, 
              delay: i * 0.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-lg glass border-white/10 shadow-2xl p-5 flex flex-col gap-4 bg-white/[0.03] backdrop-blur-xl"
            style={{ 
              zIndex: 10 - i,
              transformStyle: "preserve-3d",
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Paper Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                <div className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">Agent_Protocol_v2</div>
              </div>
              <Cpu className="w-3 h-3 text-white/20" />
            </div>

            {/* Paper Content Lines */}
            <div className="space-y-3 mt-2">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-accent/40"
                  animate={{ width: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                />
              </div>
              <div className="h-1.5 w-5/6 bg-white/5 rounded-full" />
              <div className="h-1.5 w-4/6 bg-white/5 rounded-full" />
              <div className="h-1.5 w-full bg-white/5 rounded-full" />
            </div>

            {/* Paper Footer */}
            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1, 2].map(dot => (
                  <div key={dot} className="w-4 h-4 rounded-full border border-white/10 bg-white/5" />
                ))}
              </div>
              <div className="text-[8px] font-mono text-accent/60">0x{Math.random().toString(16).slice(2, 6).toUpperCase()}</div>
            </div>

            {/* Subtle paper fold effect */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-lg pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const RiskSimulationVisual = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-10">
      <div className="w-full h-full border-l border-b border-white/5 relative">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid Lines */}
          {[20, 40, 60, 80].map(v => (
            <line key={v} x1="0" y1={v} x2="100" y2={v} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          ))}
          
          {/* Main Path */}
          <motion.path
            d="M 0 80 L 20 75 L 40 85 L 60 40 L 80 50 L 100 20"
            fill="none"
            stroke="rgba(139, 92, 246, 0.3)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3 }}
          />

          {/* Branching Scenarios */}
          {[
            { d: "M 60 40 Q 80 30, 100 10", color: "#10b981", label: "SAFE" },
            { d: "M 60 40 Q 80 70, 100 90", color: "#ef4444", label: "CRITICAL" },
            { d: "M 60 40 Q 80 50, 100 45", color: "#f59e0b", label: "WARN" },
          ].map((path, i) => (
            <React.Fragment key={i}>
              <motion.path
                d={path.d}
                fill="none"
                stroke={path.color}
                strokeWidth="2"
                strokeDasharray="4 2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 2, delay: 2 + i * 0.3 }}
              />
              <motion.text
                x="98"
                y={path.d.split(",")[1].trim()}
                fill={path.color}
                fontSize="4"
                fontWeight="bold"
                textAnchor="end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.5 + i * 0.3 }}
              >
                {path.label}
              </motion.text>
            </React.Fragment>
          ))}

          {/* Probability Pulse */}
          <motion.circle
            r="3"
            fill="#fff"
            animate={{
              offsetDistance: ["0%", "100%"]
            }}
            style={{ offsetPath: "path('M 0 80 L 20 75 L 40 85 L 60 40 L 80 30 L 100 10')" }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>
    </div>
  );
};

// --- Main Experience Component ---

export default function ReleaseMindExperience() {
  const [state, setState] = useState<ExperienceState>("hero");

  const startExperience = () => {
    setState("transitioning");
    setTimeout(() => {
      setState("modules");
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-[#050505] overflow-hidden">
      <NetworkGraph active={state !== "hero"} />

      <AnimatePresence mode="wait">
        {state === "hero" && (
          <motion.div
            key="hero"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50, filter: "blur(20px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 mb-8"
            >
              <Zap className="w-4 h-4 text-accent fill-accent" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Intelligence Reinvented</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-[120px] font-display font-black leading-[0.85] tracking-tighter text-white mb-10"
            >
              RELEASE <br />
              INTELLIGENCE, <br />
              <span className="text-accent">REINVENTED</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/40 text-xl md:text-2xl max-w-2xl mb-12 font-light leading-relaxed"
            >
              The multi-agent intelligence layer for your CI/CD. <br />
              Predict risk, optimize tests, and ship faster than ever.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startExperience}
              className="group relative px-12 py-6 rounded-2xl bg-white text-black font-black text-xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_50px_rgba(139,92,246,0.6)]"
            >
              <span className="relative z-10 flex items-center gap-3 tracking-widest uppercase">
                Ready to Experience
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
              </span>
              
              {/* Glowing border effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent/50 rounded-2xl transition-all duration-500" />
              
              {/* Energy pulse effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-accent/40 via-cyan-400/40 to-accent/40 opacity-0 group-hover:opacity-100"
                animate={{ 
                  x: ['-100%', '100%'],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              />
              
              {/* Particle Pulse */}
              <motion.div
                className="absolute inset-0 border-2 border-accent rounded-2xl opacity-0 group-hover:opacity-100"
                animate={{ 
                  scale: [1, 1.5],
                  opacity: [0.5, 0]
                }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity, 
                  ease: "easeOut" 
                }}
              />
            </motion.button>
          </motion.div>
        )}

        {state === "modules" && (
          <motion.div
            key="modules"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 max-w-7xl mx-auto px-6 py-32 min-h-screen flex flex-col justify-center"
          >
            <div className="mb-20">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-accent font-bold uppercase tracking-[0.4em] text-xs mb-4"
              >
                Core Modules
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tighter"
              >
                The System <br />
                <span className="text-white/40">Architecture</span>
              </motion.h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ModuleCard
                index={0}
                title="Graph-Based Risk Reasoning"
                description="Visualize dependencies and impact propagation across your entire microservices architecture."
                icon={Share2}
              >
                <RiskReasoningVisual />
              </ModuleCard>

              <ModuleCard
                index={1}
                title="Context-Aware Testing"
                description="Our AI understands the semantic meaning of code changes, not just file diffs."
                icon={Code}
              >
                <ContextAwareVisual />
              </ModuleCard>

              <ModuleCard
                index={2}
                title="Multi-Agent Intelligence"
                description="Specialized AI agents collaborate to analyze, predict, and decide on every release."
                icon={Brain}
              >
                <MultiAgentVisual />
              </ModuleCard>

              <ModuleCard
                index={3}
                title="What-If Risk Simulation"
                description="Simulate test failures and dependency changes to predict release stability before deployment."
                icon={Activity}
              >
                <RiskSimulationVisual />
              </ModuleCard>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-20 flex justify-center"
            >
              <button 
                onClick={() => setState("hero")}
                className="text-white/20 hover:text-white text-xs uppercase tracking-[0.3em] font-bold transition-colors"
              >
                Back to Core
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parallax Depth Layers */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-secondary/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
}
