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
            message: `Traversing to end... visiting node ${i + 1} of ${currentNodes.length}`
        });
    }

    // 2. Insertion
    const newNodes = [...currentNodes, newNode];
    steps.push({
        nodes: newNodes,
        activeId: newNode.id,
        highlightIds: [],
        phase: "INSERT",
        message: `New node [${val}] created and appended to the end.`
    });

    // 3. Idle
    steps.push({
        nodes: newNodes,
        activeId: null,
        highlightIds: [],
        phase: "IDLE",
        message: `Node [${val}] added. List size is now ${newNodes.length}.`
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
            message: i === currentNodes.length - 1 ? `Tail found at index ${i}.` : `Traversing... at node ${i + 1}.`
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
        message: `Removing node [${target.value}] from the end. Updating previous node's pointer to NULL.`
    });

    // 3. Final State
    steps.push({
        nodes: newNodes,
        activeId: null,
        highlightIds: [],
        phase: "IDLE",
        message: `Node [${target.value}] deleted. List size is now ${newNodes.length}.`
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
            message: isMatch ? `Found! Value ${val} is at index ${i}.` : `Node [${currentNodes[i].value}] does not match. Moving next.`
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

      {/* The Visual Stage Canvas — no horizontal overflow */}
      <div className="relative w-full min-h-[300px] md:min-h-[420px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col items-center justify-center px-4 md:px-8 py-10 shadow-inner">

         {/* Phase Badge */}
         <div className="absolute top-4 left-4 z-20">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-[var(--card)]/80 backdrop-blur-md shadow-sm" style={{ borderColor: `${activeColor}40` }}>
                 <Zap size={10} fill={activeColor} className="text-transparent" />
                 <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: activeColor }}>{currentStep.phase}</span>
             </div>
         </div>

         {/* Empty state */}
         {currentStep.nodes.length === 0 && (
             <div className="flex flex-col items-center gap-3 opacity-40">
                 <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Empty List</span>
                 <span className="text-[9px] font-mono text-[var(--muted-foreground)]/60">Add a node to get started</span>
             </div>
         )}

         {/* Node Row — fully responsive, wraps on small screens */}
         <div className="flex items-center justify-center flex-wrap gap-y-8 gap-x-0 max-w-full w-full">
             <AnimatePresence mode="popLayout">
                 {currentStep.nodes.map((node) => {
                     const isActive = node.id === currentStep.activeId;
                     const isVisited = currentStep.highlightIds.includes(node.id);

                     return (
                         <React.Fragment key={node.id}>
                             {/* Node box */}
                             <motion.div
                                 layout
                                 initial={{ scale: 0, opacity: 0 }}
                                 animate={{
                                     scale: isActive ? 1.15 : 1,
                                     opacity: currentStep.phase === "DELETE" && isActive ? 0.4 : 1,
                                     borderColor: isActive ? activeColor : isVisited ? COLORS.gold : "var(--border)",
                                     backgroundColor: isActive ? `${activeColor}20` : isVisited ? `${COLORS.gold}10` : "var(--card)",
                                     boxShadow: isActive ? `0 0 25px ${activeColor}44` : "none"
                                 }}
                                 exit={{ scale: 0, opacity: 0, y: 20 }}
                                 transition={{ type: "spring", stiffness: 150, damping: 20 }}
                                 className="relative w-14 h-14 md:w-16 md:h-16 border-2 rounded-2xl flex flex-col items-center justify-center bg-[var(--card)] z-10 flex-shrink-0"
                             >
                                 <span className={`text-sm font-bold font-mono ${isActive ? "text-white" : "text-[var(--muted-foreground)]"}`}>{node.value}</span>
                             </motion.div>

                             {/* Arrow */}
                             <motion.div
                                 layout
                                 className="flex items-center justify-center w-8 md:w-12 text-[var(--muted-foreground)]/20 flex-shrink-0"
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 exit={{ opacity: 0 }}
                             >
                                 <ArrowRight size={18} strokeWidth={2.5} />
                             </motion.div>
                         </React.Fragment>
                     );
                 })}
             </AnimatePresence>

             {/* NULL terminator */}
             {currentStep.nodes.length > 0 && (
                 <motion.div layout className="w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 border-dashed border-[var(--muted-foreground)]/20 flex items-center justify-center flex-shrink-0">
                     <span className="text-[7px] md:text-[8px] font-black text-[var(--muted-foreground)]/30">NULL</span>
                 </motion.div>
             )}
         </div>
      </div>

      {/* Step message */}
      <div className="w-full px-4 py-2.5 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center">
          <p className="text-xs text-[var(--viz-lime)] font-mono font-medium">{currentStep.message}</p>
      </div>

      {/* Playback Controls + Scrubber */}
      <div className="flex flex-col gap-3 w-full p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
         <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                 <Hash size={14} className="text-[var(--viz-lime)]" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Step {currentIndex + 1} of {history.length}</span>
             </div>
             <div className="flex items-center gap-2">
                 <button
                     onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }}
                     className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/60 transition-all cursor-pointer"
                     disabled={currentIndex === 0}
                 >
                     <ChevronLeft size={18} />
                 </button>
                 <button
                     onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }}
                     className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/60 transition-all cursor-pointer"
                     disabled={currentIndex === history.length - 1}
                 >
                     <ChevronRight size={18} />
                 </button>
             </div>
         </div>

         {/* Scrubber */}
         <div className="relative flex items-center w-full">
             <div className="absolute w-full h-1 bg-[var(--muted)]/30 rounded-full" />
             <div
                 className="absolute h-1 rounded-full transition-all"
                 style={{ width: `${(currentIndex / Math.max(history.length - 1, 1)) * 100}%`, backgroundColor: "var(--viz-lime)" }}
             />
             <input
                 type="range" min="0" max={Math.max(history.length - 1, 0)} value={currentIndex}
                 onChange={e => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                 className="w-full h-6 opacity-0 cursor-pointer z-10"
             />
             <div
                 className="absolute w-1.5 h-4 rounded-full pointer-events-none transition-all"
                 style={{ left: `calc(${(currentIndex / Math.max(history.length - 1, 1)) * 100}% - 3px)`, backgroundColor: "var(--viz-lime)" }}
             />
         </div>
      </div>

    </div>
  );
}
