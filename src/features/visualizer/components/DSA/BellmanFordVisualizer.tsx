"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, ChevronLeft, ChevronRight, 
  TrendingUp, Activity, MapPin, RefreshCw,
  Plus, Trash2, Edit3, Move, AlertTriangle, Check
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
  const [nodes, setNodes] = useState<Node[]>(() => {
    const numNodes = 5;
    const width = 800; // Fallback initial width
    const height = 500; // Fallback initial height
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3.5;

    const initialNodes: Node[] = [];
    for (let i = 0; i < numNodes; i++) {
      const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2;
      initialNodes.push({
        id: i,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }
    return initialNodes;
  });
  const [matrix, setMatrix] = useState<number[][]>(() => {
    const numNodes = 5;
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
    return newMatrix;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

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

  const resetSimulation = React.useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
  }, []);

  const generateGraph = React.useCallback(() => {
    resetSimulation();
    const numNodes = 5;
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3.5;

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
  }, [dimensions, resetSimulation]);

  const addNode = React.useCallback(() => {
    if (nodes.length >= 10) return;
    const newId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0;
    const { width, height } = dimensions;
    const rx = Math.random();
    const ry = Math.random();
    const newNode = {
      id: newId,
      x: width / 2 + (rx - 0.5) * 100,
      y: height / 2 + (ry - 0.5) * 100
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
  }, [nodes, dimensions, resetSimulation]);

  const clearGraph = React.useCallback(() => {
    setNodes([]);
    setMatrix([]);
    resetSimulation();
  }, [resetSimulation]);

  const handleNodeClick = React.useCallback((id: number) => {
    if (!isEditing) return;
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
  }, [isEditing, selectedNode, resetSimulation]);

  const updateNodePosition = React.useCallback((id: number, info: { delta: { x: number, y: number } }) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x: n.x + info.delta.x, y: n.y + info.delta.y } : n));
  }, []);

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
        step,
        logs: [...currentLogs],
        hasNegativeCycle: hasNeg,
        phase
      });
    };

    const addLog = (l: string) => { currentLogs = [l, ...currentLogs]; };

    const startNode = nodes[0]?.id ?? 0;
    dist[startNode] = 0;
    addLog(`System initialized. Source node ${startNode} assigned distance 0.`);
    record(`Bellman-Ford initiated. Initializing distances from source ${startNode}.`, "INIT", null, 0, "INIT");

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
            record(`Probing edge ${u} → ${v} (Weight: ${w}). Current dist[${v}] = ${dist[v] === INF ? "∞" : dist[v]}`, "PROBE", [u, v], i, "RELAX");
            
            if (dist[u] !== INF && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                relaxedEdges.add(`${u}-${v}`);
                changed = true;
                record(`Relaxation achieved! dist[${v}] updated to ${dist[v]}.`, "RELAX", [u, v], i, "RELAX");
            } else {
                record(`No update for ${u}→${v}. ${dist[u] === INF ? "∞" : dist[u]} + ${w} is not less than ${dist[v] === INF ? "∞" : dist[v]}.`, "STABLE", [u, v], i, "RELAX");
            }
        }
        if (!changed) {
            record(`Convergence achieved at iteration ${i}. All paths are optimized.`, "CONVERGED", null, i, "RELAX");
            break;
        }
    }

    for (const { u, v, w } of edges) {
        record(`Final check on edge ${u} → ${v} (Weight: ${w}).`, "DETECTION_PROBE", [u, v], V, "DETECTION");
        if (dist[u] !== INF && dist[u] + w < dist[v]) {
            record(`Negative weight cycle detected! Edge ${u} → ${v} can still be relaxed.`, "FAILURE", [u, v], V, "DETECTION", true);
            break;
        }
    }

    record("Computation finished. Minimal distances established.", "COMPLETE", null, V, "COMPLETE");
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
    <div className="flex flex-col gap-6">
      <div className="p-4 md:p-8 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl font-sans text-[var(--foreground)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 relative z-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[var(--viz-rose)]">
              Bellman-Ford <span className="text-[var(--muted-foreground)]/40">Vector Engine</span>
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-1 w-12 bg-[var(--viz-rose)] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--muted-foreground)]/30">Dynamic Edge Relaxation</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {isEditing && (
                 <>
                    <button onClick={addNode} className="flex items-center gap-2 px-4 py-2 bg-[var(--muted)] hover:bg-[var(--accent)] rounded-xl border border-[var(--border)] transition-all text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                        <Plus size={14}/> Node
                    </button>
                    <button onClick={clearGraph} className="flex items-center gap-2 px-4 py-2 bg-[var(--muted)] hover:bg-[var(--accent)] rounded-xl border border-[var(--border)] transition-all text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                        <Trash2 size={14}/> Clear
                    </button>
                     <div className="w-[1px] h-6 bg-[var(--border)] mx-1" />
                 </>
             )}

             <button 
                onClick={() => { setIsEditing(!isEditing); setIsPlaying(false); setSelectedNode(null); }} 
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-xs font-bold ${isEditing ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] shadow-lg" : "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--foreground)]"}`}
             >
                {isEditing ? <><Check size={14} /> Done</> : <><Edit3 size={14} /> Edit</>}
             </button>

             {!isEditing && (
                <>
                    <button onClick={generateGraph} className="p-3 bg-[var(--muted)] hover:bg-[var(--accent)] rounded-xl border border-[var(--border)] transition-all text-[var(--muted-foreground)] hover:text-[var(--foreground)]" title="Randomize"><RefreshCw size={20}/></button>
                    <button onClick={resetSimulation} className="p-3 bg-[var(--muted)] hover:bg-[var(--accent)] rounded-xl border border-[var(--border)] transition-all text-[var(--muted-foreground)] hover:text-[var(--foreground)]" title="Reset"><RotateCcw size={20}/></button>
                    
                    {!isPlaying ? (
                        <button onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(true); }} className="flex items-center gap-2 px-6 py-3 bg-[var(--viz-rose)] text-white rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-lg">
                            <Play size={16} fill="currentColor"/> EXECUTE
                        </button>
                    ) : (
                        <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 px-6 py-3 bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] rounded-xl font-bold text-xs hover:bg-[var(--accent)] transition-all">
                            <Pause size={16} fill="currentColor"/> HALT
                        </button>
                    )}
                </>
             )}
          </div>
        </div>

        <div className="relative min-h-[520px] bg-[var(--muted)]/40 rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-inner flex flex-col items-center justify-center cursor-crosshair">
            
            <div ref={containerRef} className="absolute inset-0 w-full h-full">
                <AnimatePresence>
                    {isEditing && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none z-30">
                            <div className="px-4 py-2 bg-[var(--popover)] text-[var(--popover-foreground)] backdrop-blur-md rounded-full border border-[var(--border)] shadow-2xl flex items-center gap-3">
                                <Move size={12} className="text-[var(--viz-amber)]" />
                                <span className="text-[10px] font-bold tracking-wide">
                                    {selectedNode !== null ? `Target node for Link ${selectedNode} → ...` : "Drag nodes • Click for Directed Link"}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute top-6 right-6 z-30 flex flex-col gap-4 pointer-events-none max-w-[220px]">
                    <div className="bg-[var(--card)]/90 backdrop-blur border border-[var(--border)] p-4 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] flex items-center gap-2">
                                <Hash size={12} /> Iteration
                             </span>
                             <span className="text-lg font-black text-[var(--viz-rose)] font-mono">{currentStep.iteration}</span>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider text-center ${currentStep.phase === "DETECTION" ? "bg-[var(--viz-rose)]/10 border-[var(--viz-rose)]/30 text-[var(--viz-rose)]" : "bg-[var(--viz-cyan)]/10 border-[var(--viz-cyan)]/30 text-[var(--viz-cyan)]"}`}>
                             {currentStep.phase === "DETECTION" ? "Negative Cycle Check" : currentStep.phase === "INIT" ? "Initialization" : currentStep.phase === "COMPLETE" ? "Finished" : "Relaxation Phase"}
                        </div>
                    </div>

                    <div className="bg-[var(--card)]/90 backdrop-blur border border-[var(--border)] p-4 rounded-2xl shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] flex items-center gap-2 mb-3">
                             <TrendingUp size={12} /> Distance Tensor
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                             {nodes.map(n => {
                                 const d = currentStep.distances[n.id];
                                 const isA = currentStep.activeEdge?.[0] === n.id || currentStep.activeEdge?.[1] === n.id;
                                 return (
                                     <div key={n.id} className="flex flex-col items-center">
                                         <span className="text-[8px] text-[var(--muted-foreground)]/50 mb-0.5">{n.id}</span>
                                         <motion.div 
                                             layout
                                             className={`w-8 h-8 rounded-lg border flex items-center justify-center font-mono text-[10px] font-bold transition-colors ${isA ? "bg-[var(--viz-rose)]/20 border-[var(--viz-rose)] text-[var(--viz-rose)]" : d !== INF ? "bg-[var(--viz-cyan)]/10 border-[var(--viz-cyan)] text-[var(--viz-cyan)]" : "border-[var(--border)] text-[var(--muted-foreground)]/30"}`}
                                         >
                                             {d === INF ? "∞" : d}
                                         </motion.div>
                                     </div>
                                 )
                             })}
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {!isEditing && (
                        <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-12 w-full flex justify-center z-30 pointer-events-none">
                            <div className={`px-6 py-3 bg-[var(--card)]/90 border rounded-2xl backdrop-blur-md shadow-2xl max-w-[450px] text-center ${currentStep.hasNegativeCycle ? "border-[var(--viz-rose)]/50" : "border-[var(--border)]"}`}>
                                <div className="flex items-center justify-center gap-3">
                                    {currentStep.hasNegativeCycle && <AlertTriangle size={16} className="text-[var(--viz-rose)]" />}
                                    <p className={`text-xs font-mono font-medium ${currentStep.hasNegativeCycle ? "text-[var(--viz-rose)]" : "text-[var(--viz-amber)]"}`}>{currentStep.message}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <svg className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                        </marker>
                    </defs>

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
                                <g key={`edge-path-${i}-${j}`}>
                                    <motion.path
                                        d={path}
                                        fill="none"
                                        stroke="currentColor"
                                        className={`${isFailure ? "text-[var(--viz-rose)]" : isActive ? "text-[var(--viz-cyan)]" : isRelaxed ? "text-[var(--viz-green)]/40" : "text-[var(--muted-foreground)]/15"}`}
                                        strokeWidth={isActive ? 3 : 1.5}
                                        markerEnd="url(#arrowhead)"
                                        animate={{ opacity: 1 }}
                                    />
                                    {isActive && (
                                        <motion.circle r="4" fill={isFailure ? "var(--viz-rose)" : "var(--viz-cyan)"}>
                                            <animateMotion dur="0.8s" repeatCount="indefinite" path={path} />
                                        </motion.circle>
                                    )}
                                </g>
                            );
                        })
                    )}

                    {matrix.map((row, i) => 
                        row.map((weight, j) => {
                            if (weight === 0) return null;
                            const edgeInfo = getEdgeData(i, j);
                            if (!edgeInfo) return null;
                            const { cpX, cpY } = edgeInfo;
                            
                            const isActive = currentStep.activeEdge?.[0] === i && currentStep.activeEdge?.[1] === j;

                            return (
                                <motion.g 
                                    key={`edge-weight-${i}-${j}`}
                                    animate={{ 
                                        scale: isActive ? 1.3 : 1,
                                    }}
                                >
                                    <circle 
                                        cx={cpX} 
                                        cy={cpY} 
                                        r="12" 
                                        fill="var(--viz-amber)" 
                                        stroke="var(--background)" 
                                        strokeWidth={isActive ? 2 : 0}
                                        style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))" }}
                                    />
                                    <text 
                                        x={cpX} 
                                        y={cpY} 
                                        dy="4" 
                                        textAnchor="middle" 
                                        fontSize="10" 
                                        fontWeight="900" 
                                        className="font-mono" 
                                        fill="var(--background)"
                                    >
                                        {weight}
                                    </text>
                                </motion.g>
                            );
                        })
                    )}
                </svg>

                <div className="relative w-full h-full z-10">
                    {nodes.map(node => {
                        const d = currentStep.distances[node.id];
                        const isActive = currentStep.activeEdge?.[0] === node.id || currentStep.activeEdge?.[1] === node.id;
                        const isSource = node.id === (nodes[0]?.id ?? 0);
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
                                    backgroundColor: isSelected ? "var(--viz-amber)" : isActive ? "var(--background)" : d !== INF ? "rgba(var(--viz-cyan-rgb), 0.05)" : "var(--card)",
                                    borderColor: isSelected ? "var(--viz-amber)" : isActive ? "var(--viz-cyan)" : d !== INF ? "var(--viz-cyan)" : "var(--border)",
                                    scale: isActive || isSelected ? 1.15 : 1,
                                    boxShadow: isActive ? `0 0 30px rgba(var(--viz-cyan-rgb), 0.2)` : "none"
                                }}
                                className={`absolute w-12 h-12 border-2 rounded-full z-20 flex flex-col items-center justify-center font-mono shadow-xl transition-colors ${isEditing ? "cursor-grab active:cursor-grabbing" : ""}`}
                            >
                                <span className={`text-[10px] font-black mb-[-2px] ${isActive || isSelected ? "text-[var(--background)]" : "text-[var(--muted-foreground)]/40"}`}>{node.id}</span>
                                <span className={`text-xs font-black ${d === 0 ? 'text-[var(--viz-green)]' : (isActive || isSelected ? "text-[var(--background)]" : 'text-[var(--foreground)]')}`}>{d === INF ? "∞" : d}</span>
                                {isSource && !isEditing && <div className="absolute -top-6"><MapPin size={14} className="text-[var(--viz-rose)]" /></div>}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>

        <div className={`mt-8 p-6 bg-[var(--muted)] border border-[var(--border)] rounded-[2.5rem] flex flex-col gap-4 relative z-10 transition-opacity ${isEditing ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Activity size={14} className="text-[var(--viz-rose)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Temporal State {currentIndex + 1} of {history.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider">
                <div className="absolute w-full h-1 bg-[var(--background)]/10 rounded-full" />
                <div className="absolute h-1 bg-[var(--viz-rose)] rounded-full shadow-[0_0_10px_rgba(252,98,85,0.4)]" style={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }} />
                <input 
                    type="range" min="0" max={history.length - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute w-1.5 h-4 bg-[var(--foreground)] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] pointer-events-none transition-all"
                    style={{ left: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 3px)` }}
                />
            </div>
        </div>
      </div>

      <div className="px-4 md:px-10 py-6 bg-[var(--muted)]/20 border border-[var(--border)] rounded-[2.5rem] flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-cyan)]" /><span className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Active Probe</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)]" /><span className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Optimal Link</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-rose)]" /><span className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Negative Weight</span></div>
         <div className="flex items-center gap-3"><AlertTriangle size={14} className="text-[var(--viz-rose)]" /><span className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Cycle Detected</span></div>
      </div>
    </div>
  );
}


