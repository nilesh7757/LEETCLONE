"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Hash, Activity } from "lucide-react";

const ARRAY_SIZE = 10;

interface VisualNode {
  id: string;
  value: number;
  logicalIndex: number;
  status: 'idle' | 'comparing' | 'swapping' | 'sorted';
}

interface HistoryStep {
  nodes: VisualNode[];
  explanation: string;
  activeStep: string | null;
  comparisonRange: [number, number] | null;
}

export default function SortingVisualizer({ speed = 600 }: { speed?: number }) {
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [initialData, setInitialData] = useState<VisualNode[]>(() => {
    const size = typeof window !== 'undefined' && window.innerWidth < 768 ? 6 : ARRAY_SIZE;
    return Array.from({ length: size }, (_, i) => ({
      id: `bubble-node-${Math.random().toString(36).substr(2, 9)}`,
      value: Math.floor(Math.random() * 60) + 20,
      logicalIndex: i,
      status: 'idle' as const
    }));
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const history = useMemo(() => {
    if (initialData.length === 0) return [];
    
    const steps: HistoryStep[] = [];
    let currentNodes: VisualNode[] = JSON.parse(JSON.stringify(initialData));

    const record = (msg: string, step: string | null, range: [number, number] | null = null) => {
      steps.push({
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        explanation: msg,
        activeStep: step,
        comparisonRange: range
      });
    };

    record("Array initialized. Press Play to begin Bubble Sort.", "INIT");

    const arr = [...currentNodes].sort((a, b) => a.logicalIndex - b.logicalIndex);
    const n = arr.length;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        currentNodes = currentNodes.map(node => {
            if (node.logicalIndex === j || node.logicalIndex === j + 1) {
                return { ...node, status: 'comparing' };
            }
            return node.status === 'sorted' ? node : { ...node, status: 'idle' };
        });
        record(`Comparing indices ${j} and ${j+1}: ${arr[j].value} vs ${arr[j+1].value}`, "SCAN", [j, j+1]);

        if (arr[j].value > arr[j + 1].value) {
          currentNodes = currentNodes.map(node => {
            if (node.logicalIndex === j || node.logicalIndex === j + 1) {
                return { ...node, status: 'swapping' };
            }
            return node.status === 'sorted' ? node : { ...node, status: 'idle' };
          });
          record(`Match: ${arr[j].value} > ${arr[j+1].value}. Elements will swap positions.`, "SWAP_DECISION", [j, j+1]);

          const nodeJ = currentNodes.find(n => n.logicalIndex === j)!;
          const nodeJ1 = currentNodes.find(n => n.logicalIndex === j + 1)!;
          const idJ = nodeJ.id;
          const idJ1 = nodeJ1.id;

          currentNodes = currentNodes.map(node => {
            if (node.id === idJ) return { ...node, logicalIndex: j + 1, status: 'swapping' };
            if (node.id === idJ1) return { ...node, logicalIndex: j, status: 'swapping' };
            return node;
          });
          
          [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
          record(`Swap complete.`, "SWAP_DONE", [j, j+1]);

          currentNodes = currentNodes.map(node => 
            (node.id === idJ || node.id === idJ1) ? { ...node, status: 'idle' } : node
          );
        } else {
          record(`Stability match: ${arr[j].value} <= ${arr[j+1].value}. Elements remain fixed.`, "STABLE", [j, j+1]);
          currentNodes = currentNodes.map(node => 
            (node.logicalIndex === j || node.logicalIndex === j + 1) ? { ...node, status: 'idle' } : node
          );
        }
      }
      const sortedIdx = n - i - 1;
      currentNodes = currentNodes.map(node => 
        node.logicalIndex === sortedIdx ? { ...node, status: 'sorted' } : node
      );
      record(`Pass complete. Index ${sortedIdx} is bubbled/sorted.`, "BUBBLED");
    }

    record("Array fully sorted. Bubble Sort complete.", "COMPLETE");
    return steps;
  }, [initialData]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => prev >= history.length - 1 ? (setIsPlaying(false), prev) : prev + 1);
      }, speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, history.length, speed]);

  const generateArray = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    const size = typeof window !== 'undefined' && window.innerWidth < 768 ? 6 : ARRAY_SIZE;
    const nodes = Array.from({ length: size }, (_, i) => ({
      id: `bubble-node-${Math.random().toString(36).substr(2, 9)}`,
      value: Math.floor(Math.random() * 60) + 20,
      logicalIndex: i,
      status: 'idle' as const
    }));
    setInitialData(nodes);
  };

  const currentStep = history[currentIndex] || { nodes: initialData, explanation: "Initializing...", activeStep: null, comparisonRange: null };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (currentIndex >= history.length - 1) setCurrentIndex(0);
              setIsPlaying(!isPlaying);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--viz-amber)] hover:bg-[var(--viz-amber)]/80 text-black rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause size={14} fill="currentColor" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={generateArray}
            className="p-2.5 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer"
            title="Randomize Array"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Visual Canvas (Bars) */}
      <div className="relative w-full h-[220px] md:h-[280px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-hidden flex items-end justify-center px-4 md:px-8 py-6 shadow-inner">
        <div className="relative w-full h-full flex items-end justify-center gap-2 md:gap-4 max-w-2xl mx-auto">
          {[...currentStep.nodes].sort((a, b) => a.logicalIndex - b.logicalIndex).map((node) => {
            const isComparing = node.status === 'comparing';
            const isSwapping = node.status === 'swapping';
            const isSorted = node.status === 'sorted';

            let nodeBg = "rgba(var(--viz-cyan-rgb), 0.15)";
            let nodeBorder = "rgba(var(--viz-cyan-rgb), 0.3)";
            let nodeShadow = "none";

            if (isSwapping) {
              nodeBg = "var(--viz-rose)";
              nodeBorder = "var(--viz-rose)";
              nodeShadow = "0 0 25px rgba(var(--viz-red-rgb), 0.35)";
            } else if (isComparing) {
              nodeBg = "var(--viz-amber)";
              nodeBorder = "var(--viz-amber)";
              nodeShadow = "0 0 25px rgba(var(--viz-gold-rgb), 0.35)";
            } else if (isSorted) {
              nodeBg = "var(--viz-green)";
              nodeBorder = "var(--viz-green)";
              nodeShadow = "0 0 25px rgba(var(--viz-green-rgb), 0.35)";
            }

            return (
              <motion.div
                key={node.id}
                layout
                animate={{
                  height: `${node.value}%`,
                  backgroundColor: nodeBg,
                  borderColor: nodeBorder,
                  boxShadow: nodeShadow,
                  scale: isComparing || isSwapping ? 1.05 : 1,     
                }}
                transition={{ type: "spring", stiffness: 150, damping: 25 }}
                className="flex-1 border-t-2 border-x-2 rounded-t-xl z-20 flex flex-col items-center justify-start pt-2 font-mono overflow-hidden max-w-[80px]"
                style={{ height: `${node.value}%` }}
              >
                <span className={`${isMobile ? 'text-[8.5px]' : 'text-xs'} font-bold ${isComparing || isSwapping ? 'text-black font-black' : 'text-[var(--foreground)]/60'}`}>
                  {node.value}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Message Box */}
      <div className="w-full px-4 py-2.5 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center shadow-sm">
        <p className="text-xs text-[var(--viz-amber)] font-mono font-bold tracking-tight">
          {currentStep.explanation}
        </p>
      </div>

      {/* Control Timeline */}
      <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-[var(--viz-amber)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
              Step {currentIndex + 1} of {history.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} 
              className="p-1.5 hover:bg-[var(--accent)] border border-[var(--border)]/40 rounded-lg text-[var(--muted-foreground)] transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} 
              className="p-1.5 hover:bg-[var(--accent)] border border-[var(--border)]/40 rounded-lg text-[var(--muted-foreground)] transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="relative flex items-center group/slider w-full h-6">
          <div className="absolute w-full h-1 bg-[var(--border)] rounded-full" />
          <div 
            className="absolute h-1 bg-[var(--viz-amber)] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.4)]" 
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

      {/* Legend Block */}
      <div className="px-4 py-4 bg-[var(--muted)]/20 border border-[var(--border)] rounded-2xl flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-amber)]" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Comparing</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-rose)]" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Swapping</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)]" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-widest">Sorted</span>
        </div>
      </div>
    </div>
  );
}
