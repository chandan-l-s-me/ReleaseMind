import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Github, 
  Mail, 
  ArrowRight, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { 
  signInWithPopup, 
  UserCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [step, setStep] = useState<"options" | "email">("options");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep("options");
      setName("");
      setEmail("");
      setPassword("");
      setError(null);
    }
  }, [isOpen]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, githubProvider);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        if (!name.trim()) {
          throw new Error("Please enter your name");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      console.error("Email Auth Error:", err);
      let message = err.message;
      if (err.code === "auth/email-already-in-use") {
        message = "This email is already registered. Please Sign In instead.";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        message = "Invalid email or password. Please check your credentials.";
      } else if (err.code === "auth/weak-password") {
        message = "Password should be at least 6 characters.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass border-white/20 rounded-[40px] overflow-hidden shadow-2xl"
          >
            <div className="p-12">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl font-serif font-medium text-white">
                  {step === "options" ? "Welcome" : "Email Login"}
                </h2>
                <button onClick={onClose} className="p-3 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-10 p-5 rounded-3xl bg-accent/10 border border-accent/20 text-accent text-xs font-medium leading-relaxed">
                  {error}
                </div>
              )}

              {step === "options" && (
                <div className="space-y-5">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-5 px-8 rounded-full bg-white text-black text-[11px] uppercase tracking-[0.25em] font-bold flex items-center justify-center gap-4 hover:bg-accent hover:text-white transition-all disabled:opacity-50 shadow-xl"
                  >
                    <Mail className="w-4 h-4" />
                    Google
                  </button>
                  
                  <button
                    onClick={handleGithubSignIn}
                    disabled={loading}
                    className="w-full py-5 px-8 rounded-full glass border border-white/10 text-white text-[11px] uppercase tracking-[0.25em] font-bold flex items-center justify-center gap-4 hover:bg-white hover:text-black transition-all disabled:opacity-50"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </button>

                  <button
                    onClick={() => setStep("email")}
                    disabled={loading}
                    className="w-full py-5 px-8 rounded-full glass border border-white/10 text-white text-[11px] uppercase tracking-[0.25em] font-bold flex items-center justify-center gap-4 hover:bg-white hover:text-black transition-all disabled:opacity-50"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                </div>
              )}

              {step === "email" && (
                <form onSubmit={handleEmailSubmit} className="space-y-10">
                  <div className="flex p-1.5 bg-white/5 rounded-full border border-white/10 mb-10">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className={cn(
                        "flex-1 py-3 text-[10px] uppercase tracking-[0.25em] font-bold rounded-full transition-all",
                        !isSignUp ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                      )}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className={cn(
                        "flex-1 py-3 text-[10px] uppercase tracking-[0.25em] font-bold rounded-full transition-all",
                        isSignUp ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                      )}
                    >
                      Sign Up
                    </button>
                  </div>

                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-10"
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.25em] mb-4">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-6 text-white text-sm focus:outline-none focus:border-accent/50 transition-colors placeholder:text-white/20"
                        />
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.25em] mb-4">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-6 text-white text-sm focus:outline-none focus:border-accent/50 transition-colors placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.25em] mb-4">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-6 text-white text-sm focus:outline-none focus:border-accent/50 transition-colors placeholder:text-white/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 rounded-full bg-accent text-white text-[11px] uppercase tracking-[0.25em] font-bold flex items-center justify-center gap-3 disabled:opacity-50 transition-all hover:bg-accent/80 shadow-xl shadow-accent/20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? "Create Account" : "Sign In")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("options")}
                    className="w-full text-[10px] uppercase tracking-[0.25em] font-bold text-white/40 hover:text-white transition-colors"
                  >
                    Back to options
                  </button>
                </form>
              )}
            </div>
            
            <div className="p-10 bg-white/[0.02] border-t border-white/5 text-center">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] leading-relaxed">
                By continuing, you agree to ReleaseMind's <br />
                <span className="text-white/50 cursor-pointer hover:text-accent transition-colors">Terms of Service</span> and <span className="text-white/50 cursor-pointer hover:text-accent transition-colors">Privacy Policy</span>.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
