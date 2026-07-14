"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, Sparkles, Hash, Info, ChevronRight, ChevronLeft, Target } from "lucide-react";

const ARRAY_SIZE = 10;

const MANIM_COLORS = { 
  text: "var(--foreground)", 
  background: "var(--card)",
  blue: "var(--viz-amber)",
  green: "var(--viz-green)",
  gold: "var(--viz-amber)",
  red: "var(--viz-rose)",
  purple: "var(--viz-amber)",
};

interface VisualNode {
  id: string;
  value: number;
  logicalIndex: number;
  status: 'idle' | 'comparing' | 'swapping' | 'sorted' | 'minimum';
}

interface HistoryStep {
  nodes: VisualNode[];
  explanation: string;
  activeStep: string | null;
  currentMinIdx: number | null;
  scanIdx: number | null;
}

export default function SelectionSortVisualizer({ speed = 600 }: { speed?: number }) {
  const [initialData, setInitialData] = useState<VisualNode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const history = useMemo(() => {
    if (initialData.length === 0) return [];
    
    const steps: HistoryStep[] = [];
    let currentNodes: VisualNode[] = JSON.parse(JSON.stringify(initialData));

    const record = (msg: string, step: string | null, minIdx: number | null = null, scan: number | null = null) => {
      steps.push({
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        explanation: msg,
        activeStep: step,
        currentMinIdx: minIdx,
        scanIdx: scan
      });
    };

    record("Manifold initialized. Press Execute to begin Selection Sort.", "INIT");

    const arr = [...currentNodes].sort((a, b) => a.logicalIndex - b.logicalIndex);
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      let min_idx = i;
      
      // Highlight current boundary and initial minimum
      currentNodes = currentNodes.map(node => {
        if (node.logicalIndex === i) return { ...node, status: 'minimum' };
        return node.status === 'sorted' ? node : { ...node, status: 'idle' };
      });
      record(`Starting pass ${i + 1}. Assuming index ${i} is minimum.`, "BOUND", min_idx, i);

      for (let j = i + 1; j < n; j++) {
        // Step A: Scanning
        currentNodes = currentNodes.map(node => {
            if (node.logicalIndex === j) return { ...node, status: 'comparing' };
            if (node.logicalIndex === min_idx) return { ...node, status: 'minimum' };
            return node.status === 'sorted' ? node : { ...node, status: 'idle' };
        });
        record(`Scanning: Comparing ${arr[j].value} with current minimum ${arr[min_idx].value}.`, "SCAN", min_idx, j);

        if (arr[j].value < arr[min_idx].value) {
          min_idx = j;
          currentNodes = currentNodes.map(node => {
            if (node.logicalIndex === min_idx) return { ...node, status: 'minimum' };
            return node.status === 'sorted' ? node : { ...node, status: 'idle' };
          });
          record(`New minimum found at index ${min_idx} (${arr[min_idx].value}).`, "NEW_MIN", min_idx, j);
        }
      }

      if (min_idx !== i) {
        // Step B: Mark Swapping
        currentNodes = currentNodes.map(node => {
          if (node.logicalIndex === i || node.logicalIndex === min_idx) {
              return { ...node, status: 'swapping' };
          }
          return node.status === 'sorted' ? node : { ...node, status: 'idle' };
        });
        record(`Pass complete. Swapping initial index ${i} with minimum at ${min_idx}.`, "SWAP", min_idx, i);

        // Step C: Execute Swap
        const nodeI = currentNodes.find(n => n.logicalIndex === i)!;
        const nodeMin = currentNodes.find(n => n.logicalIndex === min_idx)!;
        
        const idI = nodeI.id;
        const idMin = nodeMin.id;

        currentNodes = currentNodes.map(node => {
          if (node.id === idI) return { ...node, logicalIndex: min_idx, status: 'swapping' };
          if (node.id === idMin) return { ...node, logicalIndex: i, status: 'swapping' };
          return node;
        });
        
        [arr[i], arr[min_idx]] = [arr[min_idx], arr[i]];
        record(`Displacement executed. Positions re-mapped.`, "DISPLACED", i, min_idx);
      } else {
        record(`Initial index ${i} was already the minimum. No displacement needed.`, "STABLE", i, i);
      }

      // Step D: Mark as sorted
      currentNodes = currentNodes.map(node => 
        node.logicalIndex === i ? { ...node, status: 'sorted' } : node
      );
      record(`Index ${i} is now locked in sorted manifold.`, "LOCKED", i);
    }

    // Mark last element as sorted
    currentNodes = currentNodes.map(node => ({ ...node, status: 'sorted' }));
    record("All elements ordered. Selection Sort complete.", "COMPLETE");
    
    return steps;
  }, [initialData]);

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

  const generateArray = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    const nodes = Array.from({ length: ARRAY_SIZE }, (_, i) => ({
      id: `selection-node-${Math.random().toString(36).substr(2, 9)}`,
      value: Math.floor(Math.random() * 60) + 20,
      logicalIndex: i,
      status: 'idle' as const
    }));
    setInitialData(nodes);
  };

  useEffect(() => { generateArray(); }, []);

  const currentStep = history[currentIndex] || { nodes: initialData, explanation: "Initializing...", activeStep: null, currentMinIdx: null, scanIdx: null };

  return (
    <div className="flex flex-col gap-6">
      <div className="p-4 md:p-8 bg-[var(--card)] rounded-3xl shadow-2xl font-sans text-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[var(--viz-amber)]">
              Selection Sort <span className="text-muted-foreground/40">Invariants</span>
            </h2>
            <div className="flex items-center gap-2">
                <div className="h-1 w-12 bg-[var(--viz-amber)] rounded-full" />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-muted p-2 rounded-2xl  shadow-inner">
            <button onClick={generateArray} className="p-2 hover:bg-background/10 rounded-xl text-muted-foreground/40 active:scale-95 transition-all"><RotateCcw size={20} /></button>
            {!isPlaying ? (
              <button onClick={() => setIsPlaying(true)} className="flex items-center gap-2 px-6 py-2 bg-[var(--viz-amber)] text-white rounded-xl hover:scale-105 transition-all font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_var(--viz-amber)44]"><Play size={14} fill="currentColor" /> EXECUTE</button>
            ) : (
              <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 px-6 py-2 bg-[var(--viz-rose)]/20 text-[var(--viz-rose)] border border-[var(--viz-rose)]/50 rounded-xl font-black text-[10px] uppercase tracking-widest"><Pause size={14} fill="currentColor" /> HALT</button>
            )}
          </div>
        </div>

        <div className="relative w-full h-[50vh] md:h-[60vh] min-h-[400px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-x-auto overflow-y-hidden no-scrollbar flex items-end justify-center px-4 md:px-8">
            
            {/* Target Indicator for Current Minimum */}
            {currentStep.currentMinIdx !== null && (
                <motion.div 
                    className="absolute bottom-24 flex flex-col items-center gap-2 z-30"
                    animate={{ x: (currentStep.currentMinIdx - (ARRAY_SIZE - 1) / 2) * 65 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                    <div className="px-2 py-1 bg-[var(--viz-amber)] text-black text-[8px] font-black rounded-md uppercase tracking-tighter">Current Min</div>
                    <Target size={16} className="text-[var(--viz-amber)] animate-pulse" />
                </motion.div>
            )}

            <div className="relative w-full h-full min-w-[600px] flex items-end justify-center pb-10">
                {currentStep.nodes.map((node) => {
                    const isComparing = node.status === 'comparing';
                    const isSwapping = node.status === 'swapping';
                    const isSorted = node.status === 'sorted';
                    const isMin = node.status === 'minimum';
                    
                    return (
                        <motion.div
                            key={node.id}
                            layout
                            animate={{ 
                                x: (node.logicalIndex - (ARRAY_SIZE - 1) / 2) * 65, 
                                height: `${node.value}%`,
                                backgroundColor: isSwapping ? MANIM_COLORS.red : isMin ? MANIM_COLORS.purple : isComparing ? MANIM_COLORS.gold : isSorted ? MANIM_COLORS.green : "rgba(99,102,241,0.1)",
                                borderColor: isSwapping ? MANIM_COLORS.red : isMin ? MANIM_COLORS.purple : isComparing ? MANIM_COLORS.gold : isSorted ? MANIM_COLORS.green : "rgba(99,102,241,0.3)",
                                boxShadow: isComparing || isSwapping || isMin ? `0 0 35px ${isSwapping ? MANIM_COLORS.red : isMin ? MANIM_COLORS.purple : MANIM_COLORS.gold}44` : isSorted ? `0 0 15px ${MANIM_COLORS.green}22` : "none",
                                scale: isComparing || isSwapping || isMin ? 1.1 : 1,
                            }}
                            transition={{ type: "spring", stiffness: 120, damping: 25 }}
                            className="absolute bottom-0 w-12 border-t-2 border-x-2 rounded-t-xl z-20 flex flex-col items-center justify-start pt-2 font-mono overflow-hidden"
                        >
                            <span className={`text-xs font-bold ${isComparing || isSwapping || isMin ? 'text-black' : 'text-foreground/60'}`}>{node.value}</span>
                        </motion.div>
                    );
                })}
            </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl mt-4 relative z-10">
            <div className="flex items-center justify-between w-full md:w-auto gap-4">
                <div className="flex items-center gap-2">
                    <Hash size={14} className="text-primary" />        
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Step {currentIndex + 1} of {history.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronRight size={18} /></button>
                </div>
            </div>
            <div className="relative flex items-center group/slider w-full md:w-auto flex-1 h-6">
                <div className="absolute w-full h-1 bg-background/10 rounded-full" />
                <div className="absolute h-1 bg-[var(--viz-amber)] rounded-full shadow-[0_0_10px_var(--viz-amber)44]" style={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }} />
                <input 
                    type="range" min="0" max={history.length - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute w-1.5 h-4 bg-[var(--viz-amber)] rounded-full shadow-[0_0_15px_var(--viz-amber)] pointer-events-none transition-all"
                    style={{ left: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 3px)` }}
                />
            </div>
        </div>
      </div>

      <div className="px-4 md:px-10 py-6 bg-muted/20  rounded-[2.5rem] flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-amber)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Global Minimum</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-amber)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Scanning Manifold</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-rose)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Displacement</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Stable Subspace</span></div>
      </div>
    </div>
  );
}


