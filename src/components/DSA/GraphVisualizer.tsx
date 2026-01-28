"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, RefreshCw, ArrowRight } from "lucide-react";

const NUM_NODES = 5;
const RADIUS = 100; // Radius of the node circle
const CENTER = 150; // Center of the SVG canvas

type Node = { id: number; x: number; y: number };
type Edge = { u: number; v: number };

export default function GraphVisualizer({ speed = 500 }: { speed?: number }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [activeEdge, setActiveEdge] = useState<string | null>(null); // "u-v"
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [checkingCell, setCheckingCell] = useState<{ r: number; c: number } | null>(null);
  const [queue, setQueue] = useState<number[]>([]);
  const stopRef = useRef(false);

  useEffect(() => {
    generateGraph();
  }, []);

  const generateGraph = () => {
    // 1. Generate Nodes in a Circle
    const newNodes: Node[] = [];
    for (let i = 0; i < NUM_NODES; i++) {
      const angle = (i / NUM_NODES) * 2 * Math.PI - Math.PI / 2; // Start from top
      newNodes.push({
        id: i,
        x: CENTER + RADIUS * Math.cos(angle),
        y: CENTER + RADIUS * Math.sin(angle),
      });
    }
    setNodes(newNodes);

    // 2. Generate Random Adjacency Matrix (Undirected)
    const newMatrix = Array(NUM_NODES).fill(0).map(() => Array(NUM_NODES).fill(0));
    for (let i = 0; i < NUM_NODES; i++) {
      for (let j = i + 1; j < NUM_NODES; j++) {
        // 40% chance of edge
        const hasEdge = Math.random() < 0.4 ? 1 : 0;
        newMatrix[i][j] = hasEdge;
        newMatrix[j][i] = hasEdge;
      }
    }
    // Ensure graph is somewhat connected (optional: add random edges if isolated)
    setMatrix(newMatrix);
    resetState();
  };

  const resetState = () => {
    setIsRunning(false);
    setActiveNode(null);
    setActiveEdge(null);
    setVisited(new Set());
    setCheckingCell(null);
    setQueue([]);
    stopRef.current = false;
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const runBFS = async () => {
    if (isRunning) return;
    resetState();
    setIsRunning(true);
    stopRef.current = false;

    const startNode = 0;
    const q = [startNode];
    const newVisited = new Set<number>();
    
    newVisited.add(startNode);
    setVisited(new Set(newVisited));
    setQueue([...q]);

    while (q.length > 0) {
      if (stopRef.current) break;

      const u = q.shift()!;
      setQueue([...q]);
      setActiveNode(u);
      
      await sleep(speed);

      // Check all neighbors via Matrix
      for (let v = 0; v < NUM_NODES; v++) {
        if (stopRef.current) break;
        if (u === v) continue;

        // Highlight Matrix Cell
        setCheckingCell({ r: u, c: v });
        await sleep(speed / 2);

        if (matrix[u][v] === 1) {
          // Edge exists
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
    
    setIsRunning(false);
    setActiveNode(null);
  };

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Graph & Matrix Visualizer</h2>
          <p className="text-sm text-[var(--foreground)]/60">BFS Traversal Visualization</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generateGraph}
            className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg transition-colors"
            title="New Random Graph"
            disabled={isRunning}
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={resetState}
            className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg transition-colors"
            title="Reset"
            disabled={isRunning}
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={runBFS}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-gradient-to)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
          >
            <Play size={18} fill="currentColor" />
            Start BFS
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
        {/* Graph SVG View */}
        <div className="relative w-[300px] h-[300px] bg-[var(--foreground)]/5 rounded-2xl border border-[var(--card-border)] flex items-center justify-center">
           <svg width="300" height="300" className="absolute top-0 left-0 pointer-events-none">
             {/* Draw Edges */}
             {matrix.map((row, i) => 
               row.map((val, j) => {
                 if (i >= j || val === 0) return null; // Only draw once per pair
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
                       stroke: isHighlighted ? "#facc15" : "rgba(255,255,255,0.2)",
                       strokeWidth: isHighlighted ? 4 : 2
                     }}
                     x1={u.x} y1={u.y} x2={v.x} y2={v.y}
                     transition={{ duration: 0.3 }}
                   />
                 );
               })
             )}
           </svg>
           
           {/* Draw Nodes */}
           {nodes.map((node) => {
             const isVisited = visited.has(node.id);
             const isActive = activeNode === node.id;
             
             return (
               <motion.div
                 key={node.id}
                 layout
                 className={`absolute w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors z-10
                    ${isActive ? "bg-yellow-500 border-yellow-300 text-black shadow-lg scale-110" : 
                      isVisited ? "bg-blue-500 border-blue-400 text-white" : 
                      "bg-[var(--card-bg)] border-[var(--foreground)]/20 text-[var(--foreground)]"}`}
                 style={{ 
                   left: node.x - 20, 
                   top: node.y - 20 
                 }}
               >
                 {node.id}
               </motion.div>
             );
           })}
        </div>

        {/* Adjacency Matrix View */}
        <div className="flex flex-col items-center">
            <h3 className="text-xs uppercase font-bold text-[var(--foreground)]/40 mb-2">Adjacency Matrix</h3>
            <div className="grid gap-1 p-2 bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)]"
                 style={{ gridTemplateColumns: `auto repeat(${NUM_NODES}, minmax(0, 1fr))` }}>
                
                {/* Header Row */}
                <div className="w-8 h-8"></div>
                {nodes.map(n => (
                    <div key={`col-${n.id}`} className="w-8 h-8 flex items-center justify-center text-xs font-bold text-[var(--foreground)]/60">{n.id}</div>
                ))}

                {/* Matrix Rows */}
                {matrix.map((row, i) => (
                    <React.Fragment key={`row-${i}`}>
                        <div className="w-8 h-8 flex items-center justify-center text-xs font-bold text-[var(--foreground)]/60">{i}</div>
                        {row.map((val, j) => {
                            const isChecking = checkingCell?.r === i && checkingCell?.c === j;
                            const isOne = val === 1;
                            
                            return (
                                <motion.div
                                    key={`cell-${i}-${j}`}
                                    className={`w-8 h-8 rounded flex items-center justify-center text-xs border border-[var(--foreground)]/10
                                        ${isChecking ? "ring-2 ring-yellow-400 bg-yellow-500/20" : 
                                          isOne ? "bg-blue-500/20 text-blue-400 font-bold" : "text-[var(--foreground)]/20"}`}
                                >
                                    {val}
                                </motion.div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
      </div>
      
      {/* Queue Visualization */}
      <div className="p-4 bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)]">
        <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xs uppercase font-bold text-[var(--foreground)]/40">Queue</h3>
            <span className="text-[10px] text-[var(--foreground)]/40">(First In, First Out)</span>
        </div>
        <div className="flex gap-2 h-10 items-center overflow-x-auto">
            <AnimatePresence>
                {queue.map((nodeId, idx) => (
                    <motion.div
                        key={`${nodeId}-${idx}`}
                        initial={{ opacity: 0, scale: 0.5, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.5, x: 20 }}
                        className="min-w-[32px] h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-mono text-sm"
                    >
                        {nodeId}
                    </motion.div>
                ))}
            </AnimatePresence>
            {queue.length === 0 && <span className="text-xs text-[var(--foreground)]/20 italic">Empty</span>}
        </div>
      </div>
    </div>
  );
}