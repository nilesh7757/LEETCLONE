"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, 
  ChevronLeft, ChevronRight, ListTree,
  Layers, Cpu
} from "lucide-react";

// Professional Palette - High Fidelity
const MANIM_COLORS = { 
  blue: "var(--viz-lavender)",
  green: "var(--viz-green)",
  gold: "var(--viz-cyan)",
  red: "var(--viz-rose)",
  purple: "var(--viz-lavender)",
  cyan: "#4FD1C5"
};

interface VisualNode {
  id: string;
  value: number;
  x: number;
  y: number;
  parentId: string | null;
  status: 'idle' | 'visiting' | 'active' | 'processed';
}

interface TraversalStep {
  nodes: VisualNode[];
  traversedOrder: number[];
  stack: number[];
  message: string;
  stepType: string;
  activeId: string | null;
  activeX: number;
  activeY: number;
  logs: string[];
}

class TreeNode {
  value: number;
  id: string;
  left: TreeNode | null = null;
  right: TreeNode | null = null;

  constructor(value: number) {
    this.value = value;
    this.id = `node-${Math.random().toString(36).substring(2, 9)}`;
  }
}

export default function TreeTraversalVisualizer({ speed = 800 }: { speed?: number }) {
  const [treeRoot] = useState<TreeNode>(() => {
    const root = new TreeNode(1);
    root.left = new TreeNode(2);
    root.right = new TreeNode(3);
    root.left.left = new TreeNode(4);
    root.left.right = new TreeNode(5);
    root.right.left = new TreeNode(6);
    root.right.right = new TreeNode(7);
    return root;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'PRE' | 'IN' | 'POST'>('IN');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Responsive logic
  useEffect(() => {
    if (!containerRef.current) return;
    const updateDims = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    const observer = new ResizeObserver(updateDims);
    observer.observe(containerRef.current);
    updateDims();
    return () => observer.disconnect();
  }, []);

  const calculateLayout = React.useCallback((root: TreeNode | null) => {
    const visualNodes: VisualNode[] = [];
    const traverseNodes = (node: TreeNode | null, x: number, y: number, offset: number, parentId: string | null) => {
      if (!node) return;
      visualNodes.push({ id: node.id, value: node.value, x, y, parentId, status: 'idle' });
      const nextOffset = offset * 0.5;
      traverseNodes(node.left, x - offset, y + 85, nextOffset, node.id);
      traverseNodes(node.right, x + offset, y + 85, nextOffset, node.id);
    };
    traverseNodes(root, dimensions.width / 2, 60, dimensions.width / 4, null);
    return visualNodes;
  }, [dimensions.width]);

  // Algorithm Simulation
  const history = useMemo(() => {
    if (!treeRoot) return [];
    
    const steps: TraversalStep[] = [];
    const baseNodes = calculateLayout(treeRoot);
    const resultOrder: number[] = [];
    const stack: number[] = [];
    let currentLogs: string[] = [];

    const record = (node: TreeNode, msg: string, step: string, status: VisualNode['status'], finished: boolean = false) => {
      currentLogs = [msg, ...currentLogs].slice(0, 10);
      if (finished) resultOrder.push(node.value);
      
      const vNode = baseNodes.find(n => n.id === node.id)!;
      
      steps.push({
        nodes: baseNodes.map(n => {
            let s = n.status;
            if (n.id === node.id) s = status;
            else if (resultOrder.includes(n.value)) s = 'processed';
            else if (stack.includes(n.value)) s = 'visiting';
            else s = 'idle';
            return { ...n, status: s };
        }),
        traversedOrder: [...resultOrder],
        stack: [...stack],
        message: msg,
        stepType: step,
        activeId: node.id,
        activeX: vNode.x,
        activeY: vNode.y,
        logs: [...currentLogs]
      });
    };

    const traverse = (node: TreeNode | null) => {
      if (!node) return;

      stack.push(node.value);
      
      if (mode === 'PRE') {
        record(node, `PRE-ORDER: Root Priority. Node ${node.value} localized.`, "VISIT-ACTIVE", 'active', true);
      } else {
        record(node, `Descending into Node ${node.value}...`, "DESCEND", 'visiting');
      }

      traverse(node.left);

      if (mode === 'IN') {
        record(node, `IN-ORDER: Left branch resolved. Visiting Node ${node.value}.`, "VISIT-ACTIVE", 'active', true);
      } else if (mode === 'POST') {
        record(node, `Left and Right exploration continues from Node ${node.value}.`, "RECURSE", 'visiting');
      }

      traverse(node.right);

      if (mode === 'POST') {
        record(node, `POST-ORDER: Sub-manifolds resolved. Node ${node.value} mapped.`, "VISIT-ACTIVE", 'active', true);
      }
      
      stack.pop();
      if (stack.length > 0) {
        // Find parent to return to
        const parentId = stack[stack.length-1];
        
        const findTreeNode = (root: TreeNode | null, val: number): TreeNode | null => {
            if (!root) return null;
            if (root.value === val) return root;
            return findTreeNode(root.left, val) || findTreeNode(root.right, val);
        };
        const actualParent = findTreeNode(treeRoot, parentId);
        if (actualParent) {
            record(actualParent, `Ascending from Node ${node.value} to Node ${actualParent.value}.`, "ASCEND", 'visiting');
        }
      }
    };

    traverse(treeRoot);
    steps.push({
      nodes: baseNodes.map(n => ({ ...n, status: 'processed' })),
      traversedOrder: [...resultOrder],
      stack: [],
      message: "Manifold Synthesis Complete.",
      stepType: "FINISHED",
      activeId: null,
      activeX: dimensions.width / 2,
      activeY: 60,
      logs: ["Optimal Map Generated.", ...currentLogs].slice(0, 10)
    });

    return steps;
  }, [treeRoot, mode, calculateLayout, dimensions.width]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= history.length - 1) { setIsPlaying(false); return prev; }
          return prev + 1;
        });
      }, speed);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, history.length, speed]);

  const currentStep = useMemo(() => {
    return history[currentIndex] || { 
      nodes: [], traversedOrder: [], stack: [], message: "Preparing Manifold...", stepType: "IDLE", activeId: null, activeX: dimensions.width / 2, activeY: 80, logs: [] 
    };
  }, [history, currentIndex, dimensions.width]);

  return (
    <div className="flex flex-col gap-4 select-none font-sans p-4 md:p-6 bg-background">
      {/* Academy Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-6 relative z-10 gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-light tracking-tight text-[var(--viz-lavender)]">
            Tree <span className="text-muted-foreground/40">Manifold Traversal</span>
          </h2>
          <div className="flex items-center gap-3">
             <div className="h-1 w-12 bg-[var(--viz-lavender)] rounded-full shadow-[0_0_10px_var(--viz-lavender)]" />
             <div className="flex bg-muted/50 p-1 rounded-lg  shadow-inner">
                {(['PRE', 'IN', 'POST'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setMode(t); setHistory([]); setCurrentIndex(0); }}
                    className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${mode === t ? "bg-[var(--viz-lavender)] text-black shadow-lg scale-105" : "text-muted-foreground/40 hover:text-muted-foreground"}`}
                  >
                    {t === 'PRE' ? 'Pre' : t === 'IN' ? 'In' : 'Post'} Order
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-2xl  shadow-inner">
          <button onClick={() => { setCurrentIndex(0); setIsPlaying(false); }} className="p-3 bg-card hover:bg-white/5 rounded-xl  transition-all text-muted-foreground hover:text-foreground shadow-sm active:scale-95">
            <RotateCcw size={20}/>
          </button>
          <div className="w-[1px] h-10 bg-border mx-1" />
          <button 
            onClick={() => {
              if (currentIndex >= history.length - 1) setCurrentIndex(0);
              setIsPlaying(!isPlaying);
            }} 
            className={`flex items-center gap-3 px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
              isPlaying ? "bg-[var(--viz-rose)]/20 text-[var(--viz-rose)] border border-[var(--viz-rose)]/30" : "bg-[var(--viz-lavender)] text-black hover:shadow-[var(--viz-lavender)]/20"
            }`}
          >
            {isPlaying ? <><Pause size={18} fill="currentColor" /> HALT</> : <><Play size={18} fill="currentColor" /> EXECUTE</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Engine - Main Canvas */}
        <div ref={containerRef} className="lg:col-span-8 relative min-h-[450px] bg-muted/10 rounded-[3rem]  overflow-hidden shadow-inner flex items-center justify-center p-10">
          
          {/* Manim Grid Backdrop */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
               style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />

          {/* Real-time Status */}
          <div className="absolute top-8 left-10 flex flex-col gap-4 z-30">
            <AnimatePresence>
              {currentStep.stepType !== "IDLE" && (
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex items-center gap-3 px-5 py-2.5 bg-card/80 backdrop-blur-xl  rounded-2xl shadow-xl">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-lavender)] animate-pulse shadow-[0_0_10px_var(--viz-lavender)]" />
                  <span className="text-[10px] font-black font-mono text-[var(--viz-lavender)] uppercase tracking-[0.3em]">{currentStep.stepType}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Narrative Prompt */}
          <AnimatePresence mode="wait">
              <motion.div key={currentIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute bottom-10 w-full max-w-[500px] px-10 text-center z-30 pointer-events-none">
                  <div className="p-5 bg-card/90  rounded-3xl backdrop-blur-md shadow-2xl">
                      <p className="text-[11px] text-[var(--viz-cyan)] font-mono leading-relaxed italic uppercase tracking-tighter">{currentStep.message}</p>
                  </div>
              </motion.div>
          </AnimatePresence>

          {/* Tree Structure Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}>
            {(currentStep.nodes || []).map(node => {
              if (!node.parentId) return null;
              const parent = currentStep.nodes.find(n => n.id === node.parentId);
              if (!parent) return null;
              
              const isPathActive = (node.id === currentStep.activeId && node.status !== 'processed') || (parent.id === currentStep.activeId && node.status === 'visiting');
              const isMapped = node.status === 'processed' || node.status === 'active';
              
              return (
                <g key={`edge-group-${node.id}`}>
                    <motion.line 
                        initial={false}
                        animate={{
                            stroke: isMapped ? MANIM_COLORS.blue : isPathActive ? MANIM_COLORS.gold : "var(--border)",
                            strokeWidth: isPathActive ? 4 : isMapped ? 2 : 1,
                            opacity: isMapped ? 0.6 : isPathActive ? 1 : 0.3,
                        }}
                        x1={parent.x} y1={parent.y} x2={node.x} y2={node.y} 
                        strokeDasharray={isMapped ? "0" : "6 4"}
                        transition={{ duration: 0.4 }}
                    />
                    {isPathActive && (
                        <motion.circle 
                            r="4" fill={MANIM_COLORS.gold}
                            animate={{
                                cx: [parent.x, node.x],
                                cy: [parent.y, node.y]
                            }}
                            transition={{ 
                                duration: speed / 1000, 
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="shadow-[0_0_15px_var(--viz-cyan)]"
                        />
                    )}
                </g>
              );
            })}
          </svg>

          {/* The Manifold Nodes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {(currentStep.nodes || []).map((node) => {
              const isActive = node.id === currentStep.activeId;
              const isStackNode = (currentStep.stack || []).includes(node.value);
              const isProcessed = node.status === 'processed' || node.status === 'active';

              return (
                <motion.div
                  key={node.id}
                  initial={false}
                  animate={{
                    x: node.x,
                    y: node.y,
                    scale: isActive ? 1.4 : isStackNode ? 1.15 : 1,
                    backgroundColor: isActive ? MANIM_COLORS.gold : isStackNode ? MANIM_COLORS.purple + '33' : isProcessed ? MANIM_COLORS.blue + '11' : 'var(--card)',
                    borderColor: isActive ? MANIM_COLORS.gold : isStackNode ? MANIM_COLORS.purple : isProcessed ? MANIM_COLORS.blue : "var(--border)",
                    borderWidth: isActive || isStackNode || isProcessed ? 3 : 1,
                    boxShadow: isActive ? `0 0 50px ${MANIM_COLORS.gold}88` : isStackNode ? `0 0 30px ${MANIM_COLORS.purple}44` : 'none',
                    color: isActive ? "#000" : "var(--foreground)"
                  }}
                  style={{ position: 'absolute', left: 0, top: 0, translateX: '-50%', translateY: '-50%' }}
                  className="w-16 h-16 rounded-full border flex items-center justify-center transition-all duration-700 z-10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                  <span className="text-lg font-black font-mono relative z-10">{node.value}</span>
                </motion.div>
              );
            })}

            {/* The Active Traveler - Glowing Orb */}
            <motion.div 
                animate={{ x: currentStep.activeX || dimensions.width / 2, y: currentStep.activeY || 80 }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
                className="absolute w-20 h-20 rounded-full border-2 border-dashed border-[var(--viz-cyan)]/40 shadow-[0_0_60px_var(--viz-cyan)33] pointer-events-none z-20 flex items-center justify-center"
                style={{ position: 'absolute', left: 0, top: 0, translateX: '-50%', translateY: '-50%' }}
            >
                <div className="w-3 h-3 bg-[var(--viz-cyan)] rounded-full shadow-[0_0_20px_var(--viz-cyan)] animate-pulse" />
                <div className="absolute inset-0 border-2 border-white/5 rounded-full animate-spin-slow" />
            </motion.div>
          </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Recursion Stack - Depth Visualization */}
            <div className="p-8 bg-card border border-white/5 rounded-[3rem] space-y-6 backdrop-blur-3xl h-[260px] flex flex-col shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Layers size={80} className="text-[var(--viz-lavender)]" />
                </div>
                <h3 className="text-[11px] font-black uppercase text-muted-foreground/40 tracking-[0.3em] flex items-center gap-3 relative z-10">
                    <div className="w-1.5 h-4 bg-[var(--viz-lavender)] rounded-full" />
                    Recursion Stack
                </h3>
                <div className="flex-1 flex flex-col-reverse gap-3 overflow-y-auto pr-2 scrollbar-hide relative z-10">
                    <AnimatePresence mode="popLayout">
                        {(currentStep.stack || []).map((val, idx) => (
                            <motion.div
                                key={`stack-${val}-${idx}`}
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[var(--viz-lavender)]/20 to-[var(--viz-lavender)]/5 border border-[var(--viz-lavender)]/30 flex items-center justify-between px-5 shadow-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-[var(--viz-lavender)] shadow-[0_0_10px_var(--viz-lavender)]" />
                                    <span className="text-sm font-black font-mono text-[var(--viz-lavender)]">Node {val}</span>
                                </div>
                                <span className="text-[9px] font-bold text-[var(--viz-lavender)]/40 font-mono tracking-tighter">depth_{idx}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {(!currentStep.stack || currentStep.stack.length === 0) && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-10">
                            <Cpu size={32} className="mb-3" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Stack Empty</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Sequence Resolution */}
            <div className="p-8 bg-card border border-white/5 rounded-[3rem] space-y-6 backdrop-blur-3xl flex-1 flex flex-col shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                    <ListTree size={100} className="text-[var(--viz-lavender)]" />
                </div>
                <h3 className="text-[11px] font-black uppercase text-muted-foreground/40 tracking-[0.3em] flex items-center gap-3 relative z-10">
                    <div className="w-1.5 h-4 bg-[var(--viz-lavender)] rounded-full" />
                    Mapped Sequence
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                    <div className="flex flex-wrap gap-3 content-start">
                        <AnimatePresence mode="popLayout">
                            {(currentStep.traversedOrder || []).map((val, idx) => (
                            <motion.div 
                                key={`${val}-${idx}`}
                                initial={{ scale: 0, opacity: 0, rotate: -15, y: 10 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0, y: 0 }}
                                className="w-12 h-12 rounded-[1rem] bg-[var(--viz-lavender)]/10 border border-[var(--viz-lavender)]/30 flex items-center justify-center text-sm font-black text-[var(--viz-lavender)] shadow-[0_10px_20px_rgba(0,0,0,0.2)] relative overflow-hidden group hover:scale-110 transition-transform"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                                {val}
                            </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="pt-6 border-t border-white/5 relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-black/40 rounded-2xl border border-white/5 text-center shadow-inner">
                        <div className="text-[8px] font-black text-muted-foreground/30 uppercase mb-1.5 tracking-widest">Complexity</div>
                        <div className="text-sm font-black text-[var(--viz-green)] font-mono shadow-text">O(N)</div>
                      </div>
                      <div className="p-3 bg-black/40 rounded-2xl border border-white/5 text-center shadow-inner">
                        <div className="text-[8px] font-black text-muted-foreground/30 uppercase mb-1.5 tracking-widest">Depth</div>
                        <div className="text-sm font-black text-[var(--viz-cyan)] font-mono shadow-text">O(H)</div>
                      </div>
                  </div>
                </div>
            </div>
        </div>
      </div>

      {/* Controller Interface */}
      <div className="mt-6 p-8 bg-card/30 border border-white/5 rounded-[3.5rem] flex flex-col gap-8 relative z-10 backdrop-blur-2xl overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--viz-lavender)]/30 to-transparent" />
          <div className="flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-[var(--viz-cyan)]/10 rounded-2xl border border-[var(--viz-cyan)]/20 shadow-lg shadow-[var(--viz-cyan)]/5">
                    <Hash size={18} className="text-[var(--viz-cyan)]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/50">Sequence State</span>
                    <span className="text-xs font-mono text-[var(--viz-cyan)] font-bold">Frame {currentIndex + 1} <span className="mx-2 opacity-20">/</span> {history.length || 1}</span>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-muted-foreground transition-all active:scale-90 shadow-xl"><ChevronLeft size={24} /></button>
                  <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-muted-foreground transition-all active:scale-90 shadow-xl"><ChevronRight size={24} /></button>
              </div>
          </div>

          <div className="relative flex items-center group/slider px-6">
              <div className="absolute left-6 right-6 h-1.5 bg-black/40 rounded-full shadow-inner" />
              <div className="absolute left-6 h-1.5 bg-gradient-to-r from-[var(--viz-lavender)] via-[var(--viz-lavender)] to-[var(--viz-green)] rounded-full shadow-[0_0_20px_var(--viz-lavender)66]" style={{ width: `calc(${(currentIndex / Math.max(1, (history.length - 1))) * 100}% - 48px)` }} />
              <input 
                  type="range" min="0" max={Math.max(0, history.length - 1)} value={currentIndex} 
                  onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                  className="w-full h-10 opacity-0 cursor-pointer z-10"
              />
              <div className="absolute w-3 h-7 bg-[var(--viz-cyan)] rounded-full shadow-[0_0_30px_var(--viz-cyan)] border-2 border-white/40 pointer-events-none transition-all duration-300"
                  style={{ left: `calc(${(currentIndex / Math.max(1, (history.length - 1))) * 100}% - 6px)` }}
              />
          </div>
      </div>

      {/* Professional Legend */}
      <div className="mt-2 px-12 py-6 bg-muted/5 /20 rounded-[3rem] flex flex-wrap items-center justify-center gap-x-16 gap-y-4 opacity-60 hover:opacity-100 transition-opacity">
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[var(--viz-cyan)] shadow-[0_0_10px_var(--viz-cyan)]" />
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Active LENS</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-md bg-[var(--viz-lavender)] shadow-[0_0_10px_var(--viz-lavender)]" />
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">In Recursion Stack</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[var(--viz-lavender)] shadow-[0_0_10px_var(--viz-lavender)]" />
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Mapped (Sequence)</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full border-2 border-dashed border-muted-foreground/30" />
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Unexplored Manifold</span>
         </div>
      </div>
    </div>
  );
}
