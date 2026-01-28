"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, Pause, Search, ChevronUp, ChevronDown } from "lucide-react";

export default function BinarySearchVisualizer({ speed = 1000 }: { speed?: number }) {
  const [array, setArray] = useState<number[]>([]);
  const [target, setTarget] = useState(42);
  const [low, setLow] = useState<number | null>(null);
  const [high, setHigh] = useState<number | null>(null);
  const [mid, setMid] = useState<number | null>(null);
  const [foundIndex, setFoundIndex] = useState<number | null>(null);
  const [status, setStatus] = useState("Ready");
  const [isAnimating, setIsAnimating] = useState(false);
  const stopRef = useRef(false);

  useEffect(() => {
    reset();
  }, []);

  const reset = () => {
    // Generate sorted array
    const arr = Array.from({ length: 15 }, () => Math.floor(Math.random() * 100)).sort((a, b) => a - b);
    setArray(arr);
    setTarget(arr[Math.floor(Math.random() * arr.length)]); // Pick a random target existing in array
    setLow(null);
    setHigh(null);
    setMid(null);
    setFoundIndex(null);
    setStatus("Ready");
    setIsAnimating(false);
    stopRef.current = false;
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const runBinarySearch = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    stopRef.current = false;
    setFoundIndex(null);

    let l = 0;
    let r = array.length - 1;
    
    setLow(l);
    setHigh(r);
    setStatus(`Searching for ${target} in range [${l}, ${r}]`);
    await sleep(speed);

    while (l <= r) {
        if (stopRef.current) break;

        const m = Math.floor((l + r) / 2);
        setMid(m);
        setStatus(`Mid index: ${m}, Value: ${array[m]}`);
        await sleep(speed);

        if (array[m] === target) {
            setStatus(`Found ${target} at index ${m}!`);
            setFoundIndex(m);
            setIsAnimating(false);
            return;
        } else if (array[m] < target) {
            setStatus(`${array[m]} < ${target}. Ignoring Left Half.`);
            l = m + 1;
            setLow(l);
        } else {
            setStatus(`${array[m]} > ${target}. Ignoring Right Half.`);
            r = m - 1;
            setHigh(r);
        }
        await sleep(speed);
    }

    if (!stopRef.current) setStatus("Not Found");
    setIsAnimating(false);
  };

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Binary Search</h2>
          <p className="text-sm text-[var(--foreground)]/60">O(log N) Search on Sorted Array</p>
        </div>

        <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 bg-[var(--foreground)]/5 p-2 rounded-lg border border-[var(--card-border)]">
                <span className="text-[10px] font-bold text-[var(--foreground)]/40">TARGET</span>
                <input 
                    type="number" 
                    value={target} 
                    onChange={(e) => setTarget(parseInt(e.target.value))} 
                    className="w-12 p-1 text-center rounded bg-[var(--card-bg)] text-sm font-bold text-blue-400"
                    disabled={isAnimating}
                />
            </div>
            
            <div className="flex gap-2">
                <button onClick={reset} disabled={isAnimating} className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg">
                    <RotateCcw size={20} />
                </button>
                {!isAnimating ? (
                    <button
                    onClick={runBinarySearch}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-gradient-to)] text-white rounded-lg hover:opacity-90 font-medium"
                    >
                    <Play size={18} fill="currentColor" />
                    Search
                    </button>
                ) : (
                    <button
                    onClick={() => { stopRef.current = true; setIsAnimating(false); setStatus("Stopped"); }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/50 rounded-lg"
                    >
                    <Pause size={18} fill="currentColor" />
                    Stop
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="w-full text-center py-2 bg-[var(--foreground)]/5 rounded-lg border border-[var(--card-border)] font-mono text-xs text-[var(--foreground)]/70">
          {status}
      </div>

      <div className="relative flex items-center justify-center h-32 px-4 bg-[var(--foreground)]/5 rounded-2xl border border-[var(--card-border)] overflow-hidden">
         <div className="flex gap-2">
             {array.map((val, i) => {
                 const isDiscarded = (low !== null && i < low) || (high !== null && i > high);
                 const isMid = i === mid;
                 const isFound = i === foundIndex;
                 
                 return (
                     <div key={i} className="flex flex-col items-center gap-1 relative">
                         {/* Pointers */}
                         <div className="h-6 relative w-full flex justify-center">
                             {i === low && <div className="absolute top-0 text-[10px] font-bold text-blue-400 flex flex-col items-center"><ChevronDown size={14}/>L</div>}
                             {i === high && <div className="absolute top-0 text-[10px] font-bold text-purple-400 flex flex-col items-center"><ChevronDown size={14}/>H</div>}
                         </div>

                         <motion.div
                            layout
                            animate={{
                                scale: isMid || isFound ? 1.1 : isDiscarded ? 0.9 : 1,
                                opacity: isDiscarded ? 0.3 : 1,
                                backgroundColor: isFound ? "#22c55e" : isMid ? "#facc15" : "var(--card-bg)",
                                borderColor: isFound ? "#16a34a" : isMid ? "#eab308" : "var(--card-border)",
                                color: isMid || isFound ? "#000" : "var(--foreground)"
                            }}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 flex items-center justify-center font-bold shadow-sm transition-all`}
                         >
                             {val}
                         </motion.div>

                         <div className="h-6 relative w-full flex justify-center">
                             {isMid && <div className="absolute bottom-0 text-[10px] font-bold text-yellow-500 flex flex-col items-center">M<ChevronUp size={14}/></div>}
                         </div>
                         
                         <span className="text-[9px] text-[var(--foreground)]/30 absolute -bottom-4">{i}</span>
                     </div>
                 );
             })}
         </div>
      </div>
    </div>
  );
}