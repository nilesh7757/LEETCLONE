"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RotateCcw, Zap, 
  Binary, Database, Cpu, Calculator, ArrowUp, ArrowRight, Settings2, Search
} from "lucide-react";

interface Step {
  activeNode: number;
  midNode?: number | null;
  targetNode: number | null;
  k: number;
  jumpSize: number;
  remainingK?: number;
  message: string;
  phase: "INIT" | "JUMPING" | "FOUND" | "PRECOMPUTING";
  visitedPath?: number[];
  upTableHighlight: [number, number] | null; // [node, k]
  upTableSecondaryHighlight?: [number, number] | null;
  bitsProcessed?: number[];
  tableState?: (number | null)[][];
}

const PARENT = [-1, 0, 0, 1, 1, 2, 2, 3, 4, 5];
const N = 10;

const NODES = [
  { id: 0, x: 250, y: 50 },
  { id: 1, x: 150, y: 120 }, { id: 2, x: 350, y: 120 },
  { id: 3, x: 100, y: 200 }, { id: 4, x: 200, y: 200 }, { id: 5, x: 300, y: 200 }, { id: 6, x: 400, y: 200 },
  { id: 7, x: 80, y: 280 }, { id: 8, x: 220, y: 280 }, { id: 9, x: 320, y: 280 }
];

export default function BinaryLiftingVisualizer({ speed = 800 }: { speed?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [targetK, setTargetK] = useState(5);
  const [startNode, setStartNode] = useState(7);
  const [viewMode, setViewMode] = useState<"PRECOMPUTE" | "QUERY">("PRECOMPUTE");

  // Real up table for final query use
  const finalUp = useMemo(() => {
    const table = Array.from({ length: N }, () => new Array(4).fill(-1));
    for (let i = 0; i < N; i++) table[i][0] = PARENT[i];
    for (let k = 1; k < 4; k++) {
      for (let i = 0; i < N; i++) {
        if (table[i][k-1] !== -1) table[i][k] = table[table[i][k-1]][k-1];
      }
    }
    return table;
  }, []);

  const precomputeHistory = useMemo(() => {
    const steps: Step[] = [];
    const table: (number | null)[][] = Array.from({ length: N }, () => new Array(4).fill(null));
    
    // Step 0: Initialize with parents (k=0)
    for (let i = 0; i < N; i++) table[i][0] = PARENT[i];
    
    steps.push({
      activeNode: -1, targetNode: null, k: 0, jumpSize: 1, message: "Phase 1: Initialize k=0 with direct parents. This is our base case.",
      phase: "PRECOMPUTING", upTableHighlight: null, tableState: table.map(row => [...row])
    });

    for (let k = 1; k < 4; k++) {
      for (let u = 0; u < N; u++) {
        const mid = table[u][k-1];
        const target = mid !== null && mid !== -1 ? table[mid][k-1] : -1;
        
        steps.push({
          activeNode: u, midNode: mid, targetNode: null, k, jumpSize: 1 << k,
          message: `Calculating up[${u}][${k}]: To go up 2^${k} steps, we first go up 2^${k-1} steps from ${u} to reach ${mid === -1 ? "Root/None" : "Node " + mid}.`,
          phase: "PRECOMPUTING", 
          upTableHighlight: [u, k],
          upTableSecondaryHighlight: [u, k-1],
          tableState: table.map(row => [...row])
        });

        if (mid !== null && mid !== -1) {
            steps.push({
                activeNode: u, midNode: mid, targetNode: target, k, jumpSize: 1 << k,
                message: `Then, from Node ${mid}, we go up another 2^${k-1} steps to reach up[${mid}][${k-1}] = ${target === -1 ? "Root" : "Node " + target}.`,
                phase: "PRECOMPUTING", 
                upTableHighlight: [u, k],
                upTableSecondaryHighlight: [mid, k-1],
                tableState: table.map(row => [...row])
            });
        }

        table[u][k] = target;
        
        steps.push({
          activeNode: u, midNode: mid, targetNode: target, k, jumpSize: 1 << k,
          message: `Result: up[${u}][${k}] = ${target === -1 ? "-1 (Root)" : target}. Table entry updated.`,
          phase: "PRECOMPUTING", 
          upTableHighlight: [u, k],
          tableState: table.map(row => [...row])
        });
      }
    }
    return steps;
  }, []);

  const queryHistory = useMemo(() => {
    const steps: Step[] = [];
    const record = (msg: string, curr: number, tar: number | null, k: number, j: number, rem: number, ph: Step["phase"], path: number[], highlight: [number, number] | null, bits: number[]) => {
      steps.push({ activeNode: curr, targetNode: tar, k, jumpSize: j, remainingK: rem, message: msg, phase: ph, visitedPath: [...path], upTableHighlight: highlight, bitsProcessed: [...bits] });
    };

    record(`Task: Find the ${targetK}-th ancestor of Node ${startNode}. We'll check powers of 2 from largest to smallest.`, startNode, null, -1, 0, targetK, "INIT", [startNode], null, []);

    let curr = startNode;
    let rem = targetK;
    let path = [startNode];
    const bits: number[] = [];

    for (let k = 3; k >= 0; k--) {
      bits.push(k);
      const jumpSize = 1 << k;
      if ((rem >> k) & 1) {
        const next = finalUp[curr][k];
        record(`Bit ${k} is set (2^${k} = ${jumpSize}). Checking up[${curr}][${k}]...`, curr, next, k, jumpSize, rem, "JUMPING", path, [curr, k], bits);
        if (next !== -1) {
            curr = next;
            rem -= jumpSize;
            path = [...path, curr];
            record(`Jumping ${jumpSize} levels up to Node ${curr}. Remaining distance: ${rem}.`, curr, null, k, jumpSize, rem, "JUMPING", path, null, bits);
        } else {
            record(`Jump of ${jumpSize} exceeds root! Node ${curr} has no ${jumpSize}-th ancestor.`, curr, null, k, jumpSize, rem, "FOUND", path, null, bits);
            break;
        }
      } else {
        record(`Bit ${k} is 0. Skipping jump of size ${jumpSize}.`, curr, null, k, jumpSize, rem, "JUMPING", path, null, bits);
      }
    }

    if (rem === 0) record(`Success! The ${targetK}-th ancestor is Node ${curr}.`, curr, null, -1, 0, 0, "FOUND", path, null, bits);
    return steps;
  }, [startNode, targetK, finalUp]);

  const history = useMemo(() => (viewMode === "PRECOMPUTE" ? precomputeHistory : queryHistory), [viewMode, precomputeHistory, queryHistory]);

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
  const currentTable = step.tableState || finalUp;

  return (
    <div className="flex flex-col gap-6 font-sans select-none">
      <div className="p-4 md:p-8 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl relative overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar flex flex-col min-h-[350px] md:min-h-[950px] w-full">
        
        {/* Header */}
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold flex items-center gap-3 text-[var(--viz-cyan)]">
              <ArrowUp className="text-[var(--viz-cyan)]" />
              Binary <span className="text-foreground/40 font-light">Lifting</span>
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono italic">
                {viewMode === "PRECOMPUTE" ? "DP Precomputation: O(N log N)" : "Binary Jump Query: O(log N)"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Mode Switcher */}
            <div className="flex bg-[var(--muted)] p-1 rounded-2xl border border-[var(--border)] shadow-inner">
                <button 
                    onClick={() => { setViewMode("PRECOMPUTE"); setCurrentIndex(0); setIsPlaying(false); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === "PRECOMPUTE" ? "bg-[var(--viz-cyan)] text-background shadow-lg" : "text-muted-foreground hover:bg-card"}`}
                >
                    <Settings2 size={12} />
                    Precompute
                </button>
                <button 
                    onClick={() => { setViewMode("QUERY"); setCurrentIndex(0); setIsPlaying(false); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === "QUERY" ? "bg-[var(--viz-cyan)] text-background shadow-lg" : "text-muted-foreground hover:bg-card"}`}
                >
                    <Search size={12} />
                    Query
                </button>
            </div>

            {/* Main Controls */}
            <div className="flex items-center gap-3 bg-[var(--muted)] p-2 rounded-2xl border border-[var(--border)] shadow-inner">
                {viewMode === "QUERY" && (
                    <div className="flex items-center gap-2 px-3 border-r border-border/50">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">K:</span>
                        <input type="number" min="1" max="7" value={targetK} onChange={(e) => { setTargetK(Number(e.target.value)); setCurrentIndex(0); }} className="w-10 bg-card border border-border rounded px-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[var(--viz-cyan)]" />
                    </div>
                )}
                <button onClick={() => { setCurrentIndex(0); setIsPlaying(false); }} className="p-2 hover:bg-card rounded-xl text-muted-foreground transition-all"><RotateCcw size={18}/></button>
                <button onClick={() => setIsPlaying(!isPlaying)} className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${isPlaying ? "bg-[var(--viz-rose)]/20 text-[var(--viz-rose)] border border-[var(--viz-rose)]/50" : "bg-[var(--viz-cyan)] text-background hover:scale-105"}`}>
                    {isPlaying ? "STOP" : "RUN"}
                </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            
            {/* Left Column: Table & Logic */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Logic Section */}
                <div className="bg-[var(--muted)]/40 p-5 rounded-3xl border border-[var(--border)]">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <Cpu size={14} />
                        Core Formula
                    </h3>
                    <div className="p-4 bg-[var(--card)] rounded-2xl font-mono text-xs space-y-2 border border-[var(--border)] shadow-sm">
                        {viewMode === "PRECOMPUTE" ? (
                            <>
                                <div className="text-[var(--viz-cyan)] font-bold">up[u][k] = up[ up[u][k-1] ][k-1]</div>
                                <div className="text-[9px] text-muted-foreground mt-2 leading-relaxed italic">
                                    &quot;To go up 2^k, go up 2^{step.k-1} twice.&quot;
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-[var(--viz-cyan)] font-bold">if (targetK & (1 {"<<"} k))</div>
                                <div className="text-foreground/80 pl-4 font-bold">curr = up[curr][k]</div>
                                <div className="text-[9px] text-muted-foreground mt-2 leading-relaxed italic">
                                    &quot;Jump only for bits set in binary of K.&quot;
                                </div>
                            </>
                        )}
                    </div>
                    
                    {viewMode === "QUERY" && (
                        <div className="mt-4 flex gap-1">
                            {[3, 2, 1, 0].map(bit => (
                                <div key={bit} className={`flex-1 text-center p-2 rounded-lg border text-[10px] font-bold ${step.k === bit ? "border-[var(--viz-cyan)] bg-[var(--viz-cyan)]/20" : (targetK >> bit) & 1 ? "border-white/10 opacity-100" : "opacity-20"}`}>
                                    2^{bit}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sparse Table UI */}
                <div className="bg-[var(--muted)]/40 p-5 rounded-3xl border border-[var(--border)] overflow-hidden flex-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <Database size={14} />
                        Sparse Table: up[u][k]
                    </h3>
                    <div className="overflow-x-auto h-[400px]">
                        <table className="w-full text-[9px] font-mono border-collapse">
                            <thead className="sticky top-0 bg-[var(--muted)] z-20">
                                <tr>
                                    <th className="p-1 text-left text-muted-foreground border-b border-border/50">u\k</th>
                                    {[0, 1, 2, 3].map(k => (
                                        <th key={k} className={`p-1 border-b border-border/50 transition-colors ${step.k === k ? "text-[var(--viz-cyan)] font-black" : "text-muted-foreground"}`}>
                                            2^{k}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {NODES.map(node => (
                                    <tr key={node.id} className={step.activeNode === node.id ? "bg-[var(--viz-cyan)]/5" : ""}>
                                        <td className={`p-1 border-b border-border/20 font-bold ${step.activeNode === node.id ? "text-[var(--viz-cyan)]" : ""}`}>{node.id}</td>
                                        {[0, 1, 2, 3].map(k => {
                                            const isPrimary = step.upTableHighlight && step.upTableHighlight[0] === node.id && step.upTableHighlight[1] === k;
                                            const isSecondary = step.upTableSecondaryHighlight && step.upTableSecondaryHighlight[0] === node.id && step.upTableSecondaryHighlight[1] === k;
                                            const val = currentTable[node.id][k];
                                            return (
                                                <td key={k} className={`p-1 border-b border-border/20 text-center transition-all duration-300 ${isPrimary ? "bg-[var(--viz-cyan)] text-background font-bold scale-110 shadow-lg z-10" : isSecondary ? "bg-[var(--viz-amber)]/40 text-foreground font-bold" : "text-muted-foreground/40"}`}>
                                                    {val === null ? "?" : val === -1 ? "R" : val}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right Column: Tree Visualization & Info */}
            <div className="lg:col-span-8 flex flex-col bg-[var(--muted)]/20 rounded-[2.5rem] border border-[var(--border)] p-6 relative overflow-hidden">
                
                {/* Step Info Box */}
                <div className="mb-6 h-20">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentIndex}
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="bg-card/90 border-l-4 border-l-[var(--viz-cyan)] p-4 rounded-2xl shadow-xl backdrop-blur-md"
                        >
                            <p className="text-xs md:text-sm font-medium leading-relaxed">{step.message}</p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Tree View */}
                <div className="flex-1 flex items-center justify-center relative scale-90 md:scale-110 origin-center">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        <defs>
                            <marker id="arrow-cyan" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="var(--viz-cyan)" />
                            </marker>
                            <marker id="arrow-amber" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="var(--viz-amber)" />
                            </marker>
                        </defs>
                        {PARENT.map((p, i) => {
                            if (p === -1) return null;
                            const start = NODES.find(n => n.id === i)!;
                            const end = NODES.find(n => n.id === p)!;
                            return <line key={i} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="var(--border)" strokeWidth="1" opacity="0.2" />;
                        })}
                        
                        <AnimatePresence>
                            {/* Precompute Jumps: u -> mid -> target */}
                            {viewMode === "PRECOMPUTE" && step.activeNode !== -1 && (
                                <>
                                    {step.midNode !== undefined && step.midNode !== -1 && (
                                        <motion.path
                                            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                                            d={`M ${NODES[step.activeNode].x} ${NODES[step.activeNode].y} Q ${NODES[step.activeNode].x-30} ${(NODES[step.activeNode].y + NODES[step.midNode!].y)/2} ${NODES[step.midNode!].x} ${NODES[step.midNode!].y}`}
                                            fill="none" stroke="var(--viz-amber)" strokeWidth="2" strokeDasharray="4 2"
                                            markerEnd="url(#arrow-amber)"
                                        />
                                    )}
                                    {step.midNode !== undefined && step.midNode !== -1 && step.targetNode !== null && step.targetNode !== -1 && (
                                        <motion.path
                                            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                                            d={`M ${NODES[step.midNode!].x} ${NODES[step.midNode!].y} Q ${NODES[step.midNode!].x-20} ${(NODES[step.midNode!].y + NODES[step.targetNode!].y)/2} ${NODES[step.targetNode!].x} ${NODES[step.targetNode!].y}`}
                                            fill="none" stroke="var(--viz-cyan)" strokeWidth="2"
                                            markerEnd="url(#arrow-cyan)"
                                        />
                                    )}
                                </>
                            )}

                            {/* Query Jumps */}
                            {viewMode === "QUERY" && step.targetNode !== null && (
                                <motion.path
                                    key={`qjump-${currentIndex}`}
                                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                    d={`M ${NODES.find(n => n.id === step.activeNode)!.x} ${NODES.find(n => n.id === step.activeNode)!.y} 
                                       Q ${NODES.find(n => n.id === step.activeNode)!.x-40} ${(NODES.find(n => n.id === step.activeNode)!.y + NODES.find(n => n.id === step.targetNode)!.y)/2} 
                                         ${NODES.find(n => n.id === step.targetNode)!.x} ${NODES.find(n => n.id === step.targetNode)!.y}`}
                                    fill="none" stroke="var(--viz-cyan)" strokeWidth="3" markerEnd="url(#arrow-cyan)"
                                />
                            )}
                        </AnimatePresence>
                    </svg>

                    {NODES.map((node) => {
                        const isU = step.activeNode === node.id;
                        const isMid = step.midNode === node.id;
                        const isTarget = step.targetNode === node.id;
                        const isVisited = step.visitedPath?.includes(node.id);
                        
                        return (
                            <motion.div
                                key={node.id}
                                animate={{ 
                                    scale: isU ? 1.3 : (isMid || isTarget) ? 1.15 : 1,
                                    borderColor: isU ? "var(--viz-cyan)" : isMid ? "var(--viz-amber)" : isTarget ? "var(--viz-cyan)" : isVisited ? "rgba(var(--viz-cyan-rgb), 0.6)" : "var(--border)",
                                    backgroundColor: isU ? "var(--viz-cyan)" : isVisited ? "rgba(var(--viz-cyan-rgb), 0.1)" : "var(--card)",
                                    color: isU ? "var(--background)" : isVisited ? "var(--viz-cyan)" : "var(--foreground)"
                                }}
                                className="absolute w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono text-xs font-black z-20 shadow-lg backdrop-blur-sm"
                                style={{ left: node.x - 20, top: node.y - 20 }}
                            >
                                {node.id}
                                {isU && <div className="absolute -bottom-6 text-[7px] font-black uppercase text-[var(--viz-cyan)]">Node U</div>}
                                {isMid && <div className="absolute -bottom-6 text-[7px] font-black uppercase text-[var(--viz-amber)]">Midpoint</div>}
                                {isTarget && <div className="absolute -top-6 text-[7px] font-black uppercase text-[var(--viz-cyan)]">Target</div>}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Legend & Stats */}
                <div className="mt-auto pt-6 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 border-t border-border/20">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--viz-cyan)]" /> 2^k Ancestor
                        </div>
                        {viewMode === "PRECOMPUTE" && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[var(--viz-amber)]" /> 2^{step.k-1} Middle
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Calculator size={12} />
                        k={step.k} | jump size={1 << step.k}
                    </div>
                </div>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 relative h-1.5 bg-background/20 rounded-full overflow-hidden">
            <motion.div 
                className="absolute top-0 left-0 h-full bg-[var(--viz-cyan)]"
                animate={{ width: `${(currentIndex / (history.length - 1)) * 100}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            />
            <input type="range" min="0" max={history.length - 1} value={currentIndex} onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" />
        </div>
        <div className="mt-4 flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
            <span>Step {currentIndex + 1}</span>
            <span>{history.length} Total Steps</span>
        </div>
      </div>
    </div>
  );
}
