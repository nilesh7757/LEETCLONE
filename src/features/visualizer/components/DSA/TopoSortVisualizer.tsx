"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Sparkles, Hash, Link as LinkIcon, 
  Search, Info, ChevronLeft, ChevronRight, Zap, GitBranch,
  Layers, ArrowUp, MousePointer2, Network, Share2, StepForward,
  TrendingUp, Activity, Layout, Plus, Trash2, Cpu, Database,
  ArrowRight, ArrowDown, Type, Shuffle, ListOrdered
} from "lucide-react";

// Professional Palette
const MANIM_COLORS = { 
  text: "var(--foreground)", 
  background: "var(--card)",
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#f59e0b",
  red: "#FC6255",
  purple: "#9A72AC"
};

const NUM_NODES = 6;

interface TopoStep {
  inDegree: number[];
  queue: number[];
  result: number[];
  activeNode: number | null;
  activeEdge: [number, number] | null;
  message: string;
  step: string;
  logs: string[];
}

export default function TopoSortVisualizer({ speed = 800 }: { speed?: number }) {
  const [edges, setEdges] = useState<[number, number][]>([
    [0, 2], [0, 3], [1, 3], [1, 4], [2, 5], [3, 5], [4, 5]
  ]);
  const [history, setHistory] = useState<TopoStep[]>([]);
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

  const labels = ["A", "B", "C", "D", "E", "F"];

  const generateRandomEdges = () => {
    setIsPlaying(false);
    const newEdges: [number, number][] = [];
    for (let i = 0; i < NUM_NODES; i++) {
        for (let j = i + 1; j < NUM_NODES; j++) {
            if (Math.random() > 0.7) newEdges.push([i, j]);
        }
    }
    if (newEdges.length === 0) newEdges.push([0, 1], [1, 2], [2, 3]);
    setEdges(newEdges);
  };

  // Algorithm Simulation
  useEffect(() => {
    const steps: TopoStep[] = [];
    let logs: string[] = [];
    let inDegree = new Array(NUM_NODES).fill(0);
    const adj: number[][] = Array.from({ length: NUM_NODES }, () => []);

    for (const [u, v] of edges) {
        adj[u].push(v);
        inDegree[v]++;
    }

    const record = (msg: string, step: string, active: number | null = null, edge: [number, number] | null = null, q: number[] = [], res: number[] = []) => {
      steps.push({
        inDegree: [...inDegree],
        queue: [...q],
        result: [...res],
        activeNode: active,
        activeEdge: edge,
        message: msg,
        step: step,
        logs: [...logs]
      });
    };

    const addLog = (l: string) => logs = [l, ...logs];

    addLog("Dependency manifold initialized.");
    record("Calculating in-degrees for all nodes.", "BOOT", null, null, [], []);

    let q: number[] = [];
    for (let i = 0; i < NUM_NODES; i++) {
        if (inDegree[i] === 0) {
            q.push(i);
            addLog(`Node ${labels[i]} has zero dependencies.`);
            record(`Source node ${labels[i]} detected. Adding to search buffer.`, "SOURCE_FOUND", i, null, q, []);
        }
    }

    let res: number[] = [];
    while (q.length > 0) {
        const u = q.shift()!;
        res.push(u);
        addLog(`Processing bit ${labels[u]}.`);
        record(`Extracting node ${labels[u]} and appending to sorted sequence.`, "EXTRACTION", u, null, q, res);

        for (const v of adj[u]) {
            record(`Reducing dependency for neighbor ${labels[v]}.`, "RELAX", u, [u, v], q, res);
            inDegree[v]--;
            if (inDegree[v] === 0) {
                q.push(v);
                addLog(`Node ${labels[v]} dependencies resolved.`);
                record(`In-degree for ${labels[v]} reached zero. Enqueueing.`, "BUFFER_ADD", v, null, q, res);
            }
        }
    }

    addLog("Topological resolution complete.");
    record("Global sequence fully resolved.", "COMPLETE", null, null, [], res);

    setHistory(steps);
    setCurrentIndex(0);
  }, [edges]);

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
    inDegree: [], queue: [], result: [], activeNode: null, activeEdge: null, message: "Initializing...", step: "IDLE", logs: []
  };

  const nodePositions = [
    { x: 100, y: 100 }, { x: 100, y: 300 }, { x: 250, y: 50 }, { x: 250, y: 200 }, { x: 250, y: 350 }, { x: 400, y: 200 }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="p-8 bg-card border border-border rounded-3xl shadow-2xl font-sans text-foreground relative overflow-hidden">
        {/* Grid Backdrop */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        {/* Header UI */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 relative z-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[#58C4DD]">
              Topo-Sort <span className="text-muted-foreground/40">Lemma</span>
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-1 w-12 bg-[#58C4DD] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/30">Kahn's Manifold Synthesis</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button onClick={generateRandomEdges} className="p-3 bg-muted hover:bg-white/5 rounded-xl border border-border transition-all text-muted-foreground hover:text-foreground"><Shuffle size={20}/></button>
             <button onClick={() => { setIsPlaying(false); setCurrentIndex(0); }} className="p-3 bg-muted hover:bg-white/5 rounded-xl border border-border transition-all text-muted-foreground hover:text-foreground"><RotateCcw size={20}/></button>
             
             {!isPlaying ? (
                <button onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(true); }} className="flex items-center gap-2 px-6 py-3 bg-[#58C4DD] text-black rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-lg">
                    <Play size={16} fill="currentColor"/> EXECUTE
                </button>
             ) : (
                <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 px-6 py-3 bg-white/10 text-foreground rounded-xl font-bold text-xs hover:bg-white/20 transition-all">
                    <Pause size={16} fill="currentColor"/> HALT
                </button>
             )}
          </div>
        </div>

        {/* Visual Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div ref={containerRef} className="lg:col-span-8 relative min-h-[450px] bg-muted/40 rounded-[2.5rem] border border-border overflow-hidden shadow-inner flex flex-col items-center justify-center p-8">
                
                {/* Logic Step Badge */}
                <AnimatePresence>
                    {currentStep.step !== "IDLE" && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-8 left-10 flex items-center gap-2 px-4 py-2 bg-[#58C4DD]/10 border border-[#58C4DD]/30 rounded-full z-30 shadow-lg">
                            <Zap size={12} className="text-[#58C4DD]" />
                            <span className="text-[9px] font-black font-mono text-[#58C4DD] uppercase tracking-[0.2em]">{currentStep.step}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Explanation Box */}
                <AnimatePresence mode="wait">
                    <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-8 w-full max-w-[400px] px-10 text-center z-30">
                        <div className="p-4 bg-card/80 border border-border rounded-2xl backdrop-blur-md shadow-2xl">
                            <p className="text-[10px] text-[#f59e0b] font-mono italic uppercase tracking-tighter">{currentStep.message}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Graph Topology */}
                <div className="relative w-[500px] h-[400px]">
                    <svg className="w-full h-full pointer-events-none overflow-visible">
                        <defs>
                            <marker id="topo-arrow" markerWidth="10" markerHeight="7" refX="24" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-muted-foreground/40" />
                            </marker>
                        </defs>
                        {edges.map(([u, v], i) => {
                            const start = nodePositions[u];
                            const end = nodePositions[v];
                            const isActive = currentStep.activeEdge?.[0] === u && currentStep.activeEdge?.[1] === v;
                            const isResolved = currentStep.result.includes(u);
                            return (
                                <motion.line
                                    key={`edge-${i}`}
                                    x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                                    stroke="currentColor"
                                    className={`${isActive ? "text-[#f59e0b]" : isResolved ? "text-[#83C167] opacity-20" : "text-muted-foreground/10"}`}
                                    strokeWidth={isActive ? 3 : 1.5}
                                    markerEnd="url(#topo-arrow)"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                            );
                        })}
                    </svg>
                    {nodePositions.map((pos, i) => {
                        const isA = currentStep.activeNode === i;
                        const isQ = currentStep.queue.includes(i);
                        const isR = currentStep.result.includes(i);
                        return (
                            <motion.div
                                key={i}
                                animate={{ 
                                    scale: isA ? 1.2 : 1,
                                    backgroundColor: isA ? MANIM_COLORS.gold : isR ? `${MANIM_COLORS.green}10` : isQ ? `${MANIM_COLORS.blue}10` : "var(--card)",
                                    borderColor: isA ? MANIM_COLORS.gold : isR ? MANIM_COLORS.green : isQ ? MANIM_COLORS.blue : "var(--border)",
                                    boxShadow: isA ? `0 0 30px ${MANIM_COLORS.gold}44` : isQ ? `0 0 20px ${MANIM_COLORS.blue}22` : "none"
                                }}
                                className="absolute w-12 h-12 -ml-6 -mt-6 border-2 rounded-full flex flex-col items-center justify-center font-mono shadow-lg z-20"
                                style={{ left: pos.x, top: pos.y }}
                            >
                                <span className={`text-sm font-black ${isA ? "text-black" : "text-foreground"}`}>{labels[i]}</span>
                                <div className="absolute -bottom-6 text-[7px] font-black text-muted-foreground/30 uppercase tracking-tighter">
                                    IN:{currentStep.inDegree[i]}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar: Result & Stream */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="p-6 bg-muted border border-border rounded-[2rem] flex flex-col gap-4">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2">
                        <ListOrdered size={14}/> Sorted Sequence
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center min-h-[40px]">
                        <AnimatePresence>
                            {currentStep.result.map((idx) => (
                                <motion.div
                                    key={`res-${idx}`}
                                    initial={{ scale: 0, x: -20 }}
                                    animate={{ scale: 1, x: 0 }}
                                    className="w-8 h-8 rounded-lg border border-[#83C167] bg-[#83C167]/10 flex items-center justify-center font-mono text-xs font-black text-[#83C167]"
                                >
                                    {labels[idx]}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {currentStep.result.length === 0 && <span className="text-[9px] italic text-muted-foreground/20">Awaiting resolution...</span>}
                    </div>
                </div>

                <div className="p-6 bg-muted border border-border rounded-[2rem] flex-1 flex flex-col gap-4 overflow-hidden h-[240px]">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2">
                        <Activity size={14}/> Resolve Stream
                    </h3>
                    <div className="flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-thin">
                        <AnimatePresence>
                            {currentStep.logs.map((log, i) => (
                                <motion.div
                                    key={`log-${i}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[9px] font-mono text-muted-foreground/60 flex gap-2 border-l-2 border-border pl-2 py-0.5"
                                >
                                    <span className="text-[#58C4DD]">»</span>
                                    {log}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {currentStep.logs.length === 0 && <span className="text-[9px] italic text-muted-foreground/20 text-center py-8">Bit stream empty...</span>}
                    </div>
                </div>

                <div className="p-6 bg-muted border border-border rounded-[2rem]">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest mb-4 flex items-center gap-2">
                        <Layers size={14}/> Buffer (In-Degree 0)
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {currentStep.queue.map((idx) => (
                            <div key={`q-${idx}`} className="w-8 h-8 rounded bg-[#58C4DD]/10 border border-[#58C4DD]/30 flex items-center justify-center text-[10px] font-black text-[#58C4DD]">
                                {labels[idx]}
                            </div>
                        ))}
                        {currentStep.queue.length === 0 && <span className="text-[9px] italic text-muted-foreground/20">Buffer empty</span>}
                    </div>
                </div>
            </div>
        </div>

        {/* Scrubber UI */}
        <div className="mt-8 p-6 bg-muted border border-border rounded-[2.5rem] flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Hash size={14} className="text-[#f59e0b]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Lemma Sequence {currentIndex + 1} of {history.length || 1}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider">
                <div className="absolute w-full h-1 bg-background/10 rounded-full" />
                <div className="absolute h-1 bg-[#58C4DD] rounded-full shadow-[0_0_10px_#58C4DD44]" style={{ width: `${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}%` }} />
                <input 
                    type="range" min="0" max={(history.length || 1) - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute w-1.5 h-4 bg-[#f59e0b] rounded-full shadow-[0_0_15px_#f59e0b] pointer-events-none transition-all"
                    style={{ left: `calc(${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}% - 3px)` }}
                />
            </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-10 py-6 bg-muted/20 border border-border rounded-[2.5rem] flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Active Extraction</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#58C4DD]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Ready Manifold</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#83C167]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Resolved Dependency</span></div>
         <div className="flex items-center gap-3"><Network size={14} className="text-muted-foreground/20" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Linear Resolution</span></div>
      </div>
    </div>
  );
}