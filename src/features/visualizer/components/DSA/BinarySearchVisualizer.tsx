"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, ChevronLeft, ChevronRight,
  Search, Hash, Activity, ArrowUp
} from "lucide-react";

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

    record("Array ready. Searching for target.", l, -1, r);

    while (l <= r) {
      const mid = Math.floor((l + r) / 2);
      
      if (data[mid] === target) {
        record(`Found! Target ${target} at index ${mid}.`, l, mid, r, true);
        break;
      }

      record(`Checking index ${mid} (value: ${data[mid]}).`, l, mid, r);

      if (data[mid] < target) {
        l = mid + 1;
        record(`${data[mid]} < ${target}. Moving low to ${l}.`, l, mid, r);
      } else {
        r = mid - 1;
        record(`${data[mid]} > ${target}. Moving high to ${r}.`, l, mid, r);
      }
    }

    if (!steps.find(s => s.found)) {
        record("Target not found in array.", l, -1, r);
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
    <div className="flex flex-col gap-6 w-full">
      {/* Header Toolbar */}
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
            onClick={resetSimulation}
            className="p-2.5 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer"
            title="Randomize Target"
          >
            <RotateCcw size={14} />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--muted)]/20 border border-[var(--border)]/40 rounded-xl font-mono text-[10px]">
            <span className="text-[9px] font-black text-[var(--muted-foreground)]/60 uppercase">Target</span>
            <span className="font-bold text-[var(--viz-cyan)]">{target}</span>
          </div>
        </div>

        {/* Method Badge */}
        <div className="px-3 py-1.5 bg-[var(--muted)]/20 border border-[var(--border)]/40 rounded-xl text-[10px] font-mono text-[var(--muted-foreground)] font-bold tracking-tight">
          Binary Search Algorithm
        </div>
      </div>

      {/* Visual Canvas (Horizontal Array) */}
      <div className="relative w-full h-[180px] md:h-[220px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-hidden shadow-inner flex items-center justify-center p-4">
        <div className="absolute top-4 left-4 flex items-center gap-2 text-[var(--muted-foreground)]/40 z-20 pointer-events-none">
          <Search size={14} />
          <span className="text-[9px] font-black uppercase tracking-widest">Sorted Array</span>
        </div>

        <div className="w-full overflow-x-auto pb-4 custom-scrollbar flex justify-start md:justify-center relative z-20">
          <div className="flex gap-3 p-4 min-w-max items-center mt-4">
            {data.map((val, idx) => {
              const isMid    = idx === currentStep.mid;
              const isFound  = isMid && currentStep.found;
              const isActive = idx >= currentStep.activeRange[0] && idx <= currentStep.activeRange[1];

              let nodeBg = "transparent";
              let nodeBorder = "var(--border)";
              let valColor = "text-[var(--muted-foreground)]/30";

              if (isFound) {
                nodeBg = "rgba(var(--viz-green-rgb), 0.15)";
                nodeBorder = "var(--viz-green)";
                valColor = "text-[var(--viz-green)] font-black";
              } else if (isMid) {
                nodeBg = "rgba(var(--viz-cyan-rgb), 0.15)";
                nodeBorder = "var(--viz-cyan)";
                valColor = "text-[var(--viz-cyan)] font-black";
              } else if (isActive) {
                nodeBg = "var(--card)";
                nodeBorder = "rgba(var(--viz-cyan-rgb), 0.35)";
                valColor = "text-[var(--foreground)] font-bold";
              }

              return (
                <div key={idx} className="flex flex-col items-center gap-2 relative">
                  <span className="text-[8px] font-black text-[var(--muted-foreground)]/40 uppercase tracking-widest">idx {idx}</span>
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isMid ? 1.15 : 1,
                      opacity: isActive ? 1 : 0.25,
                      backgroundColor: nodeBg,
                      borderColor: nodeBorder,
                    }}
                    transition={{ type: "spring", stiffness: 150, damping: 25 }}
                    className="w-11 h-11 border-2 rounded-xl flex items-center justify-center font-mono text-sm font-bold shadow-sm relative transition-colors duration-200"
                  >
                    <span className={valColor}>{val}</span>
                    {isMid && (
                      <motion.div layoutId="ptr" className="absolute -bottom-8 flex flex-col items-center">
                        <ArrowUp size={12} className="text-[var(--viz-cyan)]" />
                        <span className="text-[7px] font-black text-[var(--viz-cyan)] uppercase tracking-tighter">Mid</span>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Message Box */}
      <div className="w-full px-4 py-2.5 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center shadow-sm">
        <p className="text-xs text-[var(--viz-cyan)] font-mono font-bold tracking-tight uppercase">
          {currentStep.message}
        </p>
      </div>

      {/* Log Stream Card */}
      {currentStep.logs.length > 0 && (
        <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col h-[140px] shadow-sm">
          <h3 className="text-[9px] font-black uppercase text-[var(--muted-foreground)]/50 tracking-widest flex items-center gap-2 mb-3">
            <Activity size={14} className="text-[var(--viz-cyan)]" /> Search Log
          </h3>
          <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar flex-1 text-xs font-mono">
            <AnimatePresence mode="popLayout">
              {currentStep.logs.map((log, i) => (
                <motion.div
                  key={`log-${currentIndex}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[11px] text-[var(--muted-foreground)]/80 leading-relaxed pl-2 border-l-2 border-[var(--border)] flex gap-1.5"
                >
                  <span className="text-[var(--viz-cyan)] font-black">»</span>
                  {log}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Control Timeline */}
      <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
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

        <div className="relative flex items-center group/slider w-full h-6">
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
      <div className="px-4 py-4 bg-[var(--muted)]/20 border border-[var(--border)] rounded-2xl flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-cyan)]" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Mid Pointer</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)]" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Found</span>
        </div>
      </div>
    </div>
  );
}
