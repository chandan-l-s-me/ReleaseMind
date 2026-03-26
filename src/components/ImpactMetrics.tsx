import { motion, useInView } from "motion/react";
import { useRef, useState, useEffect } from "react";

const metrics = [
  { value: 70, label: "Fewer tests executed", suffix: "%" },
  { value: 3, label: "Faster pipelines", suffix: "×" },
  { value: 95, label: "Fewer production failures", suffix: "%" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref} className="text-7xl md:text-[140px] font-display font-black text-white tracking-tighter text-glow leading-none">
      {count}{suffix}
    </span>
  );
}

export default function ImpactMetrics() {
  return (
    <section className="py-48 px-6 relative overflow-hidden bg-bg">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-24 text-center relative">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center group"
            >
              <div className="mb-8 transition-transform duration-700 group-hover:scale-105">
                <Counter value={metric.value} suffix={metric.suffix} />
              </div>
              <p className="text-accent font-bold tracking-[0.4em] text-xs uppercase max-w-[200px] leading-relaxed">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
