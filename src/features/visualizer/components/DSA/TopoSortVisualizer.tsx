"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Play, RotateCcw, Pause, ChevronLeft, ChevronRight,
  Database, ListOrdered, Layers, Move, Plus, Trash2, GitPullRequest
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

interface TopoStep {
  inDegree: number[];
  queue: number[];
  result: number[];
  activeNode: number | null;
  activeEdge: [number, number] | null;
  message: string;
  stepType: "BOOT" | "SOURCE_FOUND" | "EXTRACTION" | "RELAX" | "BUFFER_ADD" | "COMPLETE";
  logs: string[];
}

const DEFAULT_NODES: Node[] = [
  { id: 0, x: 120, y: 120 }, // A
  { id: 1, x: 120, y: 280 }, // B
  { id: 2, x: 300, y: 80 },  // C
  { id: 3, x: 300, y: 200 }, // D
  { id: 4, x: 300, y: 320 }, // E
  { id: 5, x: 520, y: 200 }, // F
];

const DEFAULT_EDGES: Edge[] = [
  { u: 0, v: 2 },
  { u: 0, v: 3 },
  { u: 1, v: 3 },
  { u: 1, v: 4 },
  { u: 2, v: 5 },
  { u: 3, v: 5 },
  { u: 4, v: 5 },
];

export default function TopoSortVisualizer({ speed = 1000 }: { speed?: number }) {
  const [nodes, setNodes] = useState<Node[]>(DEFAULT_NODES);
  const [edges, setEdges] = useState<Edge[]>(DEFAULT_EDGES);

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

  // Convert node numeric ID to letter (A, B, C...)
  const getLabel = (id: number) => String.fromCharCode(65 + id);

  // Generate Kahn's Topo Sort Steps Dynamically
  const history: TopoStep[] = useMemo(() => {
    if (nodes.length === 0) {
      return [{
        inDegree: [],
        queue: [],
        result: [],
        activeNode: null,
        activeEdge: null,
        message: "No graph loaded. Click '+ Node' to start drawing.",
        stepType: "COMPLETE",
        logs: ["Graph is empty."]
      }];
    }

    const V = nodes.length;
    const inDegree = new Array(V).fill(0);
    const adj = Array.from({ length: V }, () => [] as number[]);

    edges.forEach(({ u, v }) => {
      if (u < V && v < V) {
        adj[u].push(v);
        inDegree[v]++;
      }
    });

    const steps: TopoStep[] = [];
    const logs: string[] = [];
    const record = (
      msg: string, 
      stepType: TopoStep["stepType"], 
      active: number | null = null, 
      edge: [number, number] | null = null, 
      q: number[] = [], 
      res: number[] = []
    ) => {
      logs.push(msg);
      steps.push({
        inDegree: [...inDegree],
        queue: [...q],
        result: [...res],
        activeNode: active,
        activeEdge: edge,
        message: msg,
        stepType,
        logs: [...logs]
      });
    };

    record("Calculating in-degrees (incoming edges count) for all nodes.", "BOOT", null, null, [], []);

    const q: number[] = [];
    for (let i = 0; i < V; i++) {
      if (inDegree[i] === 0) {
        q.push(i);
        record(`Source Node ${getLabel(i)} has 0 in-degree. Enqueueing.`, "SOURCE_FOUND", i, null, [...q], []);
      }
    }

    const res: number[] = [];
    while (q.length > 0) {
      const u = q.shift()!;
      res.push(u);
      record(`Extracting Node ${getLabel(u)} from queue. Appending to sorted output list.`, "EXTRACTION", u, null, [...q], [...res]);

      for (const v of adj[u]) {
        // Simulating the decrement before actual decrement
        const edge: [number, number] = [u, v];
        inDegree[v]--;
        record(`Reducing dependency from ${getLabel(u)} to ${getLabel(v)}. New in-degree of ${getLabel(v)} = ${inDegree[v]}.`, "RELAX", u, edge, [...q], [...res]);
        
        if (inDegree[v] === 0) {
          q.push(v);
          record(`In-degree of ${getLabel(v)} reached 0. Adding Node ${getLabel(v)} to queue.`, "BUFFER_ADD", v, null, [...q], [...res]);
        }
      }
    }

    if (res.length < V) {
      record("Topological Sort complete. Cycle detected! Topological sorting is impossible for cyclic graphs.", "COMPLETE", null, null, [], [...res]);
    } else {
      record("Topological Sort complete. Kahn's sequence fully resolved.", "COMPLETE", null, null, [], [...res]);
    }

    return steps;
  }, [nodes, edges]);

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
          const edgeExists = edges.some(edge => edge.u === u && edge.v === v);

          if (edgeExists) {
            setEdges(prev => prev.filter(edge => !(edge.u === u && edge.v === v)));
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

  // Helper to calculate directed path coordinates with marker offset
  const getEdgePath = (uId: number, vId: number) => {
    const n1 = nodes.find(n => n.id === uId);
    const n2 = nodes.find(n => n.id === vId);
    if (!n1 || !n2) return null;

    const dx = n2.x - n1.x;
    const dy = n2.y - n1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return null;

    const ux = dx / dist;
    const uy = dy / dist;

    // Node radius = 28. Offset start by 28, and end by 36 (radius + marker size)
    const x1 = n1.x + ux * 28;
    const y1 = n1.y + uy * 28;
    const x2 = n2.x - ux * 34;
    const y2 = n2.y - uy * 34;

    return `M ${x1} ${y1} L ${x2} ${y2}`;
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
              title="Click Node A then Node B to create Directed Edge"
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
              <defs>
                <marker id="topo-arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                </marker>
              </defs>

              {/* Edge Connections */}
              {edges.map(({ u, v }, idx) => {
                const n1 = nodes.find(n => n.id === u);
                const n2 = nodes.find(n => n.id === v);
                if (!n1 || !n2) return null;

                const path = getEdgePath(u, v);
                if (!path) return null;

                const isActive = currentStep.activeEdge !== null && currentStep.activeEdge[0] === u && currentStep.activeEdge[1] === v;
                const isResolved = currentStep.result.includes(u);

                // Lighter white edges for dark screen visibility
                let strokeColor = "rgba(255, 255, 255, 0.28)"; 
                let strokeWidth = 2.5;

                if (isActive) {
                  strokeColor = "var(--viz-rose)";
                  strokeWidth = 4.5;
                } else if (isResolved) {
                  strokeColor = "rgba(var(--viz-cyan-rgb), 0.35)";
                  strokeWidth = 2.5;
                }

                return (
                  <g key={`edge-${idx}`}>
                    <path
                      d={path}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      className="transition-all duration-300"
                      markerEnd="url(#topo-arrowhead)"
                    />
                    {isActive && (
                      <circle r="4.5" fill="var(--viz-rose)">
                        <animateMotion 
                          dur="1.2s" 
                          repeatCount="indefinite" 
                          path={path} 
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
                const isQ = currentStep.queue.includes(i);
                const isR = currentStep.result.includes(i);
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
                } else if (isR) {
                  nodeColor = "rgba(var(--viz-green-rgb), 0.05)";
                  borderColor = "var(--viz-green)";
                } else if (isQ) {
                  nodeColor = "rgba(var(--viz-cyan-rgb), 0.05)";
                  borderColor = "var(--viz-cyan)";
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

                    {/* Node Alphabet label */}
                    <text
                      x={pos.x}
                      y={pos.y + 6}
                      textAnchor="middle"
                      fontSize="16"
                      fontWeight="900"
                      fill={textColor}
                      className="font-mono select-none pointer-events-none"
                    >
                      {getLabel(i)}
                    </text>

                    {/* In-Degree badge text directly below the node */}
                    {currentStep.inDegree?.[i] !== undefined && (
                      <g transform={`translate(${pos.x}, ${pos.y + 44 * scale})`}>
                        <rect
                          x="-28"
                          y="-8"
                          width="56"
                          height="14"
                          rx="4"
                          fill="var(--card)"
                          stroke="var(--border)"
                          strokeWidth="1"
                        />
                        <text
                          textAnchor="middle"
                          fontSize="7.5"
                          fontWeight="bold"
                          className="font-mono fill-[var(--muted-foreground)]"
                        >
                          in-degree: {currentStep.inDegree[i]}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Queue & Sorted Output Panels merged below Canvas */}
            <div className="absolute bottom-4 flex flex-wrap justify-center gap-4 z-20 w-full px-8">
              {/* Queue */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-card/90 border border-border/80 rounded-xl shadow-sm text-[10px]">
                <Layers size={11} className="text-[var(--viz-cyan)]" />
                <span className="font-bold text-muted-foreground mr-1">Queue (In-Degree 0):</span>
                <span className="font-mono font-black text-[var(--viz-cyan)]">
                  [{currentStep.queue.map(id => getLabel(id)).join(", ")}]
                </span>
              </div>
              {/* Result */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-card/90 border border-border/80 rounded-xl shadow-sm text-[10px]">
                <ListOrdered size={11} className="text-[var(--viz-rose)]" />
                <span className="font-bold text-muted-foreground mr-1">Sorted Output:</span>
                <span className="font-mono font-black text-[var(--viz-rose)]">
                  [{currentStep.result.map(id => getLabel(id)).join(" \u2192 ")}]
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (col-span-3): Live Array State */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-[400px] md:h-[460px] lg:h-[500px]">
            <div className="p-4 bg-muted/20 border border-[var(--border)]/45 rounded-2xl flex-1 flex flex-col overflow-hidden">
              <h3 className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest flex items-center gap-1.5 mb-3 shrink-0">
                <Database size={12} className="text-[var(--viz-cyan)]" /> Live In-Degrees
              </h3>
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {nodes.length > 0 ? (
                  <table className="w-full text-[10px] font-mono text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 text-muted-foreground">
                        <th className="pb-2 pl-2">Node</th>
                        <th className="pb-2 text-center">In-Degree</th>
                        <th className="pb-2 text-center">In Queue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nodes.map((n) => {
                        const i = n.id;
                        const isCurrent = currentStep.activeNode === i;
                        const inDeg = currentStep.inDegree?.[i] !== undefined ? currentStep.inDegree[i] : 0;
                        const inQ = currentStep.queue.includes(i) ? "Yes" : "No";

                        return (
                          <tr key={i} className={`border-b border-border/20 last:border-0 transition-colors ${
                            isCurrent ? "text-[var(--viz-rose)] font-black bg-[var(--viz-rose)]/5" : ""
                          }`}>
                            <td className="py-2.5 pl-3">Node {getLabel(i)}</td>
                            <td className="py-2.5 text-center font-bold">{inDeg}</td>
                            <td className="py-2.5 text-center">{inQ}</td>
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
