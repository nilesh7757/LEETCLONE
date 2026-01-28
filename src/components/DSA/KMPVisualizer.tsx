"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, Pause, ArrowUp, ArrowDown } from "lucide-react";

export default function KMPVisualizer({ speed = 800 }: { speed?: number }) {
  const [text, setText] = useState("ABABDABACDABABCABAB");
  const [pattern, setPattern] = useState("ABABCABAB");
  const [lps, setLps] = useState<number[]>([]);
  const [textIndex, setTextIndex] = useState<number | null>(null); // i
  const [patternIndex, setPatternIndex] = useState<number | null>(null); // j
  const [matchIndex, setMatchIndex] = useState<number | null>(null);
  const [status, setStatus] = useState("Ready");
  const [isAnimating, setIsAnimating] = useState(false);
  const stopRef = useRef(false);

  useEffect(() => {
    reset();
  }, [text, pattern]);

  const reset = () => {
    setLps(new Array(pattern.length).fill(0));
    setTextIndex(null);
    setPatternIndex(null);
    setMatchIndex(null);
    setStatus("Ready");
    setIsAnimating(false);
    stopRef.current = false;
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const computeLPS = async () => {
    const m = pattern.length;
    const lpsArr = new Array(m).fill(0);
    let len = 0; // length of previous longest prefix suffix
    let i = 1;

    setLps([...lpsArr]);
    setStatus("Computing LPS Array...");
    
    // Visualize LPS construction? Maybe just fill it for now to save time for the search part.
    // Or fast visualize:
    while (i < m) {
        if (pattern[i] === pattern[len]) {
            len++;
            lpsArr[i] = len;
            i++;
        } else {
            if (len !== 0) {
                len = lpsArr[len - 1];
            } else {
                lpsArr[i] = 0;
                i++;
            }
        }
    }
    setLps(lpsArr);
    setStatus("LPS Computed. Starting Search...");
    await sleep(speed);
    return lpsArr;
  };

  const runKMP = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    stopRef.current = false;
    setMatchIndex(null);

    const lpsArr = await computeLPS();
    
    let i = 0; // text index
    let j = 0; // pattern index
    
    while (i < text.length) {
        if (stopRef.current) break;

        setTextIndex(i);
        setPatternIndex(j);
        
        setStatus(`Comparing Text[${i}] ('${text[i]}') with Pattern[${j}] ('${pattern[j]}')`);
        await sleep(speed);

        if (pattern[j] === text[i]) {
            j++;
            i++;
            if (j === pattern.length) {
                setMatchIndex(i - j);
                setStatus(`Found match at index ${i - j}!`);
                setPatternIndex(j - 1); // Stay at end to show match
                await sleep(speed * 2);
                j = lpsArr[j - 1]; // Continue searching
                setStatus(`Match found. Jumping pattern index to ${j}`);
            }
        } else {
            if (j !== 0) {
                const jumpTo = lpsArr[j - 1];
                setStatus(`Mismatch! Jumping pattern index from ${j} to ${jumpTo} (LPS[${j-1}])`);
                j = jumpTo;
                // Don't increment i
            } else {
                setStatus("Mismatch at start. Moving text index.");
                i++;
            }
        }
        await sleep(speed);
    }

    if (!stopRef.current && matchIndex === null) setStatus("Search Complete. No full match.");
    else if (!stopRef.current) setStatus("Search Complete.");
    
    setIsAnimating(false);
  };

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">KMP Algorithm</h2>
          <p className="text-sm text-[var(--foreground)]/60">String Search with LPS Table</p>
        </div>

        <div className="flex gap-4 items-center">
            <div className="flex flex-col gap-1">
                <input 
                    value={text} 
                    onChange={e=>setText(e.target.value.toUpperCase())} 
                    className="w-32 px-2 py-1 bg-[var(--foreground)]/5 border border-[var(--card-border)] rounded text-xs tracking-widest"
                    placeholder="TEXT"
                    maxLength={25}
                />
                <input 
                    value={pattern} 
                    onChange={e=>setPattern(e.target.value.toUpperCase())} 
                    className="w-32 px-2 py-1 bg-[var(--foreground)]/5 border border-[var(--card-border)] rounded text-xs tracking-widest"
                    placeholder="PATTERN"
                    maxLength={10}
                />
            </div>
            
            <div className="flex gap-2 h-10">
                <button onClick={reset} disabled={isAnimating} className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg">
                    <RotateCcw size={20} />
                </button>
                {!isAnimating ? (
                    <button
                    onClick={runKMP}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-gradient-to)] text-white rounded-lg hover:opacity-90 font-medium"
                    >
                    <Play size={18} fill="currentColor" />
                    Start
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

      <div className="flex flex-col gap-8 py-4 overflow-x-auto">
          {/* Text Visualization */}
          <div className="relative">
              <span className="text-[10px] font-bold text-[var(--foreground)]/40 absolute -top-5 left-0">TEXT (i)</span>
              <div className="flex gap-1">
                  {text.split("").map((char, i) => (
                      <div key={i} className="flex flex-col items-center">
                          <motion.div
                            animate={{
                                backgroundColor: i === textIndex ? "#3b82f6" : "var(--card-bg)",
                                borderColor: i === textIndex ? "#60a5fa" : "var(--card-border)",
                                scale: i === textIndex ? 1.1 : 1
                            }}
                            className="w-10 h-10 border rounded-lg flex items-center justify-center font-bold font-mono"
                          >
                              {char}
                          </motion.div>
                          <span className="text-[9px] text-[var(--foreground)]/30 mt-1">{i}</span>
                      </div>
                  ))}
              </div>
              {/* Text Pointer */}
              {textIndex !== null && (
                  <motion.div 
                    layout
                    className="absolute -bottom-6 text-blue-500"
                    style={{ left: textIndex * 44 + 12 }} // Approx width 40 + gap 4
                  >
                      <ArrowUp size={16}/>
                  </motion.div>
              )}
          </div>

          {/* Pattern Visualization */}
          <div className="relative">
              <span className="text-[10px] font-bold text-[var(--foreground)]/40 absolute -top-5 left-0">PATTERN (j)</span>
              {/* Pattern shifting logic: We need to align pattern[j] with text[i] visually? 
                  Or just show pattern static? 
                  Static is easier to read for the index logic. Shifting is 'real' but confusing if LPS jumps.
                  Let's keep static but highlight 'j'.
              */}
              <div className="flex gap-1">
                  {pattern.split("").map((char, j) => (
                      <div key={j} className="flex flex-col items-center">
                          <motion.div
                            animate={{
                                backgroundColor: j === patternIndex ? "#a855f7" : "var(--card-bg)",
                                borderColor: j === patternIndex ? "#c084fc" : "var(--card-border)",
                                scale: j === patternIndex ? 1.1 : 1
                            }}
                            className="w-10 h-10 border rounded-lg flex items-center justify-center font-bold font-mono"
                          >
                              {char}
                          </motion.div>
                          {/* LPS Value */}
                          <div className="mt-1 w-6 h-6 rounded bg-[var(--foreground)]/5 flex items-center justify-center text-[10px] text-[var(--foreground)]/50 border border-[var(--card-border)]">
                              {lps[j]}
                          </div>
                      </div>
                  ))}
              </div>
              {/* Pattern Pointer */}
              {patternIndex !== null && (
                  <motion.div 
                    layout
                    className="absolute -bottom-6 text-purple-500"
                    style={{ left: patternIndex * 44 + 12 }}
                  >
                      <ArrowUp size={16}/>
                  </motion.div>
              )}
          </div>
      </div>
    </div>
  );
}