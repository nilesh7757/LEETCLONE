"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, ChevronLeft, ChevronRight, Zap, 
  Activity, ArrowDown, ArrowUp, Search, Hash, Target
} from "lucide-react";

// --- Configuration ---
const ARRAY_SIZE = 15;

// Manim-inspired Palette
const COLORS = { 
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#f59e0b",
  red: "#FC6255",
  purple: "#9A72AC",
  muted: "rgba(255,255,255,0.1)"
};

interface VisualNode {
  id: string;
  value: number;
  index: number;
}

interface SearchStep {
  low: number;
  high: number;
  mid: number | null;
  found: boolean;
  phase: "BOOT" | "SCAN" | "CHECK" | "ELIMINATE_LEFT" | "ELIMINATE_RIGHT" | "FOUND" | "NOT_FOUND";
  message: string;
}

export default function BinarySearchVisualizer({ speed = 800 }: { speed?: number }) {
  // --- State ---
  const [initialData, setInitialData] = useState<VisualNode[]>([]);
  const [target, setTarget] = useState<number>(0);
  const [history, setHistory] = useState<SearchStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Initialization ---
  const generateScenario = () => {
    setIsPlaying(false);
    // Generate sorted unique numbers
    const set = new Set<number>();
    while(set.size < ARRAY_SIZE) {
        set.add(Math.floor(Math.random() * 99) + 1);
    }
    const arr = Array.from(set).sort((a,b) => a-b);
    
    setInitialData(arr.map((val, i) => ({
        id: `node-${i}-${val}`,
        value: val,
        index: i
    })));
    
    // Pick a random target (or sometimes one not in array)
    const pickIndex = Math.floor(Math.random() * ARRAY_SIZE);
    setTarget(Math.random() > 0.2 ? arr[pickIndex] : 100);
    setCurrentIndex(0);
  };

  useEffect(() => {
    generateScenario();
  }, []);

  // --- Algorithm Logic ---
  useEffect(() => {
    if (initialData.length === 0) return;

    const steps: SearchStep[] = [];
    let l = 0;
    let r = initialData.length - 1;
    let found = false;

    // Initial State
    steps.push({
        low: l, high: r, mid: null, found: false,
        phase: "BOOT", message: `Search Space: [${l} ... ${r}]`
    });

    while (l <= r) {
        const m = Math.floor((l + r) / 2);
        
        // 1. Calculate Mid
        steps.push({
            low: l, high: r, mid: m, found: false,
            phase: "SCAN", message: `Calculating Mid: (${l} + ${r}) / 2 = ${m}`
        });

        // 2. Check Value
        const midVal = initialData[m].value;
        steps.push({
            low: l, high: r, mid: m, found: false,
            phase: "CHECK", message: `Comparing arr[${m}] (${midVal}) vs Target (${target})`
        });

        if (midVal === target) {
            found = true;
            steps.push({
                low: l, high: r, mid: m, found: true,
                phase: "FOUND", message: `Target ${target} found at index ${m}!`
            });
            break;
        } else if (midVal < target) {
            steps.push({
                low: l, high: r, mid: m, found: false,
                phase: "ELIMINATE_LEFT", message: `${midVal} < ${target}. Discarding left half.`
            });
            l = m + 1;
        } else {
            steps.push({
                low: l, high: r, mid: m, found: false,
                phase: "ELIMINATE_RIGHT", message: `${midVal} > ${target}. Discarding right half.`
            });
            r = m - 1;
        }
        
        // Boundary Update
        if (l <= r) {
            steps.push({
                low: l, high: r, mid: null, found: false,
                phase: "BOOT", message: `New Search Space: [${l} ... ${r}]`
            });
        }
    }

    if (!found) {
        steps.push({
            low: l, high: r, mid: null, found: false,
            phase: "NOT_FOUND", message: `Target ${target} not present in array.`
        });
    }

    setHistory(steps);
    setCurrentIndex(0);
  }, [initialData, target]);

  // --- Playback Engine ---
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, history.length, speed]);

  const currentStep = history[currentIndex] || { 
    low: 0, high: ARRAY_SIZE-1, mid: null, found: false, phase: "BOOT", message: "Initializing..."
  };

  // --- Visual Helpers ---
  const getBarHeight = (val: number) => {
    // Min height 20%, Max 80%
    return 20 + (val / 100) * 60;
  };

  const activeColor = 
    currentStep.phase === "FOUND" ? COLORS.green :
    currentStep.phase === "CHECK" ? COLORS.gold :
    currentStep.phase === "NOT_FOUND" ? COLORS.red :
    COLORS.blue;

  return (
    <div className="flex flex-col gap-6 select-none font-sans">
      
      {/* --- Main Dashboard --- */}
      <div className="bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col">
         {/* Background Grid */}
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

         {/* Header & Inputs */}
         <div className="relative z-10 p-6 border-b border-border bg-muted/20 flex flex-col xl:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-[#58C4DD]/10 rounded-2xl text-[#58C4DD]">
                    <Search size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Binary Search</h2>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">O(log n) Interval Reduction</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-card p-1.5 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-3 px-4 border-r border-border">
                    <Target size={16} className="text-[#f59e0b]" />
                    <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-wider">Target</span>
                    <input 
                        type="number" value={target} 
                        onChange={e => { setTarget(parseInt(e.target.value) || 0); setIsPlaying(false); }}
                        className="w-12 bg-transparent font-mono text-sm font-bold text-[#f59e0b] focus:outline-none text-center"
                    />
                </div>
                <button onClick={generateScenario} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all" title="New Array">
                    <RotateCcw size={16} />
                </button>
                <button 
                    onClick={() => setIsPlaying(!isPlaying)} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all shadow-lg ${isPlaying ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-[#58C4DD] text-black hover:scale-105"}`}
                >
                    {isPlaying ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor"/>}
                    {isPlaying ? "Pause" : "Run"}
                </button>
            </div>
         </div>

         {/* --- The Visual Stage --- */}
         <div className="relative min-h-[400px] bg-muted/5 flex flex-col items-center justify-center p-8 overflow-hidden">
            
            {/* Logic Badge */}
            <div className="absolute top-6 left-6">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${currentStep.phase === "FOUND" ? "bg-green-500/10 border-green-500/30 text-green-500" : "bg-[#58C4DD]/10 border-[#58C4DD]/30 text-[#58C4DD]"}`}>
                    <Zap size={12} fill="currentColor" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{currentStep.phase}</span>
                </div>
            </div>

            {/* Array Container */}
            <div className="w-full max-w-[800px] h-[200px] flex items-end justify-center gap-1.5 md:gap-3 relative z-10">
                <AnimatePresence>
                    {initialData.map((node) => {
                        const isMid = node.index === currentStep.mid;
                        const inRange = node.index >= currentStep.low && node.index <= currentStep.high;
                        const isFound = currentStep.found && isMid;
                        
                        return (
                            <motion.div
                                key={node.id}
                                layout
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ 
                                    opacity: inRange ? 1 : 0.2, 
                                    scale: isMid ? 1.1 : 1,
                                    height: `${getBarHeight(node.value)}%`
                                }}
                                className={`relative flex-1 min-w-[20px] max-w-[50px] rounded-t-lg border-x border-t transition-colors duration-300 flex flex-col justify-end items-center pb-2 group
                                    ${isFound ? "bg-green-500/20 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : 
                                      isMid ? "bg-[#f59e0b]/20 border-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.3)]" : 
                                      inRange ? "bg-[#58C4DD]/10 border-[#58C4DD]/40" : 
                                      "bg-muted border-border"}`}
                            >
                                <span className={`text-[10px] md:text-xs font-bold font-mono ${isMid || isFound ? "text-white scale-125" : "text-muted-foreground"}`}>
                                    {node.value}
                                </span>
                                
                                {/* Index Label */}
                                <div className="absolute -bottom-6 text-[8px] font-mono text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {node.index}
                                </div>

                                {/* Pointers */}
                                {node.index === currentStep.low && (
                                    <motion.div layoutId="ptr-l" className="absolute -bottom-8 flex flex-col items-center z-20">
                                        <ArrowUp size={12} className="text-[#58C4DD]" />
                                        <span className="text-[7px] font-black text-[#58C4DD]">L</span>
                                    </motion.div>
                                )}
                                {node.index === currentStep.high && (
                                    <motion.div layoutId="ptr-r" className="absolute -bottom-8 flex flex-col items-center z-20">
                                        <ArrowUp size={12} className="text-[#FC6255]" />
                                        <span className="text-[7px] font-black text-[#FC6255]">R</span>
                                    </motion.div>
                                )}
                                {isMid && (
                                    <motion.div layoutId="ptr-m" className="absolute -top-8 flex flex-col items-center z-20">
                                        <span className="text-[7px] font-black text-[#f59e0b]">M</span>
                                        <ArrowDown size={12} className="text-[#f59e0b]" />
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Target Line Visual (Background Hint) */}
            <motion.div 
                className="absolute left-0 right-0 border-t border-dashed border-[#f59e0b]/20 z-0 flex items-center justify-end pr-4 pointer-events-none"
                animate={{ bottom: `${getBarHeight(target)}%` }}
            >
                <span className="text-[8px] font-mono text-[#f59e0b]/50 bg-card px-1">TARGET Y-AXIS</span>
            </motion.div>

         </div>

         {/* --- Info Footer --- */}
         <div className="border-t border-border bg-card p-6 flex flex-col md:flex-row gap-8 items-center">
            
            <div className="flex-1 w-full space-y-4">
                <div className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center gap-4">
                    <Activity size={18} className="text-muted-foreground" />
                    <p className="font-mono text-sm leading-relaxed text-foreground/80 flex-1">
                        <span className="text-[#58C4DD] mr-2">»</span>
                        {currentStep.message}
                    </p>
                </div>
            </div>

            <div className="flex gap-4 md:gap-8 text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#58C4DD]" /> Low
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Mid
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#FC6255]" /> High
                </div>
            </div>

         </div>

         {/* Progress Line */}
         <div className="h-1 w-full bg-muted">
             <motion.div 
                className="h-full bg-[#58C4DD]" 
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / history.length) * 100}%` }}
             />
         </div>

      </div>
    </div>
  );
}
