"use client";

import { Terminal, Minimize2, X, Plus, PlayCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TestCase {
  input: string | object;
  expectedOutput?: string | object;
}

interface Result {
  status: string;
  error?: string;
  actual?: string | object;
  input?: string | object;
  expected?: string | object;
  runtime?: number;
}

interface ConsolePanelProps {
  consoleTab: 'testcase' | 'result';
  setConsoleTab: (tab: 'testcase' | 'result') => void;
  setConsoleOpen: (open: boolean) => void;
  localTestCases: TestCase[];
  activeTestCaseId: number;
  setActiveTestCaseId: (id: number) => void;
  handleAddTestCase: () => void;
  removeTestCase: (index: number) => void;
  updateTestCase: (index: number, field: 'input' | 'expectedOutput', value: string) => void;
  results: Result[] | null;
  examplesLength: number;
}

export default function ConsolePanel({
  consoleTab, setConsoleTab, setConsoleOpen,
  localTestCases, activeTestCaseId, setActiveTestCaseId,
  handleAddTestCase, removeTestCase, updateTestCase,
  results, examplesLength
}: ConsolePanelProps) {
  return (
    <div className="flex flex-col h-full min-h-0 bg-[var(--background)] overflow-hidden">
      <div className="flex items-center justify-between px-6 h-12 border-b border-[var(--border)] bg-[var(--card)]/30 shrink-0">
        <div className="flex gap-6 h-full">
          <button 
            onClick={() => setConsoleTab('testcase')} 
            className={`relative text-[10px] font-black uppercase tracking-[0.2em] h-full transition-colors flex items-center gap-2.5 ${consoleTab === 'testcase' ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${consoleTab === 'testcase' ? 'bg-[var(--viz-blue)] shadow-[0_0_8px_var(--viz-blue)]' : 'bg-[var(--muted-foreground)]'}`} />
            Testcases
            {consoleTab === 'testcase' && <motion.div layoutId="consoleTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--viz-blue)]" />}
          </button>
          <button 
            onClick={() => setConsoleTab('result')} 
            className={`relative text-[10px] font-black uppercase tracking-[0.2em] h-full transition-colors flex items-center gap-2.5 ${consoleTab === 'result' ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
          >
            <Terminal size={12} className={consoleTab === 'result' ? "text-[var(--viz-purple)]" : ""} />
            Results
            {consoleTab === 'result' && <motion.div layoutId="consoleTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--viz-purple)]" />}
          </button>
        </div>
        <button onClick={() => setConsoleOpen(false)} className="p-2 hover:bg-[var(--foreground)]/5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all">
          <Minimize2 size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gradient-to-b from-transparent to-[var(--card)]/10">
        <AnimatePresence mode="wait">
          {consoleTab === 'testcase' ? (
            <motion.div 
               key="testcase"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-6"
            >
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                {localTestCases.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveTestCaseId(i)}
                    className={`relative px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      activeTestCaseId === i 
                      ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-xl shadow-black/20" 
                      : "bg-[var(--card)]/50 border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--muted-foreground)]"
                    }`}
                  >
                    Case {i + 1}
                    {i >= examplesLength && (
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTestCase(i);
                        }}
                        className="absolute -top-1.5 -right-1.5 bg-[var(--viz-red)] text-white rounded-full p-0.5 shadow-lg transition-opacity"
                      >
                        <X size={10} />
                      </span>
                    )}
                  </button>
                ))}
                <button 
                  onClick={handleAddTestCase}
                  className="px-3 py-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all border border-dashed border-[var(--border)]"
                >
                  <Plus size={14} />
                </button>
              </div>

              {localTestCases[activeTestCaseId] && (
                <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                       <label className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Input</label>
                    </div>
                    <div className="bg-[var(--card)]/30 border border-[var(--border)] rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[var(--viz-blue)]/30 transition-all shadow-inner">
                      <textarea 
                        className="w-full bg-transparent p-4 text-xs font-mono text-[var(--foreground)] outline-none resize-none min-h-[80px]"
                        value={typeof localTestCases[activeTestCaseId].input === 'object' ? JSON.stringify(localTestCases[activeTestCaseId].input, null, 2) : localTestCases[activeTestCaseId].input as string}
                        onChange={(e) => updateTestCase(activeTestCaseId, 'input', e.target.value)}
                        spellCheck={false}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                       <label className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Expected Output</label>
                    </div>
                    <div className="bg-[var(--card)]/30 border border-[var(--border)] rounded-2xl focus-within:ring-2 focus-within:ring-[var(--viz-green)]/30 transition-all shadow-inner">
                      <textarea 
                        className="w-full bg-transparent p-4 text-xs font-mono text-[var(--foreground)]/80 outline-none resize-none min-h-[80px]"
                        value={typeof localTestCases[activeTestCaseId].expectedOutput === 'object' ? JSON.stringify(localTestCases[activeTestCaseId].expectedOutput, null, 2) : localTestCases[activeTestCaseId].expectedOutput as string}
                        onChange={(e) => updateTestCase(activeTestCaseId, 'expectedOutput', e.target.value)}
                        spellCheck={false}
                        placeholder="Optional: Enter expected output to compare..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
               key="result"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="h-full"
            >
              {!results ? (
                <div className="h-full flex flex-col items-center justify-center py-10 opacity-20">
                  <PlayCircle size={64} strokeWidth={1} className="mb-4" />
                  <p className="text-[10px] uppercase tracking-[0.4em] font-black">Run code to see results</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex flex-col gap-2">
                    {(() => {
                      const currentResult = results[activeTestCaseId];
                      const globalError = results.find((r: Result) => r.status === "Compilation Error" || r.status === "Runtime Error");
                      const displayStatus = currentResult?.status || globalError?.status || "Execution Failed";
                      const isSuccess = displayStatus === 'Accepted';

                      return (
                        <div className="flex items-end justify-between border-b border-[var(--border)] pb-6">
                           <div className="space-y-1">
                              <div className={`text-2xl md:text-3xl font-black tracking-tighter ${isSuccess ? "text-[var(--viz-green)]" : "text-[var(--viz-red)]"}`}>
                                {displayStatus}
                              </div>
                              <p className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-widest">
                                 {isSuccess ? `Completed in ${currentResult?.runtime || 0}ms` : 'Action required'}
                              </p>
                           </div>
                           {!isSuccess && (
                              <div className="p-3 rounded-2xl bg-[var(--viz-red)]/10 text-[var(--viz-red)] border border-[var(--viz-red)]/20 animate-pulse">
                                 <AlertCircle size={24} />
                              </div>
                           )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                    {localTestCases.map((_, i) => {
                      const res = results[i];
                      const isGlobalError = results.some((r: Result) => r.status === "Compilation Error");
                      const caseStatus = isGlobalError ? "Error" : (res?.status || "Pending");
                      
                      return (
                        <button 
                          key={i} 
                          onClick={() => setActiveTestCaseId(i)}
                          className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            activeTestCaseId === i 
                            ? "bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] shadow-xl shadow-black/10" 
                            : "bg-transparent border-transparent text-[var(--muted-foreground)] hover:bg-[var(--foreground)]/5"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${caseStatus === 'Accepted' ? "bg-[var(--viz-green)] shadow-[0_0_10px_var(--viz-green)]" : "bg-[var(--viz-red)] shadow-[0_0_10px_var(--viz-red)]"}`} />
                          Case {i + 1}
                        </button>
                      );
                    })}
                  </div>

                  {(() => {
                    const currentResult = results[activeTestCaseId];
                    const globalError = results.find((r: Result) => r.status === "Compilation Error");
                    const resultToDisplay = currentResult || globalError;

                    if (!resultToDisplay) return <div className="text-xs text-[var(--muted-foreground)] py-10 text-center uppercase tracking-widest opacity-50">Pending...</div>;

                    return (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {resultToDisplay.error ? (
                          <div className="p-6 bg-black/40 border border-[var(--viz-red)]/30 rounded-2xl text-[11px] font-mono text-[var(--viz-red)]/90 whitespace-pre-wrap shadow-2xl">
                            <div className="flex items-center gap-2 mb-4 text-[var(--viz-red)]">
                               <AlertCircle size={14} />
                               <span className="font-black uppercase tracking-widest">Error Output</span>
                            </div>
                            {resultToDisplay.error}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em] ml-1">Input</label>
                              <div className="p-4 bg-[var(--card)]/40 border border-[var(--border)] rounded-2xl text-xs font-mono text-[var(--foreground)]/80 break-all shadow-inner">
                                {typeof localTestCases[activeTestCaseId].input === 'object' ? JSON.stringify(localTestCases[activeTestCaseId].input, null, 2) : localTestCases[activeTestCaseId].input as string}
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em] ml-1">Output</label>
                              <div className={`p-4 bg-[var(--background)] border rounded-2xl text-xs font-mono break-all shadow-lg ${
                                resultToDisplay.status === 'Accepted' 
                                ? "text-[var(--foreground)] border-[var(--border)]" 
                                : "text-[var(--viz-red)] border-[var(--viz-red)]/30 bg-[var(--viz-red)]/5"
                              }`}>
                                {typeof resultToDisplay.actual === 'object' ? JSON.stringify(resultToDisplay.actual, null, 2) : (resultToDisplay.actual || "N/A")}
                              </div>
                            </div>

                            <div className="space-y-3 md:col-span-2">
                              <label className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em] ml-1">Expected</label>
                              <div className="p-4 bg-[var(--viz-green)]/5 border border-[var(--viz-green)]/10 rounded-2xl text-xs font-mono text-[var(--viz-green)]/80 break-all">
                                {typeof localTestCases[activeTestCaseId].expectedOutput === 'object' ? JSON.stringify(localTestCases[activeTestCaseId].expectedOutput, null, 2) : localTestCases[activeTestCaseId].expectedOutput as string || "N/A"}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
