"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, ChevronLeft, ChevronRight, Zap, 
  Database, Calculator, Info, RefreshCw, Target, CheckCircle2, XCircle, BrainCircuit, ArrowRight
} from "lucide-react";

interface Step {
  idx: number;
  tight: boolean;
  digit: number | null;
  limit: number;
  currentNum: string;
  runningSum: number;
  targetSum: number;
  message: string;
  phase: "START" | "CHOOSING" | "RECURSE" | "VALIDATE";
  isFinalValid?: boolean;
  logicExplanation: {
    title: string;
    condition: string;
    result: string;
  };
}

export default function DigitDPVisualizer({ speed = 800 }: { speed?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [targetN, setTargetN] = useState("215");
  const [targetK, setTargetK] = useState(8);

  const randomize = useCallback(() => {
    const n = Math.floor(Math.random() * 400) + 100;
    const k = Math.floor(Math.random() * 15) + 5;
    setTargetN(n.toString());
    setTargetK(k);
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const history = useMemo(() => {
    const steps: Step[] = [];
    const digits = targetN.split("").map(Number);
    
    const record = (msg: string, i: number, t: boolean, d: number | null, lim: number, num: string, sum: number, phase: Step["phase"], logic: Step["logicExplanation"], valid?: boolean) => {
      steps.push({
        idx: i, tight: t, digit: d, limit: lim, currentNum: num,
        runningSum: sum, targetSum: targetK, message: msg, phase, isFinalValid: valid,
        logicExplanation: logic
      });
    };

    record(
        `Task: Count numbers \u2264 ${targetN} with digit sum = ${targetK}.`, 
        0, true, null, digits[0], "", 0, "START",
        { title: "Initialization", condition: "Starting at index 0", result: "Tight constraint is ON by default." }
    );

    let curTight: boolean = true;
    let curSum: number = 0;
    let s: string = "";

    for (let i: number = 0; i < digits.length; i++) {
        const limit: number = curTight ? digits[i] : 9;
        
        record(
            `Position ${i}: Calculating the limit for this digit.`, 
            i, curTight, null, limit, s, curSum, "CHOOSING",
            { 
                title: "Calculating Limit", 
                condition: curTight ? `Tight is ON, so limit = N[${i}] (${digits[i]})` : "Tight is OFF, so limit = 9",
                result: `We can pick any digit from 0 to ${limit}.`
            }
        );

        // Simulated path: Pick 1 -> Pick 4 -> Pick 3 for N=215, K=8
        let d: number = 0;
        if (i === 0) d = Math.min(limit, 1);
        else if (i === 1) d = Math.min(limit, 4);
        else d = Math.max(0, targetK - curSum);

        const nextTight: boolean = curTight && (d === limit);
        const tightBroken: boolean = curTight && !nextTight;

        s += d;
        curSum += d;
        
        record(
            `Digit ${d} selected. Updating state for next position.`, 
            i, curTight, d, limit, s, curSum, "RECURSE",
            { 
                title: "State Transition", 
                condition: tightBroken ? `Picked ${d} < ${limit} (Limit)` : `Picked ${d} == ${limit} (Limit)`,
                result: tightBroken ? "Tight flag turns OFF for next step." : "Tight flag stays ON."
            }
        );
        
        curTight = nextTight;
    }

    const isValid = curSum === targetK;
    record(
        `Final check: Does the sum ${curSum} equal target ${targetK}?`, 
        digits.length, curTight, null, 9, s, curSum, "VALIDATE", 
        { 
            title: "Validation", 
            condition: `Sum is ${curSum}, Target is ${targetK}`, 
            result: isValid ? "MATCH: This number is counted." : "NO MATCH: This path is ignored." 
        },
        isValid
    );

    return steps;
  }, [targetN, targetK]);

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
      <div className="p-4 md:p-8 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl relative overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar flex flex-col min-h-[350px] md:min-h-[750px] w-full">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        {/* Header */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold flex items-center gap-3 text-[var(--viz-amber)]">
              <BrainCircuit className="text-[var(--viz-amber)]" />
              Digit DP <span className="text-foreground/40 font-light">Logic Inspector</span>
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Count numbers \u2264 {targetN} | Sum = {targetK}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-[var(--muted)] p-2 rounded-2xl border border-[var(--border)] shadow-inner">
            <button onClick={randomize} className="p-2 hover:bg-[var(--accent)] rounded-xl text-[var(--viz-amber)] active:scale-95 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><RefreshCw size={14} /> New Problem</button>
            <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />
            <button onClick={() => { setCurrentIndex(0); setIsPlaying(false); }} className="p-2 hover:bg-[var(--accent)] rounded-xl text-muted-foreground transition-all"><RotateCcw size={18}/></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${isPlaying ? "bg-[var(--viz-rose)]/20 text-[var(--viz-rose)] border border-[var(--viz-rose)]/50" : "bg-[var(--viz-amber)] text-background hover:scale-105"}`}>
                {isPlaying ? "STOP" : "START LOGIC TRACE"}
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-[var(--muted)]/40 rounded-[2.5rem] border border-[var(--border)] shadow-inner flex flex-col p-6 md:p-8 gap-8 overflow-hidden">
            
            {/* Top Row: Logic Panel & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full z-30">
                {/* Logic Brain Panel */}
                <motion.div 
                    key={currentIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-card/80 border-2 border-[var(--viz-amber)]/30 rounded-2xl shadow-xl backdrop-blur-md flex flex-col gap-3"
                >
                    <div className="flex items-center gap-2 text-[var(--viz-amber)] border-b border-border pb-2">
                        <Calculator size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{step.logicExplanation.title}</span>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <span className="text-[9px] text-muted-foreground uppercase font-bold">Observation</span>
                            <p className="text-xs font-medium text-foreground">{step.logicExplanation.condition}</p>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--viz-amber)]">
                            <ArrowRight size={14} />
                            <div className="space-y-1">
                                <span className="text-[9px] text-[var(--viz-amber)]/60 uppercase font-bold">Resulting Decision</span>
                                <p className="text-xs font-bold">{step.logicExplanation.result}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Stats Card */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border shadow-md">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-muted-foreground uppercase mb-1">Running Digit Sum</span>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-mono font-black text-[var(--viz-amber)]">{step.runningSum}</span>
                                <span className="text-muted-foreground/30 text-xl">/</span>
                                <span className="text-xl font-mono text-muted-foreground">{targetK}</span>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-xl border-2 font-black text-[10px] uppercase tracking-tighter transition-all ${step.tight ? "bg-[var(--viz-rose)]/10 border-[var(--viz-rose)]/30 text-[var(--viz-rose)]" : "bg-green-500/10 border-green-500/30 text-green-500"}`}>
                            Tight: {step.tight ? "YES" : "NO"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Center: Visual Representation */}
            <div className="flex flex-col items-center justify-center flex-1 gap-12 w-full">
                {/* Target N Array */}
                <div className="flex flex-col items-center gap-4 w-full">
                    <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">Upper Bound (N)</span>
                    <div className="flex gap-4">
                        {targetN.split("").map((digit, i) => {
                            const isCurrent = i === step.idx;
                            const isDone = i < step.idx;
                            return (
                                <motion.div 
                                    key={i}
                                    animate={{ 
                                        borderColor: isCurrent ? "var(--viz-amber)" : "var(--border)",
                                        opacity: isDone ? 0.3 : 1,
                                        scale: isCurrent ? 1.1 : 1
                                    }}
                                    className="w-14 h-18 md:w-18 md:h-24 rounded-2xl border-2 bg-card flex flex-col items-center justify-center shadow-lg relative"
                                >
                                    <span className="text-3xl font-black font-mono">{digit}</span>
                                    <span className="text-[7px] text-muted-foreground uppercase absolute -bottom-4">Pos {i}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Construction Line */}
                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="h-[2px] w-48 bg-gradient-to-r from-transparent via-[var(--viz-amber)]/20 to-transparent" />
                    <span className="text-[9px] font-black text-[var(--viz-amber)]/60 uppercase tracking-[0.4em]">Current Choice Path</span>
                    <div className="flex gap-3 min-h-[350px] md:min-h-[60px] w-full items-center overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {step.currentNum.split("").map((digit, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, rotate: -10 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="w-10 h-14 bg-[var(--viz-amber)] text-background rounded-xl flex items-center justify-center text-2xl font-black font-mono shadow-xl"
                                >
                                    {digit}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Bottom: Message Box */}
            <div className="w-full flex justify-center z-30">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card/95 border-b-4 border-b-[var(--viz-amber)] p-4 rounded-2xl shadow-2xl max-w-2xl w-full text-center backdrop-blur-md relative"
                    >
                        <p className="text-xs md:text-sm font-bold text-foreground leading-relaxed">{step.message}</p>
                        
                        {step.phase === "VALIDATE" && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-6 -right-6">
                                {step.isFinalValid ? (
                                    <div className="bg-green-500 text-white p-3 rounded-full shadow-2xl ring-4 ring-green-500/20"><CheckCircle2 size={32} /></div>
                                ) : (
                                    <div className="bg-red-500 text-white p-3 rounded-full shadow-2xl ring-4 ring-red-500/20"><XCircle size={32} /></div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>

        {/* Playback Controls */}
        <div className="mt-8 p-3 md:p-6 bg-[var(--muted)] border border-border rounded-3xl flex flex-col gap-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--viz-amber)]/10 flex items-center justify-center text-[var(--viz-amber)] font-bold text-xs">{currentIndex + 1}</div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Execution Trace Timeline</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-2 hover:bg-card rounded-xl text-muted-foreground transition-all active:scale-90"><ChevronLeft size={24} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-2 hover:bg-card rounded-xl text-muted-foreground transition-all active:scale-90"><ChevronRight size={24} /></button>
                </div>
            </div>
            
            <div className="relative flex items-center px-1">
                <div className="absolute left-1 right-1 h-1.5 bg-background/20 rounded-full" />
                <div className="absolute left-1 h-1.5 bg-[var(--viz-amber)] rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(var(--viz-amber-rgb),0.4)]" style={{ width: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 8px)` }} />
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


