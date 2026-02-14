"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Hash, Search, Zap, 
  Hammer, Edit3, Target,
  ArrowUp, Activity, Database, ChevronLeft, ChevronRight, Cpu
} from "lucide-react";

// Professional Palette
const MANIM_COLORS = { 
  text: "var(--foreground)", 
  background: "var(--card)",
  blue: "var(--viz-lavender)",
  green: "var(--viz-green)",
  gold: "var(--viz-cyan)",
  red: "var(--viz-rose)",
  purple: "var(--viz-lavender)"
};

interface VisualNode {
  id: string;
  nodeIdx: number;
  value: number;
  start: number;
  end: number;
  x: number;
  y: number;
  parentId: string | null;
  status: 'idle' | 'highlighted' | 'contributing' | 'updating';
  visible: boolean;
}

interface HistoryStep {
  nodes: VisualNode[];
  message: string;
  step: string;
  highlightedId: string | null;
  activeRange: [number, number] | null;
  queryResult?: number | null;
  logs: string[];
}

export default function SegmentTreeVisualizer({ speed = 800 }: { speed?: number }) {
  const [arrayInput, setArrayInput] = useState("1, 3, 5, 7, 9, 11");
  const [arrayData, setArrayData] = useState([1, 3, 5, 7, 9, 11]);
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [queryL, setQueryL] = useState("1");
  const [queryR, setQueryR] = useState("4");
  const [updateIdx, setUpdateIdx] = useState("2");
  const [updateVal, setUpdateVal] = useState("10");
  const [treeMode, setTreeMode] = useState<'SUM' | 'MIN' | 'MAX'>('SUM');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Coordinate Sync
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // ... (getMergeFn, getIdentity, getOpName omitted for brevity but they are above getLayout)

  // --- Layout Algorithm ---
  const getLayout = useCallback((tree: (number | null)[], n: number) => {
    const visualNodes: VisualNode[] = [];
    const width = dimensions.width - 100; // Padding
    const leafSpacing = n > 1 ? width / (n - 1) : 0;
    const startX = (dimensions.width - width) / 2;

    const traverse = (node: number, start: number, end: number, depth: number): number => {
      const id = `node-${node}`;
      const rawVal = tree[node];
      
      // Calculate X coordinate
      let x = 0;
      if (start === end) {
        // Leaf Position
        x = startX + start * leafSpacing;
      } else {
        const mid = Math.floor((start + end) / 2);
        const leftX = traverse(2 * node, start, mid, depth + 1);
        const rightX = traverse(2 * node + 1, mid + 1, end, depth + 1);
        x = (leftX + rightX) / 2;
      }

      const y = 60 + depth * 80;
      const isVisible = rawVal !== null;
      
      visualNodes.push({ 
        id, 
        nodeIdx: node, 
        value: rawVal ?? 0, 
        start, 
        end, 
        x, 
        y, 
        parentId: node === 1 ? null : `node-${Math.floor(node / 2)}`,
        status: 'idle', 
        visible: isVisible 
      });

      return x;
    };

    if (n > 0) {
      traverse(1, 0, n - 1, 0);
    }
    return visualNodes;
  }, [dimensions.width]);

  // --- Data Logic ---
  // ... currentTree and recordOperation ...

  // Playback Control
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

  const currentStep = useMemo(() => {
    return history[currentIndex] || { 
      nodes: getLayout(currentTree, arrayData.length), 
      message: "RSQ Engine idle. Awaiting manifold operation.", 
      step: "IDLE", 
      highlightedId: null, 
      activeRange: null,
      logs: [] 
    };
  }, [history, currentIndex, getLayout, arrayData.length]);

  // --- Dynamic Fit-to-Screen Logic ---
  const viewTransform = useMemo(() => {
    if (currentStep.nodes.length === 0) {
        return { x: 0, y: 0, scale: 1 };
    }

    const PADDING = 80;
    const NODE_RADIUS = 30;
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    currentStep.nodes.forEach(node => {
        if (!node.visible) return;
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y);
    });

    if (minX === Infinity) return { x: 0, y: 0, scale: 1 }; 

    minX -= NODE_RADIUS; maxX += NODE_RADIUS;
    minY -= NODE_RADIUS; maxY += NODE_RADIUS;

    const treeWidth = maxX - minX;
    const treeHeight = maxY - minY;

    const availWidth = dimensions.width - PADDING;
    const availHeight = dimensions.height - PADDING;

    let newScale = Math.min(availWidth / treeWidth, availHeight / treeHeight);
    newScale = Math.min(Math.max(newScale, 0.1), 1.1);

    const treeCenterX = minX + treeWidth / 2;
    const treeCenterY = minY + treeHeight / 2;
    
    const containerCenterX = dimensions.width / 2;
    const containerCenterY = dimensions.height / 2;

    const newX = containerCenterX - (treeCenterX * newScale);
    const newY = containerCenterY - (treeCenterY * newScale);
    
    return { x: newX, y: newY, scale: newScale };

  }, [currentStep.nodes, dimensions]);


  const getLineCoords = (u: VisualNode, v: VisualNode) => {
    const dx = v.x - u.x;
    const dy = v.y - u.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const radius = 24;
    return {
        x1: u.x + (dx / dist) * radius,
        y1: u.y + (dy / dist) * radius,
        x2: v.x - (dx / dist) * radius,
        y2: v.y - (dy / dist) * radius
    };
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="p-8 bg-[var(--card)] rounded-3xl shadow-2xl font-sans text-foreground relative overflow-hidden">
        {/* Grid Backdrop */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        {/* Header UI */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 relative z-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[var(--viz-lavender)]">
              Segment <span className="text-muted-foreground/40">Lemma Engine</span>
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-1 w-12 bg-[var(--viz-lavender)] rounded-full" />
               <div className="flex bg-muted p-1 rounded-lg ">
                  {(['SUM', 'MIN', 'MAX'] as const).map((mode) => (
                    <button 
                        key={mode}
                        onClick={() => { setTreeMode(mode); setHistory([]); setCurrentIndex(0); }}
                        className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${treeMode === mode ? "bg-[var(--viz-lavender)] text-black" : "text-muted-foreground/40"}`}
                    >
                        {mode}
                    </button>
                  ))}
               </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-muted p-2 rounded-2xl ">
                <input value={arrayInput} onChange={e=>setArrayInput(e.target.value)} className="w-24 bg-transparent text-center font-mono text-xs font-bold text-[var(--viz-cyan)] focus:outline-none" placeholder="1,2,3..." />
                <button onClick={() => {
                     const arr = arrayInput.split(',').map(Number).filter(n => !isNaN(n));
                     if(arr.length > 0) { setArrayData(arr); setHistory([]); recordOperation('BUILD'); }
                }} className="p-2 hover:bg-white/5 rounded-xl text-xs font-bold text-foreground transition-all flex items-center gap-2 px-3 "><Hammer size={14}/> BUILD</button>
            </div>
            
            <div className="flex items-center gap-2 bg-muted p-2 rounded-2xl  shadow-inner">
                <input type="number" value={queryL} onChange={e=>setQueryL(e.target.value)} className="w-8 bg-transparent text-center font-mono text-xs font-bold text-[var(--viz-lavender)] focus:outline-none" />
                <span className="text-muted-foreground/20">-</span>
                <input type="number" value={queryR} onChange={e=>setQueryR(e.target.value)} className="w-8 bg-transparent text-center font-mono text-xs font-bold text-[var(--viz-lavender)] focus:outline-none" />
                <button onClick={() => recordOperation('QUERY')} className="p-2 hover:bg-[var(--viz-lavender)]/10 rounded-xl text-[var(--viz-lavender)]" title="Query Range"><Search size={18}/></button>
            </div>

            <div className="flex items-center gap-2 bg-muted p-2 rounded-2xl  shadow-inner">
                <input type="number" value={updateIdx} onChange={e=>setUpdateIdx(e.target.value)} className="w-8 bg-transparent text-center font-mono text-xs font-bold text-[var(--viz-green)] focus:outline-none" />
                <span className="text-muted-foreground/20">=</span>
                <input type="number" value={updateVal} onChange={e=>setUpdateVal(e.target.value)} className="w-8 bg-transparent text-center font-mono text-xs font-bold text-[var(--viz-green)] focus:outline-none" />
                <button onClick={() => recordOperation('UPDATE')} className="p-2 hover:bg-[var(--viz-green)]/10 rounded-xl text-[var(--viz-green)]" title="Update Index"><Edit3 size={18}/></button>
            </div>
          </div>
        </div>

        {/* Visual Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div ref={containerRef} className="lg:col-span-3 relative min-h-[520px] bg-muted/40 rounded-[2.5rem]  overflow-hidden shadow-inner flex flex-col items-center justify-center">
                
                {/* Logic Step Badge */}
                <AnimatePresence>
                    {currentStep.step !== "IDLE" && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-8 left-10 flex items-center gap-2 px-4 py-2 bg-[var(--viz-lavender)]/10 border border-[var(--viz-lavender)]/30 rounded-full z-30">
                            <Zap size={12} className="text-[var(--viz-lavender)]" />
                            <span className="text-[9px] font-black font-mono text-[var(--viz-lavender)] uppercase tracking-[0.2em]">{currentStep.step}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Explanation Box */}
                <AnimatePresence mode="wait">
                    <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-12 w-full max-w-[400px] px-10 text-center z-30 flex flex-col items-center gap-4">
                        {currentStep.queryResult !== undefined && currentStep.queryResult !== null && (
                            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="px-6 py-2 bg-[var(--viz-cyan)] text-black font-black rounded-xl shadow-lg border border-white/20 flex items-center gap-3">
                                <Target size={18}/> RESULT: {currentStep.queryResult}
                            </motion.div>
                        )}
                        <div className="p-4 bg-card/80  rounded-2xl backdrop-blur-md shadow-2xl">
                            <p className="text-[10px] text-[var(--viz-cyan)] font-mono italic uppercase tracking-tighter">{currentStep.message}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Scalable Container for Tree */}
                <motion.div 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    animate={{ 
                        x: viewTransform.x, 
                        y: viewTransform.y, 
                        scale: viewTransform.scale 
                    }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    style={{ transformOrigin: "0px 0px" }}
                >
                    {/* SVG Layer */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                        {currentStep.nodes.map(node => {
                            if (!node.parentId) return null;
                            const parent = currentStep.nodes.find(n => n.id === node.parentId);
                            if (!parent || !node.visible || !parent.visible) return null;
                            const { x1, y1, x2, y2 } = getLineCoords(parent, node);
                            return (
                                <motion.line
                                    key={`link-${node.id}`}
                                    x1={x1} y1={y1} x2={x2} y2={y2}
                                    stroke="currentColor"
                                    className="text-muted-foreground/10"
                                    strokeWidth="2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                            );
                        })}
                    </svg>

                    {/* Nodes Layer */}
                    <div className="absolute inset-0 w-full h-full pointer-events-auto">
                        {currentStep.nodes.map(node => {
                            const isA = node.status === 'highlighted';
                            const isC = node.status === 'contributing';
                            const isU = node.status === 'updating';

                            if (!node.visible) return null;

                            return (
                                <motion.div
                                    key={node.id}
                                    initial={{ x: node.x - 24, y: node.y - 24, scale: 0 }}
                                    animate={{ 
                                        x: node.x - 24, 
                                        y: node.y - 24,
                                        opacity: node.visible ? 1 : 0,
                                        backgroundColor: isC ? MANIM_COLORS.green : isU ? MANIM_COLORS.red : isA ? MANIM_COLORS.blue : "var(--card)",
                                        borderColor: isC ? MANIM_COLORS.green : isU ? MANIM_COLORS.red : isA ? MANIM_COLORS.blue : "var(--border)",
                                        scale: isC || isU || isA ? 1.15 : 1,
                                        boxShadow: isC ? `0 0 30px ${MANIM_COLORS.green}44` : isU ? `0 0 30px ${MANIM_COLORS.red}44` : isA ? `0 0 20px ${MANIM_COLORS.blue}33` : "none"
                                    }}
                                    transition={{ type: "spring", stiffness: 150, damping: 25 }}
                                    className="absolute w-12 h-12 border-2 rounded-xl z-20 flex flex-col items-center justify-center font-mono shadow-lg"
                                >
                                    <span className={`text-xs font-black ${isC || isU || isA ? "text-black" : "text-foreground"}`}>{node.value}</span>
                                    <span className="text-[6px] opacity-30 uppercase tracking-tighter">[{node.start}-{node.end}]</span>
                                    {isA && (
                                        <motion.div layoutId="ptr" className="absolute -top-10 flex flex-col items-center">
                                            <ArrowUp size={14} className="text-[var(--viz-lavender)]" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Sidebar: Log & Array Map */}
            <div className="flex flex-col gap-6">
                <div className="p-6 bg-muted  rounded-[2rem] flex flex-col gap-4 flex-1 h-[300px] overflow-hidden">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2">
                        <Activity size={14}/> Manifold Log
                    </h3>
                    <div className="flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-thin">
                        <AnimatePresence>
                            {currentStep.logs.map((log, i) => (
                                <motion.div
                                    key={`log-${i}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[9px] font-mono text-muted-foreground/60 flex gap-2 border-l-2 border-border pl-2 py-0.5"
                                >
                                    <span className="text-[var(--viz-lavender)]">»</span>
                                    {log}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {currentStep.logs.length === 0 && <span className="text-[9px] italic text-muted-foreground/20 text-center py-8">Idle...</span>}
                    </div>
                </div>

                <div className="p-6 bg-muted  rounded-[2rem]">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest mb-4 flex items-center gap-2">
                        <Database size={14}/> Memory Array
                    </h3>
                    <div className="flex flex-wrap gap-1 justify-center">
                        {arrayData.map((val, i) => {
                            const inRange = currentStep.activeRange && i >= currentStep.activeRange[0] && i <= currentStep.activeRange[1];
                            return (
                                <motion.div 
                                    key={`arr-${i}`}
                                    animate={{ 
                                        backgroundColor: inRange ? `${MANIM_COLORS.blue}15` : "var(--card)",
                                        borderColor: inRange ? MANIM_COLORS.blue : "var(--border)",
                                        color: inRange ? MANIM_COLORS.blue : "var(--foreground)"
                                    }}
                                    className="w-8 h-8 rounded border flex flex-col items-center justify-center font-mono text-[9px] font-black"
                                >
                                    {val}
                                    <span className="text-[5px] opacity-30">{i}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>

        {/* Scrubber UI */}
        <div className="mt-8 p-6 bg-muted  rounded-[2.5rem] flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Hash size={14} className="text-[var(--viz-cyan)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Lemma Sequence {currentIndex + 1} of {history.length || 1}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider">
                <div className="absolute w-full h-1 bg-background/10 rounded-full" />
                <div className="absolute h-1 bg-[var(--viz-lavender)] rounded-full shadow-[0_0_10px_var(--viz-lavender)44]" style={{ width: `${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}%` }} />
                <input 
                    type="range" min="0" max={(history.length || 1) - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute w-1.5 h-4 bg-[var(--viz-cyan)] rounded-full shadow-[0_0_15px_var(--viz-cyan)] pointer-events-none transition-all"
                    style={{ left: `calc(${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}% - 3px)` }}
                />
            </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-10 py-6 bg-muted/20  rounded-[2.5rem] flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Captured segment</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-rose)]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Active update</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-lavender)]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Recursive probe</span></div>
         <div className="flex items-center gap-3"><Cpu size={14} className="text-muted-foreground/20" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Utility Manifold</span></div>
      </div>
    </div>
  );
}
