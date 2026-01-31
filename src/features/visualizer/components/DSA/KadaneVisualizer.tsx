"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Sparkles, Hash, Info, 
  ChevronRight, ChevronLeft, Activity, Cpu, Zap, TrendingUp,
  BarChart2, Target
} from "lucide-react";

// Consistency with other visualizers in the Academy of Algorithms
const MANIM_COLORS = { 
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#f59e0b",
  red: "#FC6255",
  purple: "#9A72AC"
};

const ARRAY_SIZE = 12;

interface KadaneStep {
  array: number[];
  currentIndex: number;
  currentSum: number;
  maxSum: number;
  subarrayRange: [number, number]; // [start, end]
  bestRange: [number, number];     // [start, end]
  explanation: string;
  stepType: "INIT" | "ADD" | "RESET" | "UPDATE_MAX" | "COMPLETE";
  logs: string[];
}

export default function KadaneVisualizer({ speed = 800 }: { speed?: number }) {
  const [initialData, setInitialData] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a placement-ready manifold (mix of pos/neg)
  const generateArray = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    const arr = Array.from({ length: ARRAY_SIZE }, () => 
      Math.floor(Math.random() * 30) - 12 // Range: -12 to 17
    );
    // Ensure variety to showcase the lemma
    if (!arr.some(n => n < 0)) arr[Math.floor(Math.random() * ARRAY_SIZE)] = -15;
    if (!arr.some(n => n > 0)) arr[Math.floor(Math.random() * ARRAY_SIZE)] = 10;
    setInitialData(arr);
  };

  useEffect(() => { generateArray(); }, []);

  const history = useMemo(() => {
    if (initialData.length === 0) return [];

    const steps: KadaneStep[] = [];
    let currentLogs: string[] = [];
    
    const record = (
      msg: string, 
      type: KadaneStep["stepType"], 
      idx: number, 
      currS: number, 
      maxS: number, 
      range: [number, number], 
      bestR: [number, number]
    ) => {
      currentLogs = [msg, ...currentLogs].slice(0, 10);
      steps.push({
        array: [...initialData],
        currentIndex: idx,
        currentSum: currS,
        maxSum: maxS,
        subarrayRange: range,
        bestRange: bestR,
        explanation: msg,
        stepType: type,
        logs: [...currentLogs]
      });
    };

    let maxSoFar = -Infinity;
    let currentMax = 0;
    let s = 0;
    let bestStart = 0, bestEnd = 0;

    record("Manifold initialized. Optimal subarray search initiated.", "INIT", -1, 0, 0, [0, -1], [0, -1]);

    for (let i = 0; i < initialData.length; i++) {
      const val = initialData[i];
      currentMax += val;
      
      // Step: Processing element
      record(
        `Processing index ${i} (${val > 0 ? '+' : ''}${val}). Local potential now ${currentMax}.`, 
        "ADD", i, currentMax, maxSoFar === -Infinity ? 0 : maxSoFar, [s, i], [bestStart, bestEnd]
      );

      if (currentMax > maxSoFar) {
        maxSoFar = currentMax;
        bestStart = s;
        bestEnd = i;
        record(
          `New global maximum localized: ${maxSoFar}. Updating optimal range boundaries.`, 
          "UPDATE_MAX", i, currentMax, maxSoFar, [s, i], [bestStart, bestEnd]
        );
      }

      if (currentMax < 0) {
        record(
          `Local potential collapsed to ${currentMax}. Pruning non-viable manifold. Resetting search pivot.`, 
          "RESET", i, currentMax, maxSoFar, [s, i], [bestStart, bestEnd]
        );
        currentMax = 0;
        s = i + 1;
      }
    }

    record("Search space exhausted. Global optimum stabilized.", "COMPLETE", initialData.length - 1, 0, maxSoFar, [bestStart, bestEnd], [bestStart, bestEnd]);
    return steps;
  }, [initialData]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= history.length - 1) { setIsPlaying(false); return prev; }
          return prev + 1;
        });
      }, speed);
    } else if (timerRef.current) { clearInterval(timerRef.current); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, history.length, speed]);

  const currentStep = history[currentIndex] || { 
    array: initialData, 
    currentIndex: -1, 
    currentSum: 0, 
    maxSum: 0, 
    subarrayRange: [0, -1], 
    bestRange: [0, -1], 
    explanation: "Waiting for manifold...", 
    stepType: "INIT",
    logs: [] 
  };

  return (
    <div className="flex flex-col gap-4 select-none font-sans p-4 md:p-6">
      {/* Header UI */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-6 relative z-10 gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-light tracking-tight text-[#58C4DD]">
            Kadane&apos;s <span className="text-muted-foreground/40">Subarray Lemma</span>
          </h2>
          <div className="flex items-center gap-3">
             <div className="h-1 w-8 bg-[#58C4DD] rounded-full" />
             <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground/30">Linear Optimization Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-muted/50 p-1.5 rounded-xl border border-border shadow-inner">
          <button onClick={generateArray} className="p-2 bg-card hover:bg-white/5 rounded-lg border border-border transition-all text-muted-foreground hover:text-foreground shadow-sm active:scale-95">
            <RotateCcw size={16}/>
          </button>
          <div className="w-[1px] h-6 bg-border mx-1" />
          <button 
            onClick={() => {
              if (currentIndex >= history.length - 1) setCurrentIndex(0);
              setIsPlaying(!isPlaying);
            }} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
              isPlaying ? "bg-[#FC6255]/20 text-[#FC6255] border border-[#FC6255]/30" : "bg-[#58C4DD] text-black"
            }`}
          >
            {isPlaying ? <><Pause size={14} fill="currentColor" /> HALT</> : <><Play size={14} fill="currentColor" /> EXECUTE</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Visualization Area */}
        <div className="lg:col-span-3 relative min-h-[320px] bg-muted/10 rounded-[2rem] border border-border/50 overflow-hidden shadow-inner flex flex-col items-center justify-center p-6 md:p-10">
          
          {/* Logic Step Badge */}
          <div className="absolute top-6 left-6 flex flex-col gap-3 z-30">
            <AnimatePresence>
              {currentStep.stepType !== "INIT" && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex items-center gap-2 px-3 py-1.5 bg-[#58C4DD]/10 border border-[#58C4DD]/30 rounded-full w-fit">
                  <Zap size={10} className="text-[#58C4DD]" />
                  <span className="text-[8px] font-black font-mono text-[#58C4DD] uppercase tracking-[0.2em]">{currentStep.stepType}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sum Potential Indicator */}
          <div className="absolute top-6 right-6 flex flex-col items-end gap-1 pointer-events-none">
            <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/40">Potential Sum</span>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-black font-mono ${currentStep.currentSum < 0 ? 'text-[#FC6255]' : 'text-[#58C4DD]'}`}>
                {currentStep.currentSum}
              </span>
              <div className="w-1 h-8 bg-border/30 rounded-full overflow-hidden flex flex-col justify-end">
                <motion.div 
                  animate={{ height: `${Math.min(100, Math.max(0, (currentStep.currentSum / 50) * 100))}%` }}
                  className="w-full bg-[#58C4DD] shadow-[0_0_10px_#58C4DD]"
                />
              </div>
            </div>
          </div>

          {/* Subtitle / Narrative */}
          <AnimatePresence mode="wait">
              <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-6 w-full max-w-[400px] px-6 text-center z-30 pointer-events-none">
                  <div className="p-3 bg-card/90 border border-border rounded-xl backdrop-blur-md shadow-xl">
                      <p className="text-[10px] text-[#f59e0b] font-mono leading-relaxed italic uppercase tracking-tighter">{currentStep.explanation}</p>
                  </div>
              </motion.div>
          </AnimatePresence>

          {/* Array Visualization */}
          <div className="relative flex items-center justify-center gap-2 w-full">
              {currentStep.array.map((val, idx) => {
                  const isInCurrentRange = idx >= currentStep.subarrayRange[0] && idx <= currentStep.subarrayRange[1];
                  const isInBestRange = idx >= currentStep.bestRange[0] && idx <= currentStep.bestRange[1];
                  const isCurrentPointer = idx === currentStep.currentIndex;

                  return (
                      <div key={idx} className="relative flex flex-col items-center">
                        {/* Top Pointer */}
                        <div className="h-8 flex items-end mb-1">
                          <AnimatePresence>
                            {isCurrentPointer && (
                              <motion.div 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="flex flex-col items-center"
                              >
                                <TrendingUp size={14} className="text-[#f59e0b]" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <motion.div
                          layout
                          initial={false}
                          animate={{
                            scale: isCurrentPointer ? 1.1 : 1,
                            backgroundColor: isCurrentPointer ? MANIM_COLORS.gold : isInCurrentRange ? MANIM_COLORS.blue + "22" : "var(--card)",
                            borderColor: isInBestRange ? MANIM_COLORS.green : isCurrentPointer ? MANIM_COLORS.gold : "var(--border)",
                            borderWidth: isInBestRange ? 2 : 1,
                            boxShadow: isCurrentPointer ? `0 0 20px ${MANIM_COLORS.gold}33` : "none"
                          }}
                          className="relative w-10 h-14 rounded-xl border flex flex-col items-center justify-center transition-all duration-500"
                        >
                            <span className={`text-xs font-black font-mono ${val < 0 ? "text-[#FC6255]" : isCurrentPointer ? "text-black" : "text-foreground"}`}>{val}</span>
                            <span className="absolute -bottom-5 text-[7px] font-mono font-bold text-muted-foreground/30 uppercase">{idx}</span>
                            
                            {/* Range Indicator */}
                            {isInCurrentRange && (
                                <motion.div layoutId="range-box" className="absolute -inset-1.5 border border-dashed border-[#58C4DD]/40 rounded-lg pointer-events-none" />
                            )}
                        </motion.div>

                        {/* Best Marker */}
                        <div className="h-4 mt-6">
                          <AnimatePresence>
                            {isInBestRange && (
                              <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="w-1 h-1 rounded-full bg-[#83C167] shadow-[0_0_10px_#83C167]" />
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                  );
              })}
          </div>
        </div>

        {/* Sidebar Metrics */}
        <div className="flex flex-col gap-4">
            {/* State Invariants */}
            <div className="p-5 bg-muted/20 border border-border rounded-[2rem] space-y-4 backdrop-blur-sm flex-1 flex flex-col justify-center">
                <h3 className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2">
                    <Cpu size={12}/> Invariants
                </h3>
                <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-tighter text-muted-foreground/50">
                          <span>Local Max</span>
                          <span className="text-[#58C4DD]">DP[i]</span>
                        </div>
                        <div className="px-2 py-1.5 bg-black/20 rounded-lg border border-white/5 font-mono text-base font-bold text-[#58C4DD] text-right">
                          {currentStep.currentSum}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-tighter text-muted-foreground/50">
                          <span>Global Max</span>
                          <span className="text-[#83C167]">Result</span>
                        </div>
                        <div className="px-2 py-1.5 bg-black/20 rounded-lg border border-white/5 font-mono text-base font-bold text-[#83C167] text-right">
                          {currentStep.maxSum}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Control Interface */}
      <div className="mt-4 p-4 bg-muted/10 border border-border/50 rounded-[2rem] flex flex-col gap-4 relative z-10 backdrop-blur-sm">
          <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                  <Hash size={12} className="text-[#f59e0b]" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Step {currentIndex + 1} / {history.length || 1}</span>
              </div>
              <div className="flex items-center gap-1">
                  <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-white/5 rounded-lg text-muted-foreground transition-all active:scale-90"><ChevronLeft size={16} /></button>
                  <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-white/5 rounded-lg text-muted-foreground transition-all active:scale-90"><ChevronRight size={16} /></button>
              </div>
          </div>

          <div className="relative flex items-center group/slider px-2">
              <div className="absolute left-2 right-2 h-0.5 bg-background/20 rounded-full" />
              <div className="absolute left-2 h-0.5 bg-[#58C4DD] rounded-full" style={{ width: `calc(${(currentIndex / Math.max(1, (history.length - 1))) * 100}% - 16px)` }} />
              <input 
                  type="range" min="0" max={history.length - 1} value={currentIndex} 
                  onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                  className="w-full h-4 opacity-0 cursor-pointer z-10"
              />
              <div className="absolute w-1.5 h-3 bg-[#f59e0b] rounded-full shadow-[0_0_10px_#f59e0b] pointer-events-none transition-all"
                  style={{ left: `calc(${(currentIndex / Math.max(1, (history.length - 1))) * 100}% - 3px)` }}
              />
          </div>
      </div>

      {/* Legend */}
      <div className="mt-2 px-8 py-4 bg-muted/5 border border-border/20 rounded-[2rem] flex flex-wrap items-center justify-center gap-x-10 gap-y-3 opacity-50 hover:opacity-100 transition-opacity">
         <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-[#f59e0b]" /><span className="text-[8px] font-bold uppercase text-muted-foreground/50 tracking-widest">Probe</span></div>
         <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-[#58C4DD]/30 border border-[#58C4DD]" /><span className="text-[8px] font-bold uppercase text-muted-foreground/50 tracking-widest">Chain</span></div>
         <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full border border-[#83C167]" /><span className="text-[8px] font-bold uppercase text-muted-foreground/50 tracking-widest">Optimum</span></div>
      </div>
    </div>
  );
}