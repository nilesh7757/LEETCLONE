"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, Sparkles, Hash, Target, Info, FastForward, ChevronRight, ChevronLeft, Box } from "lucide-react";

const ARRAY_SIZE = 10;

const MANIM_COLORS = {
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#FFFF00",
  red: "#FC6255",
  background: "#1C1C1C",
  text: "#FFFFFF"
};

interface VisualNode {
  id: string;
  value: number;
  logicalIndex: number;
  status: 'idle' | 'comparing' | 'pivot' | 'swapping' | 'sorted' | 'out-of-range';
}

interface HistoryStep {
  nodes: VisualNode[];
  explanation: string;
  activeStep: string | null;
  activeRange: [number, number] | null;
}

export default function QuickSortVisualizer({ speed = 800 }: { speed?: number }) {
  const [initialData, setInitialData] = useState<VisualNode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Pre-compute the entire algorithmic history
  const history = useMemo(() => {
    if (initialData.length === 0) return [];
    
    const steps: HistoryStep[] = [];
    let currentNodes = JSON.parse(JSON.stringify(initialData));

    const record = (msg: string, step: string | null, range: [number, number] | null) => {
      steps.push({
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        explanation: msg,
        activeStep: step,
        activeRange: range
      });
    };

    record("System initialized. Ready for recursive flow.", null, null);

    const sort = (low: number, high: number) => {
      if (low < high) {
        const pi = partition(low, high);
        currentNodes = currentNodes.map((n: VisualNode) => 
            n.logicalIndex === pi ? { ...n, status: 'sorted' } : n
        );
        record(`Pivot established at index ${pi}.`, `CONQUER`, [low, high]);
        sort(low, pi - 1);
        sort(pi + 1, high);
      } else if (low === high) {
        currentNodes = currentNodes.map((n: VisualNode) => 
            n.logicalIndex === low ? { ...n, status: 'sorted' } : n
        );
        record(`Atomic unit at index ${low} is inherently sorted.`, `LEAF`, [low, high]);
      }
    };

    const partition = (low: number, high: number) => {
      const pivotNode = currentNodes.find((n: VisualNode) => n.logicalIndex === high);
      const pivotVal = pivotNode.value;
      const pivotId = pivotNode.id;

      currentNodes = currentNodes.map((n: VisualNode) => {
        if (n.logicalIndex < low || n.logicalIndex > high) return { ...n, status: 'out-of-range' };
        if (n.id === pivotId) return { ...n, status: 'pivot' };
        return { ...n, status: 'idle' };
      });
      record(`Defining sub-vector range [${low}, ${high}] with Pivot ${pivotVal}`, `PARTITION`, [low, high]);

      let i = low - 1;
      for (let j = low; j < high; j++) {
        const node = currentNodes.find((n: VisualNode) => n.logicalIndex === j);
        const currentId = node.id;
        const currentVal = node.value;

        currentNodes = currentNodes.map((n: VisualNode) => 
            n.id === currentId ? { ...n, status: 'comparing' } : n
        );
        record(`Evaluation: Comparing V[${j}] (${currentVal}) with Pivot Standard (${pivotVal})`, `SCAN`, [low, high]);

        if (currentVal < pivotVal) {
          i++;
          if (i !== j) {
            const iNodeId = currentNodes.find((n: VisualNode) => n.logicalIndex === i).id;
            currentNodes = currentNodes.map((n: VisualNode) => 
                (n.id === currentId || n.id === iNodeId) ? { ...n, status: 'swapping' } : n
            );
            record(`Property Match: ${currentVal} < ${pivotVal}. Swapping to left partition.`, `SWAP`, [low, high]);

            currentNodes = currentNodes.map((n: VisualNode) => {
              if (n.id === currentId) return { ...n, logicalIndex: i, status: 'idle' };
              if (n.id === iNodeId) return { ...n, logicalIndex: j, status: 'idle' };
              return n;
            });
          } else {
            currentNodes = currentNodes.map((n: VisualNode) => n.id === currentId ? { ...n, status: 'idle' } : n);
            record(`Element ${currentVal} is already correctly positioned relative to Pivot.`, `STABLE`, [low, high]);
          }
        } else {
          currentNodes = currentNodes.map((n: VisualNode) => n.id === currentId ? { ...n, status: 'idle' } : n);
          record(`Element ${currentVal} belongs to right partition. No displacement required.`, `STABLE`, [low, high]);
        }
      }

      const finalPivotPos = i + 1;
      const targetNodeId = currentNodes.find((n: VisualNode) => n.logicalIndex === finalPivotPos).id;
      
      currentNodes = currentNodes.map((n: VisualNode) => 
        (n.id === pivotId || n.id === targetNodeId) ? { ...n, status: 'swapping' } : n
      );
      record(`Relocating Pivot ${pivotVal} to index ${finalPivotPos}.`, `PIVOT_SET`, [low, high]);

      currentNodes = currentNodes.map((n: VisualNode) => {
        if (n.id === pivotId) return { ...n, logicalIndex: finalPivotPos, status: 'sorted' };
        if (n.id === targetNodeId) return { ...n, logicalIndex: high, status: 'idle' };
        return n;
      });
      record(`Partition logic complete for level.`, `DONE`, [low, high]);

      return finalPivotPos;
    };

    sort(0, ARRAY_SIZE - 1);
    record("Vector transformation complete. Order established.", "COMPLETE", null);
    
    return steps;
  }, [initialData]);

  // 2. Playback Controller
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
      id: `node-${Math.random().toString(36).substr(2, 9)}`,
      value: Math.floor(Math.random() * 60) + 20,
      logicalIndex: i,
      status: 'idle' as const
    }));
    setInitialData(nodes);
  };

  useEffect(() => { generateArray(); }, []);

  const currentStep = history[currentIndex] || { nodes: initialData, explanation: "Initializing...", activeStep: null, activeRange: null };

  return (
    <div className="flex flex-col gap-6">
      <div className="p-8 bg-[#1C1C1C] border border-[#333333] rounded-3xl shadow-2xl font-sans text-white relative overflow-hidden">
        {/* Chalkboard Grid */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[#58C4DD]">
              Quick Sort <span className="text-white/40">Lemma</span>
            </h2>
            <div className="flex items-center gap-2">
               <div className="h-1 w-12 bg-[#58C4DD] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">Temporal Logic Navigation</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-inner">
            <button onClick={generateArray} className="p-2 hover:bg-white/10 rounded-xl text-white/40 active:scale-95 transition-all"><RotateCcw size={20} /></button>
            {!isPlaying ? (
              <button onClick={() => setIsPlaying(true)} className="flex items-center gap-2 px-6 py-2 bg-[#58C4DD] text-black rounded-xl hover:scale-105 transition-all font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_#58C4DD44]"><Play size={14} fill="currentColor" /> EXECUTE</button>
            ) : (
              <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 px-6 py-2 bg-[#FC6255]/20 text-[#FC6255] border border-[#FC6255]/50 rounded-xl font-black text-[10px] uppercase tracking-widest"><Pause size={14} fill="currentColor" /> HALT</button>
            )}
          </div>
        </div>

        {/* Animation Canvas */}
        <div className="relative min-h-[500px] bg-black/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col items-center justify-center px-10">
            
            {/* Range Highlight (Visual Lemma) */}
            {currentStep.activeRange && (
                <motion.div className="absolute border border-[#58C4DD]/20 bg-[#58C4DD]/5 rounded-[2rem] z-0"
                    animate={{ 
                        x: ( (currentStep.activeRange[0] + currentStep.activeRange[1])/2 - (ARRAY_SIZE - 1) / 2 ) * 70,
                        width: (currentStep.activeRange[1] - currentStep.activeRange[0] + 1) * 70 + 10,
                        height: 160
                    }}
                    transition={{ type: "spring", stiffness: 80, damping: 20 }}
                />
            )}

            {/* Active Step Badge */}
            <AnimatePresence>
                {currentStep.activeStep && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-8 left-10 flex items-center gap-2 px-4 py-2 bg-[#58C4DD]/10 border border-[#58C4DD]/30 rounded-full z-30">
                        <Target size={12} className="text-[#58C4DD]" />
                        <span className="text-[9px] font-black font-mono text-[#58C4DD] uppercase tracking-[0.2em]">{currentStep.activeStep}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Explanation Log (Center Bottom) */}
            <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-12 w-full max-w-[500px] px-10 text-center z-30">
                    <div className="p-4 bg-[#FFFF00]/5 border border-[#FFFF00]/20 rounded-2xl backdrop-blur-md shadow-2xl">
                        <div className="flex items-center justify-center gap-2 mb-1 opacity-40">
                            <Info size={10} className="text-[#FFFF00]" />
                            <span className="text-[8px] font-black uppercase tracking-tighter">Analysis Entry</span>
                        </div>
                        <p className="text-[10px] text-[#FFFF00] font-mono leading-relaxed italic uppercase tracking-tighter">{currentStep.explanation}</p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Visual Nodes */}
            <div className="relative w-full h-full flex items-center justify-center">
                {currentStep.nodes.map((node) => {
                    const isPivot = node.status === 'pivot';
                    const isComparing = node.status === 'comparing';
                    const isSwapping = node.status === 'swapping';
                    const isSorted = node.status === 'sorted';
                    const isOut = node.status === 'out-of-range';
                    
                    return (
                        <motion.div key={node.id} layout transition={{ type: "spring", stiffness: 120, damping: 22 }}
                            animate={{ 
                                x: (node.logicalIndex - (ARRAY_SIZE - 1) / 2) * 70, 
                                y: isPivot ? -60 : 0, 
                                borderColor: isPivot ? MANIM_COLORS.red : isComparing ? MANIM_COLORS.gold : isSwapping ? MANIM_COLORS.red : isSorted ? MANIM_COLORS.green : "rgba(88,196,221,0.3)",
                                boxShadow: isPivot ? `0 0 40px ${MANIM_COLORS.red}44` : isComparing || isSwapping ? `0 0 35px ${MANIM_COLORS.gold}44` : "none",
                                scale: isComparing || isSwapping ? 1.2 : 1,
                                opacity: isOut ? 0.2 : 1
                            }}
                            className="absolute flex items-center justify-center w-14 h-14 border-[2.5px] rounded-2xl font-mono bg-[#1C1C1C] z-20"
                            style={{ color: isComparing || isSwapping ? MANIM_COLORS.gold : isSorted ? MANIM_COLORS.green : "white" }}
                        >
                            <span className="text-xl font-bold">{node.value}</span>
                        </motion.div>
                    );
                })}
            </div>
        </div>

        {/* Premium Scrubber (Chalkboard Style) */}
        <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Sparkles size={14} className="text-[#FFFF00]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Step {currentIndex + 1} of {history.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider">
                {/* Custom Styled Slider */}
                <div className="absolute w-full h-1 bg-white/10 rounded-full" />
                <div className="absolute h-1 bg-[#58C4DD] rounded-full shadow-[0_0_10px_#58C4DD44]" style={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }} />
                <input 
                    type="range" min="0" max={history.length - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                {/* The Scrubber Handle */}
                <div className="absolute w-1.5 h-4 bg-[#FFFF00] rounded-full shadow-[0_0_15px_#FFFF00] pointer-events-none transition-all"
                    style={{ left: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 3px)` }}
                />
            </div>
        </div>
      </div>

      {/* Simplified Legend */}
      <div className="px-10 py-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center justify-center gap-12">
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#FC6255]" /><span className="text-[10px] font-bold uppercase text-white/30 tracking-widest">Pivot Standard</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#FFFF00]" /><span className="text-[10px] font-bold uppercase text-white/30 tracking-widest">Active Search</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#83C167]" /><span className="text-[10px] font-bold uppercase text-white/30 tracking-widest">Fixed Position</span></div>
      </div>
    </div>
  );
}