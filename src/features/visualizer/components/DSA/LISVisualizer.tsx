"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, ChevronLeft, ChevronRight, Zap, 
  TrendingUp, Database, Trophy, Cpu, Search, ArrowLeft
} from "lucide-react";

/**
 * --- Configuration ---
 */
const MANIM_COLORS = { 
  text: "var(--foreground)", 
  background: "var(--card)",
  blue: "var(--viz-cyan)",
  green: "var(--viz-deep-purple)",
  gold: "var(--viz-amber)",
  red: "var(--viz-rose)",
  purple: "var(--viz-purple)",
  muted: "rgba(255,255,255,0.1)"
};

const ARRAY_SIZE = 10;

interface DPStep {
  array: number[];
  dp: number[];
  i: number; 
  j: number;  
  message: string;
  step: string;
  activeLine: number; 
  decision: "UPDATE" | "SKIP" | "NONE";
  bestIdx: number;
  logs: string[];
}

export default function LISVisualizer({ speed = 800 }: { speed?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [initialData, setInitialData] = useState<number[]>(() => 
    Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 50) + 1)
  );
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const history = useMemo(() => {
    const n = initialData.length;
    const steps: DPStep[] = [];
    const dp = new Array(n).fill(1);
    let logs: string[] = [];

    const record = (msg: string, step: string, i: number, j: number, line: number, dec: DPStep['decision'], best: number) => {
      steps.push({
        array: [...initialData],
        dp: [...dp],
        i: i,
        j: j,
        message: msg,
        step: step,
        activeLine: line,
        decision: dec,
        bestIdx: best,
        logs: [...logs]
      });
    };

    const addLog = (l: string) => { logs = [l, ...logs]; };

    addLog("Initializing LIS Tensor. Every element is a subsequence of length 1.");
    record("Initializing DP array with 1s.", "INIT", 0, -1, 0, "NONE", -1);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < i; j++) {
        addLog(`Comparing A[${i}]=${initialData[i]} with A[${j}]=${initialData[j]}.`);
        record(`Checking if A[${j}] < A[${i}]...`, "CHECK", i, j, 1, "NONE", -1);

        if (initialData[j] < initialData[i]) {
          if (dp[j] + 1 > dp[i]) {
            dp[i] = dp[j] + 1;
            addLog(`Found longer subsequence ending at ${i} via ${j}. New length: ${dp[i]}.`);
            record(`A[${j}] < A[${i}] and DP[${j}]+1 > DP[${i}]. Updating.`, "COMMIT_UPDATE", i, j, 2, "UPDATE", j);
          } else {
            addLog(`Subsequence via ${j} (length ${dp[j]+1}) is not better than current ${dp[i]}.`);
            record(`A[${j}] < A[${i}] but DP[${j}]+1 <= DP[${i}]. Skipping.`, "COMMIT_SKIP", i, j, 2, "SKIP", -1);
          }
        } else {
          addLog(`A[${j}] >= A[${i}]. Cannot extend subsequence.`);
          record(`A[${j}] >= A[${i}]. No extension possible.`, "COMMIT_SKIP", i, j, 1, "SKIP", -1);
        }
      }
      if (i > 0) record(`Completed evaluation for index ${i}. Current Max: ${dp[i]}.`, "ITER_COMPLETE", i, -1, -1, "NONE", -1);
    }

    const maxLIS = Math.max(...dp);
    addLog(`Optimal LIS Length: ${maxLIS}.`);
    record(`DP Complete. Longest Increasing Subsequence length is ${maxLIS}.`, "COMPLETE", n-1, -1, -1, "NONE", -1);

    return steps;
  }, [initialData]);

  // --- Playback Engine ---
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
    array: initialData,
    dp: new Array(ARRAY_SIZE).fill(1),
    i: 0,
    j: -1,
    message: "Initializing Protocol...",
    step: "BOOT",
    activeLine: 0,
    decision: "NONE",
    bestIdx: -1,
    logs: []
  };

  const generateNewArray = () => {
    setInitialData(Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 50) + 1));
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col gap-6 font-sans select-none">
      <div className="p-4 md:p-8 bg-[var(--card)] rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--viz-cyan)]/10 rounded-xl text-[var(--viz-cyan)]">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Longest Increasing Subsequence</h2>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Linear Programming Engine</p>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button onClick={generateNewArray} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all"><RotateCcw size={18}/></button>
             <button 
                onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(!isPlaying); }} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${isPlaying ? "bg-muted text-foreground" : "bg-[var(--viz-cyan)] text-black hover:scale-105"}`}
             >
                {isPlaying ? <><Pause size={16} fill="currentColor"/> PAUSE</> : <><Play size={16} fill="currentColor"/> RUN</>}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 relative p-3 md:p-6 bg-muted/30 rounded-[2rem]  overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar shadow-inner flex flex-col items-center justify-center min-h-[350px] md:min-h-[400px] w-full">
                <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentStep.step}
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -10 }} 
                            className="flex items-center gap-2 px-3 py-1.5 bg-card/80  backdrop-blur-md rounded-full shadow-sm"
                        >
                            <Zap size={12} className="text-[var(--viz-cyan)]" fill="var(--viz-cyan)" />
                            <span className="text-[9px] font-black font-mono text-[var(--viz-cyan)] uppercase tracking-widest">{currentStep.step}</span>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="relative z-10 w-full overflow-x-auto pb-6 custom-scrollbar">
                    <div className="min-w-fit flex flex-col items-center gap-12 mx-auto px-4">
                        {/* Array Row */}
                        <div className="flex items-end gap-2">
                            {currentStep.array.map((val, idx) => {
                                const isI = idx === currentStep.i;
                                const isJ = idx === currentStep.j;
                                const isBest = idx === currentStep.bestIdx;
                                
                                return (
                                    <div key={`arr-${idx}`} className="relative flex flex-col items-center">
                                        <AnimatePresence>
                                            {isI && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute -top-8 text-[var(--viz-cyan)]">
                                                    <Search size={14} />
                                                </motion.div>
                                            )}
                                            {isJ && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute -top-8 text-[var(--viz-amber)]">
                                                    <ArrowLeft size={14} className="rotate-180" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <motion.div
                                            animate={{ 
                                                scale: (isI || isJ) ? 1.1 : 1,
                                                backgroundColor: isI ? `${MANIM_COLORS.blue}20` : isJ ? `${MANIM_COLORS.gold}20` : "var(--card)",
                                                borderColor: isI ? MANIM_COLORS.blue : isJ ? MANIM_COLORS.gold : "var(--border)",
                                                borderWidth: (isI || isJ) ? 2 : 1,
                                            }}
                                            className="w-12 h-16 rounded-xl border flex flex-col items-center justify-center gap-1 shadow-sm"
                                        >
                                            <span className={`text-xs font-black font-mono ${(isI || isJ) ? "text-foreground" : "text-muted-foreground"}`}>{val}</span>
                                            <span className="text-[7px] font-mono opacity-30 uppercase">idx:{idx}</span>
                                        </motion.div>

                                        {/* DP Value */}
                                        <motion.div 
                                            animate={{ 
                                                y: (isI || isJ) ? 10 : 0,
                                                opacity: idx <= currentStep.i ? 1 : 0.2,
                                                backgroundColor: isBest ? `${MANIM_COLORS.green}20` : "transparent",
                                                borderColor: isBest ? MANIM_COLORS.green : "var(--border)"
                                            }}
                                            className="mt-4 w-10 h-10 rounded-lg border flex items-center justify-center bg-muted/20"
                                        >
                                            <span className={`text-xs font-bold font-mono ${isBest ? "text-[var(--viz-deep-purple)]" : "text-muted-foreground"}`}>{currentStep.dp[idx]}</span>
                                        </motion.div>
                                        <span className="text-[6px] font-black uppercase tracking-tighter text-muted-foreground/30 mt-1">DP[{idx}]</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex items-center gap-6">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${currentStep.decision === "UPDATE" ? "bg-[var(--viz-deep-purple)]/10 border-[var(--viz-deep-purple)]/40 shadow-lg" : "bg-card/50 border-border opacity-40"}`}>
                        <div className="p-2 bg-[var(--viz-deep-purple)]/20 rounded-lg text-[var(--viz-deep-purple)]">
                            <Trophy size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase text-muted-foreground/50 tracking-widest">Update State</span>
                            <span className="text-xs font-mono font-bold text-[var(--viz-deep-purple)]">DP[i] = DP[j] + 1</span>
                        </div>
                    </div>

                    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${currentStep.decision === "SKIP" ? "bg-[var(--viz-rose)]/10 border-[var(--viz-rose)]/40 shadow-lg" : "bg-card/50 border-border opacity-40"}`}>
                        <div className="p-2 bg-[var(--viz-rose)]/20 rounded-lg text-[var(--viz-rose)]">
                            <Zap size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase text-muted-foreground/50 tracking-widest">No Action</span>
                            <span className="text-xs font-mono font-bold text-[var(--viz-rose)]">Condition False</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="p-3 md:p-6 bg-muted/20  rounded-[2rem]">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2 mb-4">
                        <Database size={14}/> Compare Buffer
                    </h3>
                    <AnimatePresence mode="wait">
                        {currentStep.j !== -1 ? (
                            <motion.div 
                                key={`${currentStep.i}-${currentStep.j}`} 
                                initial={{ opacity: 0, x: 10 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -10 }} 
                                className="space-y-3"
                            >
                                <div className="flex items-center justify-between p-3 bg-card rounded-xl border border-border/50">
                                    <span className="text-[8px] font-black uppercase text-muted-foreground/50">A[j]</span>
                                    <span className="text-lg font-black font-mono text-[var(--viz-amber)]">{currentStep.array[currentStep.j]}</span>
                                </div>
                                <div className="flex items-center justify-center">
                                    <span className="text-xs font-black text-muted-foreground/20 italic">{"<"} ?</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-card rounded-xl border border-border/50">
                                    <span className="text-[8px] font-black uppercase text-muted-foreground/50">A[i]</span>
                                    <span className="text-lg font-black font-mono text-[var(--viz-cyan)]">{currentStep.array[currentStep.i]}</span>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-40 flex items-center justify-center text-[10px] italic text-muted-foreground/30 text-center p-6">
                                Iterating through search space...
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-3 md:p-6 bg-muted/20  rounded-[2rem] flex-1">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2 mb-4">
                        <Cpu size={14}/> Logic Flow
                    </h3>
                    <div className="space-y-2 font-mono text-[9px]">
                        <div className={`p-2 rounded-lg border transition-all ${currentStep.activeLine === 1 ? "bg-[var(--viz-cyan)]/10 border-[var(--viz-cyan)] text-[var(--viz-cyan)]" : "border-transparent text-muted-foreground/40"}`}>
                            1. Check: A[j] &lt; A[i]
                        </div>
                        <div className={`p-2 rounded-lg border transition-all ${currentStep.activeLine === 2 ? "bg-[var(--viz-deep-purple)]/10 border-[var(--viz-deep-purple)] text-[var(--viz-deep-purple)]" : "border-transparent text-muted-foreground/40"}`}>
                            2. Update: DP[i] = max(DP[i], DP[j] + 1)
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-4 p-3 md:p-6 bg-muted/30  rounded-[2.5rem] flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 px-2">
                <div className="flex items-center gap-3">
                    <Hash size={14} className="text-[var(--viz-amber)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                        Step {currentIndex + 1} / {history.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider h-4">
                <div className="absolute w-full h-1 bg-background/20 rounded-full" />
                <motion.div 
                    className="absolute h-1 bg-[var(--viz-cyan)] rounded-full shadow-[0_0_10px_var(--viz-cyan)44]" 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }}
                />
                <input 
                    type="range" min="0" max={(history.length || 1) - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
            </div>
            
            <div className="flex justify-center">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentIndex} 
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="px-4 py-2 rounded-lg bg-card /50 text-[10px] font-mono text-[var(--viz-amber)] text-center max-w-2xl"
                    >
                        {currentStep.message}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>

        <div className="px-4 md:px-10 py-6 bg-muted/10 /50 rounded-[2.5rem] flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-[var(--viz-cyan)]" /><span className="text-[9px] font-bold uppercase tracking-wider">Outer Loop (i)</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-[var(--viz-amber)]" /><span className="text-[9px] font-bold uppercase tracking-wider">Inner Loop (j)</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-[var(--viz-deep-purple)]" /><span className="text-[9px] font-bold uppercase tracking-wider">Max Extension</span></div>
        </div>

      </div>
    </div>
  );
}


