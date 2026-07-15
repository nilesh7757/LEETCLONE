"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RotateCcw, Play, Pause, ChevronLeft, ChevronRight, 
  Network, Hash, Database, Activity
} from "lucide-react";

// --- Constants & Config ---
const NUM_NODES = 12;

// Professional Palette
const COLORS = [
  "var(--viz-lime)",
  "var(--viz-green)",
  "var(--viz-amber)",
  "var(--viz-rose)",
  "var(--viz-cyan)",
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F43F5E", // Rose
  "#6366F1", // Indigo
  "#84CC16", // Lime
  "#D946EF", // Fuchsia
  "#0EA5E9", // Sky
];

interface DSUState {
  parent: number[];
  rank: number[];
  edges: [number, number][]; // Graph edges
  activeNodes: number[];     // Nodes currently being processed
  pathNodes: number[];       // Nodes on the find/union path
  highlightEdge: [number, number] | null;
  phase: "IDLE" | "FIND" | "UNION" | "COMPRESS" | "CONNECTED";
  message: string;
  logs: string[];
}

export default function DSUVisualizer({ speed = 800 }: { speed?: number }) {
  const [history, setHistory] = useState<DSUState[]>([{
    parent: Array.from({ length: NUM_NODES }, (_, i) => i),
    rank: new Array(NUM_NODES).fill(0),
    edges: [],
    activeNodes: [],
    pathNodes: [],
    highlightEdge: null,
    phase: "IDLE",
    message: "Drag nodes to rearrange them. Click a node to select, then click another to merge their sets (Union).",
    logs: ["Disjoint Set Union initialized."]
  }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dragContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Draggable Node Positions
  const [nodePositions, setNodePositions] = useState(() => {
    const center = { x: 180, y: 180 };
    const radius = 120;
    return Array.from({ length: NUM_NODES }, (_, i) => {
      const angle = (i / NUM_NODES) * 2 * Math.PI - Math.PI / 2;
      return {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      };
    });
  });

  const startDragPos = useRef({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<number | null>(null);

  useEffect(() => {
    if (!dragContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height
        });
      }
    });
    observer.observe(dragContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const reset = () => {
    setIsPlaying(false);
    setSelectedNode(null);
    setHistory([{
      parent: Array.from({ length: NUM_NODES }, (_, i) => i),
      rank: new Array(NUM_NODES).fill(0),
      edges: [],
      activeNodes: [],
      pathNodes: [],
      highlightEdge: null,
      phase: "IDLE",
      message: "Drag nodes to rearrange them. Click a node to select, then click another to merge their sets (Union).",
      logs: ["Disjoint Set Union reset."]
    }]);
    setCurrentIndex(0);
    // Reset positions to circular
    const center = { x: 180, y: 180 };
    const radius = 120;
    setNodePositions(Array.from({ length: NUM_NODES }, (_, i) => {
      const angle = (i / NUM_NODES) * 2 * Math.PI - Math.PI / 2;
      return {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      };
    }));
  };

  const runUnion = (u: number, v: number) => {
    const latest = history[history.length - 1];
    const steps: DSUState[] = [];
    
    const parent = [...latest.parent];
    const rank = [...latest.rank];
    const edges = [...latest.edges, [u, v] as [number, number]];
    let currentLogs = ["Starting Union of " + u + " and " + v + "."];

    const snapshot = (msg: string, phase: DSUState['phase'], active: number[] = [], path: number[] = []) => {
      steps.push({
        parent: [...parent],
        rank: [...rank],
        edges: edges,
        activeNodes: active,
        pathNodes: path,
        highlightEdge: [u, v],
        phase,
        message: msg,
        logs: [...currentLogs]
      });
    };

    const addLog = (logStr: string) => {
      currentLogs = [logStr, ...currentLogs];
    };

    snapshot(`Starting union of node ${u} and node ${v}.`, "IDLE", [u, v]);

    // 1. FIND U
    let currU = u;
    const pathU = [u];
    addLog(`Finding root of node ${u}...`);
    snapshot(`Searching root of node ${u}: currently at node ${u}.`, "FIND", [u], [...pathU]);
    
    while (currU !== parent[currU]) {
      currU = parent[currU];
      pathU.push(currU);
      addLog(`Going up to parent node ${currU}.`);
      snapshot(`Searching root of node ${u}: moving up to parent node ${currU}.`, "FIND", [u], [...pathU]);
    }
    const rootU = currU;
    addLog(`Root of node ${u} is node ${rootU}.`);
    snapshot(`Found root of node ${u}: node ${rootU}.`, "FIND", [u], [...pathU]);
    
    // Path Compression U
    if (pathU.length > 2) {
       pathU.slice(0, -1).forEach(node => { parent[node] = rootU; });
       addLog(`Compressing path: pointing nodes ${pathU.slice(0,-1).join(", ")} directly to root ${rootU}.`);
       snapshot(`Path compression: pointing nodes on the path directly to root node ${rootU}.`, "COMPRESS", [u], [...pathU]);
    }

    // 2. FIND V
    let currV = v;
    const pathV = [v];
    addLog(`Finding root of node ${v}...`);
    snapshot(`Searching root of node ${v}: currently at node ${v}.`, "FIND", [v], [...pathV]);

    while (currV !== parent[currV]) {
      currV = parent[currV];
      pathV.push(currV);
      addLog(`Going up to parent node ${currV}.`);
      snapshot(`Searching root of node ${v}: moving up to parent node ${currV}.`, "FIND", [v], [...pathV]);
    }
    const rootV = currV;
    addLog(`Root of node ${v} is node ${rootV}.`);
    snapshot(`Found root of node ${v}: node ${rootV}.`, "FIND", [v], [...pathV]);

    // Path Compression V
    if (pathV.length > 2) {
       pathV.slice(0, -1).forEach(node => { parent[node] = rootV; });
       addLog(`Compressing path: pointing nodes ${pathV.slice(0,-1).join(", ")} directly to root ${rootV}.`);
       snapshot(`Path compression: pointing nodes on the path directly to root node ${rootV}.`, "COMPRESS", [v], [...pathV]);
    }

    // 3. UNION
    if (rootU !== rootV) {
        if (rank[rootU] < rank[rootV]) {
            parent[rootU] = rootV;
            addLog(`Merged root ${rootU} into root ${rootV} (rank ${rank[rootU]} < ${rank[rootV]}).`);
            snapshot(`Union: pointing root node ${rootU} to root node ${rootV} (rank ${rank[rootU]} < ${rank[rootV]}).`, "UNION", [rootU, rootV]);
        } else if (rank[rootU] > rank[rootV]) {
            parent[rootV] = rootU;
            addLog(`Merged root ${rootV} into root ${rootU} (rank ${rank[rootV]} < ${rank[rootU]}).`);
            snapshot(`Union: pointing root node ${rootV} to root node ${rootU} (rank ${rank[rootV]} < ${rank[rootU]}).`, "UNION", [rootU, rootV]);
        } else {
            parent[rootV] = rootU;
            rank[rootU]++;
            addLog(`Merged root ${rootV} into root ${rootU} (equal ranks: rank of ${rootU} becomes ${rank[rootU]}).`);
            snapshot(`Union: pointing root node ${rootV} to root node ${rootU} (equal ranks: rank of ${rootU} becomes ${rank[rootU]}).`, "UNION", [rootU, rootV]);
        }
    } else {
        addLog(`Nodes ${u} and ${v} are already in the same set.`);
        snapshot(`Nodes ${u} and ${v} are already in the same set (common root: node ${rootU}).`, "CONNECTED", [u, v]);
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
        message: `Union of node ${u} and node ${v} complete.`,
        logs: [...currentLogs]
    });

    setHistory(prev => [...prev, ...steps]);
    setIsPlaying(true);
  };

  const handleNodeClick = (id: number) => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(history.length - 1);
    }
    if (selectedNode === null) {
      setSelectedNode(id);
    } else if (selectedNode === id) {
      setSelectedNode(null);
    } else {
      runUnion(selectedNode, id);
      setSelectedNode(null);
    }
  };

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

  // Forest layout for right representation
  const treePositions = useMemo(() => {
    if (!currentStep) return [];
    const positions = new Array(NUM_NODES).fill(null);
    const roots = new Set<number>();
    
    currentStep.parent.forEach((p, i) => {
        let curr = i;
        while(currentStep.parent[curr] !== curr) curr = currentStep.parent[curr];
        roots.add(curr);
    });
    
    const sortedRoots = Array.from(roots).sort((a,b) => a-b);
    const canvasWidth = 340;
    const sectionWidth = canvasWidth / sortedRoots.length;

    sortedRoots.forEach((root, idx) => {
        const rootX = (idx * sectionWidth) + (sectionWidth / 2) + 30;
        const rootY = 60;
        
        positions[root] = { x: rootX, y: rootY };

        const getChildren = (pid: number) => 
            currentStep.parent.map((val, id) => (val === pid && id !== pid) ? id : -1).filter(id => id !== -1);

        const assignPositions = (pid: number, x: number, y: number, width: number) => {
            const children = getChildren(pid);
            if (children.length === 0) return;
            
            const childWidth = width / children.length;
            children.forEach((child, cIdx) => {
                const cx = x - (width/2) + (cIdx * childWidth) + (childWidth/2);
                const cy = y + 70;
                positions[child] = { x: cx, y: cy };
                assignPositions(child, cx, cy, childWidth);
            });
        };

        assignPositions(root, rootX, rootY, sectionWidth);
    });

    return positions;
  }, [currentStep]);

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

  const handlePointerDown = (e: React.PointerEvent, id: number) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingNode(id);
    startDragPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent, id: number) => {
    if (draggingNode !== id) return;
    if (!dragContainerRef.current) return;
    const rect = dragContainerRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 20), 340);
    const y = Math.min(Math.max(e.clientY - rect.top, 20), 340);
    setNodePositions(prev => {
      const next = [...prev];
      next[id] = { x, y };
      return next;
    });
  };

  const handlePointerUp = (e: React.PointerEvent, id: number) => {
    if (draggingNode === id) {
      setDraggingNode(null);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      
      const dist = Math.hypot(e.clientX - startDragPos.current.x, e.clientY - startDragPos.current.y);
      if (dist < 5) {
        handleNodeClick(id);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 select-none font-sans w-full">

      {/* ── Header + Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-[var(--viz-lavender)]">Disjoint Set Union</h2>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)]/40">Union-Find with Path Compression</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => {
              if (currentIndex >= history.length - 1) setCurrentIndex(0);
              setIsPlaying(!isPlaying);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${isPlaying ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-[var(--viz-lavender)] text-black border-transparent hover:scale-105"}`}
          >
            {isPlaying ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor"/>}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button onClick={reset} className="p-2 bg-[var(--muted)] hover:bg-[var(--foreground)]/5 rounded-xl border border-[var(--border)] transition-all text-[var(--muted-foreground)]/60 hover:text-red-500" title="Reset">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* ── Info Bar ── */}
      <div className="flex items-center gap-6 px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[10px] font-mono">
        <span className="text-[var(--muted-foreground)]/50">Elements: <strong className="text-[var(--viz-lavender)]">{NUM_NODES}</strong></span>
        <span className="text-[var(--muted-foreground)]/50">Active Phase: <strong className="text-[var(--viz-cyan)]">{currentStep.phase}</strong></span>
      </div>

      {/* ── Dual Visual Canvas (No Overflow) ── */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--muted)]/20 shadow-inner p-4">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          
          {/* LEFT: Nodes Connection Graph */}
          <div className="flex flex-col items-center justify-center p-2 border-b md:border-b-0 md:border-r border-[var(--border)]/40 min-h-[360px]">
            <span className="text-[9px] font-black font-mono text-[var(--muted-foreground)]/40 uppercase tracking-widest mb-4">Connections Graph (Drag &amp; Click)</span>
            
            <div ref={dragContainerRef} className="relative w-[360px] h-[360px] overflow-hidden rounded-xl border border-[var(--border)]/10 bg-black/5 touch-none">
              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                {currentStep.edges.map(([u, v], idx) => {
                  const p1 = nodePositions[u];
                  const p2 = nodePositions[v];
                  if (!p1 || !p2) return null;
                  const isNew = currentStep.highlightEdge && currentStep.highlightEdge[0] === u && currentStep.highlightEdge[1] === v;
                  const edgeColor = isNew ? "var(--viz-amber)" : "var(--viz-lavender)";
                  
                  return (
                    <motion.line 
                      key={`edge-${u}-${v}-${idx}`}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ 
                        pathLength: 1, 
                        opacity: 1,
                        stroke: edgeColor,
                        strokeWidth: isNew ? 3 : 1.5
                      }}
                      x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                      className={isNew ? "" : "opacity-30"}
                    />
                  );
                })}
              </svg>

              {/* Elements */}
              {nodePositions.map((pos, i) => {
                const isSelected = selectedNode === i;
                const isActive = currentStep.activeNodes.includes(i);
                const isHovered = hoveredNode === i;
                const color = getNodeColor(i);
                
                return (
                  <motion.div
                    key={`g-node-${i}`}
                    onPointerDown={(e) => handlePointerDown(e, i)}
                    onPointerMove={(e) => handlePointerMove(e, i)}
                    onPointerUp={(e) => handlePointerUp(e, i)}
                    onMouseEnter={() => setHoveredNode(i)}
                    onMouseLeave={() => setHoveredNode(null)}
                    whileHover={{ scale: 1.1 }}
                    animate={{ 
                      boxShadow: isSelected ? `0 0 0 4px ${color}66` : isActive || isHovered ? `0 0 0 6px ${color}33` : "none",
                      scale: isActive || isHovered ? 1.1 : 1
                    }}
                    style={{ 
                      left: pos.x - 20, top: pos.y - 20, 
                      backgroundColor: isSelected ? color : "var(--card)",
                      borderColor: color
                    }}
                    className="absolute w-10 h-10 border-2 rounded-full flex items-center justify-center z-20 shadow-md transition-colors cursor-grab active:cursor-grabbing select-none touch-none"
                  >
                    <span className="text-xs font-bold font-mono pointer-events-none">{i}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Parent-Child Forest representation */}
          <div className="flex flex-col items-center justify-center p-2 min-h-[360px]">
            <span className="text-[9px] font-black font-mono text-[var(--muted-foreground)]/40 uppercase tracking-widest mb-4">Tree representations (Set Roots)</span>
            
            <div className="relative w-[360px] h-[360px]">
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <defs>
                  <marker id="arrow" markerWidth="8" markerHeight="8" refX="16" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" className="text-[var(--muted-foreground)]/30"/>
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
                      strokeWidth="1.5"
                      className="text-[var(--muted-foreground)]/30"
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
                        x: pos.x - 16, 
                        y: pos.y - 16, 
                        opacity: 1, 
                        scale: isPath || isHovered ? 1.15 : 1,
                        backgroundColor: isPath || isActive || isHovered ? color : "var(--card)",
                        borderColor: color,
                        boxShadow: isPath || isHovered ? `0 0 15px ${color}66` : "none"
                      }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="absolute w-8 h-8 border-2 rounded-full flex flex-col items-center justify-center shadow-md z-20 cursor-pointer"
                    >
                      <span className={`text-[10px] font-bold font-mono ${isPath || isActive || isHovered ? "text-black" : "text-[var(--foreground)]"}`}>{i}</span>
                      {isRoot && currentStep.rank[i] > 0 && (
                        <div className="absolute -top-4 px-1 py-0.2 bg-[var(--card)] border border-[var(--border)] rounded text-[6px] font-mono text-[var(--muted-foreground)]">
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
      </div>

      {/* ── Step Message (below canvas) ── */}
      <div className="w-full px-4 py-2.5 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center">
        <p className="text-xs text-[var(--viz-cyan)] font-mono font-medium">{currentStep.message}</p>
      </div>

      {/* ── Step log (below canvas) ── */}
      {currentStep.logs && currentStep.logs.length > 0 && (
        <div className="w-full bg-[var(--muted)]/30 border border-[var(--border)] rounded-2xl px-4 py-3 flex flex-col gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/50 flex items-center gap-1.5">
            <Activity size={10} /> Step Log
          </span>
          <div className="flex flex-row flex-wrap gap-x-6 gap-y-1">
            {currentStep.logs.slice(0, 4).map((log, i) => (
              <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-[9px] font-mono text-[var(--muted-foreground)]/60 leading-tight">
                <span className="text-[var(--viz-lavender)] mr-1">»</span>{log}
              </motion.p>
            ))}
          </div>
        </div>
      )}

      {/* ── Parent Array View (below canvas) ── */}
      <div className="w-full bg-[var(--muted)]/25 border border-[var(--border)] rounded-2xl px-4 py-3 flex flex-col gap-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/50 flex items-center gap-1.5">
          <Database size={10} /> Parent Array State
        </span>
        <div className="flex flex-wrap gap-1.5">
          {currentStep.parent.map((p, i) => {
            const isHovered = hoveredNode === i;
            const isRoot = p === i;
            const color = getNodeColor(i);
            return (
              <motion.div 
                key={`mem-${i}`}
                onMouseEnter={() => setHoveredNode(i)}
                onMouseLeave={() => setHoveredNode(null)}
                animate={{ 
                  scale: isHovered ? 1.05 : 1,
                  borderColor: isHovered ? color : "var(--border)",
                  backgroundColor: isHovered ? `${color}15` : "var(--card)"
                }}
                className="flex flex-col items-center border rounded-lg p-1 min-w-[2.5rem] transition-colors cursor-pointer"
              >
                <span className="text-[7px] font-mono text-[var(--muted-foreground)] mb-0.5">idx {i}</span>
                <span className={`text-xs font-bold font-mono ${isRoot ? "text-[var(--viz-green)]" : "text-[var(--foreground)]"}`}>{p}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Scrubber + Navigation ── */}
      <div className="flex flex-col gap-3 w-full p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash size={14} className="text-[var(--viz-lavender)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Step {currentIndex + 1} of {history.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              disabled={currentIndex >= history.length - 1}
              className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all" disabled={currentIndex === 0}><ChevronLeft size={18} /></button>
            <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all" disabled={currentIndex >= history.length - 1}><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="relative flex items-center w-full">
          <div className="absolute w-full h-1 bg-[var(--muted)]/30 rounded-full" />
          <div className="absolute h-1 bg-[var(--viz-lavender)] rounded-full transition-all"
            style={{ width: `${(currentIndex / Math.max(history.length - 1, 1)) * 100}%` }} />
          <input type="range" min="0" max={history.length - 1} value={currentIndex}
            onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
            className="w-full h-6 opacity-0 cursor-pointer z-10" />
          <div className="absolute w-1.5 h-4 bg-[var(--viz-cyan)] rounded-full pointer-events-none transition-all"
            style={{ left: `calc(${(currentIndex / Math.max(history.length - 1, 1)) * 100}% - 3px)` }} />
        </div>
      </div>

    </div>
  );
}
