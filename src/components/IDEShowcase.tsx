"use client";

import React, { useState, useEffect } from "react";
import { Play, Terminal, CheckCircle2, ChevronRight, Files } from "lucide-react";

export default function IDEShowcase() {
  const [activeTab, setActiveTab] = useState<"code" | "testcases">("code");
  const [isRunning, setIsRunning] = useState(false);
  const [showConsole, setShowConsole] = useState(false);

  useEffect(() => {
    // Trigger initial run animation for rich user landing experience
    const timer1 = setTimeout(() => {
      setIsRunning(true);
    }, 1500);

    const timer2 = setTimeout(() => {
      setIsRunning(false);
      setShowConsole(true);
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleRun = () => {
    setIsRunning(true);
    setShowConsole(false);
    setTimeout(() => {
      setIsRunning(false);
      setShowConsole(true);
    }, 1200);
  };

  const codeSnippet = [
    { num: 1, text: "#include <iostream>", color: "text-[#8F44F0] dark:text-[#c084fc]" },
    { num: 2, text: "#include <vector>", color: "text-[#8F44F0] dark:text-[#c084fc]" },
    { num: 3, text: "using namespace std;", color: "text-[#2563eb] dark:text-[#60a5fa]" },
    { num: 4, text: "", color: "" },
    { num: 5, text: "// BFS Cycle Detection in Undirected Graph", color: "text-[var(--muted-foreground)] opacity-60 italic" },
    { num: 6, text: "bool hasCycle(int V, vector<vector<int>>& adj) {", color: "text-[var(--foreground)]" },
    { num: 7, text: "    vector<bool> vis(V, false);", color: "text-[var(--foreground)]" },
    { num: 8, text: "    for (int i = 0; i < V; ++i) {", color: "text-[var(--foreground)]" },
    { num: 9, text: "        if (!vis[i]) {", color: "text-[var(--foreground)]" },
    { num: 10, text: "            if (detectCycleBFS(i, adj, vis))", color: "text-[var(--foreground)]" },
    { num: 11, text: "                return true; // Cycle Found!", color: "text-[var(--viz-green)] font-bold" },
    { num: 12, text: "        }", color: "text-[var(--foreground)]" },
    { num: 13, text: "    }", color: "text-[var(--foreground)]" },
    { num: 14, text: "    return false;", color: "text-[var(--foreground)]" },
    { num: 15, text: "}", color: "text-[var(--foreground)]" },
  ];

  return (
    <div className="w-full h-full min-h-[380px] bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col font-mono text-[11px] select-none">
      {/* 1. IDE Header / Title Bar */}
      <div className="h-10 bg-[var(--background)] px-4 flex items-center justify-between border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2">
          {/* Mac Window Dots */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
          <span className="ml-3 text-[10px] text-[var(--muted-foreground)] font-bold tracking-wider uppercase">LogiQuest IDE v3.0</span>
        </div>
        
        {/* Play/Run Code Button */}
        <button 
          onClick={handleRun}
          disabled={isRunning}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 border cursor-pointer ${
            isRunning 
              ? "bg-[var(--foreground)]/5 border-[var(--border)] text-[var(--muted-foreground)]/40 cursor-not-allowed"
              : "bg-[#8F44F0]/10 border-[#8F44F0]/30 text-[#8F44F0] dark:text-[#c084fc] hover:bg-[#8F44F0]/20 hover:text-[var(--foreground)]"
          }`}
        >
          {isRunning ? (
            <span className="w-2 h-2 rounded-full border border-t-transparent border-[var(--foreground)] animate-spin inline-block" />
          ) : (
            <Play size={10} className="fill-current" />
          )}
          {isRunning ? "Running" : "Run Code"}
        </button>
      </div>

      {/* 2. File Tabs Bar */}
      <div className="h-8 bg-[var(--background)] flex items-center border-b border-[var(--border)] shrink-0 px-2 gap-1">
        <button 
          onClick={() => setActiveTab("code")}
          className={`h-full px-3 flex items-center gap-1.5 text-[10px] font-bold tracking-wide transition-all border-b-2 cursor-pointer ${
            activeTab === "code" 
              ? "border-[#8F44F0] text-[var(--foreground)] bg-[var(--card)]" 
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <span className="text-[#8F44F0]">{"<>"}</span> solution.cpp
        </button>
        <button 
          onClick={() => setActiveTab("testcases")}
          className={`h-full px-3 flex items-center gap-1.5 text-[10px] font-bold tracking-wide transition-all border-b-2 cursor-pointer ${
            activeTab === "testcases" 
              ? "border-[#8F44F0] text-[var(--foreground)] bg-[var(--card)]" 
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Files size={10} className="text-blue-500" /> input.txt
        </button>
      </div>

      {/* 3. Editor Content Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[var(--card)] flex flex-col justify-start min-h-0">
        {activeTab === "code" ? (
          <div className="flex flex-col gap-1">
            {codeSnippet.map((line) => (
              <div key={line.num} className="flex items-start gap-4">
                <span className="w-4 text-right text-[var(--muted-foreground)] opacity-40 select-none text-[10px]">{line.num}</span>
                <span className={`whitespace-pre ${line.color}`}>{line.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1 text-[var(--foreground)]">
            <div className="flex items-start gap-4">
              <span className="w-4 text-right text-[var(--muted-foreground)] opacity-40 select-none text-[10px]">1</span>
              <span>6 5</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="w-4 text-right text-[var(--muted-foreground)] opacity-40 select-none text-[10px]">2</span>
              <span>0 1</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="w-4 text-right text-[var(--muted-foreground)] opacity-40 select-none text-[10px]">3</span>
              <span>1 2</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="w-4 text-right text-[var(--muted-foreground)] opacity-40 select-none text-[10px]">4</span>
              <span>3 4</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="w-4 text-right text-[var(--muted-foreground)] opacity-40 select-none text-[10px]">5</span>
              <span>4 5</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="w-4 text-right text-[var(--muted-foreground)] opacity-40 select-none text-[10px]">6</span>
              <span>5 3</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Console Panel (Slide up on compile) */}
      <div className="bg-[var(--background)] border-t border-[var(--border)] overflow-hidden shrink-0 transition-all duration-300" style={{ height: showConsole ? "110px" : "0" }}>
        <div className="h-6 bg-[var(--background)] px-4 flex items-center border-b border-[var(--border)] justify-between">
          <span className="text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] font-bold flex items-center gap-1">
            <Terminal size={10} className="text-[#8F44F0]" /> Output Console
          </span>
          <button 
            onClick={() => setShowConsole(false)}
            className="text-[9px] text-[var(--muted-foreground)] opacity-60 hover:opacity-100 uppercase font-bold cursor-pointer"
          >
            Clear
          </button>
        </div>
        <div className="p-3 text-[10px] flex flex-col gap-1 font-mono text-[var(--muted-foreground)] overflow-y-auto h-[84px]">
          <div className="flex items-center gap-1.5 text-blue-500">
            <ChevronRight size={10} />
            <span>Compiling solution.cpp (GCC 14.1)...</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-yellow-500">
            <ChevronRight size={10} />
            <span>Executing 1 test case...</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--viz-green)] font-black">
            <CheckCircle2 size={10} />
            <span>STATUS: Accepted (Success Rate: 100%)</span>
          </div>
          <div className="text-[var(--muted-foreground)] opacity-50 pl-3.5">
            Runtime: 2ms | Memory: 2.1 MB
          </div>
        </div>
      </div>
    </div>
  );
}
