"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, Crown, X } from "lucide-react";

export default function NQueensVisualizer({ speed = 500 }: { speed?: number }) {
  const [n, setN] = useState(4);
  const [board, setBoard] = useState<number[][]>([]); // 0: Empty, 1: Queen, 2: Attack Path
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [conflict, setConflict] = useState<{ r: number; c: number } | null>(null);
  const stopRef = useRef(false);

  useEffect(() => {
    resetBoard();
  }, [n]);

  const resetBoard = () => {
    setBoard(Array(n).fill(0).map(() => Array(n).fill(0)));
    setIsRunning(false);
    setStatus("Ready");
    setConflict(null);
    stopRef.current = false;
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const startBacktracking = async () => {
    if (isRunning) return;
    setIsRunning(true);
    stopRef.current = false;
    setConflict(null);
    
    // Clear board first
    const newBoard = Array(n).fill(0).map(() => Array(n).fill(0));
    setBoard(newBoard);
    
    const solved = await solveNQueens(newBoard, 0);
    
    if (solved) setStatus("Solution Found!");
    else setStatus("No Solution Found");
    
    setIsRunning(false);
  };

  const solveNQueens = async (boardState: number[][], col: number): Promise<boolean> => {
    if (stopRef.current) return false;

    if (col >= n) return true;

    for (let i = 0; i < n; i++) {
        if (stopRef.current) return false;

        setStatus(`Trying Queen at (${i}, ${col})...`);
        setConflict(null);
        
        boardState[i][col] = 2; // Checking
        setBoard([...boardState.map(row => [...row])]);
        await sleep(speed);

        const conflictSource = getConflictSource(boardState, i, col);
        
        if (!conflictSource) {
            setStatus(`Safe! Proceeding to col ${col + 1}`);
            boardState[i][col] = 1; // Safe Queen
            setBoard([...boardState.map(row => [...row])]);
            await sleep(speed / 2);

            if (await solveNQueens(boardState, col + 1)) return true;

            // Backtrack
            setStatus(`Backtracking from (${i}, ${col})`);
            boardState[i][col] = 0; 
            setBoard([...boardState.map(row => [...row])]);
            await sleep(speed);
        } else {
            setStatus(`Conflict with Queen at (${conflictSource.r}, ${conflictSource.c})!`);
            setConflict(conflictSource);
            boardState[i][col] = 3; // Invalid
            setBoard([...boardState.map(row => [...row])]);
            await sleep(speed * 1.5);
            
            setConflict(null);
            boardState[i][col] = 0;
            setBoard([...boardState.map(row => [...row])]);
            await sleep(speed / 2);
        }
    }
    return false;
  };

  const getConflictSource = (boardState: number[][], row: number, col: number) => {
    // Check row
    for (let i = 0; i < col; i++) {
        if (boardState[row][i] === 1) return { r: row, c: i };
    }
    // Check upper diagonal
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
        if (boardState[i][j] === 1) return { r: i, c: j };
    }
    // Check lower diagonal
    for (let i = row + 1, j = col - 1; j >= 0 && i < n; i++, j--) {
        if (boardState[i][j] === 1) return { r: i, c: j };
    }
    return null;
  };

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">N-Queens Backtracking</h2>
          <p className="text-sm text-[var(--foreground)]/60">Find one valid placement</p>
        </div>

        {/* Status Badge */}
        <div className="px-4 py-2 bg-[var(--foreground)]/5 rounded-full border border-[var(--card-border)] text-xs font-mono font-bold text-[var(--foreground)]/80">
            {status}
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[var(--foreground)]/40 mb-1">Board Size (N={n})</span>
              <input 
                type="range" min="4" max="8" value={n} onChange={(e) => setN(parseInt(e.target.value))}
                disabled={isRunning}
                className="w-24 h-1.5 bg-[var(--foreground)]/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
          </div>
          <div className="flex gap-2">
              <button
                onClick={resetBoard}
                className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg transition-colors"
                title="Reset"
                disabled={isRunning}
              >
                <RotateCcw size={20} />
              </button>
              {!isRunning ? (
                <button
                  onClick={startBacktracking}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-gradient-to)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  <Play size={18} fill="currentColor" />
                  Solve
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

      {/* Chessboard Visualization */}
      <div className="flex justify-center relative">
        <div 
          className="grid gap-0.5 p-2 bg-[var(--foreground)]/10 rounded-lg border border-[var(--card-border)] shadow-2xl relative overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        >
          {board.map((row, r) => row.map((cell, c) => {
             const isBlack = (r + c) % 2 === 1;
             const isConflictSource = conflict?.r === r && conflict?.c === c;
             
             return (
                 <div 
                    key={`${r}-${c}`}
                    className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-2xl relative transition-colors duration-300
                        ${isBlack ? "bg-[var(--foreground)]/10" : "bg-[var(--card-bg)]"}
                        ${cell === 3 ? "bg-red-500/30" : cell === 2 ? "bg-yellow-500/20" : ""}
                        ${isConflictSource ? "bg-red-600/40 ring-4 ring-red-500 ring-inset" : ""}
                    `}
                 >
                    <AnimatePresence mode="wait">
                        {cell === 1 && (
                            <motion.div
                                key="queen"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                            >
                                <Crown size={32} fill="currentColor" />
                            </motion.div>
                        )}
                        {cell === 2 && (
                            <motion.div
                                key="check"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="w-4 h-4 rounded-full bg-yellow-400 animate-pulse"
                            />
                        )}
                        {cell === 3 && (
                             <motion.div
                                key="error"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="text-red-500"
                             >
                                <X size={32} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                 </div>
             );
          }))}
        </div>
      </div>

      <div className="flex justify-center gap-8 text-xs font-medium text-[var(--foreground)]/60">
        <div className="flex items-center gap-2">
            <Crown size={14} className="text-purple-400" /> Placed
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400" /> Checking
        </div>
        <div className="flex items-center gap-2">
            <X size={14} className="text-red-500" /> Conflict
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-600/40 border border-red-500" /> Attacker
        </div>
      </div>
    </div>
  );
}