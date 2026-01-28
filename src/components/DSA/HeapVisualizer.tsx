"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, Sparkles, ChevronRight, ChevronLeft, MousePointer2, Plus, Cpu, Trash2 } from "lucide-react";

// --- Types & Palette ---
const MANIM_COLORS = {
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#FFFF00",
  red: "#FC6255",
  background: "#1C1C1C",
  text: "#FFFFFF"
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
  nodes: VisualNode[];
  explanation: string;
  activeStep: string | null;
  highlightedIndices: number[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

export default function HeapVisualizer({ speed = 800 }: { speed?: number }) {
  const [heapData, setHeapData] = useState<number[]>([10, 20, 15, 30, 40]);
  const [inputValue, setInputValue] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [opHistory, setOpHistory] = useState<HistoryStep[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Layout Logic (Array to Tree Mapping)
  const getLayout = (heap: number[]) => {
    const visualNodes: VisualNode[] = [];
    let minX = 0, maxX = 0, minY = 0, maxY = 0;

    const calculate = (idx: number, x: number, y: number, offset: number, parentId: string | null) => {
      if (idx >= heap.length) return;

      const id = `node-${idx}`;
      visualNodes.push({ id, value: heap[idx], index: idx, x, y, parentId, status: 'idle' });

      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;

      const leftIdx = 2 * idx + 1;
      const rightIdx = 2 * idx + 2;
      const nextOffset = offset * 0.5;

      calculate(leftIdx, x - offset, y + 100, nextOffset, id);
      calculate(rightIdx, x + offset, y + 100, nextOffset, id);
    };

    calculate(0, 0, 0, 240, null);
    return { nodes: visualNodes, bounds: { minX, maxX, minY, maxY } };
  };

  // 2. History Recording
  const recordOperation = (type: 'INSERT' | 'EXTRACT', val?: number) => {
    setIsPlaying(false);
    const steps: HistoryStep[] = [];
    const currentHeap = [...heapData];

    const record = (msg: string, step: string | null, highlights: number[] = [], swap: [number, number] | null = null) => {
      const layout = getLayout(currentHeap);
      const frameNodes = layout.nodes.map(n => ({
        ...n,
        status: (swap?.includes(n.index) ? 'swapping' : highlights.includes(n.index) ? 'highlighted' : 'idle') as VisualNode['status']
      }));
      steps.push({
        nodes: frameNodes,
        explanation: msg,
        activeStep: step,
        highlightedIndices: highlights,
        bounds: layout.bounds
      });
    };

    if (type === 'INSERT' && val !== undefined) {
      currentHeap.push(val);
      record(`Allocated memory for ${val} at index ${currentHeap.length - 1}.`, "ALLOC_NODE", [currentHeap.length - 1]);
      
      let idx = currentHeap.length - 1;
      while (idx > 0) {
        const pIdx = Math.floor((idx - 1) / 2);
        record(`Comparing child ${currentHeap[idx]} with parent ${currentHeap[pIdx]}.`, "UP_HEAP", [idx, pIdx]);
        
        if (currentHeap[idx] < currentHeap[pIdx]) {
          record(`Heap violation: ${currentHeap[idx]} < ${currentHeap[pIdx]}. Swapping.`, "SWAP", [idx, pIdx], [idx, pIdx]);
          [currentHeap[idx], currentHeap[pIdx]] = [currentHeap[pIdx], currentHeap[idx]];
          idx = pIdx;
          record(`Transformation executed. Index ${idx} now holds ${currentHeap[idx]}.`, "SWAP_DONE", [idx]);
        } else {
          record(`Heap property satisfied. Sequence is stable.`, "STABLE", [idx, pIdx]);
          break;
        }
      }
      setHeapData([...currentHeap]);
    } 
    else if (type === 'EXTRACT') {
      if (currentHeap.length === 0) return;
      const min = currentHeap[0];
      record(`Extracting root manifold (Min: ${min}).`, "EXTRACT", [0]);
      
      if (currentHeap.length === 1) {
        currentHeap.pop();
      } else {
        const last = currentHeap.pop()!;
        currentHeap[0] = last;
        record(`Replacing root with last element ${last} from index ${currentHeap.length}.`, "REPLACE_ROOT", [0]);
        
        let idx = 0;
        while (true) {
          const lIdx = 2 * idx + 1;
          const rIdx = 2 * idx + 2;
          let smallest = idx;

          if (lIdx < currentHeap.length) {
            if (currentHeap[lIdx] < currentHeap[smallest]) smallest = lIdx;
          }
          if (rIdx < currentHeap.length) {
            if (currentHeap[rIdx] < currentHeap[smallest]) smallest = rIdx;
          }

          if (smallest !== idx) {
            record(`Sinking node ${currentHeap[idx]}. Swapping with child ${currentHeap[smallest]}.`, "DOWN_HEAP", [idx, smallest]);
            record(`Correcting hierarchy...`, "SWAP", [idx, smallest], [idx, smallest]);
            [currentHeap[idx], currentHeap[smallest]] = [currentHeap[smallest], currentHeap[idx]];
            idx = smallest;
            record(`Swap complete. Proceeding with analysis.`, "SWAP_DONE", [idx]);
          } else {
            record(`Root stability achieved. Extract operation complete.`, "STABLE", [idx]);
            break;
          }
        }
      }
      setHeapData([...currentHeap]);
    }

    setOpHistory(steps);
    setCurrentIndex(0);
    setIsPlaying(true);
    setInputValue("");
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= opHistory.length - 1) {
            setIsPlaying(false); return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, opHistory.length, speed]);

  const currentStep = opHistory[currentIndex] || { 
    nodes: getLayout(heapData).nodes, explanation: "Priority Queue initialized. Add nodes to begin.", activeStep: null, bounds: getLayout(heapData).bounds
  };

  // 3. Perfect Fitting Logic
  const canvasW = 800;
  const canvasH = 500;
  const treeW = currentStep.bounds.maxX - currentStep.bounds.minX;
  const treeH = currentStep.bounds.maxY - currentStep.bounds.minY;
  const treeCenterX = (currentStep.bounds.minX + currentStep.bounds.maxX) / 2;
  const scale = Math.min( (canvasW - 120) / Math.max(treeW, 100), (canvasH - 150) / Math.max(treeH, 100), 1 );

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-[3rem] shadow-2xl font-sans text-white relative overflow-hidden group">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 relative z-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-light text-[#58C4DD]">Min-Heap <span className="text-white/20 italic">Lemma</span></h2>
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">Priority Hierarchy Reduction</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-inner group transition-all hover:border-[#FFFF00]/30">
                <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Val" className="w-12 bg-transparent text-center font-mono text-sm font-bold text-[#FFFF00] focus:outline-none" />
                <button onClick={() => recordOperation('INSERT', parseInt(inputValue))} className="p-2 bg-[#58C4DD] text-black rounded-xl active:scale-90 shadow-lg"><Plus size={16} strokeWidth={3}/></button>
                <button onClick={() => recordOperation('EXTRACT')} className="p-2 bg-[#FC6255] text-white rounded-xl active:scale-90 shadow-lg" title="Extract Min"><Trash2 size={16} /></button>
            </div>
            <button onClick={() => { setHeapData([]); setOpHistory([]); setCurrentIndex(0); }} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/20 hover:text-[#FC6255] transition-all"><RotateCcw size={18} /></button>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative min-h-[550px] bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner overflow-hidden flex items-center justify-center">
            
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                 style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

            {/* Scaling Wrapper */}
            <motion.div 
                animate={{ 
                    scale: scale,
                    x: -treeCenterX * scale,
                    y: -450 * scale + (canvasH / 2) // Shifted higher
                }}
                transition={{ type: "spring", stiffness: 80, damping: 25 }}
                className="relative w-full h-full flex items-center justify-center"
            >
                {/* SVG Edges */}
                <svg className="absolute pointer-events-none overflow-visible w-full h-full" style={{ zIndex: 10 }}>
                    {currentStep.nodes.map((node) => {
                        if (!node.parentId) return null;
                        const parent = currentStep.nodes.find(n => n.id === node.parentId);
                        if (!parent) return null;
                        return (
                            <motion.line
                                key={`edge-${node.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.8 }}
                                x1={parent.x} y1={parent.y}
                                x2={node.x} y2={node.y}
                                stroke={MANIM_COLORS.blue}
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        );
                    })}
                </svg>

                {/* Nodes */}
                <div className="relative z-20">
                    {currentStep.nodes.map((node) => {
                        const isHighlighted = currentStep.highlightedIndices?.includes(node.index);
                        const isSwapping = node.status === 'swapping';
                        
                        return (
                            <motion.div
                                key={node.id}
                                layout
                                initial={{ scale: 0 }}
                                animate={{ 
                                    x: node.x, y: node.y, 
                                    scale: isHighlighted || isSwapping ? 1.2 : 1,
                                    borderColor: isSwapping ? MANIM_COLORS.red : isHighlighted ? MANIM_COLORS.gold : MANIM_COLORS.blue,
                                    boxShadow: isSwapping ? `0 0 50px ${MANIM_COLORS.red}66` : isHighlighted ? `0 0 35px ${MANIM_COLORS.gold}44` : "none"
                                }}
                                className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-[3px] rounded-full flex items-center justify-center font-mono bg-[#111111] z-30 shadow-2xl"
                                style={{ color: isSwapping ? MANIM_COLORS.red : isHighlighted ? MANIM_COLORS.gold : "white" }}
                            >
                                <span className="text-xl font-bold">{node.value}</span>
                                {(isHighlighted || isSwapping) && (
                                    <motion.div layoutId="node-pointer" className="absolute -top-16 flex flex-col items-center gap-1">
                                        <div className="text-[#FFFF00]"><MousePointer2 size={18} fill="currentColor" className="rotate-[225deg]" /></div>
                                        <span className="text-[9px] font-black text-[#FFFF00] tracking-widest bg-black/40 px-2 py-0.5 rounded-full border border-yellow-500/20">ANALYSIS</span>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Explanation Overlay */}
            <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-10 w-full max-w-[400px] text-center z-40">
                    <div className="p-5 bg-black/90 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl">
                        <p className="text-[10px] text-[#FFFF00] font-mono leading-relaxed italic uppercase tracking-tighter opacity-80">{currentStep.explanation}</p>
                    </div>
                </motion.div>
            </AnimatePresence>

            <AnimatePresence>
                {currentStep.activeStep && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute top-8 left-8 flex items-center gap-3 px-5 py-2 bg-[#58C4DD]/10 border border-[#58C4DD]/30 rounded-full z-30 shadow-lg backdrop-blur-md">
                        <Cpu size={14} className="text-[#58C4DD]" />
                        <span className="text-[10px] font-black font-mono text-[#58C4DD] uppercase tracking-[0.25em]">{currentStep.activeStep}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Scrubber */}
        <div className="mt-8 p-8 bg-white/[0.03] border border-white/10 rounded-[3rem] flex flex-col gap-6 relative z-10 backdrop-blur-sm">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Sparkles size={16} className="text-[#FFFF00]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Lemma Chronicle Frame {currentIndex + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 text-white/60 transition-all">{isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}</button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-2 text-white/40 active:scale-90"><ChevronLeft size={22} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((opHistory.length || 1) - 1, currentIndex + 1)); }} className="p-2 text-white/40 active:scale-90"><ChevronRight size={22} /></button>
                </div>
            </div>
            <div className="relative flex items-center group/slider px-2">
                <div className="absolute w-full h-1 bg-white/10 rounded-full left-0" />
                <div className="absolute h-1 bg-[#58C4DD] rounded-full" style={{ width: `${(currentIndex / ((opHistory.length || 1) - 1 || 1)) * 100}%` }} />
                <input type="range" min="0" max={(opHistory.length || 1) - 1} value={currentIndex} onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }} className="w-full h-8 opacity-0 cursor-pointer z-10" />
                <motion.div className="absolute w-2 h-6 bg-[#FFFF00] rounded-full shadow-[0_0_15px_#FFFF00] pointer-events-none" animate={{ left: `calc(${(currentIndex / ((opHistory.length || 1) - 1 || 1)) * 100}% - 4px)` }} />
            </div>
        </div>
      </div>
    </div>
  );
}