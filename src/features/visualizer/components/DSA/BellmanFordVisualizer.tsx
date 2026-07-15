"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, ChevronLeft, ChevronRight, 
  Activity, MapPin, RefreshCw, Plus, AlertTriangle, Layers, Database
} from "lucide-react";

const INF = 99;

type Node = { id: number; x: number; y: number };

interface BellmanFordState {
  distances: number[];
  activeEdge: [number, number] | null;
  relaxedEdges: Set<string>;
  iteration: number;
  message: string;
  step: string;
  logs: string[];
  hasNegativeCycle: boolean;
  phase: "INIT" | "RELAX" | "DETECTION" | "COMPLETE";
}

export default function BellmanFordVisualizer({ speed = 800 }: { speed?: number }) {
  // Virtual Coordinate Space: 800x500
  const V_WIDTH = 800;
  const V_HEIGHT = 500;

  const [nodes, setNodes] = useState<Node[]>([]);
  const [matrix, setMatrix] = useState<number[][]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const [draggingNode, setDraggingNode] = useState<number | null>(null);
  const startDragPos = useRef({ pointerX: 0, pointerY: 0, nodeX: 0, nodeY: 0 });

  // Initialize nodes to default state
  const initializeDefaultGraph = React.useCallback(() => {
    const numNodes = 5;
    const centerX = V_WIDTH / 2;
    const centerY = V_HEIGHT / 2;
    const radius = 150;

    const initialNodes: Node[] = [];
    for (let i = 0; i < numNodes; i++) {
      const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2;
      initialNodes.push({
        id: i,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }

    const initialMatrix = Array(numNodes).fill(0).map(() => Array(numNodes).fill(0));
    for (let i = 0; i < numNodes; i++) {
      for (let j = 0; j < numNodes; j++) {
        if (i !== j && Math.random() < 0.35) {
          const weight = Math.floor(Math.random() * 12) - 4;
          initialMatrix[i][j] = weight === 0 ? 1 : weight;
        }
      }
    }
    for (let i = 0; i < numNodes - 1; i++) {
        if (initialMatrix[i][i+1] === 0) initialMatrix[i][i+1] = Math.floor(Math.random() * 5) + 1;
    }

    setNodes(initialNodes);
    setMatrix(initialMatrix);
    setIsPlaying(false);
    setCurrentIndex(0);
  }, []);

  useEffect(() => {
    if (nodes.length === 0) {
      const t = setTimeout(() => {
        initializeDefaultGraph();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [nodes.length, initializeDefaultGraph]);

  const resetSimulation = React.useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
  }, []);

  const generateRandomGraph = React.useCallback(() => {
    resetSimulation();
    const numNodes = 5;
    const centerX = V_WIDTH / 2;
    const centerY = V_HEIGHT / 2;
    const radius = 150;

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
      for (let j = 0; j < numNodes; j++) {
        if (i !== j && Math.random() < 0.35) {
          const weight = Math.floor(Math.random() * 12) - 4;
          newMatrix[i][j] = weight === 0 ? 1 : weight;
        }
      }
    }
    for (let i = 0; i < numNodes - 1; i++) {
        if (newMatrix[i][i+1] === 0) newMatrix[i][i+1] = Math.floor(Math.random() * 5) + 1;
    }
    setMatrix(newMatrix);
  }, [resetSimulation]);

  const addNode = React.useCallback(() => {
    if (nodes.length >= 8) return;
    const newId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0;
    const newNode = {
      id: newId,
      x: V_WIDTH / 2 + (Math.random() - 0.5) * 150,
      y: V_HEIGHT / 2 + (Math.random() - 0.5) * 150
    };
    
    setNodes(prev => [...prev, newNode]);
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
  }, [nodes, resetSimulation]);

  const handleNodeClick = React.useCallback((id: number) => {
    if (selectedNode === null) {
      setSelectedNode(id);
    } else if (selectedNode === id) {
      setSelectedNode(null);
    } else {
      const weight = Math.floor(Math.random() * 9) - 3; // Allows negative weights!
      const finalWeight = weight === 0 ? 1 : weight;
      setMatrix(prev => {
          const newMat = prev.map(row => [...row]);
          const currentW = newMat[selectedNode][id];
          newMat[selectedNode][id] = currentW !== 0 ? 0 : finalWeight;
          return newMat;
      });
      setSelectedNode(null);
      resetSimulation();
    }
  }, [selectedNode, resetSimulation]);

  const handlePointerDown = (e: React.PointerEvent, node: Node) => {
    e.preventDefault();
    setDraggingNode(node.id);
    startDragPos.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      nodeX: node.x,
      nodeY: node.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingNode === null) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    
    const dx = (e.clientX - startDragPos.current.pointerX) * (V_WIDTH / rect.width);
    const dy = (e.clientY - startDragPos.current.pointerY) * (V_HEIGHT / rect.height);
    
    const newX = startDragPos.current.nodeX + dx;
    const newY = startDragPos.current.nodeY + dy;

    setNodes(prev => prev.map(n => n.id === draggingNode ? {
      ...n,
      x: Math.min(Math.max(newX, 30), V_WIDTH - 30),
      y: Math.min(Math.max(newY, 30), V_HEIGHT - 30)
    } : n));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingNode !== null) {
      const id = draggingNode;
      setDraggingNode(null);

      const dist = Math.hypot(e.clientX - startDragPos.current.pointerX, e.clientY - startDragPos.current.pointerY);
      if (dist < 5) {
        handleNodeClick(id);
      }
    }
  };

  const history = useMemo(() => {
    if (nodes.length === 0) return [];
    
    const V = nodes.length;
    const maxId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0;
    const steps: BellmanFordState[] = [];
    const dist = Array(maxId).fill(INF);
    const relaxedEdges = new Set<string>();
    let currentLogs: string[] = [];
    
    const record = (msg: string, step: string, activeEdge: [number, number] | null = null, iteration: number = 0, phase: BellmanFordState["phase"] = "RELAX", hasNeg: boolean = false) => {
      steps.push({
        distances: [...dist],
        activeEdge,
        relaxedEdges: new Set(relaxedEdges),
        iteration,
        message: msg,
        logs: [...currentLogs],
        hasNegativeCycle: hasNeg,
        phase,
        step
      });
    };

    const addLog = (l: string) => { currentLogs = [l, ...currentLogs]; };

    const startNode = nodes[0]?.id ?? 0;
    dist[startNode] = 0;
    addLog(`Initialized: source node ${startNode} distance set to 0.`);
    record(`Bellman-Ford initiated. Initializing distances from source node ${startNode}.`, "INIT", null, 0, "INIT");

    const edges: { u: number, v: number, w: number }[] = [];
    for (let i = 0; i < maxId; i++) {
        for (let j = 0; j < maxId; j++) {
            if (matrix[i]?.[j] !== 0) edges.push({ u: i, v: j, w: matrix[i][j] });
        }
    }

    for (let i = 1; i < V; i++) {
        let changed = false;
        addLog(`--- Starting Iteration ${i} ---`);
        for (const { u, v, w } of edges) {
            record(`Checking edge ${u} → ${v} (Weight: ${w}). Current distance[${v}] = ${dist[v] === INF ? "∞" : dist[v]}`, "PROBE", [u, v], i, "RELAX");
            
            if (dist[u] !== INF && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                relaxedEdges.add(`${u}-${v}`);
                changed = true;
                addLog(`Relaxed edge: distance to node ${v} updated to ${dist[v]}.`);
                record(`Relaxed edge: distance to node ${v} updated to ${dist[v]}.`, "RELAX", [u, v], i, "RELAX");
            } else {
                record(`No update: distance to node ${v} is already optimal.`, "STABLE", [u, v], i, "RELAX");
            }
        }
        if (!changed) {
            addLog(`Optimal paths converged at iteration ${i}.`);
            record(`Optimal paths converged at iteration ${i}.`, "CONVERGED", null, i, "RELAX");
            break;
        }
    }

    // Negative weight cycle check
    addLog(`Checking for negative weight cycles...`);
    for (const { u, v, w } of edges) {
        record(`Checking edge ${u} → ${v} (Weight: ${w}) for negative cycle.`, "DETECTION_PROBE", [u, v], V, "DETECTION");
        if (dist[u] !== INF && dist[u] + w < dist[v]) {
            addLog(`Negative cycle detected on edge ${u} → ${v}!`);
            record(`Negative weight cycle detected! Edge ${u} → ${v} can still be relaxed.`, "FAILURE", [u, v], V, "DETECTION", true);
            break;
        }
    }

    if (!steps[steps.length - 1].hasNegativeCycle) {
        addLog(`Bellman-Ford execution complete. Shortest paths established.`);
        record("Bellman-Ford execution complete.", "COMPLETE", null, V, "COMPLETE");
    }
    
    return steps;
  }, [nodes, matrix]);

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
    activeEdge: null,
    relaxedEdges: new Set(),
    iteration: 0,
    message: "Initializing...",
    step: "IDLE",
    logs: [],
    hasNegativeCycle: false,
    phase: "INIT"
  };

  const getEdgeData = (uIdx: number, vIdx: number) => {
    const u = nodes.find(n => n.id === uIdx);
    const v = nodes.find(n => n.id === vIdx);
    if (!u || !v) return null;
    const dx = v.x - u.x, dy = v.y - u.y, distVal = Math.sqrt(dx*dx + dy*dy);
    const ux = dx/distVal, uy = dy/distVal;
    const hasOpposite = matrix[vIdx]?.[uIdx] !== 0;
    const curve = hasOpposite ? 30 : 0;
    const cpX = (u.x + v.x)/2 - uy * curve;
    const cpY = (u.y + v.y)/2 + ux * curve;
    const path = `M ${u.x + ux*20} ${u.y + uy*20} Q ${cpX} ${cpY} ${v.x - ux*25} ${v.y - uy*25}`;
    return { path, cpX, cpY, ux, uy };
  };

  return (
    <div className="flex flex-col gap-4 select-none font-sans w-full">
      {/* Header + Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-[var(--viz-lavender)]">Bellman-Ford</h2>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)]/40">Shortest Paths with Negative Edge Weights</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={addNode} className="flex items-center gap-1 px-3 py-1.5 bg-[var(--muted)] hover:bg-[var(--accent)] rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--muted-foreground)]"><Plus size={14}/> Add Node</button>
          <button onClick={generateRandomGraph} className="p-2 bg-[var(--muted)] hover:bg-[var(--foreground)]/5 rounded-xl border border-[var(--border)] transition-all text-[var(--muted-foreground)]/60 hover:text-[var(--foreground)]" title="Randomize Graph Weights"><RefreshCw size={16}/></button>
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
          <button onClick={initializeDefaultGraph} className="p-2 bg-[var(--muted)] hover:bg-[var(--foreground)]/5 rounded-xl border border-[var(--border)] transition-all text-[var(--muted-foreground)]/60 hover:text-[var(--foreground)]" title="Reset Graph to Default"><RotateCcw size={16}/></button>
        </div>
      </div>

      {/* Traversal State Info Bar */}
      <div className="flex items-center gap-6 px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[10px] font-mono">
        <span className="text-[var(--muted-foreground)]/50">Current Iteration: <strong className="text-[var(--viz-lavender)]">{currentStep.iteration}</strong></span>
        <span className="text-[var(--muted-foreground)]/50">Active Phase: <strong className="text-[var(--viz-cyan)]">{currentStep.phase === "DETECTION" ? "Negative Cycle Check" : currentStep.phase === "INIT" ? "Initialization" : currentStep.phase === "COMPLETE" ? "Finished" : "Relaxation"}</strong></span>
      </div>

      {/* Visual Canvas (Autofits perfectly & never overflows) */}
      <div ref={containerRef} className="relative w-full h-[360px] md:h-[450px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-hidden shadow-inner flex items-center justify-center p-0">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

        {/* Real-time Status Badge / Help message */}
        <div className="absolute top-4 left-4 flex justify-center z-30 pointer-events-none">
          <div className="px-3 py-1.5 bg-[var(--popover)]/60 text-[var(--popover-foreground)] rounded-full border border-[var(--border)]/10 shadow-sm flex items-center gap-2">
            <span className="text-[9px] font-bold text-[var(--muted-foreground)]/80">
              {selectedNode !== null ? `Select target node to connect with node ${selectedNode}` : "Drag nodes to move • Click node, then click another to connect"}
            </span>
          </div>
        </div>

        {/* Scalable Vector SVG Canvas */}
        <svg 
          viewBox={`0 0 ${V_WIDTH} ${V_HEIGHT}`} 
          className="w-full h-full select-none touch-none z-10 overflow-visible"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <defs>
              <marker id="arrowhead-bellman" markerWidth="10" markerHeight="7" refX="19" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
              </marker>
          </defs>

          {/* Edges */}
          {matrix.map((row, i) => 
            row.map((weight, j) => {
              if (weight === 0) return null;
              const edgeInfo = getEdgeData(i, j);
              if (!edgeInfo) return null;
              const { path } = edgeInfo;
              
              const isActive = currentStep.activeEdge?.[0] === i && currentStep.activeEdge?.[1] === j;
              const isRelaxed = currentStep.relaxedEdges.has(`${i}-${j}`);
              const isFailure = currentStep.hasNegativeCycle && isActive;

              return (
                <g key={`edge-group-${i}-${j}`}>
                  <motion.path
                    d={path}
                    fill="none"
                    stroke="currentColor"
                    className={`${isFailure ? "text-[var(--viz-rose)]" : isActive ? "text-[var(--viz-cyan)]" : isRelaxed ? "text-[var(--viz-green)]/40" : "text-[var(--muted-foreground)]/35"}`}
                    strokeWidth={isActive ? 3 : 1.5}
                    markerEnd="url(#arrowhead-bellman)"
                    animate={{ opacity: 1 }}
                  />
                  {isActive && (
                    <motion.circle r="3.5" fill={isFailure ? "var(--viz-rose)" : "var(--viz-cyan)"}>
                      <animateMotion dur="0.8s" repeatCount="indefinite" path={path} />
                    </motion.circle>
                  )}
                </g>
              );
            })
          )}

          {/* Edge Weights (Centered bubbles on quadratic curve) */}
          {matrix.map((row, i) => 
            row.map((weight, j) => {
              if (weight === 0) return null;
              const edgeInfo = getEdgeData(i, j);
              if (!edgeInfo) return null;
              const { cpX, cpY } = edgeInfo;
              
              const isActive = currentStep.activeEdge?.[0] === i && currentStep.activeEdge?.[1] === j;

              return (
                <g key={`weight-bubble-${i}-${j}`}>
                  <circle 
                    cx={cpX} 
                    cy={cpY} 
                    r="10" 
                    fill="var(--viz-amber)" 
                    stroke="var(--background)" 
                    strokeWidth={isActive ? 2 : 0}
                    className="shadow-sm"
                  />
                  <text 
                    x={cpX} 
                    y={cpY} 
                    dy="3" 
                    textAnchor="middle" 
                    fontSize="9" 
                    fontWeight="900" 
                    className="font-mono fill-black pointer-events-none select-none"
                  >
                    {weight}
                  </text>
                </g>
              );
            })
          )}

          {/* Nodes */}
          {nodes.map(node => {
            const d = currentStep.distances[node.id];
            const isActive = currentStep.activeEdge?.[0] === node.id || currentStep.activeEdge?.[1] === node.id;
            const isSource = node.id === (nodes[0]?.id ?? 0);
            const isSelected = selectedNode === node.id;

            let nodeColor = "var(--card)";
            let borderColor = "var(--border)";
            let textColor = "var(--foreground)";

            if (isSelected) {
              nodeColor = "var(--viz-amber)";
              borderColor = "var(--viz-amber)";
              textColor = "#000";
            } else if (isActive) {
              nodeColor = "rgba(var(--viz-cyan-rgb), 0.1)";
              borderColor = "var(--viz-cyan)";
            } else if (d !== INF) {
              nodeColor = "rgba(var(--viz-cyan-rgb), 0.03)";
              borderColor = "var(--viz-cyan)";
            }

            return (
              <g key={`node-group-${node.id}`} className="cursor-pointer" onPointerDown={(e) => handlePointerDown(e, node)}>
                {/* Outer circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="20"
                  fill={nodeColor}
                  stroke={borderColor}
                  strokeWidth="2.5"
                  className="transition-colors duration-200"
                />

                {/* Node ID */}
                <text
                  x={node.x}
                  y={node.y}
                  dy="-2"
                  textAnchor="middle"
                  fontSize="9"
                  className="font-mono font-black fill-[var(--muted-foreground)]/50 select-none pointer-events-none"
                >
                  {node.id}
                </text>

                {/* Node Distance value */}
                <text
                  x={node.x}
                  y={node.y}
                  dy="9"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  className="font-mono select-none pointer-events-none fill-[var(--foreground)]"
                >
                  {d === INF ? "∞" : d}
                </text>

                {/* Source Node Pin */}
                {isSource && (
                  <path
                    d={`M ${node.x - 6} ${node.y - 34} c -5 0 -9 4 -9 9 c 0 7 9 17 9 17 s 9 -10 9 -17 c 0 -5 -4 -9 -9 -9 z`}
                    fill="var(--viz-rose)"
                    className="pointer-events-none"
                  />
                )}

                {/* Drag / Pointer capture area (Drawn on top of solid shapes) */}
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="26"
                  fill="rgba(0,0,0,0)"
                  pointerEvents="all"
                  animate={{ scale: isActive || isSelected ? 1.15 : 1 }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Step Message (below canvas) ── */}
      <div className="w-full px-4 py-2.5 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center">
        <div className="flex items-center justify-center gap-2">
          {currentStep.hasNegativeCycle && <AlertTriangle size={14} className="text-[var(--viz-rose)]" />}
          <p className={`text-xs font-mono font-medium ${currentStep.hasNegativeCycle ? "text-[var(--viz-rose)]" : "text-[var(--viz-cyan)]"}`}>{currentStep.message}</p>
        </div>
      </div>

      {/* ── Step Log (below canvas) ── */}
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

      {/* ── Distances Array (below canvas) ── */}
      <div className="w-full bg-[var(--muted)]/25 border border-[var(--border)] rounded-2xl px-4 py-3 flex flex-col gap-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/50 flex items-center gap-1.5">
          <Database size={10} /> Distances Array State
        </span>
        <div className="flex flex-wrap gap-1.5">
          {nodes.map(n => {
            const d = currentStep.distances[n.id];
            const isActive = currentStep.activeEdge?.[0] === n.id || currentStep.activeEdge?.[1] === n.id;
            return (
              <motion.div 
                key={`dist-${n.id}`}
                animate={{ 
                  scale: isActive ? 1.05 : 1,
                  borderColor: isActive ? "var(--viz-cyan)" : "var(--border)",
                  backgroundColor: isActive ? "rgba(var(--viz-cyan-rgb), 0.1)" : "var(--card)"
                }}
                className="flex flex-col items-center border rounded-lg p-1 min-w-[2.5rem] transition-colors"
              >
                <span className="text-[7px] font-mono text-[var(--muted-foreground)] mb-0.5">node {n.id}</span>
                <span className={`text-xs font-bold font-mono ${d === 0 ? "text-[var(--viz-green)]" : "text-[var(--foreground)]"}`}>{d === INF ? "∞" : d}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Scrubber + Nav */}
      <div className="flex flex-col gap-3 w-full p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash size={14} className="text-[var(--viz-lavender)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Step {currentIndex + 1} of {history.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all" disabled={currentIndex === 0}><ChevronLeft size={18} /></button>
            <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all" disabled={currentIndex >= history.length - 1}><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="relative flex items-center w-full">
          <div className="absolute w-full h-1 bg-[var(--muted)]/30 rounded-full" />
          <div className="absolute h-1 bg-[var(--viz-lavender)] rounded-full transition-all"
            style={{ width: `${(currentIndex / Math.max((history.length - 1), 1)) * 100}%` }} />
          <input type="range" min="0" max={Math.max((history.length - 1), 0)} value={currentIndex}
            onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
            className="w-full h-6 opacity-0 cursor-pointer z-10" />
          <div className="absolute w-1.5 h-4 bg-[var(--viz-cyan)] rounded-full pointer-events-none transition-all"
            style={{ left: `calc(${(currentIndex / Math.max((history.length - 1), 1)) * 100}% - 3px)` }} />
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-4 bg-[var(--muted)]/10 rounded-2xl border border-[var(--border)]/20 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-cyan)]" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Active Probe</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)] animate-pulse" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Relaxed Edge</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-amber)]" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Edge Weight</span></div>
        <div className="flex items-center gap-2"><AlertTriangle size={14} className="text-[var(--viz-rose)]" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Negative Cycle</span></div>
      </div>
    </div>
  );
}
