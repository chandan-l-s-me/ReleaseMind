import { motion } from "motion/react";
import { Code, Share2, Brain, Activity } from "lucide-react";

const features = [
  {
    icon: Code,
    title: "Context-Aware Testing",
    description: "Our AI understands the semantic meaning of code changes, not just file diffs.",
  },
  {
    icon: Share2,
    title: "Graph-Based Risk Reasoning",
    description: "Visualize dependencies and impact propagation across your entire microservices architecture.",
  },
  {
    icon: Brain,
    title: "Multi-Agent Release Intelligence",
    description: "Specialized AI agents collaborate to analyze, predict, and decide on every release.",
  },
  {
    icon: Activity,
    title: "What-If Risk Simulation",
    description: "Simulate test failures and dependency changes to predict release stability before deployment.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-32 px-6 relative overflow-hidden bg-bg">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4"
          >
            Capabilities
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-display font-bold text-white mb-6"
          >
            Engineered for <br />
            <span className="text-white/40">Modern DevOps</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          {/* Large Feature 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-8 bento-card group overflow-hidden"
          >
            <div className="relative h-[400px] p-12 flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl glass border-white/10 flex items-center justify-center mb-6">
                  <Share2 className="text-accent w-6 h-6" />
                </div>
                <h3 className="text-3xl font-display font-bold text-white mb-4">Graph-Based Risk Reasoning</h3>
                <p className="text-white/40 max-w-md font-light">Visualize dependencies and impact propagation across your entire microservices architecture with AI-driven graph analysis.</p>
              </div>
            </div>
          </motion.div>

          {/* Small Feature 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 bento-card group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-accent-secondary/5 via-transparent to-transparent" />
            <div className="relative p-10 h-full flex flex-col justify-end">
              <div className="w-12 h-12 rounded-xl glass border-white/10 flex items-center justify-center mb-6">
                <Code className="text-accent-secondary w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-4">Context-Aware</h3>
                <p className="text-white/40 text-sm font-light">Our AI understands the semantic meaning of code changes, not just file diffs.</p>
              </div>
            </div>
          </motion.div>

          {/* Small Feature 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-4 bento-card group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-accent/5 via-transparent to-transparent" />
            <div className="relative p-10 h-full flex flex-col justify-end">
              <div className="w-12 h-12 rounded-xl glass border-white/10 flex items-center justify-center mb-6">
                <Brain className="text-accent w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-4">Multi-Agent</h3>
                <p className="text-white/40 text-sm font-light">Specialized AI agents collaborate to analyze, predict, and decide on every release.</p>
              </div>
            </div>
          </motion.div>

          {/* Large Feature 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-8 bento-card group overflow-hidden"
          >
            <div className="relative h-[400px] p-12 flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-tl from-accent-secondary/5 via-transparent to-transparent" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl glass border-white/10 flex items-center justify-center mb-6">
                  <Activity className="text-accent-secondary w-6 h-6" />
                </div>
                <h3 className="text-3xl font-display font-bold text-white mb-4">What-If Risk Simulation</h3>
                <p className="text-white/40 max-w-md font-light">Simulate test failures and dependency changes to predict release stability before deployment.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
