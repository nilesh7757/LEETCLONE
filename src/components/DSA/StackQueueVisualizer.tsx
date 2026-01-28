"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, RotateCcw, Layers, ArrowRight, Plus, Trash2 } from "lucide-react";

const MANIM_COLORS = {
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#FFFF00",
  red: "#FC6255",
  background: "#1C1C1C",
  text: "#FFFFFF"
};

export default function StackQueueVisualizer({ speed = 800 }: { speed?: number }) {
  const [items, setItems] = useState<number[]>([10, 20, 30]);
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState<"STACK" | "QUEUE">("STACK");
  
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const containerRef = useRef<HTMLDivElement>(null);

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

  const push = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setItems([...items, val]);
    setInputValue("");
  };

  const pop = () => {
    if (items.length === 0) return;
    if (mode === "STACK") {
      setItems(items.slice(0, -1));
    } else {
      setItems(items.slice(1));
    }
  };

  const clear = () => setItems([]);

  // Scaling Logic
  const contentHeight = mode === "STACK" ? Math.max(350, items.length * 60 + 100) : 150;
  const contentWidth = mode === "STACK" ? 200 : Math.max(600, items.length * 80 + 200);
  
  const scale = Math.min(
      (dimensions.width - 40) / contentWidth, 
      (dimensions.height - 40) / contentHeight, 
      1
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-[3rem] shadow-2xl font-sans text-white relative overflow-hidden group">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-8 relative z-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-light text-[#58C4DD]">{mode === "STACK" ? "Stack" : "Queue"} <span className="text-white/20 italic">Lemma</span></h2>
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">
                {mode === "STACK" ? "LIFO: Last In First Out" : "FIFO: First In First Out"}
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
             <button onClick={() => { setMode("STACK"); setItems([]); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${mode === "STACK" ? "bg-[#58C4DD] text-black shadow-lg" : "text-white/40 hover:text-white"}`}>
                <Layers size={14} /> STACK
             </button>
             <button onClick={() => { setMode("QUEUE"); setItems([]); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${mode === "QUEUE" ? "bg-[#83C167] text-black shadow-lg" : "text-white/40 hover:text-white"}`}>
                <ArrowRight size={14} /> QUEUE
             </button>
          </div>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-8 items-center justify-center">
            {/* Controls */}
            <div className="flex flex-col gap-3 w-full lg:w-64 bg-white/[0.03] p-6 rounded-[2.5rem] border border-white/10">
                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest px-2">Operations</span>
                <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
                    <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Val"
                        className="w-full bg-transparent text-center font-mono text-sm font-bold text-white focus:outline-none"
                        onKeyDown={(e) => e.key === "Enter" && push()}
                    />
                </div>
                <button onClick={push} className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs bg-[#58C4DD] text-black hover:scale-105 transition-all shadow-lg active:scale-95">
                    <Plus size={16} strokeWidth={3} /> {mode === "STACK" ? "PUSH" : "ENQUEUE"}
                </button>
                <button onClick={pop} disabled={items.length === 0} className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs bg-[#FC6255]/10 text-[#FC6255] border border-[#FC6255]/20 hover:bg-[#FC6255]/20 disabled:opacity-50 active:scale-95 transition-all">
                    <Trash2 size={16} /> {mode === "STACK" ? "POP" : "DEQUEUE"}
                </button>
                <button onClick={clear} className="flex items-center justify-center gap-2 py-3 text-white/20 hover:text-white text-[10px] font-bold tracking-widest transition-colors mt-2">
                    <RotateCcw size={12} /> RESET SYSTEM
                </button>
            </div>

            {/* Canvas */}
            <div ref={containerRef} className="relative flex-1 w-full h-[450px] bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
                
                <motion.div 
                    animate={{ scale: scale }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="relative flex items-center justify-center"
                    style={{ width: contentWidth, height: contentHeight }}
                >
                    {mode === "STACK" ? (
                        // STACK CONTAINER
                        <div className="relative w-40 h-[320px] border-x-[6px] border-b-[6px] border-white/10 rounded-b-3xl bg-white/[0.02] flex flex-col-reverse items-center justify-start p-3 gap-2 overflow-visible">
                            <AnimatePresence>
                                {items.map((val, i) => (
                                    <motion.div
                                        key={`${i}-${val}`}
                                        layout
                                        initial={{ opacity: 0, y: -200, scale: 0.5 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -50, scale: 0.8, transition: { duration: 0.2 } }}
                                        transition={{ type: "spring", damping: 15, stiffness: 200 }}
                                        className="w-full h-14 rounded-xl bg-[#58C4DD] text-black font-mono font-bold text-lg flex items-center justify-center shadow-[0_0_20px_#58C4DD44] z-10 border border-white/20"
                                    >
                                        {val}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {items.length === 0 && <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-white/10 rotate-90">Empty</span>}
                        </div>
                    ) : (
                        // QUEUE CONTAINER
                        <div className="relative w-full h-32 border-y-[4px] border-white/10 bg-white/[0.02] flex items-center justify-start px-6 gap-4 rounded-xl overflow-hidden">
                            <AnimatePresence initial={false}>
                                {items.map((val, i) => (
                                    <motion.div
                                        key={`${i}-${val}`}
                                        layout
                                        initial={{ opacity: 0, x: -100, scale: 0.5 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                                        transition={{ type: "spring", damping: 20, stiffness: 120 }}
                                        className="min-w-[70px] h-16 rounded-2xl bg-[#83C167] text-black font-mono font-bold text-lg flex items-center justify-center shadow-[0_0_20px_#83C16744] z-10 border border-white/20"
                                    >
                                        {val}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            
                            {items.length === 0 && <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-white/10">Queue Empty</span>}

                            {items.length > 0 && (
                                <>
                                    <div className="absolute left-6 -bottom-10 text-[9px] font-black text-[#83C167] uppercase tracking-widest flex flex-col items-center gap-1">
                                        <ArrowUp size={12}/> REAR
                                    </div>
                                    <div className="absolute right-6 -bottom-10 text-[9px] font-black text-[#FC6255] uppercase tracking-widest flex flex-col items-center gap-1">
                                        <ArrowUp size={12}/> FRONT
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
      </div>
    </div>
  );
}
