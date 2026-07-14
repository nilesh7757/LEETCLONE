"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, ChevronLeft, ChevronRight, 
  TrendingUp, Activity, MapPin, Cpu, RefreshCw,
  Plus, Trash2, Edit3, Move, Check
} from "lucide-react";

type Node = { id: number; x: number; y: number };

interface MSTStep {
  mstEdges: Set<string>;
  activeEdge: [number, number] | null;
  activeNode: number | null;
  visited: Set<number>;
  message: string;
  step: string;
  logs: string[];
}

export default function MSTVisualizer({ speed = 800 }: { speed?: number }) {
  const [nodes, setNodes] = useState<Node[]>(() => {
    const numNodes = 6;
    const width = 800;
    const height = 500;
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
    const numNodes = 6;
    const newMatrix = Array(numNodes).fill(0).map(() => Array(numNodes).fill(0));
    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        if (Math.random() < 0.4) {
          const weight = Math.floor(Math.random() * 9) + 1;
          newMatrix[i][j] = weight;
          newMatrix[j][i] = weight;
        }
      }
    }
    for (let i = 0; i < numNodes - 1; i++) {
        if (newMatrix[i][i+1] === 0) {
            const weight = Math.floor(Math.random() * 5) + 1;
            newMatrix[i][i+1] = weight;
            newMatrix[i+1][i] = weight;
        }
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
    const numNodes = 6;
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
      for (let j = i + 1; j < numNodes; j++) {
        if (Math.random() < 0.4) {
          const weight = Math.floor(Math.random() * 9) + 1;
          newMatrix[i][j] = weight;
          newMatrix[j][i] = weight;
        }
      }
    }
    for (let i = 0; i < numNodes - 1; i++) {
        if (newMatrix[i][i+1] === 0) {
            const weight = Math.floor(Math.random() * 5) + 1;
            newMatrix[i][i+1] = weight;
            newMatrix[i+1][i] = weight;
        }
    }
    setMatrix(newMatrix);
  }, [dimensions, resetSimulation]);

  const addNode = React.useCallback(() => {
    if (nodes.length >= 12) return;
    const newId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0;
    const { width, height } = dimensions;
    const newNode = {
      id: newId,
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height / 2 + (Math.random() - 0.5) * 100
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
          newMat[id][selectedNode] = currentW !== 0 ? 0 : weight;
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
    const steps: MSTStep[] = [];
    const visited = new Set<number>();
    const mstEdges = new Set<string>();
    let currentLogs: string[] = [];
    
    const record = (msg: string, step: string, activeNode: number | null, activeEdge: [number, number] | null = null) => {
      steps.push({
        mstEdges: new Set(mstEdges),
        activeEdge,
        activeNode,
        visited: new Set(visited),
        message: msg,
        step,
        logs: [...currentLogs]
      });
    };

    const addLog = (l: string) => { currentLogs = [l, ...currentLogs]; };

    const startNode = nodes[0]?.id ?? 0;
    visited.add(startNode);
    addLog(`Prim's Algorithm initiated at source Node ${startNode}.`);
    record(`Initializing MST with source Node ${startNode}.`, "INIT", startNode);

    while (visited.size < V) {
        let minWeight = Infinity;
        let bestEdge: [number, number] | null = null;

        for (const u of Array.from(visited)) {
            for (let v = 0; v < maxId; v++) {
                const w = matrix[u]?.[v] || 0;
                if (w > 0 && !visited.has(v)) {
                    if (w < minWeight) {
                        minWeight = w;
                        bestEdge = [u, v];
                    }
                }
            }
        }

        if (!bestEdge) break;

        const [u, v] = bestEdge;
        record(`Evaluating edges connecting to visited component...`, "PROBE", u, [u, v]);
        
        mstEdges.add(`${u}-${v}`);
        mstEdges.add(`${v}-${u}`);
        visited.add(v);
        addLog(`Selected Edge ${u}-${v} (Weight: ${minWeight}). Node ${v} added to MST.`);
        record(`Minimum edge found! Adding ${u}-${v} to the spanning tree.`, "COMMIT", v, [u, v]);
    }

    record("Optimal Minimum Spanning Tree resolved.", "COMPLETE", null);
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
    mstEdges: new Set(),
    activeEdge: null,
    activeNode: null,
    visited: new Set(),
    message: "Initializing...",
    step: "IDLE",
    logs: []
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="p-4 md:p-8 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl font-sans text-[var(--foreground)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 relative z-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[var(--viz-cyan)]">
              Prim&apos;s <span className="text-[var(--muted-foreground)]/40">MST Synthesizer</span>
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-1 w-12 bg-[var(--viz-cyan)] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--muted-foreground)]/30">Minimal Connectivity Lemma</p>
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
                        <button onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(true); }} className="flex items-center gap-2 px-6 py-3 bg-[var(--viz-cyan)] text-black rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-lg">
                            <Play size={16} fill="currentColor"/> START
                        </button>
                    ) : (
                        <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 px-6 py-3 bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] rounded-xl font-bold text-xs hover:bg-[var(--accent)] transition-all">
                            <Pause size={16} fill="currentColor"/> PAUSE
                        </button>
                    )}
                </>
             )}
          </div>
        </div>

        <div className="relative min-h-[350px] md:min-h-[520px] w-full bg-[var(--muted)]/40 rounded-[2.5rem] border border-[var(--border)] overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar shadow-inner flex flex-col items-center justify-center cursor-crosshair">
            
            <div ref={containerRef} className="absolute inset-0 w-full h-full">
                <AnimatePresence>
                    {isEditing && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none z-30">
                            <div className="px-4 py-2 bg-[var(--popover)] text-[var(--popover-foreground)] backdrop-blur-md rounded-full border border-[var(--border)] shadow-2xl flex items-center gap-3">
                                <Move size={12} className="text-[var(--viz-amber)]" />
                                <span className="text-[10px] font-bold tracking-wide">
                                    {selectedNode !== null ? `Target node for Link ${selectedNode} - ...` : "Drag nodes • Click for Weighted Link"}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute top-6 right-6 z-30 flex flex-col gap-4 pointer-events-none max-w-[220px]">
                    <div className="bg-[var(--card)]/90 backdrop-blur border border-[var(--border)] p-4 rounded-2xl shadow-sm h-[200px] overflow-hidden flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] flex items-center gap-2 mb-3">
                             <Activity size={12} /> Strategy Log
                        </span>
                        <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 scrollbar-thin flex-1">
                             <AnimatePresence mode="popLayout">
                                 {currentStep.logs.map((log, i) => (
                                     <motion.div 
                                         key={`log-${i}`}
                                         initial={{ opacity: 0, x: -10 }}
                                         animate={{ opacity: 1, x: 0 }}
                                         className="text-[9px] font-mono text-[var(--muted-foreground)]/70 leading-tight"
                                     >
                                         <span className="text-[var(--viz-cyan)] mr-1">›</span>{log}
                                     </motion.div>
                                 ))}
                             </AnimatePresence>
                        </div>
                    </div>

                    <div className="bg-[var(--card)]/90 backdrop-blur border border-[var(--border)] p-4 rounded-2xl shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] flex items-center gap-2 mb-3">
                             <TrendingUp size={12} /> Visited Pool
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                             {Array.from(currentStep.visited).sort((a, b) => a - b).map(val => (
                                 <div key={val} className="w-7 h-7 rounded-lg bg-[var(--viz-cyan)]/10 border border-[var(--viz-cyan)]/30 text-[var(--viz-cyan)] flex items-center justify-center font-mono text-[10px] font-black">
                                     {val}
                                 </div>
                             ))}
                             {currentStep.visited.size === 0 && <span className="text-[9px] text-[var(--muted-foreground)] italic">None</span>}
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {!isEditing && (
                        <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-12 w-full flex justify-center z-30 pointer-events-none">
                            <div className="px-6 py-3 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl backdrop-blur-md shadow-2xl max-w-[400px] text-center">
                                <p className="text-xs text-[var(--viz-amber)] font-mono font-medium">{currentStep.message}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                    {matrix.map((row, i) => 
                        row.map((weight, j) => {
                            if (weight === 0 || i > j) return null;
                            const u = nodes.find(n => n.id === i);
                            const v = nodes.find(n => n.id === j);
                            if (!u || !v) return null;
                            
                            const isActive = (currentStep.activeEdge?.[0] === i && currentStep.activeEdge?.[1] === j) ||
                                           (currentStep.activeEdge?.[0] === j && currentStep.activeEdge?.[1] === i);
                            const isMST = currentStep.mstEdges.has(`${i}-${j}`);

                            return (
                                <g key={`edge-${i}-${j}`}>
                                    <motion.line
                                        x1={u.x} y1={u.y} x2={v.x} y2={v.y}
                                        stroke="currentColor"
                                        className={`${isActive ? "text-[var(--viz-amber)]" : isMST ? "text-[var(--viz-cyan)]" : "text-[var(--muted-foreground)]/10"}`}
                                        strokeWidth={isMST || isActive ? 3 : 1.5}
                                        animate={{ opacity: 1 }}
                                    />
                                    <circle cx={(u.x+v.x)/2} cy={(u.y+v.y)/2} r="8" fill="var(--card)" stroke="var(--border)" strokeWidth="1" />
                                    <text x={(u.x+v.x)/2} y={(u.y+v.y)/2} dy="3" textAnchor="middle" fontSize="8" fontWeight="bold" fill="var(--muted-foreground)">{weight}</text>
                                </g>
                            );
                        })
                    )}
                </svg>

                <div className="relative w-full h-full z-20">
                    {nodes.map(node => {
                        const isVisited = currentStep.visited.has(node.id);
                        const isA = currentStep.activeNode === node.id || currentStep.activeEdge?.[1] === node.id;
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
                                    backgroundColor: isSelected ? "var(--viz-amber)" : isA ? "var(--viz-cyan)" : isVisited ? "rgba(var(--viz-cyan-rgb), 0.1)" : "var(--card)",
                                    borderColor: isSelected ? "var(--viz-amber)" : isA ? "var(--viz-cyan)" : isVisited ? "var(--viz-cyan)" : "var(--border)",
                                    scale: isA || isSelected ? 1.15 : 1,
                                    boxShadow: isA ? `0 0 30px rgba(var(--viz-cyan-rgb), 0.2)` : "none"
                                }}
                                className={`absolute w-12 h-12 border-2 rounded-full flex flex-col items-center justify-center font-mono shadow-xl transition-colors ${isEditing ? "cursor-grab active:cursor-grabbing" : ""}`}
                            >
                                <span className={`text-xs font-black ${isA || isSelected ? "text-black" : 'text-[var(--foreground)]'}`}>{node.id}</span>
                                {isSource && !isEditing && <div className="absolute -top-6"><MapPin size={14} className="text-[var(--viz-rose)]" /></div>}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>

        <div className={`mt-8 p-3 md:p-6 bg-[var(--muted)] border border-[var(--border)] rounded-[2.5rem] flex flex-col gap-4 relative z-10 transition-opacity ${isEditing ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 px-2">
                <div className="flex items-center gap-3">
                    <Activity size={14} className="text-[var(--viz-rose)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Computation Frame {currentIndex + 1} of {history.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider w-full md:w-auto flex-1">
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
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-amber)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Edge Candidate</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-cyan)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">MST Component</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-rose)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Source Root</span></div>
         <div className="flex items-center gap-3"><Cpu size={14} className="text-[var(--viz-cyan)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Greedy Solver</span></div>
      </div>
    </div>
  );
}


