"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, ChevronLeft, ChevronRight, Zap, 
  ShoppingBag, Database, Trophy, Gem, Crown, Smartphone, Laptop, Cpu, Plus, Activity, Hash
} from "lucide-react";

const ITEMS = [
  { id: 1, name: "Gem", w: 1, v: 10, icon: Gem, color: "#EC4899" },
  { id: 2, name: "Crown", w: 2, v: 25, icon: Crown, color: "var(--viz-amber)" },
  { id: 3, name: "Phone", w: 3, v: 40, icon: Smartphone, color: "#3B82F6" },
  { id: 4, name: "Laptop", w: 4, v: 60, icon: Laptop, color: "#A855F7" },
];
const CAPACITY = 6;
const INF = 99;

interface DPStep {
  dp: number[][];
  itemIdx: number; 
  weight: number;  
  message: string;
  step: string;
  activeLine: number; 
  decision: "INCLUDE" | "EXCLUDE" | "NONE";
  dependencies: [number, number][]; 
  logs: string[];
}

export default function KnapsackVisualizer({ speed = 800 }: { speed?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const history = useMemo(() => {
    const n = ITEMS.length;
    const W = CAPACITY;
    const steps: DPStep[] = [];
    const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
    let logs: string[] = [];

    const record = (msg: string, step: string, i: number, w: number, line: number, dec: DPStep['decision'], deps: [number, number][]) => {
      steps.push({
        dp: dp.map(r => [...r]),
        itemIdx: i,
        weight: w,
        message: msg,
        step: step,
        activeLine: line,
        decision: dec,
        dependencies: deps,
        logs: [...logs]
      });
    };

    const addLog = (l: string) => { logs = [l, ...logs]; };

    addLog("Initializing DP Table (Capacity 0-6kg).");
    record("Initializing DP table. Row 0 represents 0 items.", "INIT", 0, 0, 0, "NONE", []);

    for (let i = 1; i <= n; i++) {
      const item = ITEMS[i - 1];
      for (let w = 0; w <= W; w++) {
        addLog(`Evaluating Item ${i} (${item.name}) @ Capacity ${w}kg.`);
        record(`Checking if '${item.name}' (Weight: ${item.w}kg) fits in ${w}kg capacity...`, "EVALUATE", i, w, 1, "NONE", []);

        const excludeVal = dp[i - 1][w];
        
        if (item.w <= w) {
          const includeVal = item.v + dp[i - 1][w - item.w];
          record(`Comparing: Exclude (${excludeVal}) vs Include (${includeVal}).`, "COMPARE", i, w, 3, "NONE", [[i-1, w], [i-1, w - item.w]]);

          if (includeVal > excludeVal) {
            dp[i][w] = includeVal;
            addLog(`Include > Exclude. New Max: ${includeVal}.`);
            record(`Taking '${item.name}' yields higher value. Updating state.`, "COMMIT_INCLUDE", i, w, 3, "INCLUDE", [[i-1, w - item.w]]);
          } else {
            dp[i][w] = excludeVal;
            addLog(`Exclude >= Include. Keeping: ${excludeVal}.`);
            record(`Skipping '${item.name}' is better/equal. Inheriting previous state.`, "COMMIT_EXCLUDE", i, w, 3, "EXCLUDE", [[i-1, w]]);
          }
        } else {
          dp[i][w] = excludeVal;
          addLog(`Item too heavy (${item.w}kg > ${w}kg). Skipping.`);
          record(`Item weight ${item.w}kg exceeds capacity ${w}kg. Cannot include.`, "WEIGHT_OVERFLOW", i, w, 2, "EXCLUDE", [[i-1, w]]);
        }
      }
    }

    addLog(`Optimal Value Found: ${dp[n][W]}.`);
    record(`DP Complete. Max value is ${dp[n][W]}.`, "COMPLETE", n, W, -1, "NONE", []);

    return steps;
  }, []);

  // --- Playback Engine ---
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
    dp: Array.from({ length: ITEMS.length + 1 }, () => new Array(CAPACITY + 1).fill(0)),
    itemIdx: 0,
    weight: 0,
    message: "Initializing Protocol...",
    step: "BOOT",
    activeLine: 0,
    decision: "NONE",
    dependencies: [],
    logs: []
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
            onClick={() => {
              setIsPlaying(false);
              setCurrentIndex(0);
            }}
            className="p-2.5 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Method Badge */}
        <div className="px-3 py-1.5 bg-[var(--muted)]/20 border border-[var(--border)]/40 rounded-xl text-[10px] font-mono text-[var(--muted-foreground)] font-bold tracking-tight">
          0/1 Knapsack DP
        </div>
      </div>

      {/* Visual Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* DP Table Card */}
        <div className="col-span-1 lg:col-span-8 order-1 lg:order-1 relative p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm flex flex-col items-center">
          <div className="relative z-10 w-full overflow-x-auto pb-2 custom-scrollbar">
            <div className="min-w-fit flex flex-col items-start mx-auto p-2">
              {/* Column Headers (Capacity) */}
              <div className="flex mb-2">
                <div className="w-24" /> 
                {Array.from({ length: CAPACITY + 1 }).map((_, c) => (
                  <div key={`col-${c}`} className={`w-10 h-8 flex items-center justify-center font-mono text-[10px] font-black uppercase tracking-tight transition-colors ${currentStep.weight === c ? "text-[var(--viz-amber)]" : "text-[var(--muted-foreground)]/30"}`}>
                    {c}kg
                  </div>
                ))}
              </div>

              {/* Rows */}
              {currentStep.dp.map((row, r) => (
                <div key={`row-${r}`} className="flex mb-1">
                  {/* Row Header (Items) */}
                  <div className={`w-24 h-10 flex items-center justify-start gap-1.5 font-mono text-[9px] font-bold uppercase tracking-tight transition-colors px-2 border-r border-[var(--border)]/40 ${currentStep.itemIdx === r ? "text-[var(--viz-cyan)] bg-[var(--viz-cyan)]/5" : "text-[var(--muted-foreground)]/40"}`}>
                    {r === 0 ? "Empty (0)" : (
                      <div className="flex flex-col leading-none">
                        <span className="truncate max-w-[80px]">{ITEMS[r-1].name}</span>
                        <span className="text-[7.5px] opacity-60 mt-0.5">{ITEMS[r-1].w}k|${ITEMS[r-1].v}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Cells */}
                  {row.map((val, c) => {
                    const isCurrent = r === currentStep.itemIdx && c === currentStep.weight;
                    const depIndex = currentStep.dependencies.findIndex(([dr, dc]) => dr === r && dc === c);
                    const isExcludeDep = depIndex === 0;
                    const isIncludeDep = depIndex === 1;

                    let cellBg = "transparent";
                    let cellBorder = "var(--border)";
                    let valColor = "text-[var(--muted-foreground)]/80";

                    if (isCurrent) {
                      cellBg = "rgba(var(--viz-cyan-rgb), 0.15)";
                      cellBorder = "var(--viz-cyan)";
                      valColor = "text-[var(--viz-cyan)] font-black";
                    } else if (isExcludeDep) {
                      cellBg = "rgba(var(--viz-rose-rgb), 0.15)";
                      cellBorder = "var(--viz-rose)";
                      valColor = "text-[var(--viz-rose)] font-black";
                    } else if (isIncludeDep) {
                      cellBg = "rgba(var(--viz-green-rgb), 0.15)";
                      cellBorder = "var(--viz-green)";
                      valColor = "text-[var(--viz-green)] font-black";
                    }

                    return (
                      <div key={`${r}-${c}`} className="w-10 h-10 flex items-center justify-center relative">
                        <motion.div
                          initial={false}
                          animate={{ 
                            scale: isCurrent ? 1.1 : 1,
                            backgroundColor: cellBg,
                            borderColor: cellBorder,
                            opacity: (r > currentStep.itemIdx || (r === currentStep.itemIdx && c > currentStep.weight)) ? 0.35 : 1
                          }}
                          className="w-9 h-9 border rounded-lg flex items-center justify-center text-xs font-mono font-bold shadow-sm z-10 transition-colors duration-200"
                        >
                          <span className={valColor}>{val}</span>
                        </motion.div>
                        
                        {isCurrent && currentStep.decision !== 'NONE' && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1.3 }}
                            exit={{ opacity: 0 }}
                            className="absolute -top-3.5 text-[7px] font-black text-[var(--viz-amber)] z-20 bg-[var(--card)] px-1 rounded border border-[var(--border)]/35"
                          >
                            {currentStep.decision === 'INCLUDE' ? 'INC' : 'EXC'}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Decisions Comparison Details */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[500px]">
            <div className={`p-3 rounded-xl border transition-all ${currentStep.decision === "EXCLUDE" ? "bg-[var(--viz-rose)]/10 border-[var(--viz-rose)]/40" : "bg-[var(--muted)]/5 border-[var(--border)]/30 opacity-40"}`}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-black uppercase text-[var(--viz-rose)] tracking-widest flex items-center gap-1.5">
                  Exclude Value
                </span>
                {currentStep.decision === "EXCLUDE" && <Trophy size={12} className="text-[var(--viz-rose)]" />}
              </div>
              <div className="text-[10px] font-mono text-[var(--muted-foreground)]/80 space-y-1">
                <div className="flex items-center justify-between bg-[var(--card)] border border-[var(--border)] shadow-sm p-1.5 rounded">
                  <span>DP[{currentStep.itemIdx-1}][{currentStep.weight}]</span>
                  <span className="text-[var(--viz-rose)] font-bold text-xs">
                    {currentStep.itemIdx > 0 ? currentStep.dp[currentStep.itemIdx-1][currentStep.weight] : 0}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={`p-3 rounded-xl border transition-all ${currentStep.decision === "INCLUDE" ? "bg-[var(--viz-green)]/10 border-[var(--viz-green)]/40" : "bg-[var(--muted)]/5 border-[var(--border)]/30 opacity-40"}`}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-black uppercase text-[var(--viz-green)] tracking-widest flex items-center gap-1.5">
                  Include Value
                </span>
                {currentStep.decision === "INCLUDE" && <Trophy size={12} className="text-[var(--viz-green)]" />}
              </div>
              <div className="text-[10px] font-mono text-[var(--muted-foreground)]/80 space-y-1">
                <div className="flex items-center justify-between bg-[var(--card)] border border-[var(--border)] shadow-sm p-1.5 rounded">
                  <span className="truncate max-w-[130px]">
                    Val + DP[{currentStep.itemIdx-1}][{Math.max(0, currentStep.weight - (currentStep.itemIdx > 0 ? ITEMS[currentStep.itemIdx-1].w : 0))}]
                  </span>
                  <span className="text-[var(--viz-green)] font-bold text-xs">
                    {currentStep.itemIdx > 0 && ITEMS[currentStep.itemIdx-1].w <= currentStep.weight 
                      ? ITEMS[currentStep.itemIdx-1].v + currentStep.dp[currentStep.itemIdx-1][currentStep.weight - ITEMS[currentStep.itemIdx-1].w] 
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6 order-2 lg:order-2">
          {/* Active Item Card */}
          <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm">
            <h3 className="text-[9px] font-black uppercase text-[var(--muted-foreground)]/50 tracking-widest flex items-center gap-2 mb-3">
              <ShoppingBag size={14} className="text-[var(--viz-cyan)]" /> Active Item
            </h3>
            <AnimatePresence mode="wait">
              {currentStep.itemIdx > 0 ? (
                <motion.div 
                  key={currentStep.itemIdx} 
                  initial={{ opacity: 0, x: 10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -10 }} 
                  className="flex items-center gap-4 p-3 bg-[var(--muted)]/20 border border-[var(--border)]/40 rounded-xl shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--card)] flex items-center justify-center border border-[var(--border)]/40 shadow-inner">
                    {React.createElement(ITEMS[currentStep.itemIdx - 1].icon, { size: 20, style: { color: ITEMS[currentStep.itemIdx - 1].color } })}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black uppercase tracking-tight">{ITEMS[currentStep.itemIdx - 1].name}</h4>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[9px] font-mono bg-[var(--viz-cyan)]/10 text-[var(--viz-cyan)] px-1.5 py-0.5 rounded">
                        {ITEMS[currentStep.itemIdx-1].w}kg
                      </span>
                      <span className="text-[9px] font-mono bg-[var(--viz-green)]/10 text-[var(--viz-green)] px-1.5 py-0.5 rounded">
                        ${ITEMS[currentStep.itemIdx-1].v}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-16 flex items-center justify-center text-[10px] italic text-[var(--muted-foreground)]/30 border border-dashed border-[var(--border)] rounded-xl">
                  Initialization...
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Logic Flow Card */}
          <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm flex flex-col gap-3">
            <h3 className="text-[9px] font-black uppercase text-[var(--muted-foreground)]/50 tracking-widest flex items-center gap-2">
              <Cpu size={14} className="text-[var(--viz-cyan)]" /> Logic Core
            </h3>
            <div className="space-y-1.5 font-mono text-[9px]">
              <div className={`p-2 rounded-lg border transition-all ${currentStep.activeLine === 1 ? "bg-[var(--viz-cyan)]/10 border-[var(--viz-cyan)] text-[var(--viz-cyan)]" : "border-transparent text-[var(--muted-foreground)]/40"}`}>
                1. Check weight: Item.w &le; Capacity?
              </div>
              <div className={`p-2 rounded-lg border transition-all ${currentStep.activeLine === 2 ? "bg-[var(--viz-rose)]/10 border-[var(--viz-rose)] text-[var(--viz-rose)]" : "border-transparent text-[var(--muted-foreground)]/40"}`}>
                2. Overflow: Keep previous max
              </div>
              <div className={`p-2 rounded-lg border transition-all ${currentStep.activeLine === 3 ? "bg-[var(--viz-green)]/10 border-[var(--viz-green)] text-[var(--viz-green)]" : "border-transparent text-[var(--muted-foreground)]/40"}`}>
                3. Fit: Max(Include, Exclude)
              </div>
            </div>
          </div>

          {/* Log Stream Card */}
          <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex-col h-[180px] flex shadow-sm">
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
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Current Cell</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)]" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Include Path</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-rose)]" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Exclude Path</span>
        </div>
      </div>
    </div>
  );
}
