"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RotateCcw, ChevronLeft, ChevronRight, Zap, 
  ArrowRight, Plus, Trash2, Search, Hash
} from "lucide-react";

// --- Configuration ---
const GAP_SIZE = 60; // Space for the arrow

// Manim-inspired Palette
const COLORS = { 
  blue: "var(--viz-lime)",
  green: "var(--viz-green)",
  gold: "var(--viz-amber)",
  red: "var(--viz-rose)",
  purple: "var(--viz-lime)",
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
  const [history, setHistory] = useState<ListStep[]>([{
    nodes: [
      { id: 'n-1', value: 10 },
      { id: 'n-2', value: 20 },
      { id: 'n-3', value: 30 }
    ],
    activeId: null,
    highlightIds: [],
    phase: "IDLE",
    message: "Linked List Ready."
  }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateHistory = (steps: ListStep[], finalState: LLNode[]) => {
    setList(finalState);
    setHistory(steps);
    setCurrentIndex(0);
    setIsPlaying(true);
    setInputValue("");
  };

  // --- Operations ---
  const pushBack = React.useCallback(() => {
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
  }, [inputValue, list]);

  const popBack = React.useCallback(() => {
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
  }, [list]);

  const search = React.useCallback(() => {
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
  }, [inputValue, list]);

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
    <div className="flex flex-col gap-6 select-none font-sans w-full">
      
      {/* Action Controls Toolbar - Clean and elegant */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
         <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-wider">Linked List Operations</span>
         </div>
         <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-[var(--muted)]/30 border border-[var(--border)] rounded-xl">
               <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-wider">Data</span>
               <input 
                  type="number" value={inputValue} 
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="VAL"
                  className="w-12 bg-transparent font-mono text-xs font-bold text-[var(--viz-amber)] focus:outline-none text-center placeholder:text-muted-foreground/30"
               />
            </div>
            <button onClick={pushBack} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--viz-green)]/10 hover:bg-[var(--viz-green)]/20 rounded-xl text-[var(--viz-green)] transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer" title="Push Back">
               <Plus size={14} /> Add
            </button>
            <button onClick={popBack} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--viz-rose)]/10 hover:bg-[var(--viz-rose)]/20 rounded-xl text-[var(--viz-rose)] transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer" title="Pop Back">
               <Trash2 size={14} /> Delete
            </button>
            <button onClick={search} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--viz-lime)]/10 hover:bg-[var(--viz-lime)]/20 rounded-xl text-[var(--viz-lime)] transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer" title="Search">
               <Search size={14} /> Find
            </button>
            <div className="w-[1px] h-6 bg-[var(--border)] mx-1" />
            <button onClick={() => { setList([]); setHistory([]); setCurrentIndex(0); }} className="p-2 hover:bg-[var(--accent)] rounded-xl text-[var(--muted-foreground)] transition-all cursor-pointer" title="Reset">
               <RotateCcw size={14} />
            </button>
         </div>
      </div>

      {/* The Visual Stage Canvas */}
      <div className="relative w-full h-[50vh] md:h-[60vh] min-h-[400px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-x-auto overflow-y-hidden no-scrollbar flex items-center justify-center px-4 md:px-8 shadow-inner">
         
         {/* Active Phase Badge */}
         <div className="absolute top-4 left-4 z-20">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-[var(--card)]/80 backdrop-blur-md shadow-sm" style={{ borderColor: `${activeColor}40` }}>
                 <Zap size={10} fill={activeColor} className="text-transparent" />
                 <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: activeColor }}>{currentStep.phase}</span>
             </div>
         </div>

         {/* List Nodes Wrapper */}
         <div className="flex items-center justify-center flex-wrap max-w-full gap-y-12 py-10 min-w-[600px]">
             <AnimatePresence mode="popLayout">
                 {currentStep.nodes.map((node) => {
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

      {/* Info Footer & Playback Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl mt-4 relative z-10">
         <div className="flex items-center justify-between w-full md:w-auto gap-4 flex-1">
             <div className="flex items-center gap-2">
                 <Hash size={14} className="text-[var(--primary)]" />        
                 <span className="text-[10px] font-mono text-[var(--foreground)]/80 italic">{currentStep.message}</span>
             </div>
             <div className="flex items-center gap-2 shrink-0">
                 <button 
                     onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }}
                     className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/60 transition-all cursor-pointer"
                     disabled={currentIndex === 0}
                 >
                     <ChevronLeft size={18} />
                 </button>
                 <span className="text-[10px] font-black font-mono text-muted-foreground w-12 text-center">
                     {currentIndex + 1} / {history.length}
                 </span>
                 <button 
                     onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }}
                     className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/60 transition-all cursor-pointer"
                     disabled={currentIndex === history.length - 1}
                 >
                     <ChevronRight size={18} />
                 </button>
             </div>
         </div>
      </div>

    </div>
  );
}
