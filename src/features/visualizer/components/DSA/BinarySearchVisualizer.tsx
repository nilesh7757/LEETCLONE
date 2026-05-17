"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, ChevronLeft, ChevronRight,
  Search, Hash, Activity, ArrowDown
} from "lucide-react";

// --- Configuration ---
const UNIT_WIDTH = 60;

interface SearchStep {
  low: number;
  mid: number;
  high: number;
  message: string;
  found: boolean;
  activeRange: [number, number];
  logs: string[];
}

export default function BinarySearchVisualizer({ speed = 800 }: { speed?: number }) {
  const [data] = useState<number[]>(() => {
    return Array.from({ length: 15 }, () => Math.floor(Math.random() * 90) + 10).sort((a, b) => a - b);
  });
  const [target, setTarget] = useState<number>(() => data[Math.floor(Math.random() * data.length)]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-calculate History
  const history = useMemo(() => {
    const steps: SearchStep[] = [];
    let l = 0;
    let r = data.length - 1;
    let currentLogs: string[] = [];

    const record = (msg: string, low: number, mid: number, high: number, found: boolean = false) => {
      currentLogs = [msg, ...currentLogs].slice(0, 10);
      steps.push({
        low,
        mid,
        high,
        message: msg,
        found,
        activeRange: [low, high],
        logs: [...currentLogs]
      });
    };

    record("Algorithm Booted. Target localized in vector manifold.", l, -1, r);

    while (l <= r) {
      const mid = Math.floor((l + r) / 2);
      
      if (data[mid] === target) {
        record(`CRITICAL MATCH: Target ${target} verified at index ${mid}.`, l, mid, r, true);
        break;
      }

      record(`Probing manifold at index ${mid} (Value: ${data[mid]}).`, l, mid, r);

      if (data[mid] < target) {
        l = mid + 1;
        record(`Target ${target} > ${data[mid]}. Shifting lower boundary to ${l}.`, l, mid, r);
      } else {
        r = mid - 1;
        record(`Target ${target} < ${data[mid]}. Shifting upper boundary to ${r}.`, l, mid, r);
      }
    }

    if (!steps.find(s => s.found)) {
        record("Target not found in current manifold state.", l, -1, r);
    }

    return steps;
  }, [data, target]);

  // Playback Control
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

  const currentStep = history[currentIndex] || { 
    low: 0, mid: -1, high: data.length - 1, message: "Ready.", found: false, activeRange: [0, data.length-1], logs: []
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setTarget(data[Math.floor(Math.random() * data.length)]);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="p-4 md:p-8 bg-[var(--card)] rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col border border-[var(--border)]">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        
        {/* Header UI */}
        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--viz-cyan)]/10 rounded-xl text-[var(--viz-cyan)]">
                    <Search size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Binary Search</h2>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Logarithmic Vector Scan</p>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-muted p-1.5 rounded-2xl  shadow-inner">
             <div className="flex items-center gap-2 px-3 border-r border-border/50">
                <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Target</span>
                <span className="text-sm font-black text-[var(--viz-cyan)] font-mono">{target}</span>
             </div>
             <button onClick={resetSimulation} className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-muted-foreground hover:text-foreground" title="Randomize Target"><RotateCcw size={18}/></button>
             
             {!isPlaying ? (
                <button onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(true); }} className="flex items-center gap-2 px-6 py-2.5 bg-[var(--viz-cyan)] text-black rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-lg">
                    <Play size={16} fill="currentColor"/> SCAN
                </button>
             ) : (
                <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 px-6 py-2.5 bg-white/10 text-foreground rounded-xl font-bold text-xs hover:bg-white/20 transition-all">
                    <Pause size={16} fill="currentColor"/> HALT
                </button>
             )}
          </div>
        </div>

        {/* Visual Canvas */}
        <div className="relative min-h-[450px] bg-muted/30 rounded-[3rem]  overflow-hidden shadow-inner flex flex-col items-center justify-center p-12">
            
            <div className="relative flex items-center justify-center w-full h-full">
                {/* Boundary Highlights */}
                <AnimatePresence>
                    <motion.div 
                        initial={false}
                        animate={{ 
                            x: (currentStep.activeRange[0] + currentStep.activeRange[1]) / 2 * UNIT_WIDTH - (data.length - 1) / 2 * UNIT_WIDTH,
                            width: (currentStep.activeRange[1] - currentStep.activeRange[0] + 1) * UNIT_WIDTH,
                            opacity: 1
                        }}
                        className="absolute h-24 bg-[var(--viz-cyan)]/5 border-x-2 border-dashed border-[var(--viz-cyan)]/20 rounded-2xl z-0"
                    />
                </AnimatePresence>

                {/* Array Nodes */}
                <div className="relative flex items-center justify-center z-10">
                    {data.map((val, idx) => {
                        const isMid = idx === currentStep.mid;
                        const isFound = isMid && currentStep.found;
                        const isActive = idx >= currentStep.activeRange[0] && idx <= currentStep.activeRange[1];
                        const xPos = (idx - (data.length - 1) / 2) * UNIT_WIDTH;

                        return (
                            <motion.div
                                key={idx}
                                initial={false}
                                animate={{ 
                                    x: xPos,
                                    scale: isMid ? 1.25 : 1,
                                    opacity: isActive ? 1 : 0.15,
                                    backgroundColor: isFound ? "var(--viz-green)" : isMid ? "var(--viz-cyan)" : "var(--card)",
                                    borderColor: isFound ? "var(--viz-green)" : isMid ? "var(--viz-cyan)" : "var(--border)",
                                    color: isMid ? "black" : "var(--foreground)",
                                    boxShadow: isMid ? `0 0 30px rgba(var(--viz-cyan-rgb), 0.3)` : "none"
                                }}
                                className="absolute w-12 h-12 border-2 rounded-xl flex items-center justify-center font-mono text-sm font-black shadow-lg"
                            >
                                {val}
                                <div className="absolute -top-6 text-[8px] text-muted-foreground/30 font-mono font-bold uppercase">{idx}</div>
                                
                                {isMid && (
                                    <motion.div layoutId="ptr" className="absolute -bottom-10 flex flex-col items-center">
                                        <ArrowDown size={14} className="text-[var(--viz-cyan)] mb-1" />
                                        <span className="text-[8px] font-black text-[var(--viz-cyan)] uppercase tracking-tighter">Probe</span>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Explanation Toast */}
            <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-10 w-full flex justify-center z-30 pointer-events-none">
                    <div className="px-6 py-3 bg-card/90  rounded-2xl backdrop-blur-md border border-border shadow-2xl max-w-[400px] text-center">
                        <p className="text-xs text-[var(--viz-amber)] font-mono font-medium tracking-tight uppercase">{currentStep.message}</p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Metrics Overlay */}
            <div className="absolute top-8 left-8 z-30 flex flex-col gap-4 pointer-events-none">
                <div className="bg-card/90 backdrop-blur border border-border p-4 rounded-2xl shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 flex items-center gap-2 mb-3">
                            <Activity size={12} /> Scan Log
                    </span>
                    <div className="flex flex-col gap-1.5 h-[120px] overflow-hidden">
                        <AnimatePresence mode="popLayout">
                            {currentStep.logs.map((log, i) => (
                                <motion.div 
                                    key={`${currentIndex}-${i}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[9px] font-mono text-muted-foreground/70 leading-tight border-l-2 border-[var(--viz-cyan)]/20 pl-2"
                                >
                                    {log}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>

        {/* Timeline Scrubber */}
        <div className="mt-8 p-6 bg-muted/30 rounded-[2.5rem] flex flex-col gap-4 relative z-10 border border-border/50">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Hash size={14} className="text-[var(--viz-cyan)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 font-mono">Iteration Sequence {currentIndex + 1} of {history.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider h-2">
                <div className="absolute w-full h-1 bg-background/10 rounded-full" />
                <div className="absolute h-1 bg-[var(--viz-cyan)] rounded-full shadow-[0_0_10px_rgba(88,196,221,0.4)] transition-all" style={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }} />
                <input 
                    type="range" min="0" max={history.length - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute w-1.5 h-4 bg-[var(--viz-cyan)] rounded-full shadow-[0_0_15px_var(--viz-cyan)] pointer-events-none transition-all"
                    style={{ left: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 3px)` }}
                />
            </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 md:px-10 py-6 bg-muted/10  rounded-[2.5rem] border border-border/20 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-cyan)]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest font-mono">Pivot Pointer</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest font-mono">Optimal State</span></div>
      </div>
    </div>
  );
}


