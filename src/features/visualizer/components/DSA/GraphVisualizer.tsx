"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Play, RotateCcw, Pause, ChevronLeft, ChevronRight,
  Database, Layers, Move, Plus, Trash2, GitPullRequest
} from "lucide-react";

interface Node {
  id: number;
  x: number;
  y: number;
}

interface Edge {
  u: number;
  v: number;
}

interface TraversalStep {
  visited: Set<number>;
  queueOrStack: number[];
  activeNode: number | null;
  activeEdge: [number, number] | null;
  message: string;
}

const DEFAULT_NODES: Node[] = [
  { id: 0, x: 180, y: 120 },
  { id: 1, x: 320, y: 200 },
  { id: 2, x: 180, y: 280 },
  { id: 3, x: 500, y: 200 },
  { id: 4, x: 660, y: 200 },
];

const DEFAULT_EDGES: Edge[] = [
  { u: 0, v: 1 },
  { u: 1, v: 2 },
  { u: 2, v: 0 },
  { u: 1, v: 3 },
  { u: 3, v: 4 },
];

export default function GraphVisualizer({ speed = 1000 }: { speed?: number }) {
  const [nodes, setNodes] = useState<Node[]>(DEFAULT_NODES);
  const [edges, setEdges] = useState<Edge[]>(DEFAULT_EDGES);
  const [mode, setMode] = useState<"BFS" | "DFS">("BFS");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editMode, setEditMode] = useState<"select" | "addNode" | "addEdge" | "delete">("select");
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<number | null>(null);

  const containerRef = useRef<SVGSVGElement>(null);

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const clearGraph = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    resetSimulation();
  };

  const loadDefaultGraph = () => {
    setNodes(DEFAULT_NODES);
    setEdges(DEFAULT_EDGES);
    setSelectedNodeId(null);
    resetSimulation();
  };

  // Generate Traversal Steps Dynamically (BFS or DFS)
  const history: TraversalStep[] = useMemo(() => {
    if (nodes.length === 0) {
      return [{
        visited: new Set(),
        queueOrStack: [],
        activeNode: null,
        activeEdge: null,
        message: "No graph loaded. Click '+ Node' to start drawing."
      }];
    }

    const V = nodes.length;
    const adj = Array.from({ length: V }, () => [] as number[]);
    edges.forEach(({ u, v }) => {
      if (u < V && v < V) {
        adj[u].push(v);
        adj[v].push(u);
      }
    });

    const steps: TraversalStep[] = [];
    const visited = new Set<number>();

    if (mode === "BFS") {
      const q: number[] = [0];
      visited.add(0);
      steps.push({
        visited: new Set(visited),
        queueOrStack: [...q],
        activeNode: null,
        activeEdge: null,
        message: "BFS Started. Enqueued Source Node 0 and marked it as visited."
      });

      while (q.length > 0) {
        const u = q.shift()!;
        steps.push({
          visited: new Set(visited),
          queueOrStack: [...q],
          activeNode: u,
          activeEdge: null,
          message: `Dequeued Node ${u} and processed it.`
        });

        // Sort neighbors to ensure deterministic traversal order
        const neighbors = [...adj[u]].sort((a, b) => a - b);
        for (const v of neighbors) {
          if (!visited.has(v)) {
            visited.add(v);
            q.push(v);
            steps.push({
              visited: new Set(visited),
              queueOrStack: [...q],
              activeNode: u,
              activeEdge: [u, v],
              message: `Unvisited neighbor Node ${v} found. Enqueued Node ${v} and marked it as visited.`
            });
          }
        }
      }
    } else {
      // DFS Traversal using an explicit stack
      const s: number[] = [0];
      steps.push({
        visited: new Set(visited),
        queueOrStack: [...s],
        activeNode: null,
        activeEdge: null,
        message: "DFS Started. Pushed Source Node 0 onto the stack."
      });

      while (s.length > 0) {
        const u = s.pop()!;
        if (!visited.has(u)) {
          visited.add(u);
          steps.push({
            visited: new Set(visited),
            queueOrStack: [...s],
            activeNode: u,
            activeEdge: null,
            message: `Popped Node ${u} from stack. Marked Node ${u} as visited.`
          });

          // Sort neighbors in descending order so they are popped in ascending order
          const neighbors = [...adj[u]].sort((a, b) => b - a);
          for (const v of neighbors) {
            if (!visited.has(v)) {
              s.push(v);
              steps.push({
                visited: new Set(visited),
                queueOrStack: [...s],
                activeNode: u,
                activeEdge: [u, v],
                message: `Neighbor Node ${v} is unvisited. Pushed Node ${v} onto stack.`
              });
            }
          }
        }
      }
    }

    steps.push({
      visited: new Set(visited),
      queueOrStack: [],
      activeNode: null,
      activeEdge: null,
      message: `${mode} Traversal complete. All reachable nodes visited.`
    });

    return steps;
  }, [nodes, edges, mode]);

  // Autoplay
  useEffect(() => {
    if (isPlaying) {
      const timerId = setInterval(() => {
        setCurrentIndex(p => {
          if (p >= history.length - 1) {
            setIsPlaying(false);
            return p;
          }
          return p + 1;
        });
      }, speed);
      return () => clearInterval(timerId);
    }
  }, [isPlaying, history.length, speed]);

  const currentStep = history[currentIndex] || history[0];

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Canvas Interactions
  const handleCanvasPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (editMode !== "addNode" || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 400 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const constrainedX = Math.max(35, Math.min(765, x));
    const constrainedY = Math.max(35, Math.min(365, y));

    const newId = nodes.length;
    setNodes(prev => [...prev, { id: newId, x: constrainedX, y: constrainedY }]);
    resetSimulation();
  };

  const handleNodeClick = (e: React.MouseEvent, nodeId: number) => {
    e.stopPropagation();
    setIsPlaying(false);

    if (editMode === "delete") {
      const remainingNodes = nodes.filter(n => n.id !== nodeId);
      const newNodes = remainingNodes.map((n, idx) => ({ ...n, id: idx }));
      
      const oldIdToNewId = new Map<number, number>();
      remainingNodes.forEach((n, idx) => oldIdToNewId.set(n.id, idx));

      const newEdges = edges
        .filter(edge => edge.u !== nodeId && edge.v !== nodeId)
        .map(edge => ({
          u: oldIdToNewId.get(edge.u)!,
          v: oldIdToNewId.get(edge.v)!
        }));

      setNodes(newNodes);
      setEdges(newEdges);
      setSelectedNodeId(null);
      resetSimulation();
    } else if (editMode === "addEdge") {
      if (selectedNodeId === null) {
        setSelectedNodeId(nodeId);
      } else {
        if (selectedNodeId === nodeId) {
          setSelectedNodeId(null);
        } else {
          const u = selectedNodeId;
          const v = nodeId;
          const edgeExists = edges.some(edge => 
            (edge.u === u && edge.v === v) || (edge.u === v && edge.v === u)
          );

          if (edgeExists) {
            setEdges(prev => prev.filter(edge => 
              !((edge.u === u && edge.v === v) || (edge.u === v && edge.v === u))
            ));
          } else {
            setEdges(prev => [...prev, { u, v }]);
          }
          setSelectedNodeId(null);
          resetSimulation();
        }
      }
    }
  };

  const handleNodePointerDown = (e: React.PointerEvent, nodeId: number) => {
    if (editMode !== "select") return;
    e.preventDefault();
    e.stopPropagation();
    setDraggedNodeId(nodeId);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggedNodeId === null || editMode !== "select" || !containerRef.current) return;
    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 400 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const constrainedX = Math.max(35, Math.min(765, x));
    const constrainedY = Math.max(35, Math.min(365, y));

    setNodes(prev => prev.map(n => n.id === draggedNodeId ? { ...n, x: constrainedX, y: constrainedY } : n));
  };

  const handleCanvasPointerUp = () => {
    setDraggedNodeId(null);
  };

  return (
    <div className="flex flex-col gap-6 font-sans select-none text-[var(--foreground)] w-full">
      {/* Visualizer Box */}
      <div className="p-4 md:p-6 bg-[var(--card)] border border-[var(--border)] rounded-[2rem] shadow-xl flex flex-col min-h-[550px] w-full overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-[var(--card)] border border-[var(--border)]/60 rounded-2xl shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setCurrentIndex(0); setIsPlaying(false); }} 
              className="p-2.5 bg-muted/20 hover:bg-muted/40 border border-[var(--border)]/60 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer" 
              title="Reset"
            >
              <RotateCcw size={14}/>
            </button>
            <button 
              onClick={handleStepBackward} 
              disabled={currentIndex === 0 || history.length <= 1}
              className="p-2.5 bg-muted/20 hover:bg-muted/40 border border-[var(--border)]/60 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all disabled:opacity-30 disabled:hover:bg-muted/20 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button 
              onClick={handleStepForward} 
              disabled={currentIndex === history.length - 1 || history.length <= 1}
              className="p-2.5 bg-muted/20 hover:bg-muted/40 border border-[var(--border)]/60 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all disabled:opacity-30 disabled:hover:bg-muted/20 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>

            {/* Traversal Mode Select */}
            <div className="flex items-center gap-1 p-1 bg-muted/20 border border-[var(--border)]/60 rounded-xl ml-2">
              <button
                onClick={() => { setMode("BFS"); resetSimulation(); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  mode === "BFS" ? "bg-[var(--viz-cyan)] text-black" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                BFS
              </button>
              <button
                onClick={() => { setMode("DFS"); resetSimulation(); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  mode === "DFS" ? "bg-[var(--viz-cyan)] text-black" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                DFS
              </button>
            </div>
          </div>

          {/* Editor Toolset */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/20 border border-[var(--border)]/60 rounded-xl">
            <button
              onClick={() => { setEditMode("select"); setSelectedNodeId(null); }}
              className={`p-2 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer ${
                editMode === "select" ? "bg-[var(--viz-rose)] text-white" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Drag/Move Nodes"
            >
              <Move size={12} />
              <span className="hidden sm:inline">Move</span>
            </button>
            <button
              onClick={() => { setEditMode("addNode"); setSelectedNodeId(null); }}
              className={`p-2 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer ${
                editMode === "addNode" ? "bg-[var(--viz-rose)] text-white" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Click canvas to add Node"
            >
              <Plus size={12} />
              <span className="hidden sm:inline">+ Node</span>
            </button>
            <button
              onClick={() => { setEditMode("addEdge"); setSelectedNodeId(null); }}
              className={`p-2 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer ${
                editMode === "addEdge" ? "bg-[var(--viz-rose)] text-white" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Click Node A then Node B to create Edge"
            >
              <GitPullRequest size={12} />
              <span className="hidden sm:inline">Connect</span>
            </button>
            <button
              onClick={() => { setEditMode("delete"); setSelectedNodeId(null); }}
              className={`p-2 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer ${
                editMode === "delete" ? "bg-[var(--viz-rose)] text-white" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Click a node to delete it"
            >
              <Trash2 size={12} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={clearGraph}
              className="px-3 py-2 border border-dashed border-[var(--border)] rounded-xl text-[10px] text-muted-foreground hover:text-red-500 font-bold hover:border-red-500/30 transition-all cursor-pointer"
            >
              Clear Graph
            </button>
            <button 
              onClick={loadDefaultGraph}
              className="px-3 py-2 bg-muted/20 border border-[var(--border)] rounded-xl text-[10px] text-muted-foreground hover:text-foreground font-bold transition-all cursor-pointer"
            >
              Default
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              disabled={history.length <= 1}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md disabled:opacity-40 disabled:hover:scale-100 cursor-pointer ${
                isPlaying 
                  ? "bg-muted/40 border border-[var(--border)] text-[var(--foreground)] hover:bg-muted/50" 
                  : "bg-[var(--viz-rose)] text-white hover:scale-[1.03]"
              }`}
            >
              {isPlaying ? <span className="flex items-center gap-1.5"><Pause size={12} /> Pause</span> : <span className="flex items-center gap-1.5"><Play size={12} /> Run</span>}
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 w-full animate-fadeIn">
          
          {/* Left Column (col-span-9): Graph Canvas */}
          <div className="lg:col-span-9 relative p-3 md:p-6 bg-muted/10 border border-[var(--border)]/45 rounded-2xl flex flex-col items-center justify-center h-[400px] md:h-[460px] lg:h-[500px] w-full overflow-hidden">
            
            {/* SVG Canvas */}
            <svg 
              ref={containerRef}
              viewBox="0 0 800 400" 
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerLeave={handleCanvasPointerUp}
              className="w-full h-full select-none overflow-visible z-10 cursor-crosshair"
            >
              {/* Edge Connections */}
              {edges.map(({ u, v }, idx) => {
                const n1 = nodes.find(n => n.id === u);
                const n2 = nodes.find(n => n.id === v);
                if (!n1 || !n2) return null;

                const isActive = currentStep.activeEdge !== null && 
                  ((currentStep.activeEdge[0] === u && currentStep.activeEdge[1] === v) ||
                   (currentStep.activeEdge[0] === v && currentStep.activeEdge[1] === u));

                const isVisited = currentStep.visited?.has(u) && currentStep.visited?.has(v);

                // High contrast unvisited edges
                let strokeColor = "rgba(255, 255, 255, 0.28)"; 
                let strokeWidth = 2.5;

                if (isActive) {
                  strokeColor = "var(--viz-cyan)";
                  strokeWidth = 4.5;
                } else if (isVisited) {
                  strokeColor = "rgba(var(--viz-green-rgb), 0.4)";
                  strokeWidth = 2.5;
                }

                return (
                  <g key={`edge-${idx}`}>
                    <line
                      x1={n1.x}
                      y1={n1.y}
                      x2={n2.x}
                      y2={n2.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      className="transition-all duration-300"
                    />
                    {isActive && (
                      <circle r="4" fill="var(--viz-cyan)">
                        <animateMotion 
                          dur="1.2s" 
                          repeatCount="indefinite" 
                          path={`M ${n1.x} ${n1.y} L ${n2.x} ${n2.y}`} 
                        />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Node Bubbles */}
              {nodes.map((pos) => {
                const i = pos.id;
                const isCurrent = currentStep.activeNode === i;
                const isVisited = currentStep.visited?.has(i);
                const isSelected = selectedNodeId === i;

                let nodeColor = "var(--card)";
                let borderColor = "var(--border)";
                const textColor = "var(--foreground)";
                let borderWidth = "2.5";
                
                const radius = 28; // Medium-sized nodes
                let scale = 1;

                if (isSelected) {
                  nodeColor = "rgba(var(--viz-amber-rgb), 0.15)";
                  borderColor = "var(--viz-amber)";
                  borderWidth = "3.5";
                  scale = 1.1;
                } else if (isCurrent) {
                  nodeColor = "rgba(var(--viz-rose-rgb), 0.1)";
                  borderColor = "var(--viz-rose)";
                  borderWidth = "4";
                  scale = 1.15;
                } else if (isVisited) {
                  nodeColor = "rgba(var(--viz-green-rgb), 0.05)";
                  borderColor = "var(--viz-green)";
                }

                return (
                  <g 
                    key={`node-${i}`} 
                    onClick={(e) => handleNodeClick(e, i)}
                    onPointerDown={(e) => handleNodePointerDown(e, i)}
                    className="transition-transform duration-300 cursor-grab active:cursor-grabbing"
                  >
                    {/* Node Bubble */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius * scale}
                      fill={nodeColor}
                      stroke={borderColor}
                      strokeWidth={borderWidth}
                      className="transition-colors duration-250"
                    />

                    {/* Node Numeric label */}
                    <text
                      x={pos.x}
                      y={pos.y + 6}
                      textAnchor="middle"
                      fontSize="15"
                      fontWeight="900"
                      fill={textColor}
                      className="font-mono select-none pointer-events-none"
                    >
                      {i}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Active Queue/Stack merged below canvas */}
            <div className="absolute bottom-4 flex flex-wrap justify-center gap-4 z-20 w-full px-8">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-card/90 border border-border/80 rounded-xl shadow-sm text-[10px]">
                <Layers size={11} className="text-[var(--viz-cyan)]" />
                <span className="font-bold text-muted-foreground mr-1">
                  Active {mode === "BFS" ? "Queue" : "Stack"}:
                </span>
                <span className="font-mono font-black text-[var(--viz-cyan)]">
                  [{currentStep.queueOrStack.join(", ")}]
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (col-span-3): Live Array State */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-[400px] md:h-[460px] lg:h-[500px]">
            <div className="p-4 bg-muted/20 border border-[var(--border)]/45 rounded-2xl flex-1 flex flex-col overflow-hidden">
              <h3 className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest flex items-center gap-1.5 mb-3 shrink-0">
                <Database size={12} className="text-[var(--viz-cyan)]" /> Visited State
              </h3>
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {nodes.length > 0 ? (
                  <table className="w-full text-[10px] font-mono text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 text-muted-foreground">
                        <th className="pb-2 pl-2">Node</th>
                        <th className="pb-2 text-center">Visited</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nodes.map((n) => {
                        const i = n.id;
                        const isCurrent = currentStep.activeNode === i;
                        const isVisited = currentStep.visited?.has(i) ? "Yes" : "No";

                        return (
                          <tr key={i} className={`border-b border-border/20 last:border-0 transition-colors ${
                            isCurrent ? "text-[var(--viz-rose)] font-black bg-[var(--viz-rose)]/5" : ""
                          }`}>
                            <td className="py-2.5 pl-3">Node {i}</td>
                            <td className="py-2.5 text-center font-bold">{isVisited}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
                    <Database size={24} className="mb-2 text-muted-foreground" />
                    <p className="text-[10px] uppercase font-bold tracking-wider">No nodes to show</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom scrubbing bar & Step Explanation */}
        <div className="mt-6 p-4 bg-muted/15 border border-[var(--border)]/45 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-4 bg-[var(--card)] border border-[var(--border)]/70 px-4 py-3 rounded-xl shadow-sm w-full">
            <span className="font-mono text-[9px] font-black uppercase text-[var(--muted-foreground)] tracking-widest min-w-[55px]">Step {currentIndex + 1}/{history.length}</span>
            <div className="flex-1 h-1 bg-[var(--border)] rounded-full relative flex items-center group/slider">
              <div 
                className="absolute h-1 bg-[var(--viz-rose)] rounded-full shadow-[0_0_10px_rgba(244,63,94,0.45)]" 
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
          <div className="text-center text-[10px] font-mono text-[var(--viz-amber)] bg-card border border-border/70 py-2.5 px-3 rounded-lg leading-relaxed shadow-sm">
            {currentStep.message}
          </div>
        </div>

      </div>
    </div>
  );
}
