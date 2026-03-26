import { motion } from "motion/react";

const logos = [
  "Inspired by modern DevOps systems",
  "Powered by Multi-Agent AI",
  "Built for Enterprise Scale",
  "Next-Gen CI/CD Intelligence",
];

export default function TrustStrip() {
  return (
    <section className="py-20 border-y border-white/5 relative overflow-hidden bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-16 md:gap-32 opacity-20 hover:opacity-60 transition-all duration-1000 ease-in-out">
          {logos.map((logo, i) => (
            <motion.div
              key={logo}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-white font-bold text-[11px] tracking-[0.4em] uppercase whitespace-nowrap cursor-default hover:text-accent transition-colors duration-500"
            >
              {logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
