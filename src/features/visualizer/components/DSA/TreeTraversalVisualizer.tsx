"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, 
  ChevronLeft, ChevronRight, ListTree,
  Layers, Cpu, Activity
} from "lucide-react";

// Professional Palette
const COLORS = { 
  blue: "var(--viz-lavender)",
  green: "var(--viz-green)",
  cyan: "var(--viz-cyan)",
  red: "var(--viz-rose)",
  purple: "var(--viz-lavender)"
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

  const calculateLayout = React.useCallback((root: TreeNode | null) => {
    const visualNodes: VisualNode[] = [];
    const traverseNodes = (node: TreeNode | null, x: number, y: number, offset: number, parentId: string | null) => {
      if (!node) return;
      visualNodes.push({ id: node.id, value: node.value, x, y, parentId, status: 'idle' });
      const nextOffset = offset * 0.5;
      traverseNodes(node.left, x - offset, y + 80, nextOffset, node.id);
      traverseNodes(node.right, x + offset, y + 80, nextOffset, node.id);
    };
    traverseNodes(root, dimensions.width / 2, 60, dimensions.width / 4.2, null);
    return visualNodes;
  }, [dimensions.width]);

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
        record(node, `Pre-Order: Visit root node ${node.value} first.`, "VISIT", 'active', true);
      } else {
        record(node, `Going down to left child of node ${node.value}.`, "DESCEND", 'visiting');
      }

      traverse(node.left);

      if (mode === 'IN') {
        record(node, `In-Order: Left subtree resolved. Visit root node ${node.value}.`, "VISIT", 'active', true);
      } else if (mode === 'POST') {
        record(node, `Going down to right child of node ${node.value}.`, "DESCEND", 'visiting');
      }

      traverse(node.right);

      if (mode === 'POST') {
        record(node, `Post-Order: Both subtrees resolved. Visit root node ${node.value}.`, "VISIT", 'active', true);
      }
      
      stack.pop();
      if (stack.length > 0) {
        const parentId = stack[stack.length-1];
        const findTreeNode = (root: TreeNode | null, val: number): TreeNode | null => {
            if (!root) return null;
            if (root.value === val) return root;
            return findTreeNode(root.left, val) || findTreeNode(root.right, val);
        };
        const actualParent = findTreeNode(treeRoot, parentId);
        if (actualParent) {
            record(actualParent, `Backtracking up to parent node ${actualParent.value}.`, "ASCEND", 'visiting');
        }
      }
    };

    traverse(treeRoot);
    steps.push({
      nodes: baseNodes.map(n => ({ ...n, status: 'processed' })),
      traversedOrder: [...resultOrder],
      stack: [],
      message: "Tree Traversal Complete.",
      stepType: "FINISHED",
      activeId: null,
      activeX: dimensions.width / 2,
      activeY: 60,
      logs: ["Traversal finished successfully.", ...currentLogs].slice(0, 10)
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
      nodes: [], traversedOrder: [], stack: [], message: "Preparing traversal...", stepType: "IDLE", activeId: null, activeX: dimensions.width / 2, activeY: 80, logs: [] 
    };
  }, [history, currentIndex, dimensions.width]);

  return (
    <div className="flex flex-col gap-4 select-none font-sans w-full">
      {/* Header + Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-[var(--viz-lavender)]">Tree Traversal</h2>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)]/40">Depth-First Search (DFS)</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-[var(--muted)] p-1 rounded-lg">
            {(['PRE', 'IN', 'POST'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setMode(t); setCurrentIndex(0); setIsPlaying(false); }}
                className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${mode === t ? "bg-[var(--viz-lavender)] text-black" : "text-[var(--muted-foreground)]/40 hover:text-[var(--foreground)]"}`}
              >
                {t === 'PRE' ? 'Pre-Order' : t === 'IN' ? 'In-Order' : 'Post-Order'}
              </button>
            ))}
          </div>
          <button 
            onClick={() => {
              if (currentIndex >= history.length - 1) setCurrentIndex(0);
              setIsPlaying(!isPlaying);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${isPlaying ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-[var(--viz-lavender)] text-black border-transparent hover:scale-105"}`}
          >
            {isPlaying ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor"/>}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button onClick={() => { setCurrentIndex(0); setIsPlaying(false); }} className="p-2 bg-[var(--muted)] hover:bg-[var(--foreground)]/5 rounded-xl border border-[var(--border)] transition-all text-[var(--muted-foreground)]/60 hover:text-[var(--foreground)]">
            <RotateCcw size={16}/>
          </button>
        </div>
      </div>

      {/* Traversal State Info Bar */}
      <div className="flex items-center gap-6 px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[10px] font-mono">
        <span className="text-[var(--muted-foreground)]/50">Current Traversal: <strong className="text-[var(--viz-lavender)]">{mode === 'PRE' ? 'Pre-Order' : mode === 'IN' ? 'In-Order' : 'Post-Order'}</strong></span>
        <span className="text-[var(--muted-foreground)]/50">Step Type: <strong className="text-[var(--viz-cyan)]">{currentStep.stepType}</strong></span>
      </div>

      {/* Visual Canvas (No Overflow) */}
      <div ref={containerRef} className="relative w-full min-h-[350px] md:min-h-[420px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-hidden shadow-inner flex items-center justify-center p-4">
        {/* Grid backdrop */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

        {/* Real-time Status Badge */}
        <AnimatePresence>
          {currentStep.stepType !== "IDLE" && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-[var(--viz-lavender)]/10 border border-[var(--viz-lavender)]/30 rounded-full z-30">
              <Cpu size={12} className="text-[var(--viz-lavender)] shadow-[0_0_10px_var(--viz-lavender)]" />
              <span className="text-[9px] font-black font-mono text-[var(--viz-lavender)] uppercase tracking-widest">{currentStep.stepType}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tree Edges Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
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
                    stroke: isMapped ? COLORS.blue : isPathActive ? COLORS.cyan : "var(--border)",
                    strokeWidth: isPathActive ? 3 : isMapped ? 2 : 1.5,
                    opacity: isMapped ? 0.6 : isPathActive ? 1 : 0.3,
                  }}
                  x1={parent.x} y1={parent.y} x2={node.x} y2={node.y} 
                  strokeDasharray={isMapped ? "0" : "5 3"}
                  transition={{ duration: 0.4 }}
                />
              </g>
            );
          })}
        </svg>

        {/* Tree Nodes Layer */}
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
                  scale: isActive ? 1.25 : isStackNode ? 1.1 : 1,
                  backgroundColor: isActive ? COLORS.cyan : isStackNode ? COLORS.purple + '22' : isProcessed ? COLORS.blue + '11' : 'var(--card)',
                  borderColor: isActive ? COLORS.cyan : isStackNode ? COLORS.purple : isProcessed ? COLORS.blue : "var(--border)",
                  borderWidth: isActive || isStackNode || isProcessed ? 2.5 : 1.5,
                  boxShadow: isActive ? `0 0 30px ${COLORS.cyan}66` : isStackNode ? `0 0 15px ${COLORS.purple}22` : 'none',
                  color: isActive ? "#000" : "var(--foreground)"
                }}
                style={{ position: 'absolute', left: 0, top: 0, translateX: '-50%', translateY: '-50%' }}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 z-10 font-mono shadow-md border"
              >
                <span className="text-sm font-black relative z-10">{node.value}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Step Message (below canvas) ── */}
      <div className="w-full px-4 py-2.5 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center">
        <p className="text-xs text-[var(--viz-cyan)] font-mono font-medium">{currentStep.message}</p>
      </div>

      {/* ── Step log (below canvas) ── */}
      {currentStep.logs && currentStep.logs.length > 0 && (
        <div className="w-full bg-[var(--muted)]/30 border border-[var(--border)] rounded-2xl px-4 py-3 flex flex-col gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/50 flex items-center gap-1.5">
            <Activity size={10} /> Step Log
          </span>
          <div className="flex flex-row flex-wrap gap-x-6 gap-y-1">
            {currentStep.logs.slice(0, 4).map((log, i) => (
              <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-[9px] font-mono text-[var(--muted-foreground)]/60 leading-tight">
                <span className="text-[var(--viz-lavender)] mr-1">»</span>{log}
              </motion.p>
            ))}
          </div>
        </div>
      )}

      {/* ── Recursion Stack + Output Traversed Order (below canvas) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Stack */}
        <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col gap-3 min-h-[140px] relative overflow-hidden">
          <h3 className="text-[9px] font-black uppercase text-[var(--muted-foreground)]/50 tracking-widest flex items-center gap-2">
            <Layers size={12} className="text-[var(--viz-lavender)]" />
            Recursion Call Stack
          </h3>
          <div className="flex flex-row flex-wrap gap-2 pr-2 scrollbar-none content-start">
            <AnimatePresence mode="popLayout">
              {(currentStep.stack || []).map((val, idx) => (
                <motion.div
                  key={`stack-${val}-${idx}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="rounded-lg bg-[var(--viz-lavender)]/15 border border-[var(--viz-lavender)]/20 flex items-center gap-2 px-2.5 py-1 text-[10px] font-bold font-mono text-[var(--viz-lavender)]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--viz-lavender)]" />
                  Node {val}
                </motion.div>
              ))}
            </AnimatePresence>
            {(!currentStep.stack || currentStep.stack.length === 0) && (
              <span className="text-[9px] italic text-[var(--muted-foreground)]/30 py-4">Stack empty</span>
            )}
          </div>
        </div>

        {/* Traversal Output */}
        <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col gap-3 min-h-[140px] relative overflow-hidden">
          <h3 className="text-[9px] font-black uppercase text-[var(--muted-foreground)]/50 tracking-widest flex items-center gap-2">
            <ListTree size={12} className="text-[var(--viz-lavender)]" />
            Traversal Output Order
          </h3>
          <div className="flex flex-wrap gap-2 content-start">
            <AnimatePresence mode="popLayout">
              {(currentStep.traversedOrder || []).map((val, idx) => (
                <motion.div 
                  key={`${val}-${idx}`}
                  initial={{ scale: 0, opacity: 0, y: 5 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="w-8 h-8 rounded-lg bg-[var(--viz-lavender)]/10 border border-[var(--viz-lavender)]/20 flex items-center justify-center text-xs font-black text-[var(--viz-lavender)] font-mono"
                >
                  {val}
                </motion.div>
              ))}
            </AnimatePresence>
            {(!currentStep.traversedOrder || currentStep.traversedOrder.length === 0) && (
              <span className="text-[9px] italic text-[var(--muted-foreground)]/30 py-4">No output yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Scrubber + Nav */}
      <div className="flex flex-col gap-3 w-full p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash size={14} className="text-[var(--viz-lavender)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Step {currentIndex + 1} of {history.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all">
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all" disabled={currentIndex === 0}><ChevronLeft size={18} /></button>
            <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all" disabled={currentIndex >= (history.length || 1) - 1}><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="relative flex items-center w-full">
          <div className="absolute w-full h-1 bg-[var(--muted)]/30 rounded-full" />
          <div className="absolute h-1 bg-[var(--viz-lavender)] rounded-full transition-all"
            style={{ width: `${(currentIndex / Math.max((history.length || 1) - 1, 1)) * 100}%` }} />
          <input type="range" min="0" max={Math.max((history.length || 1) - 1, 0)} value={currentIndex}
            onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
            className="w-full h-6 opacity-0 cursor-pointer z-10" />
          <div className="absolute w-1.5 h-4 bg-[var(--viz-cyan)] rounded-full pointer-events-none transition-all"
            style={{ left: `calc(${(currentIndex / Math.max((history.length || 1) - 1, 1)) * 100}% - 3px)` }} />
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-4 bg-[var(--muted)]/10 rounded-2xl border border-[var(--border)]/20 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-cyan)]" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Active Node</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-lavender)]" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">In Recursion Stack / Visiting</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-[var(--muted-foreground)]/30" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Unvisited</span></div>
      </div>
    </div>
  );
}
