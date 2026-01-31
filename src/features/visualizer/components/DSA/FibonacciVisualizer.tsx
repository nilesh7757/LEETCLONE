"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Sparkles, Hash, Link as LinkIcon, 
  Search, Info, ChevronLeft, ChevronRight, Zap, GitBranch,
  Layers, ArrowUp, MousePointer2, Network, Share2, StepForward,
  TrendingUp, Activity, Layout, Plus, Trash2, Cpu, Database
} from "lucide-react";

// Professional Palette
const MANIM_COLORS = { 
  text: "var(--foreground)", 
  background: "var(--card)",
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#f59e0b",
  red: "#FC6255",
  purple: "#9A72AC"
};

interface FibStep {
  dp: (number | null)[];
  message: string;
  step: string;
  currentIndex: number;
  dependencies: number[];
  logs: string[];
}

export default function FibonacciVisualizer({ speed = 800 }: { speed?: number }) {
  const [n, setN] = useState(10);
  const [history, setHistory] = useState<FibStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-compute Tabulation
  useEffect(() => {
    const steps: FibStep[] = [];
    let dp = new Array(n + 1).fill(null);
    let logs: string[] = [];

    const record = (msg: string, step: string, curr: number, deps: number[]) => {
      steps.push({
        dp: [...dp],
        message: msg,
        step: step,
        currentIndex: curr,
        dependencies: deps,
        logs: [...logs]
      });
    };

    const addLog = (l: string) => logs = [l, ...logs];

    addLog("Initializing DP tabulation manifold.");
    record("Awaiting base case injection.", "BOOT", -1, []);

    // Base Cases
    dp[0] = 0;
    addLog("Base case injected: dp[0] = 0.");
    record("Committing primary base case to manifold index 0.", "BASE_CASE", 0, []);

    if (n >= 1) {
        dp[1] = 1;
        addLog("Base case injected: dp[1] = 1.");
        record("Committing secondary base case to manifold index 1.", "BASE_CASE", 1, []);
    }

    for (let i = 2; i <= n; i++) {
        addLog(`Synthesizing state dp[${i}].`);
        record(`Evaluating recurrence for index ${i}.`, "SYNTHESIZE", i, [i-1, i-2]);
        dp[i] = dp[i-1] + dp[i-2];
        addLog(`Result resolved: ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}.`);
        record(`Manifold stabilized at index ${i}. State committed.`, "COMMIT", i, [i-1, i-2]);
    }

    addLog("Global resolution complete.");
    record(`Sequence fully stabilized. F(${n}) = ${dp[n]}.`, "COMPLETE", n, []);

    setHistory(steps);
    setCurrentIndex(0);
  }, [n]);

  // Playback Control
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, history.length, speed]);

  const currentStep = history[currentIndex] || { 
    dp: new Array(n + 1).fill(null), 
    message: "Initializing...", 
    step: "IDLE", 
    currentIndex: -1, 
    dependencies: [], 
    logs: [] 
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="p-8 bg-card border border-border rounded-3xl shadow-2xl font-sans text-foreground relative overflow-hidden">
        {/* Grid Backdrop */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        {/* Header UI */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 relative z-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[#58C4DD]">
              Fibonacci <span className="text-muted-foreground/40">Manifold</span>
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-1 w-12 bg-[#58C4DD] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/30">Tabulation Memoization Synthesis</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-muted p-2 rounded-2xl border border-border shadow-inner">
            <div className="flex items-center gap-2 px-3 border-r border-border">
                <span className="text-[9px] font-black font-mono text-muted-foreground/20 uppercase">Target (N)</span>
                <input 
                    type="number" value={n} 
                    onChange={e => setN(Math.max(1, Math.min(15, parseInt(e.target.value)||1)))}
                    className="w-10 bg-transparent text-center font-mono text-sm font-bold text-[#f59e0b] focus:outline-none"
                />
            </div>
            
            <div className="flex gap-1">
              <button onClick={() => { setIsPlaying(false); setCurrentIndex(0); }} className="p-2 hover:bg-white/5 rounded-xl text-muted-foreground/40 transition-all"><RotateCcw size={20}/></button>
              {!isPlaying ? (
                <button onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(true); }} className="flex items-center gap-2 px-6 py-2 bg-[#58C4DD] text-black rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-lg">
                    <Play size={16} fill="currentColor"/> EXECUTE
                </button>
              ) : (
                <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 px-6 py-2 bg-white/10 text-foreground rounded-xl font-bold text-xs hover:bg-white/20 transition-all">
                    <Pause size={16} fill="currentColor"/> HALT
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Visual Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 relative min-h-[400px] bg-muted/40 rounded-[2.5rem] border border-border overflow-hidden shadow-inner flex flex-col items-center justify-center p-10">
                
                {/* Logic Step Badge */}
                <AnimatePresence>
                    {currentStep.step !== "IDLE" && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-8 left-10 flex items-center gap-2 px-4 py-2 bg-[#58C4DD]/10 border border-[#58C4DD]/30 rounded-full z-30 shadow-lg">
                            <Zap size={12} className="text-[#58C4DD]" />
                            <span className="text-[9px] font-black font-mono text-[#58C4DD] uppercase tracking-[0.2em]">{currentStep.step}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Explanation Box */}
                <AnimatePresence mode="wait">
                    <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-12 w-full max-w-[400px] px-10 text-center z-30">
                        <div className="p-4 bg-card/80 border border-border rounded-2xl backdrop-blur-md shadow-2xl">
                            <p className="text-[10px] text-[#f59e0b] font-mono italic uppercase tracking-tighter">{currentStep.message}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* DP Manifold Cells */}
                <div className="flex flex-wrap justify-center gap-4 relative z-20">
                    {currentStep.dp.map((val, i) => {
                        const isA = i === currentStep.currentIndex;
                        const isD = currentStep.dependencies.includes(i);
                        const isS = val !== null && !isA && !isD;

                        return (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">idx {i}</span>
                                <motion.div
                                    layout
                                    animate={{ 
                                        scale: isA ? 1.2 : isD ? 1.1 : 1,
                                        backgroundColor: isA ? MANIM_COLORS.gold : isD ? `${MANIM_COLORS.blue}15` : isS ? `${MANIM_COLORS.green}10` : "var(--card)",
                                        borderColor: isA ? MANIM_COLORS.gold : isD ? MANIM_COLORS.blue : isS ? MANIM_COLORS.green : "var(--border)",
                                        boxShadow: isA ? `0 0 30px ${MANIM_COLORS.gold}44` : isD ? `0 0 20px ${MANIM_COLORS.blue}22` : "none"
                                    }}
                                    transition={{ type: "spring", stiffness: 150, damping: 25 }}
                                    className="w-14 h-14 border-2 rounded-2xl flex items-center justify-center font-mono shadow-lg relative"
                                >
                                    <span className={`text-base font-black ${isA ? "text-black" : val !== null ? "text-foreground" : "text-muted-foreground/20"}`}>
                                        {val !== null ? val : "?"}
                                    </span>
                                    {isA && (
                                        <motion.div layoutId="ptr" className="absolute -top-10"><ArrowUp size={14} className="text-[#f59e0b]" /></motion.div>
                                    )}
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar: Synthesis Log */}
            <div className="flex flex-col gap-6">
                <div className="p-6 bg-muted border border-border rounded-[2rem] flex flex-col gap-4 flex-1 h-[300px] overflow-hidden">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2">
                        <Activity size={14}/> Synthesis Stream
                    </h3>
                    <div className="flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-thin">
                        <AnimatePresence>
                            {currentStep.logs.map((log, i) => (
                                <motion.div
                                    key={`log-${i}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[9px] font-mono text-muted-foreground/60 flex gap-2 border-l-2 border-border pl-2 py-0.5"
                                >
                                    <span className="text-[#58C4DD]">»</span>
                                    {log}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {currentStep.logs.length === 0 && <span className="text-[9px] italic text-muted-foreground/20 text-center py-8">Idle...</span>}
                    </div>
                </div>

                <div className="p-6 bg-muted border border-border rounded-[2rem]">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest mb-4 flex items-center gap-2">
                        <Cpu size={14}/> Invariant
                    </h3>
                    <div className="p-3 bg-card border border-border rounded-xl font-mono text-[9px] text-[#83C167] border-l-4 border-l-[#83C167] shadow-xl">
                        dp[i] = dp[i-1] + dp[i-2]
                    </div>
                </div>
            </div>
        </div>

        {/* Scrubber UI */}
        <div className="mt-8 p-6 bg-muted border border-border rounded-[2.5rem] flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Hash size={14} className="text-[#f59e0b]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Lemma Sequence {currentIndex + 1} of {history.length || 1}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider">
                <div className="absolute w-full h-1 bg-background/10 rounded-full" />
                <div className="absolute h-1 bg-[#58C4DD] rounded-full shadow-[0_0_10px_#58C4DD44]" style={{ width: `${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}%` }} />
                <input 
                    type="range" min="0" max={(history.length || 1) - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute w-1.5 h-4 bg-[#f59e0b] rounded-full shadow-[0_0_15px_#f59e0b] pointer-events-none transition-all"
                    style={{ left: `calc(${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}% - 3px)` }}
                />
            </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-10 py-6 bg-muted/20 border border-border rounded-[2.5rem] flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Active State</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#58C4DD]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Dependency Bit</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#83C167]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Stabilized DP</span></div>
         <div className="flex items-center gap-3"><TrendingUp size={14} className="text-muted-foreground/20" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Bottom-Up Memo</span></div>
      </div>
    </div>
  );
}