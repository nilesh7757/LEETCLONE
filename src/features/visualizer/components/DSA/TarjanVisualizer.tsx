"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, ChevronLeft, ChevronRight, Zap, 
  Share2, Database, Trophy, Cpu, Search, AlertTriangle, GitPullRequest, Terminal
} from "lucide-react";

interface TarjanStep {
  visited: boolean[];
  tin: number[];
  low: number[];
  bridges: Set<string>;
  articulationPoints: Set<number>;
  currentNode: number | null;
  parent: number | null;
  activeEdge: [number, number] | null;
  visitedEdges: Set<string>;
  message: string;
  stepType: "DFS_VISIT" | "BACKEDGE" | "DFS_RETURN" | "BRIDGE_FOUND" | "AP_FOUND" | "COMPLETE";
  logs: string[];
}

const NODE_POSITIONS = [
  { x: 180, y: 120 }, // Node 0
  { x: 320, y: 200 }, // Node 1
  { x: 180, y: 280 }, // Node 2
  { x: 500, y: 200 }, // Node 3
  { x: 640, y: 200 }, // Node 4
];

export default function TarjanVisualizer({ speed = 800 }: { speed?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  
  const nodesCount = 5;
  const initialEdges = useMemo(() => [
    { u: 0, v: 1 },
    { u: 1, v: 2 },
    { u: 2, v: 0 },
    { u: 1, v: 3 },
    { u: 3, v: 4 }
  ], []);

  const history: TarjanStep[] = useMemo(() => {
    const adj = Array.from({ length: nodesCount }, () => [] as number[]);
    initialEdges.forEach(({ u, v }) => {
      adj[u].push(v);
      adj[v].push(u);
    });

    const steps: TarjanStep[] = [];
    const visited = new Array(nodesCount).fill(false);
    const tin = new Array(nodesCount).fill(-1);
    const low = new Array(nodesCount).fill(-1);
    const bridges = new Set<string>();
    const articulationPoints = new Set<number>();
    const visitedEdges = new Set<string>();
    let timer = 1;
    const logs: string[] = [];

    const record = (
      msg: string, 
      node: number | null, 
      p: number | null, 
      stepType: TarjanStep["stepType"],
      activeEdge: [number, number] | null = null
    ) => {
      logs.push(msg);
      steps.push({
        visited: [...visited],
        tin: [...tin],
        low: [...low],
        bridges: new Set(bridges),
        articulationPoints: new Set(articulationPoints),
        currentNode: node,
        parent: p,
        activeEdge,
        visitedEdges: new Set(visitedEdges),
        message: msg,
        stepType,
        logs: [...logs]
      });
    };

    const dfs = (u: number, p: number = -1) => {
      visited[u] = true;
      tin[u] = low[u] = timer++;
      let children = 0;
      record(`DFS: Visited Node ${u}. Set tin = ${tin[u]}, low = ${low[u]}.`, u, p, "DFS_VISIT");

      for (const v of adj[u]) {
        if (v === p) continue;
        
        const edgeKey = `${Math.min(u, v)}-${Math.max(u, v)}`;
        
        if (visited[v]) {
          // Back-edge found
          const oldLow = low[u];
          low[u] = Math.min(low[u], tin[v]);
          visitedEdges.add(edgeKey);
          
          if (low[u] !== oldLow) {
            record(`Back-edge found ${u} - ${v}. Updated low[${u}] = min(low[${u}], tin[${v}]) = ${low[u]}.`, u, p, "BACKEDGE", [u, v]);
          } else {
            record(`Back-edge found ${u} - ${v}, but it did not decrease low[${u}].`, u, p, "BACKEDGE", [u, v]);
          }
        } else {
          children++;
          visitedEdges.add(edgeKey);
          record(`DFS: Traversing edge ${u} -> ${v}. Calling DFS(${v}).`, u, p, "DFS_VISIT", [u, v]);
          
          dfs(v, u);
          
          // Backtracking
          const oldLow = low[u];
          low[u] = Math.min(low[u], low[v]);
          record(`Returned to ${u} from ${v}. Updated low[${u}] = min(low[${u}], low[${v}]) = ${low[u]}.`, u, p, "DFS_RETURN", [u, v]);
          
          // Bridge check
          if (low[v] > tin[u]) {
            bridges.add(edgeKey);
            record(`Bridge Found! Edge ${u} - ${v} is critical because low[${v}] (${low[v]}) > tin[${u}] (${tin[u]}).`, u, p, "BRIDGE_FOUND", [u, v]);
          }
          
          // Articulation Point check
          if (p !== -1 && low[v] >= tin[u]) {
            articulationPoints.add(u);
            record(`Articulation Point Found! Node ${u} is critical because low[${v}] (${low[v]}) >= tin[${u}] (${tin[u]}).`, u, p, "AP_FOUND");
          }
        }
      }
      
      // Root articulation point check
      if (p === -1 && children > 1) {
        articulationPoints.add(u);
        record(`Articulation Point Found! Root Node ${u} has ${children} independent subtrees.`, u, p, "AP_FOUND");
      }
    };

    dfs(0);
    record("Tarjan's Bridge-Finding Algorithm Complete.", null, null, "COMPLETE");
    return steps;
  }, [initialEdges]);

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
      }, currentSpeed);
      return () => clearInterval(timerId);
    }
  }, [isPlaying, history.length, currentSpeed]);

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

  return (
    <div className="flex flex-col gap-6 font-sans select-none text-[var(--foreground)] w-full">
      {/* Visualizer Box */}
      <div className="p-4 md:p-6 bg-[var(--card)] border border-[var(--border)] rounded-[2rem] shadow-xl flex flex-col min-h-[500px] w-full overflow-hidden">
        
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
              disabled={currentIndex === 0}
              className="p-2.5 bg-muted/20 hover:bg-muted/40 border border-[var(--border)]/60 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all disabled:opacity-30 disabled:hover:bg-muted/20 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button 
              onClick={handleStepForward} 
              disabled={currentIndex === history.length - 1}
              className="p-2.5 bg-muted/20 hover:bg-muted/40 border border-[var(--border)]/60 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all disabled:opacity-30 disabled:hover:bg-muted/20 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Speed selection */}
            <div className="flex items-center gap-2 text-[10px] text-[var(--muted-foreground)] font-bold font-mono">
              <span>SPEED:</span>
              <input 
                type="range" 
                min="200" 
                max="2000" 
                step="200"
                value={2200 - currentSpeed} 
                onChange={(e) => setCurrentSpeed(2200 - parseInt(e.target.value))}
                className="w-20 accent-[var(--viz-rose)] cursor-pointer"
              />
            </div>
            
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 w-full">
          
          {/* Left Side: SVG Graph Stage */}
          <div className="lg:col-span-8 relative p-3 md:p-6 bg-muted/10 border border-[var(--border)]/45 rounded-2xl flex flex-col items-center justify-center min-h-[350px] md:min-h-[420px] w-full overflow-hidden">
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-card/85 backdrop-blur-md rounded-full shadow-sm border border-border/50">
              <Zap size={11} className="text-[var(--viz-rose)]" fill="var(--viz-rose)" />
              <span className="text-[9px] font-black font-mono text-[var(--viz-rose)] uppercase tracking-widest">{currentStep.stepType}</span>
            </div>

            {/* SVG Canvas */}
            <svg 
              viewBox="0 0 800 400" 
              className="w-full h-full select-none overflow-visible z-10"
            >
              <defs>
                <filter id="glow-tarjan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Edge Connections */}
              {initialEdges.map(({ u, v }, idx) => {
                const n1 = NODE_POSITIONS[u];
                const n2 = NODE_POSITIONS[v];
                const edgeKey = `${Math.min(u, v)}-${Math.max(u, v)}`;
                
                const isVisited = currentStep.visitedEdges.has(edgeKey);
                const isBridge = currentStep.bridges.has(edgeKey);
                const isActive = currentStep.activeEdge !== null && 
                  ((currentStep.activeEdge[0] === u && currentStep.activeEdge[1] === v) ||
                   (currentStep.activeEdge[0] === v && currentStep.activeEdge[1] === u));

                let strokeColor = "var(--border)";
                let strokeWidth = 2.5;
                let isDashed = false;
                let hasGlow = false;

                if (isBridge) {
                  strokeColor = "var(--viz-rose)";
                  strokeWidth = 4;
                  isDashed = true;
                  hasGlow = true;
                } else if (isActive) {
                  strokeColor = "var(--viz-cyan)";
                  strokeWidth = 4;
                } else if (isVisited) {
                  strokeColor = "var(--viz-cyan)";
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
                      strokeDasharray={isDashed ? "6, 4" : "none"}
                      filter={hasGlow ? "url(#glow-tarjan)" : "none"}
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
              {NODE_POSITIONS.map((pos, i) => {
                const isCurrent = currentStep.currentNode === i;
                const isVisited = currentStep.visited[i];
                const isAP = currentStep.articulationPoints.has(i);

                let nodeColor = "var(--card)";
                let borderColor = "var(--border)";
                let textColor = "var(--foreground)";
                let borderWidth = "2.5";
                let scale = 1;

                if (isCurrent) {
                  nodeColor = "rgba(var(--viz-rose-rgb), 0.1)";
                  borderColor = "var(--viz-rose)";
                  borderWidth = "4";
                  scale = 1.15;
                } else if (isAP) {
                  nodeColor = "rgba(var(--viz-amber-rgb), 0.05)";
                  borderColor = "var(--viz-amber)";
                  borderWidth = "3";
                } else if (isVisited) {
                  nodeColor = "rgba(var(--viz-cyan-rgb), 0.05)";
                  borderColor = "var(--viz-cyan)";
                }

                return (
                  <g key={`node-${i}`} className="transition-transform duration-300">
                    {/* Node Bubble */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={24 * scale}
                      fill={nodeColor}
                      stroke={borderColor}
                      strokeWidth={borderWidth}
                      className="transition-colors duration-250"
                    />

                    {/* Node Index label */}
                    <text
                      x={pos.x}
                      y={pos.y + 5}
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="900"
                      fill={textColor}
                      className="font-mono select-none"
                    >
                      {i}
                    </text>

                    {/* Expiry / Articulation Point Badge */}
                    {isAP && (
                      <g transform={`translate(${pos.x + 15}, ${pos.y - 18})`}>
                        <circle r="7" fill="var(--viz-amber)" />
                        <path 
                          d="M-3,2.5 L3,2.5 L0,-3 Z" 
                          fill="black" 
                          transform="scale(0.85) translate(0, 0.5)" 
                        />
                      </g>
                    )}

                    {/* tin / low status text directly below the node */}
                    {isVisited && (
                      <g transform={`translate(${pos.x}, ${pos.y + 40 * scale})`}>
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
                          fontSize="7"
                          fontWeight="bold"
                          className="font-mono fill-[var(--muted-foreground)]"
                        >
                          t:{currentStep.tin[i]} | l:{currentStep.low[i]}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Bottom Indicators/Legend */}
            <div className="absolute bottom-4 flex flex-wrap justify-center gap-4 z-20">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-card/90 border border-border/80 rounded-xl shadow-sm text-[10px]">
                <GitPullRequest size={11} className="text-[var(--viz-rose)] animate-pulse" />
                <span className="font-bold">Bridges: {currentStep.bridges.size}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-card/90 border border-border/80 rounded-xl shadow-sm text-[10px]">
                <AlertTriangle size={11} className="text-[var(--viz-amber)]" />
                <span className="font-bold">Articulation Points: {currentStep.articulationPoints.size}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Logic Engine & Terminal Logs */}
          <div className="lg:col-span-4 flex flex-col gap-4 min-h-[350px]">
            
            {/* Logic Engine */}
            <div className="p-4 bg-muted/20 border border-[var(--border)]/45 rounded-2xl">
              <h3 className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest flex items-center gap-1.5 mb-3">
                <Cpu size={12}/> Logic Engine
              </h3>
              <div className="space-y-2 font-mono text-[9px] leading-relaxed">
                <div className={`p-2 rounded-xl border transition-all ${
                  currentStep.stepType === "DFS_VISIT" 
                    ? "bg-[var(--viz-cyan)]/10 border-[var(--viz-cyan)] text-[var(--viz-cyan)]" 
                    : "opacity-35 border-transparent"
                }`}>
                  1. DFS node discovery: Set tin[u] = low[u] = timer++
                </div>
                <div className={`p-2 rounded-xl border transition-all ${
                  currentStep.stepType === "BACKEDGE" 
                    ? "bg-[var(--viz-amber)]/10 border-[var(--viz-amber)] text-[var(--viz-amber)]" 
                    : "opacity-35 border-transparent"
                }`}>
                  2. Back-edge: Update low[u] = min(low[u], tin[v])
                </div>
                <div className={`p-2 rounded-xl border transition-all ${
                  currentStep.stepType === "DFS_RETURN" 
                    ? "bg-[var(--viz-cyan)]/10 border-[var(--viz-cyan)] text-[var(--viz-cyan)]" 
                    : "opacity-35 border-transparent"
                }`}>
                  3. DFS backtrack: Update low[u] = min(low[u], low[v])
                </div>
                <div className={`p-2 rounded-xl border transition-all ${
                  currentStep.stepType === "BRIDGE_FOUND" 
                    ? "bg-[var(--viz-rose)]/15 border-[var(--viz-rose)] text-[var(--viz-rose)]" 
                    : "opacity-35 border-transparent"
                }`}>
                  4. Bridge check: If low[v] &gt; tin[u] &rarr; Bridge edge
                </div>
                <div className={`p-2 rounded-xl border transition-all ${
                  currentStep.stepType === "AP_FOUND" 
                    ? "bg-[var(--viz-amber)]/15 border-[var(--viz-amber)] text-[var(--viz-amber)]" 
                    : "opacity-35 border-transparent"
                }`}>
                  5. Artic. check: If low[v] &ge; tin[u] &rarr; Articulation Point
                </div>
              </div>
            </div>

            {/* Terminal logs */}
            <div className="flex-1 p-4 bg-black/40 border border-[var(--border)]/45 rounded-2xl flex flex-col overflow-hidden min-h-[180px]">
              <h3 className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest flex items-center gap-1.5 mb-2 shrink-0">
                <Terminal size={12}/> Console Output
              </h3>
              <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-1.5 pr-2 custom-scrollbar">
                {currentStep.logs.map((log, idx) => (
                  <div key={idx} className="text-white/80 leading-relaxed border-l-2 border-border/20 pl-2">
                    <span className="text-[var(--viz-cyan)]/70">&gt; </span>
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Bottom scrubbing bar */}
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
