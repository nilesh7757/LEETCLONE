"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause } from "lucide-react";

const INF = 99;

export default function FloydWarshallVisualizer({ speed = 200 }: { speed?: number }) {
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [n, setN] = useState(4);
  const [k, setK] = useState<number | null>(null);
  const [i, setI] = useState<number | null>(null);
  const [j, setJ] = useState<number | null>(null);
  const [status, setStatus] = useState("Ready");
  const [isAnimating, setIsAnimating] = useState(false);
  const stopRef = useRef(false);

  useEffect(() => {
    reset();
  }, [n]);

  const reset = () => {
    // Generate random weighted graph
    const mat = Array.from({ length: n }, (_, r) => 
        Array.from({ length: n }, (_, c) => {
            if (r === c) return 0;
            if (Math.random() > 0.6) return INF; // No edge
            return Math.floor(Math.random() * 9) + 1;
        })
    );
    setMatrix(mat);
    setK(null);
    setI(null);
    setJ(null);
    setStatus("Ready");
    setIsAnimating(false);
    stopRef.current = false;
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const runFloydWarshall = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    stopRef.current = false;

    let dist = matrix.map(row => [...row]);

    for (let kStep = 0; kStep < n; kStep++) {
        setK(kStep);
        setStatus(`Relaxing via intermediate node ${kStep}`);
        await sleep(speed);

        for (let iStep = 0; iStep < n; iStep++) {
            setI(iStep);
            for (let jStep = 0; jStep < n; jStep++) {
                if (stopRef.current) break;
                setJ(jStep);
                
                // Skip if no path
                if (dist[iStep][kStep] === INF || dist[kStep][jStep] === INF) {
                    await sleep(speed / 4);
                    continue;
                }

                // Check Relaxation
                const newDist = dist[iStep][kStep] + dist[kStep][jStep];
                if (newDist < dist[iStep][jStep]) {
                    dist[iStep][jStep] = newDist;
                    setMatrix(dist.map(r => [...r])); // Update UI
                    setStatus(`Updated dist[${iStep}][${jStep}] to ${newDist} (via ${kStep})`);
                    await sleep(speed);
                } else {
                    await sleep(speed / 4); // Fast forward non-updates
                }
            }
            if (stopRef.current) break;
        }
        if (stopRef.current) break;
    }

    if (!stopRef.current) setStatus("All-Pairs Shortest Paths Computed");
    setIsAnimating(false);
    setK(null); setI(null); setJ(null);
  };

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Floyd-Warshall</h2>
          <p className="text-sm text-[var(--foreground)]/60">All-Pairs Shortest Path | O(N³)</p>
        </div>

        <div className="flex gap-4 items-center">
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[var(--foreground)]/40 mb-1">Size (N={n})</span>
                <input 
                    type="range" min="3" max="6" value={n} onChange={(e) => setN(parseInt(e.target.value))}
                    className="w-24 h-1.5 bg-[var(--foreground)]/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    disabled={isAnimating}
                />
            </div>
            
            <div className="flex gap-2">
                <button onClick={reset} disabled={isAnimating} className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg">
                    <RotateCcw size={20} />
                </button>
                {!isAnimating ? (
                    <button
                    onClick={runFloydWarshall}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-gradient-to)] text-white rounded-lg hover:opacity-90 font-medium"
                    >
                    <Play size={18} fill="currentColor" />
                    Run
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

      <div className="flex gap-8 justify-center items-start">
          {/* Matrix Visualization */}
          <div className="flex flex-col gap-1">
              {/* Header Row */}
              <div className="flex gap-1">
                  <div className="w-10 h-10"/>
                  {Array.from({length: n}).map((_, c) => (
                      <div key={`head-${c}`} className={`w-10 h-10 flex items-center justify-center font-bold text-xs ${c === j ? "text-purple-400" : "text-[var(--foreground)]/40"}`}>
                          {c}
                      </div>
                  ))}
              </div>

              {matrix.map((row, r) => (
                  <div key={`row-${r}`} className="flex gap-1">
                      {/* Header Col */}
                      <div className={`w-10 h-10 flex items-center justify-center font-bold text-xs ${r === i ? "text-blue-400" : "text-[var(--foreground)]/40"}`}>
                          {r}
                      </div>
                      
                      {row.map((val, c) => {
                          const isCurrent = r === i && c === j;
                          const isPivotRow = r === k && c === j;
                          const isPivotCol = r === i && c === k;
                          const isPivot = r === k && c === k; // The intersection

                          let bg = "bg-[var(--foreground)]/5";
                          let border = "border-[var(--card-border)]";
                          let textCol = "text-[var(--foreground)]";

                          if (isCurrent) {
                              bg = "bg-green-500/20";
                              border = "border-green-500";
                              textCol = "text-green-400";
                          } else if (isPivotRow || isPivotCol) {
                              bg = "bg-yellow-500/10";
                              border = "border-yellow-500/30";
                              textCol = "text-yellow-500";
                          } else if (isPivot) {
                              bg = "bg-purple-500/20";
                              border = "border-purple-500";
                              textCol = "text-purple-400";
                          }

                          return (
                              <motion.div
                                key={`${r}-${c}`}
                                animate={{ scale: isCurrent ? 1.1 : 1 }}
                                className={`w-10 h-10 rounded border ${border} ${bg} flex items-center justify-center font-mono font-bold text-sm ${textCol}`}
                              >
                                  {val === INF ? "∞" : val}
                              </motion.div>
                          );
                      })}
                  </div>
              ))}
          </div>

          {/* Legend / Info */}
          <div className="w-48 flex flex-col gap-4 p-4 bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)]">
              <div className="text-[10px] font-bold uppercase text-[var(--foreground)]/40 mb-2">Variables</div>
              <div className="flex justify-between items-center text-xs">
                  <span className="text-purple-400 font-bold">k (Inter)</span>
                  <span className="font-mono">{k ?? "-"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-400 font-bold">i (Source)</span>
                  <span className="font-mono">{i ?? "-"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                  <span className="text-purple-400 font-bold">j (Dest)</span>
                  <span className="font-mono">{j ?? "-"}</span>
              </div>
              
              <div className="h-px bg-[var(--foreground)]/10 my-2" />
              
              <div className="text-[10px] font-bold uppercase text-[var(--foreground)]/40 mb-2">Status</div>
              <div className="text-xs leading-relaxed opacity-70">
                  {status}
              </div>
          </div>
      </div>
    </div>
  );
}