"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, ChevronLeft, ChevronRight, Zap, 
  ArrowDown, Activity, Cpu, TrendingUp, Hash
} from "lucide-react";

interface FibStep {
  dp: (number | null)[];
  message: string;
  step: string;
  currentIndex: number;
  dependencies: number[];
  logs: string[];
}

export default function FibonacciVisualizer({ speed = 800 }: { speed?: number }) {
  const [n, setN] = useState(10);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-compute Tabulation
  const history = useMemo(() => {
    const steps: FibStep[] = [];
    const dp = new Array(n + 1).fill(null);
    let logs: string[] = [];

    const record = (msg: string, step: string, curr: number, deps: number[]) => {
      steps.push({
        dp: [...dp],
        message: msg,
        step: step,
        currentIndex: curr,
        dependencies: deps,
        logs: [...logs]
      });
    };

    const addLog = (l: string) => { logs = [l, ...logs]; };

    addLog("Initializing DP tabulation structure.");
    record("Awaiting base case injection.", "BOOT", -1, []);

    // Base Cases
    dp[0] = 0;
    addLog("Base case injected: dp[0] = 0.");
    record("Committing primary base case to index 0.", "BASE_CASE", 0, []);

    if (n >= 1) {
        dp[1] = 1;
        addLog("Base case injected: dp[1] = 1.");
        record("Committing secondary base case to index 1.", "BASE_CASE", 1, []);
    }

    for (let i = 2; i <= n; i++) {
        addLog(`Synthesizing state dp[${i}].`);
        record(`Evaluating recurrence: dp[${i}] = dp[${i-1}] + dp[${i-2}].`, "SYNTHESIZE", i, [i-1, i-2]);
        dp[i] = (dp[i-1] as number) + (dp[i-2] as number);
        addLog(`Result resolved: ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}.`);
        record(`State stabilized at index ${i}. Value committed.`, "COMMIT", i, [i-1, i-2]);
    }

    addLog("Global resolution complete.");
    record(`Sequence fully stabilized. F(${n}) = ${dp[n]}.`, "COMPLETE", n, []);

    return steps;
  }, [n]);

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

  const currentStep = useMemo(() => {
    return history[currentIndex] || { 
        dp: new Array(n + 1).fill(null), 
        message: "Initializing...", 
        step: "IDLE", 
        currentIndex: -1, 
        dependencies: [], 
        logs: [] 
    };
  }, [history, currentIndex, n]);

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
            onClick={() => {
              setIsPlaying(false);
              setCurrentIndex(0);
            }}
            className="p-2.5 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw size={14} />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--muted)]/20 border border-[var(--border)]/40 rounded-xl">
            <span className="text-[9px] font-black font-mono text-[var(--muted-foreground)]/60 uppercase">Target (N)</span>
            <input 
              type="number" 
              value={n} 
              onChange={e => { 
                setN(Math.max(1, Math.min(15, parseInt(e.target.value) || 1))); 
                setCurrentIndex(0); 
                setIsPlaying(false); 
              }}
              className="w-10 bg-transparent text-center font-mono text-xs font-bold text-[var(--viz-cyan)] focus:outline-none"
            />
          </div>
        </div>

        {/* Tabulation Method Badge */}
        <div className="px-3 py-1.5 bg-[var(--muted)]/20 border border-[var(--border)]/40 rounded-xl text-[10px] font-mono text-[var(--muted-foreground)] font-bold tracking-tight">
          Bottom-Up Tabulation
        </div>
      </div>

      {/* Visual Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Visual Canvas (Tabulation Array) */}
        <div className="relative w-full min-h-[180px] md:min-h-[220px] h-auto bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-hidden shadow-inner flex items-center justify-center p-6 lg:col-span-3">
          <div className="absolute top-4 left-4 flex items-center gap-2 text-[var(--muted-foreground)]/40 z-20 pointer-events-none">
            <Cpu size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">DP Table</span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-8 justify-center items-center relative z-20 w-full py-4">
              {currentStep.dp.map((val, i) => {
                const isA = i === currentStep.currentIndex;
                const isD = currentStep.dependencies.includes(i);
                const isS = val !== null && !isA && !isD;

                let nodeBg = "transparent";
                let nodeBorder = "var(--border)";
                let valColor = "text-[var(--muted-foreground)]/20";

                if (isA) {
                  nodeBg = "rgba(var(--viz-cyan-rgb), 0.15)";
                  nodeBorder = "var(--viz-cyan)";
                  valColor = "text-[var(--viz-cyan)] font-black";
                } else if (isD) {
                  nodeBg = "rgba(var(--viz-amber-rgb), 0.15)";
                  nodeBorder = "var(--viz-amber)";
                  valColor = "text-[var(--viz-amber)] font-black";
                } else if (isS) {
                  nodeBg = "rgba(var(--viz-green-rgb), 0.1)";
                  nodeBorder = "var(--viz-green)";
                  valColor = "text-[var(--viz-green)] font-bold";
                }

                return (
                  <div key={i} className="flex flex-col items-center gap-2 relative">
                    <span className="text-[8px] font-black text-[var(--muted-foreground)]/40 uppercase tracking-widest">idx {i}</span>
                    <motion.div
                      layout
                      animate={{ 
                        scale: isA ? 1.15 : isD ? 1.08 : 1,
                        backgroundColor: nodeBg,
                        borderColor: nodeBorder,
                      }}
                      transition={{ type: "spring", stiffness: 150, damping: 25 }}
                      className="w-12 h-12 border-2 rounded-xl flex items-center justify-center font-mono shadow-sm relative transition-colors duration-200"
                    >
                      <span className={`text-sm ${valColor}`}>
                        {val !== null ? val : "?"}
                      </span>
                      {isA && (
                        <motion.div layoutId="ptr" className="absolute -top-7 animate-bounce">
                          <ArrowDown size={14} className="text-[var(--viz-cyan)]" />
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Synthesis Log */}
          <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col h-[180px] shadow-sm">
            <h3 className="text-[9px] font-black uppercase text-[var(--muted-foreground)]/50 tracking-widest flex items-center gap-2 mb-3">
              <Activity size={14} className="text-[var(--viz-cyan)]" /> Log Stream
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
              {currentStep.logs.length === 0 && (
                <span className="text-[9px] italic text-[var(--muted-foreground)]/30 text-center py-8">Idle...</span>
              )}
            </div>
          </div>

          {/* Recurrence Property */}
          <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm flex flex-col gap-3">
            <h3 className="text-[9px] font-black uppercase text-[var(--muted-foreground)]/50 tracking-widest flex items-center gap-2">
              <Cpu size={14} className="text-[var(--viz-cyan)]" /> State Transition
            </h3>
            <div className="p-3 bg-[var(--muted)]/20 border border-[var(--border)] rounded-xl font-mono text-xs text-[var(--viz-cyan)] font-bold shadow-inner text-center">
              dp[i] = dp[i-1] + dp[i-2]
            </div>
          </div>
        </div>

      </div>

      {/* Message Box */}
      <div className="w-full px-4 py-2.5 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center shadow-sm">
        <p className="text-xs text-[var(--viz-cyan)] font-mono font-bold tracking-tight">
          {currentStep.message}
        </p>
      </div>

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
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Active State</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-amber)]" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Sum Dependency</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)]" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Stabilized DP</span>
        </div>
      </div>
    </div>
  );
}
