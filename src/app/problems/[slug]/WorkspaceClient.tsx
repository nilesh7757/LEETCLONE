"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Split from "react-split";
import { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { 
  Play, Send, ChevronUp, CheckCircle, 
  XCircle, ChevronLeft, FileText, History, 
  Sparkles, Flame, Braces, Loader2, GripVertical 
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import NotificationBell from "@/components/ui/NotificationBell";
import Link from "next/link";
import DiscussionSection from "@/features/problems/components/Discussion/DiscussionSection";
import { motion, AnimatePresence } from "framer-motion";

import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import GeminiChat from "@/features/ai/components/GeminiChat";      
import { getStarterCode } from "@/lib/starterCode";

// New Workspace Components
import { useWorkspace } from "@/features/problems/components/Workspace/useWorkspace";
import ProblemDescription from "@/features/problems/components/Workspace/ProblemDescription";
import EditorPanel from "@/features/problems/components/Workspace/EditorPanel";
import ConsolePanel from "@/features/problems/components/Workspace/ConsolePanel";
import SubmissionDetailsModal from "@/features/problems/components/Workspace/SubmissionDetailsModal";
import ExecutionAnimation from "@/features/problems/components/Workspace/ExecutionAnimation";

interface TestCase {
  input: string | object;
  expectedOutput?: string | object;
}

interface Blueprint {
  id: string;
  type: string;
  data: unknown;
}

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  description: string;
  timeLimit: number;
  memoryLimit: number;
  initialSchema?: string | null;
  initialData?: string | null;
  hints?: string[] | null;
  isVerified?: boolean;
  creatorId?: string | null;
  type: "CODING" | "SHELL" | "INTERACTIVE" | "SYSTEM_DESIGN" | "SQL" | "READING";
  pattern?: string | null;
  blueprint?: Blueprint[] | null;
}

interface WorkspaceClientProps {
  problem: Problem;
  examples: TestCase[];
  showBlueprint?: boolean;
  alreadySolved?: boolean;
}

interface MonacoMarker {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
  severity: number;
}

export default function WorkspaceClient({ problem, examples }: WorkspaceClientProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const constraintsRef = useRef(null);

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const {
    code, setCode,
    language, setLanguage,
    localTestCases,
    results,
    isRunning,
    isSubmitting,
    submissions,
    selectedSubmission, setSelectedSubmission,
    activeTab, setActiveTab,
    consoleOpen, setConsoleOpen,
    consoleTab, setConsoleTab,
    activeTestCaseId, setActiveTestCaseId,
    handleRun, handleSubmit, handleAddTestCase, updateTestCase, removeTestCase,
    fetchSubmissions,
    streak,
    solvedToday
  } = useWorkspace(problem, examples);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Satisfy linter: defer state update to next frame
    const frame = requestAnimationFrame(() => {
        setMounted(true);
        setIsMobile(window.innerWidth < 768);
    });
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const parseAndSetMarkers = useCallback((errorMsg: string) => {   
     if (!monacoRef.current || !editorRef.current) return;

     const model = editorRef.current.getModel();
     if (!model) return;
     const markers: MonacoMarker[] = [];
     const lines = errorMsg.split('\n');

     const gccRegex = /:(\d+):(\d+):/i;
     const pythonRegex = /line\s+(\d+)/i;
     const javaRegex = /:(\d+):/i;

     lines.forEach(line => {
        const gccMatch = line.match(gccRegex);
        const pyMatch = line.match(pythonRegex);
        const javaMatch = line.match(javaRegex);

        if (gccMatch || pyMatch || javaMatch) {
           let lineNumber = parseInt(gccMatch ? gccMatch[1] : (pyMatch ? pyMatch[1] : javaMatch![1]));
           const column = gccMatch ? parseInt(gccMatch[2]) : 1;    

           if (line.toLowerCase().includes("expected ';'") && lineNumber > 1) {
              const prevLineContent = model.getLineContent(lineNumber - 1).trim();
              if (prevLineContent && !prevLineContent.endsWith(';') && !prevLineContent.endsWith('{') && !prevLineContent.endsWith('}')) {
                 lineNumber = lineNumber - 1;
              }
           }

           if (!isNaN(lineNumber) && lineNumber > 0 && lineNumber <= model.getLineCount()) {
              markers.push({
                 startLineNumber: lineNumber,
                 startColumn: column,
                 endLineNumber: lineNumber,
                 endColumn: model.getLineMaxColumn(lineNumber),    
                 message: line.trim(),
                 severity: monacoRef.current!.MarkerSeverity.Error 
              });
           }
        }
     });

     monacoRef.current.editor.setModelMarkers(model, "api-feedback", markers);
  }, []);

  const onEditorMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
       noSemanticValidation: false,
       noSyntaxValidation: false,
    });
  };

  useEffect(() => {
    if (activeTab === 'submissions') {
        fetchSubmissions();
    }
  }, [activeTab, fetchSubmissions]);

  // Logic to watch results for Accepted
  useEffect(() => {
    if (!results || results.length === 0) return;
    const latestResult = results[results.length - 1];
    if (latestResult && latestResult.status === "Accepted" && !isRunning && !isSubmitting && activeTab === 'description') {
        // Use timeout to satisfy linter and prevent immediate re-render cascade
        const timer = setTimeout(() => setShowSuccessAnimation(true), 100);
        return () => clearTimeout(timer);
    }
  }, [results, isSubmitting, isRunning, activeTab]);

  if (!mounted) return null;

  const headerContent = (
    <header className="h-auto md:h-14 border-b border-[var(--border)] bg-[var(--card)]/40 backdrop-blur-xl flex flex-col md:flex-row items-center px-6 py-2 md:py-0 shrink-0 z-50 relative gap-3 md:gap-0">
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--viz-blue)]/20 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between w-full md:w-auto gap-4 z-10">
        <div className="flex items-center gap-4">
          <Link href="/problems" className="p-2 hover:bg-[var(--foreground)]/5 rounded-xl transition-all hover:scale-105 group">
            <ChevronLeft size={20} className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]" />
          </Link>
          <div className="hidden md:block h-6 w-px bg-[var(--border)] opacity-50" />
          <div className="flex items-center gap-4">
             <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-0.5">
                   <h1 className="font-black text-sm md:text-lg tracking-tight text-[var(--foreground)] truncate max-w-[180px] sm:max-w-[300px] md:max-w-lg leading-tight">
                      {problem.title}
                   </h1>
                   <span className={`hidden sm:inline-block text-[9px] font-black uppercase tracking-[0.25em] px-2.5 py-0.5 rounded-full border ${
                      problem.difficulty === 'Easy' ? 'text-[var(--viz-green)] border-[var(--viz-green)]/30 bg-[var(--viz-green)]/5' : 
                      problem.difficulty === 'Medium' ? 'text-[var(--viz-amber)] border-[var(--viz-amber)]/30 bg-[var(--viz-amber)]/5' : 
                      'text-[var(--viz-red)] border-[var(--viz-red)]/30 bg-[var(--viz-red)]/5'
                   }`}>
                      {problem.difficulty}
                   </span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-widest opacity-60">{problem.category}</span>
                   <div className="sm:hidden w-1 h-1 rounded-full bg-[var(--border)]" />
                   <span className={`sm:hidden text-[9px] font-black uppercase tracking-wider ${
                      problem.difficulty === 'Easy' ? 'text-[var(--viz-green)]' : 
                      problem.difficulty === 'Medium' ? 'text-[var(--viz-amber)]' : 'text-[var(--viz-red)]'
                   }`}>
                      {problem.difficulty}
                   </span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center justify-center pointer-events-none w-full md:w-auto">
         <div className="flex items-center gap-1 bg-[var(--background)]/60 backdrop-blur-md rounded-2xl p-1 border border-[var(--border)] pointer-events-auto shadow-2xl shadow-black/20 w-full md:w-auto justify-center group/controls">
            <button
              onClick={() => handleRun(parseAndSetMarkers)}      
              disabled={isRunning}
              className="flex-1 md:flex-none px-5 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-95"
            >
               <Play size={14} fill="currentColor" className="text-[var(--viz-blue)]" /> Run        
            </button>
            <div className="w-px h-5 bg-[var(--border)] opacity-50" />      
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest text-[var(--viz-green)] hover:bg-[var(--viz-green)]/10 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-95 shadow-sm shadow-[var(--viz-green)]/5"
            >
               {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="drop-shadow-[0_0_8px_var(--viz-green)]" />} Submit
            </button>
         </div>
      </div>

      <div className="hidden md:flex items-center ml-auto z-10">
         <motion.div 
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            whileDrag={{ scale: 1.05, cursor: "grabbing" }}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
            className="flex items-center gap-2 p-1 rounded-2xl bg-[var(--card)]/60 backdrop-blur-2xl border border-[var(--border)] shadow-xl hover:bg-[var(--card)]/80 transition-all group/island cursor-grab active:shadow-2xl"
         >
            <div className="pl-1 text-[var(--muted-foreground)] opacity-20 group-hover/island:opacity-100 transition-opacity">
               <GripVertical size={12} />
            </div>

            <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border transition-all ${
               solvedToday 
               ? "bg-[var(--viz-gold)]/10 text-[var(--viz-gold)] border-[var(--viz-gold)]/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]" 
               : "bg-[var(--foreground)]/5 text-[var(--muted-foreground)] border-transparent"
            }`}>
               <Flame 
                  size={14} 
                  className={`transition-all ${solvedToday ? "fill-[var(--viz-gold)] drop-shadow-[0_0_8px_var(--viz-gold)] animate-pulse" : "opacity-40 grayscale"}`} 
               />
               <span className="text-[10px] font-black tracking-tight">{streak}</span>
            </div>

            <div className="w-px h-3 bg-[var(--border)] opacity-50 mx-0.5" />

            <div className="flex items-center gap-0.5 pointer-events-auto" onPointerDown={(e) => e.stopPropagation()}>
               <NotificationBell />
               <ThemeToggle direction="down" />
            </div>
         </motion.div>
      </div>
    </header>
  );

  const leftPanel = (
    <div className="flex flex-col h-full bg-[var(--card)]/5 backdrop-blur-sm overflow-hidden relative">
       <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--viz-purple)]/10 to-transparent pointer-events-none" />
       
       <div className="flex items-center gap-1 px-3 border-b border-[var(--border)] bg-[var(--background)]/40 shrink-0 overflow-x-auto no-scrollbar py-2">
          {([
             { id: 'description', label: 'Description', icon: FileText },
             { id: 'submissions', label: 'History', icon: History },
             { id: 'solutions', label: 'Solutions', icon: Braces },
             { id: 'ai', label: 'AI Coach', icon: Sparkles }, 
          ] as const).map(t => (
             <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative flex items-center gap-2 px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all rounded-xl ${
                   activeTab === t.id 
                   ? "text-[var(--foreground)] bg-[var(--background)] shadow-lg shadow-black/10 border border-[var(--border)]" 
                   : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                }`}
             >
                <t.icon size={14} className={activeTab === t.id ? "text-[var(--viz-blue)]" : ""} />
                <span className="hidden sm:inline">{t.label}</span>
                {activeTab === t.id && (
                   <motion.div 
                      layoutId="activeTabGlow"
                      className="absolute inset-0 bg-[var(--viz-blue)]/5 rounded-xl blur-md -z-10"
                   />
                )}
             </button>
          ))}
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <AnimatePresence mode="wait">
            <motion.div
               key={activeTab}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 10 }}
               transition={{ duration: 0.2 }}
               className="h-full"
            >
               {activeTab === 'description' && (
                  <ProblemDescription description={problem.description} examples={examples} />
               )}

               {activeTab === 'submissions' && (
                  <div className="space-y-4">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Submission Logs</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--muted)] border border-[var(--border)]">{submissions.length} Total</span>
                     </div>
                     {submissions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30">
                           <History size={48} strokeWidth={1} className="mb-4" />
                           <p className="text-xs uppercase tracking-[0.3em] font-black">No History Found</p>
                        </div>
                     )}       
                     {submissions.map((sub, i) => (
                        <motion.div 
                           key={i} 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.05 }}
                           whileHover={{ x: 4 }}
                           className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--viz-blue)]/40 hover:shadow-xl hover:shadow-[var(--viz-blue)]/5 transition-all cursor-pointer group" 
                           onClick={() => setSelectedSubmission(sub)}
                        >        
                           <div className="flex items-center gap-4">
                              <div className={`p-2.5 rounded-xl ${sub.status === 'Accepted' ? 'bg-[var(--viz-green)]/10 text-[var(--viz-green)]' : 'bg-[var(--viz-red)]/10 text-[var(--viz-red)]'}`}>
                                 {sub.status === 'Accepted' ? <CheckCircle size={20} className="drop-shadow-[0_0_8px_currentColor]" /> : <XCircle size={20} className="drop-shadow-[0_0_8px_currentColor]" />}
                              </div>
                              <div>
                                 <div className="text-sm font-black tracking-tight group-hover:text-[var(--viz-blue)] transition-colors">{sub.status}</div>
                                 <div className="text-[10px] text-[var(--muted-foreground)] font-medium uppercase tracking-wider">{new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-xs font-mono font-bold text-[var(--foreground)]">{sub.runtime ? `${sub.runtime}ms` : '---'}</div>
                              <div className="text-[10px] text-[var(--muted-foreground)] font-black uppercase tracking-widest">{sub.language}</div>
                           </div>
                        </motion.div>
                     ))}
                  </div>
               )}

               {activeTab === 'solutions' && <DiscussionSection problemId={problem.id} />}

               {activeTab === 'ai' && (
                  <GeminiChat
                     problemId={problem.id}
                     problemTitle={problem.title}
                     problemDescription={problem.description}       
                     code={code}
                     language={language}
                     testCases={examples}
                  />
               )}
            </motion.div>
          </AnimatePresence>
       </div>
    </div>
  );

  const rightPanel = (
    <div className="h-full flex flex-col bg-[var(--background)] overflow-hidden relative">
       {/* Ambient Glows */}
       <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[var(--viz-blue)]/5 blur-[100px] -z-10 pointer-events-none" />
       
       {isMobile ? (
         <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 min-h-[300px]">
              <EditorPanel
                code={code}
                setCode={setCode}
                language={language}
                setLanguage={setLanguage}
                theme={resolvedTheme || "dark"}
                problemType={problem.type}
                initialCode={problem.type === "SQL" ? "SELECT * FROM Users;" : getStarterCode(language)}
                onMount={onEditorMount}
              />
            </div>
            <div className="border-t border-[var(--border)] max-h-[40%] overflow-y-auto">
                <ConsolePanel
                  consoleTab={consoleTab}
                  setConsoleTab={setConsoleTab}
                  setConsoleOpen={setConsoleOpen}
                  localTestCases={localTestCases}
                  activeTestCaseId={activeTestCaseId}
                  setActiveTestCaseId={setActiveTestCaseId}        
                  handleAddTestCase={handleAddTestCase}
                  removeTestCase={removeTestCase}
                  updateTestCase={updateTestCase}
                  results={results}
                  examplesLength={examples.length}
                />
            </div>
         </div>
       ) : (
         <Split
            direction="vertical"
            sizes={consoleOpen ? [65, 35] : [100, 0]}
            minSize={consoleOpen ? 120 : 0}
            gutterSize={consoleOpen ? 8 : 0}
            gutter={(index, direction) => {
               const gutter = document.createElement('div');
               gutter.className = `gutter gutter-${direction} relative transition-all group/gutter`;
               const inner = document.createElement('div');
               inner.className = "absolute inset-0 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent opacity-0 group-hover/gutter:opacity-100 transition-opacity";
               gutter.appendChild(inner);
               return gutter;
            }}
            className="flex-1 flex flex-col h-full"
         >
            <div className="min-h-0 flex-1">
               <EditorPanel
                 code={code}
                 setCode={setCode}
                 language={language}
                 setLanguage={setLanguage}
                 theme={resolvedTheme || "dark"}
                 problemType={problem.type}
                 initialCode={problem.type === "SQL" ? "SELECT * FROM Users;" : getStarterCode(language)}
                 onMount={onEditorMount}
               />
            </div>

            {consoleOpen && (
              <div className="min-h-0">
                 <ConsolePanel
                   consoleTab={consoleTab}
                   setConsoleTab={setConsoleTab}
                   setConsoleOpen={setConsoleOpen}
                   localTestCases={localTestCases}
                   activeTestCaseId={activeTestCaseId}
                   setActiveTestCaseId={setActiveTestCaseId}        
                   handleAddTestCase={handleAddTestCase}
                   removeTestCase={removeTestCase}
                   updateTestCase={updateTestCase}
                   results={results}
                   examplesLength={examples.length}
                 />
              </div>
            )}
         </Split>
       )}

       {!consoleOpen && !isMobile && (
          <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="h-10 border-t border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-md flex items-center justify-between px-6 cursor-pointer hover:bg-[var(--foreground)]/5 transition-all group" 
             onClick={() => setConsoleOpen(true)}
          >
             <div className="text-[10px] font-black text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] uppercase tracking-[0.2em] flex items-center gap-2.5 transition-colors">  
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-green)] animate-pulse" />
                Console
             </div>
             <ChevronUp size={16} className="text-[var(--muted-foreground)] group-hover:translate-y-[-2px] transition-all" />
          </motion.div>
       )}
    </div>
  );

  return (
    <div ref={constraintsRef} className="flex flex-col h-[100dvh] bg-[var(--background)] text-[var(--foreground)] overflow-hidden font-sans selection:bg-[var(--viz-blue)]/20 relative">
      <ExecutionAnimation 
        isVisible={showSuccessAnimation} 
        onComplete={() => setShowSuccessAnimation(false)} 
      />
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] -z-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-[var(--viz-blue)]/2 via-transparent to-[var(--viz-purple)]/2 -z-20 pointer-events-none" />

      {headerContent}

      <div className="flex-1 overflow-hidden">
        {isMobile ? (
          <div className="h-full overflow-y-auto overflow-x-hidden no-scrollbar">
             <div className="flex flex-col">
                <div className="h-[45vh] min-h-[350px]">
                   {leftPanel}
                </div>
                <div className="h-[55vh] min-h-[400px]">
                   {rightPanel}
                </div>
             </div>
          </div>
        ) : (
          <Split
            className="flex h-full"
            sizes={[42, 58]}
            minSize={380}
            gutterSize={8}
            gutterAlign="center"
            dragInterval={1}
            gutter={(index, direction) => {
               const gutter = document.createElement('div');
               gutter.className = `gutter gutter-${direction} relative transition-all group/gutter hover:bg-[var(--viz-blue)]/5`;
               const inner = document.createElement('div');
               inner.className = "absolute inset-0 bg-gradient-to-b from-transparent via-[var(--border)] to-transparent opacity-0 group-hover/gutter:opacity-100 transition-opacity";
               gutter.appendChild(inner);
               return gutter;
            }}
          >
            {leftPanel}
            {rightPanel}
          </Split>
        )}
      </div>

      <SubmissionDetailsModal
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />

      <style jsx global>{`
        .gutter {
          background-color: transparent;
          background-repeat: no-repeat;
          background-position: 50%;
        }
        .gutter.gutter-horizontal {
          cursor: col-resize;
          width: 8px;
        }
        .gutter.gutter-vertical {
          cursor: row-resize;
          height: 8px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
