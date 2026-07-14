"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, ChevronLeft, ChevronRight, 
  Activity, Hash, Layers, Target, RefreshCw, Info, Calculator
} from "lucide-react";

type NodePos = { id: number; x: number; y: number };

interface RerootingStep {
  activeNode: number | null;
  activeEdge: [number, number] | null;
  currentRoot: number;
  dpIn: number[];
  finalAns: number[];
  sizes: number[];
  message: string;
  step: string;
  pass: "INIT" | "PASS1" | "PASS2" | "DONE";
  formula?: {
    u: number;
    v: number;
    valU: number;
    sizeV: number;
    totalN: number;
    res: number;
  };
}

export default function RerootingVisualizer({ speed = 800 }: { speed?: number }) {  
  const vizRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Tree State
  const [n, setN] = useState(6);
  const [edges, setEdges] = useState<[number, number][]>([
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5]
  ]);

  const generateRandomTree = useCallback(() => {
    const newN = Math.floor(Math.random() * 2) + 5; // 5 to 6 nodes for clarity
    const newEdges: [number, number][] = [];
    for (let i = 1; i < newN; i++) {
      const parent = Math.floor(Math.random() * i);
      newEdges.push([parent, i]);
    }
    setN(newN);
    setEdges(newEdges);
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const adj: number[][] = useMemo(() => {
    const a: number[][] = Array.from({ length: n }, () => []);
    edges.forEach(([u, v]) => {
      a[u].push(v);
      a[v].push(u);
    });
    return a;
  }, [edges, n]);

  useEffect(() => {
    if (!vizRef.current) return;
    const updateSize = () => {
      if (vizRef.current) {
        setDimensions({ width: vizRef.current.offsetWidth, height: vizRef.current.offsetHeight });
      }
    };
    const observer = new ResizeObserver(updateSize);
    observer.observe(vizRef.current);
    updateSize();
    return () => observer.disconnect();
  }, []);

  const history = useMemo(() => {
    const steps: RerootingStep[] = [];
    const dpIn = new Array(n).fill(0);
    const finalAns = new Array(n).fill(0);
    const size = new Array(n).fill(0);

    const record = (
      node: number | null, edge: [number, number] | null, root: number,
      msg: string, phase: string, pass: "INIT" | "PASS1" | "PASS2" | "DONE",
      formula?: RerootingStep["formula"]
    ) => {
      steps.push({
        activeNode: node, activeEdge: edge, currentRoot: root,
        dpIn: [...dpIn], finalAns: [...finalAns], sizes: [...size],
        message: msg, step: phase, pass, formula
      });
    };

    // Precompute sizes for the fixed root 0
    const computeSizes = (u: number, p: number) => {
      size[u] = 1;
      for (const v of adj[u]) {
        if (v === p) continue;
        computeSizes(v, u);
        size[u] += size[v];
      }
    };
    computeSizes(0, -1);

    record(null, null, 0, "Phase 1: Bottom-up DFS to compute subtree sum of distances.", "Bottom-Up Pass", "INIT");

    const dfs1 = (u: number, p: number) => {
      record(u, p !== -1 ? [p, u] : null, 0, `Visiting ${u}. Subtree size is ${size[u]}.`, "Pass 1: Subtree DP", "PASS1");
      for (const v of adj[u]) {
        if (v === p) continue;
        dfs1(v, u);
        dpIn[u] += dpIn[v] + size[v];
        record(u, [u, v], 0, `Added contribution from child ${v}: dp[${v}] + size[${v}]`, "Pass 1: Subtree DP", "PASS1");
      }
    };

    dfs1(0, -1);
    finalAns[0] = dpIn[0];
    record(0, null, 0, `Root 0 global sum established as ${finalAns[0]}.`, "Transition", "PASS1");

    const dfs2 = (u: number, p: number) => {
      for (const v of adj[u]) {
        if (v === p) continue;
        const res = finalAns[u] - size[v] + (n - size[v]);
        const f = { u, v, valU: finalAns[u], sizeV: size[v], totalN: n, res };
        finalAns[v] = res;
        record(v, [u, v], v, `Rerooting ${u} \u2192 ${v}. Re-calculating global answer for node ${v}.`, "Pass 2: Rerooting", "PASS2", f);
        dfs2(v, u);
      }
    };

    dfs2(0, -1);
    record(null, null, 0, "Algorithm complete. Global answers found for all nodes.", "Done", "DONE");
    return steps;
  }, [adj, n]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= history.length - 1) { setIsPlaying(false); return prev; }
          return prev + 1;
        });
      }, speed);
    } else if (timerRef.current) { clearInterval(timerRef.current); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, history.length, speed]);

  const currentStep = history[currentIndex] || history[0];

  const layoutNodes = useMemo(() => {
    const { width, height } = dimensions;
    if (width === 0) return [];
    const rootId = currentStep.currentRoot;
    const positions: NodePos[] = [];
    const vGap = height * 0.18;
    const startY = height * 0.15;

    const compute = (u: number, p: number, level: number, left: number, right: number) => {
      const x = (left + right) / 2;
      const y = startY + level * vGap;
      positions.push({ id: u, x, y });
      const children = adj[u].filter(v => v !== p);
      if (children.length === 0) return;
      const segment = (right - left) / children.length;
      children.forEach((v, i) => compute(v, u, level + 1, left + i * segment, left + (i + 1) * segment));
    };

    compute(rootId, -1, 0, 0, width);
    return positions.sort((a, b) => a.id - b.id);
  }, [dimensions, currentStep.currentRoot, adj]);

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="p-4 md:p-8 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 relative z-10 gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[var(--viz-purple)]">
              Rerooting <span className="text-[var(--muted-foreground)]/40">Explained</span>
            </h2>
            <div className="flex items-center gap-2">
               <div className="h-1 w-12 bg-[var(--viz-purple)] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)]/40">Step-by-step All-Root DP</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-[var(--muted)] p-2 rounded-2xl border border-[var(--border)] shadow-inner w-full md:w-auto">
            <button onClick={generateRandomTree} className="p-2 hover:bg-[var(--accent)] rounded-xl text-[var(--viz-purple)] active:scale-95 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><RefreshCw size={14} /> Randomize</button>
            <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />
            <button onClick={() => { setIsPlaying(false); setCurrentIndex(0); }} className="p-2 hover:bg-[var(--accent)] rounded-xl text-[var(--muted-foreground)] active:scale-95 transition-all"><RotateCcw size={18} /></button>
            {!isPlaying ? (
              <button onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(true); }} className="px-6 py-2 bg-[var(--viz-purple)] text-[var(--background)] rounded-xl hover:scale-105 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2"><Play size={14} fill="currentColor" /> START</button>
            ) : (
              <button onClick={() => setIsPlaying(false)} className="px-6 py-2 bg-[var(--viz-rose)]/20 text-[var(--viz-rose)] border border-[var(--viz-rose)]/50 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><Pause size={14} fill="currentColor" /> PAUSE</button>
            )}
          </div>
        </div>

        <div className="relative h-[450px] md:h-[550px] bg-[var(--muted)]/30 rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-inner w-full" ref={vizRef}>
            {/* Legend & Status */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 md:top-8 md:left-8 flex flex-col gap-3 z-30 pointer-events-none">
                <motion.div key={currentStep.pass} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 px-4 py-2 bg-[var(--card)]/60 border border-[var(--border)] rounded-full shadow-lg w-fit backdrop-blur-md">
                    <Layers size={14} className={currentStep.pass === "PASS1" ? "text-[var(--viz-cyan)]" : currentStep.pass === "PASS2" ? "text-[var(--viz-rose)]" : "text-[var(--viz-purple)]"} />
                    <span className="text-[10px] font-black font-mono uppercase tracking-[0.2em]" style={{ color: currentStep.pass === "PASS1" ? "var(--viz-cyan)" : currentStep.pass === "PASS2" ? "var(--viz-rose)" : "var(--viz-purple)" }}>{currentStep.step}</span>
                </motion.div>
            </div>

            {/* Top Right Formula Card - Semi Transparent Glass Morph */}
            <div className="absolute top-6 right-6 md:top-8 md:right-8 z-40 pointer-events-none max-w-[200px] md:max-w-[260px]">
                <AnimatePresence>
                  {currentStep.formula && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, x: 10 }} 
                      animate={{ opacity: 1, y: 0, x: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }} 
                      className="p-3 md:p-4 bg-[var(--card)]/30 border border-white/10 rounded-2xl shadow-xl backdrop-blur-lg border-l-4 border-l-[var(--viz-rose)]"
                    >
                      <div className="flex items-center gap-2 mb-2 text-[var(--viz-rose)]/80">
                        <Calculator size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Transition Math</span>
                      </div>
                      <div className="font-mono text-[10px] space-y-2 text-[var(--foreground)]/80">
                        <div className="flex justify-between border-b border-white/5 pb-1 mb-1">
                          <span>Parent {currentStep.formula.u} Ans</span>
                          <span className="font-bold text-[var(--viz-purple)]">{currentStep.formula.valU}</span>
                        </div>
                        <div className="text-[9px] text-[var(--muted-foreground)] italic leading-tight mb-2 opacity-60">
                          ans[v] = ans[u] - sz[v] + (N - sz[v])
                        </div>
                        <div className="flex flex-wrap items-center gap-1 text-[11px] font-bold">
                          <span className="text-[var(--viz-rose)]">{currentStep.formula.res}</span>
                          <span className="opacity-40">=</span>
                          <span>{currentStep.formula.valU}</span>
                          <span className="text-red-400/60">-</span>
                          <span>{currentStep.formula.sizeV}</span>
                          <span className="text-green-400/60">+</span>
                          <span>({currentStep.formula.totalN - currentStep.formula.sizeV})</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>

            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {edges.map(([u, v]) => {
                    const nu = layoutNodes.find(n => n.id === u);
                    const nv = layoutNodes.find(n => n.id === v);
                    if (!nu || !nv) return null;
                    const isActive = currentStep.activeEdge && ((currentStep.activeEdge[0] === u && currentStep.activeEdge[1] === v) || (currentStep.activeEdge[0] === v && currentStep.activeEdge[1] === u));
                    return (
                        <motion.line
                            key={`edge-${u}-${v}`}
                            animate={{
                                x1: nu.x, y1: nu.y, x2: nv.x, y2: nv.y,
                                stroke: isActive ? "var(--viz-purple)" : "var(--border)",
                                strokeWidth: isActive ? 4 : 1.5,
                                opacity: 0.6
                            }}
                            transition={{ type: "spring", stiffness: 100, damping: 25 }}
                        />
                    );
                })}
            </svg>

            {layoutNodes.map((node) => {
                const isActive = currentStep.activeNode === node.id;
                const isRoot = currentStep.currentRoot === node.id;
                
                return (
                    <motion.div
                        key={`node-${node.id}`}
                        className="absolute w-10 h-10 md:w-12 md:h-12 rounded-2xl border-2 z-20 flex flex-col items-center justify-center font-mono left-0 top-0"
                        animate={{
                            x: node.x - (dimensions.width < 768 ? 20 : 24),
                            y: node.y - (dimensions.width < 768 ? 20 : 24),
                            scale: isActive ? 1.2 : isRoot ? 1.1 : 1,
                            backgroundColor: isActive ? "var(--viz-purple)" : isRoot ? "rgba(var(--viz-purple-rgb), 0.1)" : "var(--card)",
                            borderColor: isActive ? "var(--viz-purple)" : isRoot ? "var(--viz-purple)" : "var(--border)",
                            boxShadow: isActive ? "0 0 40px rgba(var(--viz-purple-rgb), 0.5)" : "none"
                        }}
                        transition={{ type: "spring", stiffness: 200, damping: 28 }}
                    >
                        <span className={`text-xs md:text-sm font-bold ${isActive ? "text-background" : "text-foreground"}`}>{node.id}</span>
                        
                        <AnimatePresence>
                        {currentStep.pass !== "INIT" && (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute -bottom-10 whitespace-nowrap text-[8px] md:text-[9px] font-mono font-bold px-2 py-1 rounded-md bg-background/90 border border-border shadow-md flex flex-col items-center">
                                <div className="flex gap-2">
                                  <span className="text-[var(--viz-cyan)]">sz:{currentStep.sizes[node.id]}</span>
                                  {currentStep.finalAns[node.id] > 0 && <span className="text-[var(--viz-rose)]">ans:{currentStep.finalAns[node.id]}</span>}
                                </div>
                                {currentStep.pass === "PASS1" && currentStep.dpIn[node.id] > 0 && (
                                  <span className="text-[var(--viz-blue)] text-[7px] mt-0.5">subtree:{currentStep.dpIn[node.id]}</span>
                                )}
                            </motion.div>
                        )}
                        </AnimatePresence>

                        {isRoot && (
                            <motion.div layoutId="root-badge" className="absolute -top-1.5 -right-1.5">
                                <div className="bg-[var(--viz-purple)] text-white p-1 rounded-full shadow-lg"><Target size={10} /></div>
                            </motion.div>
                        )}
                    </motion.div>
                );
            })}

            <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-6 left-0 right-0 px-4 flex justify-center z-30 pointer-events-none">
                    <div className="p-3 md:p-4 bg-[var(--card)]/95 border border-[var(--border)] rounded-2xl backdrop-blur-md shadow-2xl max-w-[450px] w-full text-center">
                        <div className="flex items-center justify-center gap-2 mb-1 opacity-40">
                            <Info size={10} className="text-[var(--viz-purple)]" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Logic Breakdown</span>
                        </div>
                        <p className="text-[10px] md:text-xs text-[var(--foreground)] font-mono leading-tight">{currentStep.message}</p>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>

        <div className="mt-8 p-4 md:p-3 md:p-6 bg-[var(--muted)] border border-[var(--border)] rounded-[2rem] flex flex-col gap-4 relative z-10 shadow-inner">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 px-2">
                <div className="flex items-center gap-2 md:gap-3">
                    <Hash size={14} className="text-[var(--viz-purple)]" />        
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Step {currentIndex + 1} / {history.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all"><ChevronLeft size={16} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all"><ChevronRight size={16} /></button>
                </div>
            </div>
            
            <div className="relative flex items-center group/slider px-2">
                <div className="absolute left-2 right-2 h-1 bg-[var(--background)]/10 rounded-full" />
                <div className="absolute left-2 h-1 bg-[var(--viz-purple)] rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(var(--viz-purple-rgb),0.3)]" style={{ width: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 16px)` }} />
                <input 
                    type="range" min="0" max={history.length - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
            </div>
        </div>
      </div>
    </div>
  );
}


