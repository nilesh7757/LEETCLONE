"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, 
  ChevronLeft, ChevronRight, Activity, MapPin, 
  Plus, RefreshCw, Layers
} from "lucide-react";

type Node = { id: number; x: number; y: number };

interface BFSDFSStep {
  visited: Set<number>;
  activeNode: number | null;
  queueStack: number[];
  activeEdge: [number, number] | null;
  message: string;
  step: string;
  logs: string[];
}

export default function GraphVisualizer({ speed = 800 }: { speed?: number }) {  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Virtual Coordinate Space: 800x500
  const V_WIDTH = 800;
  const V_HEIGHT = 500;

  const [nodes, setNodes] = useState<Node[]>([]);
  const [matrix, setMatrix] = useState<number[][]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<"BFS" | "DFS">("BFS");
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dragging state
  const [draggingNode, setDraggingNode] = useState<number | null>(null);
  const startDragPos = useRef({ pointerX: 0, pointerY: 0, nodeX: 0, nodeY: 0 });

  // Initialize nodes to default state
  const initializeDefaultGraph = React.useCallback(() => {
    const numNodes = 6;
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
      for (let j = i + 1; j < numNodes; j++) {
        if (Math.random() < 0.3) {
          initialMatrix[i][j] = 1;
          initialMatrix[j][i] = 1;
        }
      }
    }
    for (let i = 0; i < numNodes - 1; i++) {
      initialMatrix[i][i+1] = 1;
      initialMatrix[i+1][i] = 1;
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

  const resetSimulation = React.useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
  }, []);

  const generateRandomGraph = React.useCallback(() => {
    resetSimulation();
    const numNodes = 6;
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
      for (let j = i + 1; j < numNodes; j++) {
        if (Math.random() < 0.3) {
          newMatrix[i][j] = 1;
          newMatrix[j][i] = 1;
        }
      }
    }
    for (let i = 0; i < numNodes - 1; i++) {
        newMatrix[i][i+1] = 1;
        newMatrix[i+1][i] = 1;
    }
    setMatrix(newMatrix);
  }, [resetSimulation]);

  const addNode = React.useCallback(() => {
    if (nodes.length >= 10) return;
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
      setMatrix(prev => {
          const newMat = prev.map(row => [...row]);
          const currentW = newMat[selectedNode][id];
          newMat[selectedNode][id] = currentW === 1 ? 0 : 1;
          newMat[id][selectedNode] = currentW === 1 ? 0 : 1;
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
    
    const maxId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0;
    const steps: BFSDFSStep[] = [];
    const visited = new Set<number>();
    let currentLogs: string[] = [];
    
    const record = (msg: string, step: string, activeNode: number | null, qs: number[], activeEdge: [number, number] | null = null) => {
      steps.push({
        visited: new Set(visited),
        activeNode,
        queueStack: [...qs],
        activeEdge,
        message: msg,
        logs: [...currentLogs],
        step
      });
    };

    const addLog = (l: string) => { currentLogs = [l, ...currentLogs]; };

    const startNode = nodes[0]?.id ?? 0;
    
    if (mode === "BFS") {
        const queue: number[] = [startNode];
        visited.add(startNode);
        addLog(`BFS: Added source node ${startNode} to queue.`);
        record(`Initializing BFS traversal starting from Node ${startNode}.`, "INIT", startNode, queue);

        while (queue.length > 0) {
            const u = queue.shift()!;
            record(`Removing Node ${u} from queue and exploring neighbors.`, "EXPAND", u, queue);

            for (let v = 0; v < maxId; v++) {
                if (matrix[u]?.[v] === 1 && !visited.has(v)) {
                    record(`Checking neighbor Node ${v} of Node ${u}.`, "PROBE", u, queue, [u, v]);
                    visited.add(v);
                    queue.push(v);
                    addLog(`Added Node ${v} to queue.`);
                    record(`Marking Node ${v} as visited and adding to queue.`, "VISIT", v, queue, [u, v]);
                }
            }
        }
    } else {
        const stack: number[] = [startNode];
        addLog(`DFS: Pushed source node ${startNode} onto stack.`);
        record(`Initializing DFS traversal starting from Node ${startNode}.`, "INIT", startNode, stack);

        while (stack.length > 0) {
            const u = stack.pop()!;
            
            if (!visited.has(u)) {
                visited.add(u);
                record(`Popping Node ${u} from stack and visiting it.`, "VISIT", u, stack);
                addLog(`Visited Node ${u}.`);

                for (let v = maxId - 1; v >= 0; v--) {
                    if (matrix[u]?.[v] === 1 && !visited.has(v)) {
                        stack.push(v);
                        record(`Pushing neighbor Node ${v} onto stack.`, "PUSH", u, stack, [u, v]);
                    }
                }
            }
        }
    }

    record("Traversal complete.", "DONE", null, []);
    return steps;
  }, [nodes, matrix, mode]);

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
    visited: new Set(),
    activeNode: null,
    queueStack: [],
    activeEdge: null,
    message: "Initializing...",
    step: "IDLE",
    logs: []
  };

  return (
    <div className="flex flex-col gap-4 select-none font-sans w-full">
      {/* Header + Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-[var(--viz-lavender)]">Graph Traversal</h2>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)]/40">BFS &amp; DFS Traversal</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-[var(--muted)] p-1 rounded-lg">
            <button onClick={() => { setMode("BFS"); resetSimulation(); }} className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${mode === "BFS" ? "bg-[var(--viz-lavender)] text-black" : "text-[var(--muted-foreground)]/40 hover:text-[var(--foreground)]"}`}>BFS (Queue)</button>
            <button onClick={() => { setMode("DFS"); resetSimulation(); }} className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${mode === "DFS" ? "bg-[var(--viz-lavender)] text-black" : "text-[var(--muted-foreground)]/40 hover:text-[var(--foreground)]"}`}>DFS (Stack)</button>
          </div>
          <button onClick={addNode} className="flex items-center gap-1 px-3 py-1.5 bg-[var(--muted)] hover:bg-[var(--accent)] rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--muted-foreground)]"><Plus size={14}/> Add Node</button>
          <button onClick={generateRandomGraph} className="p-2 bg-[var(--muted)] hover:bg-[var(--foreground)]/5 rounded-xl border border-[var(--border)] transition-all text-[var(--muted-foreground)]/60 hover:text-[var(--foreground)]" title="Randomize Graph"><RefreshCw size={16}/></button>
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
        <span className="text-[var(--muted-foreground)]/50">Current Algorithm: <strong className="text-[var(--viz-lavender)]">{mode === 'BFS' ? 'Breadth-First Search' : 'Depth-First Search'}</strong></span>
        <span className="text-[var(--muted-foreground)]/50">Active Phase: <strong className="text-[var(--viz-cyan)]">{currentStep.step}</strong></span>
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
          {/* Edges */}
          {matrix.map((row, i) => 
            row.map((val, j) => {
              if (val === 0 || i > j) return null;
              const u = nodes.find(n => n.id === i);
              const v = nodes.find(n => n.id === j);
              if (!u || !v) return null;
              
              const isActive = (currentStep.activeEdge?.[0] === i && currentStep.activeEdge?.[1] === j) ||
                             (currentStep.activeEdge?.[0] === j && currentStep.activeEdge?.[1] === i);
              const isVisited = currentStep.visited.has(i) && currentStep.visited.has(j);

              return (
                <motion.line
                  key={`edge-${i}-${j}`}
                  x1={u.x} y1={u.y} x2={v.x} y2={v.y}
                  stroke="currentColor"
                  className={`${isActive ? "text-[var(--viz-cyan)]" : isVisited ? "text-[var(--viz-green)]/40" : "text-[var(--muted-foreground)]/35"}`}
                  strokeWidth={isActive ? 4 : 2}
                  animate={{ opacity: 1 }}
                />
              );
            })
          )}

          {/* Nodes */}
          {nodes.map(node => {
            const isVisited = currentStep.visited.has(node.id);
            const isA = currentStep.activeNode === node.id;
            const isSource = node.id === (nodes[0]?.id ?? 0);
            const isSelected = selectedNode === node.id;

            let nodeColor = "var(--card)";
            let borderColor = "var(--border)";
            let textColor = "var(--foreground)";

            if (isSelected) {
              nodeColor = "var(--viz-amber)";
              borderColor = "var(--viz-amber)";
              textColor = "#000";
            } else if (isA) {
              nodeColor = "var(--viz-cyan)";
              borderColor = "var(--viz-cyan)";
              textColor = "#000";
            } else if (isVisited) {
              nodeColor = "rgba(var(--viz-green-rgb), 0.1)";
              borderColor = "var(--viz-green)";
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
                  dy="4"
                  textAnchor="middle"
                  fill={textColor}
                  className="font-mono font-black text-sm select-none pointer-events-none"
                >
                  {node.id}
                </text>

                {/* Source Node Marker Pin */}
                {isSource && (
                  <path
                    d={`M ${node.x - 6} ${node.y - 34} c -5 0 -9 4 -9 9 c 0 7 9 17 9 17 s 9 -10 9 -17 c 0 -5 -4 -9 -9 -9 z`}
                    fill="var(--viz-rose)"
                    className="pointer-events-none"
                  />
                )}

                {/* Outer Glow / Drag Area (Drawn on top of solid shapes) */}
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="26"
                  fill="rgba(0,0,0,0)"
                  pointerEvents="all"
                  animate={{ scale: isA || isSelected ? 1.15 : 1 }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Step Message (below canvas) ── */}
      <div className="w-full px-4 py-2.5 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center">
        <p className="text-xs text-[var(--viz-cyan)] font-mono font-medium">{currentStep.message}</p>
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

      {/* ── Queue / Stack State (below canvas) ── */}
      <div className="w-full bg-[var(--muted)]/25 border border-[var(--border)] rounded-2xl px-4 py-3 flex flex-col gap-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/50 flex items-center gap-1.5">
          <Layers size={10} /> {mode === "BFS" ? "Queue State (FIFO)" : "Stack State (LIFO)"}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {currentStep.queueStack.map((val, idx) => (
            <motion.div 
              key={`${val}-${idx}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-8 h-8 rounded bg-[var(--viz-cyan)] text-black flex items-center justify-center font-mono text-[10px] font-black shadow-sm"
            >
              {val}
            </motion.div>
          ))}
          {currentStep.queueStack.length === 0 && (
            <span className="text-[9px] italic text-[var(--muted-foreground)]/30 py-2">Empty</span>
          )}
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
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-cyan)]" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Active Node</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)] animate-pulse" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Visited Node</span></div>
        <div className="flex items-center gap-2"><MapPin size={12} className="text-[var(--viz-rose)]" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Source Node</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full border-2 border-[var(--border)]" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Unvisited Node</span></div>
      </div>
    </div>
  );
}
