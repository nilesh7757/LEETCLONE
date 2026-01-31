"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Sparkles, Hash, Link as LinkIcon, 
  Search, Info, ChevronLeft, ChevronRight, Zap, GitBranch,
  Layers, ArrowUp, MousePointer2, Network, Share2, StepForward,
  TrendingUp, Activity, Layout, Plus, Trash2, Cpu, Database,
  ArrowDown, GitCommit, Split, X, Edit3, Check
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

const UNIT_WIDTH = 60;

interface VisualNode {
  id: string;
  value: number;
  logicalIndex: number;
}

interface HistoryStep {
  nodes: VisualNode[];
  pivotIndex: number | null;
  comparingIndices: [number, number] | null;
  swappingIndices: [number, number] | null;
  sortedIndices: number[];
  activeRange: [number, number] | null;
  message: string;
  step: string;
  logs: string[];
}

export default function QuickSortVisualizer({ speed = 800 }: { speed?: number }) {
  const [initialData, setInitialData] = useState<VisualNode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial Data Generation
  const generateArray = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    const nodes = Array.from({ length: 8 }, (_, i) => ({
      id: `node-${Math.random().toString(36).substr(2, 9)}`,
      value: Math.floor(Math.random() * 50) + 10,
      logicalIndex: i,
    }));
    setInitialData(nodes);
  };

  useEffect(() => { generateArray(); }, []);

  // --- Interactive Editing ---
  const addItem = () => {
    if (initialData.length >= 12) return;
    const val = inputValue ? parseInt(inputValue) : Math.floor(Math.random() * 99) + 1;
    if (isNaN(val)) return;
    
    const newNode: VisualNode = {
      id: `node-${Date.now()}`,
      value: val,
      logicalIndex: initialData.length
    };
    
    setInitialData([...initialData, newNode]);
    setInputValue("");
    setCurrentIndex(0);
  };

  const removeItem = (id: string) => {
    const newData = initialData.filter(n => n.id !== id).map((n, i) => ({ ...n, logicalIndex: i }));
    setInitialData(newData);
    setCurrentIndex(0);
  };

  // Algorithm Engine
  const history = useMemo(() => {
    if (initialData.length === 0) return [];
    
    const steps: HistoryStep[] = [];
    let currentNodes = JSON.parse(JSON.stringify(initialData));
    let logs: string[] = [];
    let sortedIndices: number[] = [];

    const record = (
        msg: string, 
        step: string, 
        range: [number, number] | null = null,
        pivot: number | null = null,
        comp: [number, number] | null = null,
        swap: [number, number] | null = null
    ) => {
      steps.push({
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        pivotIndex: pivot,
        comparingIndices: comp,
        swappingIndices: swap,
        sortedIndices: [...sortedIndices],
        activeRange: range,
        message: msg,
        step: step,
        logs: [...logs]
      });
    };

    const addLog = (l: string) => logs = [l, ...logs];

    addLog("Vector manifold initialized.");
    record("Ready for recursive partition sequence.", "BOOT");

    const swap = (i: number, j: number) => {
        const temp = currentNodes[i];
        currentNodes[i] = currentNodes[j];
        currentNodes[j] = temp;
        // Update logical indices
        currentNodes.forEach((n: VisualNode, idx: number) => n.logicalIndex = idx);
    };

    const partition = (low: number, high: number) => {
      const pivotVal = currentNodes[high].value;
      addLog(`Partition [${low}, ${high}] with pivot ${pivotVal}.`);
      record(`Partitioning range [${low}, ${high}]. Pivot: ${pivotVal}.`, "PARTITION", [low, high], high);

      let i = low - 1;
      for (let j = low; j < high; j++) {
        record(`Comparing ${currentNodes[j].value} < ${pivotVal}?`, "COMPARE", [low, high], high, [j, high]);
        
        if (currentNodes[j].value < pivotVal) {
          i++;
          if (i !== j) {
              addLog(`Swapping ${currentNodes[i].value} and ${currentNodes[j].value}.`);
              record(`Swap: ${currentNodes[j].value} is smaller than pivot. Moving to left partition.`, "SWAP", [low, high], high, [i, j], [i, j]);
              swap(i, j);
              record(`Swap complete.`, "POST_SWAP", [low, high], high, null, null);
          }
        }
      }
      
      const pi = i + 1;
      if (pi !== high) {
          addLog(`Placing pivot ${pivotVal} at correct position ${pi}.`);
          record(`Moving pivot to sorted position ${pi}.`, "PIVOT_SWAP", [low, high], high, [pi, high], [pi, high]);
          swap(pi, high);
          record(`Pivot placed.`, "POST_PIVOT_SWAP", [low, high], pi, null, null);
      }
      return pi;
    };

    const quickSort = (low: number, high: number) => {
      if (low < high) {
        const pi = partition(low, high);
        
        sortedIndices.push(pi);
        addLog(`Pivot index ${pi} is now sorted.`);
        record(`Element at ${pi} is sorted.`, "SORTED", [low, high], pi);

        quickSort(low, pi - 1);
        quickSort(pi + 1, high);
      } else if (low === high) {
          if (!sortedIndices.includes(low)) {
              sortedIndices.push(low);
              addLog(`Element at ${low} is sorted (base case).`);
              record(`Single element range [${low}, ${low}] is sorted.`, "SORTED", [low, high]);
          }
      }
    };

    quickSort(0, currentNodes.length - 1);
    
    // Ensure everything is marked sorted at the end
    sortedIndices = Array.from({length: currentNodes.length}, (_, i) => i);
    addLog("Global sort complete.");
    record("Array fully sorted.", "COMPLETE");
    
    return steps;
  }, [initialData]);

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
    nodes: initialData, 
    pivotIndex: null, 
    comparingIndices: null, 
    swappingIndices: null, 
    sortedIndices: [], 
    activeRange: null, 
    message: "Initializing...", 
    step: "IDLE", 
    logs: [] 
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
              Quick Sort <span className="text-muted-foreground/40">Visualizer</span>
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-1 w-12 bg-[#58C4DD] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/30">Divide & Conquer</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {isEditing && (
                 <>
                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-border">
                        <input 
                            type="number" 
                            value={inputValue} 
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="NUM"
                            className="w-12 bg-transparent text-center text-xs font-bold focus:outline-none"
                        />
                        <button onClick={addItem} className="p-2 hover:bg-[#83C167]/20 rounded-lg text-[#83C167] transition-all"><Plus size={14}/></button>
                    </div>
                    <div className="w-px h-6 bg-border mx-1" />
                 </>
             )}

             <button 
                onClick={() => { setIsEditing(!isEditing); setIsPlaying(false); setCurrentIndex(0); }} 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-bold ${isEditing ? "bg-white text-black border-white shadow-xl" : "bg-muted text-muted-foreground border-border hover:text-foreground"}`}
             >
                {isEditing ? <><Check size={14} /> Done</> : <><Edit3 size={14} /> Edit</>}
             </button>

             {!isEditing && (
                <>
                    <button onClick={generateArray} className="p-3 bg-muted hover:bg-white/5 rounded-xl border border-border transition-all text-muted-foreground hover:text-foreground" title="Randomize"><RotateCcw size={20}/></button>
                    
                    {!isPlaying ? (
                        <button onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(true); }} className="flex items-center gap-2 px-6 py-3 bg-[#58C4DD] text-black rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-lg">
                            <Play size={16} fill="currentColor"/> START
                        </button>
                    ) : (
                        <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 px-6 py-3 bg-white/10 text-foreground rounded-xl font-bold text-xs hover:bg-white/20 transition-all">
                            <Pause size={16} fill="currentColor"/> PAUSE
                        </button>
                    )}
                </>
             )}
          </div>
        </div>

        {/* Visual Canvas */}
        <div className="relative min-h-[500px] bg-muted/40 rounded-[2.5rem] border border-border overflow-hidden shadow-inner flex flex-col items-center justify-center p-8">
            
            {/* Range Indicator */}
            <AnimatePresence>
                {currentStep.activeRange && !isEditing && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ 
                            opacity: 1,
                            x: ( (currentStep.activeRange[0] + currentStep.activeRange[1]) / 2 - (currentStep.nodes.length - 1) / 2 ) * UNIT_WIDTH,
                            width: (currentStep.activeRange[1] - currentStep.activeRange[0] + 1) * UNIT_WIDTH + 20,
                        }}
                        exit={{ opacity: 0 }}
                        className="absolute h-[200px] border-2 border-dashed border-[#58C4DD]/20 rounded-3xl bg-[#58C4DD]/5 z-0 pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* Elements */}
            <div className="relative h-[100px] flex items-center justify-center" style={{ width: currentStep.nodes.length * UNIT_WIDTH }}>
                <AnimatePresence mode="popLayout">
                    {currentStep.nodes.map((node, index) => {
                        const isPivot = currentStep.pivotIndex === index;
                        const isComparing = currentStep.comparingIndices?.includes(index);
                        const isSwapping = currentStep.swappingIndices?.includes(index);
                        const isSorted = currentStep.sortedIndices.includes(index);
                        
                        return (
                            <motion.div
                                key={node.id}
                                layout
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ 
                                    x: (index - (currentStep.nodes.length - 1) / 2) * UNIT_WIDTH,
                                    scale: isSwapping ? 1.1 : 1,
                                    y: isPivot ? -40 : isSwapping ? 20 : 0,
                                    opacity: 1,
                                    backgroundColor: isPivot ? MANIM_COLORS.red : isSorted ? MANIM_COLORS.green : isComparing ? MANIM_COLORS.gold : "var(--card)",
                                    borderColor: isPivot ? MANIM_COLORS.red : isSorted ? MANIM_COLORS.green : isComparing ? MANIM_COLORS.gold : "var(--border)"
                                }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="absolute w-12 h-12 border-2 rounded-xl flex items-center justify-center font-mono shadow-lg z-10"
                            >
                                <span className={`text-sm font-bold ${isPivot || isSorted || isComparing ? "text-white" : "text-foreground"}`}>
                                    {node.value}
                                </span>
                                {isEditing && (
                                    <button 
                                        onClick={() => removeItem(node.id)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 hover:opacity-100 transition-opacity"
                                    >
                                        <X size={8} />
                                    </button>
                                )}
                                {isPivot && !isEditing && (
                                    <div className="absolute -top-6 text-[8px] font-bold text-[#FC6255] uppercase tracking-widest">Pivot</div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Logs Overlay */}
            <div className={`absolute top-6 left-6 z-30 w-[250px] bg-card/90 backdrop-blur border border-border p-4 rounded-2xl shadow-sm max-h-[200px] overflow-hidden flex flex-col transition-opacity ${isEditing ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
                        <Activity size={12} /> Partition Log
                </span>
                <div className="flex flex-col gap-1 overflow-y-auto pr-1 scrollbar-thin">
                    <AnimatePresence mode="popLayout">
                        {currentStep.logs.map((log, i) => (
                            <motion.div 
                                key={`log-${i}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-[9px] font-mono text-muted-foreground/70 leading-tight"
                            >
                                <span className="text-[#58C4DD] mr-1">›</span>{log}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Explanation Toast */}
            <AnimatePresence mode="wait">
                {!isEditing && (
                    <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-8 w-full flex justify-center z-30 pointer-events-none">
                        <div className="px-6 py-3 bg-card/90 border border-border rounded-2xl backdrop-blur-md shadow-2xl max-w-[400px] text-center">
                            <p className="text-xs text-[#f59e0b] font-mono font-medium">{currentStep.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>

        {/* Timeline Scrubber */}
        <div className={`mt-8 p-6 bg-muted border border-border rounded-[2.5rem] flex flex-col gap-4 relative z-10 transition-opacity ${isEditing ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Hash size={14} className="text-[#f59e0b]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Step {currentIndex + 1} of {history.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider">
                <div className="absolute w-full h-1 bg-background/10 rounded-full" />
                <div className="absolute h-1 rounded-full shadow-[0_0_10px_rgba(88,196,221,0.3)]" style={{ width: `${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}%`, backgroundColor: MANIM_COLORS.blue }} />
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
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#FC6255]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Pivot Element</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Comparing</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#83C167]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Sorted</span></div>
         <div className="flex items-center gap-3"><Split size={14} className="text-muted-foreground/20" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Active Range</span></div>
      </div>
    </div>
  );
}