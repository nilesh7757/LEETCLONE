"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RotateCcw, Play, Pause, ChevronLeft, ChevronRight, 
  Network, GitBranch, Zap, MousePointer2, CheckCircle2,
  Settings2, Hash, Database, Cpu
} from "lucide-react";

// --- Constants & Config ---
const NUM_NODES = 12;
const ANIMATION_SPEED_MS = 800;

// Manim-inspired Palette
const COLORS = [
  "#58C4DD", // Blue
  "#83C167", // Green
  "#f59e0b", // Gold
  "#FC6255", // Red
  "#9A72AC", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F43F5E", // Rose
  "#6366F1", // Indigo
  "#84CC16", // Lime
  "#D946EF", // Fuchsia
  "#0EA5E9", // Sky
];

// --- Types ---
interface DSUState {
  parent: number[];
  rank: number[];
  edges: [number, number][]; // Graph edges
  
  // Animation Focus
  activeNodes: number[];     // Nodes currently being processed
  pathNodes: number[];       // Nodes on the traversal path
  highlightEdge: [number, number] | null;
  
  phase: "IDLE" | "FIND" | "UNION" | "COMPRESS" | "CONNECTED";
  message: string;
}

export default function DSUVisualizer({ speed = 800 }: { speed?: number }) {
  // --- Core State ---
  const [history, setHistory] = useState<DSUState[]>([{
    parent: Array.from({ length: NUM_NODES }, (_, i) => i),
    rank: new Array(NUM_NODES).fill(0),
    edges: [],
    activeNodes: [],
    pathNodes: [],
    highlightEdge: null,
    phase: "IDLE",
    message: "Select two nodes to connect them (Union), or click one to find its root."
  }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNode, setSelectedNode] = useState<number | null>(null); // For manual interaction
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);   // Cross-highlighting

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Initialization ---
  const reset = () => {
    setIsPlaying(false);
    setSelectedNode(null);
    const initialState: DSUState = {
      parent: Array.from({ length: NUM_NODES }, (_, i) => i),
      rank: new Array(NUM_NODES).fill(0),
      edges: [],
      activeNodes: [],
      pathNodes: [],
      highlightEdge: null,
      phase: "IDLE",
      message: "Select two nodes to connect them (Union), or click one to find its root."
    };
    setHistory([initialState]);
    setCurrentIndex(0);
  };

  // --- Interaction Handlers ---
  const handleNodeClick = (id: number) => {
    // Only allow interaction if we are at the latest state (timeline end)
    if (currentIndex < history.length - 1) {
      setCurrentIndex(history.length - 1);
    }

    if (selectedNode === null) {
      setSelectedNode(id);
    } else if (selectedNode === id) {
      // Deselect if clicking same node
      setSelectedNode(null);
    } else {
      // Two different nodes selected -> Perform UNION
      runUnion(selectedNode, id);
      setSelectedNode(null);
    }
  };

  // --- Algorithm Logic (Generates History) ---
  const runUnion = (u: number, v: number) => {
    // Clone latest state to start
    const latest = history[history.length - 1];
    const steps: DSUState[] = [];
    
    // We work with mutable local copies for calculation, pushing snapshots to steps
    let parent = [...latest.parent];
    let rank = [...latest.rank];
    const edges = [...latest.edges, [u, v] as [number, number]];

    // Helper to push a snapshot
    const snapshot = (msg: string, phase: DSUState['phase'], active: number[] = [], path: number[] = []) => {
      steps.push({
        parent: [...parent],
        rank: [...rank],
        edges: edges, // Keep edges constant for this operation
        activeNodes: active,
        pathNodes: path,
        highlightEdge: [u, v],
        phase,
        message: msg
      });
    };

    snapshot(`Request: Union(${u}, ${v})`, "IDLE", [u, v]);

    // 1. FIND U
    let currU = u;
    let pathU = [u];
    snapshot(`Find(${u}): Starting at node ${u}`, "FIND", [u], pathU);
    
    while (currU !== parent[currU]) {
      currU = parent[currU];
      pathU.push(currU);
      snapshot(`Find(${u}): Moving up to parent ${currU}`, "FIND", [u], pathU);
    }
    const rootU = currU;
    
    // Path Compression U (Instant state update, visual step)
    if (pathU.length > 2) {
       pathU.slice(0, -1).forEach(node => parent[node] = rootU);
       snapshot(`Path Compression: Pointing nodes on path directly to root ${rootU}`, "COMPRESS", [u], pathU);
    }

    // 2. FIND V
    let currV = v;
    let pathV = [v];
    snapshot(`Find(${v}): Starting at node ${v}`, "FIND", [v], pathV);

    while (currV !== parent[currV]) {
      currV = parent[currV];
      pathV.push(currV);
      snapshot(`Find(${v}): Moving up to parent ${currV}`, "FIND", [v], pathV);
    }
    const rootV = currV;

    // Path Compression V
    if (pathV.length > 2) {
       pathV.slice(0, -1).forEach(node => parent[node] = rootV);
       snapshot(`Path Compression: Pointing nodes on path directly to root ${rootV}`, "COMPRESS", [v], pathV);
    }

    // 3. UNION
    if (rootU !== rootV) {
        if (rank[rootU] < rank[rootV]) {
            parent[rootU] = rootV;
            snapshot(`Union: ${rootU} -> ${rootV} (Rank ${rank[rootU]} < ${rank[rootV]})`, "UNION", [rootU, rootV]);
        } else if (rank[rootU] > rank[rootV]) {
            parent[rootV] = rootU;
            snapshot(`Union: ${rootV} -> ${rootU} (Rank ${rank[rootV]} < ${rank[rootU]})`, "UNION", [rootU, rootV]);
        } else {
            parent[rootV] = rootU;
            rank[rootU]++;
            snapshot(`Union: ${rootV} -> ${rootU} (Equal Ranks, New Rank: ${rank[rootU]})`, "UNION", [rootU, rootV]);
        }
    } else {
        snapshot(`Nodes ${u} and ${v} are already connected! (Root: ${rootU})`, "CONNECTED", [u, v]);
    }

    // Final Idle State
    steps.push({
        parent: [...parent],
        rank: [...rank],
        edges: edges,
        activeNodes: [],
        pathNodes: [],
        highlightEdge: null,
        phase: "IDLE",
        message: `Operation Union(${u}, ${v}) complete.`
    });

    // Append new steps to history
    setHistory(prev => [...prev, ...steps]);
    setIsPlaying(true); // Auto-play the new steps
  };

  // --- Playback Engine ---
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
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

  const currentStep = history[currentIndex] || history[0];

  // --- Layout Calculations ---

  // 1. Circular Graph Layout (Left)
  const graphPositions = useMemo(() => {
    const center = { x: 200, y: 200 };
    const radius = 140;
    return Array.from({ length: NUM_NODES }, (_, i) => {
      const angle = (i / NUM_NODES) * 2 * Math.PI - Math.PI / 2;
      return {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      };
    });
  }, []);

  // 2. Tree/Forest Layout (Right) - Dynamically calculated from `parent` array
  const treePositions = useMemo(() => {
    if (!currentStep) return []; // Safety check

    const positions = new Array(NUM_NODES).fill(null);
    const roots = new Set<number>();
    
    // Identify roots
    currentStep.parent.forEach((p, i) => {
        let curr = i;
        while(currentStep.parent[curr] !== curr) curr = currentStep.parent[curr];
        roots.add(curr);
    });
    
    const sortedRoots = Array.from(roots).sort((a,b) => a-b);
    const canvasWidth = 400;
    const sectionWidth = canvasWidth / sortedRoots.length;

    sortedRoots.forEach((root, idx) => {
        const rootX = (idx * sectionWidth) + (sectionWidth / 2);
        const rootY = 60; // Top margin
        
        positions[root] = { x: rootX, y: rootY };

        // Find all children (recursive)
        const getChildren = (pid: number) => 
            currentStep.parent.map((val, id) => (val === pid && id !== pid) ? id : -1).filter(id => id !== -1);

        const assignPositions = (pid: number, x: number, y: number, width: number) => {
            const children = getChildren(pid);
            if (children.length === 0) return;
            
            const childWidth = width / children.length;
            children.forEach((child, cIdx) => {
                const cx = x - (width/2) + (cIdx * childWidth) + (childWidth/2);
                const cy = y + 70; // Vertical spacing
                positions[child] = { x: cx, y: cy };
                assignPositions(child, cx, cy, childWidth);
            });
        };

        assignPositions(root, rootX, rootY, sectionWidth);
    });

    return positions;
  }, [currentStep?.parent]); // Add optional chaining

  // Helpers
  const getRoot = (i: number) => {
    if (!currentStep) return i;
    let curr = i;
    while (currentStep.parent[curr] !== curr) curr = currentStep.parent[curr];
    return curr;
  };

  const getNodeColor = (i: number) => {
    const root = getRoot(i);
    return COLORS[root % COLORS.length];
  };

  if (!currentStep) return null; // Render guard

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* --- Main Container --- */}
      <div className="bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        
        {/* Header / Controls */}
        <div className="p-6 border-b border-border bg-muted/20 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-[#58C4DD]/10 rounded-2xl text-[#58C4DD]">
                    <Network size={28} />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Interactive DSU</h2>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Union-Find • Path Compression</p>
                </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl border border-border shadow-sm">
                <button onClick={reset} className="p-2.5 hover:bg-muted rounded-xl text-muted-foreground transition-all" title="Reset">
                    <RotateCcw size={18} />
                </button>
                <div className="w-[1px] h-6 bg-border mx-1" />
                <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-2.5 hover:bg-muted rounded-xl text-muted-foreground transition-all">
                    <ChevronLeft size={18} />
                </button>
                <button 
                    onClick={() => setIsPlaying(!isPlaying)} 
                    disabled={currentIndex >= history.length - 1}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${isPlaying ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-[#58C4DD] text-black hover:scale-105"}`}
                >
                    {isPlaying ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor"/>}
                    {isPlaying ? "Pause" : "Auto"}
                </button>
                <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-2.5 hover:bg-muted rounded-xl text-muted-foreground transition-all">
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>

        {/* --- DUAL VIEWPORT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
            
            {/* LEFT: GRAPH PLAYGROUND */}
            <div className="relative border-b lg:border-b-0 lg:border-r border-border bg-muted/5 p-8 flex flex-col items-center justify-center group/graph">
                <div className="absolute top-6 left-6 flex items-center gap-2 pointer-events-none">
                    <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Interaction Graph</span>
                </div>
                
                {/* Interaction Hint */}
                <div className="absolute top-6 right-6 opacity-0 group-hover/graph:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-[9px] font-mono bg-card border border-border px-2 py-1 rounded text-muted-foreground">Click nodes to connect</span>
                </div>

                <div className="relative w-[400px] h-[400px]">
                    {/* Edges */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        {currentStep.edges.map(([u, v], idx) => {
                            const p1 = graphPositions[u];
                            const p2 = graphPositions[v];
                            const isNew = currentStep.highlightEdge && currentStep.highlightEdge[0] === u && currentStep.highlightEdge[1] === v;
                            const edgeColor = isNew ? "#f59e0b" : "#58C4DD";
                            
                            return (
                                <motion.line 
                                    key={`edge-${u}-${v}-${idx}`}
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ 
                                        pathLength: 1, 
                                        opacity: 1,
                                        stroke: edgeColor,
                                        strokeWidth: isNew ? 4 : 2
                                    }}
                                    x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                                    strokeDasharray={isNew ? "8 4" : "0"}
                                    className={isNew ? "" : "opacity-30"}
                                />
                            );
                        })}
                    </svg>

                    {/* Nodes */}
                    {graphPositions.map((pos, i) => {
                        const isSelected = selectedNode === i;
                        const isActive = currentStep.activeNodes.includes(i);
                        const isHovered = hoveredNode === i;
                        const color = getNodeColor(i);
                        
                        return (
                            <motion.button
                                key={`g-node-${i}`}
                                onClick={() => handleNodeClick(i)}
                                onMouseEnter={() => setHoveredNode(i)}
                                onMouseLeave={() => setHoveredNode(null)}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                animate={{ 
                                    boxShadow: isSelected ? `0 0 0 4px ${color}66` : isActive || isHovered ? `0 0 0 8px ${color}33` : "none",
                                    scale: isActive || isHovered ? 1.1 : 1
                                }}
                                style={{ 
                                    left: pos.x, top: pos.y, 
                                    backgroundColor: isSelected ? color : "var(--card)",
                                    borderColor: color
                                }}
                                className={`absolute w-12 h-12 -ml-6 -mt-6 border-2 rounded-full flex items-center justify-center z-10 transition-colors shadow-lg`}
                            >
                                <span className={`text-sm font-bold font-mono ${isSelected ? "text-black" : "text-foreground"}`}>{i}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* RIGHT: FOREST STRUCTURE */}
            <div className="relative bg-muted/10 p-8 flex flex-col items-center justify-center">
                <div className="absolute top-6 left-6 flex items-center gap-2 pointer-events-none">
                    <div className="w-2 h-2 rounded-full bg-[#58C4DD]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Internal Forest State</span>
                </div>

                <div className="relative w-[400px] h-[400px]">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        <defs>
                            <marker id="arrow" markerWidth="10" markerHeight="10" refX="20" refY="5" orient="auto">
                                <path d="M0,0 L10,5 L0,10" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/20"/>
                            </marker>
                        </defs>
                        {currentStep.parent.map((p, i) => {
                            if (p === i || !treePositions[i] || !treePositions[p]) return null;
                            const start = treePositions[i];
                            const end = treePositions[p];
                            return (
                                <motion.line 
                                    key={`link-${i}`}
                                    initial={false}
                                    animate={{ x1: start.x, y1: start.y, x2: end.x, y2: end.y }}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-muted-foreground/20"
                                    markerEnd="url(#arrow)"
                                />
                            );
                        })}
                    </svg>

                    <AnimatePresence>
                        {treePositions.map((pos, i) => {
                            if (!pos) return null;
                            const isPath = currentStep.pathNodes.includes(i);
                            const isActive = currentStep.activeNodes.includes(i);
                            const isRoot = currentStep.parent[i] === i;
                            const isHovered = hoveredNode === i;
                            const color = getNodeColor(i);

                            return (
                                <motion.div
                                    key={`t-node-${i}`}
                                    layout
                                    onMouseEnter={() => setHoveredNode(i)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ 
                                        x: pos.x - 20, 
                                        y: pos.y - 20, 
                                        opacity: 1, 
                                        scale: isPath || isHovered ? 1.2 : 1,
                                        backgroundColor: isPath || isActive || isHovered ? color : "var(--card)",
                                        borderColor: color,
                                        boxShadow: isPath || isHovered ? `0 0 20px ${color}66` : "none"
                                    }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="absolute w-10 h-10 border-2 rounded-full flex flex-col items-center justify-center shadow-md z-20 cursor-pointer"
                                >
                                    <span className={`text-xs font-bold font-mono ${isPath || isActive || isHovered ? "text-black" : "text-foreground"}`}>{i}</span>
                                    {isRoot && currentStep.rank[i] > 0 && (
                                        <div className="absolute -top-5 px-1.5 py-0.5 rounded bg-background border border-border text-[8px] font-mono text-muted-foreground">
                                            R:{currentStep.rank[i]}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>

        {/* --- Memory Tape Visualization (NEW) --- */}
        <div className="border-t border-border bg-card p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <Database size={16} className="text-[#58C4DD]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Memory Tape (Array State)</span>
            </div>
            
            <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-thin">
                {currentStep.parent.map((p, i) => {
                    const isHovered = hoveredNode === i;
                    const isRoot = p === i;
                    const color = getNodeColor(i);
                    const isModified = currentIndex > 0 && history[currentIndex-1].parent[i] !== p;

                    return (
                        <motion.div 
                            key={`mem-${i}`}
                            onMouseEnter={() => setHoveredNode(i)}
                            onMouseLeave={() => setHoveredNode(null)}
                            animate={{ 
                                scale: isHovered || isModified ? 1.1 : 1,
                                borderColor: isHovered ? color : "var(--border)",
                                backgroundColor: isHovered ? `${color}15` : "var(--card)"
                            }}
                            className="flex flex-col items-center border rounded-lg p-2 min-w-[3rem] transition-colors cursor-pointer"
                        >
                            <span className="text-[8px] font-mono text-muted-foreground mb-1">IDX {i}</span>
                            <div className="w-full h-[1px] bg-border mb-2" />
                            <span className={`text-sm font-bold font-mono ${isRoot ? "text-[#83C167]" : "text-foreground"}`}>{p}</span>
                        </motion.div>
                    );
                })}
            </div>
        </div>

        {/* --- Log Footer --- */}
        <div className="border-t border-border bg-muted/10 p-4">
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${currentStep.phase === "UNION" ? "bg-[#f59e0b] text-black" : currentStep.phase === "COMPRESS" ? "bg-[#83C167] text-black" : "bg-muted text-muted-foreground"}`}>
                            {currentStep.phase}
                        </div>
                        <span className="text-xs font-mono text-foreground/80">{currentStep.message}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/30">
                        <Hash size={12} /> SEQUENCE {currentIndex + 1}/{history.length}
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-[#58C4DD]" 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / history.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}