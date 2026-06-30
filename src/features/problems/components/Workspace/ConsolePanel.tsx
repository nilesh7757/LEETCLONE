"use client";

import { Terminal, Plus, PlayCircle, AlertCircle, X, CheckCircle2, XCircle, Info, ChevronRight, Hash, Copy, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AIVisualizer from "@/features/visualizer/components/AIVisualizer";
import { toast } from "sonner";

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
  localTestCases: TestCase[];
  activeTestCaseId: number;
  setActiveTestCaseId: (id: number) => void;
  handleAddTestCase: () => void;
  removeTestCase: (index: number) => void;
  updateTestCase: (index: number, field: 'input' | 'expectedOutput', value: string) => void;
  results: Result[] | null;
  examplesLength: number;
  code: string;
  language: string;
  problemTitle: string;
}

export default function ConsolePanel({
  consoleTab, setConsoleTab,
  localTestCases, activeTestCaseId, setActiveTestCaseId,
  handleAddTestCase, removeTestCase, updateTestCase,
  results, examplesLength, code, language, problemTitle
}: ConsolePanelProps) {
  const [copied, setCopied] = useState(false);
  
  const activeCase = localTestCases[activeTestCaseId] || localTestCases[0];
  const activeResult = results ? results[activeTestCaseId] : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Error copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const isCompilationError = activeResult?.status === "Compilation Error";
  const isRuntimeError = activeResult?.status === "Runtime Error";
  const isErrorState = isCompilationError || isRuntimeError || activeResult?.error;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--card)] border-t border-[var(--border)]">
      {/* Tab Header */}
      <div className="h-[44px] px-6 border-b border-[var(--border)] flex items-center shrink-0 gap-8 bg-[var(--card)]">
        <button 
          onClick={() => setConsoleTab('testcase')}
          className={`h-full relative text-[11px] font-black uppercase tracking-widest flex items-center gap-2 px-1 transition-all ${
            consoleTab === 'testcase' ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${consoleTab === 'testcase' ? "bg-[var(--primary)]" : "bg-transparent border border-[var(--muted-foreground)]"}`} />
          Testcases
          {consoleTab === 'testcase' && <motion.div layoutId="console-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />}
        </button>
        <button 
          onClick={() => setConsoleTab('result')}
          className={`h-full relative text-[11px] font-black uppercase tracking-widest flex items-center gap-2 px-1 transition-all ${
            consoleTab === 'result' ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${consoleTab === 'result' ? "bg-[var(--primary)]" : "bg-transparent border border-[var(--muted-foreground)]"}`} />
          Results
          {consoleTab === 'result' && <motion.div layoutId="console-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />}
        </button>
      </div>

      {/* CASE SELECTOR (Horizontal Pills) */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-[var(--border)] bg-[var(--background)]/40 overflow-x-auto no-scrollbar shrink-0">
         {localTestCases.map((_, i) => {
            const result = results ? results[i] : null;
            const isSuccess = result?.status === 'Accepted';
            const isError = result && !isSuccess;

            return (
               <button
                  key={i}
                  onClick={() => setActiveTestCaseId(i)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 border group relative ${
                     activeTestCaseId === i 
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30 font-black" 
                        : "bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--foreground)]/5"
                  }`}
               >
                  {isSuccess && <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />}
                  {isError && <XCircle size={12} className="text-rose-500 shrink-0" />}
                  {!result && <div className="w-1.5 h-1.5 rounded-full bg-[var(--muted-foreground)]/30 shrink-0" />}
                  Case {i + 1}
                  {i >= examplesLength && activeTestCaseId === i && (
                     <X 
                        size={12} 
                        onClick={(e) => { e.stopPropagation(); removeTestCase(i); }} 
                        className="ml-1 hover:text-[var(--foreground)] transition-colors opacity-60 hover:opacity-100" 
                     />
                  )}
               </button>
            );
         })}
         <button 
            onClick={handleAddTestCase}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 border border-dashed border-[var(--border)] hover:border-[var(--primary)]/30 transition-all shrink-0 bg-transparent"
         >
            <Plus size={14} /> New Case
         </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {consoleTab === 'testcase' ? (
            <motion.div 
              key="testcase"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto custom-scrollbar p-6 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                     <Hash size={12} className="text-[var(--primary)]" />
                     <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Input Parameters</div>
                  </div>
                  <textarea
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5 text-[13px] font-mono text-[var(--foreground)] outline-none focus:border-[var(--primary)]/30 transition-all min-h-[160px] resize-none shadow-sm"
                    value={typeof activeCase?.input === 'object' ? JSON.stringify(activeCase.input, null, 2) : activeCase?.input as string}
                    onChange={(e) => updateTestCase(activeTestCaseId, 'input', e.target.value)}
                    placeholder="Enter input here..."
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                     <CheckCircle2 size={12} className="text-emerald-500" />
                     <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Expected Output</div>
                  </div>
                  <textarea
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5 text-[13px] font-mono text-[var(--foreground)] outline-none focus:border-[var(--primary)]/30 transition-all min-h-[160px] resize-none shadow-sm"
                    value={typeof activeCase?.expectedOutput === 'object' ? JSON.stringify(activeCase.expectedOutput, null, 2) : activeCase?.expectedOutput as string}
                    onChange={(e) => updateTestCase(activeTestCaseId, 'expectedOutput', e.target.value)}
                    placeholder="Optional: Enter expected output for verification..."
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto custom-scrollbar p-6"
            >
              {!results ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <div className="w-16 h-16 rounded-3xl bg-[var(--foreground)]/5 flex items-center justify-center mb-4 border border-[var(--border)]">
                     <Terminal size={32} strokeWidth={1.5} className="text-[var(--primary)]" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Waiting for execution</p>
                </div>
              ) : (
                <div className="max-w-6xl mx-auto space-y-6">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between p-5 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                    <div className="flex items-center gap-8">
                       <div>
                          <div className="text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-widest mb-1">Execution Status</div>
                          <div className={`text-2xl font-black tracking-tighter ${activeResult?.status === 'Accepted' ? "text-emerald-500" : "text-rose-500"}`}>
                             {activeResult?.status || "Incomplete"}
                          </div>
                       </div>
                       <div className="w-px h-10 bg-[var(--border)]" />
                       <div>
                          <div className="text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-widest mb-1">Latency</div>
                          <div className="font-mono text-lg font-bold text-[var(--foreground)] tracking-tight">{activeResult?.runtime || 0}<span className="text-[10px] text-[var(--muted-foreground)] ml-1 uppercase">ms</span></div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <AIVisualizer 
                          code={code} 
                          language={language} 
                          problemTitle={problemTitle}
                          input={typeof activeCase?.input === 'object' ? JSON.stringify(activeCase.input) : activeCase?.input as string}
                       />
                       <div className="px-4 py-2 rounded-xl bg-[var(--primary)]/5 text-[var(--primary)] text-[11px] font-black uppercase tracking-widest border border-[var(--primary)]/10">
                          Case {activeTestCaseId + 1}
                       </div>
                    </div>
                  </div>

                  {/* Render Error Screen if Compilation/Runtime Error occurs */}
                  {isErrorState ? (
                    <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="text-rose-500 w-5 h-5 shrink-0" />
                          <span className="text-sm font-bold text-rose-500 uppercase tracking-wider">
                            {isCompilationError ? "Compilation Failure" : "Runtime Exception"}
                          </span>
                        </div>
                        {activeResult?.error && (
                          <button 
                            onClick={() => copyToClipboard(activeResult.error || "")}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                            title="Copy error logs"
                          >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            Copy Stacktrace
                          </button>
                        )}
                      </div>
                      <pre className="p-4 bg-[var(--background)] border border-[var(--border)] rounded-xl font-mono text-[12px] text-rose-400 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[300px] custom-scrollbar shadow-inner">
                        {activeResult?.error || "An unknown process execution error occurred."}
                      </pre>
                    </div>
                  ) : (
                    <>
                      {/* IO Diff View */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-3">
                            <div className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Actual Output</div>
                            <pre className={`p-5 bg-[var(--background)] border rounded-2xl font-mono text-[13px] min-h-[120px] break-all leading-relaxed shadow-sm overflow-x-auto ${
                              activeResult?.status === 'Accepted' 
                                ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/[0.01]" 
                                : "text-rose-400 border-rose-500/20 bg-rose-500/[0.01]"
                            }`}>
                               {typeof activeResult?.actual === 'object' 
                                 ? JSON.stringify(activeResult.actual, null, 2) 
                                 : (activeResult?.actual || "No return value")}
                            </pre>
                         </div>

                         <div className="space-y-3">
                            <div className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Expected Output</div>
                            <pre className="p-5 bg-[var(--background)] border border-[var(--border)] rounded-2xl font-mono text-[13px] min-h-[120px] break-all leading-relaxed text-[var(--foreground)]/70 shadow-sm overflow-x-auto">
                               {typeof activeResult?.expected === 'object' 
                                 ? JSON.stringify(activeResult.expected, null, 2) 
                                 : (activeResult?.expected || "N/A")}
                            </pre>
                         </div>
                      </div>
                    </>
                  )}

                  {/* Input Ref */}
                  <div className="p-5 bg-[var(--background)] border border-[var(--border)] rounded-2xl space-y-3 shadow-sm">
                     <div className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Trace Input</div>
                     <pre className="text-[12px] font-mono text-[var(--muted-foreground)] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {typeof activeCase?.input === 'object' ? JSON.stringify(activeCase.input, null, 2) : activeCase?.input as string}
                     </pre>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

