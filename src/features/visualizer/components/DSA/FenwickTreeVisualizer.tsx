"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, ChevronLeft, ChevronRight, Zap, 
  Database, Cpu, Search, ArrowUp, LayoutGrid
} from "lucide-react";

const ARRAY_SIZE = 8;

interface BITStep {
  array: number[];
  bit: number[];
  currentIndex: number;
  activeIndices: number[];
  message: string;
  step: string;
  operation: "BUILD" | "QUERY" | "UPDATE" | "NONE";
}

export default function FenwickTreeVisualizer({ speed = 800 }: { speed?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [initialData, setInitialData] = useState<number[]>([1, 3, 2, 4, 5, 1, 3, 2]);
  
  const history = useMemo(() => {
    const steps: BITStep[] = [];
    const bit = new Array(ARRAY_SIZE + 1).fill(0);

    const record = (msg: string, step: string, idx: number, actives: number[], op: BITStep['operation']) => {
      steps.push({
        array: [...initialData],
        bit: [...bit],
        currentIndex: idx,
        activeIndices: actives,
        message: msg,
        step,
        operation: op
      });
    };

    record("Initializing BIT. A Fenwick Tree is represented as a 1-based array.", "INIT", -1, [], "NONE");

    // Build Process
    for (let i = 1; i <= ARRAY_SIZE; i++) {
        const val = initialData[i-1];
        let curr = i;
        while (curr <= ARRAY_SIZE) {
            bit[curr] += val;
            record(`Building: Adding ${val} to BIT[${curr}]. Next index: ${curr} + (${curr} & -${curr})`, "BUILD", i, [curr], "BUILD");
            curr += curr & -curr;
        }
    }

    // Example Query (Prefix sum of 5)
    const queryIdx = 5;
    let sum = 0;
    let tempIdx = queryIdx;
    record(`Query: Finding prefix sum up to index ${queryIdx}.`, "QUERY_START", queryIdx, [], "QUERY");
    while (tempIdx > 0) {
        sum += bit[tempIdx];
        record(`Query: Adding BIT[${tempIdx}] to sum. Current sum: ${sum}. Next: ${tempIdx} - (${tempIdx} & -${tempIdx})`, "QUERY_STEP", tempIdx, [tempIdx], "QUERY");
        tempIdx -= tempIdx & -tempIdx;
    }

    record(`Final Prefix Sum of first ${queryIdx} elements is ${sum}.`, "COMPLETE", -1, [], "NONE");
    return steps;
  }, [initialData]);

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setCurrentIndex(p => {
          if (p >= history.length - 1) { setIsPlaying(false); return p; }
          return p + 1;
        });
      }, speed);
      return () => clearInterval(timer);
    }
  }, [isPlaying, history.length, speed]);

  const currentStep = history[currentIndex] || history[0];

  return (
    <div className="flex flex-col gap-6 font-sans select-none">
      <div className="p-4 md:p-8 bg-[var(--card)] rounded-[2.5rem] shadow-2xl overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar relative flex flex-col min-h-[350px] md:min-h-[550px] w-full">
        <div className="relative z-10 flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--viz-amber)]/10 rounded-xl text-[var(--viz-amber)]">
                    <LayoutGrid size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Fenwick Tree (BIT)</h2>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Binary Indexed Range Manifold</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={() => { setCurrentIndex(0); setIsPlaying(false); }} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all"><RotateCcw size={18}/></button>
                <button onClick={() => setIsPlaying(!isPlaying)} className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${isPlaying ? "bg-muted text-foreground" : "bg-[var(--viz-amber)] text-black hover:scale-105"}`}>
                    {isPlaying ? "PAUSE" : "RUN"}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
            <div className="lg:col-span-8 relative p-3 md:p-6 bg-muted/30 rounded-[2rem] flex flex-col items-center justify-center gap-12">
                <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-card/80 backdrop-blur-md rounded-full shadow-sm border border-border/50">
                        <Zap size={12} className="text-[var(--viz-amber)]" fill="var(--viz-amber)" />
                        <span className="text-[9px] font-black font-mono text-[var(--viz-amber)] uppercase tracking-widest">{currentStep.operation}</span>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-8">
                    {/* BIT Array */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[8px] font-black uppercase text-muted-foreground/50 tracking-widest ml-1">Fenwick Array (1-indexed)</span>
                        <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
                            {currentStep.bit.slice(1).map((val, i) => {
                                const idx = i + 1;
                                const isActive = currentStep.activeIndices.includes(idx);
                                return (
                                    <motion.div
                                        key={`bit-${idx}`}
                                        animate={{ 
                                            scale: isActive ? 1.1 : 1,
                                            backgroundColor: isActive ? "var(--viz-amber)22" : "var(--card)",
                                            borderColor: isActive ? "var(--viz-amber)" : "var(--border)"
                                        }}
                                        className="min-w-[50px] h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-1 shadow-sm"
                                    >
                                        <span className="text-xs font-black font-mono">{val}</span>
                                        <span className="text-[7px] font-mono opacity-30 uppercase">idx:{idx}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Source Array */}
                    <div className="flex flex-col gap-2 opacity-60">
                        <span className="text-[8px] font-black uppercase text-muted-foreground/50 tracking-widest ml-1">Source Array</span>
                        <div className="flex gap-1.5">
                            {currentStep.array.map((val, i) => {
                                const isSrc = i + 1 === currentStep.currentIndex;
                                return (
                                    <div key={`src-${i}`} className={`min-w-[50px] h-10 rounded-lg border flex flex-col items-center justify-center transition-all ${isSrc ? "border-[var(--viz-cyan)] bg-[var(--viz-cyan)]/10 scale-105" : "border-border"}`}>
                                        <span className="text-[10px] font-bold">{val}</span>
                                        <span className="text-[6px] font-mono opacity-30">i:{i}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="p-3 md:p-6 bg-muted/20 rounded-[2rem] flex-1">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2 mb-4">
                        <Cpu size={14}/> Binary Logic
                    </h3>
                    <div className="space-y-4 font-mono text-[10px]">
                        <div className="p-3 bg-card rounded-xl border border-border">
                            <span className="text-[8px] text-muted-foreground block mb-2">The Magic Operator</span>
                            <div className="flex items-center justify-between text-[var(--viz-amber)] font-bold">
                                <span>i & -i</span>
                                <span className="text-muted-foreground opacity-30">=</span>
                                <span>LSB(i)</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                           <div className={`p-2 rounded-lg border transition-all ${currentStep.operation === "BUILD" ? "bg-[var(--viz-amber)]/10 border-[var(--viz-amber)] text-[var(--viz-amber)]" : "opacity-30"}`}>
                               Update: i += i & -i
                           </div>
                           <div className={`p-2 rounded-lg border transition-all ${currentStep.operation === "QUERY" ? "bg-[var(--viz-cyan)]/10 border-[var(--viz-cyan)] text-[var(--viz-cyan)]" : "opacity-30"}`}>
                               Query: i -= i & -i
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-4 p-3 md:p-6 bg-muted/30 rounded-[2.5rem] flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Operation Step {currentIndex + 1}</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => setCurrentIndex(Math.min(history.length - 1, currentIndex + 1))} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronRight size={18} /></button>
                </div>
            </div>
            <div className="text-center text-[11px] font-mono text-[var(--viz-amber)] bg-card/50 py-2 rounded-xl border border-border/50">
                {currentStep.message}
            </div>
        </div>
      </div>
    </div>
  );
}


