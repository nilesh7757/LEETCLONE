"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, 
  ChevronLeft, ChevronRight, Zap, 
  ArrowUp, 
  TrendingUp, Activity, Plus, Trash2
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
  value: number;
  index: number;
  x: number;
  y: number;
  parentId: string | null;
  status: 'idle' | 'highlighted' | 'swapping' | 'active';
}

interface HistoryStep {
  heap: number[];
  message: string;
  step: string;
  highlightedIndices: number[];
  swappingIndices: number[];
  logs: string[];
}

export default function HeapVisualizer({ speed = 800 }: { speed?: number }) {
  const [heapData, setHeapData] = useState<number[]>([15, 20, 30, 40, 50]);
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
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

  const calculateLayout = (heap: number[]) => {
    const visualNodes: VisualNode[] = [];
    const traverse = (idx: number, x: number, y: number, offset: number, parentId: string | null) => {
      if (idx >= heap.length) return;
      const id = `node-${idx}`;
      visualNodes.push({ id, value: heap[idx], index: idx, x, y, parentId, status: 'idle' });
      const leftIdx = 2 * idx + 1;
      const rightIdx = 2 * idx + 2;
      const nextOffset = offset * 0.5;
      traverse(leftIdx, x - offset, y + 80, nextOffset, id);
      traverse(rightIdx, x + offset, y + 80, nextOffset, id);
    };
    traverse(0, dimensions.width / 2, 60, dimensions.width / 4, null);
    return visualNodes;
  };

  const recordOperation = (type: 'INSERT' | 'EXTRACT', val?: number) => {
    setIsPlaying(false);
    const steps: HistoryStep[] = [];
    let currentLogs: string[] = [];
    const currentHeap = [...heapData];

    const record = (msg: string, step: string, highlights: number[] = [], swaps: number[] = []) => {
      steps.push({
        heap: [...currentHeap],
        message: msg,
        step: step,
        highlightedIndices: highlights,
        swappingIndices: swaps,
        logs: [...currentLogs]
      });
    };

    const addLog = (l: string) => currentLogs = [l, ...currentLogs];

    if (type === 'INSERT' && val !== undefined) {
      addLog(`Inserting ${val} into the heap.`);
      currentHeap.push(val);
      record(`Added ${val} at index ${currentHeap.length - 1}. Now bubbling up.`, "INSERT", [currentHeap.length - 1]);

      let idx = currentHeap.length - 1;
      while (idx > 0) {
        const pIdx = Math.floor((idx - 1) / 2);
        record(`Comparing ${currentHeap[idx]} (child) with ${currentHeap[pIdx]} (parent).`, "COMPARE", [idx, pIdx]);
        if (currentHeap[idx] < currentHeap[pIdx]) {
          addLog(`${currentHeap[idx]} < ${currentHeap[pIdx]} — swapping up.`);
          record(`${currentHeap[idx]} < ${currentHeap[pIdx]}. Swapping.`, "SWAP", [idx, pIdx], [idx, pIdx]);
          [currentHeap[idx], currentHeap[pIdx]] = [currentHeap[pIdx], currentHeap[idx]];
          idx = pIdx;
          record(`Swapped. Now at index ${idx}. Continuing up.`, "MOVED", [idx]);
        } else {
          addLog(`${currentHeap[idx]} >= ${currentHeap[pIdx]} — heap property satisfied.`);
          record(`${currentHeap[idx]} >= ${currentHeap[pIdx]}. Heap is valid. Done.`, "DONE", [idx, pIdx]);
          break;
        }
      }
      setHeapData([...currentHeap]);
    } else if (type === 'EXTRACT') {
        if (currentHeap.length === 0) return;
        const min = currentHeap[0];
        addLog(`Extracting minimum: ${min}.`);
        record(`Removing root (minimum = ${min}). Moving last element to root.`, "EXTRACT", [0]);

        if (currentHeap.length === 1) {
            currentHeap.pop();
            record(`Heap is now empty.`, "DONE");
        } else {
            const last = currentHeap.pop()!;
            currentHeap[0] = last;
            addLog(`Moved ${last} to root. Sinking down.`);
            record(`Root is now ${last}. Sinking down to restore heap.`, "SINK", [0]);

            let idx = 0;
            while (true) {
                let smallest = idx;
                const left = 2 * idx + 1;
                const right = 2 * idx + 2;

                if (left < currentHeap.length && currentHeap[left] < currentHeap[smallest]) smallest = left;
                if (right < currentHeap.length && currentHeap[right] < currentHeap[smallest]) smallest = right;

                if (smallest !== idx) {
                    addLog(`${currentHeap[idx]} > ${currentHeap[smallest]} — swapping down.`);
                    record(`${currentHeap[idx]} > child ${currentHeap[smallest]}. Swapping down.`, "SWAP", [idx, smallest], [idx, smallest]);
                    [currentHeap[idx], currentHeap[smallest]] = [currentHeap[smallest], currentHeap[idx]];
                    idx = smallest;
                    record(`Swapped. Now at index ${idx}. Continuing down.`, "MOVED", [idx]);
                } else {
                    addLog(`Heap property satisfied. Extract complete.`);
                    record(`Heap is valid. Extract complete.`, "DONE", [idx]);
                    break;
                }
            }
        }
        setHeapData([...currentHeap]);
    }

    setHistory(steps);
    setCurrentIndex(0);
    setIsPlaying(true);
    setInputValue("");
  };

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

  const currentStep = history[currentIndex] || {
    heap: heapData,
    message: "Enter a value and press Insert, or press Extract to remove the minimum.",
    step: "IDLE",
    highlightedIndices: [],
    swappingIndices: [],
    logs: []
  };

  const visualNodes = calculateLayout(currentStep.heap);

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
    <div className="flex flex-col gap-4 select-none font-sans w-full">

      {/* ── Header + Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--muted)]/20 border border-[var(--border)]/40 rounded-xl">
            <input
              type="number" value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && recordOperation('INSERT', parseInt(inputValue))}
              placeholder="VAL"
              className="w-10 bg-transparent text-center font-mono text-xs font-bold text-[var(--viz-cyan)] focus:outline-none placeholder:text-[var(--muted-foreground)]/20"
            />
          </div>
          <button onClick={() => recordOperation('INSERT', parseInt(inputValue))} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--viz-green)]/10 hover:bg-[var(--viz-green)]/20 rounded-xl text-[var(--viz-green)] transition-all text-[10px] font-bold uppercase cursor-pointer" title="Insert"><Plus size={12}/> Insert</button>
          <button onClick={() => recordOperation('EXTRACT')} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--viz-rose)]/10 hover:bg-[var(--viz-rose)]/20 rounded-xl text-[var(--viz-rose)] transition-all text-[10px] font-bold uppercase cursor-pointer" title="Extract Min"><Trash2 size={12}/> Extract Min</button>
          <button onClick={() => { setHeapData([]); setHistory([]); setCurrentIndex(0); }} className="p-2.5 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-red-500 transition-all cursor-pointer"><RotateCcw size={14}/></button>
        </div>
      </div>


      {/* ── Heap info bar ── */}
      <div className="flex items-center gap-6 px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[10px] font-mono">
        <span className="text-[var(--muted-foreground)]/50">Size: <strong className="text-[var(--viz-lavender)]">{currentStep.heap.length}</strong></span>
        <span className="text-[var(--muted-foreground)]/50">Min (root): <strong className="text-[var(--viz-cyan)]">{currentStep.heap.length > 0 ? currentStep.heap[0] : '—'}</strong></span>
        <span className="text-[var(--muted-foreground)]/50">Step: <strong className="text-[var(--viz-green)]">{currentStep.step}</strong></span>
      </div>

      {/* ── Visual Canvas ── */}
      <div ref={containerRef} className="relative w-full min-h-[350px] md:min-h-[520px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-hidden shadow-inner">
        {/* Grid backdrop */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

        {/* Empty state */}
        {currentStep.heap.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2 opacity-30">
              <TrendingUp size={32} className="text-[var(--viz-lavender)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Heap is empty</span>
              <span className="text-[9px] font-mono text-[var(--muted-foreground)]/60">Insert a value to begin</span>
            </div>
          </div>
        )}

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

        {/* Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {visualNodes.map(node => {
            if (!node.parentId) return null;
            const parent = visualNodes.find(n => n.id === node.parentId);
            if (!parent) return null;
            const { x1, y1, x2, y2 } = getLineCoords(parent, node);
            return (
              <motion.line key={`link-${node.id}`} layout
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="currentColor" className="text-[var(--muted-foreground)]/15"
                strokeWidth="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
            );
          })}
        </svg>

        {/* Nodes */}
        <div className="absolute inset-0 w-full h-full">
          {visualNodes.map(node => {
            const isH = currentStep.highlightedIndices.includes(node.index);
            const isS = currentStep.swappingIndices.includes(node.index);
            const isA = isH && !isS;
            return (
              <motion.div key={node.id} layout
                animate={{
                  x: node.x - 24, y: node.y - 24,
                  backgroundColor: isS ? MANIM_COLORS.red : isA ? MANIM_COLORS.blue : "var(--card)",
                  borderColor: isS ? MANIM_COLORS.red : isA ? MANIM_COLORS.blue : "var(--border)",
                  scale: isS || isA ? 1.2 : 1,
                  boxShadow: isS ? `0 0 30px ${MANIM_COLORS.red}44` : isA ? `0 0 20px ${MANIM_COLORS.blue}33` : "none"
                }}
                transition={{ type: "spring", stiffness: 150, damping: 25 }}
                className="absolute w-12 h-12 border-2 rounded-full z-20 flex items-center justify-center font-mono shadow-lg"
              >
                <span className={`text-sm font-black ${isS || isA ? "text-black" : "text-[var(--foreground)]"}`}>{node.value}</span>
                {isA && (
                  <motion.div layoutId="ptr" className="absolute -top-8 flex flex-col items-center">
                    <ArrowUp size={14} className="text-[var(--viz-lavender)]" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Step message (below canvas) ── */}
      <div className="w-full px-4 py-2.5 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center">
        <p className="text-xs text-[var(--viz-cyan)] font-mono font-medium">{currentStep.message}</p>
      </div>

      {/* ── Step log (below canvas) ── */}
      {currentStep.logs.length > 0 && (
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

      {/* ── Array view (below canvas) ── */}
      {currentStep.heap.length > 0 && (
        <div className="w-full bg-[var(--muted)]/20 border border-[var(--border)] rounded-2xl px-4 py-3 flex flex-col gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/50">Heap Array (index 0 = root)</span>
          <div className="flex flex-wrap gap-1.5">
            {currentStep.heap.map((val, i) => {
              const isH = currentStep.highlightedIndices.includes(i);
              return (
                <motion.div key={`array-${i}`}
                  animate={{
                    backgroundColor: isH ? MANIM_COLORS.blue : "var(--card)",
                    borderColor: isH ? MANIM_COLORS.blue : "var(--border)",
                    color: isH ? "black" : "var(--foreground)"
                  }}
                  className="w-8 h-8 rounded border flex items-center justify-center font-mono text-[9px] font-black"
                >
                  {val}
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

      {/* ── Legend ── */}
      <div className="px-4 py-4 bg-[var(--muted)]/10 rounded-2xl border border-[var(--border)]/20 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-lavender)]" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Comparing</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-rose)]" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Swapping</span></div>
        <div className="flex items-center gap-2"><TrendingUp size={12} className="text-[var(--muted-foreground)]/20" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Min-Heap (parent ≤ children)</span></div>
      </div>
    </div>
  );
}


