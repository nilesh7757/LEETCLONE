"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, Pause, ArrowDown } from "lucide-react";

const ARRAY_SIZE = 15;

export default function QuickSortVisualizer({ speed = 300 }: { speed?: number }) {
  const [array, setArray] = useState<number[]>([]);
  const [isSorting, setIsSorting] = useState(false);
  const [pivotIndex, setPivotIndex] = useState<number | null>(null);
  const [leftIndex, setLeftIndex] = useState<number | null>(null);
  const [rightIndex, setRightIndex] = useState<number | null>(null);
  const [swapping, setSwapping] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<Set<number>>(new Set());
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
    setPivotIndex(null);
    setLeftIndex(null);
    setRightIndex(null);
    setSwapping([]);
    setSortedIndices(new Set());
    setIsSorting(false);
    setStatus("Ready");
    stopRef.current = false;
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const quickSort = async () => {
    if (isSorting) return;
    setIsSorting(true);
    stopRef.current = false;
    
    const arr = [...array];
    await sort(arr, 0, arr.length - 1);
    
    if (!stopRef.current) {
        setStatus("Sorted!");
        setSortedIndices(new Set(Array.from({ length: ARRAY_SIZE }, (_, i) => i)));
        setPivotIndex(null);
        setLeftIndex(null);
        setRightIndex(null);
        setIsSorting(false);
    }
  };

  const sort = async (arr: number[], low: number, high: number) => {
    if (low < high) {
        if (stopRef.current) return;
        const pi = await partition(arr, low, high);
        
        // Mark pivot as sorted
        setSortedIndices(prev => new Set(prev).add(pi));
        
        await sort(arr, low, pi - 1);
        await sort(arr, pi + 1, high);
    } else if (low === high) {
        setSortedIndices(prev => new Set(prev).add(low));
    }
  };

  const partition = async (arr: number[], low: number, high: number) => {
    const pivot = arr[high];
    setPivotIndex(high);
    setStatus(`Partitioning with Pivot: ${pivot}`);
    await sleep(speed);

    let i = low - 1; // Index of smaller element

    for (let j = low; j < high; j++) {
        if (stopRef.current) return -1;
        
        setLeftIndex(i + 1); // Expected swap position
        setRightIndex(j);    // Current scanner
        await sleep(speed / 2);

        if (arr[j] < pivot) {
            i++;
            setLeftIndex(i);
            
            if (i !== j) {
                setStatus(`Swapping ${arr[i]} and ${arr[j]} (smaller than pivot)`);
                setSwapping([i, j]);
                [arr[i], arr[j]] = [arr[j], arr[i]];
                setArray([...arr]);
                await sleep(speed);
                setSwapping([]);
            }
        }
    }

    if (stopRef.current) return -1;

    // Swap pivot to correct position
    setStatus(`Moving Pivot to sorted position`);
    setSwapping([i + 1, high]);
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    setArray([...arr]);
    await sleep(speed);
    setSwapping([]);
    
    setPivotIndex(null);
    setLeftIndex(null);
    setRightIndex(null);

    return i + 1;
  };

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Quick Sort</h2>
          <p className="text-sm text-[var(--foreground)]/60">Divide & Conquer | O(N log N)</p>
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
              onClick={quickSort}
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

      <div className="relative flex items-end justify-center gap-2 h-64 px-4 pb-12 bg-[var(--foreground)]/5 rounded-2xl border border-[var(--card-border)] overflow-hidden">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-10 pointer-events-none">
            <div className="w-full h-px bg-[var(--foreground)]" />
            <div className="w-full h-px bg-[var(--foreground)]" />
            <div className="w-full h-px bg-[var(--foreground)]" />
        </div>

        {array.map((value, idx) => {
          const isPivot = idx === pivotIndex;
          const isLeft = idx === leftIndex;
          const isRight = idx === rightIndex;
          const isSwapping = swapping.includes(idx);
          const isSorted = sortedIndices.has(idx);

          let bgClass = "bg-[var(--foreground)]/20";
          let shadow = "none";
          
          if (isSorted) {
              bgClass = "bg-green-500";
          } else if (isSwapping) {
              bgClass = "bg-red-500";
              shadow = "0 0 15px rgba(239, 68, 68, 0.6)";
          } else if (isPivot) {
              bgClass = "bg-purple-500";
              shadow = "0 0 15px rgba(168, 85, 247, 0.6)";
          } else if (isLeft || isRight) {
              bgClass = "bg-yellow-400";
          }

          return (
            <div key={idx} className="relative flex flex-col items-center gap-2 w-8 sm:w-10 h-full justify-end group">
                <motion.div
                    layout
                    initial={{ height: 0 }}
                    animate={{ 
                        height: `${value}%`,
                        backgroundColor: isSorted ? "#22c55e" : isSwapping ? "#ef4444" : isPivot ? "#a855f7" : (isLeft || isRight) ? "#facc15" : "rgba(255,255,255,0.15)"
                    }}
                    style={{ boxShadow: shadow }}
                    className={`w-full rounded-t-lg backdrop-blur-sm border-x border-t border-[var(--foreground)]/10 transition-colors duration-100`}
                />
                
                {/* Pointer Indicators */}
                <div className="absolute -bottom-8 w-full flex justify-center h-8">
                     {isPivot && <span className="text-[9px] font-bold text-purple-400 uppercase">Pivot</span>}
                     {isLeft && !isPivot && <ArrowDown size={14} className="text-yellow-400" />}
                     {isRight && !isPivot && <ArrowDown size={14} className="text-yellow-400" />}
                </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-4 text-xs">
         <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--foreground)]/5">
             <div className="w-3 h-3 rounded-full bg-purple-500" /> Pivot
         </div>
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