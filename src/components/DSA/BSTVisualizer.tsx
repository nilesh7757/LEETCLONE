"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, Sparkles, Hash, Info, ChevronRight, ChevronLeft, GitMerge, MousePointer2, Plus, Search, Cpu } from "lucide-react";

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
  x: number;
  y: number;
  parentId: string | null;
  status: 'idle' | 'highlighted' | 'found' | 'comparing';
}

interface HistoryStep {
  nodes: VisualNode[];
  explanation: string;
  activeStep: string | null;
  highlightedId: string | null;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

class Node {
  value: number;
  id: string;
  left: Node | null = null;
  right: Node | null = null;

  constructor(value: number) {
    this.value = value;
    this.id = `node-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default function BSTVisualizer({ speed = 800 }: { speed?: number }) {
  const [treeRoot, setTreeRoot] = useState<Node | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [opHistory, setOpHistory] = useState<HistoryStep[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Position Calculation
  const getLayout = (root: Node | null) => {
    const visualNodes: VisualNode[] = [];
    let minX = 0, maxX = 0, minY = 0, maxY = 0;

    const calculate = (node: Node | null, x: number, y: number, offset: number, parentId: string | null) => {
      if (!node) return;
      visualNodes.push({ id: node.id, value: node.value, x, y, parentId, status: 'idle' });
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      const nextOffset = offset * 0.5; 
      calculate(node.left, x - offset, y + 100, nextOffset, node.id);
      calculate(node.right, x + offset, y + 100, nextOffset, node.id);
    };

    calculate(root, 0, 0, 240, null);
    return { nodes: visualNodes, bounds: { minX, maxX, minY, maxY } };
  };

  // 2. Operation Recording
  const recordOperation = (type: 'INSERT' | 'SEARCH', val: number) => {
    if (isNaN(val)) return;
    setIsPlaying(false);
    const steps: HistoryStep[] = [];
    let currentRoot = treeRoot; 

    const record = (root: Node | null, msg: string, step: string | null, hId: string | null, statusOverride?: string) => {
      const layout = getLayout(root);
      const frameNodes = layout.nodes.map(n => ({
        ...n,
        status: (n.id === hId) ? (statusOverride as any || 'comparing') : 'idle'
      }));
      steps.push({
        nodes: frameNodes,
        explanation: msg,
        activeStep: step,
        highlightedId: hId,
        bounds: layout.bounds
      });
    };

    if (type === 'INSERT') {
      let newNode = new Node(val);
      if (!currentRoot) {
        currentRoot = newNode;
        setTreeRoot(newNode);
        record(newNode, `Allocating root memory for ${val}.`, "INIT_ROOT", newNode.id, 'found');
      } else {
        let curr: Node | null = currentRoot;
        let parent: Node | null = null;
        while (curr) {
          record(currentRoot, `Traversing hierarchy: Evaluating ${curr.value}.`, "TRAVERSE", curr.id);
          parent = curr;
          if (val < curr.value) {
            record(currentRoot, `${val} < ${curr.value}: Descending LEFT.`, "MOVE_L", curr.id);
            curr = curr.left;
          } else if (val > curr.value) {
            record(currentRoot, `${val} > ${curr.value}: Descending RIGHT.`, "MOVE_R", curr.id);
            curr = curr.right;
          } else {
            record(currentRoot, `Value ${val} exists. Operation stable.`, "STABLE", curr.id, 'found');
            setOpHistory(steps); setCurrentIndex(0); return;
          }
        }
        if (parent) {
          if (val < parent.value) parent.left = newNode;
          else parent.right = newNode;
          setTreeRoot({...currentRoot} as Node);
          record(currentRoot, `Terminal located. Linking node ${val}.`, "LINK", newNode.id, 'found');
        }
      }
    } else if (type === 'SEARCH') {
      let curr = currentRoot;
      if (!curr) record(null, "Memory manifold is empty.", "EMPTY", null);
      else {
        while (curr) {
          record(currentRoot, `Evaluating node ${curr.value}...`, "SCAN", curr.id);
          if (val === curr.value) {
            record(currentRoot, `Success! Target found.`, "FOUND", curr.id, 'found');
            break;
          }
          curr = val < curr.value ? curr.left : curr.right;
          if (!curr) record(currentRoot, `Target ${val} not present.`, "MISS", null);
        }
      }
    }
    setOpHistory(steps); setCurrentIndex(0); setIsPlaying(true); setInputValue("");
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= opHistory.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, opHistory.length, speed]);

  const currentStep = opHistory[currentIndex] || { 
    nodes: getLayout(treeRoot).nodes, 
    explanation: "Ready for tree analysis.", 
    activeStep: null, 
    highlightedId: null,
    bounds: getLayout(treeRoot).bounds
  };

  // Fitting logic
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
            <h2 className="text-3xl font-light text-[#58C4DD]">BST <span className="text-white/20 italic">Lemma</span></h2>
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">Temporal Memory Flow</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-inner group transition-all hover:border-[#FFFF00]/30">
                <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Val" className="w-12 bg-transparent text-center font-mono text-sm font-bold text-[#FFFF00] focus:outline-none" />
                <button onClick={() => recordOperation('INSERT', parseInt(inputValue))} className="p-2 bg-[#58C4DD] text-black rounded-xl active:scale-90 shadow-lg"><Plus size={16} strokeWidth={3}/></button>
                <button onClick={() => recordOperation('SEARCH', parseInt(inputValue))} className="p-2 bg-[#FFFF00] text-black rounded-xl active:scale-90 shadow-lg"><Search size={16} strokeWidth={3}/></button>
            </div>
            <button onClick={() => { setTreeRoot(null); setOpHistory([]); setCurrentIndex(0); }} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/20 hover:text-[#FC6255] transition-all active:scale-90"><RotateCcw size={18} /></button>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative min-h-[550px] bg-black rounded-[2.5rem] border border-white/5 shadow-inner overflow-hidden flex items-center justify-center">
            
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                 style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

            {/* Scaling and Centering Container */}
            <motion.div 
                animate={{ 
                    scale: scale,
                    x: -treeCenterX * scale,
                    y: -400 * scale + (canvasH / 2) // Shifted higher to 400
                }}
                transition={{ type: "spring", stiffness: 80, damping: 25 }}
                className="relative w-full h-full flex items-center justify-center"
            >
                {/* SVG Edges - MOVED INSIDE THE TRANSFORMED DIV FOR COORDINATE SYNC */}
                <svg className="absolute pointer-events-none overflow-visible w-full h-full" style={{ zIndex: 5 }}>
                    {currentStep.nodes.map((node) => {
                        if (!node.parentId) return null;
                        const parent = currentStep.nodes.find(n => n.id === node.parentId);
                        if (!parent) return null;
                        return (
                            <motion.line
                                key={`edge-${node.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                x1={parent.x} y1={parent.y}
                                x2={node.x} y2={node.y}
                                stroke={MANIM_COLORS.blue}
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        );
                    })}
                </svg>

                {/* DOM Nodes */}
                <div className="relative z-10">
                    {currentStep.nodes.map((node) => {
                        const isHighlighted = currentStep.highlightedId === node.id && node.status !== 'found';
                        const isFound = node.status === 'found';
                        return (
                            <motion.div
                                key={node.id}
                                layout
                                initial={{ scale: 0 }}
                                animate={{ 
                                    x: node.x, y: node.y, 
                                    scale: isFound ? 1.2 : 1,
                                    borderColor: isFound ? MANIM_COLORS.green : isHighlighted ? MANIM_COLORS.gold : MANIM_COLORS.blue,
                                    boxShadow: isFound ? `0 0 50px ${MANIM_COLORS.green}66` : isHighlighted ? `0 0 30px ${MANIM_COLORS.gold}44` : "none"
                                }}
                                className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-[3px] rounded-full flex items-center justify-center font-mono bg-[#111111] z-20 shadow-xl"
                                style={{ color: isFound ? MANIM_COLORS.green : isHighlighted ? MANIM_COLORS.gold : "white" }}
                            >
                                <span className="text-xl font-bold">{node.value}</span>
                                {isHighlighted && (
                                    <motion.div layoutId="node-pointer" className="absolute -top-16 flex flex-col items-center gap-1">
                                        <div className="text-[#FFFF00]"><MousePointer2 size={18} fill="currentColor" className="rotate-[225deg]" /></div>
                                        <span className="text-[9px] font-black text-[#FFFF00] tracking-widest bg-black/40 px-2 py-0.5 rounded-full border border-yellow-500/20">CURSOR</span>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Explanations */}
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
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Step {currentIndex + 1} of {opHistory.length || 1}</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 text-white/60">{isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}</button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-2 text-white/40"><ChevronLeft size={22} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((opHistory.length || 1) - 1, currentIndex + 1)); }} className="p-2 text-white/40"><ChevronRight size={22} /></button>
                </div>
            </div>
            <div className="relative flex items-center px-2">
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