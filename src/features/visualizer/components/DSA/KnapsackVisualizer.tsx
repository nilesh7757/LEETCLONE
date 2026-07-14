"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, ChevronLeft, ChevronRight, Zap, 
  ShoppingBag, Database, Trophy, Gem, Crown, Smartphone, Laptop, Cpu, Plus
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

const ITEMS = [
  { id: 1, name: "Gem", w: 1, v: 10, icon: Gem, color: "#EC4899" },
  { id: 2, name: "Crown", w: 2, v: 25, icon: Crown, color: "var(--viz-amber)" },
  { id: 3, name: "Phone", w: 3, v: 40, icon: Smartphone, color: "#3B82F6" },
  { id: 4, name: "Laptop", w: 4, v: 60, icon: Laptop, color: "#A855F7" },
];
const CAPACITY = 6;

interface DPStep {
  dp: number[][];
  itemIdx: number; 
  weight: number;  
  message: string;
  step: string;
  activeLine: number; 
  decision: "INCLUDE" | "EXCLUDE" | "NONE";
  dependencies: [number, number][]; 
  logs: string[];
}

export default function KnapsackVisualizer({ speed = 800 }: { speed?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const history = useMemo(() => {
    const n = ITEMS.length;
    const W = CAPACITY;
    const steps: DPStep[] = [];
    const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
    let logs: string[] = [];

    const record = (msg: string, step: string, i: number, w: number, line: number, dec: DPStep['decision'], deps: [number, number][]) => {
      steps.push({
        dp: dp.map(r => [...r]),
        itemIdx: i,
        weight: w,
        message: msg,
        step: step,
        activeLine: line,
        decision: dec,
        dependencies: deps,
        logs: [...logs]
      });
    };

    const addLog = (l: string) => { logs = [l, ...logs]; };

    addLog("Initializing DP Tensor (Capacity 0-6kg).");
    record("Initializing DP table. Row 0 represents 0 items.", "INIT", 0, 0, 0, "NONE", []);

    for (let i = 1; i <= n; i++) {
      const item = ITEMS[i - 1];
      for (let w = 0; w <= W; w++) {
        addLog(`Evaluating Item ${i} (${item.name}) @ Capacity ${w}kg.`);
        record(`Checking if '${item.name}' (Weight: ${item.w}) fits in ${w}kg capacity...`, "EVALUATE", i, w, 1, "NONE", []);

        const excludeVal = dp[i - 1][w];
        
        if (item.w <= w) {
          const includeVal = item.v + dp[i - 1][w - item.w];
          record(`Comparing: Exclude (${excludeVal}) vs Include (${includeVal}).`, "COMPARE", i, w, 3, "NONE", [[i-1, w], [i-1, w - item.w]]);

          if (includeVal > excludeVal) {
            dp[i][w] = includeVal;
            addLog(`Include > Exclude. New Max: ${includeVal}.`);
            record(`Taking '${item.name}' yields higher value. Updating state.`, "COMMIT_INCLUDE", i, w, 3, "INCLUDE", [[i-1, w - item.w]]);
          } else {
            dp[i][w] = excludeVal;
            addLog(`Exclude >= Include. Keeping: ${excludeVal}.`);
            record(`Skipping '${item.name}' is better/equal. Inheriting previous state.`, "COMMIT_EXCLUDE", i, w, 3, "EXCLUDE", [[i-1, w]]);
          }
        } else {
          dp[i][w] = excludeVal;
          addLog(`Item too heavy (${item.w} > ${w}). Skipping.`);
          record(`Item weight ${item.w}kg exceeds current capacity ${w}kg. Cannot include.`, "WEIGHT_OVERFLOW", i, w, 2, "EXCLUDE", [[i-1, w]]);
        }
      }
    }

    addLog(`Optimal Value Found: ${dp[n][W]}.`);
    record(`DP Complete. Max value is ${dp[n][W]}.`, "COMPLETE", n, W, -1, "NONE", []);

    return steps;
  }, []);

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
    dp: Array.from({ length: ITEMS.length + 1 }, () => new Array(CAPACITY + 1).fill(0)),
    itemIdx: 0,
    weight: 0,
    message: "Initializing Protocol...",
    step: "BOOT",
    activeLine: 0,
    decision: "NONE",
    dependencies: [],
    logs: []
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
                    <Database size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">0/1 Knapsack</h2>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Dynamic Programming Tensor</p>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button onClick={() => { setIsPlaying(false); setCurrentIndex(0); }} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all"><RotateCcw size={18}/></button>
             <button 
                onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(!isPlaying); }} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${isPlaying ? "bg-muted text-foreground" : "bg-[var(--viz-cyan)] text-black hover:scale-105"}`}
             >
                {isPlaying ? <><Pause size={16} fill="currentColor"/> PAUSE</> : <><Play size={16} fill="currentColor"/> RUN</>}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 relative p-3 md:p-6 bg-muted/30 rounded-[2rem]  overflow-hidden shadow-inner flex flex-col items-center">
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

                <div className="relative z-10 w-full overflow-x-auto pb-2 custom-scrollbar">
                    <div className="min-w-fit flex flex-col items-start mx-auto">
                        <div className="flex mb-2">
                            <div className="w-20" /> 
                            {Array.from({ length: CAPACITY + 1 }).map((_, c) => (
                                <div key={`col-${c}`} className={`w-12 h-8 flex items-center justify-center font-mono text-[9px] font-black uppercase tracking-tight transition-colors ${currentStep.weight === c ? "text-[var(--viz-amber)]" : "text-muted-foreground/30"}`}>
                                    {c}kg
                                </div>
                            ))}
                        </div>

                        {currentStep.dp.map((row, r) => (
                            <div key={`row-${r}`} className="flex mb-1">
                                <div className={`w-32 h-10 flex items-center justify-start gap-2 font-mono text-[9px] font-bold uppercase tracking-tight transition-colors px-2 border-r border-border/50 ${currentStep.itemIdx === r ? "text-[var(--viz-cyan)] bg-[var(--viz-cyan)]/5" : "text-muted-foreground/30"}`}>
                                    {r === 0 ? "INIT (0, $0)" : (
                                        <div className="flex flex-col leading-none">
                                            <span>{ITEMS[r-1].name}</span>
                                            <span className="text-[8px] opacity-50 mt-0.5">{ITEMS[r-1].w}kg | ${ITEMS[r-1].v}</span>
                                        </div>
                                    )}
                                </div>
                                {row.map((val, c) => {
                                    const isCurrent = r === currentStep.itemIdx && c === currentStep.weight;
                                    const depIndex = currentStep.dependencies.findIndex(([dr, dc]) => dr === r && dc === c);
                                    const isExcludeDep = depIndex === 0;
                                    const isIncludeDep = depIndex === 1;
                                    
                                    return (
                                        <div key={`${r}-${c}`} className="w-12 h-10 flex items-center justify-center relative">
                                            <motion.div
                                                initial={false}
                                                animate={{ 
                                                    scale: isCurrent ? 1.15 : (isExcludeDep || isIncludeDep) ? 1.1 : 1,
                                                    backgroundColor: isCurrent ? `${MANIM_COLORS.blue}20` : 
                                                                     isExcludeDep ? `${MANIM_COLORS.red}15` : 
                                                                     isIncludeDep ? `${MANIM_COLORS.green}15` : "transparent",
                                                    borderColor: isCurrent ? MANIM_COLORS.blue : 
                                                                 isExcludeDep ? MANIM_COLORS.red : 
                                                                 isIncludeDep ? MANIM_COLORS.green : "var(--border)",
                                                    opacity: (r > currentStep.itemIdx || (r === currentStep.itemIdx && c > currentStep.weight)) ? 0.3 : 1
                                                }}
                                                className="w-10 h-10 border rounded-lg flex items-center justify-center text-xs font-mono font-bold shadow-sm z-10"
                                            >
                                                <span className={isCurrent ? "text-[var(--viz-cyan)]" : isExcludeDep ? "text-[var(--viz-rose)]" : isIncludeDep ? "text-[var(--viz-deep-purple)]" : "text-muted-foreground"}>{val}</span>
                                            </motion.div>
                                            
                                            {isCurrent && currentStep.decision !== 'NONE' && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1.5 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute -top-4 text-[8px] font-black text-[var(--viz-amber)] z-20"
                                                >
                                                    {currentStep.decision === 'INCLUDE' ? 'INC' : 'EXC'}
                                                </motion.div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-[500px]">
                    <div className={`p-3 rounded-xl border transition-all ${currentStep.decision === "EXCLUDE" ? "bg-[var(--viz-rose)]/10 border-[var(--viz-rose)]/40 shadow-[0_0_15px_var(--viz-rose)22]" : "bg-card/50 border-border opacity-40"}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black uppercase text-[var(--viz-rose)] tracking-widest flex items-center gap-2">
                                <RotateCcw size={10} /> Exclude
                            </span>
                            {currentStep.decision === "EXCLUDE" && <Trophy size={12} className="text-[var(--viz-rose)]" />}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground space-y-1">
                            <p className="opacity-50">Inherit Previous State</p>
                            <div className="flex items-center justify-between bg-[var(--card)] border border-[var(--border)] shadow-sm p-1.5 rounded">
                                <span>DP[{currentStep.itemIdx-1}][{currentStep.weight}]</span>
                                <span className="text-[var(--viz-rose)] font-bold text-sm">
                                    {currentStep.itemIdx > 0 ? currentStep.dp[currentStep.itemIdx-1][currentStep.weight] : 0}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className={`p-3 rounded-xl border transition-all ${currentStep.decision === "INCLUDE" ? "bg-[var(--viz-deep-purple)]/10 border-[var(--viz-deep-purple)]/40 shadow-[0_0_15px_var(--viz-deep-purple)22]" : "bg-card/50 border-border opacity-40"}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black uppercase text-[var(--viz-deep-purple)] tracking-widest flex items-center gap-2">
                                <Plus size={10} /> Include
                            </span>
                            {currentStep.decision === "INCLUDE" && <Trophy size={12} className="text-[var(--viz-deep-purple)]" />}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground space-y-1">
                            <p className="opacity-50">Item Value + Rem. Cap.</p>
                            <div className="flex items-center justify-between bg-[var(--card)] border border-[var(--border)] shadow-sm p-1.5 rounded">
                                <span className="truncate max-w-[80px]">
                                    {currentStep.itemIdx > 0 ? ITEMS[currentStep.itemIdx-1].v : 0} + DP[{currentStep.itemIdx-1}][{Math.max(0, currentStep.weight - (currentStep.itemIdx > 0 ? ITEMS[currentStep.itemIdx-1].w : 0))}]
                                </span>
                                <span className="text-[var(--viz-deep-purple)] font-bold text-sm">
                                    {currentStep.itemIdx > 0 && ITEMS[currentStep.itemIdx-1].w <= currentStep.weight 
                                        ? ITEMS[currentStep.itemIdx-1].v + currentStep.dp[currentStep.itemIdx-1][currentStep.weight - ITEMS[currentStep.itemIdx-1].w] 
                                        : "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="p-3 md:p-6 bg-muted/20  rounded-[2rem]">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2 mb-4">
                        <ShoppingBag size={14}/> Active Item
                    </h3>
                    <AnimatePresence mode="wait">
                        {currentStep.itemIdx > 0 ? (
                            <motion.div 
                                key={currentStep.itemIdx} 
                                initial={{ opacity: 0, x: 10 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -10 }} 
                                className="flex items-center gap-4 p-4 bg-card rounded-2xl  shadow-md"
                            >
                                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                                    {React.createElement(ITEMS[currentStep.itemIdx - 1].icon, { size: 24, style: { color: ITEMS[currentStep.itemIdx - 1].color } })}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xs font-black uppercase tracking-tight">{ITEMS[currentStep.itemIdx - 1].name}</h4>
                                    <div className="flex gap-3 mt-1.5">
                                        <span className="text-[9px] font-mono bg-[var(--viz-cyan)]/10 text-[var(--viz-cyan)] px-1.5 py-0.5 rounded">
                                            {ITEMS[currentStep.itemIdx-1].w}kg
                                        </span>
                                        <span className="text-[9px] font-mono bg-[var(--viz-deep-purple)]/10 text-[var(--viz-deep-purple)] px-1.5 py-0.5 rounded">
                                            ${ITEMS[currentStep.itemIdx-1].v}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-20 flex items-center justify-center text-[10px] italic text-muted-foreground/30">
                                Initialization...
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-3 md:p-6 bg-muted/20  rounded-[2rem] flex-1 min-h-[350px] md:min-h-[200px] w-full overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2 mb-4">
                        <Cpu size={14}/> Logic Flow
                    </h3>
                    <div className="space-y-2 font-mono text-[9px]">
                        <div className={`p-2 rounded-lg border transition-all ${currentStep.activeLine === 1 ? "bg-[var(--viz-cyan)]/10 border-[var(--viz-cyan)] text-[var(--viz-cyan)]" : "border-transparent text-muted-foreground/40"}`}>
                            1. Check weight: Item.w &le; Capacity?
                        </div>
                        <div className={`p-2 rounded-lg border transition-all ${currentStep.activeLine === 2 ? "bg-[var(--viz-rose)]/10 border-[var(--viz-rose)] text-[var(--viz-rose)]" : "border-transparent text-muted-foreground/40"}`}>
                            2. Overflow: Keep previous max
                        </div>
                        <div className={`p-2 rounded-lg border transition-all ${currentStep.activeLine === 3 ? "bg-[var(--viz-deep-purple)]/10 border-[var(--viz-deep-purple)] text-[var(--viz-deep-purple)]" : "border-transparent text-muted-foreground/40"}`}>
                            3. Fit: Max(Include, Exclude)
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
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-[var(--viz-cyan)]" /><span className="text-[9px] font-bold uppercase tracking-wider">Current Cell</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-[var(--viz-amber)]" /><span className="text-[9px] font-bold uppercase tracking-wider">Dependency</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-[var(--viz-deep-purple)]" /><span className="text-[9px] font-bold uppercase tracking-wider">Include</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-[var(--viz-rose)]" /><span className="text-[9px] font-bold uppercase tracking-wider">Exclude</span></div>
        </div>

      </div>
    </div>
  );
}


