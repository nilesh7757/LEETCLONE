"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, Sparkles, Hash, GitPullRequest, Info, ChevronLeft, ChevronRight } from "lucide-react";

const ARRAY_SIZE = 8; 

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
  level: number;
  status: 'idle' | 'comparing' | 'sorted' | 'active-split';
}

interface HistoryStep {
  nodes: VisualNode[];
  explanation: string;
  activeStep: string | null;
}

export default function MergeSortVisualizer({ speed = 800 }: { speed?: number }) {
  const [initialData, setInitialData] = useState<VisualNode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Pre-compute Recursive History
  const history = useMemo(() => {
    if (initialData.length === 0) return [];
    
    const steps: HistoryStep[] = [];
    let currentNodes = JSON.parse(JSON.stringify(initialData));

    const record = (msg: string, step: string | null) => {
      steps.push({
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        explanation: msg,
        activeStep: step
      });
    };

    record("Vector initialized. Ready for recursive decomposition.", "INIT");

    const sort = (l: number, r: number, level: number) => {
      if (l >= r) return;

      const m = Math.floor((l + r) / 2);
      
      // Visual: Split Phase
      currentNodes = currentNodes.map((n: VisualNode) => {
        if (n.logicalIndex >= l && n.logicalIndex <= r) {
            return { ...n, level: level + 1, status: 'active-split' };
        }
        return n;
      });
      record(`Dividing range [${l}, ${r}] into sub-manifolds at depth ${level + 1}.`, `DIVIDE_${level}`);

      sort(l, m, level + 1);
      sort(m + 1, r, level + 1);
      
      merge(l, m, r, level);
    };

    const merge = (l: number, m: number, r: number, level: number) => {
      // Logic for sorting the sub-range
      const rangeNodes = currentNodes
        .filter((n: VisualNode) => n.logicalIndex >= l && n.logicalIndex <= r)
        .sort((a: VisualNode, b: VisualNode) => a.value - b.value);

      // We simulate the comparison steps for the history
      record(`Merging sub-vectors from depth ${level + 1} back to level ${level}.`, `CONQUER_${level}`);

      // Update positions and reset level/status
      const nodeIdsInRange = currentNodes
        .filter((n: VisualNode) => n.logicalIndex >= l && n.logicalIndex <= r)
        .map((n: VisualNode) => n.id);

      // Re-map the sorted values to the logical indices l...r
      const updatedNodes = [...currentNodes];
      rangeNodes.forEach((sortedNode: VisualNode, idx: number) => {
        const originalNodeIdx = updatedNodes.findIndex(n => n.id === sortedNode.id);
        updatedNodes[originalNodeIdx] = { 
            ...sortedNode, 
            logicalIndex: l + idx, 
            level: level,
            status: level === 0 ? 'sorted' : 'idle'
        };
      });
      
      currentNodes = updatedNodes;
      record(`Reconstruction complete for range [${l}, ${r}].`, `MERGED_${level}`);
    };

    sort(0, ARRAY_SIZE - 1, 0);
    record("Recursive flow complete. Vector is ordered.", "COMPLETE");
    
    return steps;
  }, [initialData]);

  // 2. Playback Control
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
      value: Math.floor(Math.random() * 50) + 20,
      logicalIndex: i,
      level: 0,
      status: 'idle' as const
    }));
    setInitialData(nodes);
  };

  useEffect(() => { generateArray(); }, []);

  const currentStep = history[currentIndex] || { nodes: initialData, explanation: "Initializing...", activeStep: null };

  return (
    <div className="flex flex-col gap-6">
      <div className="p-8 bg-[#1C1C1C] border border-[#333333] rounded-3xl shadow-2xl font-sans text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[#58C4DD]">
              Merge Sort <span className="text-white/40">Lemma</span>
            </h2>
            <div className="flex items-center gap-2">
               <div className="h-1 w-12 bg-[#58C4DD] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">Temporal Tree Navigation</p>
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
        <div className="relative min-h-[520px] bg-black/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col items-center justify-center px-10">
            
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

            {/* Tree Visualization */}
            <div className="relative w-full h-full flex items-center justify-center">
                {currentStep.nodes.map((node) => {
                    const isSorted = node.status === 'sorted';
                    const isActive = node.status === 'active-split';
                    
                    return (
                        <motion.div key={node.id} layout transition={{ type: "spring", stiffness: 120, damping: 22 }}
                            animate={{ 
                                x: (node.logicalIndex - (ARRAY_SIZE - 1) / 2) * 75, 
                                y: node.level * 90 - 60,
                                borderColor: isActive ? MANIM_COLORS.gold : isSorted ? MANIM_COLORS.green : MANIM_COLORS.blue,
                                boxShadow: isActive ? `0 0 35px ${MANIM_COLORS.gold}44` : isSorted ? `0 0 20px ${MANIM_COLORS.green}33` : "none",
                                scale: isActive ? 1.1 : 1,
                                opacity: 1
                            }}
                            className="absolute flex flex-col items-center justify-center w-14 h-14 border-[2.5px] rounded-2xl font-mono bg-[#1C1C1C] z-20"
                            style={{ color: isActive ? MANIM_COLORS.gold : isSorted ? MANIM_COLORS.green : "white" }}
                        >
                            <span className="text-xl font-bold">{node.value}</span>
                            <div className="absolute -bottom-5 text-[8px] font-mono text-white/20 uppercase">
                                0x{node.id.split('-').pop()?.slice(0, 4)}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>

        {/* Premium Scrubber */}
        <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <GitPullRequest size={14} className="text-[#58C4DD]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Step {currentIndex + 1} of {history.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider">
                <div className="absolute w-full h-1 bg-white/10 rounded-full" />
                <div className="absolute h-1 bg-[#58C4DD] rounded-full shadow-[0_0_10px_#58C4DD44]" style={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }} />
                <input 
                    type="range" min="0" max={history.length - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute w-1.5 h-4 bg-[#FFFF00] rounded-full shadow-[0_0_15px_#FFFF00] pointer-events-none transition-all"
                    style={{ left: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 3px)` }}
                />
            </div>
        </div>
      </div>
    </div>
  );
}