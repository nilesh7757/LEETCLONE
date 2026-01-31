"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Sparkles, Hash, Link as LinkIcon, 
  Search, Info, ChevronLeft, ChevronRight, Zap, GitBranch,
  Layers, ArrowUp, MousePointer2, Network, Share2, StepForward,
  TrendingUp, Activity, Layout, RefreshCw, Database, Cpu,
  Plus, Trash2, Edit3, Move, X, Check
} from "lucide-react";

type Node = { id: number; x: number; y: number };

interface GraphStep {
  visited: Set<number>;
  queue: number[];
  visitOrder: number[];
  activeNode: number | null;
  activeEdge: string | null;
  checkingCell: { r: number; c: number } | null;
  message: string;
  step: string;
  logs: string[];
}

export default function GraphVisualizer({ speed = 800 }: { speed?: number }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [mode, setMode] = useState<"BFS" | "DFS">("BFS");
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
        if (Math.random() < 0.4) {
          newMatrix[i][j] = 1;
          newMatrix[j][i] = 1;
        }
      }
    }
    setMatrix(newMatrix);
  };

  useEffect(() => {
    if (dimensions.width > 0 && nodes.length === 0) generateGraph();
  }, [dimensions.width]);

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
      setMatrix(prev => {
          const newMat = prev.map(row => [...row]);
          const val = newMat[selectedNode][id] === 1 ? 0 : 1;
          newMat[selectedNode][id] = val;
          newMat[id][selectedNode] = val;
          return newMat;
      });
      setSelectedNode(null);
      resetSimulation();
    }
  };

  const updateNodePosition = (id: number, info: any) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x: n.x + info.delta.x, y: n.y + info.delta.y } : n));
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const history = useMemo(() => {
    if (nodes.length === 0) return [];
    const steps: GraphStep[] = [];
    let visited = new Set<number>();
    let queue: number[] = [];
    let visitOrder: number[] = [];
    let logs: string[] = [];

    const record = (msg: string, step: string, active: number | null = null, edge: string | null = null, cell: {r:number,c:number} | null = null) => {
      steps.push({
        visited: new Set(visited),
        queue: [...queue],
        visitOrder: [...visitOrder],
        activeNode: active,
        activeEdge: edge,
        checkingCell: cell,
        message: msg,
        step: step,
        logs: [...logs]
      });
    };

    record(`Ready to commence ${mode} search.`, "INIT");

    for (let startNodeIdx = 0; startNodeIdx < nodes.length; startNodeIdx++) {
        const startNode = nodes[startNodeIdx].id;
        if (visited.has(startNode)) continue;

        queue = [startNode];
        visited.add(startNode);
        record(`Injecting source node ${startNode} into the search manifold.`, "START_NODE", startNode);

        while (queue.length > 0) {
            const u = mode === "BFS" ? queue.shift()! : queue.pop()!;
            visitOrder.push(u);
            record(`Extracted node ${u}. Resolving adjacent connections.`, "EXTRACTION", u);

            for (let vIdx = 0; vIdx < nodes.length; vIdx++) {
                const v = nodes[vIdx].id;
                if (u === v) continue;
                if (matrix[u]?.[v] === 1) {
                    const edgeKey = `${Math.min(u, v)}-${Math.max(u, v)}`;
                    record(`Probing adjacent node ${v} via link {${u}, ${v}}.`, "PROBE", u, edgeKey, { r: u, c: v });

                    if (!visited.has(v)) {
                        visited.add(v);
                        queue.push(v);
                        record(`Unseen node ${v} detected. Adding to search buffer.`, "DISCOVERY", v, edgeKey, { r: u, c: v });
                    } else {
                        record(`Node ${v} already stabilized. Skipping discovery.`, "STABLE_SKIP", u, edgeKey, { r: u, c: v });
                    }
                }
            }
        }
    }

    record(`${mode} traversal sequence fully resolved.`, "COMPLETE");
    return steps;
  }, [nodes, matrix, mode]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => prev >= history.length - 1 ? (setIsPlaying(false), prev) : prev + 1);
      }, speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, history.length, speed]);

  const currentStep = history[currentIndex] || {
    visited: new Set(), queue: [], visitOrder: [], activeNode: null, activeEdge: null, checkingCell: null, message: "Initializing...", step: "IDLE", logs: []
  };

  const getLineCoords = (uIdx: number, vIdx: number) => {
    const u = nodes.find(n => n.id === uIdx), v = nodes.find(n => n.id === vIdx);
    if (!u || !v) return { x1: 0, y1: 0, x2: 0, y2: 0 };
    const dx = v.x - u.x, dy = v.y - u.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    const radius = 24;
    return {
        x1: u.x + (dx / dist) * radius, y1: u.y + (dy / dist) * radius,
        x2: v.x - (dx / dist) * radius, y2: v.y - (dy / dist) * radius
    };
  };

  const activeColor = mode === "BFS" ? "var(--viz-rose)" : "var(--viz-rose)";
  const activeColorRGB = mode === "BFS" ? "var(--viz-blue-rgb)" : "var(--viz-red-rgb)";

  return (
    <div className="flex flex-col gap-6">
      <div className="p-8 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl font-sans text-[var(--foreground)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 relative z-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight" style={{ color: activeColor }}>
              Graph <span className="text-[var(--muted-foreground)]/40">Traversal</span>
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-1 w-12 rounded-full" style={{ backgroundColor: activeColor }} />
               <div className="flex bg-[var(--muted)] p-1 rounded-lg border border-[var(--border)]">
                  <button onClick={() => { setMode("BFS"); resetSimulation(); }} className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${mode === "BFS" ? "bg-[var(--viz-rose)] text-[var(--background)]" : "text-[var(--muted-foreground)]/40"}`}>BFS</button>
                  <button onClick={() => { setMode("DFS"); resetSimulation(); }} className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${mode === "DFS" ? "bg-[var(--viz-rose)] text-[var(--background)]" : "text-[var(--muted-foreground)]/40"}`}>DFS</button>
               </div>
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
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(0); }} className="p-3 bg-[var(--muted)] hover:bg-[var(--accent)] rounded-xl border border-[var(--border)] transition-all text-[var(--muted-foreground)] hover:text-[var(--foreground)]" title="Reset"><RotateCcw size={20}/></button>
                    
                    {!isPlaying ? (
                        <button onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(true); }} className="flex items-center gap-2 px-6 py-3 text-[var(--background)] rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-lg" style={{ backgroundColor: activeColor }}>
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

        <div className="relative min-h-[500px] bg-[var(--muted)]/40 rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-inner flex flex-col items-center justify-center cursor-crosshair">
            
            <div ref={containerRef} className="absolute inset-0 w-full h-full">
                <AnimatePresence>
                    {isEditing && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none z-30">
                            <div className="px-4 py-2 bg-[var(--popover)] text-[var(--popover-foreground)] backdrop-blur-md rounded-full border border-[var(--border)] shadow-2xl flex items-center gap-3">
                                <Move size={12} className="text-[var(--viz-amber)]" />
                                <span className="text-[10px] font-bold tracking-wide">
                                    {selectedNode !== null ? `Select target to link Node ${selectedNode}` : "Drag nodes • Click to Link"}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute top-6 right-6 z-30 flex flex-col items-end gap-2 pointer-events-none">
                    <div className="bg-[var(--card)]/90 backdrop-blur border border-[var(--border)] px-3 py-1.5 rounded-lg shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] flex items-center gap-2">
                             <Activity size={12} /> {mode === 'BFS' ? 'Queue' : 'Stack'}
                        </span>
                    </div>
                    <div className="flex flex-col gap-2 p-2">
                         <AnimatePresence mode="popLayout">
                            {currentStep.queue.map((id, i) => (
                                <motion.div
                                    key={`q-${id}-${i}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-mono text-xs font-black shadow-lg bg-[var(--card)]"
                                    style={{ borderColor: activeColor, color: activeColor }}
                                >
                                    {id}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {currentStep.queue.length === 0 && <span className="text-[9px] italic text-[var(--muted-foreground)]/50 pr-2">Empty</span>}
                    </div>
                </div>

                <AnimatePresence>
                    {!isEditing && currentStep.step !== "IDLE" && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-8 left-10 flex items-center gap-2 px-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-full z-30 shadow-lg pointer-events-none">
                            <Zap size={12} style={{ color: activeColor }} />
                            <span className="text-[9px] font-black font-mono uppercase tracking-[0.2em]" style={{ color: activeColor }}>{currentStep.step}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {!isEditing && (
                        <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-8 w-full flex justify-center z-30 pointer-events-none">
                            <div className="px-6 py-3 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl backdrop-blur-md shadow-2xl max-w-[400px] text-center">
                                <p className="text-xs text-[var(--viz-amber)] font-mono font-medium">{currentStep.message}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                    {matrix.map((row, i) => 
                        row.map((val, j) => {
                            if (i >= j || val === 0) return null;
                            const { x1, y1, x2, y2 } = getLineCoords(i, j);
                            const edgeKey = `${Math.min(i,j)}-${Math.max(i,j)}`;
                            const isH = currentStep.activeEdge === edgeKey;
                            return (
                                <motion.line
                                    key={`edge-${i}-${j}`}
                                    x1={x1} y1={y1} x2={x2} y2={y2}
                                    stroke="currentColor"
                                    className={`${isH ? "text-[var(--viz-amber)]" : "text-[var(--muted-foreground)]/15"}`}
                                    strokeWidth={isH ? 4 : 2}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                            );
                        })
                    )}
                </svg>

                <div className="relative w-full h-full">
                    {nodes.map(node => {
                        const isV = currentStep.visited.has(node.id);
                        const isA = currentStep.activeNode === node.id;
                        const isSelected = selectedNode === node.id;
                        const nodeColor = isSelected || isA ? "var(--viz-amber)" : isV ? (mode === 'BFS' ? "var(--viz-green)" : "var(--viz-lavender)") : "var(--card)";
                        const nodeColorRGB = isSelected || isA ? "var(--viz-gold-rgb)" : isV ? (mode === 'BFS' ? "var(--viz-green-rgb)" : "var(--viz-purple-rgb)") : "0,0,0";

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
                                    backgroundColor: nodeColor,
                                    borderColor: nodeColor,
                                    scale: isA || isSelected ? 1.2 : 1,
                                    boxShadow: isA || isSelected || isV ? `0 0 30px rgba(${nodeColorRGB}, 0.3)` : "none"
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className={`absolute w-10 h-10 border-2 rounded-full z-20 flex flex-col items-center justify-center font-mono shadow-lg ${isEditing ? "cursor-grab active:cursor-grabbing" : ""}`}
                            >
                                <span className={`text-xs font-black ${isA || isV || isSelected ? "text-[var(--background)]" : "text-[var(--foreground)]"}`}>{node.id}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>

        <div className={`mt-8 p-6 bg-[var(--muted)] border border-[var(--border)] rounded-[2.5rem] flex flex-col gap-4 relative z-10 transition-opacity ${isEditing ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Hash size={14} className="text-[var(--viz-amber)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Lemma Sequence {currentIndex + 1} of {history.length || 1}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider">
                <div className="absolute w-full h-1 bg-[var(--background)]/10 rounded-full" />
                <div className="absolute h-1 rounded-full shadow-[0_0_10px rgba(${activeColorRGB}, 0.3)]" style={{ width: `${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}%`, backgroundColor: activeColor }} />
                <input 
                    type="range" min="0" max={(history.length || 1) - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute w-1.5 h-4 bg-[var(--viz-amber)] rounded-full shadow-[0_0_15px_rgba(var(--viz-gold-rgb), 0.5)] pointer-events-none transition-all"
                    style={{ left: `calc(${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}% - 3px)` }}
                />
            </div>
        </div>
      </div>

      <div className="px-10 py-6 bg-[var(--muted)]/20 border border-[var(--border)] rounded-[2.5rem] flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-amber)]" /><span className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Active Search</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)]" /><span className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">BFS Stabilized</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-lavender)]" /><span className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">DFS Stabilized</span></div>
         <div className="flex items-center gap-3"><Cpu size={14} className="text-[var(--muted-foreground)]/20" /><span className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Adjacency Manifold</span></div>
      </div>
    </div>
  );
}
