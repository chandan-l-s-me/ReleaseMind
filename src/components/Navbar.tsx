import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Zap, LogOut, User, ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, loading] = useAuthState(auth);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    if (target.startsWith("#")) {
      e.preventDefault();
      if (location.pathname !== "/") {
        window.location.href = `/${target}`;
      } else {
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Architecture", href: "#architecture" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-8 py-6",
          scrolled ? "py-4" : "bg-transparent"
        )}
      >
        <div className={cn(
          "max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-full transition-all duration-500",
          scrolled ? "glass shadow-2xl shadow-black/50" : "bg-transparent"
        )}>
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20 group-hover:rotate-12 transition-transform">
              <Zap className="text-white w-5 h-5 fill-white" />
            </div>
            <span className="text-2xl font-display font-black tracking-tighter text-white uppercase italic">
              Release<span className="text-accent not-italic">Mind</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-12">
            {navItems.map((item) => (
              item.href.startsWith("#") ? (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-xs uppercase tracking-[0.3em] font-black text-white/40 hover:text-white transition-colors"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-xs uppercase tracking-[0.3em] font-black text-white/40 hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              )
            ))}
            
            {!loading && (
              user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl glass border-white/10 hover:border-accent/50 transition-colors"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ""} className="w-6 h-6 rounded-lg" />
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-xs uppercase tracking-widest font-black text-white max-w-[100px] truncate">
                      {user.displayName?.split(' ')[0] || "User"}
                    </span>
                    <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform", isProfileOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <>
                        <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-4 w-56 glass border-white/20 rounded-[24px] overflow-hidden shadow-2xl"
                        >
                          <div className="p-3 space-y-1">
                            <Link
                              to="/dashboard"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            >
                              <Zap className="w-4 h-4" />
                              Dashboard
                            </Link>
                            <button
                              onClick={() => {
                                signOut(auth);
                                setIsProfileOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-accent hover:bg-accent/5 rounded-xl transition-all"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-8 py-2.5 rounded-full bg-white text-black text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-accent hover:text-white transition-all shadow-xl shadow-black/20"
                >
                  Join Now
                </motion.button>
              )
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
