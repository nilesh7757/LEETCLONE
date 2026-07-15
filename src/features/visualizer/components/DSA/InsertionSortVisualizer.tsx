"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, Sparkles, Hash, Info, ChevronRight, ChevronLeft, ArrowDown } from "lucide-react";

const ARRAY_SIZE = 10;

const MANIM_COLORS = { 
  text: "var(--foreground)", 
  background: "var(--card)",
  blue: "var(--viz-amber)",
  green: "var(--viz-green)",
  gold: "var(--viz-amber)",
  red: "var(--viz-rose)",
  indigo: "var(--viz-amber)",
};

interface VisualNode {
  id: string;
  value: number;
  logicalIndex: number;
  status: 'idle' | 'comparing' | 'swapping' | 'sorted' | 'active';
}

interface HistoryStep {
  nodes: VisualNode[];
  explanation: string;
  activeStep: string | null;
  keyIdx: number | null;
  sortedBound: number | null;
}

export default function InsertionSortVisualizer({ speed = 600 }: { speed?: number }) {
  const [initialData, setInitialData] = useState<VisualNode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const history = useMemo(() => {
    if (initialData.length === 0) return [];
    
    const steps: HistoryStep[] = [];
    let currentNodes: VisualNode[] = JSON.parse(JSON.stringify(initialData));

    const record = (msg: string, step: string | null, key: number | null = null, bound: number | null = null) => {
      steps.push({
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        explanation: msg,
        activeStep: step,
        keyIdx: key,
        sortedBound: bound
      });
    };

    record("Vector space ready. Press Execute to begin linear insertion protocol.", "INIT");

    const arr = [...currentNodes].sort((a, b) => a.logicalIndex - b.logicalIndex);
    const n = arr.length;

    // First element is technically sorted
    currentNodes = currentNodes.map(node => node.logicalIndex === 0 ? { ...node, status: 'sorted' } : node);
    record("Index 0 is considered a sorted sub-manifold of size 1.", "BASE", 0, 0);

    for (let i = 1; i < n; i++) {
      const keyVal = arr[i].value;
      let j = i - 1;
      
      const keyNodeId = currentNodes.find(n => n.logicalIndex === i)!.id;

      // Mark current key
      currentNodes = currentNodes.map(node => {
        if (node.id === keyNodeId) return { ...node, status: 'active' };
        return node;
      });
      record(`Extracting key element ${keyVal} at index ${i}.`, "KEY_EXTRACT", i, i-1);

      while (j >= 0 && arr[j].value > keyVal) {
        // Highlight comparison
        currentNodes = currentNodes.map(node => {
            if (node.logicalIndex === j) return { ...node, status: 'comparing' };
            if (node.id === keyNodeId) return { ...node, status: 'active' };
            return node;
        });
        record(`Shifting: ${arr[j].value} > ${keyVal}. Displacing to the right.`, "SHIFT", i, j);

        // Execute shift logic visually
        const nodeToShift = currentNodes.find(n => n.logicalIndex === j)!;
        const nodeId = nodeToShift.id;
        
        currentNodes = currentNodes.map(node => {
          if (node.id === nodeId) return { ...node, logicalIndex: j + 1, status: 'swapping' };
          return node;
        });
        
        arr[j+1] = arr[j];
        j--;
        
        record(`Displacement complete. Search continues leftward.`, "SHIFT_DONE", i, j);
        
        // Reset shift status to sorted
        currentNodes = currentNodes.map(node => 
          node.status === 'swapping' ? { ...node, status: 'sorted' } : node
        );
      }

      // Final Insertion
      currentNodes = currentNodes.map(node => {
          if (node.id === keyNodeId) return { ...node, logicalIndex: j + 1, status: 'swapping' };
          return node;
      });
      record(`Found insertion point at index ${j+1}. Re-integrating key.`, "INSERT", i, j+1);
      
      arr[j+1] = { ...arr[i], value: keyVal }; // local logic update (not fully correct but enough for visual)
      
      currentNodes = currentNodes.map(node => {
        if (node.logicalIndex <= i) return { ...node, status: 'sorted' };
        return node;
      });
      record(`Sub-manifold [0...${i}] is now monotonic.`, "LOCKED", i, i);
    }

    record("Manifold fully ordered. Insertion Sort protocol terminated.", "COMPLETE");
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
      id: `insertion-node-${Math.random().toString(36).substr(2, 9)}`,
      value: Math.floor(Math.random() * 60) + 20,
      logicalIndex: i,
      status: 'idle' as const
    }));
    setInitialData(nodes);
  };

  useEffect(() => { generateArray(); }, []);

  const currentStep = history[currentIndex] || { nodes: initialData, explanation: "Initializing...", activeStep: null, keyIdx: null, sortedBound: null };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="p-2 md:p-8 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl font-sans text-[var(--foreground)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[var(--viz-amber)]">
              Insertion Sort <span className="text-[var(--muted-foreground)]/40">Algorithm</span>
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

        <div className="relative w-full h-[50vh] md:h-[60vh] min-h-[400px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-hidden flex items-end justify-center px-4 md:px-8 py-6">

            {/* Key badge pinned top-left */}
            {currentStep.keyIdx !== null && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2 py-1 bg-[var(--viz-amber)] text-[var(--background)] rounded-lg text-[8px] font-black uppercase tracking-wider z-30">
                    <ArrowDown size={10} />
                    Key @ {currentStep.keyIdx}
                </div>
            )}

            {/* Bars — full-width flex row */}
            <div className="relative w-full h-full flex items-end justify-center gap-1.5 md:gap-3">
                {[...currentStep.nodes]
                    .sort((a, b) => a.logicalIndex - b.logicalIndex)
                    .map((node) => {
                        const isComparing = node.status === 'comparing';
                        const isSwapping = node.status === 'swapping';
                        const isSorted = node.status === 'sorted';
                        const isActive = node.status === 'active';

                        const nodeColor =
                            isSwapping ? "var(--viz-rose)" :
                            isActive ? "var(--viz-amber)" :
                            isComparing ? "var(--viz-cyan)" :
                            isSorted ? "var(--viz-green)" :
                            "rgba(99,102,241,0.1)";

                        const nodeBorder =
                            isSwapping ? "var(--viz-rose)" :
                            isActive ? "var(--viz-amber)" :
                            isComparing ? "var(--viz-cyan)" :
                            isSorted ? "var(--viz-green)" :
                            "rgba(99,102,241,0.3)";

                        return (
                            <motion.div
                                key={node.id}
                                layout
                                animate={{
                                    height: `${node.value}%`,
                                    backgroundColor: nodeColor,
                                    borderColor: nodeBorder,
                                    boxShadow: isComparing || isSwapping || isActive
                                        ? `0 0 30px ${nodeColor}66`
                                        : isSorted ? `0 0 15px var(--viz-green)22` : "none",
                                    scale: isComparing || isSwapping || isActive ? 1.05 : 1,
                                    y: isActive ? -10 : 0,
                                }}
                                transition={{ type: "spring", stiffness: 150, damping: 25 }}
                                className="flex-1 border-t-2 border-x-2 rounded-t-xl z-20 flex flex-col items-center justify-start pt-2 font-mono overflow-hidden max-w-[80px]"
                                style={{ height: `${node.value}%` }}
                            >
                                <span className={`text-xs font-bold ${isComparing || isSwapping || isActive ? 'text-[var(--background)]' : 'text-[var(--foreground)]/60'}`}>
                                    {node.value}
                                </span>
                            </motion.div>
                        );
                    })}
            </div>
        </div>

        {/* Step Message (below canvas) */}
        <div className="w-full px-4 py-2.5 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center shadow-sm mt-4">
          <p className="text-xs text-[var(--viz-amber)] font-mono font-bold tracking-tight">
            {currentStep.explanation}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl mt-4 relative z-10">
            <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-4">
                <div className="flex items-center gap-2">
                    <Hash size={14} className="text-[var(--primary)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/45">Step {currentIndex + 1} of {history.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/60 transition-all cursor-pointer"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/60 transition-all cursor-pointer"><ChevronRight size={18} /></button>
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
        <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-amber)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Current Key</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-cyan)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Comparing</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-rose)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Shifting</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Sorted</span></div>
      </div>
    </div>
  );
}
