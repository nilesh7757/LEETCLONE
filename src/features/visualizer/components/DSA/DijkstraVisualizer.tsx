"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Sparkles, Hash, Link as LinkIcon, 
  Search, Info, ChevronLeft, ChevronRight, Zap, GitBranch,
  Layers, ArrowUp, MousePointer2, Network, Share2, StepForward,
  TrendingUp, Activity, Layout, MapPin, Cpu, Target, RefreshCw,
  Plus, Trash2, Edit3, Move, X
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

const INF = 99;

type Node = { id: number; x: number; y: number };

interface DijkstraState {
  distances: number[];
  visited: Set<number>;
  activeNode: number | null;
  activeEdge: string | null;
  pq: { id: number; dist: number }[];
  message: string;
  step: string;
  logs: string[];
}

export default function DijkstraVisualizer({ speed = 800 }: { speed?: number }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  
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

  // Topology Generation
  const generateGraph = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    const numNodes = 6;
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    const newNodes: Node[] = [];
    for (let i = 0; i < numNodes; i++) {
      const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2;
      newNodes.push({
        id: i,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }
    setNodes(newNodes);

    const newMatrix = Array(numNodes).fill(0).map(() => Array(numNodes).fill(0));
    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        if (Math.random() < 0.5) {
          const weight = Math.floor(Math.random() * 9) + 1;
          newMatrix[i][j] = weight;
          newMatrix[j][i] = weight;
        }
      }
    }
    // Ensure connectivity from source (node 0)
    for (let i = 0; i < numNodes - 1; i++) {
        if (newMatrix[i][i+1] === 0) {
            const weight = Math.floor(Math.random() * 5) + 1;
            newMatrix[i][i+1] = weight;
            newMatrix[i+1][i] = weight;
        }
    }
    setMatrix(newMatrix);
  };

  useEffect(() => {
    if (dimensions.width > 0 && nodes.length === 0) generateGraph();
  }, [dimensions.width]);

  // --- Interactive Editing ---
  const addNode = () => {
    if (nodes.length >= 12) return;
    const newId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0;
    const { width, height } = dimensions;
    const newNode = {
      id: newId,
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height / 2 + (Math.random() - 0.5) * 100
    };
    
    setNodes(prev => [...prev, newNode]);
    
    // Expand Matrix safely
    setMatrix(prev => {
        const newSize = Math.max(prev.length, newId + 1);
        const newMat = Array(newSize).fill(0).map((_, r) => 
            Array(newSize).fill(0).map((_, c) => {
                if (r < prev.length && c < prev[0]?.length) return prev[r][c];
                return 0;
            })
        );
        return newMat;
    });
    
    resetSimulation();
  };

  const clearGraph = () => {
    setNodes([]);
    setMatrix([]);
    resetSimulation();
  };

  const handleNodeClick = (id: number) => {
    if (!isEditing) return;

    if (selectedNode === null) {
      setSelectedNode(id);
    } else if (selectedNode === id) {
      setSelectedNode(null);
    } else {
      // Toggle Edge
      const weight = Math.floor(Math.random() * 9) + 1;
      setMatrix(prev => {
          const newMat = prev.map(row => [...row]);
          const currentW = newMat[selectedNode][id];
          const newW = currentW > 0 ? 0 : weight; // Toggle
          newMat[selectedNode][id] = newW;
          newMat[id][selectedNode] = newW;
          return newMat;
      });
      setSelectedNode(null);
      resetSimulation();
    }
  };

  const updateNodePosition = (id: number, info: any) => {
    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        return { ...n, x: n.x + info.delta.x, y: n.y + info.delta.y };
      }
      return n;
    }));
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  // Algorithm History
  const history = useMemo(() => {
    if (nodes.length === 0) return [];
    
    const maxId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0;
    const steps: DijkstraState[] = [];
    let dist = Array(maxId).fill(INF);
    let visited = new Set<number>();
    let currentLogs: string[] = [];
    let activeNode: number | null = null;
    let activeEdge: string | null = null;
    
    // Simple PQ: array of objects {id, dist}
    let pq: { id: number; dist: number }[] = [];

    const record = (msg: string, step: string) => {
      steps.push({
        distances: [...dist],
        visited: new Set(visited),
        activeNode,
        activeEdge,
        pq: [...pq].sort((a, b) => a.dist - b.dist), // Visualize sorted
        message: msg,
        step: step,
        logs: [...currentLogs]
      });
    };

    const addLog = (l: string) => currentLogs = [l, ...currentLogs];

    // Init
    const startNode = nodes[0]?.id ?? 0;
    dist[startNode] = 0;
    pq.push({ id: startNode, dist: 0 });

    addLog(`System initialized. Source node ${startNode} assigned distance 0.`);
    record(`Dijkstra protocol initiated. Source node ${startNode} added to Priority Queue.`, "INIT");

    while (pq.length > 0) {
        // Sort PQ to simulate Min-Heap extraction
        pq.sort((a, b) => a.dist - b.dist);
        const { id: u, dist: d } = pq.shift()!;

        if (d > dist[u]) continue; // Skip outdated entries

        activeNode = u;
        visited.add(u);
        addLog(`Extracting node ${u} with min distance ${d}.`);
        record(`Extracted node ${u} from the priority manifold.`, "MIN_EXTRACTION");

        if (dist[u] === INF) {
             break; // Should not happen with reachable nodes
        }

        // Neighbors
        for (let v = 0; v < maxId; v++) {
             if (!matrix[u] || matrix[u][v] === undefined) continue;
             if (matrix[u][v] > 0) {
                 const weight = matrix[u][v];
                 activeEdge = `${Math.min(u, v)}-${Math.max(u, v)}`;
                 
                 record(`Probing neighbor ${v} via link {${u}, ${v}} (Weight: ${weight}).`, "NEIGHBOR_PROBE");

                 if (dist[u] + weight < dist[v]) {
                     dist[v] = dist[u] + weight;
                     pq.push({ id: v, dist: dist[v] });
                     addLog(`Relaxed Node ${v}: ${dist[v] - weight} + ${weight} = ${dist[v]}`);
                     record(`Relaxation successful. Updated distance for Node ${v} to ${dist[v]}.`, "RELAXATION");
                 } else {
                     record(`Path through ${u} (${dist[u]} + ${weight}) is not shorter than existing ${dist[v]}.`, "NO_UPDATE");
                 }
             }
             activeEdge = null;
        }
        
        activeNode = null;
        record(`Node ${u} processing complete. Stabilized.`, "STABILIZED");
    }

    record("Shortest path resolution complete.", "COMPLETE");
    return steps;
  }, [nodes, matrix]);

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
    distances: [],
    visited: new Set(),
    activeNode: null,
    activeEdge: null,
    pq: [],
    message: "Initializing...",
    step: "IDLE",
    logs: []
  };

  // Coordinate Helper
  const getLineCoords = (uIdx: number, vIdx: number) => {
    const u = nodes.find(n => n.id === uIdx);
    const v = nodes.find(n => n.id === vIdx);
    if (!u || !v) return { x1: 0, y1: 0, x2: 0, y2: 0 };
    const dx = v.x - u.x;
    const dy = v.y - u.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const radius = 24;
    return {
        x1: u.x + (dx / dist) * radius,
        y1: u.y + (dy / dist) * radius,
        x2: v.x - (dx / dist) * radius,
        y2: v.y - (dy / dist) * radius
    };
  };

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
              Dijkstra <span className="text-muted-foreground/40">Lemma Analyzer</span>
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-1 w-12 bg-[#58C4DD] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/30">Single-Source Shortest Path</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {isEditing && (
                 <>
                    <button onClick={addNode} className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-white/5 rounded-xl border border-border transition-all text-xs font-bold text-muted-foreground hover:text-foreground">
                        <Plus size={14}/> Node
                    </button>
                    <button onClick={clearGraph} className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-white/5 rounded-xl border border-border transition-all text-xs font-bold text-muted-foreground hover:text-foreground">
                        <Trash2 size={14}/> Clear
                    </button>
                     <div className="w-[1px] h-6 bg-border mx-1" />
                 </>
             )}

             <button 
                onClick={() => { setIsEditing(!isEditing); setIsPlaying(false); setSelectedNode(null); }} 
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-xs font-bold ${isEditing ? "bg-white text-black border-white shadow-xl" : "bg-muted text-muted-foreground border-border hover:text-foreground"}`}
             >
                {isEditing ? <><X size={14} /> Done</> : <><Edit3 size={14} /> Edit</>}
             </button>

             {!isEditing && (
                <>
                    <button onClick={generateGraph} className="p-3 bg-muted hover:bg-white/5 rounded-xl border border-border transition-all text-muted-foreground hover:text-foreground" title="Randomize"><RefreshCw size={20}/></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(0); }} className="p-3 bg-muted hover:bg-white/5 rounded-xl border border-border transition-all text-muted-foreground hover:text-foreground" title="Reset"><RotateCcw size={20}/></button>
                    
                    {!isPlaying ? (
                        <button onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(true); }} className="flex items-center gap-2 px-6 py-3 bg-[#58C4DD] text-black rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-lg">
                            <Play size={16} fill="currentColor"/> EXECUTE
                        </button>
                    ) : (
                        <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 px-6 py-3 bg-white/10 text-foreground rounded-xl font-bold text-xs hover:bg-white/20 transition-all">
                            <Pause size={16} fill="currentColor"/> HALT
                        </button>
                    )}
                </>
             )}
          </div>
        </div>

        {/* Visual Canvas */}
        <div className="relative min-h-[500px] bg-muted/40 rounded-[2.5rem] border border-border overflow-hidden shadow-inner flex flex-col items-center justify-center cursor-crosshair">
            
            <div ref={containerRef} className="absolute inset-0 w-full h-full">
                {/* Mode Indicator (Edit Mode) */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none z-30">
                            <div className="px-4 py-2 bg-black/80 text-white backdrop-blur-md rounded-full border border-white/10 shadow-2xl flex items-center gap-3">
                                <Move size={12} className="text-[#f59e0b]" />
                                <span className="text-[10px] font-bold tracking-wide">
                                    {selectedNode !== null ? `Select target to link Node ${selectedNode}` : "Drag nodes • Click to Link"}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Overlays: Distance & PQ */}
                <div className="absolute top-6 right-6 z-30 flex flex-col gap-4 pointer-events-none max-w-[200px]">
                    {/* Distance Array */}
                    <div className="bg-card/90 backdrop-blur border border-border p-4 rounded-2xl shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-3">
                             <TrendingUp size={12} /> Distances
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                             {nodes.map(n => {
                                 const d = currentStep.distances[n.id];
                                 return (
                                     <div key={n.id} className="flex flex-col items-center">
                                         <span className="text-[8px] text-muted-foreground/50 mb-0.5">{n.id}</span>
                                         <motion.div 
                                             layout
                                             className={`w-8 h-8 rounded-lg border flex items-center justify-center font-mono text-[10px] font-bold transition-colors ${d !== INF && d !== undefined ? "bg-[#58C4DD]/10 border-[#58C4DD] text-[#58C4DD]" : "border-border text-muted-foreground/30"}`}
                                         >
                                             {d === INF || d === undefined ? "∞" : d}
                                         </motion.div>
                                     </div>
                                 )
                             })}
                        </div>
                    </div>

                    {/* Priority Queue */}
                    <div className="bg-card/90 backdrop-blur border border-border p-4 rounded-2xl shadow-sm flex flex-col max-h-[250px] overflow-hidden">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-3">
                             <Activity size={12} /> Priority Queue
                        </span>
                        <div className="flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-thin pointer-events-auto">
                            <AnimatePresence mode="popLayout">
                                {currentStep.pq.map((item, i) => (
                                    <motion.div
                                        key={`${item.id}-${item.dist}-${i}`}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        className="flex items-center justify-between px-3 py-2 rounded-lg border bg-background/50 border-border"
                                    >
                                        <span className="text-[10px] font-bold text-foreground">Node {item.id}</span>
                                        <div className="px-1.5 py-0.5 rounded bg-[#58C4DD]/20 text-[#58C4DD] text-[9px] font-black font-mono">
                                            {item.dist}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {currentStep.pq.length === 0 && <span className="text-[9px] italic text-muted-foreground/50 text-center">Empty</span>}
                        </div>
                    </div>
                </div>

                {/* Logic Step Badge */}
                <AnimatePresence>
                    {!isEditing && currentStep.step !== "IDLE" && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-8 left-10 flex items-center gap-2 px-4 py-2 bg-[#58C4DD]/10 border border-[#58C4DD]/30 rounded-full z-30 pointer-events-none">
                            <Zap size={12} className="text-[#58C4DD]" />
                            <span className="text-[9px] font-black font-mono text-[#58C4DD] uppercase tracking-[0.2em]">{currentStep.step}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Explanation Box */}
                <AnimatePresence mode="wait">
                    {!isEditing && (
                        <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-12 w-full flex justify-center z-30 pointer-events-none">
                            <div className="px-6 py-3 bg-card/90 border border-border rounded-2xl backdrop-blur-md shadow-2xl max-w-[400px] text-center">
                                <p className="text-xs text-[#f59e0b] font-mono font-medium">{currentStep.message}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    {matrix.map((row, i) => 
                        row.map((weight, j) => {
                            if (i >= j || weight === 0) return null;
                            const { x1, y1, x2, y2 } = getLineCoords(i, j);
                            const isH = currentStep.activeEdge === `${Math.min(i,j)}-${Math.max(i,j)}`;
                            return (
                                <React.Fragment key={`edge-${i}-${j}`}>
                                    <motion.line
                                        layout
                                        x1={x1} y1={y1} x2={x2} y2={y2}
                                        stroke="currentColor"
                                        className={`${isH ? "text-[#f59e0b]" : "text-muted-foreground/15"}`}
                                        strokeWidth={isH ? 4 : 2}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    />
                                    <motion.g 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="pointer-events-none"
                                    >
                                        <circle cx={(x1+x2)/2} cy={(y1+y2)/2} r="11" fill="var(--background)" stroke="var(--card-border)" strokeWidth="1.5" />
                                        <text 
                                            x={(x1+x2)/2} 
                                            y={(y1+y2)/2} 
                                            dy="4" 
                                            textAnchor="middle" 
                                            fontSize="11" 
                                            fontWeight="bold" 
                                            style={{ fill: "var(--foreground)" }}
                                            className="font-mono"
                                        >
                                            {weight}
                                        </text>
                                    </motion.g>
                                </React.Fragment>
                            );
                        })
                    )}
                </svg>

                {/* Topology Nodes */}
                <div className="relative w-full h-full">
                    {nodes.map(node => {
                        const isV = currentStep.visited.has(node.id);
                        const isA = currentStep.activeNode === node.id;
                        const isS = node.id === 0;
                        const isSelected = selectedNode === node.id;

                        return (
                            <motion.div
                                key={node.id}
                                drag={isEditing}
                                dragMomentum={false}
                                onDrag={(_, info) => updateNodePosition(node.id, info)}
                                onClick={() => handleNodeClick(node.id)}
                                animate={{ 
                                    x: node.x - 20, 
                                    y: node.y - 20,
                                    backgroundColor: isSelected ? MANIM_COLORS.gold : isA ? MANIM_COLORS.gold : isV ? MANIM_COLORS.green : "var(--card)",
                                    borderColor: isSelected ? MANIM_COLORS.gold : isA ? MANIM_COLORS.gold : isV ? MANIM_COLORS.green : "var(--border)",
                                    scale: isA || isSelected ? 1.2 : 1,
                                    boxShadow: isA || isSelected ? `0 0 30px ${MANIM_COLORS.gold}44` : isV ? `0 0 20px ${MANIM_COLORS.green}33` : "none"
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className={`absolute w-10 h-10 border-2 rounded-full z-20 flex flex-col items-center justify-center font-mono shadow-lg ${isEditing ? "cursor-grab active:cursor-grabbing" : ""}`}
                            >
                                <span className={`text-xs font-black ${isA || isV || isSelected ? "text-black" : "text-foreground"}`}>{node.id}</span>
                                {isS && !isEditing && <div className="absolute -top-6"><MapPin size={14} className="text-[#58C4DD]" /></div>}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Scrubber UI */}
        <div className={`mt-8 p-6 bg-muted border border-border rounded-[2.5rem] flex flex-col gap-4 relative z-10 transition-opacity ${isEditing ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Hash size={14} className="text-[#f59e0b]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Temporal Frame {currentIndex + 1} of {history.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider">
                <div className="absolute w-full h-1 bg-background/10 rounded-full" />
                <div className="absolute h-1 bg-[#58C4DD] rounded-full shadow-[0_0_10px_#58C4DD44]" style={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }} />
                <input 
                    type="range" min="0" max={history.length - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute w-1.5 h-4 bg-[#f59e0b] rounded-full shadow-[0_0_15px_#f59e0b] pointer-events-none transition-all"
                    style={{ left: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 3px)` }}
                />
            </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-10 py-6 bg-muted/20 border border-border rounded-[2.5rem] flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Active Extraction</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#58C4DD]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Neighbor Probe</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#83C167]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Stabilized Manifold</span></div>
         <div className="flex items-center gap-3"><Target size={14} className="text-muted-foreground/20" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Priority Relaxation</span></div>
      </div>
    </div>
  );
}