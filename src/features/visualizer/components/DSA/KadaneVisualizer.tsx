"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, 
  ChevronRight, ChevronLeft, Cpu, Zap, TrendingUp, Activity
} from "lucide-react";

const ARRAY_SIZE = 12;

interface KadaneStep {
  array: number[];
  currentIndex: number;
  currentSum: number;
  maxSum: number;
  subarrayRange: [number, number]; // [start, end]
  bestRange: [number, number];     // [start, end]
  explanation: string;
  stepType: "INIT" | "ADD" | "RESET" | "UPDATE_MAX" | "COMPLETE";
  logs: string[];
}

export default function KadaneVisualizer({ speed = 800 }: { speed?: number }) {
  const [initialData, setInitialData] = useState<number[]>(() => {
    const size = typeof window !== 'undefined' && window.innerWidth < 768 ? 7 : ARRAY_SIZE;
    const arr = Array.from({ length: size }, () => 
      Math.floor(Math.random() * 30) - 12
    );
    if (!arr.some(n => n < 0)) arr[Math.floor(Math.random() * size)] = -15;
    if (!arr.some(n => n > 0)) arr[Math.floor(Math.random() * size)] = 10;
    return arr;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateArray = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    const size = typeof window !== 'undefined' && window.innerWidth < 768 ? 7 : ARRAY_SIZE;
    const arr = Array.from({ length: size }, () => 
      Math.floor(Math.random() * 30) - 12
    );
    if (!arr.some(n => n < 0)) arr[Math.floor(Math.random() * size)] = -15;
    if (!arr.some(n => n > 0)) arr[Math.floor(Math.random() * size)] = 10;
    setInitialData(arr);
  };

  const history = useMemo(() => {
    if (initialData.length === 0) return [];

    const steps: KadaneStep[] = [];
    let currentLogs: string[] = [];
    
    const record = (
      msg: string, 
      type: KadaneStep["stepType"], 
      idx: number, 
      currS: number, 
      maxS: number, 
      range: [number, number], 
      bestR: [number, number]
    ) => {
      currentLogs = [msg, ...currentLogs].slice(0, 10);
      steps.push({
        array: [...initialData],
        currentIndex: idx,
        currentSum: currS,
        maxSum: maxS,
        subarrayRange: range,
        bestRange: bestR,
        explanation: msg,
        stepType: type,
        logs: [...currentLogs]
      });
    };

    let maxSoFar = -Infinity;
    let currentMax = 0;
    let s = 0;
    let bestStart = 0, bestEnd = 0;

    record("Optimal subarray search initiated.", "INIT", -1, 0, 0, [0, -1], [0, -1]);

    for (let i = 0; i < initialData.length; i++) {
      const val = initialData[i];
      currentMax += val;
      
      record(
        `Processing index ${i} (${val > 0 ? '+' : ''}${val}). Local potential sum is now ${currentMax}.`, 
        "ADD", i, currentMax, maxSoFar === -Infinity ? 0 : maxSoFar, [s, i], [bestStart, bestEnd]
      );

      if (currentMax > maxSoFar) {
        maxSoFar = currentMax;
        bestStart = s;
        bestEnd = i;
        record(
          `New global maximum found: ${maxSoFar}. Updating optimal range boundaries [${bestStart}, ${bestEnd}].`, 
          "UPDATE_MAX", i, currentMax, maxSoFar, [s, i], [bestStart, bestEnd]
        );
      }

      if (currentMax < 0) {
        record(
          `Local potential collapsed to ${currentMax} (< 0). Resetting starting index to ${i + 1}.`, 
          "RESET", i, currentMax, maxSoFar, [s, i], [bestStart, bestEnd]
        );
        currentMax = 0;
        s = i + 1;
      }
    }

    record("Search completed. Optimal subarray boundaries finalized.", "COMPLETE", initialData.length - 1, 0, maxSoFar, [bestStart, bestEnd], [bestStart, bestEnd]);
    return steps;
  }, [initialData]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= history.length - 1) { setIsPlaying(false); return prev; }
          return prev + 1;
        });
      }, speed);
    } else if (timerRef.current) { clearInterval(timerRef.current); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, history.length, speed]);

  const currentStep = history[currentIndex] || { 
    array: initialData, 
    currentIndex: -1, 
    currentSum: 0, 
    maxSum: 0, 
    subarrayRange: [0, -1], 
    bestRange: [0, -1], 
    explanation: "Waiting for structure...", 
    stepType: "INIT",
    logs: [] 
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (currentIndex >= history.length - 1) setCurrentIndex(0);
              setIsPlaying(!isPlaying);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--viz-cyan)] hover:bg-[var(--viz-cyan)]/80 text-black rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause size={14} fill="currentColor" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={generateArray}
            className="p-2.5 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer"
            title="Randomize Array"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Canvas */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="relative w-full h-[150px] md:h-[200px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-hidden shadow-inner flex items-center justify-center p-4">
            {/* Grid backdrop */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

            {/* Floating stats inside Canvas */}
            <div className="absolute top-3 left-4 flex flex-col gap-0.5 z-30 font-mono">
              <span className="text-[var(--muted-foreground)]/50 uppercase tracking-widest text-[7px] font-bold">Current Sum</span>
              <span className="text-sm font-black text-[var(--viz-cyan)]">{currentStep.currentSum}</span>
            </div>

            <div className="absolute top-3 right-4 flex flex-col gap-0.5 z-30 font-mono items-end">
              <span className="text-[var(--muted-foreground)]/50 uppercase tracking-widest text-[7px] font-bold">Max Sum</span>
              <span className="text-sm font-black text-[var(--viz-green)]">{currentStep.maxSum}</span>
            </div>

            {/* Array Wrapper */}
            <div className="w-full overflow-x-auto pb-2 custom-scrollbar flex justify-start md:justify-center relative z-20">
              <div className="flex gap-2 p-4 min-w-max items-center mt-4">
                {currentStep.array.map((val, idx) => {
                  const isInCurrentRange = idx >= currentStep.subarrayRange[0] && idx <= currentStep.subarrayRange[1];
                  const isInBestRange = idx >= currentStep.bestRange[0] && idx <= currentStep.bestRange[1];
                  const isCurrentPointer = idx === currentStep.currentIndex;

                  let nodeBg = "var(--card)";
                  let nodeBorder = "var(--border)";
                  let valColor = "text-[var(--foreground)]";
                  let shadowColor = "none";

                  if (isCurrentPointer) {
                    nodeBg = "rgba(var(--viz-amber-rgb), 0.15)";
                    nodeBorder = "var(--viz-amber)";
                    valColor = "text-[var(--viz-amber)] font-black";
                    shadowColor = "0 0 20px rgba(var(--viz-gold-rgb), 0.2)";
                  } else if (isInBestRange) {
                    nodeBg = "rgba(var(--viz-green-rgb), 0.15)";
                    nodeBorder = "var(--viz-green)";
                    valColor = "text-[var(--viz-green)] font-bold";
                  } else if (isInCurrentRange) {
                    nodeBg = "rgba(var(--viz-cyan-rgb), 0.08)";
                    nodeBorder = "rgba(var(--viz-cyan-rgb), 0.4)";
                  }

                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5 relative">
                      <span className="text-[8px] font-mono font-bold text-[var(--muted-foreground)]/30">idx {idx}</span>
                      <motion.div
                        layout
                        initial={false}
                        animate={{
                          scale: isCurrentPointer ? 1.12 : 1,
                          backgroundColor: nodeBg,
                          borderColor: nodeBorder,
                          boxShadow: shadowColor,
                        }}
                        transition={{ type: "spring", stiffness: 150, damping: 25 }}
                        className="w-9 h-11 border rounded-xl flex items-center justify-center font-mono text-xs font-bold relative transition-colors duration-200"
                      >
                        <span className={valColor}>{val}</span>

                        {/* Subarray overlay box */}
                        {isInCurrentRange && (
                          <motion.div layoutId="range-box" className="absolute -inset-1 border border-dashed border-[var(--viz-cyan)]/40 rounded-lg pointer-events-none" />
                        )}
                      </motion.div>

                      {/* Pointer marker */}
                      <div className="h-4 flex items-center justify-center mt-1">
                        <AnimatePresence>
                          {isCurrentPointer && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0 }}
                            >
                              <TrendingUp size={12} className="text-[var(--viz-amber)]" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Cards (Hidden on mobile for single-screen view) */}
        <div className="hidden lg:flex flex-col gap-4">
          {/* Metrics Card */}
          <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col justify-center gap-3.5 shadow-sm">
            <h3 className="text-[9px] font-black uppercase text-[var(--muted-foreground)]/50 tracking-widest flex items-center gap-2">
              <Cpu size={12}/> DP Metrics
            </h3>
            <div className="space-y-3 font-mono">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[8px] font-black uppercase text-[var(--muted-foreground)]/50 tracking-wider">
                  <span>Current Sum</span>
                  <span className="text-[var(--viz-cyan)]">DP[i]</span>
                </div>
                <div className="px-3 py-1.5 bg-[var(--muted)]/10 border border-[var(--border)] rounded-lg text-sm font-bold text-[var(--viz-cyan)] text-right">
                  {currentStep.currentSum}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[8px] font-black uppercase text-[var(--muted-foreground)]/50 tracking-wider">
                  <span>Max So Far</span>
                  <span className="text-[var(--viz-green)]">Result</span>
                </div>
                <div className="px-3 py-1.5 bg-[var(--muted)]/10 border border-[var(--border)] rounded-lg text-sm font-bold text-[var(--viz-green)] text-right">
                  {currentStep.maxSum}
                </div>
              </div>
            </div>
          </div>

          {/* Log Stream Card */}
          {currentStep.logs.length > 0 && (
            <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col h-[130px] shadow-sm">
              <h3 className="text-[9px] font-black uppercase text-[var(--muted-foreground)]/50 tracking-widest flex items-center gap-2 mb-2.5">
                <Activity size={14} className="text-[var(--viz-cyan)]" /> Simulation Log
              </h3>
              <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 custom-scrollbar flex-1 text-xs font-mono">
                <AnimatePresence mode="popLayout">
                  {currentStep.logs.slice(0, 3).map((log, i) => (
                    <motion.div
                      key={`log-${currentIndex}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[10px] text-[var(--muted-foreground)]/80 leading-relaxed pl-2 border-l-2 border-[var(--border)] flex gap-1.5"
                    >
                      <span className="text-[var(--viz-cyan)] font-black">»</span>
                      {log}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Box */}
      <div className="w-full px-4 py-2 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center shadow-sm">
        <p className="text-xs text-[var(--viz-cyan)] font-mono font-bold tracking-tight">
          {currentStep.explanation}
        </p>
      </div>

      {/* Control Timeline Scrubber */}
      <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-[var(--viz-cyan)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
              Step {currentIndex + 1} of {history.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} 
              className="p-1.5 hover:bg-[var(--accent)] border border-[var(--border)]/40 rounded-lg text-[var(--muted-foreground)] transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} 
              className="p-1.5 hover:bg-[var(--accent)] border border-[var(--border)]/40 rounded-lg text-[var(--muted-foreground)] transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="relative flex items-center group/slider w-full h-4">
          <div className="absolute w-full h-1 bg-[var(--border)] rounded-full" />
          <div 
            className="absolute h-1 bg-[var(--viz-cyan)] rounded-full shadow-[0_0_10px_rgba(34,211,238,0.4)]" 
            style={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }} 
          />
          <input 
            type="range" 
            min="0" 
            max={history.length - 1} 
            value={currentIndex} 
            onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
            className="w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div 
            className="absolute w-2.5 h-2.5 bg-[var(--foreground)] rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] pointer-events-none group-hover/slider:scale-125 transition-transform"
            style={{ left: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 5px)` }}
          />
        </div>
      </div>

      {/* Legend Block */}
      <div className="px-4 py-2 bg-[var(--muted)]/20 border border-[var(--border)] rounded-2xl flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--viz-amber)]" />
          <span className="text-[8px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Active Probe</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--viz-cyan)]" />
          <span className="text-[8px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Current Chain</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--viz-green)]" />
          <span className="text-[8px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Max Subarray</span>
        </div>
      </div>
    </div>
  );
}
