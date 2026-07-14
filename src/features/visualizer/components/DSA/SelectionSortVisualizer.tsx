"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, Pause, Hash, ChevronRight, ChevronLeft, Target } from "lucide-react";

const ARRAY_SIZE = 10;

interface VisualNode {
  id: string;
  value: number;
  logicalIndex: number;
  status: 'idle' | 'comparing' | 'swapping' | 'sorted' | 'minimum';
}

interface HistoryStep {
  nodes: VisualNode[];
  explanation: string;
  activeStep: string | null;
  currentMinIdx: number | null;
  scanIdx: number | null;
}

export default function SelectionSortVisualizer({ speed = 600 }: { speed?: number }) {
  const [initialData, setInitialData] = useState<VisualNode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const history = useMemo(() => {
    if (initialData.length === 0) return [];

    const steps: HistoryStep[] = [];
    let currentNodes: VisualNode[] = JSON.parse(JSON.stringify(initialData));

    const record = (msg: string, step: string | null, minIdx: number | null = null, scan: number | null = null) => {
      steps.push({
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        explanation: msg,
        activeStep: step,
        currentMinIdx: minIdx,
        scanIdx: scan
      });
    };

    record("Array initialized. Press Start to begin Selection Sort.", "INIT");

    const arr = [...currentNodes].sort((a, b) => a.logicalIndex - b.logicalIndex);
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      let min_idx = i;

      currentNodes = currentNodes.map(node => {
        if (node.logicalIndex === i) return { ...node, status: 'minimum' };
        return node.status === 'sorted' ? node : { ...node, status: 'idle' };
      });
      record(`Pass ${i + 1}: Assuming index ${i} is the minimum.`, "BOUND", min_idx, i);

      for (let j = i + 1; j < n; j++) {
        currentNodes = currentNodes.map(node => {
          if (node.logicalIndex === j) return { ...node, status: 'comparing' };
          if (node.logicalIndex === min_idx) return { ...node, status: 'minimum' };
          return node.status === 'sorted' ? node : { ...node, status: 'idle' };
        });
        record(`Scanning: Comparing ${arr[j].value} with current minimum ${arr[min_idx].value}.`, "SCAN", min_idx, j);

        if (arr[j].value < arr[min_idx].value) {
          min_idx = j;
          currentNodes = currentNodes.map(node => {
            if (node.logicalIndex === min_idx) return { ...node, status: 'minimum' };
            return node.status === 'sorted' ? node : { ...node, status: 'idle' };
          });
          record(`New minimum found at index ${min_idx} (value: ${arr[min_idx].value}).`, "NEW_MIN", min_idx, j);
        }
      }

      if (min_idx !== i) {
        currentNodes = currentNodes.map(node => {
          if (node.logicalIndex === i || node.logicalIndex === min_idx) {
            return { ...node, status: 'swapping' };
          }
          return node.status === 'sorted' ? node : { ...node, status: 'idle' };
        });
        record(`Swapping index ${i} with minimum at index ${min_idx}.`, "SWAP", min_idx, i);

        const nodeI = currentNodes.find(n => n.logicalIndex === i)!;
        const nodeMin = currentNodes.find(n => n.logicalIndex === min_idx)!;
        const idI = nodeI.id;
        const idMin = nodeMin.id;

        currentNodes = currentNodes.map(node => {
          if (node.id === idI) return { ...node, logicalIndex: min_idx, status: 'swapping' };
          if (node.id === idMin) return { ...node, logicalIndex: i, status: 'swapping' };
          return node;
        });

        [arr[i], arr[min_idx]] = [arr[min_idx], arr[i]];
        record(`Swap done.`, "DISPLACED", i, min_idx);
      } else {
        record(`Index ${i} was already the minimum. No swap needed.`, "STABLE", i, i);
      }

      currentNodes = currentNodes.map(node =>
        node.logicalIndex === i ? { ...node, status: 'sorted' } : node
      );
      record(`Index ${i} is now sorted.`, "LOCKED", i);
    }

    currentNodes = currentNodes.map(node => ({ ...node, status: 'sorted' }));
    record("All elements sorted. Selection Sort complete.", "COMPLETE");

    return steps;
  }, [initialData]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= history.length - 1) { setIsPlaying(false); return prev; }
          return prev + 1;
        });
      }, currentSpeed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, history.length, currentSpeed]);

  const generateArray = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    const size = typeof window !== 'undefined' && window.innerWidth < 768 ? 6 : ARRAY_SIZE;
    const nodes = Array.from({ length: size }, (_, i) => ({
      id: `selection-node-${Math.random().toString(36).substr(2, 9)}`,
      value: Math.floor(Math.random() * 60) + 20,
      logicalIndex: i,
      status: 'idle' as const
    }));
    setInitialData(nodes);
  };

  useEffect(() => { generateArray(); }, []);

  const currentStep = history[currentIndex] || { nodes: initialData, explanation: "Initializing...", activeStep: null, currentMinIdx: null, scanIdx: null };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="p-2 md:p-8 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl font-sans text-[var(--foreground)] relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

        {/* Header */}
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[var(--viz-amber)]">
              Selection Sort <span className="text-[var(--muted-foreground)]/40">Invariants</span>
            </h2>
            <div className="h-1 w-12 bg-[var(--viz-amber)] rounded-full" />
          </div>
          <div className="flex items-center gap-3 bg-[var(--muted)] p-2 rounded-2xl border border-[var(--border)] shadow-inner">
            <button onClick={generateArray} className="p-2 hover:bg-[var(--accent)] rounded-xl text-[var(--muted-foreground)] active:scale-95 transition-all cursor-pointer"><RotateCcw size={20} /></button>
            {!isPlaying ? (
              <button onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(true); }} className="flex items-center gap-2 px-6 py-2 bg-[var(--viz-amber)] text-[var(--background)] rounded-xl hover:scale-105 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg cursor-pointer"><Play size={14} fill="currentColor" /> EXECUTE</button>
            ) : (
              <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 px-6 py-2 bg-[var(--viz-rose)]/20 text-[var(--viz-rose)] border border-[var(--viz-rose)]/50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[var(--viz-rose)]/30 transition-all cursor-pointer"><Pause size={14} fill="currentColor" /> HALT</button>
            )}
          </div>
        </div>

        {/* Canvas - full width flex layout, no absolute positioning */}
        <div className="relative w-full h-[50vh] md:h-[60vh] min-h-[400px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-hidden flex items-end justify-center px-4 md:px-8 py-6">

          {/* Current Min label — overlay pinned to top left */}
          {currentStep.currentMinIdx !== null && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2 py-1 bg-[var(--viz-amber)] text-[var(--background)] rounded-lg text-[8px] font-black uppercase tracking-wider z-30">
              <Target size={10} />
              Min @ {currentStep.currentMinIdx}
            </div>
          )}

          {/* Bars — flex row, fills full width */}
          <div className="relative w-full h-full flex items-end justify-center gap-1.5 md:gap-3">
            {[...currentStep.nodes]
              .sort((a, b) => a.logicalIndex - b.logicalIndex)
              .map((node) => {
                const isComparing = node.status === 'comparing';
                const isSwapping = node.status === 'swapping';
                const isSorted = node.status === 'sorted';
                const isMin = node.status === 'minimum';

                const nodeColor =
                  isSwapping ? "var(--viz-rose)" :
                  isMin ? "var(--viz-amber)" :
                  isComparing ? "var(--viz-cyan)" :
                  isSorted ? "var(--viz-green)" :
                  "rgba(99,102,241,0.1)";

                const nodeBorder =
                  isSwapping ? "var(--viz-rose)" :
                  isMin ? "var(--viz-amber)" :
                  isComparing ? "var(--viz-cyan)" :
                  isSorted ? "var(--viz-green)" :
                  "rgba(99,102,241,0.3)";

                return (
                  <motion.div
                    key={node.id}
                    layout
                    animate={{
                      height: `${node.value}%`,
                      backgroundColor: nodeColor,
                      borderColor: nodeBorder,
                      boxShadow: isComparing || isSwapping || isMin
                        ? `0 0 30px ${nodeColor}66`
                        : isSorted ? `0 0 15px var(--viz-green)22` : "none",
                      scale: isComparing || isSwapping || isMin ? 1.05 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 150, damping: 25 }}
                    className="flex-1 border-t-2 border-x-2 rounded-t-xl z-20 flex flex-col items-center justify-start pt-2 font-mono overflow-hidden max-w-[80px]"
                    style={{ height: `${node.value}%` }}
                  >
                    <span className={`${isMobile ? 'text-[8px]' : 'text-xs'} font-bold ${isComparing || isSwapping || isMin ? 'text-[var(--background)]' : 'text-[var(--foreground)]/60'}`}>
                      {node.value}
                    </span>
                  </motion.div>
                );
              })}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl mt-4 relative z-10">
          <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-[var(--primary)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/45">Step {currentIndex + 1} of {history.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/60 transition-all cursor-pointer"><ChevronLeft size={18} /></button>
              <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/60 transition-all cursor-pointer"><ChevronRight size={18} /></button>
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--muted)]/50 px-2.5 py-1 rounded-xl border border-[var(--border)] shrink-0 select-none">
              <span className="text-[8px] font-black uppercase text-[var(--muted-foreground)] tracking-wider">Speed</span>
              <select
                value={currentSpeed}
                onChange={(e) => setCurrentSpeed(parseInt(e.target.value))}
                className="bg-transparent text-[10px] font-bold font-mono focus:outline-none cursor-pointer text-[#3b82f6]"
              >
                <option value="2000" className="bg-[var(--card)] text-[var(--foreground)]">0.25x</option>
                <option value="1200" className="bg-[var(--card)] text-[var(--foreground)]">0.5x</option>
                <option value="600" className="bg-[var(--card)] text-[var(--foreground)]">1.0x</option>
                <option value="300" className="bg-[var(--card)] text-[var(--foreground)]">1.5x</option>
                <option value="150" className="bg-[var(--card)] text-[var(--foreground)]">2.0x</option>
              </select>
            </div>
          </div>
          <div className="relative flex items-center group/slider w-full md:w-auto flex-1 h-6">
            <div className="absolute w-full h-1 bg-[var(--background)]/10 rounded-full" />
            <div className="absolute h-1 bg-[var(--viz-amber)] rounded-full shadow-[0_0_10px_rgba(var(--viz-amber-rgb),0.4)]"
              style={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }} />
            <input
              type="range" min="0" max={history.length - 1} value={currentIndex}
              onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
              className="w-full h-6 opacity-0 cursor-pointer z-10"
            />
            <div className="absolute w-1.5 h-4 bg-[var(--viz-amber)] rounded-full shadow-[0_0_15px_rgba(var(--viz-gold-rgb),0.5)] pointer-events-none transition-all"
              style={{ left: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 3px)` }}
            />
          </div>
        </div>
      </div>

      {/* Legend */}
        <div className="px-4 md:px-10 py-6 bg-[var(--muted)]/20 border border-[var(--border)] rounded-[2.5rem] flex flex-wrap items-center justify-center gap-4 md:gap-12 text-center">
        <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-amber)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Current Min</span></div>
        <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-cyan)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Comparing</span></div>
        <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-rose)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Swapping</span></div>
        <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Sorted</span></div>
      </div>
    </div>
  );
}
