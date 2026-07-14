"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Sparkles, Hash, Info, ChevronRight, 
  ChevronLeft
} from "lucide-react";

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
  const [nodeWidth, setNodeWidth] = useState(65);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setNodeWidth(mobile ? 35 : 65);
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
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    record("Vector space initialized. Press Execute to begin monotonic transformation.", "INIT");

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
          record(`Transformation executed. Indices updated.`, "SWAP_DONE", [j, j+1]);

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
      record(`Pass complete. Index ${sortedIdx} is now part of the sorted manifold.`, "BUBBLED");
    }

    record("Monotonic order achieved. Algorithm terminated.", "COMPLETE");
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
    const nodes = Array.from({ length: ARRAY_SIZE }, (_, i) => ({
      id: `bubble-node-${Math.random().toString(36).substr(2, 9)}`,
      value: Math.floor(Math.random() * 60) + 20,
      logicalIndex: i,
      status: 'idle' as const
    }));
    setInitialData(nodes);
  };

  const currentStep = history[currentIndex] || { nodes: initialData, explanation: "Initializing...", activeStep: null, comparisonRange: null };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className={`p-4 md:p-8 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl font-sans text-[var(--foreground)] relative overflow-hidden flex-1 flex flex-col`}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[var(--viz-amber)]">
              Bubble Sort <span className="text-[var(--muted-foreground)]/40">Analysis</span>
            </h2>
            <div className="flex items-center gap-2">
               <div className="h-1 w-12 bg-[var(--viz-amber)] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)]/30">Temporal Manifold Navigation</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[var(--muted)] p-2 rounded-2xl border border-[var(--border)] shadow-inner">
            <button onClick={generateArray} className="p-2 hover:bg-[var(--accent)] rounded-xl text-[var(--muted-foreground)] active:scale-95 transition-all"><RotateCcw size={20} /></button>
            {!isPlaying ? (
              <button onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(true); }} className="flex items-center gap-2 px-6 py-2 bg-[var(--viz-amber)] text-[var(--background)] rounded-xl hover:scale-105 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg"><Play size={14} fill="currentColor" /> EXECUTE</button>
            ) : (
              <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 px-6 py-2 bg-[var(--viz-rose)]/20 text-[var(--viz-rose)] border border-[var(--viz-rose)]/50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[var(--viz-rose)]/30 transition-all"><Pause size={14} fill="currentColor" /> HALT</button>
            )}
          </div>
        </div>

        <div className="relative min-h-[350px] md:min-h-[480px] w-full bg-[var(--muted)]/40 rounded-[2.5rem] border border-[var(--border)] overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar shadow-2xl flex flex-col items-center justify-center px-4 md:px-10">
            {currentStep.activeStep && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-4 left-4 md:top-8 md:left-10 flex items-center gap-2 px-4 py-2 bg-[var(--viz-amber)]/10 border border-[var(--viz-amber)]/30 rounded-full z-30 shadow-lg pointer-events-none">
                    <Sparkles size={12} className="text-[var(--viz-amber)]" />
                    <span className="text-[9px] font-black font-mono text-[var(--viz-amber)] uppercase tracking-[0.2em]">{currentStep.activeStep}</span>
                </motion.div>
            )}

            <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-12 w-full max-w-[500px] px-4 md:px-10 text-center z-30 pointer-events-none">
                    <div className="p-4 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl backdrop-blur-md shadow-2xl">
                        <div className="flex items-center justify-center gap-2 mb-1 opacity-40">
                            <Info size={10} className="text-[var(--primary)]" />
                            <span className="text-[8px] font-black uppercase tracking-tighter text-[var(--foreground)]">Analysis Entry</span>
                        </div>
                        <p className="text-[10px] text-[var(--viz-amber)] font-mono leading-relaxed italic uppercase tracking-tighter">{currentStep.explanation}</p>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="relative w-full h-full min-w-[600px] flex items-end justify-center pb-32">
                {currentStep.nodes.map((node) => {
                    const isComparing = node.status === 'comparing';
                    const isSwapping = node.status === 'swapping';
                    const isSorted = node.status === 'sorted';
                    const nodeColor = isSwapping ? "var(--viz-rose)" : isComparing ? "var(--viz-amber)" : isSorted ? "var(--viz-green)" : "rgba(var(--viz-blue-rgb), 0.15)";
                    const nodeColorRGB = isSwapping ? "var(--viz-red-rgb)" : isComparing ? "var(--viz-gold-rgb)" : isSorted ? "var(--viz-green-rgb)" : "var(--viz-blue-rgb)";
                    
                                        return (
                                            <motion.div
                                                key={node.id}
                                                layout
                                                animate={{
                                                    x: (node.logicalIndex - (currentStep.nodes.length - 1) / 2) * nodeWidth,
                                                    height: `${node.value}%`,
                                                    backgroundColor: nodeColor,
                                                    borderColor: isSwapping || isComparing || isSorted ? nodeColor : "rgba(var(--viz-blue-rgb), 0.3)",
                                                    boxShadow: isComparing || isSwapping || isSorted ? `0 0 35px rgba(${nodeColorRGB}, 0.3)` : "none",
                                                    scale: isComparing || isSwapping ? 1.1 : 1,     
                                                }}
                                                transition={{ type: "spring", stiffness: 120, damping: 25 }}
                                                className={`absolute bottom-0 ${isMobile ? 'w-7' : 'w-12'} border-t-2 border-x-2 rounded-t-xl z-20 flex flex-col items-center justify-start pt-2 font-mono overflow-hidden`}
                                            >
                                                <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-bold ${isComparing || isSwapping ? 'text-[var(--background)]' : 'text-[var(--foreground)]/60'}`}>{node.value}</span>
                                                <div className={`mt-auto pb-1 ${isMobile ? 'text-[6px]' : 'text-[8px]'} opacity-20 uppercase ${isComparing || isSwapping ? 'text-[var(--background)]' : 'text-[var(--foreground)]'}`}>0x{node.id.slice(-4)}</div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                    
                            <div className="mt-8 p-4 md:p-3 md:p-6 bg-[var(--muted)] border border-[var(--border)] rounded-[2rem] md:rounded-[2.5rem] flex flex-col gap-4 relative z-10">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 px-2">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <Hash size={14} className="text-[var(--primary)]" />        
                                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Step {currentIndex + 1} of {history.length}</span>
                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1 md:p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all"><ChevronLeft size={isMobile ? 16 : 18} /></button>
                                                        <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1 md:p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all"><ChevronRight size={isMobile ? 16 : 18} /></button>
                                                    </div>                                </div>
                                <div className="relative flex items-center group/slider w-full md:w-auto flex-1">
                <div className="absolute w-full h-1 bg-[var(--background)]/10 rounded-full" />
                <div className="absolute h-1 bg-[var(--viz-amber)] rounded-full shadow-[0_0_10px_rgba(var(--viz-blue-rgb), 0.4)]" style={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }} />
                <input 
                    type="range" min="0" max={history.length - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute w-1.5 h-4 bg-[var(--viz-amber)] rounded-full shadow-[0_0_15px_rgba(var(--viz-gold-rgb), 0.5)] pointer-events-none transition-all"
                    style={{ left: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 3px)` }}
                />
            </div>
        </div>
      </div>

      <div className="px-4 md:px-10 py-6 bg-[var(--muted)]/20 border border-[var(--border)] rounded-[2.5rem] flex flex-wrap items-center justify-center gap-4 md:gap-12 text-center text-[8px] md:text-[10px]">
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-amber)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Scanning Manifold</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-rose)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Active Displacement</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)]" /><span className="text-[8px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Ordered Manifold</span></div>
      </div>
    </div>
  );
}


