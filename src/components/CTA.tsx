import React, { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import AuthModal from "./AuthModal";

export default function CTA() {
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
    <section className="py-32 px-6 relative overflow-hidden bg-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-16 md:p-32 rounded-[4rem] bg-accent text-center relative overflow-hidden group"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/20 to-transparent opacity-50 transition-transform duration-1000" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-8xl font-display font-black text-white mb-8 leading-[0.85] tracking-tighter"
            >
              READY TO <br />
              <span className="text-black">RELEASEMIND?</span>
            </motion.h2>
            <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto font-medium">
              Join the elite teams using multi-agent intelligence to dominate their release cycles.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="px-16 py-6 rounded-2xl bg-black text-white font-black text-xl flex items-center gap-4 mx-auto transition-all hover:bg-white hover:text-black shadow-2xl"
            >
              GET STARTED NOW
              <ArrowRight className="w-8 h-8" />
            </motion.button>
          </div>
        </motion.div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </section>
  );
}
