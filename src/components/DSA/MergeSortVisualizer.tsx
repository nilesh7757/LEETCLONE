"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, Split, Merge } from "lucide-react";

const ARRAY_SIZE = 16;

export default function MergeSortVisualizer({ speed = 300 }: { speed?: number }) {
  const [array, setArray] = useState<number[]>([]);
  const [isSorting, setIsSorting] = useState(false);
  const [leftRange, setLeftRange] = useState<[number, number] | null>(null);
  const [rightRange, setRightRange] = useState<[number, number] | null>(null);
  const [mergeIndex, setMergeIndex] = useState<number | null>(null);
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
    setLeftRange(null);
    setRightRange(null);
    setMergeIndex(null);
    setSortedIndices(new Set());
    setIsSorting(false);
    setStatus("Ready");
    stopRef.current = false;
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const mergeSort = async () => {
    if (isSorting) return;
    setIsSorting(true);
    stopRef.current = false;
    
    const arr = [...array];
    await sort(arr, 0, arr.length - 1);
    
    if (!stopRef.current) {
      setStatus("Sorted!");
      setSortedIndices(new Set(Array.from({ length: ARRAY_SIZE }, (_, i) => i)));
      setLeftRange(null);
      setRightRange(null);
      setMergeIndex(null);
      setIsSorting(false);
    }
  };

  const sort = async (arr: number[], l: number, r: number) => {
    if (l >= r) return;
    if (stopRef.current) return;

    const m = Math.floor((l + r) / 2);
    
    // Visualize Splitting
    setStatus(`Splitting [${l}..${r}]`);
    await sleep(speed / 2);

    await sort(arr, l, m);
    await sort(arr, m + 1, r);
    
    if (stopRef.current) return;
    await merge(arr, l, m, r);
  };

  const merge = async (arr: number[], l: number, m: number, r: number) => {
    if (stopRef.current) return;
    
    setStatus(`Merging [${l}..${m}] and [${m+1}..${r}]`);
    setLeftRange([l, m]);
    setRightRange([m + 1, r]);
    await sleep(speed);

    let left = arr.slice(l, m + 1);
    let right = arr.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;

    while (i < left.length && j < right.length) {
      if (stopRef.current) return;
      
      setMergeIndex(k);
      // Highlight comparison
      await sleep(speed);

      if (left[i] <= right[j]) {
        arr[k] = left[i];
        i++;
      } else {
        arr[k] = right[j];
        j++;
      }
      setArray([...arr]);
      await sleep(speed / 2);
      k++;
    }

    while (i < left.length) {
      if (stopRef.current) return;
      setMergeIndex(k);
      arr[k] = left[i];
      setArray([...arr]);
      await sleep(speed / 2);
      i++;
      k++;
    }

    while (j < right.length) {
      if (stopRef.current) return;
      setMergeIndex(k);
      arr[k] = right[j];
      setArray([...arr]);
      await sleep(speed / 2);
      j++;
      k++;
    }
    
    // Mark these as temporarily sorted/processed
    const newSorted = new Set(sortedIndices);
    for (let x = l; x <= r; x++) newSorted.add(x);
    // setSortedIndices(newSorted); // Optional: keep them colored green
  };

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Merge Sort</h2>
          <p className="text-sm text-[var(--foreground)]/60">Divide & Conquer</p>
        </div>

        {/* Status Badge */}
        <div className="px-4 py-2 bg-[var(--foreground)]/5 rounded-full border border-[var(--card-border)] text-xs font-mono font-bold text-[var(--foreground)]/80 flex items-center gap-2">
            {status.includes("Split") ? <Split size={14} className="text-blue-400"/> : <Merge size={14} className="text-purple-400"/>}
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
              onClick={mergeSort}
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
        {/* Helper Lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-10 pointer-events-none">
            <div className="w-full h-px bg-[var(--foreground)]" />
            <div className="w-full h-px bg-[var(--foreground)]" />
            <div className="w-full h-px bg-[var(--foreground)]" />
        </div>

        {array.map((value, idx) => {
          const isLeft = leftRange && idx >= leftRange[0] && idx <= leftRange[1];
          const isRight = rightRange && idx >= rightRange[0] && idx <= rightRange[1];
          const isMerging = idx === mergeIndex;
          const isFinalSorted = sortedIndices.has(idx) && !isLeft && !isRight;

          let bgClass = "bg-[var(--foreground)]/20";
          let shadow = "none";
          
          if (isMerging) {
              bgClass = "bg-yellow-400";
              shadow = "0 0 15px rgba(250, 204, 21, 0.6)";
          } else if (isLeft) {
              bgClass = "bg-blue-500";
          } else if (isRight) {
              bgClass = "bg-purple-500";
          } else if (isFinalSorted) {
              bgClass = "bg-green-500";
          }

          return (
            <div key={idx} className="relative flex flex-col items-center gap-2 w-8 sm:w-10 h-full justify-end group">
                <motion.div
                    layout
                    initial={{ height: 0 }}
                    animate={{ 
                        height: `${value}%`,
                        backgroundColor: isMerging ? "#facc15" : isLeft ? "#3b82f6" : isRight ? "#a855f7" : isFinalSorted ? "#22c55e" : "rgba(255,255,255,0.15)"
                    }}
                    style={{ boxShadow: shadow }}
                    className={`w-full rounded-t-lg backdrop-blur-sm border-x border-t border-[var(--foreground)]/10 transition-all duration-150`}
                />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-4 text-xs">
         <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--foreground)]/5">
             <div className="w-3 h-3 rounded-full bg-blue-500" /> Left Partition
         </div>
         <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--foreground)]/5">
             <div className="w-3 h-3 rounded-full bg-purple-500" /> Right Partition
         </div>
         <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--foreground)]/5">
             <div className="w-3 h-3 rounded-full bg-yellow-400" /> Merging
         </div>
         <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--foreground)]/5">
             <div className="w-3 h-3 rounded-full bg-green-500" /> Sorted
         </div>
      </div>
    </div>
  );
}