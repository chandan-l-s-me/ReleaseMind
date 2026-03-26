import { motion } from "motion/react";
import { Activity, Shield, ListChecks, Zap } from "lucide-react";

export default function DashboardPreview() {
  return (
    <section id="dashboard-preview" className="py-32 px-6 relative overflow-hidden bg-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-display font-bold text-white mb-6"
          >
            Command Your <br />
            <span className="text-accent">Release Cycle</span>
          </motion.h2>
          <p className="text-white/40 max-w-2xl mx-auto font-light text-lg">
            A unified intelligence layer that gives you total visibility into every code change and its potential impact.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Mock Dashboard UI */}
          <div className="p-1 rounded-[40px] bg-gradient-to-b from-white/20 to-transparent shadow-2xl">
            <div className="bg-card rounded-[39px] overflow-hidden relative border border-white/5">
              {/* Dashboard Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                  </div>
                  <div className="h-4 w-px bg-white/10 mx-2" />
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Release_Intelligence_v2</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent uppercase tracking-wider">Live Analysis</div>
                </div>
              </div>

              <div className="grid md:grid-cols-12 gap-px bg-white/5">
                {/* Sidebar */}
                <div className="md:col-span-3 bg-card p-8 space-y-8">
                  <div className="space-y-4">
                    <div className="h-2 w-12 bg-white/10 rounded-full" />
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-10 rounded-xl border border-white/5 ${i === 1 ? 'bg-accent/10 border-accent/20' : 'bg-white/[0.02]'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-16 bg-white/10 rounded-full" />
                    <div className="h-32 rounded-2xl bg-white/[0.02] border border-white/5" />
                  </div>
                </div>

                {/* Main Content */}
                <div className="md:col-span-9 bg-card p-12">
                  <div className="grid grid-cols-3 gap-8 mb-12">
                    {[
                      { label: "Risk Score", value: "12", color: "text-green-500" },
                      { label: "Impact Radius", value: "Low", color: "text-accent" },
                      { label: "Confidence", value: "98%", color: "text-accent-secondary" }
                    ].map((stat) => (
                      <div key={stat.label} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4">{stat.label}</div>
                        <div className={`text-4xl font-display font-bold ${stat.color}`}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="h-80 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden p-8">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-accent)_0%,_transparent_70%)] blur-3xl" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-white">Impact Analysis Graph</div>
                        <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-accent" />
                          <div className="w-2 h-2 rounded-full bg-accent-secondary" />
                        </div>
                      </div>
                      <div className="flex items-end gap-2 h-32">
                        {[40, 70, 45, 90, 65, 80, 50, 85, 60, 75].map((h, i) => (
                          <div key={i} className="flex-1 bg-accent/20 border-t border-accent/40 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Glows */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-accent/10 blur-[120px] rounded-full -z-10" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-accent-secondary/10 blur-[120px] rounded-full -z-10" />
        </motion.div>
      </div>
    </section>
  );
}
