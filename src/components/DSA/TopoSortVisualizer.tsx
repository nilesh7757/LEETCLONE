"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, ArrowRight } from "lucide-react";

export default function TopoSortVisualizer({ speed = 800 }: { speed?: number }) {
  const [nodes, setNodes] = useState<{id: number, label: string}[]>([]);
  const [edges, setEdges] = useState<[number, number][]>([]);
  const [inDegree, setInDegree] = useState<number[]>([]);
  const [queue, setQueue] = useState<number[]>([]);
  const [result, setResult] = useState<number[]>([]);
  const [status, setStatus] = useState("Ready");
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [activeEdge, setActiveEdge] = useState<[number, number] | null>(null);
  const stopRef = useRef(false);

  useEffect(() => {
    resetGraph();
  }, []);

  const resetGraph = () => {
    // Create a simple DAG
    // 0->2, 0->3, 1->3, 1->4, 2->5, 3->5, 4->5
    const newNodes = [
        { id: 0, label: "A" }, { id: 1, label: "B" }, { id: 2, label: "C" },
        { id: 3, label: "D" }, { id: 4, label: "E" }, { id: 5, label: "F" }
    ];
    const newEdges: [number, number][] = [
        [0, 2], [0, 3], [1, 3], [1, 4], [2, 5], [3, 5], [4, 5]
    ];
    
    // Layout positions
    // Layer 0: A, B
    // Layer 1: C, D, E
    // Layer 2: F
    // We can hardcode positions for this demo or calculate layers.
    
    setNodes(newNodes);
    setEdges(newEdges);
    setInDegree(new Array(6).fill(0)); // Will calculate in run
    setQueue([]);
    setResult([]);
    setActiveNode(null);
    setActiveEdge(null);
    setStatus("Ready");
    setIsAnimating(false);
    stopRef.current = false;
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const runKahn = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    stopRef.current = false;
    setResult([]);
    
    const n = nodes.length;
    const inD = new Array(n).fill(0);
    const adj: number[][] = Array.from({length: n}, () => []);

    // 1. Calculate In-Degrees
    setStatus("Calculating In-Degrees...");
    for (const [u, v] of edges) {
        adj[u].push(v);
        inD[v]++;
    }
    setInDegree([...inD]);
    await sleep(speed);

    // 2. Initialize Queue
    setStatus("Pushing nodes with In-Degree 0 to Queue");
    const q: number[] = [];
    for (let i = 0; i < n; i++) {
        if (inD[i] === 0) {
            q.push(i);
        }
    }
    setQueue([...q]);
    await sleep(speed);

    // 3. Process Queue
    while (q.length > 0) {
        if (stopRef.current) break;

        const u = q.shift()!;
        setQueue([...q]);
        setActiveNode(u);
        setStatus(`Processing Node ${nodes[u].label}`);
        setResult(prev => [...prev, u]);
        await sleep(speed);

        for (const v of adj[u]) {
            if (stopRef.current) break;
            
            setActiveEdge([u, v]);
            setStatus(`Reducing In-Degree of neighbor ${nodes[v].label}`);
            await sleep(speed / 2);
            
            inD[v]--;
            setInDegree([...inD]);
            
            if (inD[v] === 0) {
                setStatus(`${nodes[v].label} In-Degree is 0 -> Add to Queue`);
                q.push(v);
                setQueue([...q]);
                await sleep(speed);
            }
            setActiveEdge(null);
        }
    }

    if (!stopRef.current) {
        if (result.length < n) setStatus("Cycle Detected! (Not a DAG)");
        else setStatus("Topological Sort Complete");
    }
    
    setActiveNode(null);
    setIsAnimating(false);
  };

  // Fixed Positions for 6 nodes DAG
  const positions = [
      { x: 200, y: 50 },  // A
      { x: 600, y: 50 },  // B
      { x: 200, y: 200 }, // C
      { x: 400, y: 200 }, // D
      { x: 600, y: 200 }, // E
      { x: 400, y: 350 }, // F
  ];

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Topological Sort</h2>
          <p className="text-sm text-[var(--foreground)]/60">Kahn's Algorithm (BFS)</p>
        </div>
        
        <div className="flex gap-2">
            <button onClick={resetGraph} disabled={isAnimating} className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg">
                <RotateCcw size={20} />
            </button>
            {!isAnimating ? (
                <button
                onClick={runKahn}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-gradient-to)] text-white rounded-lg hover:opacity-90 font-medium"
                >
                <Play size={18} fill="currentColor" />
                Start
                </button>
            ) : (
                <button
                onClick={() => { stopRef.current = true; setIsAnimating(false); setStatus("Stopped"); }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/50 rounded-lg"
                >
                <Pause size={18} fill="currentColor" />
                Stop
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Graph View */}
          <div className="lg:col-span-2 relative h-[400px] bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)] overflow-hidden">
              <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-mono border border-white/10 text-white">
                  {status}
              </div>

              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <marker id="arrowhead-topo" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="var(--foreground)" opacity="0.5" />
                    </marker>
                  </defs>
                  {edges.map(([u, v], i) => {
                      const start = positions[u];
                      const end = positions[v];
                      const isActive = activeEdge && activeEdge[0] === u && activeEdge[1] === v;
                      return (
                          <motion.line
                            key={`edge-${i}`}
                            x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                            stroke={isActive ? "#facc15" : "var(--foreground)"}
                            strokeWidth={isActive ? 3 : 2}
                            strokeOpacity={isActive ? 1 : 0.2}
                            markerEnd="url(#arrowhead-topo)"
                            animate={{ stroke: isActive ? "#facc15" : "var(--foreground)" }}
                          />
                      );
                  })}
              </svg>

              {nodes.map((n, i) => (
                  <motion.div
                    key={n.id}
                    className={`absolute w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center font-bold shadow-lg z-10 transition-colors duration-300
                        ${activeNode === n.id ? "bg-green-500 border-green-400 text-white" : "bg-[var(--card-bg)] border-[var(--card-border)]"}
                    `}
                    style={{ left: positions[i].x - 24, top: positions[i].y - 24 }}
                  >
                      <span>{n.label}</span>
                      <span className="text-[9px] font-mono opacity-70">in:{inDegree[i]}</span>
                  </motion.div>
              ))}
          </div>

          {/* Side Panel: Queue & Result */}
          <div className="flex flex-col gap-4">
              <div className="p-4 bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)]">
                  <h4 className="text-xs font-bold text-[var(--foreground)]/50 uppercase mb-2">Queue</h4>
                  <div className="flex gap-2 min-h-[40px] items-center overflow-x-auto">
                      <AnimatePresence>
                          {queue.map((nodeId) => (
                              <motion.div
                                key={nodeId}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 border border-blue-500/50 flex items-center justify-center text-xs font-bold"
                              >
                                  {nodes[nodeId].label}
                              </motion.div>
                          ))}
                      </AnimatePresence>
                      {queue.length === 0 && <span className="text-[10px] opacity-30 italic">Empty</span>}
                  </div>
              </div>

              <div className="p-4 bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)] flex-1">
                  <h4 className="text-xs font-bold text-[var(--foreground)]/50 uppercase mb-2">Result (Topo Sort)</h4>
                  <div className="flex flex-wrap gap-2">
                      {result.map((nodeId, idx) => (
                          <motion.div
                            key={`res-${nodeId}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2"
                          >
                              <div className="w-8 h-8 rounded bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                                  {nodes[nodeId].label}
                              </div>
                              {idx < result.length - 1 && <ArrowRight size={14} className="opacity-30"/>}
                          </motion.div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}