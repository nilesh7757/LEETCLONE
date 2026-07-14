"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, ChevronLeft, ChevronRight, Zap, 
  Share2, Database, Trophy, Cpu, Search, AlertTriangle, GitPullRequest
} from "lucide-react";

const COLORS = [
  "var(--viz-cyan)",
  "var(--viz-amber)",
  "var(--viz-rose)",
  "var(--viz-deep-purple)",
  "var(--viz-purple)",
  "var(--viz-lime)",
];

interface TarjanStep {
  adj: number[][];
  visited: boolean[];
  tin: number[];
  low: number[];
  bridges: [number, number][];
  articulationPoints: Set<number>;
  currentNode: number | null;
  parent: number | null;
  message: string;
  step: string;
  logs: string[];
}

export default function TarjanVisualizer({ speed = 800 }: { speed?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const nodes = 5;
  const initialEdges = [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4]];

  const history = useMemo(() => {
    const adj = Array.from({ length: nodes }, () => [] as number[]);
    initialEdges.forEach(([u, v]) => {
      adj[u].push(v);
      adj[v].push(u);
    });

    const steps: TarjanStep[] = [];
    const visited = new Array(nodes).fill(false);
    const tin = new Array(nodes).fill(-1);
    const low = new Array(nodes).fill(-1);
    const bridges: [number, number][] = [];
    const articulationPoints = new Set<number>();
    let timer = 0;
    const logs: string[] = [];

    const record = (msg: string, node: number | null, p: number | null, stepName: string) => {
      steps.push({
        adj: adj.map(r => [...r]),
        visited: [...visited],
        tin: [...tin],
        low: [...low],
        bridges: [...bridges],
        articulationPoints: new Set(articulationPoints),
        currentNode: node,
        parent: p,
        message: msg,
        step: stepName,
        logs: [...logs]
      });
    };

    const dfs = (u: number, p: number = -1) => {
      visited[u] = true;
      tin[u] = low[u] = timer++;
      let children = 0;
      record(`DFS: Visiting Node ${u}. Setting tin=${tin[u]}, low=${low[u]}.`, u, p, "DFS_VISIT");

      for (const v of adj[u]) {
        if (v === p) continue;
        if (visited[v]) {
          low[u] = Math.min(low[u], tin[v]);
          record(`Back-edge found: ${u} to ${v}. Updating low[${u}] = min(low[${u}], tin[${v}]) = ${low[u]}.`, u, p, "BACKEDGE");
        } else {
          children++;
          dfs(v, u);
          low[u] = Math.min(low[u], low[v]);
          record(`Returning to ${u} from ${v}. Updating low[${u}] = min(low[${u}], low[${v}]) = ${low[u]}.`, u, p, "DFS_RETURN");
          
          // Bridge condition
          if (low[v] > tin[u]) {
            bridges.push([u, v]);
            record(`Bridge Found: Edge ${u}-${v}! v cannot reach u or above via a back-edge.`, u, p, "BRIDGE_FOUND");
          }
          
          // Articulation Point condition
          if (p !== -1 && low[v] >= tin[u]) {
            articulationPoints.add(u);
            record(`Articulation Point Found: Node ${u}! v depends on u to reach the rest of the graph.`, u, p, "AP_FOUND");
          }
        }
      }
      if (p === -1 && children > 1) {
        articulationPoints.add(u);
        record(`Articulation Point Found: Root Node ${u} has more than 1 independent child.`, u, p, "AP_FOUND");
      }
    };

    dfs(0);
    record("Tarjan's Algorithm Complete.", null, null, "COMPLETE");
    return steps;
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setCurrentIndex(p => {
          if (p >= history.length - 1) { setIsPlaying(false); return p; }
          return p + 1;
        });
      }, speed);
      return () => clearInterval(timer);
    }
  }, [isPlaying, history.length, speed]);

  const currentStep = history[currentIndex] || history[0];

  return (
    <div className="flex flex-col gap-6 font-sans select-none">
      <div className="p-4 md:p-8 bg-[var(--card)] rounded-[2.5rem] shadow-2xl overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar relative flex flex-col min-h-[350px] md:min-h-[600px] w-full">
        <div className="relative z-10 flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--viz-rose)]/10 rounded-xl text-[var(--viz-rose)]">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Bridges & Articulation Points</h2>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Tarjan&apos;s Connectivity Protocol</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={() => { setCurrentIndex(0); setIsPlaying(false); }} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all"><RotateCcw size={18}/></button>
                <button onClick={() => setIsPlaying(!isPlaying)} className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${isPlaying ? "bg-muted text-foreground" : "bg-[var(--viz-rose)] text-white hover:scale-105"}`}>
                    {isPlaying ? "PAUSE" : "RUN"}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
            <div className="lg:col-span-8 relative p-3 md:p-6 bg-muted/30 rounded-[2rem] flex flex-col items-center justify-center min-h-[350px] md:min-h-[350px] w-full overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar">
                <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-2 px-3 py-1.5 bg-card/80 backdrop-blur-md rounded-full shadow-sm border border-border/50">
                    <Zap size={12} className="text-[var(--viz-rose)]" fill="var(--viz-rose)" />
                    <span className="text-[9px] font-black font-mono text-[var(--viz-rose)] uppercase tracking-widest">{currentStep.step}</span>
                </div>

                {/* Graph View */}
                <div className="flex flex-wrap justify-center gap-12 relative z-10">
                    {Array.from({ length: nodes }).map((_, i) => {
                        const isCurrent = currentStep.currentNode === i;
                        const isVisited = currentStep.visited[i];
                        const isAP = currentStep.articulationPoints.has(i);

                        return (
                            <motion.div
                                key={i}
                                animate={{ 
                                    scale: isCurrent ? 1.2 : 1,
                                    borderColor: isCurrent ? "var(--viz-rose)" : isAP ? "var(--viz-amber)" : "var(--border)",
                                    backgroundColor: isCurrent ? "var(--viz-rose)22" : isAP ? "var(--viz-amber)11" : "var(--card)"
                                }}
                                className="w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center relative shadow-sm"
                            >
                                <span className="text-lg font-black font-mono">{i}</span>
                                {isVisited && (
                                    <div className="mt-1 flex gap-1">
                                        <span className="text-[6px] font-bold text-[var(--viz-cyan)]">T:{currentStep.tin[i]}</span>
                                        <span className="text-[6px] font-bold text-[var(--viz-amber)]">L:{currentStep.low[i]}</span>
                                    </div>
                                )}
                                {isAP && (
                                    <div className="absolute -top-2 -right-2 p-1 bg-[var(--viz-amber)] rounded-full text-black">
                                        <AlertTriangle size={8} fill="currentColor" />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-12 flex flex-wrap justify-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-lg border border-border">
                        <GitPullRequest size={12} className="text-[var(--viz-rose)]" />
                        <span className="text-[10px] font-bold">Bridges: {currentStep.bridges.length}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-lg border border-border">
                        <Search size={12} className="text-[var(--viz-amber)]" />
                        <span className="text-[10px] font-bold">Artic. Points: {currentStep.articulationPoints.size}</span>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="p-3 md:p-6 bg-muted/20 rounded-[2rem] flex-1">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2 mb-4">
                        <Cpu size={14}/> Logic Engine
                    </h3>
                    <div className="space-y-4 font-mono text-[9px]">
                        <div className="space-y-2">
                           <div className={`p-2 rounded-lg border transition-all ${currentStep.step.includes("DFS") ? "bg-[var(--viz-cyan)]/10 border-[var(--viz-cyan)] text-[var(--viz-cyan)]" : "opacity-30"}`}>
                               1. DFS Discovery Time (tin)
                           </div>
                           <div className={`p-2 rounded-lg border transition-all ${currentStep.step.includes("BACKEDGE") ? "bg-[var(--viz-amber)]/10 border-[var(--viz-amber)] text-[var(--viz-amber)]" : "opacity-30"}`}>
                               2. Low-Link Update (low)
                           </div>
                           <div className={`p-2 rounded-lg border transition-all ${currentStep.step.includes("FOUND") ? "bg-[var(--viz-rose)]/10 border-[var(--viz-rose)] text-[var(--viz-rose)]" : "opacity-30"}`}>
                               3. Critical Edge/Node Detect
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-4 p-3 md:p-6 bg-muted/30 rounded-[2.5rem] flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Trace Stage {currentIndex + 1}</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => setCurrentIndex(Math.min(history.length - 1, currentIndex + 1))} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronRight size={18} /></button>
                </div>
            </div>
            <div className="text-center text-[11px] font-mono text-[var(--viz-amber)] bg-card/50 py-2 rounded-xl border border-border/50">
                {currentStep.message}
            </div>
        </div>
      </div>
    </div>
  );
}


