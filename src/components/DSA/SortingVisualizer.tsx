"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, ArrowUp } from "lucide-react";

const ARRAY_SIZE = 12;

export default function SortingVisualizer({ speed = 300 }: { speed?: number }) {
  const [array, setArray] = useState<number[]>([]);
  const [isSorting, setIsSorting] = useState(false);
  const [comparing, setComparing] = useState<number[]>([]); // [j, j+1]
  const [swapping, setSwapping] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [status, setStatus] = useState("Ready");
  const stopRef = useRef(false);

  useEffect(() => {
    generateArray();
  }, []);

  const generateArray = () => {
    const newArray = Array.from({ length: ARRAY_SIZE }, () =>
      Math.floor(Math.random() * 70) + 15
    );
    setArray(newArray);
    setComparing([]);
    setSwapping([]);
    setSorted([]);
    setIsSorting(false);
    setStatus("Ready");
    stopRef.current = false;
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const bubbleSort = async () => {
    if (isSorting) return;
    setIsSorting(true);
    stopRef.current = false;
    let arr = [...array];
    let n = arr.length;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (stopRef.current) return;
        
        setComparing([j, j + 1]);
        setStatus(`Comparing ${arr[j]} and ${arr[j+1]}`);
        await sleep(speed);

        if (arr[j] > arr[j + 1]) {
          setStatus(`Swapping ${arr[j]} > ${arr[j+1]}`);
          setSwapping([j, j + 1]);
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          await sleep(speed);
          setSwapping([]);
        }
      }
      setSorted((prev) => [...prev, n - i - 1]);
    }
    setComparing([]);
    setStatus("Sorted!");
    setIsSorting(false);
  };

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Bubble Sort</h2>
          <p className="text-sm text-[var(--foreground)]/60">O(N²) Strategy</p>
        </div>
        
        {/* Status Badge */}
        <div className="px-4 py-2 bg-[var(--foreground)]/5 rounded-full border border-[var(--card-border)] text-xs font-mono font-bold text-[var(--foreground)]/80">
            {status}
        </div>

        <div className="flex gap-2">
          <button
            onClick={generateArray}
            className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg transition-colors"
            title="Reset Array"
            disabled={isSorting}
          >
            <RotateCcw size={20} />
          </button>
          {!isSorting ? (
            <button
              onClick={bubbleSort}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-gradient-to)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <Play size={18} fill="currentColor" />
              Visualize
            </button>
          ) : (
            <button
              onClick={() => { stopRef.current = true; setIsSorting(false); setStatus("Stopped"); }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-all font-medium"
            >
              <Pause size={18} fill="currentColor" />
              Stop
            </button>
          )}
        </div>
      </div>

      <div className="relative flex items-end justify-center gap-2 h-64 px-4 pb-8 bg-[var(--foreground)]/5 rounded-2xl border border-[var(--card-border)] overflow-hidden">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-10 pointer-events-none">
            <div className="w-full h-px bg-[var(--foreground)]" />
            <div className="w-full h-px bg-[var(--foreground)]" />
            <div className="w-full h-px bg-[var(--foreground)]" />
            <div className="w-full h-px bg-[var(--foreground)]" />
        </div>

        {array.map((value, idx) => {
          const isComparing = comparing.includes(idx);
          const isSwapping = swapping.includes(idx);
          const isSorted = sorted.includes(idx);
          
          let bgClass = "bg-[var(--foreground)]/30";
          if (isSorted) bgClass = "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]";
          else if (isSwapping) bgClass = "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]";
          else if (isComparing) bgClass = "bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]";

          return (
            <div key={idx} className="relative flex flex-col items-center gap-2 w-8 sm:w-10 h-full justify-end group">
                {/* Value Label */}
                <motion.div 
                    layout
                    className="text-[10px] font-bold text-[var(--foreground)]/60 mb-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    {value}
                </motion.div>

                {/* Bar */}
                <motion.div
                    layout
                    initial={{ height: 0 }}
                    animate={{ 
                        height: `${value}%`,
                        backgroundColor: isSorted ? "#22c55e" : isSwapping ? "#ef4444" : isComparing ? "#facc15" : "rgba(255,255,255,0.15)"
                    }}
                    className={`w-full rounded-t-lg backdrop-blur-sm border-x border-t border-[var(--foreground)]/10 transition-colors duration-100`}
                />

                {/* Index/Pointer */}
                <div className="absolute -bottom-6 w-full flex justify-center">
                     {isComparing && (
                        <motion.div 
                            layoutId="pointer"
                            className="text-yellow-400"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <ArrowUp size={14} />
                        </motion.div>
                     )}
                </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 text-xs">
         <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--foreground)]/5">
             <div className="w-3 h-3 rounded-full bg-yellow-400" /> Comparing
         </div>
         <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--foreground)]/5">
             <div className="w-3 h-3 rounded-full bg-red-500" /> Swapping
         </div>
         <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--foreground)]/5">
             <div className="w-3 h-3 rounded-full bg-green-500" /> Sorted
         </div>
      </div>
    </div>
  );
}