import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, TrendingUp, Users, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

const PREDICTIONS = [
  { id: 1, service: "Auth API", risk: "High", ttr: "45m", devs: 3, complexity: 85 },
  { id: 2, service: "Payment Gateway", risk: "Critical", ttr: "1.5h", devs: 5, complexity: 92 },
  { id: 3, service: "User Profile", risk: "Low", ttr: "12m", devs: 1, complexity: 34 },
  { id: 4, service: "Order Engine", risk: "Medium", ttr: "32m", devs: 2, complexity: 68 },
];

export default function PredictiveTTR() {
  const [activeIndex, setActiveIndex] = useState(0);

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
              Predictive Analytics
            </motion.div>
            <h2 className="text-5xl font-display font-bold text-white mb-6 tracking-tighter">
              Time-to-Recovery <br />
              <span className="text-white/40">Analysis</span>
            </h2>
            <p className="text-white/40 text-lg font-light leading-relaxed mb-8">
              Predicting the "fix time" for every release based on code complexity, historical data, and developer availability.
            </p>
            
            <div className="space-y-4">
              {PREDICTIONS.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "w-full p-4 rounded-xl border flex items-center justify-between transition-all group",
                    activeIndex === i ? "bg-white/5 border-accent/50 text-white" : "border-white/5 text-white/40 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      p.risk === "Critical" ? "bg-red-500" : p.risk === "High" ? "bg-orange-500" : p.risk === "Medium" ? "bg-yellow-500" : "bg-emerald-500"
                    )} />
                    <span className="text-xs font-bold uppercase tracking-widest">{p.service}</span>
                  </div>
                  <ChevronRight className={cn("w-4 h-4 transition-transform", activeIndex === i ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100")} />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:w-2/3 w-full rounded-[2.5rem] glass border-white/10 bg-black/40 p-12 flex flex-col gap-12 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <h3 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">
                  {PREDICTIONS[activeIndex].service}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <AlertCircle className={cn(
                      "w-3 h-3",
                      PREDICTIONS[activeIndex].risk === "Critical" ? "text-red-500" : "text-accent"
                    )} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Risk: {PREDICTIONS[activeIndex].risk}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <TrendingUp className="w-3 h-3 text-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Complexity: {PREDICTIONS[activeIndex].complexity}%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 mb-2">Predicted TTR</div>
                <div className="text-6xl font-display font-bold text-accent tracking-tighter">
                  {PREDICTIONS[activeIndex].ttr}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1">Historical MTTR</div>
                  <div className="text-2xl font-display font-bold text-white">28m 12s</div>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1">Available Devs</div>
                  <div className="text-2xl font-display font-bold text-white">{PREDICTIONS[activeIndex].devs} Experts</div>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1">Confidence</div>
                  <div className="text-2xl font-display font-bold text-white">94.2%</div>
                </div>
              </div>
            </div>

            {/* Visualization Chart Placeholder */}
            <div className="h-48 w-full bg-white/[0.02] rounded-3xl border border-white/5 flex items-end p-8 gap-2">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.random() * 80 + 20}%` }}
                  transition={{ duration: 1, delay: i * 0.05 }}
                  className={cn(
                    "flex-1 rounded-t-sm transition-colors",
                    i > 15 ? "bg-red-500/40" : "bg-accent/40"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
