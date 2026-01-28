"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, ChevronRight, ChevronLeft } from "lucide-react";

export default function SlidingWindowVisualizer({ speed = 500 }: { speed?: number }) {
  const [inputString, setInputString] = useState("ABCBCAD");
  const [windowStart, setWindowStart] = useState(0);
  const [windowEnd, setWindowEnd] = useState(0); // Exclusive
  const [charSet, setCharSet] = useState<Set<string>>(new Set());
  const [maxLength, setMaxLength] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("Ready");
  const stopRef = useRef(false);

  // Parse string into array for better rendering control
  const chars = inputString.split("");

  const reset = () => {
    setWindowStart(0);
    setWindowEnd(0);
    setCharSet(new Set());
    setMaxLength(0);
    setIsRunning(false);
    setStatus("Ready");
    stopRef.current = false;
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const runAlgorithm = async () => {
    if (isRunning) return;
    setIsRunning(true);
    stopRef.current = false;

    let left = 0;
    let right = 0;
    let currentSet = new Set<string>();
    let maxLen = 0;

    setWindowStart(left);
    setWindowEnd(right);
    setCharSet(new Set(currentSet));
    setMaxLength(0);

    while (right < chars.length) {
        if (stopRef.current) break;

        const char = chars[right];
        
        // Visualize expanding window
        setWindowEnd(right + 1); // Highlight next char in window
        setStatus(`Checking char '${char}' at index ${right}`);
        await sleep(speed);

        if (!currentSet.has(char)) {
            setStatus(`'${char}' is unique. Expanding window.`);
            currentSet.add(char);
            setCharSet(new Set(currentSet));
            right++;
            
            if (currentSet.size > maxLen) {
                maxLen = currentSet.size;
                setMaxLength(maxLen);
            }
        } else {
            setStatus(`Duplicate '${char}' found! Shrinking window from left.`);
            // Visualize shrinking
            while (currentSet.has(char)) {
                if (stopRef.current) break;
                
                const leftChar = chars[left];
                setStatus(`Removing '${leftChar}' at index ${left}`);
                currentSet.delete(leftChar);
                setCharSet(new Set(currentSet));
                left++;
                setWindowStart(left);
                await sleep(speed);
            }
            // After shrinking, add the new char
            currentSet.add(char);
            setCharSet(new Set(currentSet));
            right++;
        }
        await sleep(speed);
    }
    
    if (!stopRef.current) setStatus(`Finished! Max Length: ${maxLen}`);
    setIsRunning(false);
  };

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Sliding Window</h2>
          <p className="text-sm text-[var(--foreground)]/60">Longest Substring Without Repeats</p>
        </div>

        {/* Status Badge */}
        <div className="px-4 py-2 bg-[var(--foreground)]/5 rounded-full border border-[var(--card-border)] text-xs font-mono font-bold text-[var(--foreground)]/80">
            {status}
        </div>

        <div className="flex gap-4 items-center">
            <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-[var(--foreground)]/40 mb-1">Input String</span>
                 <input 
                    type="text" 
                    value={inputString} 
                    onChange={(e) => { setInputString(e.target.value.toUpperCase().slice(0, 12)); reset(); }}
                    className="w-24 px-2 py-1 bg-[var(--foreground)]/5 border border-[var(--card-border)] rounded-lg text-sm font-mono tracking-widest uppercase"
                    maxLength={12}
                    disabled={isRunning}
                 />
            </div>
            <div className="flex gap-2 h-10 mt-5">
              <button onClick={reset} disabled={isRunning} className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg">
                <RotateCcw size={20} />
              </button>
              {!isRunning ? (
                <button
                  onClick={runAlgorithm}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-gradient-to)] text-white rounded-lg hover:opacity-90 font-medium"
                >
                  <Play size={18} fill="currentColor" />
                  Start
                </button>
              ) : (
                <button
                  onClick={() => { stopRef.current = true; setIsRunning(false); setStatus("Stopped"); }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/50 rounded-lg"
                >
                  <Pause size={18} fill="currentColor" />
                  Stop
                </button>
              )}
            </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center py-16 bg-[var(--foreground)]/5 rounded-2xl border border-[var(--card-border)] overflow-hidden">
         <div className="flex gap-2 relative z-10">
             {chars.map((char, i) => {
                 const inWindow = i >= windowStart && i < windowEnd;
                 const isDuplicateCause = inWindow && chars.slice(windowStart, windowEnd).filter(c => c === char).length > 1; // Simplified visual logic
                 
                 return (
                     <div key={i} className="flex flex-col items-center gap-2">
                         <span className="text-[10px] font-mono text-[var(--foreground)]/30">{i}</span>
                         <motion.div
                            layout
                            animate={{
                                scale: inWindow ? 1.1 : 1,
                                color: inWindow ? "#fff" : "var(--foreground)",
                                opacity: inWindow ? 1 : 0.4
                            }}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg border transition-colors
                                ${inWindow ? "bg-blue-500 border-blue-400" : "bg-[var(--card-bg)] border-[var(--card-border)]"}`}
                         >
                             {char}
                         </motion.div>
                     </div>
                 );
             })}
         </div>

         {/* Window Overlay */}
         {windowEnd > windowStart && (
             <motion.div
                layout
                className="absolute h-20 border-2 border-yellow-400 rounded-2xl bg-yellow-400/10 z-0"
                initial={false}
                animate={{
                    left: `calc(50% - ${(chars.length * 56) / 2}px + ${windowStart * 56}px - 8px)`,
                    width: `${(windowEnd - windowStart) * 56 + 16}px`
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
             >
                 <div className="absolute -top-6 left-0 flex items-center gap-1 text-[10px] font-bold text-yellow-500 uppercase">
                     <ChevronRight size={12}/> Start (L)
                 </div>
                 <div className="absolute -bottom-6 right-0 flex items-center gap-1 text-[10px] font-bold text-yellow-500 uppercase">
                     End (R) <ChevronLeft size={12}/>
                 </div>
             </motion.div>
         )}
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="p-4 bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)] flex items-center justify-between">
             <div className="text-xs uppercase font-bold text-[var(--foreground)]/50">Current Window Size</div>
             <div className="text-2xl font-mono font-bold text-blue-400">{windowEnd - windowStart}</div>
         </div>
         <div className="p-4 bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)] flex items-center justify-between">
             <div className="text-xs uppercase font-bold text-[var(--foreground)]/50">Max Length Found</div>
             <div className="text-2xl font-mono font-bold text-green-400">{maxLength}</div>
         </div>
      </div>
    </div>
  );
}