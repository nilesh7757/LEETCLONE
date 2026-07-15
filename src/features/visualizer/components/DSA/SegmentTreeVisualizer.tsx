"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Hash, Search, Zap, 
  Hammer, Edit3, Target,
  ArrowUp, Activity, ChevronLeft, ChevronRight
} from "lucide-react";

const MANIM_COLORS = { 
  blue: "var(--viz-lavender)",
  green: "var(--viz-green)",
  cyan: "var(--viz-cyan)",
  red: "var(--viz-rose)",
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

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) setDimensions({ width: entries[0].contentRect.width, height: entries[0].contentRect.height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const getMergeFn = useCallback(() => {
    if (treeMode === 'MIN') return (a: number, b: number) => Math.min(a, b);
    if (treeMode === 'MAX') return (a: number, b: number) => Math.max(a, b);
    return (a: number, b: number) => a + b;
  }, [treeMode]);

  const getIdentity = useCallback(() => {
    if (treeMode === 'MIN') return Infinity;
    if (treeMode === 'MAX') return -Infinity;
    return 0;
  }, [treeMode]);

  const getOpName = useCallback(() => {
    if (treeMode === 'MIN') return "Minimum";
    if (treeMode === 'MAX') return "Maximum";
    return "Sum";
  }, [treeMode]);

  const getLayout = useCallback((tree: (number | null)[], n: number) => {
    const visualNodes: VisualNode[] = [];
    const width = dimensions.width - 100;
    const leafSpacing = n > 1 ? width / (n - 1) : 0;
    const startX = (dimensions.width - width) / 2;

    const traverse = (node: number, start: number, end: number, depth: number): number => {
      const id = `node-${node}`;
      const rawVal = tree[node];
      let x = 0;
      if (start === end) {
        x = startX + start * leafSpacing;
      } else {
        const mid = Math.floor((start + end) / 2);
        const leftX = traverse(2 * node, start, mid, depth + 1);
        const rightX = traverse(2 * node + 1, mid + 1, end, depth + 1);
        x = (leftX + rightX) / 2;
      }
      const y = 60 + depth * 80;
      visualNodes.push({ id, nodeIdx: node, value: rawVal ?? 0, start, end, x, y, parentId: node === 1 ? null : `node-${Math.floor(node / 2)}`, status: 'idle', visible: rawVal !== null });
      return x;
    };

    if (n > 0) traverse(1, 0, n - 1, 0);
    return visualNodes;
  }, [dimensions.width]);

  const currentTree = useMemo(() => {
    const n = arrayData.length;
    const tree = Array(4 * n).fill(null);
    const merge = getMergeFn();
    const build = (node: number, start: number, end: number) => {
      if (start === end) { tree[node] = arrayData[start]; return; }
      const mid = Math.floor((start + end) / 2);
      build(2 * node, start, mid);
      build(2 * node + 1, mid + 1, end);
      tree[node] = merge(tree[2 * node], tree[2 * node + 1]);
    };
    if (n > 0) build(1, 0, n - 1);
    return tree;
  }, [arrayData, getMergeFn]);

  const recordOperation = useCallback((type: 'BUILD' | 'QUERY' | 'UPDATE') => {
    const steps: HistoryStep[] = [];
    const n = arrayData.length;
    const tree = [...currentTree];
    const merge = getMergeFn();
    const identity = getIdentity();
    let currentLogs: string[] = [];

    const record = (msg: string, step: string, hId: string | null, range: [number, number] | null = null, qRes: number | null = null, statusOverrides?: Record<string, VisualNode['status']>) => {
      const layout = getLayout(tree, n);
      const frameNodes = layout.map(node => ({ ...node, status: statusOverrides?.[node.id] || (node.id === hId ? 'highlighted' : 'idle') }));
      steps.push({ nodes: frameNodes, message: msg, step, highlightedId: hId, activeRange: range, queryResult: qRes, logs: [...currentLogs] });
    };

    const addLog = (l: string) => { currentLogs = [l, ...currentLogs].slice(0, 8); };

    if (type === 'BUILD') {
      addLog(`Building Segment Tree for ${n} elements.`);
      const buildSteps = (node: number, start: number, end: number) => {
        record(`Visiting range [${start}, ${end}] at node ${node}.`, "BUILD", `node-${node}`, [start, end]);
        if (start === end) { addLog(`Leaf node ${node} = ${arrayData[start]}.`); return; }
        const mid = Math.floor((start + end) / 2);
        buildSteps(2 * node, start, mid);
        buildSteps(2 * node + 1, mid + 1, end);
        record(`Merging children for range [${start}, ${end}].`, "MERGE", `node-${node}`, [start, end]);
      };
      buildSteps(1, 0, n - 1);
      addLog("Build complete.");
      record("Segment Tree built successfully.", "DONE", null);
    } else if (type === 'QUERY') {
      const L = parseInt(queryL), R = parseInt(queryR);
      if (isNaN(L) || isNaN(R) || L < 0 || R >= n || L > R) return;
      addLog(`Range ${getOpName()} query for indices [${L}, ${R}].`);
      const query = (node: number, start: number, end: number, qL: number, qR: number): number => {
        record(`Node ${node} covers [${start}, ${end}]. Query is [${qL}, ${qR}].`, "QUERY", `node-${node}`, [qL, qR]);
        if (qR < start || end < qL) { addLog(`Node ${node} is out of range. Skipping.`); return identity; }
        if (qL <= start && end <= qR) {
          addLog(`Node ${node} fully inside range. Contributing ${tree[node]}.`);
          record(`Node ${node} is fully inside range. Using its value ${tree[node]}.`, "MATCH", `node-${node}`, [qL, qR], null, { [`node-${node}`]: 'contributing' });
          return tree[node]!;
        }
        const mid = Math.floor((start + end) / 2);
        return merge(query(2 * node, start, mid, qL, qR), query(2 * node + 1, mid + 1, end, qL, qR));
      };
      const result = query(1, 0, n - 1, L, R);
      addLog(`Query result: ${result}.`);
      record(`${getOpName()} of [${L}, ${R}] = ${result}.`, "DONE", null, [L, R], result);
    } else {
      const idx = parseInt(updateIdx), val = parseInt(updateVal);
      if (isNaN(idx) || isNaN(val) || idx < 0 || idx >= n) return;
      addLog(`Updating index ${idx} to ${val}.`);
      const update = (node: number, start: number, end: number, i: number, v: number) => {
        record(`Going to update index ${i}. Currently at node ${node} covering [${start}, ${end}].`, "UPDATE", `node-${node}`, [i, i], null, { [`node-${node}`]: 'updating' });
        if (start === end) { tree[node] = v; addLog(`Leaf updated to ${v}.`); return; }
        const mid = Math.floor((start + end) / 2);
        if (i <= mid) update(2 * node, start, mid, i, v);
        else update(2 * node + 1, mid + 1, end, i, v);
        tree[node] = merge(tree[2 * node]!, tree[2 * node + 1]!);
        record(`Node ${node} recalculated to ${tree[node]}.`, "MERGE", `node-${node}`, [i, i], null, { [`node-${node}`]: 'updating' });
      };
      update(1, 0, n - 1, idx, val);
      addLog("Update complete.");
      setArrayData(prev => { const next = [...prev]; next[idx] = val; return next; });
      record("Update done. Tree is consistent.", "DONE", null);
    }

    setHistory(steps);
    setCurrentIndex(0);
    setIsPlaying(true);
  }, [arrayData, currentTree, getMergeFn, getIdentity, getLayout, queryL, queryR, updateIdx, updateVal, getOpName]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= history.length - 1) { setIsPlaying(false); return prev; }
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
      message: "Enter an array and press Build, or run a Query / Update.",
      step: "IDLE",
      highlightedId: null,
      activeRange: null,
      logs: []
    };
  }, [history, currentIndex, getLayout, arrayData.length, currentTree]);

  const viewTransform = useMemo(() => {
    if (currentStep.nodes.length === 0) return { x: 0, y: 0, scale: 1 };
    const PAD = 80, R = 30;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    currentStep.nodes.forEach(n => {
      if (!n.visible) return;
      minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
    });
    if (minX === Infinity) return { x: 0, y: 0, scale: 1 };
    minX -= R; maxX += R; minY -= R; maxY += R;
    const tw = maxX - minX, th = maxY - minY;
    let scale = Math.min((dimensions.width - PAD) / tw, (dimensions.height - PAD) / th);
    scale = Math.min(Math.max(scale, 0.1), 1.1);
    return {
      x: dimensions.width / 2 - (minX + tw / 2) * scale,
      y: dimensions.height / 2 - (minY + th / 2) * scale,
      scale
    };
  }, [currentStep.nodes, dimensions]);

  const getLineCoords = (u: VisualNode, v: VisualNode) => {
    const dx = v.x - u.x, dy = v.y - u.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const r = 24;
    return { x1: u.x + (dx / dist) * r, y1: u.y + (dy / dist) * r, x2: v.x - (dx / dist) * r, y2: v.y - (dy / dist) * r };
  };

  return (
    <div className="flex flex-col gap-4 select-none font-sans w-full">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-[var(--viz-lavender)]">Segment Tree Visualizer</h2>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)]/40">Range Queries · Point Updates</p>
        </div>
        <div className="flex bg-[var(--muted)] p-1 rounded-lg">
          {(['SUM', 'MIN', 'MAX'] as const).map((mode) => (
            <button key={mode} onClick={() => { setTreeMode(mode); setHistory([]); setCurrentIndex(0); }}
              className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${treeMode === mode ? "bg-[var(--viz-lavender)] text-black" : "text-[var(--muted-foreground)]/40"}`}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* ── Controls row ── */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
        {/* Build */}
        <div className="flex items-center gap-2 bg-[var(--muted)] p-2 rounded-xl">
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/50">Array</span>
          <input value={arrayInput} onChange={e => setArrayInput(e.target.value)}
            className="w-28 bg-transparent text-center font-mono text-xs font-bold text-[var(--viz-cyan)] focus:outline-none" placeholder="1,2,3..." />
          <button onClick={() => {
            const arr = arrayInput.split(',').map(Number).filter(n => !isNaN(n));
            if (arr.length > 0) { setArrayData(arr); setHistory([]); recordOperation('BUILD'); }
          }} className="flex items-center gap-1 px-2 py-1 hover:bg-[var(--foreground)]/5 rounded-lg text-[10px] font-bold text-[var(--foreground)] transition-all">
            <Hammer size={12}/> Build
          </button>
        </div>

        {/* Query */}
        <div className="flex items-center gap-2 bg-[var(--muted)] p-2 rounded-xl">
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/50">Query</span>
          <input type="number" value={queryL} onChange={e => setQueryL(e.target.value)} className="w-8 bg-transparent text-center font-mono text-xs font-bold text-[var(--viz-lavender)] focus:outline-none" />
          <span className="text-[var(--muted-foreground)]/30 text-xs">–</span>
          <input type="number" value={queryR} onChange={e => setQueryR(e.target.value)} className="w-8 bg-transparent text-center font-mono text-xs font-bold text-[var(--viz-lavender)] focus:outline-none" />
          <button onClick={() => recordOperation('QUERY')} className="p-1.5 hover:bg-[var(--viz-lavender)]/10 rounded-lg text-[var(--viz-lavender)]"><Search size={14}/></button>
        </div>

        {/* Update */}
        <div className="flex items-center gap-2 bg-[var(--muted)] p-2 rounded-xl">
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/50">Update</span>
          <span className="text-[9px] text-[var(--muted-foreground)]/40">idx</span>
          <input type="number" value={updateIdx} onChange={e => setUpdateIdx(e.target.value)} className="w-8 bg-transparent text-center font-mono text-xs font-bold text-[var(--viz-green)] focus:outline-none" />
          <span className="text-[9px] text-[var(--muted-foreground)]/40">val</span>
          <input type="number" value={updateVal} onChange={e => setUpdateVal(e.target.value)} className="w-8 bg-transparent text-center font-mono text-xs font-bold text-[var(--viz-green)] focus:outline-none" />
          <button onClick={() => recordOperation('UPDATE')} className="p-1.5 hover:bg-[var(--viz-green)]/10 rounded-lg text-[var(--viz-green)]"><Edit3 size={14}/></button>
        </div>
      </div>

      {/* ── Visual Canvas (no overflow) ── */}
      <div ref={containerRef} className="relative w-full min-h-[350px] md:min-h-[520px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

        {/* Step badge */}
        <AnimatePresence>
          {currentStep.step !== "IDLE" && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-[var(--viz-lavender)]/10 border border-[var(--viz-lavender)]/30 rounded-full z-30">
              <Zap size={10} className="text-[var(--viz-lavender)]" />
              <span className="text-[9px] font-black font-mono text-[var(--viz-lavender)] uppercase tracking-widest">{currentStep.step}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-fit tree */}
        <motion.div className="absolute top-0 left-0 w-full h-full pointer-events-none"
          animate={{ x: viewTransform.x, y: viewTransform.y, scale: viewTransform.scale }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
          style={{ transformOrigin: "0px 0px" }}>

          {/* Edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            {currentStep.nodes.map(node => {
              if (!node.parentId) return null;
              const parent = currentStep.nodes.find(n => n.id === node.parentId);
              if (!parent || !node.visible || !parent.visible) return null;
              const { x1, y1, x2, y2 } = getLineCoords(parent, node);
              return (
                <motion.line key={`link-${node.id}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="currentColor" className="text-[var(--muted-foreground)]/15"
                  strokeWidth="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
              );
            })}
          </svg>

          {/* Nodes */}
          <div className="absolute inset-0 w-full h-full pointer-events-auto">
            {currentStep.nodes.map(node => {
              const isA = node.status === 'highlighted';
              const isC = node.status === 'contributing';
              const isU = node.status === 'updating';
              if (!node.visible) return null;
              return (
                <motion.div key={node.id}
                  initial={{ x: node.x - 24, y: node.y - 24, scale: 0 }}
                  animate={{
                    x: node.x - 24, y: node.y - 24,
                    opacity: node.visible ? 1 : 0,
                    backgroundColor: isC ? MANIM_COLORS.green : isU ? MANIM_COLORS.red : isA ? MANIM_COLORS.blue : "var(--card)",
                    borderColor: isC ? MANIM_COLORS.green : isU ? MANIM_COLORS.red : isA ? MANIM_COLORS.blue : "var(--border)",
                    scale: isC || isU || isA ? 1.15 : 1,
                    boxShadow: isC ? `0 0 30px ${MANIM_COLORS.green}44` : isU ? `0 0 30px ${MANIM_COLORS.red}44` : isA ? `0 0 20px ${MANIM_COLORS.blue}33` : "none"
                  }}
                  transition={{ type: "spring", stiffness: 150, damping: 25 }}
                  className="absolute w-12 h-12 border-2 rounded-xl z-20 flex flex-col items-center justify-center font-mono shadow-lg"
                >
                  <span className={`text-xs font-black ${isC || isU || isA ? "text-black" : "text-[var(--foreground)]"}`}>{node.value}</span>
                  <span className="text-[6px] opacity-30">[{node.start}–{node.end}]</span>
                  {isA && (
                    <motion.div layoutId="ptr" className="absolute -top-8 flex flex-col items-center">
                      <ArrowUp size={14} className="text-[var(--viz-lavender)]" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Query result + step message (below canvas) ── */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {currentStep.queryResult !== undefined && currentStep.queryResult !== null && (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            className="px-5 py-2 bg-[var(--viz-cyan)] text-black font-black rounded-xl shadow-lg flex items-center gap-2 text-sm">
            <Target size={16}/> Result: {currentStep.queryResult}
          </motion.div>
        )}
        <div className="flex-1 min-w-0 px-4 py-2.5 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center">
          <p className="text-xs text-[var(--viz-cyan)] font-mono font-medium">{currentStep.message}</p>
        </div>
      </div>

      {/* ── Step log ── */}
      {currentStep.logs.length > 0 && (
        <div className="w-full bg-[var(--muted)]/30 border border-[var(--border)] rounded-2xl px-4 py-3 flex flex-col gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/50 flex items-center gap-1.5">
            <Activity size={10}/> Step Log
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

      {/* ── Array view ── */}
      {arrayData.length > 0 && (
        <div className="w-full bg-[var(--muted)]/20 border border-[var(--border)] rounded-2xl px-4 py-3 flex flex-col gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/50">Base Array</span>
          <div className="flex flex-wrap gap-1.5">
            {arrayData.map((val, i) => {
              const inRange = currentStep.activeRange && i >= currentStep.activeRange[0] && i <= currentStep.activeRange[1];
              return (
                <motion.div key={`arr-${i}`}
                  animate={{
                    backgroundColor: inRange ? `${MANIM_COLORS.blue}15` : "var(--card)",
                    borderColor: inRange ? MANIM_COLORS.blue : "var(--border)",
                    color: inRange ? MANIM_COLORS.blue : "var(--foreground)"
                  }}
                  className="w-9 h-9 rounded border flex flex-col items-center justify-center font-mono text-[9px] font-black"
                >
                  {val}
                  <span className="text-[5px] opacity-30">{i}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Scrubber + nav ── */}
      <div className="flex flex-col gap-3 w-full p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash size={14} className="text-[var(--viz-lavender)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Step {currentIndex + 1} of {history.length || 1}</span>
          </div>
          <div className="flex items-center gap-1">
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

      {/* ── Legend ── */}
      <div className="px-4 py-4 bg-[var(--muted)]/10 rounded-2xl border border-[var(--border)]/20 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)]" /><span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">In Range (contributes)</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-rose)]" /><span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Being Updated</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-lavender)]" /><span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Currently Visiting</span></div>
      </div>
    </div>
  );
}
