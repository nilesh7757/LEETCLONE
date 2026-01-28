"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, ChevronRight, ChevronLeft, GitCommit, ArrowRight, ShoppingBag, Database, Sparkles, Trophy, Gem, Crown, Smartphone, Laptop, Briefcase } from "lucide-react";

const COLORS = {
  bg: "#1C1C1C",
  primary: "#58C4DD", // Exclude dependency
  secondary: "#FFFF00", // Include dependency
  accent: "#FC6255", // Current Cell
  success: "#83C167", // Decision result
  text: "#FFFFFF",
};

const ITEMS = [
  { id: 1, name: "Gem", w: 1, v: 10, icon: Gem, color: "#EC4899" },
  { id: 2, name: "Crown", w: 2, v: 25, icon: Crown, color: "#EAB308" },
  { id: 3, name: "Phone", w: 3, v: 40, icon: Smartphone, color: "#3B82F6" },
  { id: 4, name: "Laptop", w: 4, v: 60, icon: Laptop, color: "#A855F7" },
];
const CAPACITY = 6;

interface Step {
  dp: number[][];
  itemIdx: number; // 1-based
  weight: number;
  desc: string;
  activeLine: number; // 0: init, 1: loops, 2: exclude, 3: include, 4: max
  decision: "INCLUDE" | "EXCLUDE" | "NONE";
  dependencies: [number, number][]; // [row, col]
}

export default function KnapsackVisualizer({ speed = 800 }: { speed?: number }) {
  const [history, setHistory] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-compute History
  useEffect(() => {
    const n = ITEMS.length;
    const W = CAPACITY;

    const precompute = () => {
        const localHistory: Step[] = [];
        const localDp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
        
        localHistory.push({
            dp: localDp.map(r => [...r]),
            itemIdx: 0, weight: 0,
            desc: "DP table initialized. Starting bottom-up synthesis.",
            activeLine: 0, decision: "NONE", dependencies: []
        });

        for (let i = 1; i <= n; i++) {
            const item = ITEMS[i - 1];
            for (let w = 0; w <= W; w++) {
                // Focus on current cell
                localHistory.push({
                    dp: localDp.map(r => [...r]),
                    itemIdx: i, weight: w,
                    desc: `Evaluating '${item.name}' for sub-capacity ${w}kg.`,
                    activeLine: 1, decision: "NONE", dependencies: []
                });

                const excludeVal = localDp[i - 1][w];
                let includeVal = -1;

                if (item.w <= w) {
                    includeVal = item.v + localDp[i - 1][w - item.w];
                    
                    // Show comparison
                    localHistory.push({
                        dp: localDp.map(r => [...r]),
                        itemIdx: i, weight: w,
                        desc: `Comparing Exclude (${excludeVal}) vs Include (${item.v} + ${localDp[i - 1][w - item.w]}).`,
                        activeLine: 3, decision: "NONE", 
                        dependencies: [[i-1, w], [i-1, w - item.w]]
                    });

                    if (includeVal > excludeVal) {
                        localDp[i][w] = includeVal;
                        localHistory.push({
                            dp: localDp.map(r => [...r]),
                            itemIdx: i, weight: w,
                            desc: `Include wins! New optimal value: ${includeVal}.`,
                            activeLine: 4, decision: "INCLUDE", dependencies: [[i-1, w - item.w]]
                        });
                    } else {
                        localDp[i][w] = excludeVal;
                        localHistory.push({
                            dp: localDp.map(r => [...r]),
                            itemIdx: i, weight: w,
                            desc: `Exclude wins. Previous optimal remains: ${excludeVal}.`,
                            activeLine: 4, decision: "EXCLUDE", dependencies: [[i-1, w]]
                        });
                    }
                } else {
                    // Too heavy
                    localDp[i][w] = excludeVal;
                    localHistory.push({
                        dp: localDp.map(r => [...r]),
                        itemIdx: i, weight: w,
                        desc: `Item '${item.name}' is too heavy (${item.w}kg > ${w}kg). Inheriting value.`,
                        activeLine: 2, decision: "EXCLUDE", dependencies: [[i-1, w]]
                    });
                }
            }
        }

        localHistory.push({
            dp: localDp.map(r => [...r]),
            itemIdx: -1, weight: -1,
            desc: `Optimal selection complete. Maximum value for ${W}kg is ${localDp[n][W]}.`,
            activeLine: -1, decision: "NONE", dependencies: []
        });

        return localHistory;
    };

    setHistory(precompute());
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  // Playback Control
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
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

  const currentStep = history[currentStepIndex] || { 
      dp: [], itemIdx: 0, weight: 0, desc: "Loading...", activeLine: -1, decision: "NONE", dependencies: [] 
  };

  const isComplete = currentStepIndex === history.length - 1;

  return (
    <div className="flex flex-col gap-8 text-white font-sans">
      
      {/* Main Synthesis Area */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left: Inventory & Decision (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
            
            {/* Current Item Profile */}
            <div className="p-6 bg-[#1C1C1C] border border-white/10 rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 bg-white/5 rounded-xl"><ShoppingBag size={20} className="text-[#FC6255]" /></div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Current Payload</h3>
                </div>

                <AnimatePresence mode="wait">
                    {currentStep.itemIdx > 0 ? (
                        <motion.div 
                            key={currentStep.itemIdx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center gap-6"
                        >
                            <div className="relative">
                                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                                    {React.createElement(ITEMS[currentStep.itemIdx - 1].icon, { 
                                        size: 40, 
                                        style: { color: ITEMS[currentStep.itemIdx - 1].color } 
                                    })}
                                </div>
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1] }} 
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#FC6255] flex items-center justify-center text-[10px] font-black shadow-lg"
                                >
                                    {currentStep.itemIdx}
                                </motion.div>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-2xl font-bold">{ITEMS[currentStep.itemIdx - 1].name}</h4>
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] uppercase font-black text-white/30 tracking-tighter">Weight</span>
                                        <span className="text-sm font-mono text-[#58C4DD]">{ITEMS[currentStep.itemIdx - 1].w}kg</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] uppercase font-black text-white/30 tracking-tighter">Value</span>
                                        <span className="text-sm font-mono text-[#83C167]">${ITEMS[currentStep.itemIdx - 1].v}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-20 flex items-center justify-center text-white/20 italic text-sm">Waiting for input...</div>
                    )}
                </AnimatePresence>
            </div>

            {/* Knapsack Visualization */}
            <div className="p-6 bg-[#1C1C1C] border border-white/10 rounded-[2rem] shadow-2xl flex-1 relative overflow-hidden flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/5 rounded-xl"><Briefcase size={20} className="text-[#FFFF00]" /></div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Sub-Capacity Manifold</h3>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center gap-8">
                    <div className="relative w-32 h-40">
                        {/* The Bag */}
                        <div className="absolute inset-0 border-b-4 border-x-4 border-white/20 rounded-b-3xl" />
                        <div className="absolute bottom-0 left-0 w-full bg-[#58C4DD]/10 transition-all duration-500 rounded-b-[1.4rem]" style={{ height: `${(currentStep.weight / CAPACITY) * 100}%` }} />
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black font-mono text-white/10">{currentStep.weight}</span>
                            <span className="text-[8px] font-black uppercase text-white/5 tracking-widest">Cap Limit</span>
                        </div>
                    </div>

                    <div className="w-full space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                            <span>Efficiency</span>
                            <span>{Math.round((currentStep.weight / CAPACITY) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-[#58C4DD] to-[#FC6255]"
                                animate={{ width: `${(currentStep.weight / CAPACITY) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right: DP Table (8 cols) */}
        <div className="xl:col-span-8 p-8 bg-[#1C1C1C] border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
            
            <div className="flex items-center gap-3 mb-8 relative z-10 self-start">
                <div className="p-2 bg-white/5 rounded-xl"><Database size={20} className="text-[#58C4DD]" /></div>
                <div>
                    <h3 className="text-lg font-bold text-white">Dynamic Programming Tensor</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Bottom-Up Memoization</p>
                </div>
            </div>

            <div className="relative z-10 overflow-x-auto w-full flex justify-center">
                <div className="min-w-fit">
                    <div className="flex">
                        <div className="w-16 h-10" /> {/* Corner */}
                        {Array.from({ length: CAPACITY + 1 }).map((_, c) => (
                            <div key={`col-${c}`} className={`w-12 h-10 flex items-center justify-center font-mono text-[10px] font-black ${currentStep.weight === c ? "text-[#FFFF00] scale-125" : "text-white/20"}`}>
                                {c}kg
                            </div>
                        ))}
                    </div>
                    {currentStep.dp.map((row, r) => (
                        <div key={`row-${r}`} className="flex">
                            <div className={`w-16 h-12 flex items-center justify-start gap-2 font-mono text-[10px] font-bold ${currentStep.itemIdx === r ? "text-[#58C4DD]" : "text-white/20"}`}>
                                {r === 0 ? "EMPTY" : ITEMS[r-1].name.toUpperCase()}
                            </div>
                            {row.map((val, c) => {
                                const isCurrent = r === currentStep.itemIdx && c === currentStep.weight;
                                const isDependency = currentStep.dependencies.some(([dr, dc]) => dr === r && dc === c);
                                
                                let borderColor = "border-white/5";
                                let bgColor = "bg-white/5";
                                let textColor = "text-white/40";
                                let scale = 1;

                                if (isCurrent) {
                                    borderColor = "border-[#FC6255]";
                                    bgColor = "bg-[#FC6255]/10";
                                    textColor = "text-[#FC6255]";
                                    scale = 1.1;
                                } else if (isDependency) {
                                    const depType = (currentStep.itemIdx > 0 && c === currentStep.weight - ITEMS[currentStep.itemIdx-1].w) ? COLORS.secondary : COLORS.primary;
                                    borderColor = `border-[${depType}]`;
                                    textColor = `text-[${depType}]`;
                                    bgColor = `bg-[${depType}]/5`;
                                }

                                return (
                                    <motion.div
                                        key={`${r}-${c}`}
                                        animate={{ scale, borderColor: borderColor.replace("border-", ""), backgroundColor: bgColor.replace("bg-", "") }}
                                        className={`w-12 h-12 border ${borderColor} ${bgColor} flex items-center justify-center text-xs font-mono font-bold transition-all relative group`}
                                    >
                                        <span className={textColor}>{val}</span>
                                        {isCurrent && <motion.div layoutId="knap-outline" className="absolute inset-0 border-2 border-[#FC6255] rounded-lg z-30" />}
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Decision Analysis */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className={`p-4 rounded-2xl border transition-all ${currentStep.decision === "EXCLUDE" ? "bg-[#FC6255]/10 border-[#FC6255]/40" : "bg-white/5 border-white/10 opacity-40"}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase text-[#FC6255] tracking-widest">Option A: Exclude</span>
                        {currentStep.decision === "EXCLUDE" && <Trophy size={14} className="text-[#FC6255]" />}
                    </div>
                    <p className="text-xs font-mono text-white/60">DP[i-1][w] = {currentStep.itemIdx > 0 ? currentStep.dp[currentStep.itemIdx-1][currentStep.weight] : 0}</p>
                </div>
                <div className={`p-4 rounded-2xl border transition-all ${currentStep.decision === "INCLUDE" ? "bg-[#83C167]/10 border-[#83C167]/40" : "bg-white/5 border-white/10 opacity-40"}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase text-[#83C167] tracking-widest">Option B: Include</span>
                        {currentStep.decision === "INCLUDE" && <Trophy size={14} className="text-[#83C167]" />}
                    </div>
                    {currentStep.itemIdx > 0 && (
                        <p className="text-xs font-mono text-white/60">
                            Val + DP[i-1][w-wt] = {ITEMS[currentStep.itemIdx-1].v} + {currentStep.dp[currentStep.itemIdx-1][currentStep.weight - ITEMS[currentStep.itemIdx-1].w] ?? 0}
                        </p>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Playback & Analysis Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls */}
          <div className="lg:col-span-8 p-8 bg-[#1C1C1C] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col justify-between">
               <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <GitCommit className="text-[#FFFF00]" size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Step {currentStepIndex + 1} / {history.length}</span>
                    </div>
                    
                    <div className="flex gap-2">
                        <button onClick={() => { setIsPlaying(false); setCurrentStepIndex(Math.max(0, currentStepIndex - 1)); }} className="p-3 hover:bg-white/10 rounded-2xl text-white/60 transition-colors"><ChevronLeft size={20} /></button>
                        <button onClick={() => setIsPlaying(!isPlaying)} className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isPlaying ? "bg-[#FC6255]/20 text-[#FC6255]" : "bg-[#58C4DD] text-black shadow-[0_0_20px_#58C4DD44]"}`}>
                             {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                             {isPlaying ? "HALT" : "EXECUTE"}
                        </button>
                        <button onClick={() => { setIsPlaying(false); setCurrentStepIndex(Math.min(history.length - 1, currentStepIndex + 1)); }} className="p-3 hover:bg-white/10 rounded-2xl text-white/60 transition-colors"><ChevronRight size={20} /></button>
                        <button onClick={() => { setIsPlaying(false); setCurrentStepIndex(0); }} className="p-3 hover:bg-white/10 rounded-2xl text-white/60 transition-colors"><RotateCcw size={20} /></button>
                    </div>
               </div>
               
               {/* Progress Bar */}
               <div className="relative h-2 bg-white/5 rounded-full overflow-hidden cursor-pointer group" onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const pct = (e.clientX - rect.left) / rect.width;
                   setCurrentStepIndex(Math.floor(pct * history.length));
               }}>
                   <motion.div 
                        className="absolute top-0 left-0 h-full bg-[#58C4DD]" 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStepIndex + 1) / history.length) * 100}%` }}
                   />
               </div>
               <div className="mt-6 text-center h-10 flex items-center justify-center">
                   <AnimatePresence mode="wait">
                        <motion.p key={currentStep.desc} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="font-mono text-xs text-[#FFFF00] leading-relaxed uppercase tracking-tight">
                             {currentStep.desc}
                        </motion.p>
                   </AnimatePresence>
               </div>
          </div>

          {/* Recurrence View */}
          <div className="lg:col-span-4 p-8 bg-black/40 border border-white/5 rounded-[2.5rem] font-mono text-xs overflow-hidden relative flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={80} /></div>
              <div className="space-y-4 relative z-10">
                  <div className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-2 text-center">Recurrence Invariant</div>
                  <div className={`p-3 rounded-xl border transition-all ${currentStep.activeLine === 1 ? "bg-white/10 border-white/20 text-white" : "text-white/20 border-transparent"}`}>
                      for each item i, capacity w:
                  </div>
                  <div className={`pl-4 p-3 rounded-xl border transition-all ${currentStep.activeLine === 2 ? "bg-[#FC6255]/20 border-[#FC6255]/40 text-[#FC6255]" : "text-white/20 border-transparent"}`}>
                      if weight[i] &gt; w:
                      <br/>&nbsp;&nbsp;dp[i][w] = dp[i-1][w]
                  </div>
                  <div className={`pl-4 p-3 rounded-xl border transition-all ${currentStep.activeLine === 3 || currentStep.activeLine === 4 ? "bg-[#83C167]/20 border-[#83C167]/40 text-[#83C167]" : "text-white/20 border-transparent"}`}>
                      else:
                      <br/>&nbsp;&nbsp;dp[i][w] = max(
                      <br/>&nbsp;&nbsp;&nbsp;&nbsp;dp[i-1][w], 
                      <br/>&nbsp;&nbsp;&nbsp;&nbsp;val[i] + dp[i-1][w-wt[i]]
                      <br/>&nbsp;&nbsp;)
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
}