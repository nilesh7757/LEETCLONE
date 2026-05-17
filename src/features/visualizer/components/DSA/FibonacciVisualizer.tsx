"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, ChevronLeft, ChevronRight, Zap, 
  ArrowUp, Activity, Cpu, TrendingUp
} from "lucide-react";

// Professional Palette
const MANIM_COLORS = { 
  blue: "var(--viz-cyan)",
  green: "var(--viz-deep-purple)",
  gold: "var(--viz-deep-purple)"
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-compute Tabulation
  const history = useMemo(() => {
    const steps: FibStep[] = [];
    const dp = new Array(n + 1).fill(null);
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

    const addLog = (l: string) => { logs = [l, ...logs]; };

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
        dp[i] = (dp[i-1] as number) + (dp[i-2] as number);
        addLog(`Result resolved: ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}.`);
        record(`Manifold stabilized at index ${i}. State committed.`, "COMMIT", i, [i-1, i-2]);
    }

    addLog("Global resolution complete.");
    record(`Sequence fully stabilized. F(${n}) = ${dp[n]}.`, "COMPLETE", n, []);

    return steps;
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

  const currentStep = useMemo(() => {
    return history[currentIndex] || { 
        dp: new Array(n + 1).fill(null), 
        message: "Initializing...", 
        step: "IDLE", 
        currentIndex: -1, 
        dependencies: [], 
        logs: [] 
    };
  }, [history, currentIndex, n]);

  return (
    <div className="flex flex-col gap-6">
      <div className="p-4 md:p-8 bg-[var(--card)] rounded-3xl shadow-2xl font-sans text-foreground relative overflow-hidden">
        {/* Grid Backdrop */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        {/* Header UI */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 relative z-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[var(--viz-cyan)]">
              Fibonacci <span className="text-muted-foreground/40">Manifold</span>
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-1 w-12 bg-[var(--viz-cyan)] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/30">Tabulation Memoization Synthesis</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-muted p-2 rounded-2xl  shadow-inner">
            <div className="flex items-center gap-2 px-3 border-r border-border">
                <span className="text-[9px] font-black font-mono text-muted-foreground/20 uppercase">Target (N)</span>
                <input 
                    type="number" value={n} 
                    onChange={e => { setN(Math.max(1, Math.min(15, parseInt(e.target.value)||1))); setCurrentIndex(0); setIsPlaying(false); }}
                    className="w-10 bg-transparent text-center font-mono text-sm font-bold text-[var(--viz-deep-purple)] focus:outline-none"
                />
            </div>
            
            <div className="flex gap-1">
              <button onClick={() => { setIsPlaying(false); setCurrentIndex(0); }} className="p-2 hover:bg-white/5 rounded-xl text-muted-foreground/40 transition-all"><RotateCcw size={20}/></button>
              {!isPlaying ? (
                <button onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(true); }} className="flex items-center gap-2 px-6 py-2 bg-[var(--viz-cyan)] text-black rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-lg">
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
            <div className="lg:col-span-3 relative min-h-[400px] bg-muted/40 rounded-[2.5rem]  overflow-hidden shadow-inner flex flex-col items-center justify-center p-10">
                
                {/* Logic Step Badge */}
                <AnimatePresence>
                    {currentStep.step !== "IDLE" && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-8 left-10 flex items-center gap-2 px-4 py-2 bg-[var(--viz-cyan)]/10 border border-[var(--viz-cyan)]/30 rounded-full z-30 shadow-lg">
                            <Zap size={12} className="text-[var(--viz-cyan)]" />
                            <span className="text-[9px] font-black font-mono text-[var(--viz-cyan)] uppercase tracking-[0.2em]">{currentStep.step}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Explanation Box */}
                <AnimatePresence mode="wait">
                    <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-12 w-full max-w-[400px] px-4 md:px-10 text-center z-30">
                        <div className="p-4 bg-card/80  rounded-2xl backdrop-blur-md shadow-2xl">
                            <p className="text-[10px] text-[var(--viz-deep-purple)] font-mono italic uppercase tracking-tighter">{currentStep.message}</p>
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
                                        borderColor: isA ? MANIM_COLORS.gold : isD ? MANIM_COLORS.blue : isS ? "var(--viz-deep-purple)" : "var(--border)",
                                        boxShadow: isA ? `0 0 30px ${MANIM_COLORS.gold}44` : isD ? `0 0 20px ${MANIM_COLORS.blue}22` : "none"
                                    }}
                                    transition={{ type: "spring", stiffness: 150, damping: 25 }}
                                    className="w-14 h-14 border-2 rounded-2xl flex items-center justify-center font-mono shadow-lg relative"
                                >
                                    <span className={`text-base font-black ${isA ? "text-black" : val !== null ? "text-foreground" : "text-muted-foreground/20"}`}>
                                        {val !== null ? val : "?"}
                                    </span>
                                    {isA && (
                                        <motion.div layoutId="ptr" className="absolute -top-10"><ArrowUp size={14} className="text-[var(--viz-deep-purple)]" /></motion.div>
                                    )}
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar: Synthesis Log */}
            <div className="flex flex-col gap-6">
                <div className="p-6 bg-muted  rounded-[2rem] flex flex-col gap-4 flex-1 h-[300px] overflow-hidden">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2">
                        <Activity size={14}/> Synthesis Stream
                    </h3>
                    <div className="flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-thin">
                        <AnimatePresence>
                            {currentStep.logs.map((log, i) => (
                                <motion.div
                                    key={`log-${currentIndex}-${i}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[9px] font-mono text-muted-foreground/60 flex gap-2 border-l-2 border-border pl-2 py-0.5"
                                >
                                    <span className="text-[var(--viz-cyan)]">»</span>
                                    {log}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {currentStep.logs.length === 0 && <span className="text-[9px] italic text-muted-foreground/20 text-center py-8">Idle...</span>}
                    </div>
                </div>

                <div className="p-6 bg-muted  rounded-[2rem]">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest mb-4 flex items-center gap-2">
                        <Cpu size={14}/> Invariant
                    </h3>
                    <div className="p-3 bg-card  rounded-xl font-mono text-[9px] text-[var(--viz-deep-purple)] border-l-4 border-l-[var(--viz-deep-purple)] shadow-xl">
                        dp[i] = dp[i-1] + dp[i-2]
                    </div>
                </div>
            </div>
        </div>

        {/* Scrubber UI */}
        <div className="mt-8 p-6 bg-muted  rounded-[2.5rem] flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Hash size={14} className="text-[var(--viz-deep-purple)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Lemma Sequence {currentIndex + 1} of {history.length || 1}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider">
                <div className="absolute w-full h-1 bg-background/10 rounded-full" />
                <div className="absolute h-1 bg-[var(--viz-cyan)] rounded-full shadow-[0_0_10px_var(--viz-cyan)44]" style={{ width: `${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}%` }} />
                <input 
                    type="range" min="0" max={(history.length || 1) - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute w-1.5 h-4 bg-[var(--viz-deep-purple)] rounded-full shadow-[0_0_15px_var(--viz-deep-purple)] pointer-events-none transition-all"
                    style={{ left: `calc(${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}% - 3px)` }}
                />
            </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 md:px-10 py-6 bg-muted/20  rounded-[2.5rem] flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-deep-purple)]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Active State</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-cyan)]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Dependency Bit</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-deep-purple)]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Stabilized DP</span></div>
         <div className="flex items-center gap-3"><TrendingUp size={14} className="text-muted-foreground/20" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Bottom-Up Memo</span></div>
      </div>
    </div>
  );
}


