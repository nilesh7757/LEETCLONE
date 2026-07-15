"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, ChevronLeft, ChevronRight, Zap, 
  Activity, Network, Cpu, RefreshCw
} from "lucide-react";

const INF = 99;

interface FWStep {
  matrix: number[][];
  k: number;
  i: number | null;
  j: number | null;
  message: string;
  step: string;
  activeLine: number;
  decision: "RELAX" | "KEEP" | "NONE";
  logs: string[];
}

export default function FloydWarshallVisualizer({ speed = 800 }: { speed?: number }) {
  const [numNodes, setNumNodes] = useState(4);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const MAX_NODES = 8;

  const handleResize = () => {
    setNumNodes(prev => {
      const next = (prev % 6) + 3;
      if (next > MAX_NODES) return 3;
      return next;
    });
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const initialGraph = useMemo(() => {
    const mat = Array.from({ length: numNodes }, (_, r) => 
        Array.from({ length: numNodes }, (_, c) => {
            if (r === c) return 0;
            const seed = (r * 7 + c * 13 + numNodes * 3) % 100; 
            if (seed > 65) return INF; 
            return (seed % 9) + 1;
        })
    );
    return mat;
  }, [numNodes]);

  const nodePositions = useMemo(() => {
    const radius = 90;
    const centerX = 150;
    const centerY = 150;
    return Array.from({ length: numNodes }, (_, i) => {
      const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2;
      return { x: Math.cos(angle) * radius + centerX, y: Math.sin(angle) * radius + centerY };
    });
  }, [numNodes]);

  const getEdgeData = (uIdx: number, vIdx: number) => {
    const u = nodePositions[uIdx];
    const v = nodePositions[vIdx];
    if (!u || !v) return null;
    const dx = v.x - u.x, dy = v.y - u.y, d = Math.sqrt(dx*dx + dy*dy);
    if (d === 0) return null;
    const ux = dx/d, uy = dy/d;
    const hasOpposite = initialGraph[vIdx]?.[uIdx] !== undefined && initialGraph[vIdx][uIdx] !== INF;
    const curve = hasOpposite ? 15 : 0;
    const cpX = (u.x + v.x)/2 - uy * curve;
    const cpY = (u.y + v.y)/2 + ux * curve;
    const path = `M ${u.x + ux*16} ${u.y + uy*16} Q ${cpX} ${cpY} ${v.x - ux*20} ${v.y - uy*20}`;
    return { path, cpX, cpY, ux, uy };
  };

  const history = useMemo(() => {
    const steps: FWStep[] = [];
    const dist = initialGraph.map(row => [...row]);
    const n = numNodes;
    let logs: string[] = [];

    const record = (msg: string, step: string, k: number, i: number | null, j: number | null, line: number, dec: FWStep['decision']) => {
      steps.push({
        matrix: dist.map(r => [...r]),
        k, i, j,
        message: msg,
        step: step,
        activeLine: line,
        decision: dec,
        logs: [...logs]
      });
    };

    const addLog = (l: string) => { logs = [l, ...logs]; };

    addLog(`Initializing Adjacency Matrix (${n}x${n}).`);
    record("Initializing Distance Matrix. D[i][j] = Direct Edge Weight.", "INIT", -1, null, null, -1, "NONE");

    for (let k = 0; k < n; k++) {
      addLog(`Phase k=${k}: Allowing paths via Node ${k}.`);
      record(`Iteration k=${k}: Considering Node ${k} as intermediate vertex.`, "PHASE_START", k, null, null, 0, "NONE");

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) continue;

          const d_ik = dist[i][k];
          const d_kj = dist[k][j];
          const d_ij = dist[i][j];

          if (d_ik === INF || d_kj === INF) {
             continue; 
          }

          const sumPath = d_ik + d_kj;
          
          record(`Comparing: D[${i}][${j}] (${d_ij === INF ? '∞' : d_ij}) vs D[${i}][${k}] + D[${k}][${j}] (${d_ik} + ${d_kj} = ${sumPath}).`, "COMPARE", k, i, j, 3, "NONE");

          if (sumPath < d_ij) {
            dist[i][j] = sumPath;
            addLog(`Relaxed [${i}->${j}] via ${k}: New Cost ${sumPath}.`);
            record(`Path improved! Updating D[${i}][${j}] to ${sumPath}.`, "RELAX", k, i, j, 4, "RELAX");
          }
        }
      }
    }

    addLog("All-Pairs Shortest Paths Resolved.");
    record("Algorithm Complete. Matrix contains optimal distances.", "COMPLETE", -1, null, null, -1, "NONE");

    return steps;
  }, [initialGraph, numNodes]);

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
    matrix: initialGraph, k: -1, i: null, j: null, message: "Initializing...", step: "IDLE", activeLine: -1, decision: "NONE", logs: []
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
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--viz-rose)] hover:bg-[var(--viz-rose)]/80 text-black rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
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
            title="Reset Floyd-Warshall Simulation"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={handleResize}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all text-xs font-bold cursor-pointer"
            title="Change Graph Size"
          >
            <RefreshCw size={14} />
            <span>Resize ({numNodes} Nodes)</span>
          </button>
        </div>
      </div>

      {/* Visual Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Topology View (Graph State) */}
        <div className="relative w-full h-[320px] md:h-[350px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-hidden shadow-inner flex items-center justify-center p-0 order-1 lg:order-2 lg:col-span-4">
          <div className="absolute top-4 left-4 flex items-center gap-2 text-[var(--muted-foreground)]/40 z-20 pointer-events-none">
            <Network size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Graph State</span>
          </div>
          
          <div className="relative w-full aspect-square max-w-[280px] h-auto flex items-center justify-center">
            <svg 
              viewBox="0 0 300 300" 
              className="w-full h-full select-none touch-none z-10 overflow-visible"
            >
              <defs>
                <marker id="arrowhead-fw" markerWidth="10" markerHeight="7" refX="19" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                </marker>
              </defs>
              
              {/* Draw Edges */}
              {initialGraph.map((row, u) => row.map((w, v) => {
                if (u === v || w === INF) return null;
                const edgeInfo = getEdgeData(u, v);
                if (!edgeInfo) return null;
                const { path } = edgeInfo;

                const isViaPath1 = u === currentStep.i && v === currentStep.k; 
                const isViaPath2 = u === currentStep.k && v === currentStep.j; 
                const isDirectPath = u === currentStep.i && v === currentStep.j; 

                const isActive = isViaPath1 || isViaPath2 || isDirectPath;
                
                let strokeColor = "text-[var(--muted-foreground)]/20";
                let strokeWidth = 1.5;
                if (isDirectPath) {
                  strokeColor = "text-[var(--viz-rose)]";
                  strokeWidth = 3;
                } else if (isViaPath1) {
                  strokeColor = "text-[var(--viz-cyan)]";
                  strokeWidth = 2.5;
                } else if (isViaPath2) {
                  strokeColor = "text-[var(--viz-amber)]";
                  strokeWidth = 2.5;
                }

                return (
                  <g key={`edge-path-${u}-${v}`}>
                    <motion.path
                      d={path}
                      fill="none"
                      stroke="currentColor"
                      className={strokeColor}
                      strokeWidth={strokeWidth}
                      markerEnd="url(#arrowhead-fw)"
                      animate={{ opacity: 1 }}
                    />
                    {isDirectPath && (
                      <motion.circle r="3.5" fill="var(--viz-rose)">
                        <animateMotion dur="0.8s" repeatCount="indefinite" path={path} />
                      </motion.circle>
                    )}
                    {isViaPath1 && (
                      <motion.circle r="3.5" fill="var(--viz-cyan)">
                        <animateMotion dur="0.8s" repeatCount="indefinite" path={path} />
                      </motion.circle>
                    )}
                    {isViaPath2 && (
                      <motion.circle r="3.5" fill="var(--viz-amber)">
                        <animateMotion dur="0.8s" repeatCount="indefinite" path={path} />
                      </motion.circle>
                    )}
                  </g>
                );
              }))}

              {/* Edge Weights */}
              {initialGraph.map((row, u) => row.map((weight, v) => {
                if (u === v || weight === INF) return null;
                const edgeInfo = getEdgeData(u, v);
                if (!edgeInfo) return null;
                const { cpX, cpY } = edgeInfo;

                const isViaPath1 = u === currentStep.i && v === currentStep.k;
                const isViaPath2 = u === currentStep.k && v === currentStep.j;
                const isDirectPath = u === currentStep.i && v === currentStep.j;
                const isActive = isViaPath1 || isViaPath2 || isDirectPath;

                return (
                  <g key={`edge-weight-${u}-${v}`}>
                    <circle 
                      cx={cpX} 
                      cy={cpY} 
                      r="8" 
                      fill="var(--viz-amber)" 
                      stroke="var(--background)" 
                      strokeWidth={isActive ? 1.5 : 0}
                      className="shadow-sm"
                    />
                    <text 
                      x={cpX} 
                      y={cpY} 
                      dy="2.5" 
                      textAnchor="middle" 
                      fontSize="8" 
                      fontWeight="900" 
                      className="font-mono fill-black pointer-events-none select-none"
                    >
                      {weight}
                    </text>
                  </g>
                );
              }))}

              {/* Draw Nodes */}
              {nodePositions.map((pos, idx) => {
                const isK = idx === currentStep.k;
                const isI = idx === currentStep.i;
                const isJ = idx === currentStep.j;

                let nodeColor = "var(--card)";
                let borderColor = "var(--border)";

                if (isK) {
                  nodeColor = "rgba(var(--viz-amber-rgb), 0.15)";
                  borderColor = "var(--viz-amber)";
                } else if (isI) {
                  nodeColor = "rgba(var(--viz-cyan-rgb), 0.15)";
                  borderColor = "var(--viz-cyan)";
                } else if (isJ) {
                  nodeColor = "rgba(var(--viz-rose-rgb), 0.15)";
                  borderColor = "var(--viz-rose)";
                }

                return (
                  <g key={`node-group-${idx}`} className="select-none pointer-events-none">
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="16"
                      fill={nodeColor}
                      stroke={borderColor}
                      strokeWidth="2.5"
                      className="transition-colors duration-200"
                    />
                    <text
                      x={pos.x}
                      y={pos.y}
                      dy="3"
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      className="font-mono select-none pointer-events-none fill-[var(--foreground)]"
                    >
                      {idx}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Matrix View */}
        <div className="col-span-1 lg:col-span-5 order-2 lg:order-1 relative p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm flex flex-col items-center">
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentStep.step}
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                className="flex items-center gap-2 px-2.5 py-1 bg-[var(--popover)]/60 text-[var(--popover-foreground)] rounded-full border border-[var(--border)]/10 shadow-sm"
              >
                <Zap size={11} className="text-[var(--viz-rose)]" fill="var(--viz-rose)" />
                <span className="text-[9px] font-black font-mono text-[var(--viz-rose)] uppercase tracking-widest">{currentStep.step}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative z-10 w-full overflow-x-auto pb-2 custom-scrollbar mt-10">
            <div className="min-w-fit flex flex-col items-center">
              {/* Col Headers */}
              <div className="flex">
                <div className="w-8 h-8" />
                {Array.from({ length: numNodes }).map((_, c) => (
                  <div key={`col-${c}`} className={`w-10 h-8 flex items-center justify-center font-mono text-[10px] font-black uppercase tracking-tight transition-all ${currentStep.j === c ? "text-[var(--viz-rose)] scale-125" : "text-[var(--muted-foreground)]/40"}`}>
                    {c}
                  </div>
                ))}
              </div>
              {/* Matrix */}
              {currentStep.matrix.map((row, r) => (
                <div key={`row-${r}`} className="flex mb-1">
                  {/* Row Header */}
                  <div className={`w-8 h-10 flex items-center justify-center font-mono text-[10px] font-black uppercase tracking-tight transition-all ${currentStep.i === r ? "text-[var(--viz-rose)] scale-125" : "text-[var(--muted-foreground)]/40"}`}>
                    {r}
                  </div>
                  {row.map((val, c) => {
                    const isTarget = r === currentStep.i && c === currentStep.j;
                    const isVia1 = r === currentStep.i && c === currentStep.k;
                    const isVia2 = r === currentStep.k && c === currentStep.j;
                    const isPivot = r === currentStep.k && c === currentStep.k;

                    let cellBg = "transparent";
                    let cellBorder = "var(--border)";
                    let valColor = "text-[var(--muted-foreground)]";

                    if (isTarget) {
                      cellBg = "rgba(var(--viz-rose-rgb), 0.15)";
                      cellBorder = "var(--viz-rose)";
                      valColor = "text-[var(--viz-rose)] font-black";
                    } else if (isVia1 || isVia2) {
                      cellBg = "rgba(var(--viz-cyan-rgb), 0.1)";
                      cellBorder = "var(--viz-cyan)";
                      valColor = "text-[var(--viz-cyan)] font-bold";
                    } else if (isPivot) {
                      cellBg = "rgba(var(--viz-amber-rgb), 0.1)";
                      cellBorder = "var(--viz-amber)";
                      valColor = "text-[var(--viz-amber)] font-bold";
                    }

                    return (
                      <div key={`${r}-${c}`} className="w-10 h-10 flex items-center justify-center relative">
                        <motion.div
                          initial={false}
                          animate={{ 
                            scale: isTarget ? 1.1 : 1,
                            backgroundColor: cellBg,
                            borderColor: cellBorder,
                            opacity: val === INF ? 0.35 : 1
                          }}
                          className="w-9 h-9 border rounded-lg flex items-center justify-center text-xs font-mono font-bold shadow-sm transition-colors duration-200"
                        >
                          <span className={valColor}>{val === INF ? "∞" : val}</span>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Variable Monitor */}
          <div className="mt-4 grid grid-cols-3 gap-2 w-full max-w-[280px]">
            <div className="p-2 bg-[var(--muted)]/20 border border-[var(--border)]/40 rounded-xl flex flex-col items-center">
              <span className="text-[8px] font-black text-[var(--muted-foreground)]/60 uppercase">Via (k)</span>
              <span className="text-xs font-black text-[var(--viz-amber)]">{currentStep.k !== -1 ? currentStep.k : "-"}</span>
            </div>
            <div className="p-2 bg-[var(--muted)]/20 border border-[var(--border)]/40 rounded-xl flex flex-col items-center">
              <span className="text-[8px] font-black text-[var(--muted-foreground)]/60 uppercase">From (i)</span>
              <span className="text-xs font-black text-[var(--viz-cyan)]">{currentStep.i !== null ? currentStep.i : "-"}</span>
            </div>
            <div className="p-2 bg-[var(--muted)]/20 border border-[var(--border)]/40 rounded-xl flex flex-col items-center">
              <span className="text-[8px] font-black text-[var(--muted-foreground)]/60 uppercase">To (j)</span>
              <span className="text-xs font-black text-[var(--viz-rose)]">{currentStep.j !== null ? currentStep.j : "-"}</span>
            </div>
          </div>
        </div>

        {/* Sidebar Logic */}
        <div className="col-span-1 lg:col-span-3 order-3 lg:order-3 flex flex-col gap-6">
          <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col gap-4 shadow-sm">
            <h3 className="text-[9px] font-black uppercase text-[var(--muted-foreground)]/50 tracking-widest flex items-center gap-2">
              <Cpu size={14} className="text-[var(--viz-cyan)]" /> Logic Core
            </h3>
            <div className="space-y-3 font-mono text-[9px]">
              <div className={`p-2 rounded-lg border transition-all ${currentStep.activeLine === 3 ? "bg-[var(--viz-rose)]/15 border-[var(--viz-rose)] text-[var(--viz-rose)]" : "border-transparent text-[var(--muted-foreground)]/40"}`}>
                CHECK: Dist[i][k] + Dist[k][j] &lt; Dist[i][j]
              </div>
              {currentStep.i !== null && currentStep.k !== -1 && currentStep.j !== null && (
                <div className="pl-2 border-l-2 border-[var(--border)] text-[10px] text-[var(--muted-foreground)]/80">
                  <span className="text-[var(--viz-cyan)]">{currentStep.matrix[currentStep.i][currentStep.k] === INF ? '∞' : currentStep.matrix[currentStep.i][currentStep.k]}</span>
                  {" + "}
                  <span className="text-[var(--viz-cyan)]">{currentStep.matrix[currentStep.k][currentStep.j] === INF ? '∞' : currentStep.matrix[currentStep.k][currentStep.j]}</span>
                  {" vs "}
                  <span className="text-[var(--viz-rose)]">{currentStep.matrix[currentStep.i][currentStep.j] === INF ? '∞' : currentStep.matrix[currentStep.i][currentStep.j]}</span>
                </div>
              )}
              <div className={`p-2 rounded-lg border transition-all ${currentStep.activeLine === 4 ? "bg-[var(--viz-green)]/15 border-[var(--viz-green)] text-[var(--viz-green)]" : "border-transparent text-[var(--muted-foreground)]/40"}`}>
                UPDATE: Dist[i][j] = New Path
              </div>
            </div>
          </div>

          <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex-col h-[200px] flex shadow-sm">
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
                    <span className="text-[var(--viz-rose)] font-black">»</span>
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>

      {/* Step Message */}
      <div className="w-full px-4 py-2.5 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center shadow-sm">
        <p className="text-xs text-[var(--viz-rose)] font-mono font-bold tracking-tight">
          {currentStep.message}
        </p>
      </div>

      {/* Control Timeline */}
      <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-[var(--viz-rose)]" />
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
            className="absolute h-1 bg-[var(--viz-rose)] rounded-full shadow-[0_0_10px_rgba(244,63,94,0.4)]" 
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
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Source (i)</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-rose)]" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Destination (j)</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-amber)]" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Intermediate (k)</span>
        </div>
      </div>
    </div>
  );
}
