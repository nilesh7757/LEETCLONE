"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, ChevronLeft, ChevronRight, 
  TrendingUp, Activity, MapPin, Cpu, RefreshCw,
  Plus, Trash2, Edit3, Move, Check, Terminal
} from "lucide-react";

const INF = 99;

type Node = { id: number; x: number; y: number };

interface DijkstraStep {
  distances: number[];
  visited: Set<number>;
  activeNode: number | null;
  activeEdge: [number, number] | null;
  relaxedEdges: Set<string>;
  message: string;
  step: string;
  logs: string[];
}

const V_WIDTH = 800;
const V_HEIGHT = 500;

export default function DijkstraVisualizer({ speed = 800 }: { speed?: number }) {
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

  const resetSimulation = React.useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
  }, []);

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
        if (i !== j && Math.random() < 0.4) {
          initialMatrix[i][j] = Math.floor(Math.random() * 9) + 1;
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
      initializeDefaultGraph();
    }
  }, [nodes.length, initializeDefaultGraph]);

  const generateGraph = React.useCallback(() => {
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
        if (i !== j && Math.random() < 0.4) {
          newMatrix[i][j] = Math.floor(Math.random() * 9) + 1;
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

  const clearGraph = React.useCallback(() => {
    setNodes([]);
    setMatrix([]);
    resetSimulation();
  }, [resetSimulation]);

  const handleNodeClick = React.useCallback((id: number) => {
    if (selectedNode === null) {
      setSelectedNode(id);
    } else if (selectedNode === id) {
      setSelectedNode(null);
    } else {
      const weight = Math.floor(Math.random() * 9) + 1;
      setMatrix(prev => {
          const newMat = prev.map(row => [...row]);
          const currentW = newMat[selectedNode][id];
          newMat[selectedNode][id] = currentW !== 0 ? 0 : weight;
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
    const steps: DijkstraStep[] = [];
    const dist = Array(maxId).fill(INF);
    const visited = new Set<number>();
    const relaxedEdges = new Set<string>();
    let currentLogs: string[] = [];
    
    const record = (msg: string, step: string, activeNode: number | null = null, activeEdge: [number, number] | null = null) => {
      steps.push({
        distances: [...dist],
        visited: new Set(visited),
        activeNode,
        activeEdge,
        relaxedEdges: new Set(relaxedEdges),
        message: msg,
        step,
        logs: [...currentLogs]
      });
    };

    const addLog = (l: string) => { currentLogs = [l, ...currentLogs]; };

    const startNode = nodes[0]?.id ?? 0;
    dist[startNode] = 0;
    addLog(`Dijkstra's Algorithm initiated at source Node ${startNode}.`);
    record(`Initializing distances. Node ${startNode} cost set to 0.`, "INIT", startNode);

    for (let count = 0; count < V; count++) {
        let u = -1;
        let minDist = INF;
        for (let i = 0; i < maxId; i++) {
            if (!visited.has(i) && dist[i] < minDist) {
                minDist = dist[i];
                u = i;
            }
        }

        if (u === -1) break;

        visited.add(u);
        addLog(`Settled Node ${u} with minimal cost ${dist[u]}.`);
        record(`Selecting unvisited Node ${u} with smallest current distance.`, "PICK_MIN", u);

        for (let v = 0; v < maxId; v++) {
            const weight = matrix[u]?.[v] || 0;
            if (weight > 0 && !visited.has(v)) {
                record(`Evaluating edge ${u} → ${v} (Weight: ${weight})...`, "PROBE", u, [u, v]);
                if (dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    relaxedEdges.add(`${u}-${v}`);
                    addLog(`Relaxed path to Node ${v} via Node ${u}: New Cost ${dist[v]}.`);
                    record(`Relaxed path! dist[${v}] updated to ${dist[v]}.`, "RELAX", u, [u, v]);
                } else {
                    record(`No update for Node ${v}. Path via Node ${u} (${dist[u]} + ${weight}) >= current ${dist[v] === INF ? "∞" : dist[v]}.`, "STABLE", u, [u, v]);
                }
            }
        }
    }

    record("Optimal shortest paths resolved from source.", "COMPLETE");
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
    visited: new Set(),
    activeNode: null,
    activeEdge: null,
    relaxedEdges: new Set(),
    message: "Initializing...",
    step: "IDLE",
    logs: []
  };

  const getEdgeData = (uIdx: number, vIdx: number) => {
    const u = nodes.find(n => n.id === uIdx);
    const v = nodes.find(n => n.id === vIdx);
    if (!u || !v) return null;
    const dx = v.x - u.x, dy = v.y - u.y, d = Math.sqrt(dx*dx + dy*dy);
    const ux = dx/d, uy = dy/d;
    const hasOpposite = matrix[vIdx]?.[uIdx] !== 0;
    const curve = hasOpposite ? 30 : 0;
    const cpX = (u.x + v.x)/2 - uy * curve;
    const cpY = (u.y + v.y)/2 + ux * curve;
    const path = `M ${u.x + ux*20} ${u.y + uy*20} Q ${cpX} ${cpY} ${v.x - ux*25} ${v.y - uy*25}`;
    return { path, cpX, cpY, ux, uy };
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (currentIndex >= history.length - 1) setCurrentIndex(0);
              setIsPlaying(!isPlaying);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--viz-cyan)] hover:bg-[var(--viz-cyan)]/80 text-black rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause size={14} fill="currentColor" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={resetSimulation}
            className="p-2.5 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer"
            title="Reset Dijkstra Simulation"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={generateGraph}
            className="p-2.5 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer"
            title="Randomize Graph"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={addNode}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all text-xs font-bold cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Node</span>
          </button>

          <button
            onClick={clearGraph}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[var(--card)] hover:bg-[var(--viz-rose)]/10 hover:text-[var(--viz-rose)] hover:border-[var(--viz-rose)]/30 border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] transition-all text-xs font-bold cursor-pointer"
            title="Clear Graph"
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Visual Canvas */}
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
            <marker id="arrowhead-dijkstra" markerWidth="10" markerHeight="7" refX="19" refY="3.5" orient="auto">
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

              return (
                <g key={`edge-path-${i}-${j}`}>
                  <motion.path
                    d={path}
                    fill="none"
                    stroke="currentColor"
                    className={`${isActive ? "text-[var(--viz-cyan)]" : isRelaxed ? "text-[var(--viz-green)]/40" : "text-[var(--muted-foreground)]/35"}`}
                    strokeWidth={isActive ? 3 : 1.5}
                    markerEnd="url(#arrowhead-dijkstra)"
                    animate={{ opacity: 1 }}
                  />
                  {isActive && (
                    <motion.circle r="3.5" fill="var(--viz-cyan)">
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
                <g key={`edge-weight-${i}-${j}`}>
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
            const isVisited = currentStep.visited.has(node.id);
            const isActive = currentStep.activeNode === node.id || currentStep.activeEdge?.[1] === node.id;
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
            } else if (isVisited) {
              nodeColor = "rgba(var(--viz-green-rgb), 0.1)";
              borderColor = "var(--viz-green)";
            } else if (d !== INF) {
              nodeColor = "rgba(var(--viz-cyan-rgb), 0.03)";
              borderColor = "var(--viz-cyan)";
            }

            return (
              <g key={`node-group-${node.id}`} className="cursor-pointer" onPointerDown={(e) => handlePointerDown(e, node)}>
                {/* Node Shape */}
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

      {/* Step Message (below canvas) */}
      <div className="w-full px-4 py-2.5 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center shadow-sm">
        <p className="text-xs text-[var(--viz-cyan)] font-mono font-bold tracking-tight">
          {currentStep.message}
        </p>
      </div>

      {/* Control Timeline (below canvas) */}
      <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-[var(--viz-cyan)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
              Step {currentIndex + 1} of {history.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} 
              className="p-1.5 hover:bg-[var(--accent)] border border-[var(--border)]/40 rounded-lg text-[var(--muted-foreground)] transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} 
              className="p-1.5 hover:bg-[var(--accent)] border border-[var(--border)]/40 rounded-lg text-[var(--muted-foreground)] transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="relative flex items-center group/slider w-full h-6">
          <div className="absolute w-full h-1 bg-[var(--border)] rounded-full" />
          <div 
            className="absolute h-1 bg-[var(--viz-cyan)] rounded-full shadow-[0_0_10px_rgba(34,211,238,0.4)]" 
            style={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }} 
          />
          <input 
            type="range" 
            min="0" 
            max={history.length - 1} 
            value={currentIndex} 
            onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
            className="w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div 
            className="absolute w-2.5 h-2.5 bg-[var(--foreground)] rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] pointer-events-none group-hover/slider:scale-125 transition-transform"
            style={{ left: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 5px)` }}
          />
        </div>
      </div>

      {/* Distance Array Table (below canvas) */}
      <div className="w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 md:p-6 shadow-sm overflow-x-auto">
         <h3 className="text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-3 flex items-center gap-2">
            <Cpu size={14} className="text-[var(--viz-cyan)]" />
            Distance Array
         </h3>
         <table className="w-full text-center border-collapse text-xs font-mono">
            <thead>
               <tr className="border-b border-[var(--border)]">
                  <th className="py-2 px-1 font-bold text-[var(--muted-foreground)]">Node</th>
                  {nodes.map(n => (
                     <th key={n.id} className="py-2 px-1 font-bold">{n.id}</th>
                  ))}
               </tr>
            </thead>
            <tbody>
               <tr>
                  <td className="py-2 px-1 font-bold text-[var(--muted-foreground)]">Distance</td>
                  {nodes.map(n => {
                     const val = currentStep.distances[n.id];
                     const isSrc = n.id === 0;
                     const isV = currentStep.visited.has(n.id);
                     const isA = currentStep.activeNode === n.id;
                     
                     let txtColor = "";
                     if (isA) txtColor = "text-[var(--viz-cyan)]";
                     else if (isV) txtColor = "text-[var(--viz-green)]";
                     else if (val !== INF) txtColor = "text-[var(--viz-cyan)]/70";
                     
                     return (
                        <td key={n.id} className={`py-2 px-1 font-black transition-colors duration-200 ${txtColor}`}>
                           {val === INF ? "∞" : val}
                        </td>
                     );
                  })}
               </tr>
            </tbody>
         </table>
      </div>

      {/* Logs & Visited Nodes (below canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Step Logs */}
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-2xl shadow-sm h-[200px] flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] flex items-center gap-2 mb-3">
            <Terminal size={12} className="text-[var(--viz-cyan)]" />
            Step Logs
          </span>
          <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1 custom-scrollbar text-xs font-mono">
            <AnimatePresence mode="popLayout">
              {currentStep.logs.map((log, i) => (
                <motion.div 
                  key={`log-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[11px] text-[var(--muted-foreground)]/80 leading-relaxed"
                >
                  <span className="text-[var(--viz-cyan)] mr-1.5 font-black">›</span>
                  {log}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Visited Nodes */}
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-2xl shadow-sm flex flex-col h-[200px]">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] flex items-center gap-2 mb-3">
            <Check size={12} className="text-[var(--viz-cyan)]" />
            Visited Nodes (Settled)
          </span>
          <div className="flex flex-wrap gap-2 overflow-y-auto content-start flex-1 pr-1 custom-scrollbar">
            {Array.from(currentStep.visited).sort((a, b) => a - b).map(val => (
              <div 
                key={val} 
                className="w-8 h-8 rounded-xl bg-[var(--viz-green)]/10 border border-[var(--viz-green)]/30 text-[var(--viz-green)] flex items-center justify-center font-mono text-xs font-bold"
              >
                {val}
              </div>
            ))}
            {currentStep.visited.size === 0 && (
              <span className="text-xs text-[var(--muted-foreground)] italic p-2">None</span>
            )}
          </div>
        </div>
      </div>

      {/* Legend Block */}
      <div className="px-4 py-4 bg-[var(--muted)]/20 border border-[var(--border)] rounded-2xl flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-cyan)] animate-pulse" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Active Node</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)]" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Visited / Settled</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-rose)]" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Source Root</span>
        </div>
      </div>
    </div>
  );
}
