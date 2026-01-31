"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, ChevronLeft, ChevronRight, Zap, 
  Activity, Database, ArrowDown, ArrowUp, Search, Hash
} from "lucide-react";

// --- Configuration ---
const CELL_SIZE = 50;
const GAP = 8;
const VIEWPORT_WIDTH = 800; // Approximate visual width

// Manim-inspired Palette
const COLORS = { 
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#f59e0b",
  red: "#FC6255",
  purple: "#9A72AC",
  dark: "#1e1e1e",
  muted: "rgba(255,255,255,0.1)"
};

interface KMPStep {
  i: number;
  j: number;
  lps: number[];
  matchIndices: number[];
  phase: "COMPARE" | "MATCH" | "MISMATCH" | "JUMP" | "FOUND" | "DONE";
  message: string;
}

export default function KMPVisualizer({ speed = 800 }: { speed?: number }) {
  // --- State ---
  const [text, setText] = useState("ABABDABACDABABCABAB");
  const [pattern, setPattern] = useState("ABABCABAB");
  const [history, setHistory] = useState<KMPStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Algorithm Logic ---
  useEffect(() => {
    const steps: KMPStep[] = [];
    const n = text.length;
    const m = pattern.length;
    
    // 1. Build LPS
    const lps = new Array(m).fill(0);
    let len = 0;
    let idx = 1;
    while (idx < m) {
      if (pattern[idx] === pattern[len]) {
        len++;
        lps[idx] = len;
        idx++;
      } else {
        if (len !== 0) len = lps[len - 1];
        else {
          lps[idx] = 0;
          idx++;
        }
      }
    }

    // 2. KMP Search
    let i = 0; // text index
    let j = 0; // pattern index
    const matches: number[] = [];

    // Initial State
    steps.push({
      i: 0, j: 0, lps: [...lps], matchIndices: [], 
      phase: "COMPARE", message: "Algorithm Initialized."
    });

    while (i < n) {
      // Comparison Step
      steps.push({
        i, j, lps: [...lps], matchIndices: [...matches], 
        phase: "COMPARE", 
        message: `Comparing T[${i}] ('${text[i]}') vs P[${j}] ('${pattern[j]}')`
      });

      if (pattern[j] === text[i]) {
        // Match
        i++; j++;
        if (j === m) {
          matches.push(i - j);
          steps.push({
            i: i - 1, j: j - 1, lps: [...lps], matchIndices: [...matches], 
            phase: "FOUND", message: `Full pattern match found at index ${i - j}!`
          });
          j = lps[j - 1]; // Reset for next potential match
          steps.push({
            i, j, lps: [...lps], matchIndices: [...matches], 
            phase: "JUMP", message: "Resetting pattern index using LPS to find overlaps."
          });
        } else {
          steps.push({
            i: i - 1, j: j - 1, lps: [...lps], matchIndices: [...matches], 
            phase: "MATCH", message: "Characters match! Advancing both pointers."
          });
        }
      } else {
        // Mismatch
        steps.push({
          i, j, lps: [...lps], matchIndices: [...matches], 
          phase: "MISMATCH", message: `Mismatch detected at T[${i}] vs P[${j}].`
        });
        
        if (j !== 0) {
          j = lps[j - 1];
          steps.push({
            i, j, lps: [...lps], matchIndices: [...matches], 
            phase: "JUMP", message: `Backtracking pattern to index ${j} (LPS[${j-1}]). Text pointer stays.`
          });
        } else {
          i++;
          steps.push({
            i, j, lps: [...lps], matchIndices: [...matches], 
            phase: "JUMP", message: "Mismatch at pattern start. Advancing text pointer."
          });
        }
      }
    }

    steps.push({
      i: n-1, j: 0, lps: [...lps], matchIndices: [...matches], 
      phase: "DONE", message: "Search Complete."
    });

    setHistory(steps);
    setCurrentIndex(0);
  }, [text, pattern]);

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
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, history.length, speed]);

  const currentStep = history[currentIndex] || { 
    i: 0, j: 0, lps: [], matchIndices: [], phase: "COMPARE", message: "Loading..." 
  };

  // --- Visual Helpers ---
  const activeColor = 
    currentStep.phase === "MATCH" || currentStep.phase === "FOUND" ? COLORS.green :
    currentStep.phase === "MISMATCH" ? COLORS.red :
    currentStep.phase === "JUMP" ? COLORS.purple :
    COLORS.gold;

  // New Camera Logic:
  // We want text[i] to be at X=0 (Center of Screen).
  // The 'tape' starts at i=0.
  // So position of text[0] should be 0.
  // Position of text[i] relative to text[0] is i * STEP.
  // So we translate the whole tape by -i * STEP to bring text[i] to 0.
  // AND we need to offset by -CELL_SIZE/2 to center the cell itself.
  const STEP = CELL_SIZE + GAP;
  const textTranslateX = -(currentStep.i * STEP) - (CELL_SIZE / 2);
  
  // Pattern Logic:
  // Pattern[j] aligns with Text[i].
  // Since Text[i] is at 0, Pattern[j] must be at 0.
  // So we translate pattern by -j * STEP.
  const patternTranslateX = -(currentStep.j * STEP) - (CELL_SIZE / 2);

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
                    <h2 className="text-xl font-bold tracking-tight">KMP Engine</h2>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Knuth-Morris-Pratt Algorithm</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-card p-1.5 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-2 px-3 border-r border-border">
                    <span className="text-[9px] font-black text-muted-foreground/50">TEXT</span>
                    <input 
                        type="text" value={text} 
                        onChange={e => { setText(e.target.value.toUpperCase()); setIsPlaying(false); }}
                        className="w-32 bg-transparent font-mono text-xs font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/20 text-center"
                    />
                </div>
                <div className="flex items-center gap-2 px-3 border-r border-border">
                    <span className="text-[9px] font-black text-muted-foreground/50">PATTERN</span>
                    <input 
                        type="text" value={pattern} 
                        onChange={e => { setPattern(e.target.value.toUpperCase()); setIsPlaying(false); }}
                        className="w-24 bg-transparent font-mono text-xs font-bold text-[#58C4DD] focus:outline-none placeholder:text-muted-foreground/20 text-center"
                    />
                </div>
                <button onClick={() => { setIsPlaying(false); setCurrentIndex(0); }} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all">
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
         <div className="relative min-h-[400px] bg-muted/5 flex flex-col items-center justify-center overflow-hidden">
            
            {/* Center Focus Marker (The Lens) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[60px] -ml-[30px] border-x-2 border-dashed border-[#58C4DD]/20 bg-[#58C4DD]/5 z-0" />
            <div className="absolute left-1/2 top-8 -translate-x-1/2 flex flex-col items-center z-10 opacity-50">
                <ArrowDown size={16} className="text-[#58C4DD] animate-bounce" />
                <span className="text-[9px] font-mono font-black text-[#58C4DD] tracking-widest mt-1">LENS</span>
            </div>

            {/* Gradient Mask for Edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-card to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-card to-transparent z-20 pointer-events-none" />

            {/* TEXT TRACK Container */}
            <div className="relative w-full h-[80px] mt-12 z-10">
                {/* The 'Rail' is absolutely positioned at center */}
                <div className="absolute left-1/2 top-0">
                    <motion.div 
                        className="flex absolute top-0 left-0" // Starts at 0,0 relative to parent (center)
                        animate={{ x: textTranslateX }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {text.split('').map((char, i) => {
                            const isCurrent = i === currentStep.i;
                            const isMatch = currentStep.matchIndices.some(start => i >= start && i < start + pattern.length);
                            
                            return (
                                <motion.div
                                    key={`text-${i}`}
                                    style={{ 
                                        left: i * STEP, 
                                        width: CELL_SIZE, 
                                        height: CELL_SIZE 
                                    }}
                                    animate={{ 
                                        scale: isCurrent ? 1.2 : 1,
                                        opacity: Math.abs(i - currentStep.i) > 6 ? 0.2 : 1, // Fade distant nodes
                                        borderColor: isCurrent ? activeColor : isMatch ? COLORS.green : "var(--border)",
                                        backgroundColor: isCurrent ? `${activeColor}20` : isMatch ? `${COLORS.green}15` : "var(--card)"
                                    }}
                                    className="absolute top-0 border-2 rounded-xl flex items-center justify-center font-mono text-lg font-black bg-card shadow-lg"
                                >
                                    {char}
                                    <div className="absolute -top-6 text-[8px] text-muted-foreground/40 font-mono">{i}</div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>

            {/* PATTERN TRACK Container */}
            <div className="relative w-full h-[80px] mb-12 z-10">
                <div className="absolute left-1/2 top-0">
                    <motion.div 
                        className="flex absolute top-0 left-0"
                        animate={{ x: patternTranslateX }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {pattern.split('').map((char, j) => {
                            const isCurrent = j === currentStep.j;
                            return (
                                <motion.div
                                    key={`pat-${j}`}
                                    style={{ 
                                        left: j * STEP, 
                                        width: CELL_SIZE, 
                                        height: CELL_SIZE 
                                    }}
                                    animate={{ 
                                        scale: isCurrent ? 1.2 : 1,
                                        opacity: isCurrent ? 1 : 0.6,
                                        borderColor: isCurrent ? activeColor : "var(--border)",
                                        backgroundColor: isCurrent ? `${activeColor}20` : "var(--card)"
                                    }}
                                    className="absolute top-0 border-2 rounded-xl flex items-center justify-center font-mono text-lg font-black bg-card shadow-lg"
                                >
                                    {char}
                                    <div className="absolute -bottom-6 text-[8px] text-muted-foreground/40 font-mono">{j}</div>
                                    
                                    {/* LPS Pointer Visual */}
                                    {isCurrent && currentStep.phase === "MISMATCH" && currentStep.lps[j-1] > 0 && (
                                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center w-max">
                                            <div className="text-[8px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30 mb-1">
                                                LPS JUMP: {currentStep.lps[j-1]}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>

         </div>

         {/* --- Info Footer --- */}
         <div className="border-t border-border bg-card p-6 flex flex-col lg:flex-row gap-8">
            
            {/* Status Panel */}
            <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="px-2 py-1 rounded-lg bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</div>
                    <div className={`text-xs font-mono font-bold uppercase tracking-wider`} style={{ color: activeColor }}>
                        {currentStep.phase}
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                    <p className="font-mono text-sm leading-relaxed text-foreground/80">
                        <span className="text-[#58C4DD] mr-2">»</span>
                        {currentStep.message}
                    </p>
                </div>
            </div>

            {/* LPS Table Mini-View */}
            <div className="lg:w-1/3 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-muted-foreground/50">
                    <Database size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">LPS Table</span>
                </div>
                <div className="flex overflow-x-auto gap-1 pb-2 scrollbar-thin">
                    {currentStep.lps.map((val, idx) => {
                        const isActive = idx === currentStep.j - 1 && currentStep.phase === "MISMATCH"; // Highlight valid LPS source
                        return (
                            <div key={idx} className={`flex flex-col items-center justify-center p-2 rounded-lg border min-w-[32px] transition-all ${isActive ? "bg-purple-500/20 border-purple-500 text-purple-400 scale-110" : "bg-card border-border opacity-50"}`}>
                                <span className="text-[8px] font-bold mb-1 opacity-50">{pattern[idx]}</span>
                                <span className="text-xs font-black">{val}</span>
                            </div>
                        )
                    })}
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