"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Gem, Crown, Smartphone, Laptop, ArrowRight, Check, X } from "lucide-react";

const ITEMS = [
  { id: 1, name: "Gem", w: 1, v: 10, icon: Gem, color: "text-pink-500", bg: "bg-pink-500/10" },
  { id: 2, name: "Crown", w: 2, v: 25, icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { id: 3, name: "Phone", w: 3, v: 40, icon: Smartphone, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: 4, name: "Laptop", w: 4, v: 60, icon: Laptop, color: "text-purple-500", bg: "bg-purple-500/10" },
];
const CAPACITY = 6;

type StepState = {
  row: number;
  col: number;
  phase: "CHECK" | "DECIDE" | "WRITE";
  decision?: "INCLUDE" | "EXCLUDE";
};

export default function KnapsackVisualizer({ speed = 1000 }: { speed?: number }) {
  const [dp, setDp] = useState<number[][]>([]);
  const [state, setState] = useState<StepState>({ row: 1, col: 0, phase: "CHECK" });
  const [isRunning, setIsRunning] = useState(false);
  const stopRef = useRef(false);

  // Initialize
  useEffect(() => {
    reset();
  }, []);

  const reset = () => {
    setDp(Array(ITEMS.length + 1).fill(0).map(() => Array(CAPACITY + 1).fill(0)));
    setState({ row: 1, col: 0, phase: "CHECK" });
    setIsRunning(false);
    stopRef.current = false;
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const runSimulation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    stopRef.current = false;

    // Use local DP for calculation reference to avoid async state issues
    let currentDp = Array(ITEMS.length + 1).fill(0).map(() => Array(CAPACITY + 1).fill(0));
    
    // Read current state from visual state to allow resume
    setDp(prev => {
        currentDp = prev.map(row => [...row]);
        return prev;
    });

    let r = state.row;
    let c = state.col;

    // If we finished, reset
    if (r > ITEMS.length) {
        reset();
        await sleep(100);
        r = 1; c = 0;
        currentDp = Array(ITEMS.length + 1).fill(0).map(() => Array(CAPACITY + 1).fill(0));
        setDp(currentDp);
    }

    while (r <= ITEMS.length) {
      if (stopRef.current) break;

      const item = ITEMS[r - 1];

      // Phase 1: Focus on Cell
      setState({ row: r, col: c, phase: "CHECK" });
      await sleep(speed);
      if (stopRef.current) break;

      // Phase 2: Decide
      let val = 0;
      let decision: "INCLUDE" | "EXCLUDE" = "EXCLUDE";
      
      const excludeVal = currentDp[r - 1][c];
      let includeVal = -1;

      if (item.w <= c) {
        includeVal = item.v + currentDp[r - 1][c - item.w];
        if (includeVal > excludeVal) {
          val = includeVal;
          decision = "INCLUDE";
        } else {
          val = excludeVal;
          decision = "EXCLUDE";
        }
      } else {
        val = excludeVal;
        decision = "EXCLUDE";
      }

      setState({ row: r, col: c, phase: "DECIDE", decision });
      await sleep(speed);
      if (stopRef.current) break;

      // Phase 3: Write
      currentDp[r][c] = val;
      setDp([...currentDp.map(row => [...row])]);
      setState({ row: r, col: c, phase: "WRITE", decision });
      await sleep(speed / 2);

      // Next Cell
      c++;
      if (c > CAPACITY) {
        c = 0;
        r++;
      }
    }

    setIsRunning(false);
  };

  const handleStop = () => {
    stopRef.current = true;
    setIsRunning(false);
  };

  // Helper to render current calculations
  const renderCalculation = () => {
    const { row, col, phase, decision } = state;
    if (row > ITEMS.length) return <div className="text-green-400 font-bold">Optimization Complete!</div>;

    const item = ITEMS[row - 1];
    if (!item) return null;

    const excludeVal = dp[row - 1]?.[col] ?? 0;
    const canInclude = item.w <= col;
    const includeVal = canInclude ? item.v + (dp[row - 1]?.[col - item.w] ?? 0) : 0;
    
    return (
      <div className="space-y-4 w-full">
         <div className="p-3 bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)]">
             <div className="text-[10px] uppercase font-bold text-[var(--foreground)]/40 mb-2">Analyzing Item</div>
             <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                     <item.icon size={20} />
                 </div>
                 <div>
                     <div className="font-bold text-sm text-[var(--foreground)]">{item.name}</div>
                     <div className="text-xs text-[var(--foreground)]/60">Weight: {item.w} | Value: ${item.v}</div>
                 </div>
             </div>
         </div>

         <div className="p-3 bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)]">
             <div className="text-[10px] uppercase font-bold text-[var(--foreground)]/40 mb-2">Current Capacity</div>
             <div className="flex items-center gap-2">
                 <div className="w-full bg-[var(--foreground)]/10 h-3 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(col / CAPACITY) * 100}%` }}
                        className="h-full bg-blue-500"
                     />
                 </div>
                 <span className="font-mono font-bold text-sm text-blue-400">{col}kg</span>
             </div>
         </div>

         <div className="grid grid-cols-2 gap-2 mt-4">
             {/* Exclude Option */}
             <motion.div 
                animate={{ opacity: phase === "DECIDE" && decision === "EXCLUDE" ? 1 : 0.5, scale: phase === "DECIDE" && decision === "EXCLUDE" ? 1.05 : 1 }}
                className={`p-3 rounded-xl border ${decision === "EXCLUDE" ? "border-red-500/50 bg-red-500/10" : "border-[var(--card-border)]"}`}
             >
                 <div className="text-[10px] uppercase font-bold text-red-400 mb-1">Exclude Item</div>
                 <div className="text-xs text-[var(--foreground)]/70 mb-1">Keep previous value</div>
                 <div className="font-mono text-lg font-bold text-[var(--foreground)]">
                    dp[{row-1}][{col}] = {excludeVal}
                 </div>
             </motion.div>

             {/* Include Option */}
             <motion.div 
                animate={{ opacity: phase === "DECIDE" && decision === "INCLUDE" ? 1 : 0.5, scale: phase === "DECIDE" && decision === "INCLUDE" ? 1.05 : 1 }}
                className={`p-3 rounded-xl border ${decision === "INCLUDE" ? "border-green-500/50 bg-green-500/10" : "border-[var(--card-border)]"}`}
             >
                 <div className="text-[10px] uppercase font-bold text-green-400 mb-1">Include Item</div>
                 {canInclude ? (
                     <>
                        <div className="text-xs text-[var(--foreground)]/70 mb-1">Value + Remaining Space</div>
                        <div className="font-mono text-[11px] font-bold text-[var(--foreground)] whitespace-nowrap">
                            {item.v} + dp[{row-1}][{col-item.w}] = {includeVal}
                        </div>
                     </>
                 ) : (
                     <div className="text-xs text-[var(--foreground)]/50 italic mt-2">Too heavy ({item.w} &gt; {col})</div>
                 )}
             </motion.div>
         </div>

         {phase !== "CHECK" && (
             <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-2 bg-[var(--accent-gradient-to)]/10 border border-[var(--accent-gradient-to)]/30 rounded-lg text-center"
             >
                 <span className="text-xs font-bold text-[var(--foreground)]">
                     Decision: <span className={decision === "INCLUDE" ? "text-green-400" : "text-red-400"}>{decision}</span> ({Math.max(excludeVal, canInclude ? includeVal : -1)})
                 </span>
             </motion.div>
         )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">0/1 Knapsack Visualizer</h2>
          <p className="text-sm text-[var(--foreground)]/60">Dynamic Programming Tabulation</p>
        </div>
        <div className="flex gap-2">
            <button onClick={reset} disabled={isRunning} className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg transition-colors">
                <RotateCcw size={20} />
            </button>
            <button 
                onClick={isRunning ? handleStop : runSimulation}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                    isRunning 
                    ? "bg-red-500/20 text-red-500 border border-red-500/50" 
                    : "bg-[var(--accent-gradient-to)] text-white hover:opacity-90"
                }`}
            >
                {isRunning ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                {isRunning ? "STOP" : "START"}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT PANEL: Decision Context */}
          <div className="lg:col-span-4 flex flex-col gap-4">
              {renderCalculation()}
          </div>

          {/* RIGHT PANEL: DP Table */}
          <div className="lg:col-span-8 overflow-x-auto">
              <div className="min-w-max">
                  {/* Header Row (Capacities) */}
                  <div className="flex mb-1">
                      <div className="w-16 h-8 flex items-center justify-center text-[10px] font-bold text-[var(--foreground)]/40 uppercase">Item \ Cap</div>
                      {Array.from({ length: CAPACITY + 1 }).map((_, i) => (
                          <div key={i} className={`w-10 h-8 flex items-center justify-center text-xs font-mono font-bold ${i === state.col ? "text-blue-400 scale-110 transition-transform" : "text-[var(--foreground)]/40"}`}>
                              {i}
                          </div>
                      ))}
                  </div>

                  {/* Rows */}
                  {dp.map((row, i) => {
                      const item = i === 0 ? null : ITEMS[i-1];
                      const isActiveRow = i === state.row;

                      return (
                          <div key={i} className="flex mb-1">
                              {/* Row Header (Item) */}
                              <div className={`w-16 h-10 flex items-center gap-2 pl-2 rounded-l-lg border-y border-l border-[var(--card-border)] bg-[var(--foreground)]/5 
                                  ${isActiveRow ? "border-l-4 border-l-blue-500" : ""}`}>
                                  {item ? (
                                      <>
                                        <item.icon size={14} className={item.color} />
                                        <span className="text-[10px] font-bold text-[var(--foreground)]/80 truncate">{item.name}</span>
                                      </>
                                  ) : (
                                      <span className="text-[10px] font-bold text-[var(--foreground)]/40">Base</span>
                                  )}
                              </div>

                              {/* Cells */}
                              {row.map((val, j) => {
                                  const isActiveCell = i === state.row && j === state.col;
                                  const isReferenceExclude = i === state.row - 1 && j === state.col;
                                  const isReferenceInclude = item && i === state.row - 1 && j === state.col - item.w;
                                  
                                  let cellBg = "bg-transparent";
                                  let borderColor = "border-[var(--card-border)]";
                                  
                                  if (isActiveCell) {
                                      cellBg = "bg-blue-500/20";
                                      borderColor = "border-blue-500";
                                  } else if (isActiveRow && state.phase !== "CHECK") {
                                      if (isReferenceExclude && state.decision === "EXCLUDE") {
                                          cellBg = "bg-red-500/20";
                                          borderColor = "border-red-500/50";
                                      }
                                      if (isReferenceInclude && state.decision === "INCLUDE") {
                                          cellBg = "bg-green-500/20";
                                          borderColor = "border-green-500/50";
                                      }
                                  }

                                  return (
                                      <motion.div
                                          key={`${i}-${j}`}
                                          initial={false}
                                          animate={{ 
                                              scale: isActiveCell ? 1.1 : 1,
                                              backgroundColor: isActiveCell ? "rgba(59, 130, 246, 0.2)" : "rgba(255,255,255,0.02)"
                                          }}
                                          className={`w-10 h-10 border ${borderColor} flex items-center justify-center text-xs font-mono font-bold text-[var(--foreground)] relative group`}
                                      >
                                          {val}
                                          {/* Tooltip for value source */}
                                          {isActiveCell && (
                                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                                  dp[{i}][{j}]
                                              </div>
                                          )}
                                      </motion.div>
                                  );
                              })}
                          </div>
                      );
                  })}
              </div>
          </div>
      </div>
    </div>
  );
}