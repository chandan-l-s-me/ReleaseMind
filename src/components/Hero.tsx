import React, { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Play, Zap } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import AuthModal from "./AuthModal";

export default function Hero() {
  const [user] = useAuthState(auth);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <section className="pt-48 pb-32 px-6 relative overflow-hidden bg-bg">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">v2.0 Now Live</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-7xl md:text-[120px] font-display font-black leading-[0.85] tracking-tight text-white mb-10 text-glow"
          >
            RELEASE <br />
            <span className="text-accent">WITH CONFIDENCE</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/40 text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-light leading-relaxed"
          >
            The multi-agent intelligence layer for your CI/CD. <br className="hidden md:block" />
            Predict risk, optimize tests, and ship faster than ever.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <button
              onClick={handleGetStarted}
              className="px-10 py-5 rounded-2xl bg-white text-black font-bold text-lg transition-all hover:bg-accent hover:text-white hover:scale-105 active:scale-95 w-full md:w-auto"
            >
              Get Started Free
            </button>
            <button 
              onClick={() => {
                const element = document.querySelector("#dashboard-preview");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-10 py-5 rounded-2xl glass border-white/10 text-white font-bold text-lg transition-all hover:bg-white/5 hover:scale-105 active:scale-95 w-full md:w-auto flex items-center justify-center gap-3"
            >
              Watch Demo
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Visual Element */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-32 relative"
        >
          <div className="relative w-full aspect-[21/9] rounded-[40px] overflow-hidden glass border-white/10 shadow-2xl shadow-accent/20">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent-secondary/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
            
            {/* Floating UI Elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-8 w-full max-w-4xl px-12">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded-2xl glass border-white/5 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Glow Effect */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[80%] h-40 bg-accent/20 blur-[100px] rounded-full -z-10" />
        </motion.div>
      </div>

      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full atmosphere -z-10" />
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </section>
  );
}
