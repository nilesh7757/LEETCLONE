"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, RefreshCw } from "lucide-react";

const MANIM_COLORS = {
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#FFFF00",
  red: "#FC6255",
  background: "#1C1C1C",
  text: "#FFFFFF"
};

const NUM_NODES = 5;

type Node = { id: number; x: number; y: number };

export default function GraphVisualizer({ speed = 500 }: { speed?: number }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [activeEdge, setActiveEdge] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [visitOrder, setVisitOrder] = useState<number[]>([]);
  const [checkingCell, setCheckingCell] = useState<{ r: number; c: number } | null>(null);
  const [queue, setQueue] = useState<number[]>([]);
  const stopRef = useRef(false);
  const [mode, setMode] = useState<"BFS" | "DFS">("BFS");
  
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (dimensions.width > 0) generateGraph();
  }, [dimensions]);

  const generateGraph = () => {
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    const newNodes: Node[] = [];
    for (let i = 0; i < NUM_NODES; i++) {
      const angle = (i / NUM_NODES) * 2 * Math.PI - Math.PI / 2;
      newNodes.push({
        id: i,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }
    setNodes(newNodes);

    const newMatrix = Array(NUM_NODES).fill(0).map(() => Array(NUM_NODES).fill(0));
    for (let i = 0; i < NUM_NODES; i++) {
      for (let j = i + 1; j < NUM_NODES; j++) {
        const hasEdge = Math.random() < 0.4 ? 1 : 0;
        newMatrix[i][j] = hasEdge;
        newMatrix[j][i] = hasEdge;
      }
    }
    setMatrix(newMatrix);
    resetState();
  };

  const resetState = () => {
    setIsRunning(false);
    setActiveNode(null);
    setActiveEdge(null);
    setVisited(new Set());
    setVisitOrder([]);
    setCheckingCell(null);
    setQueue([]);
    stopRef.current = false;
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const runTraversal = async () => {
    if (isRunning) return;
    resetState();
    setIsRunning(true);
    stopRef.current = false;

    const newVisited = new Set<number>();
    
    for (let startNode = 0; startNode < NUM_NODES; startNode++) {
      if (stopRef.current) break;
      if (newVisited.has(startNode)) continue;

      const q = [startNode];
      newVisited.add(startNode);
      setVisited(new Set(newVisited));
      setQueue([...q]);

      while (q.length > 0) {
        if (stopRef.current) break;

        const u = mode === "BFS" ? q.shift()! : q.pop()!;
        setQueue([...q]);
        setActiveNode(u);
        setVisitOrder(prev => [...prev, u]);
        
        await sleep(speed);

        for (let v = 0; v < NUM_NODES; v++) {
          if (stopRef.current) break;
          if (u === v) continue;

          setCheckingCell({ r: u, c: v });
          await sleep(speed / 2);

          if (matrix[u][v] === 1) {
            setActiveEdge(`${Math.min(u, v)}-${Math.max(u, v)}`);
            
            if (!newVisited.has(v)) {
              newVisited.add(v);
              setVisited(new Set(newVisited));
              q.push(v);
              setQueue([...q]);
              await sleep(speed);
            }
          }
          setCheckingCell(null);
          setActiveEdge(null);
        }
      }
    }
    
    setIsRunning(false);
    setActiveNode(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-[3rem] shadow-2xl font-sans text-white relative overflow-hidden group">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 relative z-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-light text-[#58C4DD]">{mode} <span className="text-white/20 italic">Traversal</span></h2>
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">{mode === 'BFS' ? 'Breadth-First Search' : 'Depth-First Search'}</p>
          </div>
          <div className="flex gap-2">
             <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mr-2">
                <button onClick={() => setMode("BFS")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === "BFS" ? "bg-[#58C4DD] text-black" : "text-white/40 hover:text-white"}`}>BFS</button>
                <button onClick={() => setMode("DFS")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === "DFS" ? "bg-[#FC6255] text-black" : "text-white/40 hover:text-white"}`}>DFS</button>
             </div>
            <button onClick={generateGraph} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white/60 hover:text-white" disabled={isRunning}><RefreshCw size={18} /></button>
            <button onClick={resetState} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white/60 hover:text-white" disabled={isRunning}><RotateCcw size={18} /></button>
            <button onClick={runTraversal} disabled={isRunning} className={`flex items-center gap-2 px-6 py-3 text-black rounded-2xl font-bold text-xs hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 ${mode === "BFS" ? "bg-[#58C4DD]" : "bg-[#FC6255]"}`}>
              <Play size={16} fill="currentColor" /> START
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Graph Canvas */}
            <div ref={containerRef} className="relative w-full h-[400px] bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
                
                <svg width="100%" height="100%" className="absolute top-0 left-0 pointer-events-none">
                    {matrix.map((row, i) => 
                    row.map((val, j) => {
                        if (i >= j || val === 0) return null;
                        const u = nodes[i];
                        const v = nodes[j];
                        if (!u || !v) return null;
                        const isHighlighted = activeEdge === `${i}-${j}`;
                        return (
                        <motion.line
                            key={`edge-${i}-${j}`}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ 
                            pathLength: 1, 
                            opacity: 1,
                            stroke: isHighlighted ? MANIM_COLORS.gold : `${MANIM_COLORS.blue}33`,
                            strokeWidth: isHighlighted ? 4 : 2
                            }}
                            x1={u.x} y1={u.y} x2={v.x} y2={v.y}
                            transition={{ duration: 0.3 }}
                        />
                        );
                    })
                    )}
                </svg>
                
                {nodes.map((node) => {
                    const isVisited = visited.has(node.id);
                    const isActive = activeNode === node.id;
                    return (
                    <motion.div
                        key={node.id}
                        layout
                        initial={{ scale: 0 }}
                        animate={{ scale: isActive ? 1.2 : 1 }}
                        className="absolute w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold text-lg border-[3px] transition-colors z-10 shadow-xl"
                        style={{ 
                            left: node.x - 24, 
                            top: node.y - 24,
                            backgroundColor: isActive ? MANIM_COLORS.gold : isVisited ? (mode === 'BFS' ? MANIM_COLORS.green : MANIM_COLORS.red) : "#1C1C1C",
                            borderColor: isActive ? MANIM_COLORS.gold : isVisited ? (mode === 'BFS' ? MANIM_COLORS.green : MANIM_COLORS.red) : MANIM_COLORS.blue,
                            color: isActive || isVisited ? "#000" : "white"
                        }}
                    >
                        {node.id}
                    </motion.div>
                    );
                })}
            </div>

            {/* Matrix & Queue */}
            <div className="flex flex-col gap-6">
                {/* Matrix */}
                <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[2.5rem] flex flex-col gap-4">
                    <span className="text-[10px] font-black uppercase text-white/30 tracking-widest px-2">Adjacency Tensor</span>
                    <div className="grid gap-1.5" style={{ gridTemplateColumns: `auto repeat(${NUM_NODES}, minmax(0, 1fr))` }}>
                        <div className="w-8 h-8"></div>
                        {nodes.map(n => <div key={`col-${n.id}`} className="w-8 h-8 flex items-center justify-center text-xs font-mono font-bold text-white/40">{n.id}</div>)}
                        {matrix.map((row, i) => (
                            <React.Fragment key={`row-${i}`}>
                                <div className="w-8 h-8 flex items-center justify-center text-xs font-mono font-bold text-white/40">{i}</div>
                                {row.map((val, j) => {
                                    const isChecking = checkingCell?.r === i && checkingCell?.c === j;
                                    const isOne = val === 1;
                                    return (
                                        <motion.div
                                            key={`cell-${i}-${j}`}
                                            animate={{ 
                                                backgroundColor: isChecking ? `${MANIM_COLORS.gold}44` : isOne ? `${MANIM_COLORS.blue}22` : "transparent",
                                                borderColor: isChecking ? MANIM_COLORS.gold : isOne ? `${MANIM_COLORS.blue}66` : "rgba(255,255,255,0.1)"
                                            }}
                                            className="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-mono"
                                        >
                                            <span style={{ color: isOne ? MANIM_COLORS.blue : "rgba(255,255,255,0.1)" }}>{val}</span>
                                        </motion.div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Queue/Stack Visualization */}
                <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[2.5rem] flex flex-col gap-4 min-h-[120px]">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">{mode === "BFS" ? "Search Queue (FIFO)" : "Search Stack (LIFO)"}</span>
                    </div>
                    <div className="flex gap-3 h-12 items-center overflow-x-auto px-2">
                        <AnimatePresence>
                            {queue.map((nodeId, idx) => (
                                <motion.div
                                    key={`${nodeId}-${idx}`}
                                    initial={{ opacity: 0, scale: 0.5, x: -20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.5, x: 20 }}
                                    className="min-w-[40px] h-10 rounded-xl border flex items-center justify-center font-mono text-sm font-bold shadow-lg"
                                    style={{ 
                                        backgroundColor: `${mode === 'BFS' ? MANIM_COLORS.blue : MANIM_COLORS.red}22`,
                                        borderColor: mode === 'BFS' ? MANIM_COLORS.blue : MANIM_COLORS.red,
                                        color: mode === 'BFS' ? MANIM_COLORS.blue : MANIM_COLORS.red
                                    }}
                                >
                                    {nodeId}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {queue.length === 0 && <span className="text-xs font-mono text-white/20 italic">Empty</span>}
                    </div>
                </div>

                {/* Visit Order */}
                <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[2.5rem] flex flex-col gap-4 min-h-[120px]">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Visit Sequence</span>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center px-2">
                        <AnimatePresence>
                            {visitOrder.map((nodeId, idx) => (
                                <motion.div
                                    key={`visit-${nodeId}-${idx}`}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-10 h-10 rounded-xl border flex items-center justify-center font-mono text-sm font-bold shadow-lg"
                                    style={{ 
                                        backgroundColor: `${MANIM_COLORS.gold}22`,
                                        borderColor: MANIM_COLORS.gold,
                                        color: MANIM_COLORS.gold
                                    }}
                                >
                                    {nodeId}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {visitOrder.length === 0 && <span className="text-xs font-mono text-white/20 italic">Not started</span>}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
