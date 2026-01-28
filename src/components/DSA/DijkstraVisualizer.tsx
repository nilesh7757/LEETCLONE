"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, RefreshCw, MapPin } from "lucide-react";

const NUM_NODES = 5;
const RADIUS = 100;
const CENTER = 150;
const INF = 99; // Visual infinity

type Node = { id: number; x: number; y: number };

export default function DijkstraVisualizer({ speed = 500 }: { speed?: number }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [matrix, setMatrix] = useState<number[][]>([]); // Adjacency Matrix with weights
  const [distances, setDistances] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [activeEdge, setActiveEdge] = useState<string | null>(null); // "u-v"
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [checkingCell, setCheckingCell] = useState<{ r: number; c: number } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const stopRef = useRef(false);

  useEffect(() => {
    generateGraph();
  }, []);

  const generateGraph = () => {
    // 1. Generate Nodes
    const newNodes: Node[] = [];
    for (let i = 0; i < NUM_NODES; i++) {
      const angle = (i / NUM_NODES) * 2 * Math.PI - Math.PI / 2;
      newNodes.push({
        id: i,
        x: CENTER + RADIUS * Math.cos(angle),
        y: CENTER + RADIUS * Math.sin(angle),
      });
    }
    setNodes(newNodes);

    // 2. Generate Random Weighted Adjacency Matrix (Undirected)
    // 0 means no edge (or INF effectively), but we store weights.
    // Let's use 0 for no edge, and >0 for weight.
    const newMatrix = Array(NUM_NODES).fill(0).map(() => Array(NUM_NODES).fill(0));
    for (let i = 0; i < NUM_NODES; i++) {
      for (let j = i + 1; j < NUM_NODES; j++) {
        // 50% chance of edge
        if (Math.random() < 0.5) {
          const weight = Math.floor(Math.random() * 9) + 1;
          newMatrix[i][j] = weight;
          newMatrix[j][i] = weight;
        }
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
    setCheckingCell(null);
    setDistances(Array(NUM_NODES).fill(INF));
    setLogs([]);
    stopRef.current = false;
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const runDijkstra = async () => {
    if (isRunning) return;
    setIsRunning(true);
    stopRef.current = false;

    const startNode = 0;
    const dist = Array(NUM_NODES).fill(INF);
    const visitedSet = new Set<number>();
    
    dist[startNode] = 0;
    setDistances([...dist]);
    setLogs(["Initialized distances to \u221E", `Start Node: ${startNode} (dist: 0)`]);

    for (let i = 0; i < NUM_NODES; i++) {
      if (stopRef.current) break;

      // 1. Find unvisited node with min distance
      let u = -1;
      let minVal = Infinity;
      for (let v = 0; v < NUM_NODES; v++) {
        if (!visitedSet.has(v) && dist[v] < minVal) {
          minVal = dist[v];
          u = v;
        }
      }

      if (u === -1 || dist[u] === INF) break; // No reachable nodes left

      setActiveNode(u);
      setLogs(prev => [`Selected Min Node: ${u} (dist: ${dist[u]})`, ...prev]);
      await sleep(speed);

      // 2. Visit Neighbors
      for (let v = 0; v < NUM_NODES; v++) {
        if (stopRef.current) break;
        if (u === v) continue;

        // Highlight Matrix Cell
        setCheckingCell({ r: u, c: v });
        await sleep(speed / 2);

        if (matrix[u][v] > 0 && !visitedSet.has(v)) {
            // Edge Exists
            setActiveEdge(`${Math.min(u, v)}-${Math.max(u, v)}`);
            const weight = matrix[u][v];
            const newDist = dist[u] + weight;
            
            setLogs(prev => [`Checking neighbor ${v} (edge: ${weight})...`, ...prev]);
            await sleep(speed);

            if (newDist < dist[v]) {
                dist[v] = newDist;
                setDistances([...dist]);
                setLogs(prev => [`Relaxed! New dist for ${v} is ${newDist}`, ...prev]);
                await sleep(speed);
            }
        }
        setCheckingCell(null);
        setActiveEdge(null);
      }

      visitedSet.add(u);
      setVisited(new Set(visitedSet));
      await sleep(speed / 2);
    }

    setIsRunning(false);
    setActiveNode(null);
    setLogs(prev => ["Algorithm Complete", ...prev]);
  };

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Dijkstra Visualizer</h2>
          <p className="text-sm text-[var(--foreground)]/60">Shortest Path on Weighted Graph</p>
        </div>
        <div className="flex gap-2">
          <button onClick={generateGraph} className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg" disabled={isRunning}>
            <RefreshCw size={20} />
          </button>
          <button onClick={resetState} className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg" disabled={isRunning}>
            <RotateCcw size={20} />
          </button>
          <button
            onClick={runDijkstra}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-gradient-to)] text-white rounded-lg hover:opacity-90 font-medium disabled:opacity-50"
          >
            <Play size={18} fill="currentColor" />
            Start
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
        {/* Graph SVG View */}
        <div className="relative w-[300px] h-[300px] bg-[var(--foreground)]/5 rounded-2xl border border-[var(--card-border)] flex items-center justify-center">
           <svg width="300" height="300" className="absolute top-0 left-0 pointer-events-none">
             {matrix.map((row, i) => 
               row.map((weight, j) => {
                 if (i >= j || weight === 0) return null;
                 const u = nodes[i];
                 const v = nodes[j];
                 if (!u || !v) return null;
                 
                 const isHighlighted = activeEdge === `${i}-${j}`;
                 const midX = (u.x + v.x) / 2;
                 const midY = (u.y + v.y) / 2;
                 
                 return (
                   <React.Fragment key={`edge-${i}-${j}`}>
                       <motion.line
                         initial={{ opacity: 0 }}
                         animate={{ 
                           opacity: 1,
                           stroke: isHighlighted ? "#facc15" : "rgba(255,255,255,0.2)",
                           strokeWidth: isHighlighted ? 4 : 2
                         }}
                         x1={u.x} y1={u.y} x2={v.x} y2={v.y}
                         transition={{ duration: 0.2 }}
                       />
                       {/* Edge Weight Label */}
                       <motion.text
                            x={midX} y={midY}
                            className="text-[10px] font-bold fill-[var(--foreground)]"
                            textAnchor="middle"
                            dy={-5}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                       >
                           {weight}
                       </motion.text>
                   </React.Fragment>
                 );
               })
             )}
           </svg>
           
           {nodes.map((node) => {
             const isVisited = visited.has(node.id);
             const isActive = activeNode === node.id;
             const isStart = node.id === 0;
             
             return (
               <motion.div
                 key={node.id}
                 layout
                 className={`absolute w-10 h-10 rounded-full flex flex-col items-center justify-center border-2 transition-all z-10
                    ${isActive ? "bg-yellow-500 border-yellow-300 text-black shadow-lg scale-110" : 
                      isVisited ? "bg-green-500 border-green-400 text-white" : 
                      "bg-[var(--card-bg)] border-[var(--foreground)]/20 text-[var(--foreground)]"}`}
                 style={{ left: node.x - 20, top: node.y - 20 }}
               >
                 <span className="font-bold text-sm leading-none">{node.id}</span>
                 {isStart && <MapPin size={10} className="absolute -top-3 text-blue-400" />}
               </motion.div>
             );
           })}
        </div>

        <div className="flex flex-col gap-6">
            {/* Adjacency Matrix */}
            <div>
                <h3 className="text-xs uppercase font-bold text-[var(--foreground)]/40 mb-2">Weight Matrix</h3>
                <div className="grid gap-1 p-2 bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)]"
                     style={{ gridTemplateColumns: `auto repeat(${NUM_NODES}, minmax(0, 1fr))` }}>
                    <div className="w-8 h-8"></div>
                    {nodes.map(n => (
                        <div key={`col-${n.id}`} className="w-8 h-8 flex items-center justify-center text-xs font-bold text-[var(--foreground)]/60">{n.id}</div>
                    ))}
                    {matrix.map((row, i) => (
                        <React.Fragment key={`row-${i}`}>
                            <div className="w-8 h-8 flex items-center justify-center text-xs font-bold text-[var(--foreground)]/60">{i}</div>
                            {row.map((val, j) => {
                                const isChecking = checkingCell?.r === i && checkingCell?.c === j;
                                const isEdge = val > 0;
                                return (
                                    <motion.div
                                        key={`cell-${i}-${j}`}
                                        className={`w-8 h-8 rounded flex items-center justify-center text-xs border border-[var(--foreground)]/10
                                            ${isChecking ? "ring-2 ring-yellow-400 bg-yellow-500/20" : 
                                              isEdge ? "bg-blue-500/20 text-blue-400 font-bold" : "text-[var(--foreground)]/20"}`}
                                    >
                                        {val === 0 ? "-" : val}
                                    </motion.div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Distance Array */}
            <div>
                 <h3 className="text-xs uppercase font-bold text-[var(--foreground)]/40 mb-2">Shortest Distances</h3>
                 <div className="flex gap-2">
                     {distances.map((d, idx) => (
                         <div key={idx} className="flex flex-col items-center gap-1">
                             <span className="text-[10px] text-[var(--foreground)]/40">Node {idx}</span>
                             <motion.div 
                                key={d}
                                initial={{ scale: 1.2, color: "#facc15" }}
                                animate={{ scale: 1, color: "var(--foreground)" }}
                                className={`w-10 h-10 rounded-lg border border-[var(--card-border)] flex items-center justify-center font-mono font-bold
                                    ${d === INF ? "text-[var(--foreground)]/20" : "bg-green-500/20 text-green-400 border-green-500/50"}`}
                             >
                                 {d === INF ? "\u221E" : d}
                             </motion.div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
      </div>
      
      {/* Logs */}
      <div className="h-24 overflow-y-auto p-2 bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)] text-xs font-mono text-[var(--foreground)]/70 scrollbar-thin">
           {logs.map((log, i) => (
               <div key={i} className="mb-1">{">"} {log}</div>
           ))}
      </div>
    </div>
  );
}