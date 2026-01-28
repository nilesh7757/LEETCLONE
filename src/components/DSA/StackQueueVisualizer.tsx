"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, RotateCcw, Layers, ArrowRight } from "lucide-react";

export default function StackQueueVisualizer() {
  const [items, setItems] = useState<number[]>([10, 20, 30]);
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState<"STACK" | "QUEUE">("STACK");

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

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">{mode} Visualizer</h2>
          <p className="text-sm text-[var(--foreground)]/60">
            {mode === "STACK" ? "LIFO: Last In First Out" : "FIFO: First In First Out"}
          </p>
        </div>
        
        {/* Toggle */}
        <div className="flex bg-[var(--foreground)]/5 p-1 rounded-xl border border-[var(--card-border)]">
          <button 
            onClick={() => { setMode("STACK"); setItems([]); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "STACK" ? "bg-blue-500 text-white shadow-md" : "text-[var(--foreground)]/40 hover:text-[var(--foreground)]"}`}
          >
            <Layers size={14} /> STACK
          </button>
          <button 
            onClick={() => { setMode("QUEUE"); setItems([]); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "QUEUE" ? "bg-green-500 text-white shadow-md" : "text-[var(--foreground)]/40 hover:text-[var(--foreground)]"}`}
          >
            <ArrowRight size={14} /> QUEUE
          </button>
        </div>
      </div>

      <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-16 min-h-[350px]">
        {/* Controls */}
        <div className="flex flex-col gap-3 w-full md:w-48 bg-[var(--foreground)]/5 p-4 rounded-2xl border border-[var(--card-border)]">
          <div className="text-[10px] uppercase font-bold text-[var(--foreground)]/40 mb-1">Operations</div>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter Value"
            className="px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-sm focus:outline-none focus:border-blue-500"
            onKeyDown={(e) => e.key === "Enter" && push()}
          />
          <button
            onClick={push}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all text-white shadow-lg active:scale-95 ${mode === "STACK" ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"}`}
          >
            <ArrowDown size={18} />
            {mode === "STACK" ? "PUSH" : "ENQUEUE"}
          </button>
          <button
            onClick={pop}
            disabled={items.length === 0}
            className="flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold text-sm hover:bg-red-500/20 disabled:opacity-50 active:scale-95"
          >
            <ArrowUp size={18} />
            {mode === "STACK" ? "POP" : "DEQUEUE"}
          </button>
          <button
            onClick={clear}
            className="flex items-center justify-center gap-2 py-3 text-[var(--foreground)]/40 hover:text-[var(--foreground)] text-xs font-bold transition-colors"
          >
            <RotateCcw size={14} />
            RESET
          </button>
        </div>

        {/* Container Visualization */}
        <div className="flex-1 flex items-center justify-center h-full w-full">
            {mode === "STACK" ? (
                // STACK VIEW (Vertical Container)
                <div className="relative w-32 h-80 border-x-4 border-b-4 border-[var(--foreground)]/20 rounded-b-2xl bg-[var(--foreground)]/5 backdrop-blur-sm flex flex-col-reverse items-center justify-start p-2 gap-2 shadow-inner">
                    <AnimatePresence>
                        {items.map((val, i) => (
                            <motion.div
                                key={`${i}-${val}`}
                                layout
                                initial={{ opacity: 0, y: -200, scale: 0.5 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -50, scale: 0.8, transition: { duration: 0.2 } }}
                                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                                className="w-full h-12 rounded-lg bg-blue-500 text-white font-bold flex items-center justify-center shadow-lg border border-white/20 z-10"
                            >
                                {val}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {/* Empty State */}
                    {items.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-[var(--foreground)]/10 font-bold uppercase tracking-widest pointer-events-none">
                            Empty
                        </div>
                    )}
                    
                    {/* Top Indicator */}
                    {items.length > 0 && (
                        <motion.div 
                            layout
                            className="absolute -right-16 top-0 flex items-center gap-2 text-blue-500 font-bold text-xs"
                            style={{ top: 320 - (items.length * 56) }} // Approximate calculation
                        >
                            <ArrowRight size={16} className="rotate-180" /> TOP
                        </motion.div>
                    )}
                </div>
            ) : (
                // QUEUE VIEW (Horizontal Pipe)
                <div className="relative w-full max-w-lg h-32 border-y-4 border-[var(--foreground)]/20 bg-[var(--foreground)]/5 backdrop-blur-sm flex items-center justify-start px-4 gap-4 overflow-hidden rounded-lg shadow-inner">
                     <AnimatePresence initial={false}>
                        {items.map((val, i) => (
                            <motion.div
                                key={`${i}-${val}`}
                                layout
                                initial={{ opacity: 0, x: -100, scale: 0.5 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                                transition={{ type: "spring", damping: 20, stiffness: 120 }}
                                className="min-w-[60px] h-14 rounded-lg bg-green-500 text-white font-bold flex items-center justify-center shadow-lg border border-white/20 z-10"
                            >
                                {val}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {items.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-[var(--foreground)]/10 font-bold uppercase tracking-widest pointer-events-none">
                            Empty Queue
                        </div>
                    )}

                    {items.length > 0 && (
                        <>
                            <div className="absolute left-4 -bottom-8 text-[10px] font-bold text-green-500 uppercase flex flex-col items-center">
                                <ArrowUp size={12}/> REAR (In)
                            </div>
                            <div className="absolute right-4 -bottom-8 text-[10px] font-bold text-red-500 uppercase flex flex-col items-center">
                                <ArrowUp size={12}/> FRONT (Out)
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}