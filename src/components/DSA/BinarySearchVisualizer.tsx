"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, Sparkles, Hash, Target, Info, ChevronRight, ChevronLeft, Search, LocateFixed, MoveHorizontal } from "lucide-react";

// Reduced size to ensure it fits within standard viewport bounds
const ARRAY_SIZE = 12;

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
  index: number;
}

interface HistoryStep {
  nodes: VisualNode[];
  explanation: string;
  activeStep: string | null;
  low: number | null;
  high: number | null;
  mid: number | null;
  found: boolean;
  discardedIndices: Set<number>;
}

export default function BinarySearchVisualizer({ speed = 800 }: { speed?: number }) {
  const [initialData, setInitialData] = useState<VisualNode[]>([]);
  const [target, setTarget] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Instant History Generation
  const history = useMemo(() => {
    if (initialData.length === 0) return [];
    
    const steps: HistoryStep[] = [];
    const currentNodes: VisualNode[] = JSON.parse(JSON.stringify(initialData));
    let discarded = new Set<number>();

    const record = (msg: string, step: string | null, low: number | null, high: number | null, mid: number | null, isFound = false) => {
      steps.push({
        nodes: [...currentNodes],
        explanation: msg,
        activeStep: step,
        low,
        high,
        mid,
        found: isFound,
        discardedIndices: new Set(discarded)
      });
    };

    record("Manifold initialized. Define target value.", "INITIALIZE", 0, ARRAY_SIZE - 1, null);

    let l = 0;
    let r = currentNodes.length - 1;

    while (l <= r) {
      record(`Defining search interval: [${l}, ${r}].`, "REDUCE_INTERVAL", l, r, null);
      const m = Math.floor((l + r) / 2);
      record(`Calculating median index: ( ${l} + ${r} ) / 2 = ${m}.`, "MEDIAN_LEMMA", l, r, m);

      if (currentNodes[m].value === target) {
        record(`Match Detected! V[${m}] matches target ${target}.`, "CONVERGENCE", l, r, m, true);
        break;
      } else if (currentNodes[m].value < target) {
        record(`${currentNodes[m].value} < ${target}: Eliminating left sub-manifold.`, "ELIMINATION", l, r, m);
        for (let i = l; i <= m; i++) discarded.add(i);
        l = m + 1;
      } else {
        record(`${currentNodes[m].value} > ${target}: Eliminating right sub-manifold.`, "ELIMINATION", l, r, m);
        for (let i = m; i <= r; i++) discarded.add(i);
        r = m - 1;
      }
    }

    if (l > r) {
        record(`Search space exhausted. Target ${target} not found.`, "NULL_RESULT", null, null, null);
    }

    return steps;
  }, [initialData, target]);

  // 2. Playback Logic
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
    const arr = Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 85) + 10).sort((a, b) => a - b);
    const nodes = arr.map((val, i) => ({
      id: `bin-node-${Math.random().toString(36).substr(2, 9)}`,
      value: val,
      index: i,
    }));
    setInitialData(nodes);
    setTarget(arr[Math.floor(Math.random() * arr.length)]);
  };

  useEffect(() => { generateArray(); }, []);

  const currentStep = history[currentIndex] || { 
    nodes: initialData, 
    explanation: "Initializing...", 
    activeStep: null, 
    low: null, 
    high: null, 
    mid: null,
    found: false,
    discardedIndices: new Set<number>()
  };

  // Node width (48px) + Gap (12px) = 60px
  const UNIT_WIDTH = 60;

  return (
    <div className="flex flex-col gap-6">
      <div className="p-6 md:p-10 bg-[#0A0A0A] border border-white/10 rounded-[3rem] shadow-2xl font-sans text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 relative z-10 gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-[#58C4DD]">
              Binary Search <span className="text-white/20 font-extralight italic">Lemma</span>
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-0.5 w-12 bg-gradient-to-r from-[#58C4DD] to-transparent rounded-full" />
               <p className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">Temporal Logic Navigation</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
            <div className="flex items-center gap-3 bg-white/5 px-3 py-2 rounded-[1.2rem] border border-white/10 shadow-inner">
                <Target size={12} className="text-[#FFFF00] opacity-40" />
                <span className="text-[9px] font-black font-mono text-white/20 uppercase tracking-tighter">Target</span>
                <input 
                    type="number" 
                    value={target} 
                    onChange={(e) => { generateArray(); setTarget(parseInt(e.target.value)); }} 
                    className="w-10 bg-transparent text-center font-mono text-sm font-bold text-[#FFFF00] focus:outline-none"
                />
            </div>

            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-[1.2rem] border border-white/10">
                <button onClick={generateArray} className="p-2.5 hover:bg-white/10 rounded-xl text-white/40 active:scale-90 transition-all"><RotateCcw size={18} /></button>
                {!isPlaying ? (
                <button onClick={() => setIsPlaying(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#58C4DD] text-black rounded-xl hover:scale-105 transition-all font-black text-[9px] uppercase tracking-widest"><Play size={14} fill="currentColor" /> EXECUTE</button>
                ) : (
                <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 px-5 py-2.5 bg-[#FC6255]/20 text-[#FC6255] border border-[#FC6255]/50 rounded-xl font-black text-[9px] uppercase tracking-widest"><Pause size={14} fill="currentColor" /> HALT</button>
                )}
            </div>
          </div>
        </div>

        {/* Animation Canvas */}
        <div className="relative min-h-[480px] bg-black/40 rounded-[2.5rem] border border-white/5 overflow-x-auto overflow-y-hidden shadow-2xl flex flex-col items-center justify-center px-4 scrollbar-hide">
            
            {/* Range Manifold Box */}
            {currentStep.low !== null && currentStep.high !== null && (
                <motion.div 
                    className="absolute border-2 border-[#58C4DD]/20 bg-gradient-to-b from-[#58C4DD]/5 to-transparent rounded-[2rem] z-0"
                    animate={{ 
                        x: ( (currentStep.low + currentStep.high)/2 - (ARRAY_SIZE - 1) / 2 ) * UNIT_WIDTH,
                        width: (currentStep.high - currentStep.low + 1) * UNIT_WIDTH + 10,
                        height: 160,
                        opacity: 1
                    }}
                    transition={{ type: "spring", stiffness: 80, damping: 20 }}
                />
            )}

            <AnimatePresence>
                {currentStep.activeStep && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-8 left-8 flex items-center gap-2 px-4 py-1.5 bg-[#58C4DD]/10 border border-[#58C4DD]/30 rounded-full z-30 shadow-lg backdrop-blur-md">
                        <MoveHorizontal size={12} className="text-[#58C4DD]" />
                        <span className="text-[8px] font-black font-mono text-[#58C4DD] uppercase tracking-[0.2em]">{currentStep.activeStep}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-12 w-full max-w-[450px] px-6 text-center z-30">
                    <div className="p-4 bg-black/80 border border-white/10 rounded-[1.5rem] backdrop-blur-xl shadow-2xl">
                        <p className="text-[9px] text-[#FFFF00] font-mono leading-relaxed italic uppercase tracking-tighter opacity-90">{currentStep.explanation}</p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Node Array */}
            <div className="relative flex items-center justify-center gap-3">
                {currentStep.nodes.map((node) => {
                    const isMid = currentStep.mid === node.index;
                    const isLow = currentStep.low === node.index;
                    const isHigh = currentStep.high === node.index;
                    const isDiscarded = currentStep.discardedIndices.has(node.index);
                    const isFound = currentStep.found && isMid;
                    
                    return (
                        <div key={node.id} className="relative flex flex-col items-center">
                            <div className="absolute -top-20 flex flex-col items-center">
                                <AnimatePresence>
                                    {isLow && (
                                        <motion.div layoutId="ptr-low" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[#58C4DD] flex flex-col items-center">
                                            <span className="text-[8px] font-black font-mono mb-1">LOW</span>
                                            <div className="w-1 h-1 bg-[#58C4DD] rounded-full shadow-[0_0_8px_#58C4DD]" />
                                            <div className="w-[1px] h-6 bg-gradient-to-b from-[#58C4DD] to-transparent mt-1" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="absolute -top-20 flex flex-col items-center ml-10">
                                <AnimatePresence>
                                    {isHigh && (
                                        <motion.div layoutId="ptr-high" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[#FC6255] flex flex-col items-center">
                                            <span className="text-[8px] font-black font-mono mb-1">HIGH</span>
                                            <div className="w-1 h-1 bg-[#FC6255] rounded-full shadow-[0_0_8px_#FC6255]" />
                                            <div className="w-[1px] h-6 bg-gradient-to-b from-[#FC6255] to-transparent mt-1" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <motion.div
                                layout
                                animate={{ 
                                    scale: isFound ? 1.25 : isMid ? 1.15 : isDiscarded ? 0.8 : 1,
                                    opacity: isDiscarded ? 0.1 : 1,
                                    borderColor: isFound ? MANIM_COLORS.green : isMid ? MANIM_COLORS.gold : isLow ? MANIM_COLORS.blue : isHigh ? MANIM_COLORS.red : "rgba(255,255,255,0.15)",
                                    boxShadow: isFound ? `0 0 40px ${MANIM_COLORS.green}66` : isMid ? `0 0 25px ${MANIM_COLORS.gold}44` : "none",
                                }}
                                transition={{ type: "spring", stiffness: 120, damping: 22 }}
                                className="w-12 h-12 border-[2px] rounded-xl flex items-center justify-center font-mono bg-[#111111] z-20"
                                style={{ color: isFound ? MANIM_COLORS.green : isMid ? MANIM_COLORS.gold : "white" }}
                            >
                                <span className="text-lg font-bold">{node.value}</span>
                            </motion.div>

                            <div className="absolute -bottom-16">
                                <AnimatePresence>
                                    {isMid && (
                                        <motion.div layoutId="ptr-mid" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[#FFFF00] flex flex-col items-center">
                                            <div className="w-[1px] h-6 bg-gradient-to-t from-[#FFFF00] to-transparent mb-1" />
                                            <div className="w-1 h-1 bg-[#FFFF00] rounded-full shadow-[0_0_12px_#FFFF00]" />
                                            <span className="text-[8px] font-black font-mono mt-1">MID</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Premium Scrubber */}
        <div className="mt-8 p-6 md:p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] flex flex-col gap-5 relative z-10 backdrop-blur-sm">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Search size={16} className="text-[#FFFF00]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Lemma Chronicle</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-2 hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-2 hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-all"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center px-2">
                <div className="absolute w-full h-1 bg-white/5 rounded-full left-0" />
                <div className="absolute h-1 bg-gradient-to-r from-[#58C4DD] to-[#FFFF00] rounded-full left-0" 
                     style={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }} />
                <input 
                    type="range" min="0" max={history.length - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <motion.div 
                    className="absolute w-1.5 h-4 bg-[#FFFF00] rounded-full shadow-[0_0_15px_#FFFF00] pointer-events-none"
                    animate={{ left: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 3px)` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            </div>
        </div>
      </div>
    </div>
  );
}