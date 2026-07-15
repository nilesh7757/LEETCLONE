"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, ChevronLeft, ChevronRight, Zap, 
  GitBranch, Database, Trophy, Cpu, Search, ArrowUp
} from "lucide-react";

const COLORS = {
  node: "var(--card)",
  border: "var(--border)",
  active: "var(--viz-cyan)",
  path: "var(--viz-amber)",
  lca: "var(--viz-rose)",
  text: "var(--foreground)",
  muted: "var(--muted-foreground)"
};

interface LCAStep {
  currentNode: number | null;
  path1: number[];
  path2: number[];
  lca: number | null;
  message: string;
  step: string;
  phase: "FIND_PATH1" | "FIND_PATH2" | "COMPARE" | "COMPLETE";
}

export default function LCAVisualizer({ speed = 800 }: { speed?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [target1, setTarget1] = useState(4);
  const [target2, setTarget2] = useState(6);

  // Simple Binary Tree structure:
  //      0
  //     / \
  //    1   2
  //   / \ / \
  //  3  4 5  6
  const adj = [[1, 2], [3, 4], [5, 6], [], [], [], []];
  const parent = [-1, 0, 0, 1, 1, 2, 2];

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const history = useMemo(() => {
    const steps: LCAStep[] = [];
    
    const getPath = (target: number) => {
      const path = [];
      let curr = target;
      while (curr !== -1) {
        path.push(curr);
        curr = parent[curr];
      }
      return path.reverse();
    };

    const path1 = getPath(target1);
    const path2 = getPath(target2);

    // Step-by-step trace
    path1.forEach((node, idx) => {
      steps.push({
        currentNode: node,
        path1: path1.slice(0, idx + 1),
        path2: [],
        lca: null,
        message: `Tracing path to Node ${target1}: Visiting ${node}`,
        step: "TRACE_P1",
        phase: "FIND_PATH1"
      });
    });

    path2.forEach((node, idx) => {
      steps.push({
        currentNode: node,
        path1: path1,
        path2: path2.slice(0, idx + 1),
        lca: null,
        message: `Tracing path to Node ${target2}: Visiting ${node}`,
        step: "TRACE_P2",
        phase: "FIND_PATH2"
      });
    });

    let lca = null;
    const minLen = Math.min(path1.length, path2.length);
    for (let i = 0; i < minLen; i++) {
      if (path1[i] === path2[i]) {
        lca = path1[i];
        steps.push({
          currentNode: lca,
          path1,
          path2,
          lca,
          message: `Comparing paths: Common node ${lca} found at level ${i}.`,
          step: "COMPARE",
          phase: "COMPARE"
        });
      } else {
        break;
      }
    }

    steps.push({
      currentNode: lca,
      path1,
      path2,
      lca,
      message: `LCA Protocol Complete. Lowest Common Ancestor is Node ${lca}.`,
      step: "DONE",
      phase: "COMPLETE"
    });

    return steps;
  }, [target1, target2]);

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

  // Tree layout helper (simplified for 7 nodes)
  const getPos = (id: number) => {
    const levels = [[0], [1, 2], [3, 4, 5, 6]];
    const level = levels.findIndex(l => l.includes(id));
    const idx = levels[level].indexOf(id);
    const spacing = [0, 160, 80][level];
    const x = (idx - (levels[level].length - 1) / 2) * spacing;
    const y = level * 80;
    return { x, y };
  };

  return (
    <div className="flex flex-col gap-6 font-sans select-none">
      <div className="p-4 md:p-8 bg-[var(--card)] rounded-[2.5rem] shadow-2xl overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar relative flex flex-col min-h-[350px] md:min-h-[500px] w-full">
        <div className="relative z-10 flex flex-wrap items-center justify-between mb-8 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm gap-4">
            <div className="flex items-center gap-3">
                <button onClick={() => { setCurrentIndex(0); setIsPlaying(false); }} className="p-2.5 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer" title="Reset"><RotateCcw size={14}/></button>
            </div>
            <button onClick={() => setIsPlaying(!isPlaying)} className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${isPlaying ? "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)]" : "bg-[var(--viz-cyan)] text-black hover:scale-105"}`}>
                {isPlaying ? "Pause" : "Run"}
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
            <div className="lg:col-span-8 relative p-3 md:p-6 bg-muted/30 rounded-[2rem] flex flex-col items-center justify-center min-h-[350px] md:min-h-[350px] w-full overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar">
                <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-card/80 backdrop-blur-md rounded-full shadow-sm border border-border/50">
                        <Zap size={12} className="text-[var(--viz-cyan)]" fill="var(--viz-cyan)" />
                        <span className="text-[9px] font-black font-mono text-[var(--viz-cyan)] uppercase tracking-widest">{currentStep.phase}</span>
                    </div>
                </div>

                <div className="relative w-full h-full flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <g transform="translate(300, 100)">
                            {/* Render Edges */}
                            {parent.map((p, i) => {
                                if (p === -1) return null;
                                const from = getPos(p);
                                const to = getPos(i);
                                return (
                                    <line key={`edge-${i}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
                                );
                            })}
                        </g>
                    </svg>

                    <div className="relative" style={{ transform: "translate(0, -50px)" }}>
                        {Array.from({ length: 7 }).map((_, i) => {
                            const pos = getPos(i);
                            const inP1 = currentStep.path1.includes(i);
                            const inP2 = currentStep.path2.includes(i);
                            const isLCA = currentStep.lca === i;
                            const isTarget = i === target1 || i === target2;

                            return (
                                <motion.div
                                    key={i}
                                    style={{ left: pos.x, top: pos.y }}
                                    animate={{ 
                                        scale: isLCA ? 1.3 : (inP1 || inP2) ? 1.1 : 1,
                                        borderColor: isLCA ? COLORS.lca : (inP1 && inP2) ? COLORS.active : inP1 ? COLORS.path : inP2 ? COLORS.active : COLORS.border,
                                        backgroundColor: isLCA ? `${COLORS.lca}22` : (inP1 && inP2) ? `${COLORS.active}22` : "var(--card)"
                                    }}
                                    className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 flex items-center justify-center shadow-lg z-10"
                                >
                                    <span className="text-sm font-black font-mono">{i}</span>
                                    {isTarget && (
                                        <div className="absolute -top-8 text-[8px] font-black uppercase text-[var(--viz-amber)]">Target</div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="p-3 md:p-6 bg-muted/20 rounded-[2rem] flex-1">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2 mb-4">
                        <Cpu size={14}/> Stack Trace
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <span className="text-[8px] font-black uppercase text-muted-foreground/50">Path 1 (Target {target1})</span>
                            <div className="flex gap-2">
                                {currentStep.path1.map((n, i) => (
                                    <div key={i} className="w-6 h-6 rounded bg-[var(--viz-amber)]/20 border border-[var(--viz-amber)] flex items-center justify-center text-[10px] font-bold text-[var(--viz-amber)]">{n}</div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-[8px] font-black uppercase text-muted-foreground/50">Path 2 (Target {target2})</span>
                            <div className="flex gap-2">
                                {currentStep.path2.map((n, i) => (
                                    <div key={i} className="w-6 h-6 rounded bg-[var(--viz-cyan)]/20 border border-[var(--viz-cyan)] flex items-center justify-center text-[10px] font-bold text-[var(--viz-cyan)]">{n}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-3 md:p-6 bg-muted/20 rounded-[2rem]">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2 mb-4">
                        <Search size={14}/> Convergence
                    </h3>
                    <div className="p-4 bg-card rounded-xl border border-border text-center">
                        <span className="text-[8px] font-black uppercase text-muted-foreground/50 block mb-1">Resulting LCA</span>
                        <span className="text-2xl font-black font-mono text-[var(--viz-rose)]">{currentStep.lca !== null ? currentStep.lca : "?"}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-4 p-3 md:p-6 bg-muted/30 rounded-[2.5rem] flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Step {currentIndex + 1} / {history.length}</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => setCurrentIndex(Math.min(history.length - 1, currentIndex + 1))} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronRight size={18} /></button>
                </div>
            </div>
            <div className="text-center text-[11px] font-mono text-[var(--viz-amber)] bg-card/50 py-2 rounded-xl border border-border/50 shadow-inner">
                {currentStep.message}
            </div>
        </div>
      </div>
    </div>
  );
}


