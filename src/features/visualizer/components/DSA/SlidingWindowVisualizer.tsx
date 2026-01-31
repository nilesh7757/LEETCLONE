"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Sparkles, Hash, Link as LinkIcon, 
  Search, Info, ChevronLeft, ChevronRight, Zap, GitBranch,
  Layers, ArrowUp, MousePointer2, Network, Share2, StepForward,
  TrendingUp, Activity, Layout, Plus, Trash2, Cpu, Database,
  ArrowRight, ArrowDown, Type, Maximize, ShieldAlert
} from "lucide-react";

// Professional Palette
const MANIM_COLORS = { 
  text: "var(--foreground)", 
  background: "var(--card)",
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#f59e0b",
  red: "#FC6255",
  purple: "#9A72AC"
};

interface WindowStep {
  start: number;
  end: number; // Exclusive
  charSet: string[];
  maxLength: number;
  message: string;
  step: string;
  logs: string[];
  conflictChar: string | null;
}

export default function SlidingWindowVisualizer({ speed = 800 }: { speed?: number }) {
  const [inputString, setInputString] = useState("ABCBCAD");
  const [history, setHistory] = useState<WindowStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Coordinate Sync
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Algorithm Simulation
  useEffect(() => {
    const chars = inputString.split("");
    const steps: WindowStep[] = [];
    let logs: string[] = [];
    let set = new Set<string>();
    let maxLen = 0;
    let l = 0;
    let r = 0;

    const record = (msg: string, step: string, conf: string|null = null) => {
      steps.push({
        start: l,
        end: r,
        charSet: Array.from(set),
        maxLength: maxLen,
        message: msg,
        step: step,
        conflictChar: conf,
        logs: [...logs]
      });
    };

    const addLog = (l: string) => logs = [l, ...logs];

    addLog("Sequence manifold initialized.");
    record("Ready to resolve longest unique substring.", "BOOT");

    while (r < chars.length) {
        const char = chars[r];
        record(`Evaluating bit '${char}' at index ${r}.`, "SCAN");
        
        if (!set.has(char)) {
            set.add(char);
            r++;
            if (set.size > maxLen) maxLen = set.size;
            addLog(`Bit '${char}' is unique. Expanding manifold.`);
            record(`No collision detected. Incrementing boundary R to ${r}.`, "EXPAND");
        } else {
            addLog(`Collision detected: bit '${char}' already exists.`);
            record(`Invariant violation! Bit '${char}' detected in current set.`, "CONFLICT", char);
            
            while (set.has(char)) {
                const leftChar = chars[l];
                addLog(`Purging bit '${leftChar}' from left.`);
                set.delete(leftChar);
                l++;
                record(`Purging manifold from left to resolve collision. L=${l}.`, "SHRINK", char);
            }
            set.add(char);
            r++;
            addLog(`Collision resolved. Continuing expansion.`);
            record(`Manifold stabilized. Boundary R moved to ${r}.`, "EXPAND");
        }
    }

    addLog("Global resolution complete.");
    record(`Sequence fully resolved. Max length: ${maxLen}.`, "COMPLETE");

    setHistory(steps);
    setCurrentIndex(0);
  }, [inputString]);

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
    start: 0, end: 0, charSet: [], maxLength: 0, message: "Initializing...", step: "IDLE", logs: [], conflictChar: null
  };

  const UNIT_WIDTH = 60;
  const chars = inputString.split("");

  return (
    <div className="flex flex-col gap-6">
      <div className="p-8 bg-card border border-border rounded-3xl shadow-2xl font-sans text-foreground relative overflow-hidden">
        {/* Grid Backdrop */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        {/* Header UI */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 relative z-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[#58C4DD]">
              Sliding Window <span className="text-muted-foreground/40">Lemma</span>
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-1 w-12 bg-[#58C4DD] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/30">Dynamic Manifold Interval Resolve</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-muted p-2 rounded-2xl border border-border shadow-inner">
            <div className="flex items-center gap-2 px-3 border-r border-border">
                <Type size={14} className="text-[#f59e0b] opacity-40" />
                <input 
                    type="text" value={inputString} 
                    onChange={e => { setInputString(e.target.value.toUpperCase().slice(0, 12)); setCurrentIndex(0); }}
                    placeholder="BUFFER"
                    className="w-24 bg-transparent text-center font-mono text-sm font-bold text-[#f59e0b] focus:outline-none placeholder:text-muted-foreground/20"
                />
            </div>
            
            <div className="flex gap-1">
              <button onClick={() => { setInputString("ABCBCAD"); setCurrentIndex(0); }} className="p-2 hover:bg-white/5 rounded-xl text-muted-foreground/40 transition-all"><RotateCcw size={20}/></button>
              {!isPlaying ? (
                <button onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(true); }} className="flex items-center gap-2 px-6 py-2 bg-[#58C4DD] text-black rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-lg">
                    <Play size={16} fill="currentColor"/> EXECUTE
                </button>
              ) : (
                <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 px-6 py-2 bg-white/10 text-foreground rounded-xl font-bold text-xs hover:bg-white/20 transition-all">
                    <Pause size={16} fill="currentColor"/> HALT
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Visual Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div ref={containerRef} className="lg:col-span-3 relative min-h-[400px] bg-muted/40 rounded-[2.5rem] border border-border overflow-hidden shadow-inner flex flex-col items-center justify-center p-10">
                
                {/* Logic Step Badge */}
                <AnimatePresence>
                    {currentStep.step !== "IDLE" && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-8 left-10 flex items-center gap-2 px-4 py-2 bg-[#58C4DD]/10 border border-[#58C4DD]/30 rounded-full z-30 shadow-lg">
                            <Zap size={12} className="text-[#58C4DD]" />
                            <span className="text-[9px] font-black font-mono text-[#58C4DD] uppercase tracking-[0.2em]">{currentStep.step}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Window Manifold Box */}
                {currentStep.end > currentStep.start && (
                    <motion.div 
                        className="absolute border-2 border-[#58C4DD]/20 bg-gradient-to-b from-[#58C4DD]/5 to-transparent rounded-[2rem] z-0"
                        animate={{ 
                            x: ( (currentStep.start + currentStep.end - 1)/2 - (chars.length - 1) / 2 ) * UNIT_WIDTH,
                            width: (currentStep.end - currentStep.start) * UNIT_WIDTH + 10,
                            height: 140,
                            opacity: 1
                        }}
                        transition={{ type: "spring", stiffness: 80, damping: 20 }}
                    />
                )}

                {/* Explanation Box */}
                <AnimatePresence mode="wait">
                    <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-12 w-full max-w-[400px] px-10 text-center z-30">
                        <div className="p-4 bg-card/80 border border-border rounded-2xl backdrop-blur-md shadow-2xl">
                            <p className="text-[10px] text-[#f59e0b] font-mono italic uppercase tracking-tighter">{currentStep.message}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Bit Sequence */}
                <div className="relative flex items-center justify-center gap-3 z-20">
                    {chars.map((char, i) => {
                        const inW = i >= currentStep.start && i < currentStep.end;
                        const isL = i === currentStep.start;
                        const isR = i === currentStep.end - 1;
                        const isC = char === currentStep.conflictChar && inW;

                        return (
                            <div key={i} className="relative flex flex-col items-center">
                                <AnimatePresence>
                                    {isL && (
                                        <motion.div key="ptr-l" layoutId="ptr-l" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-16 flex flex-col items-center">
                                            <span className="text-[7px] font-black text-[#58C4DD] mb-1">LEFT</span>
                                            <ArrowDown size={12} className="text-[#58C4DD]" />
                                        </motion.div>
                                    )}
                                    {isR && (
                                        <motion.div key="ptr-r" layoutId="ptr-r" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-16 flex flex-col items-center">
                                            <span className="text-[7px] font-black text-[#83C167] mb-1">RIGHT</span>
                                            <ArrowDown size={12} className="text-[#83C167]" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.div
                                    layout
                                    animate={{ 
                                        scale: inW ? 1.1 : 1,
                                        opacity: inW ? 1 : 0.3,
                                        backgroundColor: isC ? `${MANIM_COLORS.red}20` : inW ? `${MANIM_COLORS.blue}15` : "var(--card)",
                                        borderColor: isC ? MANIM_COLORS.red : inW ? MANIM_COLORS.blue : "var(--border)",
                                        boxShadow: isC ? `0 0 30px ${MANIM_COLORS.red}44` : inW ? `0 0 20px ${MANIM_COLORS.blue}22` : "none",
                                    }}
                                    transition={{ type: "spring", stiffness: 150, damping: 25 }}
                                    className="w-12 h-12 border-2 rounded-xl flex items-center justify-center font-mono shadow-lg relative"
                                >
                                    <span className={`text-base font-black ${inW ? "text-foreground" : "text-muted-foreground/40"}`}>{char}</span>
                                    {isC && (
                                        <motion.div layoutId="warn" className="absolute -bottom-8"><ShieldAlert size={14} className="text-[#FC6255]" /></motion.div>
                                    )}
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar: Set Manifold & Log */}
            <div className="flex flex-col gap-6">
                <div className="p-6 bg-muted border border-border rounded-[2rem] flex flex-col gap-4">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2">
                        <Database size={14}/> Set Manifold
                    </h3>
                    <div className="flex flex-wrap gap-1 justify-center min-h-[40px]">
                        <AnimatePresence>
                            {currentStep.charSet.map((char) => (
                                <motion.div
                                    key={`set-${char}`}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="w-8 h-8 rounded border border-[#58C4DD] bg-[#58C4DD]/10 flex items-center justify-center font-mono text-[10px] font-black text-[#58C4DD]"
                                >
                                    {char}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {currentStep.charSet.length === 0 && <span className="text-[9px] italic text-muted-foreground/20">Empty</span>}
                    </div>
                </div>

                <div className="p-6 bg-muted border border-border rounded-[2rem] flex-1 flex flex-col gap-4 overflow-hidden h-[240px]">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2">
                        <Activity size={14}/> Manifold Log
                    </h3>
                    <div className="flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-thin">
                        <AnimatePresence>
                            {currentStep.logs.map((log, i) => (
                                <motion.div
                                    key={`log-${i}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[9px] font-mono text-muted-foreground/60 flex gap-2 border-l-2 border-border pl-2 py-0.5"
                                >
                                    <span className="text-[#58C4DD]">»</span>
                                    {log}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {currentStep.logs.length === 0 && <span className="text-[9px] italic text-muted-foreground/20 text-center py-8">Idle...</span>}
                    </div>
                </div>

                <div className="p-6 bg-muted border border-border rounded-[2rem]">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest mb-4 flex items-center gap-2">
                        <Maximize size={14}/> Max Length
                    </h3>
                    <div className="text-3xl font-black font-mono text-[#83C167] text-center shadow-text">
                        {currentStep.maxLength}
                    </div>
                </div>
            </div>
        </div>

        {/* Scrubber UI */}
        <div className="mt-8 p-6 bg-muted border border-border rounded-[2.5rem] flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Hash size={14} className="text-[#f59e0b]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Lemma Sequence {currentIndex + 1} of {history.length || 1}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider">
                <div className="absolute w-full h-1 bg-background/10 rounded-full" />
                <div className="absolute h-1 bg-[#58C4DD] rounded-full shadow-[0_0_10px_#58C4DD44]" style={{ width: `${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}%` }} />
                <input 
                    type="range" min="0" max={(history.length || 1) - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute w-1.5 h-4 bg-[#f59e0b] rounded-full shadow-[0_0_15px_#f59e0b] pointer-events-none transition-all"
                    style={{ left: `calc(${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}% - 3px)` }}
                />
            </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-10 py-6 bg-muted/20 border border-border rounded-[2.5rem] flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Active Probe</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#58C4DD]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Window Interval</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#FC6255]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Set Collision</span></div>
         <div className="flex items-center gap-3"><Activity size={14} className="text-muted-foreground/20" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Dynamic Synthesis</span></div>
      </div>
    </div>
  );
}