"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, ChevronLeft, ChevronRight, Zap, 
  Activity, Grid, Network, Layout, Cpu, RefreshCw
} from "lucide-react";

/**
 * --- Configuration ---
 * Visual constants and color palette.
 */
const MANIM_COLORS = { 
  text: "var(--foreground)", 
  background: "var(--card)",
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#f59e0b",
  red: "#FC6255",
  purple: "#9A72AC",
  muted: "rgba(255,255,255,0.1)"
};

const INF = 99;

// --- Types ---

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

/**
 * Floyd-Warshall Visualizer Component
 * 
 * Visualizes the All-Pairs Shortest Path algorithm.
 * Demonstrates the transitive closure property by iteratively allowing intermediate nodes.
 */
export default function FloydWarshallVisualizer({ speed = 800 }: { speed?: number }) {
  const [numNodes, setNumNodes] = useState(4);
  const [history, setHistory] = useState<FWStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Coordinate Sync
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // --- Graph Generation ---
  const initialGraph = useMemo(() => {
    const mat = Array.from({ length: numNodes }, (_, r) => 
        Array.from({ length: numNodes }, (_, c) => {
            if (r === c) return 0;
            // Deterministic but "random-looking" weights
            const seed = (r * 7 + c * 13 + numNodes * 3) % 100; 
            if (seed > 65) return INF; 
            return (seed % 9) + 1;
        })
    );
    return mat;
  }, [numNodes]);

  const nodePositions = useMemo(() => {
    const radius = 100;
    const centerX = 150;
    const centerY = 150;
    return Array.from({ length: numNodes }, (_, i) => {
      const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2;
      return { x: Math.cos(angle) * radius + centerX, y: Math.sin(angle) * radius + centerY };
    });
  }, [numNodes]);

  // --- Algorithm Logic (Pre-computation) ---
  useEffect(() => {
    const steps: FWStep[] = [];
    // Deep copy initial graph
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

    const addLog = (l: string) => logs = [l, ...logs];

    addLog(`Initializing Adjacency Tensor (${n}x${n}).`);
    record("Initializing Distance Matrix. D[i][j] = Direct Edge Weight.", "INIT", -1, null, null, -1, "NONE");

    for (let k = 0; k < n; k++) {
      addLog(`Phase k=${k}: Allowing paths via Node ${k}.`);
      record(`Iteration k=${k}: Considering Node ${k} as intermediate vertex.`, "PHASE_START", k, null, null, 0, "NONE");

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) continue; // Distance to self is always 0

          const d_ik = dist[i][k];
          const d_kj = dist[k][j];
          const d_ij = dist[i][j];

          // Check connectivity first
          if (d_ik === INF || d_kj === INF) {
             // Path via k doesn't exist, no comparison needed
             continue; 
          }

          const sumPath = d_ik + d_kj;
          
          record(`Comparing: D[${i}][${j}] (${d_ij === INF ? '∞' : d_ij}) vs D[${i}][${k}] + D[${k}][${j}] (${d_ik} + ${d_kj} = ${sumPath}).`, "COMPARE", k, i, j, 3, "NONE");

          if (sumPath < d_ij) {
            dist[i][j] = sumPath;
            addLog(`Relaxed [${i}->${j}] via ${k}: New Cost ${sumPath}.`);
            record(`Path improved! Updating D[${i}][${j}] to ${sumPath}.`, "RELAX", k, i, j, 4, "RELAX");
          } else {
            // Optional: Record 'KEEP' state for educational clarity, but usually skipped to reduce noise
            // record(`Existing path is optimal. Keeping ${d_ij}.`, "KEEP", k, i, j, 4, "KEEP");
          }
        }
      }
    }

    addLog("All-Pairs Shortest Paths Resolved.");
    record("Algorithm Complete. Matrix contains optimal distances.", "COMPLETE", -1, null, null, -1, "NONE");

    setHistory(steps);
    setCurrentIndex(0);
  }, [initialGraph, numNodes]);

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
    matrix: initialGraph, k: -1, i: null, j: null, message: "Initializing...", step: "IDLE", activeLine: -1, decision: "NONE", logs: []
  };

  return (
    <div className="flex flex-col gap-6 font-sans select-none">
      
      {/* --- Main Dashboard --- */}
      <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        
        {/* Header UI */}
        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[#58C4DD]/10 rounded-xl text-[#58C4DD]">
                    <Grid size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Floyd-Warshall</h2>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">All-Pairs Shortest Path Tensor</p>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button onClick={() => setNumNodes(prev => (prev % 6) + 3)} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all" title="Change Graph Size"><RefreshCw size={18}/></button>
             <button onClick={() => { setIsPlaying(false); setCurrentIndex(0); }} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all"><RotateCcw size={18}/></button>
             <button 
                onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(!isPlaying); }} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${isPlaying ? "bg-muted text-foreground" : "bg-[#58C4DD] text-black hover:scale-105"}`}
             >
                {isPlaying ? <><Pause size={16} fill="currentColor"/> PAUSE</> : <><Play size={16} fill="currentColor"/> RUN</>}
             </button>
          </div>
        </div>

        {/* Visual Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Matrix View */}
            <div className="lg:col-span-5 relative p-6 bg-muted/30 rounded-[2rem] border border-border overflow-hidden shadow-inner flex flex-col items-center">
                <div className="absolute top-4 left-6 z-20">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentStep.step}
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -10 }} 
                            className="flex items-center gap-2 px-3 py-1.5 bg-card/80 border border-border backdrop-blur-md rounded-full shadow-sm"
                        >
                            <Zap size={12} className="text-[#58C4DD]" fill="#58C4DD" />
                            <span className="text-[9px] font-black font-mono text-[#58C4DD] uppercase tracking-widest">{currentStep.step}</span>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="relative z-10 w-full overflow-x-auto pb-4 custom-scrollbar mt-8">
                    <div className="min-w-fit flex flex-col items-center">
                        {/* Col Headers */}
                        <div className="flex">
                            <div className="w-10 h-10" />
                            {Array.from({ length: numNodes }).map((_, c) => (
                                <div key={`col-${c}`} className={`w-12 h-10 flex items-center justify-center font-mono text-[10px] font-black uppercase tracking-tight transition-all ${currentStep.j === c ? "text-[#FC6255] scale-125" : "text-muted-foreground/30"}`}>
                                    {c}
                                </div>
                            ))}
                        </div>
                        {/* Matrix */}
                        {currentStep.matrix.map((row, r) => (
                            <div key={`row-${r}`} className="flex mb-1">
                                {/* Row Header */}
                                <div className={`w-10 h-12 flex items-center justify-center font-mono text-[10px] font-black uppercase tracking-tight transition-all ${currentStep.i === r ? "text-[#58C4DD] scale-125" : "text-muted-foreground/30"}`}>
                                    {r}
                                </div>
                                {row.map((val, c) => {
                                    const isTarget = r === currentStep.i && c === currentStep.j;
                                    const isVia1 = r === currentStep.i && c === currentStep.k;
                                    const isVia2 = r === currentStep.k && c === currentStep.j;
                                    const isPivot = r === currentStep.k && c === currentStep.k; // The diagonal pivot [k][k]

                                    return (
                                        <div key={`${r}-${c}`} className="w-12 h-12 flex items-center justify-center relative">
                                            <motion.div
                                                initial={false}
                                                animate={{ 
                                                    scale: isTarget ? 1.15 : (isVia1 || isVia2) ? 1.1 : 1,
                                                    backgroundColor: isTarget ? `${MANIM_COLORS.red}20` : 
                                                                     (isVia1 || isVia2) ? `${MANIM_COLORS.blue}15` : 
                                                                     isPivot ? `${MANIM_COLORS.gold}10` : "transparent",
                                                    borderColor: isTarget ? MANIM_COLORS.red : 
                                                                 (isVia1 || isVia2) ? MANIM_COLORS.blue : 
                                                                 isPivot ? MANIM_COLORS.gold : "var(--border)",
                                                    opacity: val === INF ? 0.3 : 1
                                                }}
                                                className="w-10 h-10 border rounded-lg flex items-center justify-center text-xs font-mono font-bold shadow-sm"
                                            >
                                                <span className={isTarget ? "text-[#FC6255]" : (isVia1 || isVia2) ? "text-[#58C4DD]" : isPivot ? "text-[#f59e0b]" : "text-muted-foreground"}>{val === INF ? "∞" : val}</span>
                                            </motion.div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Variable Monitor */}
                <div className="mt-4 grid grid-cols-3 gap-2 w-full max-w-[300px]">
                    <div className="p-2 bg-card/50 border border-border rounded-lg flex flex-col items-center">
                        <span className="text-[7px] font-black text-muted-foreground/40 uppercase">Via (k)</span>
                        <span className="text-xs font-black text-[#f59e0b]">{currentStep.k !== -1 ? currentStep.k : "-"}</span>
                    </div>
                    <div className="p-2 bg-card/50 border border-border rounded-lg flex flex-col items-center">
                        <span className="text-[7px] font-black text-muted-foreground/40 uppercase">From (i)</span>
                        <span className="text-xs font-black text-[#58C4DD]">{currentStep.i !== null ? currentStep.i : "-"}</span>
                    </div>
                    <div className="p-2 bg-card/50 border border-border rounded-lg flex flex-col items-center">
                        <span className="text-[7px] font-black text-muted-foreground/40 uppercase">To (j)</span>
                        <span className="text-xs font-black text-[#FC6255]">{currentStep.j !== null ? currentStep.j : "-"}</span>
                    </div>
                </div>
            </div>

            {/* Topology View */}
            <div className="lg:col-span-4 relative p-6 bg-muted/30 rounded-[2rem] border border-border overflow-hidden shadow-inner flex flex-col items-center justify-center min-h-[300px]">
                <div className="absolute top-4 left-6 flex items-center gap-2 text-muted-foreground/20">
                    <Network size={12}/>
                    <span className="text-[8px] font-black uppercase tracking-widest">Graph State</span>
                </div>

                <div className="relative w-[280px] h-[280px]">
                    <svg className="w-full h-full pointer-events-none overflow-visible">
                        <defs>
                            <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-muted-foreground/20"/>
                            </marker>
                        </defs>
                        {/* Draw Edges */}
                        {initialGraph.map((row, u) => row.map((w, v) => {
                            if (u === v || w === INF) return null;
                            const start = nodePositions[u];
                            const end = nodePositions[v];
                            
                            // Highlight Paths
                            const isViaPath1 = u === currentStep.i && v === currentStep.k; // i -> k
                            const isViaPath2 = u === currentStep.k && v === currentStep.j; // k -> j
                            const isDirectPath = u === currentStep.i && v === currentStep.j; // i -> j

                            const isActive = isViaPath1 || isViaPath2 || isDirectPath;
                            const color = isDirectPath ? MANIM_COLORS.red : (isViaPath1 || isViaPath2) ? MANIM_COLORS.blue : "currentColor";

                            return (
                                <motion.line
                                    key={`edge-${u}-${v}`}
                                    x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                                    stroke={color}
                                    className={`${isActive ? "" : "text-muted-foreground/10"}`}
                                    strokeWidth={isActive ? 3 : 1}
                                    markerEnd={isActive ? "" : "url(#arrow)"} // Simplify for now
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                            );
                        }))}
                    </svg>
                    
                    {/* Draw Nodes */}
                    {nodePositions.map((pos, idx) => {
                        const isK = idx === currentStep.k;
                        const isI = idx === currentStep.i;
                        const isJ = idx === currentStep.j;
                        return (
                            <motion.div
                                key={idx}
                                animate={{ 
                                    scale: isK || isI || isJ ? 1.2 : 1,
                                    backgroundColor: isK ? MANIM_COLORS.gold : isI ? MANIM_COLORS.blue : isJ ? MANIM_COLORS.red : "var(--card)",
                                    borderColor: isK ? MANIM_COLORS.gold : isI ? MANIM_COLORS.blue : isJ ? MANIM_COLORS.red : "var(--border)",
                                    zIndex: isK ? 30 : (isI || isJ) ? 25 : 20
                                }}
                                className="absolute w-10 h-10 -ml-5 -mt-5 border-2 rounded-full flex items-center justify-center font-mono text-xs font-black shadow-lg"
                                style={{ left: pos.x, top: pos.y }}
                            >
                                <span className={isK || isI || isJ ? "text-black" : "text-foreground"}>{idx}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar Logic */}
            <div className="lg:col-span-3 flex flex-col gap-6">
                {/* Logic Card */}
                <div className="p-6 bg-muted/20 border border-border rounded-[2rem] flex flex-col gap-4">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2">
                        <Cpu size={14}/> Logic Core
                    </h3>
                    <div className="space-y-3 font-mono text-[9px]">
                        <div className={`p-2 rounded-lg border transition-all ${currentStep.activeLine === 3 ? "bg-[#58C4DD]/10 border-[#58C4DD] text-[#58C4DD]" : "border-transparent text-muted-foreground/40"}`}>
                            CHECK: Dist[i][k] + Dist[k][j] &lt; Dist[i][j]
                        </div>
                        {currentStep.i !== null && currentStep.k !== -1 && currentStep.j !== null && (
                            <div className="pl-2 border-l-2 border-border/50 text-[10px] text-muted-foreground">
                                <span className="text-[#58C4DD]">{currentStep.matrix[currentStep.i][currentStep.k] === INF ? '∞' : currentStep.matrix[currentStep.i][currentStep.k]}</span>
                                {" + "}
                                <span className="text-[#58C4DD]">{currentStep.matrix[currentStep.k][currentStep.j] === INF ? '∞' : currentStep.matrix[currentStep.k][currentStep.j]}</span>
                                {" vs "}
                                <span className="text-[#FC6255]">{currentStep.matrix[currentStep.i][currentStep.j] === INF ? '∞' : currentStep.matrix[currentStep.i][currentStep.j]}</span>
                            </div>
                        )}
                        <div className={`p-2 rounded-lg border transition-all ${currentStep.activeLine === 4 ? "bg-[#83C167]/10 border-[#83C167] text-[#83C167]" : "border-transparent text-muted-foreground/40"}`}>
                            UPDATE: Dist[i][j] = New Path
                        </div>
                    </div>
                </div>

                {/* Log Stream */}
                <div className="p-6 bg-muted/20 border border-border rounded-[2rem] flex-1 h-[200px] overflow-hidden">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2 mb-2">
                        <Activity size={14}/> Log
                    </h3>
                    <div className="flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-thin h-full">
                        <AnimatePresence mode="popLayout">
                            {currentStep.logs.slice(0, 8).map((log, i) => (
                                <motion.div
                                    key={`log-${currentIndex}-${i}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[9px] font-mono text-muted-foreground/70 flex gap-2 border-l-2 border-border pl-2 py-0.5"
                                >
                                    <span className="text-[#58C4DD]">»</span>
                                    {log}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="mt-4 p-6 bg-muted/30 border border-border rounded-[2.5rem] flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Hash size={14} className="text-[#f59e0b]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                        Frame {currentIndex + 1} / {history.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronRight size={18} /></button>
                </div>
            </div>

            {/* Scrubber */}
            <div className="relative flex items-center group/slider h-4">
                <div className="absolute w-full h-1 bg-background/20 rounded-full" />
                <motion.div 
                    className="absolute h-1 bg-[#58C4DD] rounded-full shadow-[0_0_10px_#58C4DD44]" 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }}
                />
                <input 
                    type="range" min="0" max={(history.length || 1) - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
            </div>
            
            <div className="flex justify-center">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentIndex} 
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="px-4 py-2 rounded-lg bg-card border border-border/50 text-[10px] font-mono text-[#f59e0b] text-center max-w-2xl"
                    >
                        {currentStep.message}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>

        {/* Legend */}
        <div className="px-10 py-6 bg-muted/10 border border-border/50 rounded-[2.5rem] flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-[#58C4DD]" /><span className="text-[9px] font-bold uppercase tracking-wider">Via Path (i→k, k→j)</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-[#FC6255]" /><span className="text-[9px] font-bold uppercase tracking-wider">Target (i→j)</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-[#f59e0b]" /><span className="text-[9px] font-bold uppercase tracking-wider">Intermediate (k)</span></div>
        </div>

      </div>
    </div>
  );
}