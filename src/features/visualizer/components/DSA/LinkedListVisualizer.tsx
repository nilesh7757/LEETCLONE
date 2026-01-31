"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RotateCcw, Play, Pause, ChevronLeft, ChevronRight, Zap, 
  ArrowRight, Plus, Trash2, Search, Hash, Link as LinkIcon
} from "lucide-react";

// --- Configuration ---
const NODE_SIZE = 60;
const GAP_SIZE = 60; // Space for the arrow

// Manim-inspired Palette
const COLORS = { 
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#f59e0b",
  red: "#FC6255",
  purple: "#9A72AC",
  muted: "rgba(255,255,255,0.1)"
};

interface LLNode {
  id: string;
  value: number;
}

interface ListStep {
  nodes: LLNode[];
  activeId: string | null;     // Node being processed
  highlightIds: string[];      // Nodes involved in operation (e.g. traversal path)
  phase: "IDLE" | "TRAVERSE" | "FOUND" | "INSERT" | "DELETE" | "NOT_FOUND";
  message: string;
}

export default function LinkedListVisualizer({ speed = 800 }: { speed?: number }) {
  // --- State ---
  const [list, setList] = useState<LLNode[]>([
    { id: 'n-1', value: 10 },
    { id: 'n-2', value: 20 },
    { id: 'n-3', value: 30 }
  ]);
  const [history, setHistory] = useState<ListStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Initialization ---
  useEffect(() => {
    // Initial static state
    setHistory([{
        nodes: list,
        activeId: null,
        highlightIds: [],
        phase: "IDLE",
        message: "Linked List Ready."
    }]);
  }, []); // Run once on mount

  // --- Operations ---
  const pushBack = () => {
    const val = parseInt(inputValue) || Math.floor(Math.random() * 99);
    const steps: ListStep[] = [];
    const currentNodes = [...list]; // Snapshot of current state
    const newNode = { id: `n-${Date.now()}`, value: val };

    // 1. Traversal
    for (let i = 0; i < currentNodes.length; i++) {
        steps.push({
            nodes: currentNodes,
            activeId: currentNodes[i].id,
            highlightIds: currentNodes.slice(0, i+1).map(n => n.id),
            phase: "TRAVERSE",
            message: `Traversing to tail... (Node ${i})`
        });
    }

    // 2. Insertion
    const newNodes = [...currentNodes, newNode];
    steps.push({
        nodes: newNodes,
        activeId: newNode.id,
        highlightIds: [],
        phase: "INSERT",
        message: `Allocated new node [${val}] and linked next pointer.`
    });

    // 3. Idle
    steps.push({
        nodes: newNodes,
        activeId: null,
        highlightIds: [],
        phase: "IDLE",
        message: "Insertion Complete."
    });

    updateHistory(steps, newNodes);
  };

  const popBack = () => {
    if (list.length === 0) return;
    const steps: ListStep[] = [];
    const currentNodes = [...list];

    // 1. Traversal to second last
    for (let i = 0; i < currentNodes.length; i++) {
        steps.push({
            nodes: currentNodes,
            activeId: currentNodes[i].id,
            highlightIds: currentNodes.slice(0, i+1).map(n => n.id),
            phase: "TRAVERSE",
            message: i === currentNodes.length - 1 ? "Tail found." : "Traversing..."
        });
    }

    // 2. Deletion
    const target = currentNodes[currentNodes.length - 1];
    const newNodes = currentNodes.slice(0, -1);
    
    steps.push({
        nodes: currentNodes, // Keep node visible but marked
        activeId: target.id,
        highlightIds: [target.id],
        phase: "DELETE",
        message: `Releasing memory for node [${target.value}]. Setting prev->next = NULL.`
    });

    // 3. Final State
    steps.push({
        nodes: newNodes,
        activeId: null,
        highlightIds: [],
        phase: "IDLE",
        message: "Deletion Complete."
    });

    updateHistory(steps, newNodes);
  };

  const search = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    const steps: ListStep[] = [];
    const currentNodes = [...list];
    let found = false;

    for (let i = 0; i < currentNodes.length; i++) {
        const isMatch = currentNodes[i].value === val;
        steps.push({
            nodes: currentNodes,
            activeId: currentNodes[i].id,
            highlightIds: currentNodes.slice(0, i).map(n => n.id),
            phase: isMatch ? "FOUND" : "TRAVERSE",
            message: isMatch ? `Value ${val} found at index ${i}!` : `Checking node [${currentNodes[i].value}]...`
        });
        if (isMatch) {
            found = true;
            break;
        }
    }

    if (!found) {
        steps.push({
            nodes: currentNodes,
            activeId: null,
            highlightIds: [],
            phase: "NOT_FOUND",
            message: `Value ${val} not found in the list.`
        });
    } else {
         steps.push({
            nodes: currentNodes,
            activeId: null,
            highlightIds: [],
            phase: "IDLE",
            message: "Search Complete."
        });
    }

    updateHistory(steps, currentNodes);
  };

  const updateHistory = (steps: ListStep[], finalState: LLNode[]) => {
    setList(finalState);
    setHistory(steps);
    setCurrentIndex(0);
    setIsPlaying(true);
    setInputValue("");
  };

  // --- Playback Engine ---
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, history.length, speed]);

  const currentStep = history[currentIndex] || history[0] || {
    nodes: [],
    activeId: null,
    highlightIds: [],
    phase: "IDLE",
    message: "Ready"
  };

  // --- Visual Helpers ---
  const activeColor = 
    currentStep.phase === "FOUND" ? COLORS.green :
    currentStep.phase === "DELETE" ? COLORS.red :
    currentStep.phase === "INSERT" ? COLORS.purple :
    currentStep.phase === "TRAVERSE" ? COLORS.gold :
    COLORS.blue;

  return (
    <div className="flex flex-col gap-6 select-none font-sans">
      
      {/* --- Main Dashboard --- */}
      <div className="bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col">
         {/* Background Grid */}
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

         {/* Header & Inputs */}
         <div className="relative z-10 p-6 border-b border-border bg-muted/20 flex flex-col xl:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-[#58C4DD]/10 rounded-2xl text-[#58C4DD]">
                    <LinkIcon size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Linked List</h2>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Dynamic Memory Allocation</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-card p-1.5 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-3 px-4 border-r border-border">
                    <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-wider">Data</span>
                    <input 
                        type="number" value={inputValue} 
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="VAL"
                        className="w-12 bg-transparent font-mono text-sm font-bold text-[#f59e0b] focus:outline-none text-center placeholder:text-muted-foreground/30"
                    />
                </div>
                <button onClick={pushBack} className="p-2 hover:bg-[#83C167]/10 rounded-xl text-[#83C167] transition-all" title="Push Back">
                    <Plus size={18} />
                </button>
                <button onClick={popBack} className="p-2 hover:bg-[#FC6255]/10 rounded-xl text-[#FC6255] transition-all" title="Pop Back">
                    <Trash2 size={18} />
                </button>
                <button onClick={search} className="p-2 hover:bg-[#58C4DD]/10 rounded-xl text-[#58C4DD] transition-all" title="Search">
                    <Search size={18} />
                </button>
                <div className="w-[1px] h-6 bg-border mx-1" />
                <button onClick={() => { setList([]); setHistory([]); setCurrentIndex(0); }} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all" title="Reset">
                    <RotateCcw size={16} />
                </button>
            </div>
         </div>

         {/* --- The Visual Stage --- */}
         <div className="relative min-h-[400px] bg-muted/5 flex flex-col items-center justify-center p-8 overflow-hidden">
            
            {/* Logic Badge */}
            <div className="absolute top-6 left-6">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border bg-card/50 backdrop-blur-md shadow-sm`} style={{ borderColor: `${activeColor}40` }}>
                    <Zap size={12} fill={activeColor} className="text-transparent" />
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: activeColor }}>{currentStep.phase}</span>
                </div>
            </div>

            {/* List Container */}
            <div className="flex items-center justify-center flex-wrap max-w-[90%] gap-y-12">
                <AnimatePresence mode="popLayout">
                    {currentStep.nodes.map((node, index) => {
                        const isActive = node.id === currentStep.activeId;
                        const isVisited = currentStep.highlightIds.includes(node.id);
                        
                        return (
                            <React.Fragment key={node.id}>
                                {/* Node */}
                                <motion.div
                                    layout
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ 
                                        scale: isActive ? 1.15 : 1, 
                                        opacity: currentStep.phase === "DELETE" && isActive ? 0.5 : 1,
                                        borderColor: isActive ? activeColor : isVisited ? COLORS.gold : "var(--border)",
                                        backgroundColor: isActive ? `${activeColor}20` : isVisited ? `${COLORS.gold}10` : "var(--card)",
                                        boxShadow: isActive ? `0 0 25px ${activeColor}44` : "none"
                                    }}
                                    exit={{ scale: 0, opacity: 0, y: 20 }}
                                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                                    className="relative w-16 h-16 border-2 rounded-2xl flex flex-col items-center justify-center bg-card z-10"
                                >
                                    <span className={`text-sm font-bold font-mono ${isActive ? "text-white" : "text-muted-foreground"}`}>{node.value}</span>
                                    
                                    {/* Address Label */}
                                    <div className="absolute -top-6 text-[8px] font-mono text-muted-foreground/40">
                                        0x{node.id.split('-')[1].slice(-3)}
                                    </div>
                                </motion.div>

                                {/* Arrow (Edge) */}
                                <motion.div 
                                    layout
                                    className="flex items-center justify-center w-16 text-muted-foreground/20"
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: GAP_SIZE, opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                >
                                    <ArrowRight size={24} strokeWidth={3} />
                                </motion.div>
                            </React.Fragment>
                        );
                    })}
                </AnimatePresence>
                
                {/* NULL Terminator */}
                <motion.div 
                    layout
                    className="w-12 h-12 rounded-xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center"
                >
                    <span className="text-[8px] font-black text-muted-foreground/30">NULL</span>
                </motion.div>
            </div>

         </div>

         {/* --- Info Footer --- */}
         <div className="border-t border-border bg-card p-6 flex flex-col md:flex-row gap-8 items-center">
            
            <div className="flex-1 w-full space-y-4">
                <div className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-card border border-border">
                        <Hash size={14} className="text-muted-foreground" />
                    </div>
                    <p className="font-mono text-sm leading-relaxed text-foreground/80 flex-1">
                        <span className="text-[#58C4DD] mr-2">»</span>
                        {currentStep.message}
                    </p>
                </div>
            </div>

            {/* Playback Scrubber */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }}
                    className="p-2 hover:bg-muted rounded-xl transition-all disabled:opacity-50"
                    disabled={currentIndex === 0}
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="text-[10px] font-black font-mono text-muted-foreground w-12 text-center">
                    {currentIndex + 1} / {history.length}
                </div>
                <button 
                    onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }}
                    className="p-2 hover:bg-muted rounded-xl transition-all disabled:opacity-50"
                    disabled={currentIndex === history.length - 1}
                >
                    <ChevronRight size={20} />
                </button>
            </div>

         </div>

         {/* Progress Line */}
         <div className="h-1 w-full bg-muted">
             <motion.div 
                className="h-full bg-[#58C4DD]" 
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / history.length) * 100}%` }}
             />
         </div>

      </div>
    </div>
  );
}
