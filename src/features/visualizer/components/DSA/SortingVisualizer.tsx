"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, Sparkles, Hash, Info, ChevronRight, ChevronLeft } from "lucide-react";

const ARRAY_SIZE = 10;

const MANIM_COLORS = { 
  text: "var(--foreground)", 
  background: "var(--card)",
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#f59e0b",
  red: "#FC6255",
};

interface VisualNode {
  id: string;
  value: number;
  logicalIndex: number;
  status: 'idle' | 'comparing' | 'swapping' | 'sorted';
}

interface HistoryStep {
  nodes: VisualNode[];
  explanation: string;
  activeStep: string | null;
  comparisonRange: [number, number] | null;
}

export default function SortingVisualizer({ speed = 600 }: { speed?: number }) {
  const [initialData, setInitialData] = useState<VisualNode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Pre-compute Bubble Sort History with high granularity
  const history = useMemo(() => {
    if (initialData.length === 0) return [];
    
    const steps: HistoryStep[] = [];
    let currentNodes: VisualNode[] = JSON.parse(JSON.stringify(initialData));

    const record = (msg: string, step: string | null, range: [number, number] | null = null) => {
      steps.push({
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        explanation: msg,
        activeStep: step,
        comparisonRange: range
      });
    };

    record("Vector space initialized. Press Execute to begin monotonic transformation.", "INIT");

    let arr = [...currentNodes].sort((a, b) => a.logicalIndex - b.logicalIndex);
    const n = arr.length;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Step A: Highlight current comparison
        currentNodes = currentNodes.map(node => {
            if (node.logicalIndex === j || node.logicalIndex === j + 1) {
                return { ...node, status: 'comparing' };
            }
            return node.status === 'sorted' ? node : { ...node, status: 'idle' };
        });
        record(`Comparing indices ${j} and ${j+1}: ${arr[j].value} vs ${arr[j+1].value}`, "SCAN", [j, j+1]);

        if (arr[j].value > arr[j + 1].value) {
          // Step B: Mark as Swapping
          currentNodes = currentNodes.map(node => {
            if (node.logicalIndex === j || node.logicalIndex === j + 1) {
                return { ...node, status: 'swapping' };
            }
            return node.status === 'sorted' ? node : { ...node, status: 'idle' };
          });
          record(`Match: ${arr[j].value} > ${arr[j+1].value}. Elements will swap positions.`, "SWAP_DECISION", [j, j+1]);

          // Step C: Execute Swap
          const nodeJ = currentNodes.find(n => n.logicalIndex === j)!;
          const nodeJ1 = currentNodes.find(n => n.logicalIndex === j + 1)!;
          
          const idJ = nodeJ.id;
          const idJ1 = nodeJ1.id;

          currentNodes = currentNodes.map(node => {
            if (node.id === idJ) return { ...node, logicalIndex: j + 1, status: 'swapping' };
            if (node.id === idJ1) return { ...node, logicalIndex: j, status: 'swapping' };
            return node;
          });
          
          // Local logic sync
          [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
          
          record(`Transformation executed. Indices updated.`, "SWAP_DONE", [j, j+1]);

          // Step D: Reset swap status back to idle
          currentNodes = currentNodes.map(node => 
            (node.id === idJ || node.id === idJ1) ? { ...node, status: 'idle' } : node
          );
        } else {
          record(`Stability match: ${arr[j].value} <= ${arr[j+1].value}. Elements remain fixed.`, "STABLE", [j, j+1]);
          currentNodes = currentNodes.map(node => 
            (node.logicalIndex === j || node.logicalIndex === j + 1) ? { ...node, status: 'idle' } : node
          );
        }
      }
      // Step E: End of pass - mark the bubbled element as sorted
      const sortedIdx = n - i - 1;
      currentNodes = currentNodes.map(node => 
        node.logicalIndex === sortedIdx ? { ...node, status: 'sorted' } : node
      );
      record(`Pass complete. Index ${sortedIdx} is now part of the sorted manifold.`, "BUBBLED");
    }

    record("Monotonic order achieved. Algorithm terminated.", "COMPLETE");
    return steps;
  }, [initialData]);

  // 2. Playback System
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
      id: `bubble-node-${Math.random().toString(36).substr(2, 9)}`,
      value: Math.floor(Math.random() * 60) + 20,
      logicalIndex: i,
      status: 'idle' as const
    }));
    setInitialData(nodes);
  };

  useEffect(() => { generateArray(); }, []);

  const currentStep = history[currentIndex] || { nodes: initialData, explanation: "Initializing...", activeStep: null, comparisonRange: null };

  return (
    <div className="flex flex-col gap-6">
      <div className="p-8 bg-card border border-border rounded-3xl shadow-2xl font-sans text-foreground relative overflow-hidden">
        {/* Chalkboard Background */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[#58C4DD]">
              Bubble Sort <span className="text-muted-foreground/40">Analysis</span>
            </h2>
            <div className="flex items-center gap-2">
               <div className="h-1 w-12 bg-[#58C4DD] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/30">Temporal Manifold Navigation</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-muted p-2 rounded-2xl border border-border shadow-inner">
            <button onClick={generateArray} className="p-2 hover:bg-background/10 rounded-xl text-muted-foreground/40 active:scale-95 transition-all"><RotateCcw size={20} /></button>
            {!isPlaying ? (
              <button onClick={() => setIsPlaying(true)} className="flex items-center gap-2 px-6 py-2 bg-[#58C4DD] text-black rounded-xl hover:scale-105 transition-all font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_#58C4DD44]"><Play size={14} fill="currentColor" /> EXECUTE</button>
            ) : (
              <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 px-6 py-2 bg-[#FC6255]/20 text-[#FC6255] border border-[#FC6255]/50 rounded-xl font-black text-[10px] uppercase tracking-widest"><Pause size={14} fill="currentColor" /> HALT</button>
            )}
          </div>
        </div>

        {/* The "Video" Canvas */}
        <div className="relative min-h-[480px] bg-muted/40 rounded-[2.5rem] border border-border overflow-hidden shadow-2xl flex flex-col items-center justify-center px-10">
            
            {/* Range Highlight (Active Lemma) */}
            {currentStep.comparisonRange && (
                <motion.div 
                    className="absolute bottom-20 border-2 border-primary/20 bg-primary/5 rounded-2xl z-0"
                    animate={{ 
                        x: ( (currentStep.comparisonRange[0] + currentStep.comparisonRange[1])/2 - (ARRAY_SIZE - 1) / 2 ) * 65,
                        width: 120, // Two bars width + gap
                        height: "70%",
                        opacity: 1
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
            )}

            {/* Logical Step Badge */}
            <AnimatePresence>
                {currentStep.activeStep && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-8 left-10 flex items-center gap-2 px-4 py-2 bg-[#58C4DD]/10 border border-[#58C4DD]/30 rounded-full z-30">
                        <Sparkles size={12} className="text-[#58C4DD]" />
                        <span className="text-[9px] font-black font-mono text-[#58C4DD] uppercase tracking-[0.2em]">{currentStep.activeStep}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subtitle / Explanation */}
            <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-12 w-full max-w-[500px] px-10 text-center z-30">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl backdrop-blur-md shadow-2xl">
                        <div className="flex items-center justify-center gap-2 mb-1 opacity-40">
                            <Info size={10} className="text-primary" />
                            <span className="text-[8px] font-black uppercase tracking-tighter text-foreground">Analysis Entry</span>
                        </div>
                        <p className="text-[10px] text-primary font-mono leading-relaxed italic uppercase tracking-tighter">{currentStep.explanation}</p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Elements Visualization */}
            <div className="relative w-full h-full flex items-end justify-center pb-32">
                {currentStep.nodes.map((node) => {
                    const isComparing = node.status === 'comparing';
                    const isSwapping = node.status === 'swapping';
                    const isSorted = node.status === 'sorted';
                    
                    return (
                        <motion.div
                            key={node.id}
                            layout
                            animate={{ 
                                x: (node.logicalIndex - (ARRAY_SIZE - 1) / 2) * 65, 
                                height: `${node.value}%`,
                                backgroundColor: isSwapping ? MANIM_COLORS.red : isComparing ? MANIM_COLORS.gold : isSorted ? MANIM_COLORS.green : "rgba(88,196,221,0.15)",
                                borderColor: isSwapping ? MANIM_COLORS.red : isComparing ? MANIM_COLORS.gold : isSorted ? MANIM_COLORS.green : "rgba(88,196,221,0.3)",
                                boxShadow: isComparing || isSwapping ? `0 0 35px ${isSwapping ? MANIM_COLORS.red : MANIM_COLORS.gold}44` : isSorted ? `0 0 15px ${MANIM_COLORS.green}22` : "none",
                                scale: isComparing || isSwapping ? 1.1 : 1,
                                opacity: 1
                            }}
                            transition={{ type: "spring", stiffness: 120, damping: 25 }}
                            className="absolute bottom-0 w-12 border-t-2 border-x-2 rounded-t-xl z-20 flex flex-col items-center justify-start pt-2 font-mono overflow-hidden"
                        >
                            <span className={`text-xs font-bold ${isComparing || isSwapping ? 'text-black' : 'text-foreground/60'}`}>{node.value}</span>
                            <div className="mt-auto pb-1 text-[8px] opacity-20 uppercase">0x{node.id.slice(-4)}</div>
                        </motion.div>
                    );
                })}
            </div>
        </div>

        {/* Premium Scrubber Section */}
        <div className="mt-8 p-6 bg-muted border border-border rounded-[2.5rem] flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Hash size={14} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Step {currentIndex + 1} of {history.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider">
                <div className="absolute w-full h-1 bg-background/10 rounded-full" />
                <div className="absolute h-1 bg-[#58C4DD] rounded-full shadow-[0_0_10px_#58C4DD44]" style={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }} />
                <input 
                    type="range" min="0" max={history.length - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute w-1.5 h-4 bg-primary rounded-full shadow-[0_0_15px_#FFFF00] pointer-events-none transition-all"
                    style={{ left: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 3px)` }}
                />
            </div>
        </div>
      </div>

      {/* Methodology Legend */}
      <div className="px-10 py-6 bg-muted/20 border border-border rounded-[2.5rem] flex items-center justify-center gap-12">
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Scanning Manifold</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#FC6255]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Active Displacement</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#83C167]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Ordered Manifold</span></div>
      </div>
    </div>
  );
}
