"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, ChevronRight, ChevronLeft, GitCommit, ArrowRight, Share2, Grid } from "lucide-react";

const INF = 999;
const VISUAL_INF = "∞";

const COLORS = {
  bg: "#1C1C1C",
  primary: "#58C4DD", // i (Source)
  secondary: "#FFFF00", // k (Intermediate)
  accent: "#FC6255", // j (Destination)
  success: "#83C167",
  text: "#FFFFFF",
  gridBorder: "rgba(255,255,255,0.1)",
  gridBg: "rgba(255,255,255,0.02)"
};

interface Step {
  matrix: number[][];
  k: number;
  i: number | null;
  j: number | null;
  desc: string;
  activeLine: number; // 0: k-loop, 1: i-loop, 2: j-loop, 3: check, 4: update
  highlight: {
    cells: [number, number][]; // [row, col]
    nodes: number[];
    edges: [number, number][];
  };
}

export default function FloydWarshallVisualizer({ speed = 600 }: { speed?: number }) {
  const [numNodes, setNumNodes] = useState(4);
  const [history, setHistory] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Graph
  const initialGraph = useMemo(() => {
    // Deterministic random graph for stability
    const mat = Array.from({ length: numNodes }, (_, r) => 
        Array.from({ length: numNodes }, (_, c) => {
            if (r === c) return 0;
            // Create a connected weighted graph
            const seed = (r * 7 + c * 13) % 100; 
            if (seed > 65) return INF; // 35% chance of edge
            return (seed % 9) + 1; // Weights 1-9
        })
    );
    return mat;
  }, [numNodes]);

  // Pre-compute Algorithm History
  useEffect(() => {
    const steps: Step[] = [];
    const dist = initialGraph.map(row => [...row]);
    const n = numNodes;

    // Initial State
    steps.push({
      matrix: dist.map(r => [...r]),
      k: -1, i: null, j: null,
      desc: "Initialized Distance Matrix",
      activeLine: -1,
      highlight: { cells: [], nodes: [], edges: [] }
    });

    for (let k = 0; k < n; k++) {
      steps.push({
        matrix: dist.map(r => [...r]),
        k, i: null, j: null,
        desc: `Relaxing via intermediate node k=${k}`,
        activeLine: 0,
        highlight: { cells: [], nodes: [k], edges: [] }
      });

      for (let i = 0; i < n; i++) {
        if (i === k) continue; // Optimization: dist[k][k] is 0
        
        steps.push({
            matrix: dist.map(r => [...r]),
            k, i, j: null,
            desc: `Processing source i=${i}`,
            activeLine: 1,
            highlight: { cells: [[i, k]], nodes: [k, i], edges: [[i, k]] }
        });

        for (let j = 0; j < n; j++) {
          if (j === k || j === i) continue;

          const d_ik = dist[i][k];
          const d_kj = dist[k][j];
          const d_ij = dist[i][j];

          // Comparison Step
          steps.push({
            matrix: dist.map(r => [...r]),
            k, i, j,
            desc: `Checking path ${i}→${k}→${j}`,
            activeLine: 3,
            highlight: { 
                cells: [[i, k], [k, j], [i, j]], 
                nodes: [i, k, j], 
                edges: [[i, k], [k, j], [i, j]] 
            }
          });

          if (d_ik !== INF && d_kj !== INF && d_ik + d_kj < d_ij) {
            dist[i][j] = d_ik + d_kj;
            
            // Update Step
            steps.push({
              matrix: dist.map(r => [...r]),
              k, i, j,
              desc: `Relaxed: ${d_ik} + ${d_kj} < ${d_ij === INF ? "∞" : d_ij}. New Dist: ${dist[i][j]}`,
              activeLine: 4,
              highlight: { 
                  cells: [[i, j]], 
                  nodes: [i, k, j], 
                  edges: [[i, j]] 
              }
            });
          }
        }
      }
    }

    // Final Completion Step
    steps.push({
      matrix: dist.map(r => [...r]),
      k: -1, i: null, j: null,
      desc: "All-Pairs Shortest Paths Computed successfully.",
      activeLine: -1,
      highlight: { cells: [], nodes: [], edges: [] }
    });

    setHistory(steps);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [initialGraph, numNodes]);

  // Playback Control
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
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

  const currentStep = history[currentStepIndex] || { 
      matrix: [], k: 0, i: 0, j: 0, desc: "Loading...", activeLine: -1, highlight: { cells: [], nodes: [], edges: [] } 
  };

  // --- Graph Visualization Components ---
  const nodePositions = useMemo(() => {
    const radius = 120;
    return Array.from({ length: numNodes }, (_, i) => {
      const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2;
      return { x: Math.cos(angle) * radius + 160, y: Math.sin(angle) * radius + 160 };
    });
  }, [numNodes]);

  return (
    <div className="flex flex-col gap-8 text-white font-sans">
      
      {/* Main Visualization Area */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Left: Matrix View */}
        <div className="p-8 bg-[#1C1C1C] border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
            
            <div className="flex items-center gap-3 mb-8 relative z-10 self-start">
                <div className="p-2 bg-white/5 rounded-xl"><Grid size={20} className="text-[#58C4DD]" /></div>
                <div>
                    <h3 className="text-lg font-bold text-white">Distance Matrix</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Adjacency Representation</p>
                </div>
            </div>

            <div className="relative z-10">
                <div className="flex">
                    <div className="w-10 h-10" /> {/* Corner Spacer */}
                    {Array.from({ length: numNodes }).map((_, c) => (
                        <div key={`col-${c}`} className={`w-12 h-10 flex items-center justify-center font-mono text-xs font-bold ${currentStep.j === c ? "text-[#FC6255] scale-125" : "text-white/20"} transition-all`}>
                            {c}
                        </div>
                    ))}
                </div>
                {currentStep.matrix.map((row, r) => (
                    <div key={`row-${r}`} className="flex">
                        <div className={`w-10 h-12 flex items-center justify-center font-mono text-xs font-bold ${currentStep.i === r ? "text-[#58C4DD] scale-125" : "text-white/20"} transition-all`}>
                            {r}
                        </div>
                        {row.map((val, c) => {
                            const isHighlighted = currentStep.highlight.cells.some(([hr, hc]) => hr === r && hc === c);
                            const isPivot = r === currentStep.k && c === currentStep.k;
                            const isSourcePivot = r === currentStep.i && c === currentStep.k;
                            const isPivotDest = r === currentStep.k && c === currentStep.j;
                            const isTarget = r === currentStep.i && c === currentStep.j;

                            let bgColor = "bg-white/5";
                            let borderColor = "border-white/5";
                            let textColor = "text-white/40";
                            let scale = 1;

                            if (isPivot) {
                                borderColor = `border-[${COLORS.secondary}]`;
                                textColor = `text-[${COLORS.secondary}]`;
                                bgColor = `bg-[${COLORS.secondary}]/10`;
                            } else if (isTarget) {
                                borderColor = `border-[${COLORS.accent}]`;
                                textColor = `text-[${COLORS.accent}]`;
                                bgColor = `bg-[${COLORS.accent}]/10`;
                                scale = 1.1;
                            } else if (isSourcePivot) {
                                borderColor = `border-[${COLORS.primary}]`;
                                textColor = `text-[${COLORS.primary}]`;
                            } else if (isPivotDest) {
                                borderColor = `border-[${COLORS.secondary}]`;
                                textColor = `text-[${COLORS.secondary}]`;
                            } else if (isHighlighted) {
                                bgColor = "bg-white/10";
                                textColor = "text-white";
                            }

                            return (
                                <motion.div
                                    key={`${r}-${c}`}
                                    initial={false}
                                    animate={{ scale, backgroundColor: bgColor.replace("bg-", ""), borderColor: borderColor.replace("border-", "") }}
                                    className={`w-12 h-12 border ${borderColor} ${bgColor} flex items-center justify-center text-sm font-mono transition-colors duration-300 relative group`}
                                >
                                    <span className={textColor}>{val === INF ? VISUAL_INF : val}</span>
                                    {isTarget && <motion.div layoutId="outline" className="absolute inset-0 border-2 border-[#FC6255] rounded-lg" transition={{ type: "spring" }} />}
                                </motion.div>
                            );
                        })}
                    </div>
                ))}
            </div>
            
            {/* Variable Monitor */}
            <div className="mt-8 flex gap-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex flex-col items-center gap-1 min-w-[60px]">
                   <span className="text-[9px] font-black uppercase text-[#58C4DD] tracking-widest">Source i</span>
                   <span className="text-xl font-mono">{currentStep.i ?? "-"}</span>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="flex flex-col items-center gap-1 min-w-[60px]">
                   <span className="text-[9px] font-black uppercase text-[#FFFF00] tracking-widest">Via k</span>
                   <span className="text-xl font-mono">{currentStep.k}</span>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="flex flex-col items-center gap-1 min-w-[60px]">
                   <span className="text-[9px] font-black uppercase text-[#FC6255] tracking-widest">Dest j</span>
                   <span className="text-xl font-mono">{currentStep.j ?? "-"}</span>
                </div>
            </div>
        </div>

        {/* Right: Graph Topology View */}
        <div className="p-8 bg-[#1C1C1C] border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
             <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(45deg, #fff 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
             
             <div className="flex items-center gap-3 mb-8 relative z-10 self-start">
                <div className="p-2 bg-white/5 rounded-xl"><Share2 size={20} className="text-[#83C167]" /></div>
                <div>
                    <h3 className="text-lg font-bold text-white">Topology</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Weighted Graph View</p>
                </div>
            </div>

             <div className="relative w-[320px] h-[320px]">
                <svg className="w-full h-full visible overflow-visible">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#444" />
                        </marker>
                    </defs>
                    
                    {/* Edges */}
                    {initialGraph.map((row, u) => 
                        row.map((weight, v) => {
                            if (u === v || weight === INF) return null;
                            const start = nodePositions[u];
                            const end = nodePositions[v];
                            
                            // Check if this edge is active in the current calculation
                            const isActive = 
                                (u === currentStep.i && v === currentStep.k) || // i -> k
                                (u === currentStep.k && v === currentStep.j) || // k -> j
                                (u === currentStep.i && v === currentStep.j);   // i -> j
                                
                            const isOptimized = isActive && currentStep.activeLine === 4 && u === currentStep.i && v === currentStep.j;

                            return (
                                <g key={`edge-${u}-${v}`}>
                                    <motion.line
                                        x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                                        stroke={isActive ? (isOptimized ? COLORS.success : COLORS.text) : "#333"}
                                        strokeWidth={isActive ? 3 : 1}
                                        markerEnd={isActive ? "" : "url(#arrowhead)"}
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        className="transition-colors duration-300"
                                    />
                                    {/* Weight Label */}
                                    <motion.text
                                        x={(start.x + end.x) / 2}
                                        y={(start.y + end.y) / 2 - 5}
                                        fill={isActive ? "#FFF" : "#555"}
                                        fontSize="10"
                                        textAnchor="middle"
                                        className="font-mono font-bold bg-black"
                                    >
                                        {/* Show updated weight if it's i->j, else static */}
                                        {u === currentStep.i && v === currentStep.j ? currentStep.matrix[u][v] : weight}
                                    </motion.text>
                                </g>
                            );
                        })
                    )}
                </svg>

                {/* Nodes */}
                {nodePositions.map((pos, idx) => {
                    const isK = idx === currentStep.k;
                    const isI = idx === currentStep.i;
                    const isJ = idx === currentStep.j;

                    let ringColor = "border-white/10";
                    let glow = "";
                    
                    if (isK) { ringColor = `border-[${COLORS.secondary}]`; glow = `shadow-[0_0_30px_${COLORS.secondary}44]`; }
                    if (isI) { ringColor = `border-[${COLORS.primary}]`; glow = `shadow-[0_0_30px_${COLORS.primary}44]`; }
                    if (isJ) { ringColor = `border-[${COLORS.accent}]`; glow = `shadow-[0_0_30px_${COLORS.accent}44]`; }

                    return (
                        <motion.div
                            key={`node-${idx}`}
                            className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full bg-[#0A0A0A] border-2 ${ringColor} flex items-center justify-center font-bold font-mono text-lg z-20 ${glow} transition-all duration-300`}
                            style={{ left: pos.x, top: pos.y }}
                            animate={{ scale: isK || isI || isJ ? 1.2 : 1 }}
                        >
                            <span style={{ color: isK ? COLORS.secondary : isI ? COLORS.primary : isJ ? COLORS.accent : "#666" }}>
                                {idx}
                            </span>
                        </motion.div>
                    );
                })}
             </div>
        </div>
      </div>

      {/* Control & Analysis Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls */}
          <div className="lg:col-span-8 p-6 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col justify-between">
               <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <GitCommit className="text-[#FFFF00]" size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Step {currentStepIndex + 1} / {history.length}</span>
                    </div>
                    
                    <div className="flex gap-2">
                        <button onClick={() => { setIsPlaying(false); setCurrentStepIndex(Math.max(0, currentStepIndex - 1)); }} className="p-2 hover:bg-white/10 rounded-xl text-white/60"><ChevronLeft size={18} /></button>
                        <button onClick={() => setIsPlaying(!isPlaying)} className={`flex items-center gap-2 px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isPlaying ? "bg-[#FC6255]/20 text-[#FC6255]" : "bg-[#58C4DD] text-black shadow-[0_0_20px_#58C4DD44]"}`}>
                             {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                             {isPlaying ? "HALT" : "EXECUTE"}
                        </button>
                        <button onClick={() => { setIsPlaying(false); setCurrentStepIndex(Math.min(history.length - 1, currentStepIndex + 1)); }} className="p-2 hover:bg-white/10 rounded-xl text-white/60"><ChevronRight size={18} /></button>
                        <button onClick={() => { setIsPlaying(false); setCurrentStepIndex(0); }} className="p-2 hover:bg-white/10 rounded-xl text-white/60"><RotateCcw size={18} /></button>
                    </div>
               </div>
               
               {/* Progress Bar */}
               <div className="relative h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer group" onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const pct = (e.clientX - rect.left) / rect.width;
                   setCurrentStepIndex(Math.floor(pct * history.length));
               }}>
                   <motion.div 
                        className="absolute top-0 left-0 h-full bg-[#58C4DD]" 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStepIndex + 1) / history.length) * 100}%` }}
                   />
               </div>
               <div className="mt-4 text-center h-10 flex items-center justify-center">
                   <AnimatePresence mode="wait">
                        <motion.p key={currentStep.desc} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="font-mono text-sm text-[#FFFF00]">
                             {currentStep.desc}
                        </motion.p>
                   </AnimatePresence>
               </div>
          </div>

          {/* Pseudo-Code View */}
          <div className="lg:col-span-4 p-6 bg-black/40 border border-white/5 rounded-[2rem] font-mono text-xs overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10"><ArrowRight size={80} /></div>
              <div className="space-y-2 relative z-10">
                  <div className={`p-1.5 rounded ${currentStep.activeLine === 0 ? "bg-[#FFFF00]/20 text-[#FFFF00]" : "text-white/30"}`}>
                      for k from 0 to N:
                  </div>
                  <div className={`pl-4 p-1.5 rounded ${currentStep.activeLine === 1 ? "bg-[#58C4DD]/20 text-[#58C4DD]" : "text-white/30"}`}>
                      for i from 0 to N:
                  </div>
                  <div className={`pl-8 p-1.5 rounded ${currentStep.activeLine === 2 ? "bg-[#FC6255]/20 text-[#FC6255]" : "text-white/30"}`}>
                      for j from 0 to N:
                  </div>
                  <div className={`pl-12 p-1.5 rounded ${currentStep.activeLine === 3 ? "bg-white/10 text-white" : "text-white/30"}`}>
                      if D[i][k] + D[k][j] &lt; D[i][j]:
                  </div>
                  <div className={`pl-16 p-1.5 rounded ${currentStep.activeLine === 4 ? "bg-[#83C167]/20 text-[#83C167] font-bold" : "text-white/30"}`}>
                      D[i][j] = D[i][k] + D[k][j]
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
}