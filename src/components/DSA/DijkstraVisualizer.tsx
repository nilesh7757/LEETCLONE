"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, RefreshCw, MapPin, Pause, Sparkles, Target, Info, ChevronRight, ChevronLeft } from "lucide-react";

const NUM_NODES = 5;
const RADIUS = 100;
const CENTER = 150;
const INF = 99; // Visual infinity

type Node = { id: number; x: number; y: number };

interface DijkstraStep {
  distances: number[];
  visited: Set<number>;
  activeNode: number | null;
  activeEdge: string | null; // "u-v"
  checkingCell: { r: number; c: number } | null;
  logs: string[];
  explanation: string;
}

export default function DijkstraVisualizer({ speed = 800 }: { speed?: number }) {
  // Topology State (Constant during run)
  const [nodes, setNodes] = useState<Node[]>([]);
  const [matrix, setMatrix] = useState<number[][]>([]); // Adjacency Matrix

  // Playback State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Generate Graph Topology
  useEffect(() => {
    generateGraph();
  }, []);

  const generateGraph = () => {
    setIsPlaying(false);
    setCurrentIndex(0);

    const newNodes: Node[] = [];
    for (let i = 0; i < NUM_NODES; i++) {
      const angle = (i / NUM_NODES) * 2 * Math.PI - Math.PI / 2;
      newNodes.push({
        id: i,
        x: CENTER + RADIUS * Math.cos(angle),
        y: CENTER + RADIUS * Math.sin(angle),
      });
    }
    setNodes(newNodes);

    const newMatrix = Array(NUM_NODES).fill(0).map(() => Array(NUM_NODES).fill(0));
    for (let i = 0; i < NUM_NODES; i++) {
      for (let j = i + 1; j < NUM_NODES; j++) {
        // 50% chance of edge
        if (Math.random() < 0.5) {
          const weight = Math.floor(Math.random() * 9) + 1;
          newMatrix[i][j] = weight;
          newMatrix[j][i] = weight;
        }
      }
    }
    setMatrix(newMatrix);
  };

  // 2. Pre-compute History
  const history = useMemo(() => {
    if (nodes.length === 0 || matrix.length === 0) return [];

    const steps: DijkstraStep[] = [];
    
    // Simulation State
    let dist = Array(NUM_NODES).fill(INF);
    let visited = new Set<number>();
    let logs: string[] = [];
    let activeNode: number | null = null;
    let activeEdge: string | null = null;
    let checkingCell: { r: number; c: number } | null = null;

    // Helper to record a step
    const record = (explanation: string) => {
      steps.push({
        distances: [...dist],
        visited: new Set(visited),
        activeNode,
        activeEdge,
        checkingCell,
        logs: [...logs], // Store copy of logs
        explanation
      });
    };

    // Initial State
    dist[0] = 0;
    logs.push(`Initialized distances to \u221E`);
    logs.push(`Start Node: 0 (dist: 0)`);
    record("Algorithm Initialized. Distance to Source (0) set to 0.");

    for (let i = 0; i < NUM_NODES; i++) {
        // Find unvisited node with min distance
        let u = -1;
        let minVal = Infinity;
        for (let v = 0; v < NUM_NODES; v++) {
            if (!visited.has(v) && dist[v] < minVal) {
                minVal = dist[v];
                u = v;
            }
        }

        if (u === -1 || dist[u] === INF) {
             record("No more reachable nodes. Algorithm terminates.");
             break;
        }

        activeNode = u;
        logs.unshift(`Selected Min Node: ${u} (dist: ${dist[u]})`);
        record(`Selected Node ${u} with minimum distance ${dist[u]}.`);

        // Visit Neighbors
        for (let v = 0; v < NUM_NODES; v++) {
            if (u === v) continue;

            checkingCell = { r: u, c: v };
            record(`Checking connection between Node ${u} and Node ${v}...`);

            if (matrix[u][v] > 0 && !visited.has(v)) {
                const weight = matrix[u][v];
                activeEdge = `${Math.min(u, v)}-${Math.max(u, v)}`;
                const currentDist = dist[u] + weight;
                
                record(`Edge found! Weight: ${weight}. Total path: ${dist[u]} + ${weight} = ${currentDist}`);

                if (currentDist < dist[v]) {
                    logs.unshift(`Relaxed! New dist for ${v} is ${currentDist}`);
                    dist[v] = currentDist;
                    record(`Relaxation Successful! Updated Node ${v} distance to ${currentDist} (was ${dist[v] === INF ? '\u221E' : dist[v]}).`);
                } else {
                    record(`No update needed. Current distance to Node ${v} (${dist[v]}) is better/equal.`);
                }
            } else if (matrix[u][v] > 0 && visited.has(v)) {
                record(`Node ${v} is already visited. Skipping.`);
            }
            
            // Reset per-neighbor visuals
            checkingCell = null;
            activeEdge = null;
        }
        
        visited.add(u);
        activeNode = null; // Deselect after processing
        record(`Finished processing Node ${u}. Marked as Visited.`);
    }

    record("Dijkstra's Algorithm Complete. Shortest paths found.");
    return steps;
  }, [nodes, matrix]);

  // 3. Playback Controller
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
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, history.length, speed]);

  const currentStep = history[currentIndex] || {
    distances: Array(NUM_NODES).fill(INF),
    visited: new Set(),
    activeNode: null,
    activeEdge: null,
    checkingCell: null,
    logs: [],
    explanation: "Initializing..."
  };

  return (
    <div className="flex flex-col gap-6">
       <div className="p-8 bg-[#1C1C1C] border border-[#333333] rounded-3xl shadow-2xl font-sans text-white relative overflow-hidden">
         {/* Chalkboard Grid */}
         <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
         {/* Header */}
         <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="space-y-1">
                <h2 className="text-2xl font-light tracking-tight text-[#58C4DD]">
                  Dijkstra <span className="text-white/40">Lemma</span>
                </h2>
                <div className="flex items-center gap-2">
                   <div className="h-1 w-12 bg-[#58C4DD] rounded-full" />
                   <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">Shortest Path Relaxation</p>
                </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-inner">
                <button onClick={generateGraph} className="p-2 hover:bg-white/10 rounded-xl text-white/40 active:scale-95 transition-all"><RefreshCw size={20} /></button>
                <button onClick={() => { setIsPlaying(false); setCurrentIndex(0); }} className="p-2 hover:bg-white/10 rounded-xl text-white/40 active:scale-95 transition-all"><RotateCcw size={20} /></button>
                
                {!isPlaying ? (
                  <button onClick={() => setIsPlaying(true)} className="flex items-center gap-2 px-6 py-2 bg-[#58C4DD] text-black rounded-xl hover:scale-105 transition-all font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_#58C4DD44]"><Play size={14} fill="currentColor" /> EXECUTE</button>
                ) : (
                  <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 px-6 py-2 bg-[#FC6255]/20 text-[#FC6255] border border-[#FC6255]/50 rounded-xl font-black text-[10px] uppercase tracking-widest"><Pause size={14} fill="currentColor" /> HALT</button>
                )}
            </div>
         </div>

         {/* Main Visualization Content */}
         <div className="flex flex-col lg:flex-row gap-8 items-center justify-center mb-8 relative z-10">
            {/* Graph Canvas */}
            <div className="relative w-[300px] h-[300px] bg-black/40 rounded-[2rem] border border-white/5 flex items-center justify-center shadow-xl overflow-hidden">
                <svg width="300" height="300" className="absolute top-0 left-0 pointer-events-none z-10">
                    {matrix.map((row, i) => 
                    row.map((weight, j) => {
                        if (i >= j || weight === 0) return null;
                        const u = nodes[i];
                        const v = nodes[j];
                        if (!u || !v) return null;
                        
                        const isHighlighted = currentStep.activeEdge === `${i}-${j}`;
                        const midX = (u.x + v.x) / 2;
                        const midY = (u.y + v.y) / 2;
                        
                        return (
                        <React.Fragment key={`edge-${i}-${j}`}>
                            <motion.line
                                animate={{ 
                                opacity: 1,
                                stroke: isHighlighted ? "#facc15" : "rgba(255,255,255,0.1)",
                                strokeWidth: isHighlighted ? 4 : 2
                                }}
                                x1={u.x} y1={u.y} x2={v.x} y2={v.y}
                            />
                            {/* Edge Weight Label */}
                            <motion.circle cx={midX} cy={midY} r="8" fill="#1C1C1C" />
                            <motion.text
                                x={midX} y={midY}
                                className="text-[10px] font-bold fill-white/60"
                                textAnchor="middle"
                                dy={3}
                            >
                                {weight}
                            </motion.text>
                        </React.Fragment>
                        );
                    })
                    )}
                </svg>
                
                {nodes.map((node) => {
                    const isVisited = currentStep.visited.has(node.id);
                    const isActive = currentStep.activeNode === node.id;
                    const isStart = node.id === 0;
                    
                    return (
                    <motion.div
                        key={node.id}
                        layout
                        className={`absolute w-10 h-10 rounded-full flex flex-col items-center justify-center border-2 transition-all z-20
                        ${isActive ? "bg-[#FFFF00] border-[#FFFF00] text-black shadow-[0_0_20px_#FFFF00]" : 
                            isVisited ? "bg-[#83C167] border-[#83C167] text-[#1C1C1C]" : 
                            "bg-[#1C1C1C] border-white/20 text-white/60"}`}
                        style={{ left: node.x - 20, top: node.y - 20 }}
                    >
                        <span className="font-black text-sm leading-none">{node.id}</span>
                        {isStart && <MapPin size={10} className="absolute -top-3 text-[#58C4DD]" />}
                    </motion.div>
                    );
                })}

                {/* Explanation Log Overlay */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentIndex} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }} 
                        className="absolute bottom-4 left-0 right-0 px-4 text-center z-30 pointer-events-none"
                    >
                         <span className="inline-block px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] text-[#FFFF00] font-mono border border-[#FFFF00]/20 shadow-xl">
                            {currentStep.explanation}
                         </span>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Matrix & Distances */}
            <div className="flex flex-col gap-6">
                {/* Adjacency Matrix */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h3 className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-3 text-center">Weight Matrix</h3>
                    <div className="grid gap-1" style={{ gridTemplateColumns: `auto repeat(${NUM_NODES}, minmax(0, 1fr))` }}>
                        <div className="w-6 h-6"></div>
                        {nodes.map(n => (
                            <div key={`col-${n.id}`} className="w-6 h-6 flex items-center justify-center text-[10px] font-bold text-white/30">{n.id}</div>
                        ))}
                        {matrix.map((row, i) => (
                            <React.Fragment key={`row-${i}`}>
                                <div className="w-6 h-6 flex items-center justify-center text-[10px] font-bold text-white/30">{i}</div>
                                {row.map((val, j) => {
                                    const isChecking = currentStep.checkingCell?.r === i && currentStep.checkingCell?.c === j;
                                    const isEdge = val > 0;
                                    return (
                                        <motion.div
                                            key={`cell-${i}-${j}`}
                                            animate={{
                                                backgroundColor: isChecking ? "rgba(255, 255, 0, 0.2)" : isEdge ? "rgba(88, 196, 221, 0.1)" : "transparent",
                                                borderColor: isChecking ? "#FFFF00" : "rgba(255,255,255,0.05)",
                                                scale: isChecking ? 1.1 : 1
                                            }}
                                            className={`w-6 h-6 rounded flex items-center justify-center text-[10px] border font-mono
                                                ${isEdge ? "text-[#58C4DD]" : "text-white/10"}`}
                                        >
                                            {val === 0 ? "·" : val}
                                        </motion.div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Distances Array */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h3 className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-3 text-center">Shortest Path Δ</h3>
                    <div className="flex gap-2 justify-center">
                        {currentStep.distances.map((d, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1">
                                <span className="text-[8px] font-mono text-white/30">{idx}</span>
                                <motion.div 
                                    layout
                                    className={`w-8 h-8 rounded-lg border flex items-center justify-center font-mono font-bold text-xs
                                        ${d === INF ? "border-white/10 text-white/20" : "bg-[#83C167]/20 border-[#83C167]/50 text-[#83C167]"}`}
                                >
                                    {d === INF ? "∞" : d}
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
         </div>

         {/* Scrubber / Slider */}
         <div className="mt-4 p-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Sparkles size={14} className="text-[#FFFF00]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Step {currentIndex + 1} of {history.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider">
                <div className="absolute w-full h-1 bg-white/10 rounded-full" />
                <div className="absolute h-1 bg-[#58C4DD] rounded-full shadow-[0_0_10px_#58C4DD44]" style={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }} />
                <input 
                    type="range" min="0" max={history.length - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute w-1.5 h-4 bg-[#FFFF00] rounded-full shadow-[0_0_15px_#FFFF00] pointer-events-none transition-all"
                    style={{ left: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 3px)` }}
                />
            </div>
         </div>
       </div>
    </div>
  );
}