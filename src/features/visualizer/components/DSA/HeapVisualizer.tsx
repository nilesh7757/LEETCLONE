"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Sparkles, Hash, Link as LinkIcon, 
  Search, Info, ChevronLeft, ChevronRight, Zap, GitBranch,
  Layers, ArrowUp, MousePointer2, Network, Share2, StepForward,
  TrendingUp, Activity, Layout, Plus, Trash2, Cpu, Database
} from "lucide-react";

// Professional Palette
const MANIM_COLORS = { 
  text: "var(--foreground)", 
  background: "var(--card)",
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#f59e0b",
  red: "#FC6255",
  purple: "#9A72AC"
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
    let currentHeap = [...heapData];

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
      addLog(`Initializing insertion for value ${val}.`);
      currentHeap.push(val);
      record(`Allocated cell at index ${currentHeap.length - 1} for ${val}.`, "ALLOCATE", [currentHeap.length - 1]);
      
      let idx = currentHeap.length - 1;
      while (idx > 0) {
        const pIdx = Math.floor((idx - 1) / 2);
        record(`Evaluating child ${currentHeap[idx]} against parent ${currentHeap[pIdx]}.`, "UP_HEAP", [idx, pIdx]);
        if (currentHeap[idx] < currentHeap[pIdx]) {
          addLog(`Violation: ${currentHeap[idx]} < ${currentHeap[pIdx]}. Swapping up.`);
          record(`Heap violation detected. Initiating coordinate shift.`, "SWAP", [idx, pIdx], [idx, pIdx]);
          [currentHeap[idx], currentHeap[pIdx]] = [currentHeap[pIdx], currentHeap[idx]];
          idx = pIdx;
          record(`Manifold stabilized at index ${idx}.`, "SWAP_COMMIT", [idx]);
        } else {
            addLog(`Stability achieved.`);
            record(`Heap property satisfied. Terminal state reached.`, "STABLE", [idx, pIdx]);
            break;
        }
      }
      setHeapData([...currentHeap]);
    } else if (type === 'EXTRACT') {
        if (currentHeap.length === 0) return;
        const min = currentHeap[0];
        addLog(`Extracting root bit: ${min}.`);
        record(`Purging root manifold. Catalyst value ${min} extracted.`, "EXTRACT", [0]);
        
        if (currentHeap.length === 1) {
            currentHeap.pop();
            record(`Heap manifold empty. System stabilized.`, "COMPLETE");
        } else {
            const last = currentHeap.pop()!;
            currentHeap[0] = last;
            addLog(`Relocated tail bit ${last} to root.`);
            record(`Replacing root bit with last element ${last}. Initiating sink protocol.`, "REPLACE", [0]);
            
            let idx = 0;
            while (true) {
                let smallest = idx;
                const left = 2 * idx + 1;
                const right = 2 * idx + 2;

                if (left < currentHeap.length && currentHeap[left] < currentHeap[smallest]) smallest = left;
                if (right < currentHeap.length && currentHeap[right] < currentHeap[smallest]) smallest = right;

                if (smallest !== idx) {
                    addLog(`Sinking ${currentHeap[idx]} to index ${smallest}.`);
                    record(`Violation detected. Sinking bit ${currentHeap[idx]} into child manifold ${smallest}.`, "DOWN_HEAP", [idx, smallest], [idx, smallest]);
                    [currentHeap[idx], currentHeap[smallest]] = [currentHeap[smallest], currentHeap[idx]];
                    idx = smallest;
                    record(`Coordinate shift complete. Continuing analysis.`, "SWAP_COMMIT", [idx]);
                } else {
                    addLog(`Stability achieved.`);
                    record(`Root hierarchy stabilized. Extract protocol complete.`, "STABLE", [idx]);
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
    message: "System idle. Awaiting bit insertion into the priority manifold.", 
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
    <div className="flex flex-col gap-6">
      <div className="p-8 bg-card border border-border rounded-3xl shadow-2xl font-sans text-foreground relative overflow-hidden">
        {/* Grid Backdrop */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        {/* Header UI */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 relative z-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[#58C4DD]">
              Min-Heap <span className="text-muted-foreground/40">Resolution</span>
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-1 w-12 bg-[#58C4DD] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/30">Priority Queue Manifold</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-muted p-2 rounded-2xl border border-border shadow-inner">
            <div className="flex items-center gap-2 px-3 border-r border-border">
                <input 
                    type="number" value={inputValue} 
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="Val"
                    className="w-12 bg-transparent text-center font-mono text-sm font-bold text-[#f59e0b] focus:outline-none placeholder:text-muted-foreground/20"
                />
            </div>
            
            <div className="flex gap-1">
              <button onClick={() => recordOperation('INSERT', parseInt(inputValue))} className="p-2 hover:bg-[#83C167]/10 rounded-xl text-[#83C167] transition-all" title="Insert"><Plus size={20}/></button>
              <button onClick={() => recordOperation('EXTRACT')} className="p-2 hover:bg-[#FC6255]/10 rounded-xl text-[#FC6255] transition-all" title="Extract Min"><Trash2 size={20}/></button>
              <div className="w-px h-6 bg-border mx-1" />
              <button onClick={() => { setHeapData([]); setHistory([]); setCurrentIndex(0); }} className="p-2 hover:bg-red-500/10 rounded-xl text-muted-foreground/40 hover:text-red-500 transition-all"><RotateCcw size={20}/></button>
            </div>
          </div>
        </div>

        {/* Visual Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div ref={containerRef} className="lg:col-span-3 relative min-h-[520px] bg-muted/40 rounded-[2.5rem] border border-border overflow-hidden shadow-inner flex flex-col items-center justify-center">
                
                {/* Logic Step Badge */}
                <AnimatePresence>
                    {currentStep.step !== "IDLE" && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-8 left-10 flex items-center gap-2 px-4 py-2 bg-[#58C4DD]/10 border border-[#58C4DD]/30 rounded-full z-30">
                            <Zap size={12} className="text-[#58C4DD]" />
                            <span className="text-[9px] font-black font-mono text-[#58C4DD] uppercase tracking-[0.2em]">{currentStep.step}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Explanation Box */}
                <AnimatePresence mode="wait">
                    <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-12 w-full max-w-[400px] px-10 text-center z-30">
                        <div className="p-4 bg-card/80 border border-border rounded-2xl backdrop-blur-md shadow-2xl">
                            <p className="text-[10px] text-[#f59e0b] font-mono italic uppercase tracking-tighter">{currentStep.message}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    {visualNodes.map(node => {
                        if (!node.parentId) return null;
                        const parent = visualNodes.find(n => n.id === node.parentId);
                        if (!parent) return null;
                        const { x1, y1, x2, y2 } = getLineCoords(parent, node);
                        return (
                            <motion.line
                                key={`link-${node.id}`}
                                layout
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

                {/* Nodes */}
                <div className="relative w-full h-full">
                    {visualNodes.map(node => {
                        const isH = currentStep.highlightedIndices.includes(node.index);
                        const isS = currentStep.swappingIndices.includes(node.index);
                        const isA = isH && !isS;

                        return (
                            <motion.div
                                key={node.id}
                                layout
                                animate={{ 
                                    x: node.x - 24, 
                                    y: node.y - 24,
                                    backgroundColor: isS ? MANIM_COLORS.red : isA ? MANIM_COLORS.blue : "var(--card)",
                                    borderColor: isS ? MANIM_COLORS.red : isA ? MANIM_COLORS.blue : "var(--border)",
                                    scale: isS || isA ? 1.2 : 1,
                                    boxShadow: isS ? `0 0 30px ${MANIM_COLORS.red}44` : isA ? `0 0 20px ${MANIM_COLORS.blue}33` : "none"
                                }}
                                transition={{ type: "spring", stiffness: 150, damping: 25 }}
                                className="absolute w-12 h-12 border-2 rounded-full z-20 flex items-center justify-center font-mono shadow-lg"
                            >
                                <span className={`text-sm font-black ${isS || isA ? "text-black" : "text-foreground"}`}>{node.value}</span>
                                {isA && (
                                    <motion.div layoutId="ptr" className="absolute -top-10 flex flex-col items-center">
                                        <ArrowUp size={14} className="text-[#58C4DD]" />
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar: Logic Flow */}
            <div className="flex flex-col gap-6">
                <div className="p-6 bg-muted border border-border rounded-[2rem] flex flex-col gap-4 flex-1 h-[300px] overflow-hidden">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2">
                        <Activity size={14}/> Bit Stream
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
                                    <span className="text-[#58C4DD]">»</span>
                                    {log}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {currentStep.logs.length === 0 && <span className="text-[9px] italic text-muted-foreground/20 text-center py-8">Bit stream empty...</span>}
                    </div>
                </div>

                <div className="p-6 bg-muted border border-border rounded-[2rem]">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest mb-4 flex items-center gap-2">
                        <Database size={14}/> Array Manifold
                    </h3>
                    <div className="flex flex-wrap gap-1 justify-center">
                        {currentStep.heap.map((val, i) => {
                            const isH = currentStep.highlightedIndices.includes(i);
                            return (
                                <motion.div 
                                    key={`array-${i}`}
                                    animate={{ 
                                        backgroundColor: isH ? MANIM_COLORS.blue : "var(--card)",
                                        borderColor: isH ? MANIM_COLORS.blue : "var(--border)",
                                        color: isH ? "black" : "var(--foreground)"
                                    }}
                                    className="w-8 h-8 rounded border flex flex-col items-center justify-center font-mono text-[9px] font-black"
                                >
                                    {val}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>

        {/* Scrubber UI */}
        <div className="mt-8 p-6 bg-muted border border-border rounded-[2.5rem] flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Hash size={14} className="text-[#f59e0b]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Lemma Sequence {currentIndex + 1} of {history.length || 1}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all">
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider">
                <div className="absolute w-full h-1 bg-background/10 rounded-full" />
                <div className="absolute h-1 bg-[#58C4DD] rounded-full shadow-[0_0_10px_#58C4DD44]" style={{ width: `${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}%` }} />
                <input 
                    type="range" min="0" max={(history.length || 1) - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute w-1.5 h-4 bg-[#f59e0b] rounded-full shadow-[0_0_15px_#f59e0b] pointer-events-none transition-all"
                    style={{ left: `calc(${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}% - 3px)` }}
                />
            </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-10 py-6 bg-muted/20 border border-border rounded-[2.5rem] flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Active Analysis</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#58C4DD]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Manifold Probe</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#FC6255]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Coordinate Shift</span></div>
         <div className="flex items-center gap-3"><TrendingUp size={14} className="text-muted-foreground/20" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Priority Reduction</span></div>
      </div>
    </div>
  );
}