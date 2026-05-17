"use client";

import { Terminal, Plus, PlayCircle, AlertCircle, X, CheckCircle2, Info, ChevronRight, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AIVisualizer from "@/features/visualizer/components/AIVisualizer";

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
  
  const activeCase = localTestCases[activeTestCaseId] || localTestCases[0];
  const activeResult = results ? results[activeTestCaseId] : null;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#09090b]">
      {/* Tab Header */}
      <div className="h-[44px] px-4 border-b border-white/5 flex items-center shrink-0 gap-8 bg-[#0a0a0a]">
        <button 
          onClick={() => setConsoleTab('testcase')}
          className={`h-full relative text-[11px] font-black uppercase tracking-widest flex items-center gap-2 px-1 transition-all ${
            consoleTab === 'testcase' ? "text-[#3b82f6]" : "text-[#52525b] hover:text-[#a1a1aa]"
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${consoleTab === 'testcase' ? "bg-[#3b82f6]" : "bg-transparent border border-[#52525b]"}`} />
          Testcases
          {consoleTab === 'testcase' && <motion.div layoutId="console-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]" />}
        </button>
        <button 
          onClick={() => setConsoleTab('result')}
          className={`h-full relative text-[11px] font-black uppercase tracking-widest flex items-center gap-2 px-1 transition-all ${
            consoleTab === 'result' ? "text-[#3b82f6]" : "text-[#52525b] hover:text-[#a1a1aa]"
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${consoleTab === 'result' ? "bg-[#3b82f6]" : "bg-transparent border border-[#52525b]"}`} />
          Results
          {consoleTab === 'result' && <motion.div layoutId="console-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]" />}
        </button>
      </div>

      {/* CASE SELECTOR (Horizontal Pills) */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#09090b]/50 overflow-x-auto no-scrollbar shrink-0">
         {localTestCases.map((_, i) => {
            const result = results ? results[i] : null;
            const isSuccess = result?.status === 'Accepted';
            const isError = result && !isSuccess;

            return (
               <button
                  key={i}
                  onClick={() => setActiveTestCaseId(i)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 border border-white/5 group relative ${
                     activeTestCaseId === i 
                        ? "bg-[#3b82f6] text-white border-[#3b82f6]" 
                        : "bg-white/5 text-[#a1a1aa] hover:bg-white/10"
                  }`}
               >
                  {isSuccess && <div className="w-1 h-1 rounded-full bg-white animate-pulse" />}
                  {isError && <AlertCircle size={10} className="text-rose-400" />}
                  Case {i + 1}
                  {i >= examplesLength && activeTestCaseId === i && (
                     <X 
                        size={12} 
                        onClick={(e) => { e.stopPropagation(); removeTestCase(i); }} 
                        className="ml-1 hover:text-white transition-colors" 
                     />
                  )}
               </button>
            );
         })}
         <button 
            onClick={handleAddTestCase}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black text-[#52525b] hover:text-[#3b82f6] hover:bg-[#3b82f6]/5 border border-dashed border-white/10 transition-all shrink-0"
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
              className="h-full overflow-y-auto custom-scrollbar p-6 space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                     <Hash size={12} className="text-[#3b82f6]" />
                     <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#52525b]">Input Parameters</div>
                  </div>
                  <textarea
                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 text-[13px] font-mono text-[#e1e1e1] outline-none focus:border-[#3b82f6]/30 transition-all min-h-[160px] resize-none shadow-inner"
                    value={typeof activeCase?.input === 'object' ? JSON.stringify(activeCase.input, null, 2) : activeCase?.input as string}
                    onChange={(e) => updateTestCase(activeTestCaseId, 'input', e.target.value)}
                    placeholder="Enter input here..."
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                     <CheckCircle2 size={12} className="text-[#22c55e]" />
                     <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#52525b]">Expected Output</div>
                  </div>
                  <textarea
                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 text-[13px] font-mono text-[#e1e1e1] outline-none focus:border-[#3b82f6]/30 transition-all min-h-[160px] resize-none shadow-inner"
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
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                     <Terminal size={32} strokeWidth={1.5} className="text-[#3b82f6]" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#52525b]">Waiting for execution</p>
                </div>
              ) : (
                <div className="max-w-6xl mx-auto space-y-10">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between p-6 bg-[#0a0a0a] rounded-3xl border border-white/5">
                    <div className="flex items-center gap-8">
                       <div>
                          <div className="text-[10px] font-black uppercase text-[#52525b] tracking-widest mb-1">Execution Status</div>
                          <div className={`text-3xl font-black tracking-tighter ${activeResult?.status === 'Accepted' ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                             {activeResult?.status || "Incomplete"}
                          </div>
                       </div>
                       <div className="w-px h-10 bg-white/5" />
                       <div>
                          <div className="text-[10px] font-black uppercase text-[#52525b] tracking-widest mb-1">Latency</div>
                          <div className="font-mono text-xl font-bold text-white tracking-tight">{activeResult?.runtime || 0}<span className="text-[10px] text-[#52525b] ml-1 uppercase">ms</span></div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <AIVisualizer 
                          code={code} 
                          language={language} 
                          problemTitle={problemTitle}
                          input={typeof activeCase?.input === 'object' ? JSON.stringify(activeCase.input) : activeCase?.input as string}
                       />
                       <div className="px-5 py-2.5 rounded-2xl bg-[#3b82f6]/10 text-[#3b82f6] text-[11px] font-black uppercase tracking-widest border border-[#3b82f6]/20">
                          Verified Case {activeTestCaseId + 1}
                       </div>
                    </div>
                  </div>

                  {/* IO Diff View */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <div className="text-[10px] font-black text-[#52525b] uppercase tracking-widest">Actual Result</div>
                        <div className={`p-6 bg-[#0a0a0a] border rounded-3xl font-mono text-[13px] min-h-[140px] break-all shadow-inner leading-relaxed ${activeResult?.status === 'Accepted' ? "text-[#22c55e] border-[#22c55e]/20" : "text-rose-400 border-rose-500/20"}`}>
                           {typeof activeResult?.actual === 'object' ? JSON.stringify(activeResult.actual, null, 2) : (activeResult?.actual || "No return value")}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="text-[10px] font-black text-[#52525b] uppercase tracking-widest">Expected Output</div>
                        <div className={`p-6 bg-[#0a0a0a] border border-white/5 rounded-3xl font-mono text-[13px] min-h-[140px] break-all shadow-inner leading-relaxed text-[#a1a1aa]`}>
                           {typeof activeResult?.expected === 'object' ? JSON.stringify(activeResult.expected, null, 2) : (activeResult?.expected || "N/A")}
                        </div>
                     </div>
                  </div>

                  {/* Stderr / Logs */}
                  <div className="space-y-4">
                     <div className="text-[10px] font-black text-[#52525b] uppercase tracking-widest">Runtime Stderr / Log</div>
                     <div className={`p-6 bg-[#0a0a0a] border rounded-3xl font-mono text-[13px] min-h-[80px] break-all leading-relaxed ${activeResult?.error ? "border-rose-500/20 text-rose-400" : "border-white/5 text-[#52525b]"}`}>
                        {activeResult?.error || "Process finished with no standard error output."}
                     </div>
                  </div>

                  {/* Input Ref */}
                  <div className="p-6 bg-[#0a0a0a]/30 border border-white/5 rounded-3xl space-y-4">
                     <div className="text-[10px] font-black text-[#52525b] uppercase tracking-widest">Trace Input</div>
                     <pre className="text-[12px] font-mono text-[#52525b] overflow-x-auto whitespace-pre-wrap">
                        {typeof activeCase?.input === 'object' ? JSON.stringify(activeCase.input) : activeCase?.input as string}
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
