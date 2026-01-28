"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, ChevronRight, ChevronLeft, GitCommit, ArrowRight, Share2, Layers, ListOrdered, Sparkles, Trophy, Shuffle } from "lucide-react";

const COLORS = {
  bg: "#1C1C1C",
  primary: "#58C4DD", // Processing Node
  secondary: "#FFFF00", // Edge reduction / Neighbor
  accent: "#FC6255", // In-degree 0 / Added to Queue
  success: "#83C167", // Sorted Result
  text: "#FFFFFF",
};

interface Step {
  inDegree: number[];
  queue: number[];
  result: number[];
  activeNode: number | null;
  activeEdge: [number, number] | null;
  desc: string;
  activeLine: number; // 0: init inDegree, 1: init queue, 2: pop node, 3: reduce neighbor, 4: add to queue
}

export default function TopoSortVisualizer({ speed = 800 }: { speed?: number }) {
  const [numNodes, setNumNodes] = useState(6);
  const [history, setHistory] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Graph Definition
  const nodes = useMemo(() => [
    { id: 0, label: "A" }, { id: 1, label: "B" }, { id: 2, label: "C" },
    { id: 3, label: "D" }, { id: 4, label: "E" }, { id: 5, label: "F" }
  ], []);

  const [edges, setEdges] = useState<[number, number][]>([
    [0, 2], [0, 3], [1, 3], [1, 4], [2, 5], [3, 5], [4, 5]
  ]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateRandomEdges = () => {
    setIsPlaying(false);
    const newEdges: [number, number][] = [];
    const n = nodes.length;
    
    // Ensure it's a DAG by only connecting i -> j where i < j
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            // Adjust probability to keep graph simple but interesting
            if (Math.random() > 0.65) {
                newEdges.push([i, j]);
            }
        }
    }
    
    // Ensure at least some connectivity if random fails
    if (newEdges.length === 0) {
        newEdges.push([0, 1], [1, 2], [2, 3], [3, 4], [4, 5]);
    }
    
    setEdges(newEdges);
  };

  // Pre-compute Kahn's Algorithm Steps
  useEffect(() => {
    const steps: Step[] = [];
    const n = nodes.length;
    const currentInDegree = new Array(n).fill(0);
    const adj: number[][] = Array.from({ length: n }, () => []);

    for (const [u, v] of edges) {
        adj[u].push(v);
        currentInDegree[v]++;
    }

    // Step 0: Initial State
    steps.push({
        inDegree: [...currentInDegree],
        queue: [],
        result: [],
        activeNode: null,
        activeEdge: null,
        desc: "Graph topology initialized. Computing in-degrees.",
        activeLine: 0
    });

    // Step 1: Initial Queue
    const q: number[] = [];
    for (let i = 0; i < n; i++) {
        if (currentInDegree[i] === 0) {
            q.push(i);
            steps.push({
                inDegree: [...currentInDegree],
                queue: [...q],
                result: [],
                activeNode: null,
                activeEdge: null,
                desc: `Node ${nodes[i].label} has in-degree 0. Adding to initial queue.`,
                activeLine: 1
            });
        }
    }

    const currentResult: number[] = [];

    while (q.length > 0) {
        const u = q.shift()!;
        currentResult.push(u);
        
        steps.push({
            inDegree: [...currentInDegree],
            queue: [...q],
            result: [...currentResult],
            activeNode: u,
            activeEdge: null,
            desc: `Processing Node ${nodes[u].label}. Appending to result manifold.`,
            activeLine: 2
        });

        for (const v of adj[u]) {
            steps.push({
                inDegree: [...currentInDegree],
                queue: [...q],
                result: [...currentResult],
                activeNode: u,
                activeEdge: [u, v],
                desc: `Reducing in-degree of neighbor ${nodes[v].label} (via dependency from ${nodes[u].label}).`,
                activeLine: 3
            });

            currentInDegree[v]--;
            
            if (currentInDegree[v] === 0) {
                q.push(v);
                steps.push({
                    inDegree: [...currentInDegree],
                    queue: [...q],
                    result: [...currentResult],
                    activeNode: null,
                    activeEdge: null,
                    desc: `${nodes[v].label} dependency satisfied (in-degree 0). Enqueueing.`,
                    activeLine: 4
                });
            }
        }
    }

    // Final Step
    steps.push({
        inDegree: [...currentInDegree],
        queue: [],
        result: [...currentResult],
        activeNode: null,
        activeEdge: null,
        desc: "Topological Sort complete. Linear order resolved.",
        activeLine: -1
    });

    setHistory(steps);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [nodes, edges]);

  // Playback Logic
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
      inDegree: [], queue: [], result: [], activeNode: null, activeEdge: null, desc: "Loading...", activeLine: -1 
  };

  const isComplete = currentStepIndex === history.length - 1;

  // Fixed Layout Positions (3Blue1Brown Style)
  const nodePositions = [
      { x: 80, y: 120 },   // A
      { x: 80, y: 280 },   // B
      { x: 200, y: 60 },   // C
      { x: 200, y: 200 },  // D
      { x: 200, y: 340 },  // E
      { x: 320, y: 200 },  // F
  ];

  return (
    <div className="flex flex-col gap-8 text-white font-sans">
      
      {/* Top Header: Execution Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Graph & Result Area */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Graph Visualization */}
            <div className="p-4 sm:p-8 bg-[#1C1C1C] border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[450px]">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
                
                <div className="flex items-center gap-3 absolute top-6 left-6 sm:top-8 sm:left-8 z-10">
                    <div className="p-2 bg-white/5 rounded-xl"><Share2 size={20} className="text-[#58C4DD]" /></div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Dependency Graph</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">DAG Manifold</p>
                    </div>
                </div>

                <div className="relative w-full aspect-square max-w-[320px] sm:max-w-[400px]">
                    <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
                        <defs>
                            <marker id="topo-arrowhead" markerWidth="10" markerHeight="7" refX="24" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#444" />
                            </marker>
                            <marker id="active-arrowhead" markerWidth="10" markerHeight="7" refX="24" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.secondary} />
                            </marker>
                        </defs>
                        
                        {edges.map(([u, v], idx) => {
                            const start = nodePositions[u];
                            const end = nodePositions[v];
                            const isActive = currentStep.activeEdge && currentStep.activeEdge[0] === u && currentStep.activeEdge[1] === v;
                            const isProcessed = currentStep.result.includes(u);

                            return (
                                <g key={`edge-${idx}`}>
                                    <motion.line
                                        x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                                        stroke={isActive ? COLORS.secondary : isProcessed ? COLORS.success : "#333"}
                                        strokeWidth={isActive ? 3 : 2}
                                        markerEnd={isActive ? "url(#active-arrowhead)" : "url(#topo-arrowhead)"}
                                        className="transition-colors duration-500"
                                    />
                                </g>
                            );
                        })}
                    </svg>

                    {nodes.map((n, idx) => {
                        const pos = nodePositions[idx];
                        const isProcessing = currentStep.activeNode === idx;
                        const isInQueue = currentStep.queue.includes(idx);
                        const isSorted = currentStep.result.includes(idx);
                        
                        let borderColor = "border-white/10";
                        let glow = "";
                        let textColor = "text-white/40";

                        if (isProcessing) { 
                            borderColor = `border-[${COLORS.primary}]`; 
                            glow = `shadow-[0_0_30px_${COLORS.primary}44]`;
                            textColor = `text-[${COLORS.primary}]`;
                        } else if (isInQueue) {
                            borderColor = `border-[${COLORS.accent}]`;
                            textColor = `text-[${COLORS.accent}]`;
                        } else if (isSorted) {
                            borderColor = `border-[${COLORS.success}]`;
                            textColor = `text-[${COLORS.success}]`;
                        }

                        return (
                            <motion.div
                                key={n.id}
                                className={`absolute w-10 h-10 sm:w-12 sm:h-12 -ml-5 -mt-5 sm:-ml-6 sm:-mt-6 rounded-full bg-[#0A0A0A] border-2 ${borderColor} flex flex-col items-center justify-center z-20 ${glow} transition-all duration-300`}
                                style={{ left: `${(pos.x / 400) * 100}%`, top: `${(pos.y / 400) * 100}%` }}
                                animate={{ scale: isProcessing ? 1.2 : 1 }}
                            >
                                <span className={`text-xs sm:text-sm font-bold font-mono ${textColor}`}>{n.label}</span>
                                <span className="text-[7px] sm:text-[8px] opacity-40 font-black">IN:{currentStep.inDegree[idx]}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Right: Sorted Result & Queue Buffer */}
            <div className="flex flex-col gap-8">
                <div className="p-8 bg-[#1C1C1C] border border-white/10 rounded-[2.5rem] shadow-2xl flex-1 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
                    
                    <div className="flex items-center gap-3 mb-6">
                        <ListOrdered className="text-[#83C167]" size={20} />
                        <h3 className="text-lg font-bold text-white">Sorted Output</h3>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <AnimatePresence>
                            {currentStep.result.map((nodeId, idx) => (
                                <motion.div
                                    key={`res-${nodeId}`}
                                    initial={{ opacity: 0, scale: 0.5, x: -20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[#83C167]/10 border border-[#83C167]/30 flex items-center justify-center text-[#83C167] font-bold font-mono">
                                        {nodes[nodeId].label}
                                    </div>
                                    {idx < currentStep.result.length - 1 && <ArrowRight size={14} className="text-white/10" />}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {currentStep.result.length === 0 && <span className="text-xs text-white/20 italic font-mono">Waiting for resolution...</span>}
                    </div>
                    
                    {isComplete && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 bg-[#83C167]/5 border border-[#83C167]/20 rounded-2xl flex items-center gap-4">
                            <Trophy className="text-[#83C167]" size={20} />
                            <p className="text-[10px] text-[#83C167] font-black uppercase tracking-widest">Valid Topological Order Achieved</p>
                        </motion.div>
                    )}
                </div>

                {/* Queue Buffer View */}
                <div className="p-6 bg-[#1C1C1C] border border-white/10 rounded-[2rem] shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Layers className="text-[#FC6255]" size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Kahn's Queue</span>
                    </div>
                    <div className="flex gap-3 min-h-[48px] items-center">
                        <AnimatePresence>
                            {currentStep.queue.map(nodeId => (
                                <motion.div
                                    key={`q-${nodeId}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="w-10 h-10 rounded-xl bg-[#FC6255]/10 border border-[#FC6255]/30 flex items-center justify-center text-[#FC6255] font-bold font-mono shadow-[0_0_15px_#FC625522]"
                                >
                                    {nodes[nodeId].label}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {currentStep.queue.length === 0 && <span className="text-[10px] text-white/10 font-mono italic">No ready nodes</span>}
                    </div>
                </div>
            </div>
        </div>

        {/* Pseudo-Code Section */}
        <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] font-mono text-xs relative overflow-hidden flex-1">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={80} /></div>
                <div className="space-y-3 relative z-10">
                    <div className={`p-2 rounded transition-colors ${currentStep.activeLine === 0 ? "bg-white/10 text-white" : "text-white/20"}`}>
                        0. Compute In-Degree of all nodes
                    </div>
                    <div className={`p-2 rounded transition-colors ${currentStep.activeLine === 1 ? "bg-[#FC6255]/20 text-[#FC6255]" : "text-white/20"}`}>
                        1. Push nodes with In-Degree 0 to Queue
                    </div>
                    <div className={`p-2 rounded transition-colors ${currentStep.activeLine === 2 ? "bg-[#58C4DD]/20 text-[#58C4DD]" : "text-white/20"}`}>
                        2. while Queue is not empty:
                        <br/>&nbsp;&nbsp;&nbsp;u = Queue.pop()
                    </div>
                    <div className={`pl-4 p-2 rounded transition-colors ${currentStep.activeLine === 3 ? "bg-[#FFFF00]/20 text-[#FFFF00]" : "text-white/20"}`}>
                        3. for each neighbor v of u:
                        <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;In-Degree[v]--
                    </div>
                    <div className={`pl-8 p-2 rounded transition-colors ${currentStep.activeLine === 4 ? "bg-[#83C167]/20 text-[#83C167] font-bold" : "text-white/20"}`}>
                        4. if In-Degree[v] == 0:
                        <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Queue.push(v)
                    </div>
                </div>
            </div>
            
            {/* Analysis Stats Table */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem]">
                <h4 className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-4">Dependency State</h4>
                <div className="grid grid-cols-3 gap-2">
                    {nodes.map((n, idx) => (
                        <div key={`stat-${idx}`} className={`p-2 rounded-xl border transition-all ${currentStep.inDegree[idx] === 0 ? "border-[#83C167]/40 bg-[#83C167]/5" : "border-white/5 bg-white/5"}`}>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold font-mono">{n.label}</span>
                                <span className={`text-[10px] font-mono ${currentStep.inDegree[idx] === 0 ? "text-[#83C167]" : "text-white/40"}`}>{currentStep.inDegree[idx]}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Control Footer */}
      <div className="p-8 bg-[#1C1C1C] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row gap-8 items-center justify-between">
           <div className="flex flex-col gap-2 flex-1 w-full">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <GitCommit className="text-[#FFFF00]" size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Step {currentStepIndex + 1} / {history.length}</span>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.span key={currentStep.desc} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-xs font-mono text-[#FFFF00] italic">
                            {currentStep.desc}
                        </motion.span>
                    </AnimatePresence>
                </div>
                
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden cursor-pointer group mt-2" onClick={(e) => {
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
           </div>

           <div className="flex gap-4">
                <button onClick={() => { setIsPlaying(false); setCurrentStepIndex(Math.max(0, currentStepIndex - 1)); }} className="p-3 hover:bg-white/10 rounded-2xl text-white/40"><ChevronLeft size={24} /></button>
                <button onClick={() => setIsPlaying(!isPlaying)} className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isPlaying ? "bg-[#FC6255]/20 text-[#FC6255]" : "bg-[#58C4DD] text-black shadow-[0_0_20px_#58C4DD44]"}`}>
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                        {isPlaying ? "HALT" : "EXECUTE"}
                </button>
                <button onClick={() => { setIsPlaying(false); setCurrentStepIndex(Math.min(history.length - 1, currentStepIndex + 1)); }} className="p-3 hover:bg-white/10 rounded-2xl text-white/40"><ChevronRight size={24} /></button>
                <button onClick={() => { setIsPlaying(false); setCurrentStepIndex(0); }} className="p-3 hover:bg-white/10 rounded-2xl text-white/40"><RotateCcw size={24} /></button>
                <button onClick={generateRandomEdges} className="p-3 hover:bg-white/10 rounded-2xl text-white/40" title="Randomize Graph"><Shuffle size={24} /></button>
           </div>
      </div>

    </div>
  );
}