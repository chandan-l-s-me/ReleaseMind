import { motion } from "motion/react";
import { Server, Database, Cpu, Layers, Container, Github, Layout, Brain } from "lucide-react";

const techStack = [
  { icon: Server, label: "FastAPI" },
  { icon: Layers, label: "NetworkX" },
  { icon: Cpu, label: "Machine Learning" },
  { icon: Brain, label: "LLM Integration" },
  { icon: Container, label: "Docker" },
  { icon: Github, label: "GitHub Actions" },
  { icon: Layout, label: "Streamlit" },
];

export default function Architecture() {
  return (
    <section id="architecture" className="py-48 px-6 relative overflow-hidden bg-bg">
      <div className="max-w-7xl mx-auto">
        <div className="mb-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-accent-secondary font-bold uppercase tracking-[0.3em] text-xs mb-4"
          >
            Stack
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-6xl md:text-8xl font-display font-black text-white mb-8 tracking-tighter"
          >
            Built with <br />
            <span className="text-white/40">Cutting-Edge Tech</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {techStack.map((tech, i) => (
            <motion.div
              key={tech.label}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="p-10 rounded-3xl glass border-white/10 flex flex-col items-center gap-6 hover:border-accent/50 hover:bg-accent/5 transition-all duration-500 group cursor-default text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <tech.icon className="text-white/40 w-8 h-8 group-hover:text-accent group-hover:scale-110 transition-all duration-500" />
              </div>
              <span className="text-white font-bold text-xs uppercase tracking-[0.3em] group-hover:text-accent transition-colors">{tech.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
