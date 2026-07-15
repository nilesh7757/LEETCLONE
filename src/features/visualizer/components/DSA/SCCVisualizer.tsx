"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, ChevronLeft, ChevronRight, Zap, 
  Share2, Database, Trophy, Cpu, Search, ArrowRight, ArrowLeft
} from "lucide-react";

const COLORS = [
  "var(--viz-cyan)",
  "var(--viz-amber)",
  "var(--viz-rose)",
  "var(--viz-deep-purple)",
  "var(--viz-purple)",
  "var(--viz-lime)",
];

interface SCCStep {
  adj: number[][];
  revAdj: number[][];
  visited: boolean[];
  stack: number[];
  sccs: number[][];
  currentNodes: number[];
  message: string;
  phase: "DFS1" | "REVERSE" | "DFS2" | "COMPLETE";
  logs: string[];
}

export default function SCCVisualizer({ speed = 800 }: { speed?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const nodes = 6;
  const initialEdges = [[0,1], [1,2], [2,0], [2,3], [3,4], [4,5], [5,3]];

  const history = useMemo(() => {
    const adj = Array.from({ length: nodes }, () => [] as number[]);
    const revAdj = Array.from({ length: nodes }, () => [] as number[]);
    initialEdges.forEach(([u, v]) => {
      adj[u].push(v);
      revAdj[v].push(u);
    });

    const steps: SCCStep[] = [];
    let visited = new Array(nodes).fill(false);
    const stack: number[] = [];
    const sccs: number[][] = [];
    const logs: string[] = [];

    const record = (msg: string, phase: SCCStep['phase'], curr: number[]) => {
      steps.push({
        adj: adj.map(r => [...r]),
        revAdj: revAdj.map(r => [...r]),
        visited: [...visited],
        stack: [...stack],
        sccs: sccs.map(r => [...r]),
        currentNodes: curr,
        message: msg,
        phase,
        logs: [...logs]
      });
    };

    // Phase 1: DFS to get finish times
    const dfs1 = (u: number) => {
        visited[u] = true;
        record(`DFS1: Visiting node ${u}.`, "DFS1", [u]);
        for (const v of adj[u]) {
            if (!visited[v]) dfs1(v);
        }
        stack.push(u);
        record(`DFS1: Finished ${u}. Pushing to stack.`, "DFS1", [u]);
    };

    for (let i = 0; i < nodes; i++) {
        if (!visited[i]) dfs1(i);
    }

    record("Phase 1 Complete. Reversing Graph...", "REVERSE", []);

    // Phase 2: DFS on reversed graph
    visited = new Array(nodes).fill(false);
    const dfs2 = (u: number, currentSCC: number[]) => {
        visited[u] = true;
        currentSCC.push(u);
        record(`DFS2: Exploring SCC member ${u}.`, "DFS2", [u]);
        for (const v of revAdj[u]) {
            if (!visited[v]) dfs2(v, currentSCC);
        }
    };

    while (stack.length > 0) {
        const u = stack.pop()!;
        if (!visited[u]) {
            const currentSCC: number[] = [];
            record(`DFS2: Starting new SCC from node ${u}.`, "DFS2", [u]);
            dfs2(u, currentSCC);
            sccs.push(currentSCC);
            record(`DFS2: SCC Found: {${currentSCC.join(", ")}}.`, "DFS2", currentSCC);
        } else {
            record(`DFS2: Node ${u} already visited. Skipping.`, "DFS2", [u]);
        }
    }

    record("Kosaraju's Algorithm Complete.", "COMPLETE", []);
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
        <div className="relative z-10 flex flex-wrap items-center justify-between mb-8 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm gap-4">
            <div className="flex items-center gap-3">
                <button onClick={() => { setCurrentIndex(0); setIsPlaying(false); }} className="p-2.5 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer" title="Reset"><RotateCcw size={14}/></button>
            </div>
            <button onClick={() => setIsPlaying(!isPlaying)} className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${isPlaying ? "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)]" : "bg-[var(--viz-rose)] text-white hover:scale-105"}`}>
                {isPlaying ? "Pause" : "Run"}
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
            <div className="lg:col-span-8 relative p-3 md:p-6 bg-muted/30 rounded-[2rem] flex flex-col items-center justify-center min-h-[350px] md:min-h-[350px] w-full overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar">
                <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-2 px-3 py-1.5 bg-card/80 backdrop-blur-md rounded-full shadow-sm border border-border/50">
                    <Zap size={12} className="text-[var(--viz-rose)]" fill="var(--viz-rose)" />
                    <span className="text-[9px] font-black font-mono text-[var(--viz-rose)] uppercase tracking-widest">{currentStep.phase}</span>
                </div>

                {/* Graph Visualization */}
                <div className="flex flex-wrap justify-center gap-8 relative z-10">
                    {Array.from({ length: nodes }).map((_, i) => {
                        const isCurrent = currentStep.currentNodes.includes(i);
                        const isVisited = currentStep.visited[i];
                        const sccIdx = currentStep.sccs.findIndex(scc => scc.includes(i));
                        const sccColor = sccIdx !== -1 ? COLORS[sccIdx % COLORS.length] : "var(--border)";

                        return (
                            <motion.div
                                key={i}
                                animate={{ 
                                    scale: isCurrent ? 1.2 : 1,
                                    borderColor: isCurrent ? "var(--viz-rose)" : sccColor,
                                    backgroundColor: isCurrent ? "var(--viz-rose)22" : (isVisited && currentStep.phase === "DFS1") ? "rgba(255,255,255,0.05)" : "transparent"
                                }}
                                className="w-16 h-16 rounded-full border-2 flex items-center justify-center relative shadow-sm"
                            >
                                <span className="text-lg font-black font-mono">{i}</span>
                                {isVisited && currentStep.phase === "DFS1" && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--viz-cyan)] rounded-full flex items-center justify-center text-[8px] text-black font-bold">✓</div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-12 flex items-center gap-8 w-full max-w-md">
                    <div className="flex-1 p-4 bg-card rounded-2xl border border-border shadow-inner min-h-[350px] md:min-h-[80px] w-full overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar">
                        <h4 className="text-[8px] font-black uppercase text-muted-foreground/50 mb-2 tracking-widest flex items-center gap-2">
                            <Database size={10} /> Finish Stack
                        </h4>
                        <div className="flex flex-wrap-reverse gap-2">
                            {currentStep.stack.map((v, i) => (
                                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded bg-[var(--viz-cyan)]/20 border border-[var(--viz-cyan)] flex items-center justify-center text-[10px] font-bold text-[var(--viz-cyan)]">
                                    {v}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="p-3 md:p-6 bg-muted/20 rounded-[2rem] flex-1">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2 mb-4">
                        <Cpu size={14}/> Logic Console
                    </h3>
                    <div className="space-y-3 font-mono text-[10px]">
                        <div className={`p-2 rounded-lg border transition-all ${currentStep.phase === "DFS1" ? "bg-[var(--viz-cyan)]/10 border-[var(--viz-cyan)] text-[var(--viz-cyan)]" : "opacity-30"}`}>
                           1. Run DFS: Record finishing times in a stack.
                        </div>
                        <div className={`p-2 rounded-lg border transition-all ${currentStep.phase === "REVERSE" ? "bg-[var(--viz-amber)]/10 border-[var(--viz-amber)] text-[var(--viz-amber)]" : "opacity-30"}`}>
                           2. Transpose: Reverse all edges in the graph.
                        </div>
                        <div className={`p-2 rounded-lg border transition-all ${currentStep.phase === "DFS2" ? "bg-[var(--viz-rose)]/10 border-[var(--viz-rose)] text-[var(--viz-rose)]" : "opacity-30"}`}>
                           3. Run DFS: Pop stack and find SCCs in reversed graph.
                        </div>
                    </div>
                </div>

                <div className="p-3 md:p-6 bg-muted/20 rounded-[2rem]">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2 mb-4">
                        <Search size={14}/> Found SCCs
                    </h3>
                    <div className="space-y-2">
                        {currentStep.sccs.map((scc, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border shadow-sm">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                <span className="text-[10px] font-bold font-mono text-muted-foreground">SCC #{idx+1}: {`{ ${scc.join(", ")} }`}</span>
                            </div>
                        ))}
                        {currentStep.sccs.length === 0 && <div className="text-[10px] italic text-muted-foreground/30 text-center py-4">Searching for components...</div>}
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-4 p-3 md:p-6 bg-muted/30 rounded-[2.5rem] flex flex-col gap-4">
            <div className="flex items-center gap-4 bg-[var(--card)] border border-[var(--border)] p-4 rounded-[1.5rem] shadow-sm select-none w-full">
              <span className="font-mono text-[9px] font-black uppercase text-[var(--muted-foreground)] tracking-widest min-w-[50px]">Step {currentIndex + 1}/{history.length}</span>
              <div className="flex-1 h-1 bg-[var(--border)] rounded-full relative flex items-center group/slider">
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
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Protocol Stage {currentIndex + 1} / {history.length}</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40"><ChevronLeft size={18} /></button>
                    <button onClick={() => setCurrentIndex(Math.min(history.length - 1, currentIndex + 1))} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40"><ChevronRight size={18} /></button>
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



