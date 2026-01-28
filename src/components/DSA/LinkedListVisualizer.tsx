"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Play, Pause, MousePointer2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

interface Node {
  id: string;
  value: number;
  status: 'idle' | 'highlighted' | 'deleted';
}

interface HistoryStep {
  nodes: Node[];
  explanation: string;
  activeStep: string | null;
  highlightedId: string | null;
}

const MANIM_COLORS = {
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#FFFF00",
  red: "#FC6255",
  background: "#1C1C1C",
  text: "#FFFFFF"
};

const INITIAL_NODES: Node[] = [
    { id: 'node-1', value: 10, status: 'idle' },
    { id: 'node-2', value: 20, status: 'idle' },
    { id: 'node-3', value: 30, status: 'idle' },
];

export default function LinkedListVisualizer({ speed = 800 }: { speed?: number }) {
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [inputValue, setInputValue] = useState("");
  
  // History Tracking
  const [history, setHistory] = useState<HistoryStep[]>([{
        nodes: INITIAL_NODES,
        explanation: "LinkedList initialized in memory.",
        activeStep: "INIT",
        highlightedId: null
  }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const addStep = (newNodes: Node[], msg: string, step: string | null, highlighted: string | null) => {
    const next: HistoryStep = {
        nodes: JSON.parse(JSON.stringify(newNodes)),
        explanation: msg,
        activeStep: step,
        highlightedId: highlighted
    };
    setHistory(prev => [...prev, next]);
    setCurrentIndex(h => h + 1);
  };

  const addNode = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    const newNode: Node = { id: `node-${Date.now()}`, value: val, status: 'idle' };
    const nextNodes = [...nodes, newNode];
    setNodes(nextNodes);
    setInputValue("");
    addStep(nextNodes, `Allocated new node with value ${val}.`, "PUSH_BACK", newNode.id);
  };

  const deleteNode = (id: string) => {
    const nodeToDelete = nodes.find(n => n.id === id);
    if (!nodeToDelete) return;
    const val = nodeToDelete.value;
    const nextNodes = nodes.filter((node) => node.id !== id);
    setNodes(nextNodes);
    addStep(nextNodes, `Deallocated node ${val}. Memory reference removed.`, "DELETE", null);
  };

  const simulateSearch = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    
    setIsPlaying(false);
    const currentHistory = [...history];
    const tempNodes = JSON.parse(JSON.stringify(nodes));

    // Pre-compute search steps
    for (let i = 0; i < tempNodes.length; i++) {
      const step: HistoryStep = {
        nodes: JSON.parse(JSON.stringify(tempNodes)),
        explanation: `Comparing ${tempNodes[i].value} with target ${val}...`,
        activeStep: `SEARCH(${val})`,
        highlightedId: tempNodes[i].id
      };
      currentHistory.push(step);
      
      if (tempNodes[i].value === val) {
        currentHistory.push({
            ...step,
            explanation: `Match found! Element located at index ${i}.`
        });
        break;
      }
      
      if (i === tempNodes.length - 1) {
        currentHistory.push({
            ...step,
            explanation: `End of sequence. Value ${val} not found.`,
            highlightedId: null
        });
      }
    }

    setHistory(currentHistory);
    setCurrentIndex(currentHistory.length - 1);
    setInputValue("");
  };

  // Playback Logic
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

  const currentStep = history[currentIndex] || { nodes: nodes, explanation: "Initializing...", activeStep: null, highlightedId: null };

  return (
    <div className="flex flex-col gap-6">
      <div className="p-8 bg-[#1C1C1C] border border-[#333333] rounded-3xl shadow-2xl font-sans text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[#58C4DD]">
              Linked List <span className="text-white/40">Lemma</span>
            </h2>
            <div className="flex items-center gap-2">
               <div className="h-1 w-12 bg-[#58C4DD] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">Temporal Reference Sequence</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-inner">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="N"
              className="w-16 px-1 py-2 bg-transparent border-b border-white/10 text-center font-mono focus:outline-none focus:border-[#FFFF00] transition-colors"
            />
            <button onClick={addNode} className="p-2 hover:bg-[#58C4DD]/20 text-[#58C4DD] rounded-xl transition-all"><Plus size={22} /></button>
            <button onClick={simulateSearch} className="p-2 hover:bg-[#FFFF00]/20 text-[#FFFF00] rounded-xl transition-all"><Play size={22} /></button>
          </div>
        </div>

        {/* Animation Canvas */}
        <div className="relative min-h-[400px] bg-black/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl flex flex-wrap items-center justify-start p-10 gap-y-24">
          
          <AnimatePresence>
            {currentStep.activeStep && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute top-8 left-10 flex items-center gap-2 px-4 py-1.5 bg-[#58C4DD]/10 border border-[#58C4DD]/30 rounded-full z-30">
                    <Sparkles size={12} className="text-[#58C4DD]" />
                    <span className="text-[10px] font-black font-mono text-[#58C4DD] uppercase tracking-[0.2em]">{currentStep.activeStep}</span>
                </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {currentStep.nodes.map((node) => (
              <React.Fragment key={node.id}>
                <div className="relative flex items-center">
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 1, scale: 1,
                      borderColor: currentStep.highlightedId === node.id ? MANIM_COLORS.gold : MANIM_COLORS.blue,
                      boxShadow: currentStep.highlightedId === node.id ? `0 0 40px ${MANIM_COLORS.gold}33` : "none"
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="group relative flex items-center justify-center w-20 h-20 border-[3px] rounded-full font-mono text-xl font-medium bg-[#1C1C1C] z-20"
                    style={{ color: currentStep.highlightedId === node.id ? MANIM_COLORS.gold : MANIM_COLORS.text }}
                  >
                    {node.value}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">addr</span>
                      <span className="text-[10px] font-mono text-[#58C4DD]/60">0x{node.id.slice(-4)}</span>
                    </div>

                    {currentStep.highlightedId === node.id && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20">
                            <div className="text-[#FFFF00]"><MousePointer2 size={18} fill="currentColor" className="rotate-90" /></div>
                            <span className="text-[10px] font-bold text-[#FFFF00] font-mono tracking-widest bg-black/40 px-2 py-0.5 rounded-full border border-yellow-500/20">CURR</span>
                        </motion.div>
                    )}

                    <button onClick={() => deleteNode(node.id)} className="absolute -right-2 -bottom-2 p-1.5 bg-[#FC6255] text-white rounded-full opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"><Trash2 size={12} /></button>
                  </motion.div>

                  <div className="flex items-center h-full">
                    <motion.div initial={{ width: 0 }} animate={{ width: 64 }} className="relative h-[2px]" style={{ backgroundColor: currentStep.highlightedId === node.id ? MANIM_COLORS.gold : `${MANIM_COLORS.blue}44` }}>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-t-2 border-r-2" style={{ borderColor: currentStep.highlightedId === node.id ? MANIM_COLORS.gold : `${MANIM_COLORS.blue}44` }} />
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white/10 uppercase tracking-tighter italic">next</div>
                    </motion.div>
                  </div>
                </div>
              </React.Fragment>
            ))}
            <div className="w-14 h-14 rounded-2xl border-2 border-[#FC6255]/30 flex items-center justify-center text-[#FC6255] font-mono text-xs font-bold tracking-widest bg-[#FC6255]/5 ml-4">NULL</div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-12 w-full text-center z-30 pointer-events-none px-10">
                <div className="inline-block p-4 bg-[#FFFF00]/5 border border-[#FFFF00]/20 rounded-2xl backdrop-blur-md shadow-2xl">
                    <p className="text-[10px] text-[#FFFF00] font-mono leading-relaxed italic uppercase tracking-tighter">{currentStep.explanation}</p>
                </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Premium Scrubber */}
        <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Sparkles size={14} className="text-[#FFFF00]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Chronicle Step {currentIndex + 1} of {history.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 text-white/60 hover:text-white transition-all">{isPlaying ? <Pause size={18} /> : <Play size={18} />}</button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40"><ChevronRight size={18} /></button>
                </div>
            </div>
            <div className="relative flex items-center group/slider">
                <div className="absolute w-full h-1 bg-white/10 rounded-full" />
                <div className="absolute h-1 bg-[#58C4DD] rounded-full" style={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }} />
                <input type="range" min="0" max={history.length - 1} value={currentIndex} onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }} className="w-full h-6 opacity-0 cursor-pointer z-10" />
                <div className="absolute w-1.5 h-4 bg-[#FFFF00] rounded-full shadow-[0_0_15px_#FFFF00] pointer-events-none transition-all" style={{ left: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 3px)` }} />
            </div>
        </div>
      </div>
    </div>
  );
}
