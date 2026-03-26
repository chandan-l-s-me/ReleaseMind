import React, { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 250 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') ||
        target.getAttribute('role') === 'button';
      
      setIsHovering(!!isClickable);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Outer Ring / Aura */}
      <motion.div
        className={cn(
          "absolute w-12 h-12 border border-accent/30 rounded-full flex items-center justify-center transition-all duration-500",
          isHovering && "w-20 h-20 bg-accent/5 border-accent shadow-[0_0_30px_rgba(139,92,246,0.2)]",
          isClicking && "scale-75 border-accent/80"
        )}
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        {/* Dynamic Inner Ring */}
        <motion.div 
          className={cn(
            "w-full h-full rounded-full border border-accent/10",
            isHovering && "animate-spin-slow"
          )}
          animate={{ rotate: isHovering ? 360 : 0 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Central Core */}
      <motion.div
        className={cn(
          "absolute w-2 h-2 bg-white rounded-full mix-blend-difference transition-transform duration-300 shadow-[0_0_10px_#fff]",
          isHovering && "scale-[0.3] opacity-50",
          isClicking && "scale-150"
        )}
        style={{
          left: cursorX,
          top: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />

      {/* Trailing Particle Effect */}
      <AnimatePresence>
        {isClicking && (
          <motion.div
            initial={{ scale: 0, opacity: 1, rotate: 0 }}
            animate={{ scale: 3, opacity: 0, rotate: 45 }}
            exit={{ opacity: 0 }}
            className="absolute w-6 h-6 border-2 border-accent/40 rounded-lg"
            style={{
              left: cursorX,
              top: cursorY,
              translateX: "-50%",
              translateY: "-50%",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
