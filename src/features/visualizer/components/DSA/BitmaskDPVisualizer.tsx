"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, ChevronLeft, ChevronRight, Zap, 
  Binary, Database, Cpu, Search, LayoutGrid, Info, RefreshCw, Calculator, Map, MapPin, ArrowRight
} from "lucide-react";

interface Step {
  mask: number;
  lastCity: number;
  cost: number;
  message: string;
  phase: "START" | "CHECK" | "VISIT" | "COMPLETE";
  logic: {
    title: string;
    calculation: string;
    explanation: string;
  };
  path: number[];
}

export default function BitmaskDPVisualizer({ speed = 800 }: { speed?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const cities = 4;
  const cityNames = ["A", "B", "C", "D"];
  
  // Hardcoded distances for clear visualization
  const dist = [
    [0, 10, 15, 20],
    [10, 0, 35, 25],
    [15, 35, 0, 30],
    [20, 25, 30, 0]
  ];

  const history = useMemo(() => {
    const steps: Step[] = [];
    
    const record = (msg: string, m: number, last: number, c: number, ph: Step["phase"], log: Step["logic"], path: number[]) => {
      steps.push({ mask: m, lastCity: last, cost: c, message: msg, phase: ph, logic: log, path: [...path] });
    };

    // TSP Simulation path: A -> C -> B -> D
    // A: 0, B: 1, C: 2, D: 3
    
    // Step 0: Start at City A (idx 0)
    let curMask = 1 << 0; // 0001
    let curCost = 0;
    const curPath = [0];
    record(
        "Starting at City A. Distance covered is 0.", 
        curMask, 0, curCost, "START",
        { title: "Initialization", calculation: "mask = 1 << 0", explanation: "Bit 0 is ON (0001). City A is visited." },
        curPath
    );

    // Transition to City C (idx 2)
    record(
        "Checking City C. Is bit 2 already ON in mask 0001?", 
        curMask, 0, curCost, "CHECK",
        { title: "Bitwise Check", calculation: "(0001 >> 2) & 1 == 0", explanation: "Bit 2 is OFF. City C is NOT visited yet." },
        curPath
    );

    curMask |= (1 << 2); // 0101
    curCost += dist[0][2]; // 15
    curPath.push(2);
    record(
        "Visiting City C. Distance A \u2192 C is 15.", 
        curMask, 2, curCost, "VISIT",
        { title: "Bitwise Update", calculation: "mask | (1 << 2)", explanation: "Bit 2 is now ON (0101). City C marked as visited." },
        curPath
    );

    // Transition to City B (idx 1)
    record(
        "Checking City B. Is bit 1 already ON in mask 0101?", 
        curMask, 2, curCost, "CHECK",
        { title: "Bitwise Check", calculation: "(0101 >> 1) & 1 == 0", explanation: "Bit 1 is OFF. City B is available." },
        curPath
    );

    curMask |= (1 << 1); // 0111
    curCost += dist[2][1]; // 35
    curPath.push(1);
    record(
        "Visiting City B. Distance C \u2192 B is 35.", 
        curMask, 1, curCost, "VISIT",
        { title: "Bitwise Update", calculation: "mask | (1 << 1)", explanation: "Bit 1 is now ON (0111). City B marked as visited." },
        curPath
    );

    // Transition to City D (idx 3)
    record(
        "Checking City D. Is bit 3 already ON in mask 0111?", 
        curMask, 1, curCost, "CHECK",
        { title: "Bitwise Check", calculation: "(0111 >> 3) & 1 == 0", explanation: "Bit 3 is OFF. City D is available." },
        curPath
    );

    curMask |= (1 << 3); // 1111
    curCost += dist[1][3]; // 25
    curPath.push(3);
    record(
        "Visiting City D. Distance B \u2192 D is 25.", 
        curMask, 3, curCost, "VISIT",
        { title: "Bitwise Update", calculation: "mask | (1 << 3)", explanation: "Bit 3 is now ON (1111). All cities visited!" },
        curPath
    );

    record(
        "TSP Path Complete. All bits are 1. Total shortest path cost found.", 
        curMask, 3, curCost, "COMPLETE",
        { title: "Base Case Reached", calculation: "mask == (1 << 4) - 1", explanation: "The mask 1111 represents the complete set." },
        curPath
    );

    return steps;
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const t = setInterval(() => {
        setCurrentIndex(p => {
          if (p >= history.length - 1) { setIsPlaying(false); return p; }
          return p + 1;
        });
      }, speed);
      return () => clearInterval(t);
    }
  }, [isPlaying, history.length, speed]);

  const step = history[currentIndex] || history[0];

  return (
    <div className="flex flex-col gap-6 font-sans select-none">
      <div className="p-4 md:p-8 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col min-h-[750px]">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        {/* Header */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold flex items-center gap-3 text-[var(--viz-purple)]">
              <Map className="text-[var(--viz-purple)]" />
              TSP <span className="text-foreground/40 font-light">Bitmask DP</span>
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono italic">Shortest Hamiltonian Path Protocol</p>
          </div>

          <div className="flex items-center gap-3 bg-[var(--muted)] p-2 rounded-2xl border border-[var(--border)] shadow-inner">
            <button onClick={() => { setCurrentIndex(0); setIsPlaying(false); }} className="p-2 hover:bg-card rounded-xl text-muted-foreground transition-all"><RotateCcw size={18}/></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${isPlaying ? "bg-[var(--viz-rose)]/20 text-[var(--viz-rose)] border border-[var(--viz-rose)]/50" : "bg-[var(--viz-purple)] text-background hover:scale-105"}`}>
                {isPlaying ? "STOP" : "EXECUTE DP"}
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-[var(--muted)]/40 rounded-[2.5rem] border border-[var(--border)] shadow-inner flex flex-col p-6 md:p-8 gap-8 overflow-hidden">
            
            {/* Top Stats: Mask & Logic */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full z-30">
                {/* Logic Panel */}
                <motion.div 
                    key={currentIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-card/80 border-2 border-[var(--viz-purple)]/30 rounded-2xl shadow-xl backdrop-blur-md flex flex-col gap-3"
                >
                    <div className="flex items-center gap-2 text-[var(--viz-purple)] border-b border-border pb-2">
                        <Calculator size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{step.logic.title}</span>
                    </div>
                    <div className="space-y-3 font-mono">
                        <div className="space-y-1">
                            <span className="text-[9px] text-muted-foreground uppercase font-bold">Calculation</span>
                            <p className="text-xs font-bold text-[var(--viz-purple)]">{step.logic.calculation}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] text-muted-foreground uppercase font-bold">Logic</span>
                            <p className="text-[10px] text-foreground/80 leading-tight">{step.logic.explanation}</p>
                        </div>
                    </div>
                </motion.div>

                {/* State Card */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border shadow-md">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-muted-foreground uppercase mb-1">State: DP[mask][last]</span>
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-mono font-black text-[var(--viz-purple)]">[{step.mask}]</span>
                                <span className="text-muted-foreground/30 text-xl">/</span>
                                <span className="text-xl font-mono font-bold text-foreground">[{cityNames[step.lastCity]}]</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-muted-foreground uppercase mb-1">Total Cost</span>
                            <span className="text-2xl font-black text-[var(--viz-amber)] font-mono">{step.cost}</span>
                        </div>
                    </div>
                    
                    {/* Binary Meter */}
                    <div className="flex gap-2 justify-between px-2">
                        {Array.from({ length: cities }).map((_, i) => {
                            const isVisited = (step.mask >> i) & 1;
                            return (
                                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                    <motion.div 
                                        animate={{ 
                                            backgroundColor: isVisited ? "var(--viz-purple)" : "var(--card)",
                                            borderColor: isVisited ? "var(--viz-purple)" : "var(--border)",
                                            scale: isVisited ? 1.05 : 1
                                        }}
                                        className="w-full h-10 rounded-lg border-2 flex items-center justify-center font-mono text-sm font-black shadow-inner"
                                    >
                                        {isVisited ? "1" : "0"}
                                    </motion.div>
                                    <span className="text-[8px] font-bold text-muted-foreground/40">{cityNames[i]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Center: Map Visualization */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                    {/* Background paths */}
                    {dist.map((row, i) => row.map((d, j) => {
                        if (i >= j) return null;
                        return (
                            <line key={`${i}-${j}`} x1={`${20 + i * 20}%`} y1={`${20 + i * 15}%`} x2={`${20 + j * 20}%`} y2={`${20 + j * 15}%`} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
                        );
                    }))}
                </svg>
                
                {/* Active Path SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    {step.path.map((cityIdx, i) => {
                        if (i === 0) return null;
                        const prev = step.path[i-1];
                        return (
                            <motion.line
                                key={`path-${i}`}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                x1={`${20 + prev * 20}%`} y1={`${20 + prev * 15}%`} 
                                x2={`${20 + cityIdx * 20}%`} y2={`${20 + cityIdx * 15}%`}
                                stroke="var(--viz-purple)"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                        );
                    })}
                </svg>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-20 z-20">
                    {cityNames.map((name, i) => {
                        const isVisited = (step.mask >> i) & 1;
                        const isCurrent = step.lastCity === i;
                        return (
                            <motion.div
                                key={i}
                                animate={{ 
                                    scale: isCurrent ? 1.2 : 1,
                                    borderColor: isCurrent ? "var(--viz-purple)" : isVisited ? "var(--viz-purple)/40" : "var(--border)",
                                    opacity: isVisited ? 1 : 0.4
                                }}
                                className={`w-16 h-16 rounded-2xl border-2 bg-card flex flex-col items-center justify-center shadow-2xl relative`}
                            >
                                <MapPin size={20} className={isCurrent ? "text-[var(--viz-purple)]" : "text-muted-foreground"} />
                                <span className="text-xs font-black font-mono mt-1">City {name}</span>
                                {isCurrent && (
                                    <div className="absolute -top-8 bg-[var(--viz-purple)] text-background text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-bounce">Last</div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom: Narrative */}
            <div className="w-full flex justify-center z-30">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card/95 border-l-4 border-l-[var(--viz-purple)] p-4 rounded-2xl shadow-2xl max-w-2xl w-full text-center backdrop-blur-md"
                    >
                        <p className="text-xs md:text-sm font-bold text-foreground leading-relaxed">{step.message}</p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>

        {/* Controls */}
        <div className="mt-8 p-6 bg-[var(--muted)] border border-border rounded-3xl flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Binary size={16} className="text-[var(--viz-purple)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Step {currentIndex + 1} / {history.length}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-2 hover:bg-card rounded-xl text-muted-foreground transition-all"><ChevronLeft size={24} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-2 hover:bg-card rounded-xl text-muted-foreground transition-all"><ChevronRight size={24} /></button>
                </div>
            </div>
            
            <div className="relative flex items-center px-1">
                <div className="absolute left-1 right-1 h-1 bg-background/20 rounded-full" />
                <div className="absolute left-1 h-1 bg-[var(--viz-purple)] rounded-full transition-all duration-300" style={{ width: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 8px)` }} />
                <input 
                    type="range" min="0" max={history.length - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-8 opacity-0 cursor-pointer z-10"
                />
            </div>
        </div>
      </div>
    </div>
  );
}


