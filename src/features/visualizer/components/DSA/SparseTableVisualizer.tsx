"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, ChevronLeft, ChevronRight, Zap, 
  LayoutGrid, Database, Calculator, Info, RefreshCw, Search
} from "lucide-react";

interface Step {
  table: (number | null)[][];
  row: number;
  col: number;
  activeCells: [number, number][]; // [row, col]
  queryRange?: [number, number];   // [L, R]
  message: string;
  phase: "INIT" | "PREPROCESS" | "QUERY" | "DONE";
  formula?: string;
}

export default function SparseTableVisualizer({ speed = 800 }: { speed?: number }) {
  const vizRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [array, setArray] = useState([7, 2, 3, 0, 5, 10, 3, 12]);
  
  const n = array.length;
  const k = Math.floor(Math.log2(n));

  const generateRandomArray = useCallback(() => {
    const newArr = Array.from({ length: 8 }, () => Math.floor(Math.random() * 20));
    setArray(newArr);
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const history = useMemo(() => {
    const steps: Step[] = [];
    const st = Array.from({ length: k + 1 }, () => new Array<number | null>(n).fill(null));

    const record = (msg: string, r: number, c: number, actives: [number, number][], phase: Step["phase"], formula?: string, queryRange?: [number, number]) => {
      steps.push({
        table: st.map(row => [...row]),
        row: r,
        col: c,
        activeCells: actives,
        message: msg,
        phase,
        formula,
        queryRange
      });
    };

    // Phase 0: Base Case
    for (let i = 0; i < n; i++) {
        st[0][i] = array[i];
        record(`Base Case: Pre-filling level 2^0 (length 1) with array values. st[0][${i}] = ${array[i]}`, 0, i, [[0, i]], "INIT");
    }

    // Phase 1: Preprocessing
    for (let j = 1; j <= k; j++) {
        for (let i = 0; i + (1 << j) <= n; i++) {
            const leftIdx = i;
            const rightIdx = i + (1 << (j - 1));
            const leftVal = st[j-1][leftIdx];
            const rightVal = st[j-1][rightIdx];
            
            st[j][i] = Math.min(leftVal as number, rightVal as number);
            
            const formula = `st[${j}][${i}] = min(st[${j-1}][${leftIdx}], st[${j-1}][${rightIdx}])`;
            record(
                `Level 2^${j}: Computing min for range [${i}, ${i+(1<<j)-1}] using two ranges of length 2^${j-1}.`, 
                j, i, [[j-1, leftIdx], [j-1, rightIdx]], 
                "PREPROCESS", 
                formula
            );
        }
    }

    // Phase 2: Query Example RMQ(1, 6)
    const L = 1, R = 6;
    const j = Math.floor(Math.log2(R - L + 1));
    const res = Math.min(st[j][L] as number, st[j][R - (1 << j) + 1] as number);
    
    const queryFormula = `RMQ(${L}, ${R}) = min(st[${j}][${L}], st[${j}][${R - (1 << j) + 1}])`;
    record(
        `Query RMQ(${L}, ${R}): Find largest 2^j \u2264 length (${R-L+1}). Here 2^${j}=${1<<j}. We cover [${L}, ${R}] with two overlapping ranges. Result: ${res}.`, 
        -1, -1, [[j, L], [j, R - (1 << j) + 1]], 
        "QUERY", 
        queryFormula,
        [L, R]
    );

    record("Sparse Table ready. All static range minimum queries are now O(1).", -1, -1, [], "DONE");
    return steps;
  }, [array, n, k]);

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
      <div className="p-4 md:p-8 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col min-h-[650px]">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        {/* Header */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[var(--viz-cyan)]">
              Sparse <span className="text-[var(--muted-foreground)]/40">Table</span>
            </h2>
            <div className="flex items-center gap-2">
               <div className="h-1 w-12 bg-[var(--viz-cyan)] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)]/40">Static RMQ Optimizer</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-[var(--muted)] p-2 rounded-2xl border border-[var(--border)] shadow-inner">
            <button onClick={generateRandomArray} className="p-2 hover:bg-[var(--accent)] rounded-xl text-[var(--viz-cyan)] active:scale-95 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                <RefreshCw size={14} /> Random
            </button>
            <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />
            <button onClick={() => { setCurrentIndex(0); setIsPlaying(false); }} className="p-2 hover:bg-[var(--accent)] rounded-xl text-[var(--muted-foreground)] active:scale-95 transition-all"><RotateCcw size={18}/></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${isPlaying ? "bg-[var(--viz-rose)]/20 text-[var(--viz-rose)] border border-[var(--viz-rose)]/50" : "bg-[var(--viz-cyan)] text-[var(--background)] hover:scale-105"}`}>
                {isPlaying ? <span className="flex items-center gap-2"><Pause size={14} fill="currentColor"/> STOP</span> : <span className="flex items-center gap-2"><Play size={14} fill="currentColor"/> RUN</span>}
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-[var(--muted)]/30 rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-inner flex flex-col items-center justify-center p-4">
            {/* Status & Formula */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 flex flex-col gap-3 z-30 pointer-events-none">
                <motion.div key={currentStep.phase} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 px-4 py-2 bg-[var(--card)]/80 border border-[var(--border)] rounded-full shadow-lg backdrop-blur-md">
                    <Database size={14} className="text-[var(--viz-cyan)]" />
                    <span className="text-[10px] font-black font-mono uppercase tracking-[0.2em] text-[var(--viz-cyan)]">{currentStep.phase}</span>
                </motion.div>
            </div>

            {/* Formula Overlay (Top Right) */}
            <AnimatePresence>
                {currentStep.formula && (
                    <motion.div initial={{ opacity: 0, y: -10, x: 10 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute top-6 right-6 md:top-8 md:right-8 p-4 bg-[var(--card)]/40 border border-white/10 rounded-2xl shadow-xl backdrop-blur-lg border-l-4 border-l-[var(--viz-cyan)] z-40 max-w-[280px]">
                        <div className="flex items-center gap-2 mb-2 text-[var(--viz-cyan)]">
                            <Calculator size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Precomputation Math</span>
                        </div>
                        <p className="font-mono text-[11px] text-[var(--foreground)]/80 leading-relaxed break-all uppercase tracking-tighter">
                            {currentStep.formula}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sparse Table Grid */}
            <div className="flex flex-col gap-3 md:gap-4 overflow-x-auto w-full py-10 items-center custom-scrollbar">
                {/* Column Indices */}
                <div className="flex gap-2 mb-2 ml-20">
                    {Array.from({ length: n }).map((_, i) => (
                        <div key={i} className={`w-12 text-center text-[10px] font-black font-mono transition-colors ${currentStep.queryRange && i >= currentStep.queryRange[0] && i <= currentStep.queryRange[1] ? "text-[var(--viz-cyan)]" : "text-muted-foreground/30"}`}>
                            {i}
                        </div>
                    ))}
                </div>

                {currentStep.table.map((row, j) => (
                    <div key={j} className="flex items-center gap-3 md:gap-4">
                        <div className="w-20 flex flex-col items-end pr-4 border-r border-white/5">
                            <span className="text-[10px] font-black text-[var(--viz-cyan)] font-mono">2^{j}</span>
                            <span className="text-[8px] text-muted-foreground/40 uppercase tracking-tighter font-mono">Len {1<<j}</span>
                        </div>
                        <div className="flex gap-2">
                            {row.map((val, i) => {
                                const isActive = currentStep.activeCells.some(([rj, ri]) => rj === j && ri === i);
                                const isTarget = currentStep.row === j && currentStep.col === i;
                                const isFaded = val === null;

                                return (
                                    <motion.div
                                        key={i}
                                        layout
                                        animate={{ 
                                            scale: isTarget ? 1.1 : 1,
                                            borderColor: isTarget ? "var(--viz-amber)" : isActive ? "var(--viz-cyan)" : "var(--border)",
                                            backgroundColor: isTarget ? "rgba(var(--viz-amber-rgb), 0.15)" : isActive ? "rgba(var(--viz-cyan-rgb), 0.15)" : "var(--card)",
                                            opacity: isFaded ? 0.1 : 1,
                                            boxShadow: isTarget ? "0 0 20px rgba(var(--viz-amber-rgb), 0.2)" : isActive ? "0 0 15px rgba(var(--viz-cyan-rgb), 0.1)" : "none"
                                        }}
                                        className="w-12 h-10 rounded-xl border-2 flex items-center justify-center font-mono text-xs font-bold relative group"
                                    >
                                        {val}
                                        {isActive && (
                                            <motion.div layoutId="active-ring" className="absolute -inset-1 rounded-xl border border-[var(--viz-cyan)]/40 animate-pulse" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Explanation Log */}
            <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-6 left-0 right-0 px-4 flex justify-center z-30 pointer-events-none">
                    <div className="p-3 md:p-4 bg-[var(--card)]/95 border border-[var(--border)] rounded-2xl backdrop-blur-md shadow-2xl max-w-[500px] w-full text-center border-b-4 border-b-[var(--viz-cyan)]">
                        <div className="flex items-center justify-center gap-2 mb-1 opacity-40">
                            <Info size={10} className="text-[var(--viz-cyan)]" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Sparse Protocol</span>
                        </div>
                        <p className="text-[10px] md:text-xs text-[var(--foreground)] font-mono leading-tight">{currentStep.message}</p>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="mt-8 p-4 md:p-6 bg-[var(--muted)] border border-[var(--border)] rounded-[2rem] flex flex-col gap-4 relative z-10 shadow-inner">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Hash size={14} className="text-[var(--viz-cyan)]" />        
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Step {currentIndex + 1} / {history.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={20} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-muted-foreground/40 transition-all"><ChevronRight size={20} /></button>
                </div>
            </div>
            
            <div className="relative flex items-center group/slider px-2">
                <div className="absolute left-2 right-2 h-1 bg-[var(--background)]/10 rounded-full" />
                <div className="absolute left-2 h-1 bg-[var(--viz-cyan)] rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(var(--viz-cyan-rgb),0.3)]" style={{ width: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 16px)` }} />
                <input 
                    type="range" min="0" max={history.length - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
            </div>
        </div>
      </div>
    </div>
  );
}


