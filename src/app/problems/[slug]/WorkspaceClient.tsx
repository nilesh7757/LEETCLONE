"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
const Split = dynamic(() => import("react-split"), { ssr: false });
import { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { 
  ChevronLeft, History, 
  Sparkles, Flame, MessageCircle, Info,
  CheckCircle, XCircle, Code2, Library
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import NotificationBell from "@/components/ui/NotificationBell";
import Link from "next/link";
import DiscussionSection from "@/features/problems/components/Discussion/DiscussionSection";
import { motion } from "framer-motion";

import { useSession } from "next-auth/react";
import GeminiChat from "@/features/ai/components/GeminiChat";      

// New Workspace Components
import { useWorkspace } from "@/features/problems/components/Workspace/useWorkspace";
import ProblemDescription from "@/features/problems/components/Workspace/ProblemDescription";
import EditorPanel from "@/features/problems/components/Workspace/EditorPanel";
import ConsolePanel from "@/features/problems/components/Workspace/ConsolePanel";
import SubmissionDetailsModal from "@/features/problems/components/Workspace/SubmissionDetailsModal";
import ExecutionAnimation from "@/features/problems/components/Workspace/ExecutionAnimation";
import ProblemResources from "@/features/problems/components/Workspace/ProblemResources";

export interface TestCase {
  input: string | object;
  expectedOutput?: string | object;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  description: string;
  timeLimit: number;
  memoryLimit: number;
  type: "CODING" | "SHELL" | "INTERACTIVE" | "SYSTEM_DESIGN" | "SQL" | "READING";
  initialSchema?: string | null;
  initialData?: string | null;
  blueprint?: unknown[] | null;
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

export default function WorkspaceClient({ problem, examples }: WorkspaceClientProps) {
  const [mounted, setMounted] = useState(false);
  useSession();

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    const val = localStorage.getItem("ai_autocomplete_enabled") === "true";
    const timer = setTimeout(() => {
      setAiEnabled(val);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleAi = (val: boolean) => {
    setAiEnabled(val);
    localStorage.setItem("ai_autocomplete_enabled", val ? "true" : "false");
  };

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
    consoleTab, setConsoleTab,
    activeTestCaseId, setActiveTestCaseId,
    handleRun, handleSubmit, handleAddTestCase, updateTestCase, removeTestCase,
    fetchSubmissions,
    streak,
    solvedToday,
    resetCode
  } = useWorkspace(problem, examples);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
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
    <div className="flex flex-col h-[100dvh] bg-[var(--background)] text-[var(--foreground)] overflow-hidden font-sans">
      <ExecutionAnimation 
        isVisible={showSuccessAnimation} 
        onComplete={() => setShowSuccessAnimation(false)} 
      />

      {/* PRO STUDIO HEADER */}
      <header className="h-[52px] border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between px-4 shrink-0 z-[60] shadow-sm">
         <div className="flex items-center gap-6">
            <Link href="/problems" className="p-1.5 hover:bg-[var(--foreground)]/5 rounded-lg transition-all text-[var(--muted-foreground)] hover:text-[var(--foreground)] group">
               <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div className="flex items-center gap-3 text-[14px]">
               <span className="text-[var(--muted-foreground)] font-medium tracking-tight">Problems</span>
               <span className="text-[var(--muted-foreground)] font-light opacity-30">/</span>
               <span className="text-[var(--foreground)] font-bold tracking-tight">{problem.title}</span>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
               solvedToday ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : "bg-[var(--foreground)]/5 text-[var(--muted-foreground)] border-transparent"
            }`}>
               <Flame size={14} className={solvedToday ? "fill-orange-500" : ""} />
               <span className="text-[12px] font-black">{streak}</span>
            </div>
            <div className="w-px h-4 bg-[var(--border)]" />
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
                gutter.className = 'w-[2px] bg-[var(--background)] hover:bg-[var(--primary)]/40 transition-all cursor-col-resize z-50';
                return gutter;
            }}
            >
            {/* LEFT PANEL: CONTENT */}
            <div className="flex flex-col h-full bg-[var(--card)] overflow-hidden min-h-0 border-r border-[var(--border)]">
                <div className="flex items-center px-4 border-b border-[var(--border)] h-[44px] shrink-0 gap-6 bg-[var(--card)]">
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
                            activeTab === t.id ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                    >
                        <t.icon size={14} className={activeTab === t.id ? "text-[var(--primary)]" : ""} />
                        {t.label}
                        {activeTab === t.id && (
                            <motion.div layoutId="left-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)] shadow-[0_0_12px_rgba(143,68,240,0.5)]" />
                        )}
                    </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--card)]">
                    <div className="p-8 max-w-4xl mx-auto">
                    {activeTab === 'description' && (
                      <ProblemDescription 
                        description={problem.description} 
                        examples={examples} 
                        difficulty={problem.difficulty}
                        category={problem.category}
                        timeLimit={problem.timeLimit}
                        memoryLimit={problem.memoryLimit}
                      />
                    )}
                    {activeTab === 'resources' && <ProblemResources resources={problem.resources || []} />}
                    {activeTab === 'submissions' && (
                        <div className="space-y-3">
                            {submissions.map((sub, i) => (
                                <div 
                                key={i} 
                                onClick={() => setSelectedSubmission(sub)}
                                className="flex items-center justify-between p-5 rounded-2xl border border-[var(--border)] bg-[var(--foreground)]/[0.02] hover:bg-[var(--foreground)]/[0.05] transition-all cursor-pointer group"
                                >
                                <div className="flex items-center gap-4">
                                    <div className={sub.status === 'Accepted' ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                                        {sub.status === 'Accepted' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                    </div>
                                    <div>
                                        <div className="text-[14px] font-bold tracking-tight">{sub.status}</div>
                                        <div className="text-[10px] text-[var(--muted-foreground)] uppercase font-black tracking-widest mt-0.5">{new Date(sub.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="text-right font-mono text-[12px] font-bold text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">{sub.runtime}ms</div>
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
            <div className="flex flex-col h-full bg-[var(--background)] overflow-hidden min-h-0">
                <Split
                    direction="vertical"
                    sizes={[65, 35]}
                    minSize={100}
                    gutterSize={2}
                    gutter={() => {
                    const gutter = document.createElement('div');
                    gutter.className = 'h-[2px] bg-[var(--background)] hover:bg-[var(--primary)]/40 transition-all cursor-row-resize z-50';
                    return gutter;
                    }}
                    className="flex-1 flex flex-col min-h-0"
                >
                    {/* TOP: EDITOR */}
                    <div className="flex flex-col h-full overflow-hidden min-h-0 bg-[var(--card)]">
                    <div className="h-[44px] border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between px-4 shrink-0">
                        <div className="flex items-center gap-2">
                            <Code2 size={14} className="text-[var(--primary)]" />
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Code Workbench</div>
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
                                onReset={resetCode}
                                aiEnabled={aiEnabled}
                                setAiEnabled={handleToggleAi}
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 bg-[var(--card)]">
                        <EditorPanel
                            isEditorOnly
                            code={code}
                            setCode={setCode}
                            language={language}
                            setLanguage={setLanguage}
                            theme="vs-dark"
                            onMount={onEditorMount}
                            aiEnabled={aiEnabled}
                            setAiEnabled={handleToggleAi}
                        />
                    </div>
                    </div>

                    {/* BOTTOM: CONSOLE */}
                    <div className="flex flex-col h-full bg-[var(--card)] overflow-hidden min-h-0 border-t border-[var(--border)] shadow-2xl">
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
        <div className="md:hidden flex flex-col h-full bg-[var(--card)] overflow-hidden">
            <div className="flex items-center px-4 border-b border-[var(--border)] h-[44px] shrink-0 gap-6 bg-[var(--card)] overflow-x-auto no-scrollbar">
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
                            activeTab === t.id ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                    >
                        <t.icon size={13} className={activeTab === t.id ? "text-[var(--primary)]" : ""} />
                        {t.label}
                        {activeTab === t.id && (
                            <motion.div layoutId="mobile-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)]" />
                        )}
                    </button>
                ))}
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pb-20">
                {activeTab === 'description' && (
                  <ProblemDescription 
                    description={problem.description} 
                    examples={examples} 
                    difficulty={problem.difficulty}
                    category={problem.category}
                    timeLimit={problem.timeLimit}
                    memoryLimit={problem.memoryLimit}
                  />
                )}
                {activeTab === 'resources' && <ProblemResources resources={problem.resources || []} />}
                {activeTab === 'submissions' && (
                    <div className="space-y-3">
                        {submissions.map((sub, i) => (
                            <div 
                                key={i} 
                                onClick={() => setSelectedSubmission(sub)}
                                className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.02]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={sub.status === 'Accepted' ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                                        {sub.status === 'Accepted' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-bold">{sub.status}</div>
                                        <div className="text-[9px] text-[var(--muted-foreground)] uppercase font-black tracking-widest">{new Date(sub.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="font-mono text-[11px] text-[var(--muted-foreground)]">{sub.runtime}ms</div>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'solutions' && <DiscussionSection problemId={problem.id} />}
                {activeTab === 'ai' && <GeminiChat problemId={problem.id} problemTitle={problem.title} problemDescription={problem.description} code={code} language={language} testCases={examples} />}
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-[var(--primary)] text-[var(--foreground)] py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest z-50">
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
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
      `}</style>
    </div>
  );
}
