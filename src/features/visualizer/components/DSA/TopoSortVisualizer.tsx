"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Shuffle, ListOrdered, Zap, Activity, Layers, Network, Hash, ChevronLeft, ChevronRight
} from "lucide-react";

const NUM_NODES = 6;

interface TopoStep {
  inDegree: number[];
  queue: number[];
  result: number[];
  activeNode: number | null;
  activeEdge: [number, number] | null;
  message: string;
  step: string;
  logs: string[];
}

export default function TopoSortVisualizer({ speed = 800 }: { speed?: number }) {
  const [edges, setEdges] = useState<[number, number][]>([
    [0, 2], [0, 3], [1, 3], [1, 4], [2, 5], [3, 5], [4, 5]
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const labels = useMemo(() => ["A", "B", "C", "D", "E", "F"], []);

  const generateRandomEdges = React.useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    const newEdges: [number, number][] = [];
    for (let i = 0; i < NUM_NODES; i++) {
        for (let j = i + 1; j < NUM_NODES; j++) {
            if (Math.random() > 0.7) newEdges.push([i, j]);
        }
    }
    if (newEdges.length === 0) newEdges.push([0, 1], [1, 2], [2, 3]);
    setEdges(newEdges);
  }, []);

  const nodePositions = useMemo(() => [
    { x: 60, y: 100 }, { x: 60, y: 300 }, { x: 200, y: 60 }, { x: 200, y: 200 }, { x: 200, y: 340 }, { x: 340, y: 200 }
  ], []);

  const getEdgeData = (uIdx: number, vIdx: number) => {
    const u = nodePositions[uIdx];
    const v = nodePositions[vIdx];
    if (!u || !v) return null;
    const dx = v.x - u.x, dy = v.y - u.y, d = Math.sqrt(dx*dx + dy*dy);
    if (d === 0) return null;
    const ux = dx/d, uy = dy/d;
    const hasOpposite = edges.some(([su, sv]) => su === vIdx && sv === uIdx);
    const curve = hasOpposite ? 15 : 0;
    const cpX = (u.x + v.x)/2 - uy * curve;
    const cpY = (u.y + v.y)/2 + ux * curve;
    const path = `M ${u.x + ux*16} ${u.y + uy*16} Q ${cpX} ${cpY} ${v.x - ux*20} ${v.y - uy*20}`;
    return { path, cpX, cpY, ux, uy };
  };

  const history = useMemo(() => {
    const steps: TopoStep[] = [];
    let logs: string[] = [];
    const inDegree = new Array(NUM_NODES).fill(0);
    const adj: number[][] = Array.from({ length: NUM_NODES }, () => []);

    for (const [u, v] of edges) {
        adj[u].push(v);
        inDegree[v]++;
    }

    const record = (msg: string, step: string, active: number | null = null, edge: [number, number] | null = null, q: number[] = [], res: number[] = []) => {
      steps.push({
        inDegree: [...inDegree],
        queue: [...q],
        result: [...res],
        activeNode: active,
        activeEdge: edge,
        message: msg,
        step: step,
        logs: [...logs]
      });
    };

    const addLog = (l: string) => { logs = [l, ...logs]; };

    addLog("Dependency structure initialized.");
    record("Calculating in-degrees for all nodes.", "BOOT", null, null, [], []);

    const q: number[] = [];
    for (let i = 0; i < NUM_NODES; i++) {
        if (inDegree[i] === 0) {
            q.push(i);
            addLog(`Node ${labels[i]} has zero dependencies.`);
            record(`Source node ${labels[i]} detected. Adding to queue.`, "SOURCE_FOUND", i, null, q, []);
        }
    }

    const res: number[] = [];
    while (q.length > 0) {
        const u = q.shift()!;
        res.push(u);
        addLog(`Processing Node ${labels[u]}.`);
        record(`Extracting node ${labels[u]} and appending to sorted sequence.`, "EXTRACTION", u, null, q, res);

        for (const v of adj[u]) {
            record(`Reducing dependency for neighbor ${labels[v]}.`, "RELAX", u, [u, v], q, res);
            inDegree[v]--;
            if (inDegree[v] === 0) {
                q.push(v);
                addLog(`Node ${labels[v]} dependencies resolved.`);
                record(`In-degree for ${labels[v]} reached zero. Enqueueing.`, "BUFFER_ADD", v, null, q, res);
            }
        }
    }

    addLog("Topological resolution complete.");
    record("Global sequence fully resolved.", "COMPLETE", null, null, [], res);

    return steps;
  }, [edges, labels]);

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
    inDegree: [], queue: [], result: [], activeNode: null, activeEdge: null, message: "Initializing...", step: "IDLE", logs: []
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (currentIndex >= history.length - 1) setCurrentIndex(0);
              setIsPlaying(!isPlaying);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--viz-rose)] hover:bg-[var(--viz-rose)]/80 text-black rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause size={14} fill="currentColor" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentIndex(0);
            }}
            className="p-2.5 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={generateRandomEdges}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all text-xs font-bold cursor-pointer"
            title="Randomize Graph"
          >
            <Shuffle size={14} />
            <span>Randomize</span>
          </button>
        </div>

        {/* Kahn's Algorithm Badge */}
        <div className="px-3 py-1.5 bg-[var(--muted)]/20 border border-[var(--border)]/40 rounded-xl text-[10px] font-mono text-[var(--muted-foreground)] font-bold tracking-tight">
          Kahn&apos;s Algorithm
        </div>
      </div>

      {/* Visual Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Topology View (Graph State) */}
        <div className="relative w-full h-[320px] md:h-[400px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-hidden shadow-inner flex items-center justify-center p-0 lg:col-span-8">


          <div className="relative w-full aspect-[4/3] max-w-[400px] h-auto flex items-center justify-center">
            <svg 
              viewBox="0 0 400 400" 
              className="w-full h-full select-none touch-none z-10 overflow-visible"
            >
              <defs>
                <marker id="topo-arrow" markerWidth="10" markerHeight="7" refX="19" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                </marker>
              </defs>

              {/* Draw Edges */}
              {edges.map(([u, v], i) => {
                const edgeInfo = getEdgeData(u, v);
                if (!edgeInfo) return null;
                const { path } = edgeInfo;

                const isActive = currentStep.activeEdge?.[0] === u && currentStep.activeEdge?.[1] === v;
                const isResolved = currentStep.result.includes(u);
                
                let strokeColor = "text-[var(--muted-foreground)]/20";
                let strokeWidth = 1.5;

                if (isActive) {
                  strokeColor = "text-[var(--viz-rose)]";
                  strokeWidth = 3;
                } else if (isResolved) {
                  strokeColor = "text-[var(--viz-green)]/30";
                  strokeWidth = 1.5;
                }

                return (
                  <g key={`edge-${i}`}>
                    <motion.path
                      d={path}
                      fill="none"
                      stroke="currentColor"
                      className={strokeColor}
                      strokeWidth={strokeWidth}
                      markerEnd="url(#topo-arrow)"
                      animate={{ opacity: 1 }}
                    />
                    {isActive && (
                      <motion.circle r="3" fill="var(--viz-rose)">
                        <animateMotion dur="0.8s" repeatCount="indefinite" path={path} />
                      </motion.circle>
                    )}
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {nodePositions.map((pos, idx) => {
                const isA = currentStep.activeNode === idx;
                const isQ = currentStep.queue.includes(idx);
                const isR = currentStep.result.includes(idx);

                let nodeColor = "var(--card)";
                let borderColor = "var(--border)";

                if (isA) {
                  nodeColor = "rgba(var(--viz-amber-rgb), 0.15)";
                  borderColor = "var(--viz-amber)";
                } else if (isR) {
                  nodeColor = "rgba(var(--viz-green-rgb), 0.15)";
                  borderColor = "var(--viz-green)";
                } else if (isQ) {
                  nodeColor = "rgba(var(--viz-cyan-rgb), 0.15)";
                  borderColor = "var(--viz-cyan)";
                }

                return (
                  <g key={`node-group-${idx}`} className="select-none pointer-events-none">
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="16"
                      fill={nodeColor}
                      stroke={borderColor}
                      strokeWidth="2.5"
                      className="transition-colors duration-200"
                    />
                    <text
                      cx={pos.x}
                      cy={pos.y}
                      x={pos.x}
                      y={pos.y}
                      dy="3"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      className="font-mono select-none pointer-events-none fill-[var(--foreground)]"
                    >
                      {labels[idx]}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 24}
                      textAnchor="middle"
                      fontSize="7"
                      fontWeight="bold"
                      className="font-mono fill-[var(--muted-foreground)]/50 uppercase tracking-tighter"
                    >
                      IN:{currentStep.inDegree[idx]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Sorted Sequence */}
          <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col gap-3 shadow-sm">
            <h3 className="text-[9px] font-black uppercase text-[var(--muted-foreground)]/50 tracking-widest flex items-center gap-2">
              <ListOrdered size={14} className="text-[var(--viz-rose)]" /> Sorted Sequence
            </h3>
            <div className="flex flex-wrap gap-2 justify-center min-h-[36px] items-center">
              <AnimatePresence>
                {currentStep.result.map((idx) => (
                  <motion.div
                    key={`res-${idx}`}
                    initial={{ scale: 0, x: -20 }}
                    animate={{ scale: 1, x: 0 }}
                    className="w-8 h-8 rounded-xl border border-[var(--viz-green)] bg-[var(--viz-green)]/10 flex items-center justify-center font-mono text-xs font-black text-[var(--viz-green)]"
                  >
                    {labels[idx]}
                  </motion.div>
                ))}
              </AnimatePresence>
              {currentStep.result.length === 0 && (
                <span className="text-[9px] italic text-[var(--muted-foreground)]/30">Awaiting resolution...</span>
              )}
            </div>
          </div>

          {/* Resolve Stream */}
          <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex-col h-[200px] flex shadow-sm">
            <h3 className="text-[9px] font-black uppercase text-[var(--muted-foreground)]/50 tracking-widest flex items-center gap-2 mb-3">
              <Activity size={14} className="text-[var(--viz-rose)]" /> Resolve Stream
            </h3>
            <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar flex-1 text-xs font-mono">
              <AnimatePresence mode="popLayout">
                {currentStep.logs.map((log, i) => (
                  <motion.div
                    key={`log-${currentIndex}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[11px] text-[var(--muted-foreground)]/80 leading-relaxed pl-2 border-l-2 border-[var(--border)] flex gap-1.5"
                  >
                    <span className="text-[var(--viz-rose)] font-black">»</span>
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
              {currentStep.logs.length === 0 && (
                <span className="text-[9px] italic text-[var(--muted-foreground)]/30 text-center py-8">Bit stream empty...</span>
              )}
            </div>
          </div>

          {/* Buffer */}
          <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col gap-3 shadow-sm">
            <h3 className="text-[9px] font-black uppercase text-[var(--muted-foreground)]/50 tracking-widest flex items-center gap-2">
              <Layers size={14} className="text-[var(--viz-rose)]" /> Buffer (In-Degree 0)
            </h3>
            <div className="flex flex-wrap gap-2 justify-center min-h-[36px] items-center">
              {currentStep.queue.map((idx) => (
                <div key={`q-${idx}`} className="w-8 h-8 rounded-xl bg-[var(--viz-cyan)]/10 border border-[var(--viz-cyan)]/30 flex items-center justify-center text-[10px] font-black text-[var(--viz-cyan)]">
                  {labels[idx]}
                </div>
              ))}
              {currentStep.queue.length === 0 && (
                <span className="text-[9px] italic text-[var(--muted-foreground)]/30">Buffer empty</span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Message Box */}
      <div className="w-full px-4 py-2.5 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center shadow-sm">
        <p className="text-xs text-[var(--viz-rose)] font-mono font-bold tracking-tight">
          {currentStep.message}
        </p>
      </div>

      {/* Scrubber Controls */}
      <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-[var(--viz-rose)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
              Step {currentIndex + 1} of {history.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} 
              className="p-1.5 hover:bg-[var(--accent)] border border-[var(--border)]/40 rounded-lg text-[var(--muted-foreground)] transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} 
              className="p-1.5 hover:bg-[var(--accent)] border border-[var(--border)]/40 rounded-lg text-[var(--muted-foreground)] transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="relative flex items-center group/slider w-full h-6">
          <div className="absolute w-full h-1 bg-[var(--border)] rounded-full" />
          <div 
            className="absolute h-1 bg-[var(--viz-rose)] rounded-full shadow-[0_0_10px_rgba(244,63,94,0.4)]" 
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

      {/* Legend Block */}
      <div className="px-4 py-4 bg-[var(--muted)]/20 border border-[var(--border)] rounded-2xl flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-amber)]" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Active (Extracting)</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-cyan)]" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Ready (In Queue)</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)]" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Resolved (Sorted)</span>
        </div>
      </div>
    </div>
  );
}
