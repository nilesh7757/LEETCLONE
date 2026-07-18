"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Play, RotateCcw, Pause, ChevronLeft, ChevronRight,
  Database, Move, Plus, Trash2, GitPullRequest
} from "lucide-react";

interface Node {
  id: number;
  x: number;
  y: number;
}

interface Edge {
  u: number; // Parent node
  v: number; // Child node
}

interface LCAStep {
  currentNode: number | null;
  path1: number[];
  path2: number[];
  lca: number | null;
  message: string;
  stepType: "INIT" | "TRACE1" | "TRACE2" | "COMPARE" | "COMPLETE";
}

const DEFAULT_NODES: Node[] = [
  { id: 0, x: 400, y: 80 },  // Root
  { id: 1, x: 260, y: 160 }, // Left child
  { id: 2, x: 540, y: 160 }, // Right child
  { id: 3, x: 180, y: 260 },
  { id: 4, x: 340, y: 260 },
  { id: 5, x: 460, y: 260 },
  { id: 6, x: 620, y: 260 },
];

const DEFAULT_EDGES: Edge[] = [
  { u: 0, v: 1 },
  { u: 0, v: 2 },
  { u: 1, v: 3 },
  { u: 1, v: 4 },
  { u: 2, v: 5 },
  { u: 2, v: 6 },
];

export default function LCAVisualizer({ speed = 1000 }: { speed?: number }) {
  const [nodes, setNodes] = useState<Node[]>(DEFAULT_NODES);
  const [edges, setEdges] = useState<Edge[]>(DEFAULT_EDGES);
  
  const [target1, setTarget1] = useState(4);
  const [target2, setTarget2] = useState(6);

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
    setTarget1(4);
    setTarget2(6);
    setSelectedNodeId(null);
    resetSimulation();
  };

  // Build parent mapping to trace paths up to the root
  const parentOf = useMemo(() => {
    const parentMap = new Map<number, number>();
    nodes.forEach(n => parentMap.set(n.id, -1));
    edges.forEach(({ u, v }) => {
      parentMap.set(v, u);
    });
    return parentMap;
  }, [nodes, edges]);

  // Generate LCA trace steps dynamically
  const history: LCAStep[] = useMemo(() => {
    if (nodes.length === 0) {
      return [{
        currentNode: null,
        path1: [],
        path2: [],
        lca: null,
        message: "No tree loaded. Click '+ Node' to start drawing.",
        stepType: "COMPLETE"
      }];
    }

    const steps: LCAStep[] = [];
    
    // Safety check in case targets were deleted
    const t1 = nodes.some(n => n.id === target1) ? target1 : (nodes[0]?.id ?? 0);
    const t2 = nodes.some(n => n.id === target2) ? target2 : (nodes[0]?.id ?? 0);

    const getPath = (target: number) => {
      const path = [];
      let curr = target;
      while (curr !== -1 && parentOf.has(curr)) {
        path.push(curr);
        curr = parentOf.get(curr)!;
      }
      return path.reverse();
    };

    const path1 = getPath(t1);
    const path2 = getPath(t2);

    steps.push({
      currentNode: null,
      path1: [],
      path2: [],
      lca: null,
      message: `Find LCA of Node ${t1} and Node ${t2}. Initialized tracing paths.`,
      stepType: "INIT"
    });

    // Step 1: Trace Path to Target 1
    path1.forEach((node, idx) => {
      steps.push({
        currentNode: node,
        path1: path1.slice(0, idx + 1),
        path2: [],
        lca: null,
        message: `Tracing path to Node ${t1}: Visiting Node ${node}.`,
        stepType: "TRACE1"
      });
    });

    // Step 2: Trace Path to Target 2
    path2.forEach((node, idx) => {
      steps.push({
        currentNode: node,
        path1,
        path2: path2.slice(0, idx + 1),
        lca: null,
        message: `Tracing path to Node ${t2}: Visiting Node ${node}.`,
        stepType: "TRACE2"
      });
    });

    // Step 3: Compare paths from root to find lowest common ancestor
    let lcaVal = null;
    const minLen = Math.min(path1.length, path2.length);
    for (let i = 0; i < minLen; i++) {
      if (path1[i] === path2[i]) {
        lcaVal = path1[i];
        steps.push({
          currentNode: lcaVal,
          path1,
          path2,
          lca: lcaVal,
          message: `Comparing paths: Common ancestor Node ${lcaVal} found at index ${i}.`,
          stepType: "COMPARE"
        });
      } else {
        break;
      }
    }

    steps.push({
      currentNode: lcaVal,
      path1,
      path2,
      lca: lcaVal,
      message: `LCA complete. Lowest Common Ancestor is Node ${lcaVal}.`,
      stepType: "COMPLETE"
    });

    return steps;
  }, [nodes, target1, target2, parentOf]);

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
      
      // Fallback targets
      setTarget1(0);
      setTarget2(0);
      setSelectedNodeId(null);
      resetSimulation();
    } else if (editMode === "addEdge") {
      if (selectedNodeId === null) {
        setSelectedNodeId(nodeId);
      } else {
        if (selectedNodeId === nodeId) {
          setSelectedNodeId(null);
        } else {
          // Connect directed edge: selectedNodeId (parent) -> nodeId (child)
          const u = selectedNodeId;
          const v = nodeId;

          // Check if adding this edge would create a cycle (v is an ancestor of u)
          let curr = u;
          let formsCycle = false;
          while (curr !== -1 && parentOf.has(curr)) {
            if (curr === v) {
              formsCycle = true;
              break;
            }
            curr = parentOf.get(curr)!;
          }

          if (formsCycle) {
            setSelectedNodeId(null);
            return; // Cycle detected
          }

          // A tree node can have at most one parent. Delete v's existing parent edge first!
          const cleanedEdges = edges.filter(edge => edge.v !== v);
          
          const edgeExists = edges.some(edge => edge.u === u && edge.v === v);
          if (edgeExists) {
            setEdges(prev => prev.filter(edge => !(edge.u === u && edge.v === v)));
          } else {
            setEdges([...cleanedEdges, { u, v }]);
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

    // Node radius = 28. Offset end node by 34 to fit arrowhead
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
            
            {/* Target Select Dropdowns */}
            {nodes.length > 0 && (
              <div className="flex items-center gap-1.5 p-1 bg-muted/20 border border-[var(--border)]/60 rounded-xl text-[10px] font-bold ml-2">
                <span>T1:</span>
                <select 
                  value={target1} 
                  onChange={(e) => { setTarget1(parseInt(e.target.value)); resetSimulation(); }}
                  className="bg-[var(--card)] border border-[var(--border)] px-1.5 py-1 rounded cursor-pointer text-foreground"
                >
                  {nodes.map(n => <option key={n.id} value={n.id}>Node {n.id}</option>)}
                </select>
                <span>T2:</span>
                <select 
                  value={target2} 
                  onChange={(e) => { setTarget2(parseInt(e.target.value)); resetSimulation(); }}
                  className="bg-[var(--card)] border border-[var(--border)] px-1.5 py-1 rounded cursor-pointer text-foreground"
                >
                  {nodes.map(n => <option key={n.id} value={n.id}>Node {n.id}</option>)}
                </select>
              </div>
            )}
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
              title="Click Parent Node then Child Node to connect"
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
                <marker id="lca-arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                </marker>
              </defs>

              {/* Edge Connections */}
              {edges.map(({ u, v }, idx) => {
                const path = getEdgePath(u, v);
                if (!path) return null;

                const inP1 = currentStep.path1?.includes(u) && currentStep.path1?.includes(v);
                const inP2 = currentStep.path2?.includes(u) && currentStep.path2?.includes(v);
                const isLCA = currentStep.lca === v;

                let strokeColor = "rgba(255, 255, 255, 0.28)"; 
                let strokeWidth = 2.5;

                if (isLCA) {
                  strokeColor = "var(--viz-rose)";
                  strokeWidth = 4.5;
                } else if (inP1 && inP2) {
                  strokeColor = "var(--viz-cyan)";
                  strokeWidth = 3.5;
                } else if (inP1) {
                  strokeColor = "var(--viz-amber)";
                  strokeWidth = 3;
                } else if (inP2) {
                  strokeColor = "var(--viz-cyan)";
                  strokeWidth = 3;
                }

                return (
                  <g key={`edge-${idx}`}>
                    <path
                      d={path}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      className="transition-all duration-300"
                      markerEnd="url(#lca-arrowhead)"
                    />
                  </g>
                );
              })}

              {/* Node Bubbles */}
              {nodes.map((pos) => {
                const i = pos.id;
                const isCurrent = currentStep.currentNode === i;
                const inP1 = currentStep.path1?.includes(i);
                const inP2 = currentStep.path2?.includes(i);
                const isLCA = currentStep.lca === i;
                const isTarget = i === target1 || i === target2;
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
                } else if (isLCA) {
                  nodeColor = "rgba(var(--viz-rose-rgb), 0.1)";
                  borderColor = "var(--viz-rose)";
                  borderWidth = "4.5";
                  scale = 1.15;
                } else if (isCurrent) {
                  nodeColor = "rgba(var(--viz-amber-rgb), 0.1)";
                  borderColor = "var(--viz-amber)";
                  borderWidth = "3.5";
                  scale = 1.05;
                } else if (inP1 && inP2) {
                  nodeColor = "rgba(var(--viz-cyan-rgb), 0.05)";
                  borderColor = "var(--viz-cyan)";
                } else if (inP1) {
                  nodeColor = "rgba(var(--viz-amber-rgb), 0.03)";
                  borderColor = "var(--viz-amber)";
                } else if (inP2) {
                  nodeColor = "rgba(var(--viz-cyan-rgb), 0.03)";
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

                    {/* Target Node Badge (T1/T2 indicator) */}
                    {isTarget && (
                      <g transform={`translate(${pos.x + 18}, ${pos.y - 20})`}>
                        <circle r="7.5" fill="var(--viz-rose)" />
                        <text
                          textAnchor="middle"
                          y="2.5"
                          fontSize="7"
                          fontWeight="black"
                          fill="white"
                        >
                          {i === target1 ? "1" : "2"}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Right Column (col-span-3): Live Array State */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-[400px] md:h-[460px] lg:h-[500px]">
            <div className="p-4 bg-muted/20 border border-[var(--border)]/45 rounded-2xl flex-1 flex flex-col overflow-hidden">
              <h3 className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest flex items-center gap-1.5 mb-3 shrink-0">
                <Database size={12} className="text-[var(--viz-cyan)]" /> Path Variables
              </h3>
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {nodes.length > 0 ? (
                  <table className="w-full text-[10px] font-mono text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 text-muted-foreground">
                        <th className="pb-2 pl-2">Node</th>
                        <th className="pb-2 text-center">Path 1</th>
                        <th className="pb-2 text-center">Path 2</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nodes.map((n) => {
                        const i = n.id;
                        const inP1 = currentStep.path1?.includes(i) ? "Yes" : "-";
                        const inP2 = currentStep.path2?.includes(i) ? "Yes" : "-";
                        const isLCA = currentStep.lca === i;

                        return (
                          <tr key={i} className={`border-b border-border/20 last:border-0 transition-colors ${
                            isLCA ? "text-[var(--viz-rose)] font-black bg-[var(--viz-rose)]/5" : ""
                          }`}>
                            <td className="py-2.5 pl-3">Node {i}</td>
                            <td className="py-2.5 text-center font-bold text-[var(--viz-amber)]">{inP1}</td>
                            <td className="py-2.5 text-center font-bold text-[var(--viz-cyan)]">{inP2}</td>
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
