"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, Sparkles, ChevronRight, ChevronLeft, MousePointer2, Plus, Search } from "lucide-react";

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
  char: string;
  x: number;
  y: number;
  parentId: string | null;
  isEndOfWord: boolean;
  status: 'idle' | 'highlighted' | 'active' | 'success';
}

interface HistoryStep {
  nodes: VisualNode[];
  explanation: string;
  activeStep: string | null;
  highlightedId: string | null;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

class TrieNode {
  children: { [key: string]: TrieNode } = {};
  isEndOfWord: boolean = false;
  char: string;
  id: string;

  constructor(char: string) {
    this.char = char;
    this.id = `node-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 1. Position Calculation
const getLayout = (trieRoot: TrieNode) => {
  const visualNodes: VisualNode[] = [];
  let minX = 0, maxX = 0, minY = 0, maxY = 0;

  const calculate = (node: TrieNode, x: number, y: number, offset: number, parentId: string | null) => {
    visualNodes.push({ id: node.id, char: node.char, x, y, parentId, isEndOfWord: node.isEndOfWord, status: 'idle' });

    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;

    const children = Object.keys(node.children).sort();
    const count = children.length;
    if (count === 0) return;

    const spacing = offset * 2 / Math.max(count - 1, 1);
    let startX = x - offset;
    if (count === 1) startX = x;

    children.forEach((char, i) => {
      const childX = count === 1 ? x : startX + i * spacing;
      calculate(node.children[char], childX, y + 100, offset * 0.45, node.id);
    });
  };

  calculate(trieRoot, 0, 0, 280, null);
  return { nodes: visualNodes, bounds: { minX, maxX, minY, maxY } };
};

export default function TrieVisualizer({ speed = 800 }: { speed?: number }) {
  const rootRef = useRef<TrieNode>(new TrieNode("*"));
  const [inputValue, setInputValue] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [opHistory, setOpHistory] = useState<HistoryStep[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Resize Observer
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

  // 2. History Recording
  const recordOperation = (type: 'INSERT' | 'SEARCH', word: string) => {
    if (!word) return;
    const targetWord = word.toUpperCase().slice(0, 8);
    setIsPlaying(false);
    const steps: HistoryStep[] = [];
    const currentTrie = rootRef.current;

    const record = (msg: string, step: string | null, hId: string | null, statusOverride?: Record<string, string>) => {
      const layout = getLayout(currentTrie);
      const frameNodes = layout.nodes.map(n => ({
        ...n,
        status: (statusOverride?.[n.id] as VisualNode['status']) || (n.id === hId ? 'active' : 'idle')
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
      let curr = currentTrie;
      record(`Initializing insertion for "${targetWord}".`, "START", curr.id);
      
      for (let i = 0; i < targetWord.length; i++) {
        const char = targetWord[i];
        record(`Scanning character '${char}'.`, "SCAN", curr.id);
        if (!curr.children[char]) {
          curr.children[char] = new TrieNode(char);
          record(`Allocating cell for '${char}'.`, "ALLOC", curr.children[char].id);
        } else {
          record(`Match! Prefix '${char}' exists.`, "MATCH", curr.children[char].id);
        }
        curr = curr.children[char];
      }
      curr.isEndOfWord = true;
      record(`Word "${targetWord}" marked as complete.`, "TERMINAL", curr.id, { [curr.id]: 'success' });
    } 
    else if (type === 'SEARCH') {
      let curr = currentTrie;
      record(`Searching for "${targetWord}".`, "SEARCH_START", curr.id);
      let found = true;
      for (let i = 0; i < targetWord.length; i++) {
        const char = targetWord[i];
        if (!curr.children[char]) {
          record(`'${char}' not found. Aborting.`, "MISS", curr.id);
          found = false; break;
        }
        curr = curr.children[char];
        record(`Path match: '${char}' found.`, "SCAN_MATCH", curr.id);
      }
      if (found) {
        if (curr.isEndOfWord) record(`Found! Word "${targetWord}" resolved.`, "FOUND", curr.id, { [curr.id]: 'success' });
        else record(`Prefix exists, but not a complete word.`, "PREFIX_ONLY", curr.id);
      }
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

  const defaultStep = { 
    nodes: getLayout(new TrieNode("*")).nodes, 
    explanation: "System ready.", 
    activeStep: null, 
    highlightedId: null, 
    bounds: getLayout(new TrieNode("*")).bounds
  };

  const currentStep = opHistory[currentIndex] || defaultStep;

  // 3. Scale & Center Logic

  const treeW = currentStep.bounds.maxX - currentStep.bounds.minX;
  const treeH = currentStep.bounds.maxY - currentStep.bounds.minY;
  const treeCenterX = (currentStep.bounds.minX + currentStep.bounds.maxX) / 2;
  const scale = Math.min( (dimensions.width - 100) / Math.max(treeW, 100), (dimensions.height - 100) / Math.max(treeH, 100), 1 );

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-[3rem] shadow-2xl font-sans text-white relative overflow-hidden group">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 relative z-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-light text-[#58C4DD]">Trie <span className="text-white/20 italic">Lemma</span></h2>
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">Temporal Memory Logic</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-inner group transition-all hover:border-[#FFFF00]/30">
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Word" className="w-16 bg-transparent text-center font-mono text-sm font-bold text-[#FFFF00] focus:outline-none uppercase" />
                <button onClick={() => recordOperation('INSERT', inputValue)} className="p-2 bg-[#58C4DD] text-black rounded-xl active:scale-90 shadow-lg"><Plus size={16} strokeWidth={3}/></button>
                <button onClick={() => recordOperation('SEARCH', inputValue)} className="p-2 bg-[#FFFF00] text-black rounded-xl active:scale-90 shadow-lg"><Search size={16} strokeWidth={3}/></button>
            </div>
            <button onClick={() => { rootRef.current = new TrieNode("*"); setOpHistory([]); setCurrentIndex(0); }} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/20 hover:text-[#FC6255] transition-all"><RotateCcw size={18} /></button>
          </div>
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="relative min-h-[550px] bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

            {/* Scale Wrapper */}
            <motion.div 
                animate={{ 
                    scale: scale,
                    x: -treeCenterX * scale,
                    y: (dimensions.height / 2) - 450 // Fixed top position relative to dynamic height
                }}
                transition={{ type: "spring", stiffness: 80, damping: 25 }}
                className="relative w-full h-full flex items-center justify-center"
            >
                {/* SVG Lines - MOVED INSIDE TRANSFORMED DIV */}
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
                        const isHighlighted = currentStep.highlightedId === node.id;
                        const isSuccess = node.status === 'success';
                        return (
                            <motion.div
                                key={node.id}
                                layout
                                initial={{ scale: 0 }}
                                animate={{ 
                                    x: node.x, y: node.y, 
                                    scale: isHighlighted ? 1.2 : 1,
                                    borderColor: isSuccess ? MANIM_COLORS.green : isHighlighted ? MANIM_COLORS.gold : MANIM_COLORS.blue,
                                    boxShadow: isSuccess ? `0 0 50px ${MANIM_COLORS.green}66` : isHighlighted ? `0 0 30px ${MANIM_COLORS.gold}44` : "none"
                                }}
                                className="absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 border-[3px] rounded-full flex items-center justify-center font-mono bg-[#111111] z-20 shadow-xl"
                                style={{ color: isSuccess ? MANIM_COLORS.green : isHighlighted ? MANIM_COLORS.gold : "white" }}
                            >
                                <span className="text-xl font-bold">{node.char === '*' ? '●' : node.char}</span>
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

            {/* Explanation Overlay */}
            <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-10 w-full max-w-[400px] text-center z-40">
                    <div className="p-5 bg-black/90 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl">
                        <p className="text-[10px] text-[#FFFF00] font-mono leading-relaxed italic uppercase tracking-tighter opacity-80">{currentStep.explanation}</p>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Scrubber */}
        <div className="mt-8 p-8 bg-white/[0.03] border border-white/10 rounded-[3rem] flex flex-col gap-6 relative z-10 backdrop-blur-sm">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Sparkles size={16} className="text-[#FFFF00]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Step {currentIndex + 1} of {opHistory.length || 1}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 text-white/60 transition-all">{isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}</button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-2 text-white/40 active:scale-90"><ChevronLeft size={22} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((opHistory.length || 1) - 1, currentIndex + 1)); }} className="p-2 text-white/40 active:scale-90"><ChevronRight size={22} /></button>
                </div>
            </div>
            <div className="relative flex items-center group/slider">
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