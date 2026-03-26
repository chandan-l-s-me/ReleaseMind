import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Github, 
  Search, 
  Shield, 
  Activity, 
  ListChecks, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Play,
  Settings,
  ChevronRight,
  Lock,
  History,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Share2,
  Copy,
  Plus,
  Trash2,
  X
} from "lucide-react";
import { ReleaseAnalysis, TestItem, UserConfig } from "@/src/types";
import GraphView from "./GraphView";
import { cn } from "@/src/lib/utils";
import { analyzeRelease } from "@/src/services/geminiService";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import AuthModal from "./AuthModal";
import { io, Socket } from "socket.io-client";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

import { addDoc, collection, query, where, orderBy, onSnapshot, limit, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Dashboard() {
  const [repoUrl, setRepoUrl] = useState("");
  const [diff, setDiff] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReleaseAnalysis | null>(null);
  const [simulatedRisk, setSimulatedRisk] = useState<number | null>(null);
  const [user, authLoading] = useAuthState(auth);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<"analysis" | "trends">("analysis");
  
  // Custom Agents State
  const [showAgentSettings, setShowAgentSettings] = useState(false);
  const [customAgents, setCustomAgents] = useState<string[]>([]);
  const [newAgent, setNewAgent] = useState("");

  // Collaboration State
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // PR Report State
  const [showPRReport, setShowPRReport] = useState(false);
  const [prReport, setPRReport] = useState("");

  // Fetch User Config
  useEffect(() => {
    if (!user) return;
    const fetchConfig = async () => {
      const docRef = doc(db, "userConfigs", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCustomAgents(docSnap.data().customAgents || []);
      }
    };
    fetchConfig();
  }, [user]);

  // Socket.io Setup
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const rId = urlParams.get("room");
    if (rId) {
      setRoomId(rId);
      setIsCollaborating(true);
    }

    if (isCollaborating) {
      socketRef.current = io();
      socketRef.current.emit("join-room", roomId || "default");

      socketRef.current.on("state-update", (state: any) => {
        setResult(state.result);
        setSimulatedRisk(state.simulatedRisk);
        setRepoUrl(state.repoUrl);
        setDiff(state.diff);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [isCollaborating, roomId]);

  const broadcastState = (newState: any) => {
    if (isCollaborating && socketRef.current) {
      socketRef.current.emit("update-state", {
        roomId: roomId || "default",
        state: newState
      });
    }
  };

  // Fetch history
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "analyses"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(items);
    }, (error) => {
      console.error("History fetch error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAnalyze = async () => {
    if (!repoUrl && !diff) return;
    setLoading(true);
    try {
      const data = await analyzeRelease(repoUrl, diff, customAgents);
      setResult(data);
      setSimulatedRisk(data.riskScore);

      broadcastState({
        result: data,
        simulatedRisk: data.riskScore,
        repoUrl,
        diff
      });

      // Save to history if user is logged in
      if (user) {
        try {
          await addDoc(collection(db, "analyses"), {
            userId: user.uid,
            repoUrl,
            diff: diff.substring(0, 5000), // Limit size for Firestore
            result: data,
            timestamp: new Date().toISOString(),
            riskScore: data.riskScore
          });
        } catch (err) {
          console.error("Failed to save analysis to history:", err);
        }
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePRReport = () => {
    if (!result) return;
    const report = `## 🧠 ReleaseMind Analysis Report
    
### 📊 Risk Summary
- **Risk Score:** ${result.riskScore}/100
- **Recommendation:** ${result.recommendation}
- **Confidence:** ${result.analysis.confidenceScore}%

### 🛡️ Risk Assessment
${result.analysis.riskAssessment}

### 📦 Impacted Modules
${result.analysis.impactedModules.map(m => `- \`${m}\``).join("\n")}

### 🧪 Suggested Tests
${result.prioritizedTests.map(t => `- [ ] **${t.name}** (Impact: ${t.impact}%)`).join("\n")}

---
*Generated by ReleaseMind CI/CD Intelligence*`;
    setPRReport(report);
    setShowPRReport(true);
  };

  const handleSaveAgents = async () => {
    if (!user) return;
    await setDoc(doc(db, "userConfigs", user.uid), {
      customAgents
    });
    setShowAgentSettings(false);
  };

  const startCollaboration = () => {
    const id = Math.random().toString(36).substring(7);
    const url = new URL(window.location.href);
    url.searchParams.set("room", id);
    window.history.pushState({}, "", url);
    setRoomId(id);
    setIsCollaborating(true);
  };

  const loadFromHistory = (item: any) => {
    setRepoUrl(item.repoUrl);
    setDiff(item.diff);
    setResult(item.result);
    setSimulatedRisk(item.result.riskScore);
    setShowHistory(false);
    broadcastState({
      result: item.result,
      simulatedRisk: item.result.riskScore,
      repoUrl: item.repoUrl,
      diff: item.diff
    });
  };

  const toggleTest = (testId: string) => {
    if (!result) return;
    const updatedTests = result.prioritizedTests.map(t => 
      t.id === testId ? { ...t, status: t.status === "passed" ? "pending" : "passed" } : t
    );
    
    // Update simulated risk
    const passedCount = updatedTests.filter(t => t.status === "passed").length;
    const totalCount = updatedTests.length;
    const baseRisk = Number(result.riskScore) || 0;
    const reduction = (passedCount / totalCount) * 30;
    const newRisk = Math.max(0, baseRisk - reduction);
    setSimulatedRisk(newRisk);
    
    const newResult = { ...result, prioritizedTests: updatedTests as TestItem[] };
    setResult(newResult);

    broadcastState({
      result: newResult,
      simulatedRisk: newRisk,
      repoUrl,
      diff
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 pb-12 px-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="w-24 h-24 rounded-full glass border-white/20 flex items-center justify-center mb-12 transition-all hover:border-accent group">
          <Lock className="w-10 h-10 text-white/40 group-hover:text-accent transition-colors" />
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-medium text-white mb-6 text-glow">Authentication <br /><span className="italic text-accent">Required</span></h1>
        <p className="text-white/40 max-w-md mb-12 font-light text-lg">
          Please sign in to access the Release Intelligence Dashboard and start analyzing your code changes.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-12 py-5 rounded-full bg-white text-black font-bold text-lg shadow-2xl shadow-black/50 hover:bg-accent hover:text-white transition-all"
        >
          Sign In Now
        </button>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        
        {/* Atmosphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 blur-[120px] rounded-full -z-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-3 text-glow tracking-tight">
              Release <span className="italic text-accent">Intelligence</span>
            </h1>
            <p className="text-white/40 text-sm font-light tracking-wide uppercase">Analyze code changes, predict risk, and optimize your release cycle.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex glass rounded-full p-1 border-white/10">
              <button
                onClick={() => setActiveTab("analysis")}
                className={cn(
                  "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeTab === "analysis" ? "bg-white text-black" : "text-white/40 hover:text-white"
                )}
              >
                Analysis
              </button>
              <button
                onClick={() => setActiveTab("trends")}
                className={cn(
                  "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeTab === "trends" ? "bg-white text-black" : "text-white/40 hover:text-white"
                )}
              >
                Trends
              </button>
            </div>

            <button 
              onClick={startCollaboration}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full glass border transition-all",
                isCollaborating 
                  ? "bg-accent/10 border-accent/50 text-accent" 
                  : "border-white/10 text-white/40 hover:text-white hover:border-white/20"
              )}
            >
              <Users className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{isCollaborating ? "Live" : "Share"}</span>
            </button>

            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full glass border transition-all",
                showHistory 
                  ? "bg-accent/10 border-accent/50 text-accent" 
                  : "border-white/10 text-white/40 hover:text-white hover:border-white/20"
              )}
            >
              <History className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
            </button>
            <button 
              onClick={() => setShowAgentSettings(true)}
              className="p-3 rounded-full glass border border-white/10 text-white/40 hover:text-accent hover:border-accent/50 transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                setResult(null);
                setRepoUrl("");
                setDiff("");
                setSimulatedRisk(null);
              }}
              className="p-3 rounded-full glass border border-white/10 text-white/40 hover:text-accent hover:border-accent/50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Sidebar: Input or History */}
          <div className="lg:col-span-4 space-y-6">
            <AnimatePresence mode="wait">
              {showHistory ? (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-10 rounded-[40px] glass border-white/10 min-h-[400px]"
                >
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-white font-serif font-medium text-xl flex items-center gap-3">
                      <Clock className="w-5 h-5 text-accent" />
                      Recent Analyses
                    </h3>
                    <button 
                      onClick={() => setShowHistory(false)}
                      className="text-[10px] uppercase tracking-widest font-bold text-white/20 hover:text-white transition-colors"
                    >
                      Close
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {history.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-white/20 text-sm font-light">No history yet.</p>
                      </div>
                    ) : (
                      history.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => loadFromHistory(item)}
                          className="w-full text-left p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-accent/30 transition-all group"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-bold text-accent uppercase tracking-[0.2em]">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                            <span className={cn(
                              "text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                              item.result.riskScore > 70 ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                            )}>
                              Risk: {item.result.riskScore}
                            </span>
                          </div>
                          <div className="text-sm text-white font-medium truncate mb-2">
                            {item.repoUrl || "Manual Diff Analysis"}
                          </div>
                          <div className="text-[10px] text-white/30 truncate uppercase tracking-widest font-medium">
                            {item.result.analysis.impactedModules.join(", ")}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-10 rounded-[40px] glass border-white/10"
                >
                  <h3 className="text-white font-serif font-medium text-xl mb-10 flex items-center gap-3">
                    <Github className="w-5 h-5 text-accent" />
                    Input Source
                  </h3>
                  
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Repository URL</label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                        <input 
                          type="text" 
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                          placeholder="https://github.com/org/repo"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-accent/50 transition-colors font-light"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Commit Diff / Context</label>
                      <textarea 
                          value={diff}
                          onChange={(e) => setDiff(e.target.value)}
                          placeholder="Paste commit diff or describe changes..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white text-sm h-48 focus:outline-none focus:border-accent/50 transition-colors resize-none font-light"
                        />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAnalyze}
                      disabled={loading || (!repoUrl && !diff)}
                      className="w-full py-5 rounded-full bg-white text-black font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-accent hover:text-white"
                    >
                      {loading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-5 h-5 fill-current" />
                          Analyze Release
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 rounded-[40px] glass border-white/10"
              >
                <h3 className="text-white font-serif font-medium text-xl mb-10 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-accent" />
                  Risk Assessment
                </h3>
                
                <div className="text-center mb-10">
                  <div className="relative inline-block">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="72"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        className="text-white/5"
                      />
                      <motion.circle
                        cx="80"
                        cy="80"
                        r="72"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={452}
                        initial={{ strokeDashoffset: 452 }}
                        animate={{ strokeDashoffset: 452 - (452 * (simulatedRisk || 0)) / 100 }}
                        className={cn(
                          "transition-all duration-1000",
                          (simulatedRisk || 0) > 70 ? "text-red-500" : (simulatedRisk || 0) > 40 ? "text-yellow-500" : "text-accent"
                        )}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-serif font-medium text-white">{Math.round(simulatedRisk || 0)}</span>
                      <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Score</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Recommendation</span>
                    <span className={cn(
                      "text-[10px] font-bold px-3 py-1 rounded uppercase tracking-widest",
                      result.recommendation === "Block Release" ? "bg-red-500/10 text-red-500" :
                      result.recommendation === "Canary Release" ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-accent/10 text-accent"
                    )}>
                      {result.recommendation}
                    </span>
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed italic font-light">
                    "{result.analysis.riskAssessment}"
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Main Dashboard Content */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === "trends" ? (
                <motion.div
                  key="trends"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="p-10 rounded-[40px] glass border-white/10 min-h-[600px]"
                >
                  <h3 className="text-white font-serif font-medium text-xl mb-10 flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    Risk Score Trends
                  </h3>
                  
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history.slice().reverse()}>
                        <defs>
                          <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff4e00" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ff4e00" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(val) => new Date(val).toLocaleDateString()}
                          stroke="#ffffff20"
                          fontSize={10}
                          tick={{ fill: 'rgba(255, 255, 255, 0.2)' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#ffffff20" 
                          fontSize={10} 
                          tick={{ fill: 'rgba(255, 255, 255, 0.2)' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', color: '#fff' }}
                          itemStyle={{ color: '#ff4e00' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="riskScore" 
                          stroke="#ff4e00" 
                          fillOpacity={1} 
                          fill="url(#colorRisk)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-12 grid grid-cols-3 gap-6">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                      <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Avg Risk</div>
                      <div className="text-2xl font-serif text-white">
                        {Math.round(history.reduce((acc, curr) => acc + (Number(curr.riskScore) || 0), 0) / (history.length || 1))}
                      </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                      <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Stability</div>
                      <div className="text-2xl font-serif text-accent italic">High</div>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                      <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Total Analyzed</div>
                      <div className="text-2xl font-serif text-white">{history.length}</div>
                    </div>
                  </div>
                </motion.div>
              ) : !result ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[600px] rounded-[40px] glass border-white/10 flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="w-24 h-24 rounded-full glass border-white/10 flex items-center justify-center mb-10">
                    <Search className="w-10 h-10 text-white/20" />
                  </div>
                  <h3 className="text-2xl font-serif font-medium text-white mb-4">No Analysis Data</h3>
                  <p className="text-white/40 max-w-xs mx-auto font-light">Enter a repository URL or code diff on the left to start the multi-agent analysis process.</p>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                  {/* Graph Section */}
                  <div className="p-10 rounded-[40px] glass border-white/10 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
                      <h3 className="text-white font-serif font-medium text-xl flex items-center gap-3">
                        <Zap className="w-5 h-5 text-accent" />
                        Dependency Impact Graph
                      </h3>
                      <div className="flex flex-wrap items-center gap-6">
                        <button 
                          onClick={generatePRReport}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-full glass border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:border-white/20 transition-all"
                        >
                          <FileText className="w-4 h-4" />
                          PR Report
                        </button>
                        <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-[0.2em]">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-accent" />
                            <span className="text-white/40">Impacted</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-white/40" />
                            <span className="text-white/40">Dependency</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="h-[400px] bg-black/20 rounded-[32px] border border-white/5 overflow-hidden">
                      <GraphView data={result.graphData} />
                    </div>
                  </div>

                  {/* Tests and Simulation */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-10 rounded-[40px] glass border-white/10">
                      <h3 className="text-white font-serif font-medium text-xl mb-10 flex items-center gap-3">
                        <ListChecks className="w-5 h-5 text-accent" />
                        Prioritized Tests
                      </h3>
                      <div className="space-y-4">
                        {result.prioritizedTests.map((test) => (
                          <div 
                            key={test.id}
                            onClick={() => toggleTest(test.id)}
                            className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between hover:border-accent/30 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                test.status === "passed" ? "bg-green-500" : "bg-white/20"
                              )} />
                              <span className="text-sm text-white/60 font-medium group-hover:text-white transition-colors">{test.name}</span>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Impact: {test.impact}%</div>
                              {test.status === "passed" ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <Play className="w-4 h-4 text-white/20 group-hover:text-accent transition-colors" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-10 rounded-[40px] glass border-white/10">
                      <h3 className="text-white font-serif font-medium text-xl mb-10 flex items-center gap-3">
                        <Activity className="w-5 h-5 text-accent" />
                        What-If Simulation
                      </h3>
                      <div className="space-y-8">
                        <div className="p-6 rounded-3xl bg-accent/5 border border-accent/10">
                          <p className="text-xs text-accent/80 leading-relaxed font-light">
                            Toggling tests in the list will update the simulated risk score in real-time. This helps you understand which tests are critical for release confidence.
                          </p>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Current Confidence</span>
                            <span className="text-sm font-serif font-medium text-white italic">{100 - Math.round(simulatedRisk || 0)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              animate={{ width: `${100 - (simulatedRisk || 0)}%` }}
                              className="h-full bg-accent shadow-[0_0_10px_rgba(255,78,0,0.5)]"
                            />
                          </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-6">
                            <AlertTriangle className="w-4 h-4" />
                            Impact Analysis
                          </div>
                          <ul className="space-y-4">
                            {result.analysis.impactedModules.map((m, i) => (
                              <li key={m} className="flex items-center gap-3 text-xs text-white/40 font-light">
                                <ChevronRight className="w-3 h-3 text-accent" />
                                {m} module requires validation
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Agent Settings Modal */}
      <AnimatePresence>
        {showAgentSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAgentSettings(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass border border-white/10 rounded-[40px] p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-serif font-medium text-white flex items-center gap-3">
                  <Settings className="w-5 h-5 text-accent" />
                  Custom AI Agents
                </h3>
                <button onClick={() => setShowAgentSettings(false)} className="text-white/20 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <p className="text-sm text-white/40 mb-10 leading-relaxed font-light">
                Define custom agent personas to specialize your release analysis. These agents will be added to the core intelligence system.
              </p>

              <div className="space-y-4 mb-10">
                {customAgents.map((agent, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-sm text-white/60 truncate pr-4 font-light">{agent}</span>
                    <button 
                      onClick={() => setCustomAgents(customAgents.filter((_, i) => i !== index))}
                      className="text-white/20 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={newAgent}
                    onChange={(e) => setNewAgent(e.target.value)}
                    placeholder="e.g., Performance Agent..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors font-light"
                  />
                  <button 
                    onClick={() => {
                      if (newAgent) {
                        setCustomAgents([...customAgents, newAgent]);
                        setNewAgent("");
                      }
                    }}
                    className="p-3 rounded-2xl bg-white text-black hover:bg-accent hover:text-white transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button 
                onClick={handleSaveAgents}
                className="w-full py-5 rounded-full bg-white text-black font-bold text-lg hover:bg-accent hover:text-white transition-all"
              >
                Save Configuration
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PR Report Modal */}
      <AnimatePresence>
        {showPRReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPRReport(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass border border-white/10 rounded-[40px] p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-serif font-medium text-white flex items-center gap-3">
                  <FileText className="w-5 h-5 text-accent" />
                  GitHub PR Report
                </h3>
                <button onClick={() => setShowPRReport(false)} className="text-white/20 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="bg-white/5 rounded-3xl p-8 mb-10 max-h-[400px] overflow-y-auto font-light text-sm text-white/60 whitespace-pre-wrap leading-relaxed border border-white/10 custom-scrollbar">
                {prReport}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(prReport);
                  }}
                  className="flex-1 py-5 rounded-full glass border border-white/10 text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all"
                >
                  <Copy className="w-5 h-5" />
                  Copy to Clipboard
                </button>
                <button 
                  onClick={() => setShowPRReport(false)}
                  className="flex-1 py-5 rounded-full bg-white text-black font-bold text-lg hover:bg-accent hover:text-white transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
