"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, RefreshCw, Info, Pause, ChevronLeft, ChevronRight, Hash } from "lucide-react";

// 3Blue1Brown inspired palette
const MANIM_COLORS = {
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#F0E442",
  red: "#FC6255",
  purple: "#9A72AC",
  background: "#1C1C1C",
  text: "#FFFFFF",
  gray: "#888888"
};

const NUM_NODES = 6;

type Node = { id: number; x: number; y: number };
type Edge = { u: number; v: number; weight: number; id: string };

interface HistoryStep {
  mstEdges: Set<string>;
  visitedNodes: Set<number>;
  pq: Edge[]; // For Prim's: Actual PQ. For Kruskal's: Remaining sorted edges list.
  currentEdgeId: string | null;
  description: string;
  logs: string[];
}

export default function MSTVisualizer({ speed = 800 }: { speed?: number }) {
  // Graph State
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [mode, setMode] = useState<"PRIM" | "KRUSKAL">("PRIM");

  // Playback State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  // Handle Resize
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
        if(containerRef.current) {
            setDimensions({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight
            });
        }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Init Graph
  useEffect(() => {
    generateGraph();
  }, [dimensions.width]);

  const generateGraph = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    
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

    const newEdges: Edge[] = [];
    const added = new Set<string>();

    for (let i = 0; i < NUM_NODES; i++) {
      for (let j = i + 1; j < NUM_NODES; j++) {
        if (Math.random() < 0.6) {
           const weight = Math.floor(Math.random() * 15) + 1;
           const id = `${i}-${j}`;
           newEdges.push({ u: i, v: j, weight, id });
           added.add(id);
        }
      }
    }
    
    for(let i=0; i<NUM_NODES; i++) {
        const next = (i+1)%NUM_NODES;
        const id1 = `${Math.min(i, next)}-${Math.max(i, next)}`;
        if(!added.has(id1)) {
             newEdges.push({ u: Math.min(i, next), v: Math.max(i, next), weight: Math.floor(Math.random()*10)+1, id: id1 });
             added.add(id1);
        }
    }

    setEdges(newEdges);
  };

  // --- Algorithm History Generation ---
  const history = useMemo(() => {
    if (nodes.length === 0 || edges.length === 0) return [];

    const steps: HistoryStep[] = [];
    
    // Helper to snapshot state
    const record = (
        mst: Set<string>, 
        visited: Set<number>, 
        q: Edge[], 
        curr: string | null, 
        desc: string, 
        prevLogs: string[],
        newLog?: string
    ) => {
        steps.push({
            mstEdges: new Set(mst),
            visitedNodes: new Set(visited),
            pq: [...q],
            currentEdgeId: curr,
            description: desc,
            logs: newLog ? [newLog, ...prevLogs] : prevLogs
        });
    };

    if (mode === "PRIM") {
        const startNode = 0;
        let visited = new Set<number>([startNode]);
        let mst = new Set<string>();
        let logs: string[] = [`Started at Node ${startNode}`];
        
        // Initial PQ
        let pq = edges
            .filter(e => e.u === startNode || e.v === startNode)
            .sort((a, b) => a.weight - b.weight);

        record(mst, visited, pq, null, `Starting at Node ${startNode}. Adding connected edges to Priority Queue.`, logs);

        while (visited.size < NUM_NODES && pq.length > 0) {
            const minEdge = pq[0];
            const remainingPq = pq.slice(1);

            // Step: Checking
            record(mst, visited, pq, minEdge.id, `Checking minimum weight edge (${minEdge.u}-${minEdge.v}) with weight ${minEdge.weight}.`, logs);

            const isUVisited = visited.has(minEdge.u);
            const isVVisited = visited.has(minEdge.v);

            if (isUVisited && isVVisited) {
                // Cycle
                record(mst, visited, remainingPq, minEdge.id, `Edge (${minEdge.u}-${minEdge.v}) connects two already visited nodes. Discarding to prevent cycle.`, logs, `Skipped ${minEdge.u}-${minEdge.v} (Cycle detected)`);
                pq = remainingPq;
            } else {
                // Add to MST
                const newNode = isUVisited ? minEdge.v : minEdge.u;
                mst.add(minEdge.id);
                visited.add(newNode);
                
                // Add new neighbors
                const newEdges = edges.filter(e => 
                    (e.u === newNode && !visited.has(e.v)) || 
                    (e.v === newNode && !visited.has(e.u))
                );
                
                let nextPq = [...remainingPq, ...newEdges].sort((a, b) => a.weight - b.weight);
                
                record(mst, visited, remainingPq, minEdge.id, `Added Edge (${minEdge.u}-${minEdge.v}) to MST! Node ${newNode} is now visited.`, logs, `Added Edge ${minEdge.u}-${minEdge.v} (Weight: ${minEdge.weight})`);
                
                // Step: Update PQ
                pq = nextPq;
                record(mst, visited, pq, null, `Added edges connected to Node ${newNode} to the Priority Queue.`, logs);
            }
        }
        record(mst, visited, [], null, "Minimum Spanning Tree Constructed Successfully!", logs, "Algorithm Complete");

    } else {
        // KRUSKAL
        let sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
        let mst = new Set<string>();
        let visited = new Set<number>(); // For visualization only (touched nodes)
        let logs: string[] = ["Sorted edges by weight"];
        
        // DSU
        const parent = Array.from({ length: NUM_NODES }, (_, i) => i);
        const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
        const union = (i: number, j: number) => {
            const rootI = find(i);
            const rootJ = find(j);
            if (rootI !== rootJ) {
                parent[rootI] = rootJ;
                return true;
            }
            return false;
        };

        record(mst, visited, sortedEdges, null, "Sorted all edges by weight. Iterating from smallest to largest.", logs);

        // Iterate through copy to avoid mutation issues in loop
        const edgesToProcess = [...sortedEdges];
        
        for (let i = 0; i < edgesToProcess.length; i++) {
            const edge = edgesToProcess[i];
            const currentEdgesList = edgesToProcess.slice(i); // Show remaining edges

            // Step: Checking
            record(mst, visited, currentEdgesList, edge.id, `Checking edge (${edge.u}-${edge.v}) with weight ${edge.weight}.`, logs);

            if (union(edge.u, edge.v)) {
                mst.add(edge.id);
                visited.add(edge.u);
                visited.add(edge.v);
                
                record(mst, visited, currentEdgesList.slice(1), edge.id, `No cycle detected. Adding (${edge.u}-${edge.v}) to MST.`, logs, `Added ${edge.u}-${edge.v} (Weight: ${edge.weight})`);
            } else {
                record(mst, visited, currentEdgesList.slice(1), edge.id, `Nodes ${edge.u} and ${edge.v} are already connected. Skipping to prevent cycle.`, logs, `Skipped ${edge.u}-${edge.v} (Cycle)`);
            }
        }
        record(mst, visited, [], null, "Kruskal's Algorithm Complete! MST Constructed.", logs, "Algorithm Complete");
    }

    return steps;
  }, [nodes, edges, mode]);


  // --- Playback Logic ---
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
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, history.length, speed]);

  const currentStep = history[currentIndex] || { 
      mstEdges: new Set(), 
      visitedNodes: new Set(), 
      pq: [], 
      currentEdgeId: null, 
      description: "Initializing...", 
      logs: [] 
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full font-sans text-white">
      {/* Control Panel */}
      <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-[2rem] shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 z-10 relative">
          <div className="space-y-1">
            <h2 className="text-3xl font-light text-[#83C167]">{mode === 'PRIM' ? "Prim's" : "Kruskal's"} <span className="text-white/20 italic">Algorithm</span></h2>
            <div className="flex items-center gap-3">
                 <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Minimum Spanning Tree</p>
                 <div className="h-px w-8 bg-white/10"></div>
                 <div className="flex gap-2">
                    <button onClick={() => { setMode("PRIM"); setIsPlaying(false); setCurrentIndex(0); }} className={`text-[9px] font-black px-2 py-1 rounded ${mode === "PRIM" ? "bg-[#83C167] text-black" : "bg-white/5 text-white/30"}`}>PRIM</button>
                    <button onClick={() => { setMode("KRUSKAL"); setIsPlaying(false); setCurrentIndex(0); }} className={`text-[9px] font-black px-2 py-1 rounded ${mode === "KRUSKAL" ? "bg-[#F0E442] text-black" : "bg-white/5 text-white/30"}`}>KRUSKAL</button>
                 </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button onClick={generateGraph} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-white/60 hover:text-white"><RefreshCw size={20}/></button>
             <button onClick={() => { setIsPlaying(false); setCurrentIndex(0); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-white/60 hover:text-white"><RotateCcw size={20}/></button>
             
             {!isPlaying ? (
                <button onClick={() => { 
                    if (currentIndex >= history.length - 1) setCurrentIndex(0);
                    setIsPlaying(true); 
                }} className={`flex items-center gap-2 px-6 py-3 ${mode === 'PRIM' ? 'bg-[#83C167]' : 'bg-[#F0E442]'} text-black rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]`}>
                    <Play size={16} fill="currentColor"/> START
                </button>
             ) : (
                <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-xs hover:bg-white/20 transition-all">
                    <Pause size={16} fill="currentColor"/> PAUSE
                </button>
             )}
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-2 relative z-10">
             <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <Hash size={12} /> Step {currentIndex + 1} / {history.length}
                 </div>
                 <div className="flex gap-1">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1 hover:bg-white/10 rounded"><ChevronLeft size={16} className="text-white/50" /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1 hover:bg-white/10 rounded"><ChevronRight size={16} className="text-white/50" /></button>
                 </div>
             </div>
             <div className="relative flex items-center group cursor-pointer">
                 <div className="absolute w-full h-1.5 bg-white/10 rounded-full" />
                 <motion.div 
                    className={`absolute h-1.5 rounded-full ${mode === 'PRIM' ? 'bg-[#83C167]' : 'bg-[#F0E442]'}`} 
                    layoutId="progressBar"
                    style={{ width: `${(currentIndex / (Math.max(history.length - 1, 1))) * 100}%` }} 
                 />
                 <input 
                    type="range" min="0" max={Math.max(history.length - 1, 0)} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-4 opacity-0 z-20 cursor-pointer"
                 />
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Canvas */}
            <div className="lg:col-span-2 relative h-[450px] bg-black/40 rounded-[1.5rem] border border-white/5 shadow-inner overflow-hidden" ref={containerRef}>
                 <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
                 
                 <svg width="100%" height="100%" className="absolute top-0 left-0 pointer-events-none">
                    {edges.map((edge) => {
                        const uNode = nodes[edge.u];
                        const vNode = nodes[edge.v];
                        if (!uNode || !vNode) return null;
                        
                        const isMst = currentStep.mstEdges.has(edge.id);
                        const isCurrent = currentStep.currentEdgeId === edge.id;
                        // For Prim's, check if in PQ. For Kruskal's, just neutral unless active/MST.
                        const isInPq = mode === "PRIM" && currentStep.pq.some(e => e.id === edge.id);

                        const midX = (uNode.x + vNode.x) / 2;
                        const midY = (uNode.y + vNode.y) / 2;

                        return (
                            <React.Fragment key={edge.id}>
                                <motion.line
                                    x1={uNode.x} y1={uNode.y} x2={vNode.x} y2={vNode.y}
                                    stroke={isMst ? MANIM_COLORS.gold : isCurrent ? MANIM_COLORS.blue : isInPq ? "#444" : "#222"}
                                    strokeWidth={isMst ? 5 : isCurrent ? 4 : 2}
                                    animate={{
                                        stroke: isMst ? MANIM_COLORS.gold : isCurrent ? MANIM_COLORS.blue : isInPq ? "#444" : "#222",
                                        strokeWidth: isMst ? 5 : isCurrent ? 4 : 2
                                    }}
                                    transition={{ duration: 0.2 }}
                                />
                                <circle cx={midX} cy={midY} r="10" fill="#0A0A0A" />
                                <text x={midX} y={midY} dy="4" textAnchor="middle" fill={isMst ? MANIM_COLORS.gold : "#555"} fontSize="12" fontWeight="bold" className="font-mono">
                                    {edge.weight}
                                </text>
                            </React.Fragment>
                        );
                    })}
                 </svg>

                 {nodes.map((node) => {
                     const isVisited = currentStep.visitedNodes.has(node.id);
                     return (
                         <motion.div
                            key={node.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, backgroundColor: isVisited ? MANIM_COLORS.green : "#1C1C1C", borderColor: isVisited ? MANIM_COLORS.green : "#444" }}
                            className="absolute w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg shadow-xl z-10"
                            style={{ left: node.x - 24, top: node.y - 24, color: isVisited ? "#000" : "#666" }}
                         >
                             {node.id}
                         </motion.div>
                     );
                 })}
            </div>

            {/* Sidebar: Info & PQ */}
            <div className="flex flex-col gap-6 h-[450px]">
                {/* Status Box */}
                <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl shrink-0">
                    <h3 className={`text-xs font-bold ${mode === 'PRIM' ? 'text-[#83C167]' : 'text-[#F0E442]'} uppercase mb-2 flex items-center gap-2`}>
                        <Info size={14}/> Current Step
                    </h3>
                    <AnimatePresence mode="wait">
                        <motion.p 
                            key={currentIndex}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm text-white/80 leading-relaxed font-light min-h-[40px]"
                        >
                            {currentStep.description}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* List View */}
                <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl p-5 overflow-hidden flex flex-col">
                    <h3 className="text-xs font-bold text-white/40 uppercase mb-4 tracking-widest">{mode === 'PRIM' ? "Priority Queue" : "Sorted Edges"}</h3>
                    <div className="flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-thin">
                        <AnimatePresence>
                            {currentStep.pq.length === 0 && <p className="text-white/20 text-xs italic">Queue is empty</p>}
                            {currentStep.pq.map((edge) => (
                                <motion.div
                                    key={edge.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${currentStep.currentEdgeId === edge.id ? "bg-[#58C4DD] text-black border-[#58C4DD]" : "bg-white/5 border-white/5 text-white/60"}`}
                                >
                                    <span className="text-xs font-mono font-bold">Edge {edge.u}-{edge.v}</span>
                                    <span className="text-xs font-black">{edge.weight}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>

        {/* Algorithm Legend */}
        <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 text-[10px] text-white/40 uppercase tracking-widest font-mono">
             <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-[#83C167]"></div> Visited / Component
             </div>
             <div className="flex items-center gap-3">
                 <div className="w-8 h-1 bg-[#F0E442]"></div> MST Edge
             </div>
             <div className="flex items-center gap-3">
                 <div className="w-8 h-1 bg-[#58C4DD]"></div> Active Edge
             </div>
        </div>
      </div>
    </div>
  );
}