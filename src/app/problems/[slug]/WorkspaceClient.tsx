"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Split from "react-split";
import { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { 
  ChevronLeft, FileText, History, 
  Sparkles, Flame, MessageCircle, Info,
  CheckCircle, XCircle, Code2
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
import ProblemResources from "@/features/problems/components/Workspace/ProblemResources";
import { Library } from "lucide-react";

interface TestCase {
  input: string | object;
  expectedOutput?: string | object;
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
  type: "CODING" | "SHELL" | "INTERACTIVE" | "SYSTEM_DESIGN" | "SQL" | "READING";
  resources?: {
    id: string;
    title: string;
    url: string;
    type: string;
    creator?: string | null;
  }[];
}

interface WorkspaceClientProps {
  problem: Problem;
  examples: TestCase[];
  showBlueprint?: boolean;
  alreadySolved?: boolean;
}

export default function WorkspaceClient({ problem, examples, showBlueprint, alreadySolved }: WorkspaceClientProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useSession();

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const onEditorMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  useEffect(() => {
    if (activeTab === 'submissions') fetchSubmissions();
  }, [activeTab, fetchSubmissions]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-[100dvh] bg-[#050505] text-[#e1e1e1] overflow-hidden font-sans">
      <ExecutionAnimation 
        isVisible={showSuccessAnimation} 
        onComplete={() => setShowSuccessAnimation(false)} 
      />

      {/* PRO STUDIO HEADER */}
      <header className="h-[52px] border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-4 shrink-0 z-[60] shadow-sm">
         <div className="flex items-center gap-6">
            <Link href="/problems" className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-[#a1a1aa] hover:text-white group">
               <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div className="flex items-center gap-3 text-[14px]">
               <span className="text-[#52525b] font-medium tracking-tight">Problems</span>
               <span className="text-[#262626] font-light">/</span>
               <span className="text-[#f5f5f5] font-bold tracking-tight">{problem.title}</span>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
               solvedToday ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : "bg-white/5 text-[#52525b] border-transparent"
            }`}>
               <Flame size={14} className={solvedToday ? "fill-orange-500" : ""} />
               <span className="text-[12px] font-black">{streak}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <NotificationBell />
            <ThemeToggle />
         </div>
      </header>

      <main className="flex-1 overflow-hidden min-h-0 relative flex flex-col">
        {/* DESKTOP WORKSPACE */}
        <div className="hidden md:block flex-1 overflow-hidden">
            <Split
            className="flex h-full"
            sizes={[38, 62]}
            minSize={300}
            gutterSize={2}
            gutter={() => {
                const gutter = document.createElement('div');
                gutter.className = 'w-[2px] bg-black hover:bg-[#3b82f6]/40 transition-all cursor-col-resize z-50';
                return gutter;
            }}
            >
            {/* LEFT PANEL: CONTENT */}
            <div className="flex flex-col h-full bg-[#09090b] overflow-hidden min-h-0 border-r border-white/5">
                <div className="flex items-center px-4 border-b border-white/5 h-[44px] shrink-0 gap-6 bg-[#0a0a0a]">
                    {([
                    { id: 'description', label: 'Description', icon: Info },
                    { id: 'resources', label: 'Resources', icon: Library },
                    { id: 'submissions', label: 'History', icon: History },
                    { id: 'solutions', label: 'Solutions', icon: MessageCircle },
                    { id: 'ai', label: 'AI Coach', icon: Sparkles }, 
                    ] as const).map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`relative h-full text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 px-1 ${
                            activeTab === t.id ? "text-white" : "text-[#52525b] hover:text-[#a1a1aa]"
                        }`}
                    >
                        <t.icon size={14} className={activeTab === t.id ? "text-[#3b82f6]" : ""} />
                        {t.label}
                        {activeTab === t.id && (
                            <motion.div layoutId="left-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3b82f6] shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
                        )}
                    </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#09090b]">
                    <div className="p-8 max-w-4xl mx-auto">
                    {activeTab === 'description' && <ProblemDescription description={problem.description} examples={examples} />}
                    {activeTab === 'resources' && <ProblemResources resources={problem.resources || []} />}
                    {activeTab === 'submissions' && (
                        <div className="space-y-3">
                            {submissions.map((sub, i) => (
                                <div 
                                key={i} 
                                onClick={() => setSelectedSubmission(sub)}
                                className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-[#111111]/50 hover:bg-[#111111] hover:border-white/10 transition-all cursor-pointer group"
                                >
                                <div className="flex items-center gap-4">
                                    <div className={sub.status === 'Accepted' ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                                        {sub.status === 'Accepted' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                    </div>
                                    <div>
                                        <div className="text-[14px] font-bold tracking-tight">{sub.status}</div>
                                        <div className="text-[10px] text-[#52525b] uppercase font-black tracking-widest mt-0.5">{new Date(sub.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="text-right font-mono text-[12px] font-bold text-[#52525b] group-hover:text-[#a1a1aa] transition-colors">{sub.runtime}ms</div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'solutions' && <DiscussionSection problemId={problem.id} />}
                    {activeTab === 'ai' && <GeminiChat problemId={problem.id} problemTitle={problem.title} problemDescription={problem.description} code={code} language={language} testCases={examples} />}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: IDE */}
            <div className="flex flex-col h-full bg-[#050505] overflow-hidden min-h-0">
                <Split
                    direction="vertical"
                    sizes={[65, 35]}
                    minSize={100}
                    gutterSize={2}
                    gutter={() => {
                    const gutter = document.createElement('div');
                    gutter.className = 'h-[2px] bg-black hover:bg-[#3b82f6]/40 transition-all cursor-row-resize z-50';
                    return gutter;
                    }}
                    className="flex-1 flex flex-col min-h-0"
                >
                    {/* TOP: EDITOR */}
                    <div className="flex flex-col h-full overflow-hidden min-h-0 bg-[#0a0a0a]">
                    <div className="h-[44px] border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-4 shrink-0">
                        <div className="flex items-center gap-2">
                            <Code2 size={14} className="text-[#3b82f6]" />
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#52525b]">Code Workbench</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <EditorPanel
                                isToolbarOnly
                                language={language}
                                setLanguage={setLanguage}
                                onRun={(markersCb) => handleRun(markersCb)}
                                onSubmit={handleSubmit}
                                isRunning={isRunning}
                                isSubmitting={isSubmitting}
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 bg-[#09090b]">
                        <EditorPanel
                            isEditorOnly
                            code={code}
                            setCode={setCode}
                            language={language}
                            setLanguage={setLanguage}
                            theme="vs-dark"
                            onMount={onEditorMount}
                        />
                    </div>
                    </div>

                    {/* BOTTOM: CONSOLE */}
                    <div className="flex flex-col h-full bg-[#09090b] overflow-hidden min-h-0 border-t border-white/5 shadow-2xl">
                    <ConsolePanel
                        consoleTab={consoleTab}
                        setConsoleTab={setConsoleTab}
                        localTestCases={localTestCases}
                        activeTestCaseId={activeTestCaseId}
                        setActiveTestCaseId={setActiveTestCaseId}        
                        handleAddTestCase={handleAddTestCase}
                        removeTestCase={removeTestCase}
                        updateTestCase={updateTestCase}
                        results={results}
                        examplesLength={examples.length}
                        code={code}
                        language={language}
                        problemTitle={problem.title}
                    />
                    </div>
                </Split>
            </div>
            </Split>
        </div>

        {/* MOBILE WORKSPACE (READ-ONLY) */}
        <div className="md:hidden flex flex-col h-full bg-[#09090b] overflow-hidden">
            <div className="flex items-center px-4 border-b border-white/5 h-[44px] shrink-0 gap-6 bg-[#0a0a0a] overflow-x-auto no-scrollbar">
                {([
                    { id: 'description', label: 'Description', icon: Info },
                    { id: 'resources', label: 'Resources', icon: Library },
                    { id: 'submissions', label: 'History', icon: History },
                    { id: 'solutions', label: 'Solutions', icon: MessageCircle },
                    { id: 'ai', label: 'Coach', icon: Sparkles }, 
                ] as const).map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`relative h-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 px-1 shrink-0 ${
                            activeTab === t.id ? "text-white" : "text-[#52525b] hover:text-[#a1a1aa]"
                        }`}
                    >
                        <t.icon size={13} className={activeTab === t.id ? "text-[#3b82f6]" : ""} />
                        {t.label}
                        {activeTab === t.id && (
                            <motion.div layoutId="mobile-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3b82f6]" />
                        )}
                    </button>
                ))}
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pb-20">
                {activeTab === 'description' && <ProblemDescription description={problem.description} examples={examples} />}
                {activeTab === 'resources' && <ProblemResources resources={problem.resources || []} />}
                {activeTab === 'submissions' && (
                    <div className="space-y-3">
                        {submissions.map((sub, i) => (
                            <div 
                                key={i} 
                                onClick={() => setSelectedSubmission(sub)}
                                className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#111111]/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={sub.status === 'Accepted' ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                                        {sub.status === 'Accepted' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-bold">{sub.status}</div>
                                        <div className="text-[9px] text-[#52525b] uppercase font-black tracking-widest">{new Date(sub.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="font-mono text-[11px] text-[#52525b]">{sub.runtime}ms</div>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'solutions' && <DiscussionSection problemId={problem.id} />}
                {activeTab === 'ai' && <GeminiChat problemId={problem.id} problemTitle={problem.title} problemDescription={problem.description} code={code} language={language} testCases={examples} />}
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-[#3b82f6] text-white py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest z-50">
                💻 Switch to a desktop to code & submit
            </div>
        </div>
      </main>

      <SubmissionDetailsModal
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />

      <style jsx global>{`
        .gutter { z-index: 50; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
