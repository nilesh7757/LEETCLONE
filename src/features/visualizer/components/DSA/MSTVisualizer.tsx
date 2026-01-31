"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Sparkles, Hash, Link as LinkIcon, 
  Search, Info, ChevronLeft, ChevronRight, Zap, GitBranch,
  Layers, ArrowUp, MousePointer2, Network, Share2, StepForward,
  TrendingUp, Activity, Layout, RefreshCw, Plus, Trash2, Edit3, Move, X
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

type Node = { id: number; x: number; y: number };
type Edge = { u: number; v: number; weight: number; id: string };

interface MSTState {
  mstEdges: Set<string>;
  visitedNodes: Set<number>;
  pq: Edge[]; // For Prim's: Actual PQ. For Kruskal's: Remaining sorted edges list.
  currentEdgeId: string | null;
  parent: number[]; // For Kruskal's DSU visualization
  message: string;
  step: string;
  logs: string[];
}

export default function MSTVisualizer({ speed = 800 }: { speed?: number }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [mode, setMode] = useState<"PRIM" | "KRUSKAL">("PRIM");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 480 });

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

  // Graph Generation
  const generateGraph = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    const numNodes = 7;
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

    const newEdges: Edge[] = [];
    const added = new Set<string>();

    // Sparse graph with guaranteed connectivity
    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        if (Math.random() < 0.45) {
           const weight = Math.floor(Math.random() * 15) + 1;
           const id = `${i}-${j}`;
           newEdges.push({ u: i, v: j, weight, id });
           added.add(id);
        }
      }
    }
    
    // Ensure connectivity
    for(let i=0; i<numNodes; i++) {
        const next = (i+1)%numNodes;
        const id1 = `${Math.min(i, next)}-${Math.max(i, next)}`;
        if(!added.has(id1)) {
             newEdges.push({ u: Math.min(i, next), v: Math.max(i, next), weight: Math.floor(Math.random()*10)+1, id: id1 });
             added.add(id1);
        }
    }
    setEdges(newEdges);
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
    setNodes([...nodes, newNode]);
    resetSimulation();
  };

  const clearGraph = () => {
    setNodes([]);
    setEdges([]);
    resetSimulation();
  };

  const handleNodeClick = (id: number) => {
    if (!isEditing) return;

    if (selectedNode === null) {
      setSelectedNode(id);
    } else if (selectedNode === id) {
      setSelectedNode(null);
    } else {
      // Create or Update Edge
      const u = Math.min(selectedNode, id);
      const v = Math.max(selectedNode, id);
      const edgeId = `${u}-${v}`;
      
      const existingIdx = edges.findIndex(e => e.id === edgeId);
      if (existingIdx >= 0) {
          // Remove edge if exists
          setEdges(prev => prev.filter((_, i) => i !== existingIdx));
      } else {
          // Add edge with random weight
          const weight = Math.floor(Math.random() * 15) + 1;
          setEdges(prev => [...prev, { u, v, weight, id: edgeId }]);
      }
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

  // Algorithm Engine
  const history = useMemo(() => {
    if (nodes.length === 0) return [];

    const steps: MSTState[] = [];
    const maxId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0;
    const initialParent = Array.from({ length: maxId }, (_, i) => i);

    const record = (
        mst: Set<string>, 
        visited: Set<number>, 
        q: Edge[], 
        curr: string | null, 
        msg: string, 
        step: string,
        parent: number[] = initialParent,
        prevLogs: string[] = [],
        newLog?: string
    ) => {
        steps.push({
            mstEdges: new Set(mst),
            visitedNodes: new Set(visited),
            pq: [...q],
            currentEdgeId: curr,
            message: msg,
            step: step,
            parent: [...parent],
            logs: newLog ? [newLog, ...prevLogs] : prevLogs
        });
    };

    if (mode === "PRIM") {
        const startNode = nodes[0]?.id ?? 0;
        let visited = new Set<number>([startNode]);
        let mst = new Set<string>();
        let logs: string[] = [`Node ${startNode} selected as catalyst.`];
        
        let pq = edges
            .filter(e => e.u === startNode || e.v === startNode)
            .sort((a, b) => a.weight - b.weight);

        record(mst, visited, pq, null, `Starting at Node ${startNode}. Adjacency edges integrated into Priority Queue.`, "START", initialParent, logs);

        while (visited.size < nodes.length && pq.length > 0) {
            const minEdge = pq[0];
            const remainingPq = pq.slice(1);

            record(mst, visited, pq, minEdge.id, `Probing minimum edge ${minEdge.u}-${minEdge.v} (Weight: ${minEdge.weight}).`, "PROBING", initialParent, logs);

            const isUVisited = visited.has(minEdge.u);
            const isVVisited = visited.has(minEdge.v);

            if (isUVisited && isVVisited) {
                record(mst, visited, remainingPq, minEdge.id, `Edge ${minEdge.u}-${minEdge.v} connects stabilized nodes. Discarding to prevent cycle.`, "CYCLE_DETECTED", initialParent, logs, `Skipped ${minEdge.u}-${minEdge.v}`);
                pq = remainingPq;
            } else {
                const newNode = isUVisited ? minEdge.v : minEdge.u;
                mst.add(minEdge.id);
                visited.add(newNode);
                
                const newEdges = edges.filter(e => 
                    (e.u === newNode && !visited.has(e.v)) || 
                    (e.v === newNode && !visited.has(e.u))
                );
                
                let nextPq = [...remainingPq, ...newEdges].sort((a, b) => a.weight - b.weight);
                
                record(mst, visited, remainingPq, minEdge.id, `Edge integrated. Node ${newNode} catalyzed into the spanning set.`, "INTEGRATED", initialParent, logs, `Added Edge ${minEdge.u}-${minEdge.v}`);
                
                pq = nextPq;
                record(mst, visited, pq, null, `Stabilizing connections for Node ${newNode}. Updating Priority Queue.`, "PQ_UPDATE", initialParent, logs);
            }
        }
        record(mst, visited, [], null, "Minimum Spanning Tree topology achieved.", "COMPLETE", initialParent, logs, "Success");

    } else {
        // KRUSKAL
        let sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
        let mst = new Set<string>();
        let visited = new Set<number>();
        let logs: string[] = ["Global edges prioritized by weight."];
        let parent = [...initialParent];

        const find = (i: number): number => {
            if (parent[i] === undefined) return i; // Safety for dynamic nodes
            return (parent[i] === i ? i : (parent[i] = find(parent[i])));
        };
        const union = (i: number, j: number) => {
            const rootI = find(i);
            const rootJ = find(j);
            if (rootI !== rootJ) {
                parent[rootI] = rootJ;
                return true;
            }
            return false;
        };

        record(mst, visited, sortedEdges, null, "Edges sorted by weight. Beginning greedy global integration.", "START", parent, logs);

        for (let i = 0; i < sortedEdges.length; i++) {
            const edge = sortedEdges[i];
            const remaining = sortedEdges.slice(i);

            record(mst, visited, remaining, edge.id, `Evaluating global edge ${edge.u}-${edge.v} (Weight: ${edge.weight}).`, "EVALUATING", parent, logs);

            const rU = find(edge.u);
            const rV = find(edge.v);

            if (rU !== rV) {
                union(edge.u, edge.v);
                mst.add(edge.id);
                visited.add(edge.u);
                visited.add(edge.v);
                record(mst, visited, remaining.slice(1), edge.id, `Manifolds resolved. Integrating ${edge.u}-${edge.v} into the MST.`, "UNION", parent, logs, `Added ${edge.u}-${edge.v}`);
            } else {
                record(mst, visited, remaining.slice(1), edge.id, `Nodes share a common root manifold ${rU}. Skipping to maintain tree property.`, "SKIP_CYCLE", parent, logs, `Skipped ${edge.u}-${edge.v}`);
            }
        }
        record(mst, visited, [], null, "Kruskal greedy integration complete.", "COMPLETE", parent, logs, "Success");
    }

    return steps;
  }, [nodes, edges, mode]);

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
      mstEdges: new Set(), visitedNodes: new Set(), pq: [], 
      currentEdgeId: null, message: "Initializing...", step: "INIT", parent: [], logs: [] 
  };

  // Coordinate Helper
  const getLineCoords = (uIdx: number, vIdx: number) => {
    const start = nodes.find(n => n.id === uIdx);
    const end = nodes.find(n => n.id === vIdx);
    if (!start || !end) return { x1:0, y1:0, x2:0, y2:0 };
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const radius = 24;
    return {
      x1: start.x + (dx / dist) * radius,
      y1: start.y + (dy / dist) * radius,
      x2: end.x - (dx / dist) * radius,
      y2: end.y - (dy / dist) * radius
    };
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="p-8 bg-card border border-border rounded-3xl shadow-2xl font-sans text-foreground relative overflow-hidden">
        {/* Grid Backdrop */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 relative z-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[#83C167]">
              MST <span className="text-muted-foreground/40">Chronicle Resolver</span>
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-1 w-12 bg-[#83C167] rounded-full" />
               <div className="flex bg-muted p-1 rounded-lg border border-border">
                  <button onClick={() => { setMode("PRIM"); setIsPlaying(false); setCurrentIndex(0); }} className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${mode === "PRIM" ? "bg-[#83C167] text-black" : "text-muted-foreground/40"}`}>Prim's</button>
                  <button onClick={() => { setMode("KRUSKAL"); setIsPlaying(false); setCurrentIndex(0); }} className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${mode === "KRUSKAL" ? "bg-[#f59e0b] text-black" : "text-muted-foreground/40"}`}>Kruskal's</button>
               </div>
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
                        <button onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(true); }} className={`flex items-center gap-2 px-6 py-3 ${mode === 'PRIM' ? 'bg-[#83C167]' : 'bg-[#f59e0b]'} text-black rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-lg`}>
                            <Play size={16} fill="currentColor"/> START
                        </button>
                    ) : (
                        <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 px-6 py-3 bg-white/10 text-foreground rounded-xl font-bold text-xs hover:bg-white/20 transition-all">
                            <Pause size={16} fill="currentColor"/> PAUSE
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

                {/* Priority Queue Overlay */}
                <div className="absolute top-6 right-6 z-30 flex flex-col items-end gap-2 pointer-events-none">
                    <div className="bg-card/90 backdrop-blur border border-border px-3 py-1.5 rounded-lg shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                             <Activity size={12} /> {mode === "PRIM" ? "Priority Queue" : "Sorted Pipeline"}
                        </span>
                    </div>
                    <div className="flex flex-col gap-2 p-2 max-h-[300px] overflow-y-auto scrollbar-thin">
                        <AnimatePresence mode="popLayout">
                            {currentStep.pq.slice(0, 6).map((edge) => (
                                <motion.div
                                    key={edge.id}
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-[10px] font-mono shadow-sm backdrop-blur-sm ${currentStep.currentEdgeId === edge.id ? "bg-[#58C4DD] text-black border-[#58C4DD]" : "bg-card/80 border-border text-muted-foreground"}`}
                                >
                                    <span>{edge.u}↔{edge.v}</span>
                                    <span className="font-black bg-black/10 px-1 rounded">{edge.weight}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {currentStep.pq.length > 6 && <span className="text-[9px] italic text-muted-foreground/50 text-right pr-2">+{currentStep.pq.length - 6} more</span>}
                        {currentStep.pq.length === 0 && <span className="text-[9px] italic text-muted-foreground/50 pr-2">Empty</span>}
                    </div>
                </div>

                {/* Logic Step Badge */}
                <AnimatePresence>
                    {!isEditing && currentStep.step && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`absolute top-8 left-10 flex items-center gap-2 px-4 py-2 border rounded-full z-30 shadow-lg pointer-events-none ${mode === 'PRIM' ? 'bg-[#83C167]/10 border-[#83C167]/30 text-[#83C167]' : 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]'}`}>
                            <Zap size={12} />
                            <span className="text-[9px] font-black font-mono uppercase tracking-[0.2em]">{currentStep.step}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Status Message */}
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
                    {edges.map((edge) => {
                        const { x1, y1, x2, y2 } = getLineCoords(edge.u, edge.v);
                        const isMst = currentStep.mstEdges.has(edge.id);
                        const isCurrent = currentStep.currentEdgeId === edge.id;
                        const isInPq = mode === "PRIM" && currentStep.pq.some(e => e.id === edge.id);

                        return (
                            <React.Fragment key={edge.id}>
                                <motion.line
                                    layout
                                    x1={x1} y1={y1} x2={x2} y2={y2}
                                    stroke="currentColor"
                                    className={`${isMst ? "text-[#f59e0b]" : isCurrent ? "text-[#58C4DD]" : isInPq ? "text-muted-foreground/30" : "text-muted-foreground/15"}`}
                                    strokeWidth={isMst ? 5 : isCurrent ? 4 : 2}
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
                                        {edge.weight}
                                    </text>
                                </motion.g>
                            </React.Fragment>
                        );
                    })}
                </svg>

                {nodes.map((node) => {
                    const isVisited = currentStep.visitedNodes.has(node.id);
                    const isSelected = selectedNode === node.id;
                    
                    return (
                        <motion.div
                            key={node.id}
                            drag={isEditing}
                            dragMomentum={false}
                            onDrag={(_, info) => updateNodePosition(node.id, info)}
                            onClick={() => handleNodeClick(node.id)}
                            animate={{ 
                                x: node.x - 24, 
                                y: node.y - 24,
                                backgroundColor: isSelected ? MANIM_COLORS.gold : isVisited ? MANIM_COLORS.green : "var(--card)",
                                borderColor: isSelected ? MANIM_COLORS.gold : isVisited ? MANIM_COLORS.green : "var(--border)",
                                scale: isVisited || isSelected ? 1.1 : 1,
                                boxShadow: isVisited || isSelected ? `0 0 20px ${isSelected ? MANIM_COLORS.gold : MANIM_COLORS.green}33` : "none"
                            }}
                            className={`absolute w-12 h-12 border-2 rounded-full z-20 flex flex-col items-center justify-center font-mono shadow-lg ${isEditing ? "cursor-grab active:cursor-grabbing" : ""}`}
                        >
                            <span className={`text-sm font-black ${isVisited || isSelected ? "text-black" : "text-foreground"}`}>{node.id}</span>
                            {mode === "KRUSKAL" && !isEditing && (
                                <div className="absolute -bottom-6 text-[8px] font-black text-muted-foreground/30 uppercase tracking-tighter">
                                    R:{currentStep.parent[node.id]}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>

        {/* Timeline Scrubber */}
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
                <div className="absolute h-1 bg-[#83C167] rounded-full shadow-[0_0_10px_#83C16744]" style={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }} />
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
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">MST Edge</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#58C4DD]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Active Probe</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#83C167]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Visited Node</span></div>
         <div className="flex items-center gap-3"><Layers size={14} className="text-muted-foreground/20" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Greedy Integration</span></div>
      </div>
    </div>
  );
}