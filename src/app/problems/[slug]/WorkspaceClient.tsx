"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
const Split = dynamic(() => import("react-split"), { ssr: false });
import { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { 
  ChevronLeft, History, 
  Sparkles, Flame, MessageCircle, Info,
  CheckCircle, XCircle, Code2, Library, Star,
  Terminal, X, Play, Send, Loader2, Database
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import NotificationBell from "@/components/ui/NotificationBell";
import Link from "next/link";
import DiscussionSection from "@/features/problems/components/Discussion/DiscussionSection";
import { motion, AnimatePresence } from "framer-motion";

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
import DatabaseSchemaViewer from "@/features/problems/components/Workspace/DatabaseSchemaViewer";

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
  isStarred?: boolean;
  companies?: string[];
  companyTags?: string[];
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
  const [isStarred, setIsStarred] = useState(problem.isStarred || false);
  const [mobileMainTab, setMobileMainTab] = useState<'others' | 'code'>('others');
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const toggleWorkspaceStar = async () => {
    setIsStarred(prev => !prev);
    try {
      const { data } = await axios.post(`/api/problems/${problem.slug}/star`);
      setIsStarred(data.starred);
      if (data.starred) {
        toast.success("Problem bookmarked!");
      } else {
        toast.success("Bookmark removed.");
      }
    } catch {
      setIsStarred(prev => !prev);
      toast.error("Failed to toggle bookmark.");
    }
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

  useEffect(() => {
    if (selectedSubmission) {
      setActiveTab("submission-details");
    }
  }, [selectedSubmission, setActiveTab]);

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
               <button
                  onClick={toggleWorkspaceStar}
                  className="p-1 rounded-lg hover:bg-white/5 transition-all text-gray-500 hover:text-yellow-500 shrink-0 cursor-pointer"
                  title={isStarred ? "Remove bookmark" : "Bookmark problem"}
               >
                  <Star 
                     size={14} 
                     className={isStarred ? "fill-yellow-500 text-yellow-500" : "text-gray-500 hover:text-yellow-500"} 
                  />
               </button>
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
            <div 
              className="flex flex-col h-full bg-[var(--card)] overflow-hidden min-h-0 border-r border-[var(--border)] @container"
              style={{ containerType: 'inline-size', containerName: 'sidebar' }}
            >
                <div className="flex items-center px-2 border-b border-[var(--border)] h-[44px] shrink-0 gap-1 xl:gap-2 bg-[var(--card)] overflow-hidden">
                    {([
                      { id: 'description', label: 'Description', icon: Info },
                      ...(problem.type === "SQL" ? [{ id: 'database', label: 'Database', icon: Database }] : []),
                      { id: 'resources', label: 'Resources', icon: Library },
                      { id: 'submissions', label: 'History', icon: History },
                      ...(selectedSubmission ? [{ id: 'submission-details', label: 'Result', icon: CheckCircle }] : []),
                      { id: 'solutions', label: 'Solutions', icon: MessageCircle },
                      { id: 'ai', label: 'AI Coach', icon: Sparkles }, 
                    ] as { id: "description" | "resources" | "submissions" | "solutions" | "ai" | "database" | "submission-details"; label: string; icon: typeof Info }[]).map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        title={t.label}
                        className={`flex-tab-btn relative h-full transition-all flex items-center justify-center gap-1.5 px-3 shrink-0 hover:bg-[var(--foreground)]/5 ${
                            activeTab === t.id ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                    >
                        <t.icon size={15} className={activeTab === t.id ? "text-[var(--primary)] shrink-0" : "shrink-0"} />
                        <span className={`text-[10px] font-black uppercase tracking-wider tab-label-${t.id} truncate`}>
                            {t.label}
                        </span>
                        {t.id === 'submission-details' && (
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubmission(null);
                              setActiveTab('submissions');
                            }}
                            className="ml-1 hover:bg-[var(--foreground)]/10 p-0.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                          >
                            <X size={10} />
                          </span>
                        )}
                        {activeTab === t.id && (
                            <motion.div layoutId="left-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)] shadow-[0_0_12px_rgba(143,68,240,0.5)]" />
                        )}
                    </button>
                    ))}
                </div>

                {activeTab === 'ai' ? (
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <GeminiChat problemId={problem.id} problemTitle={problem.title} problemDescription={problem.description} code={code} language={language} testCases={examples} />
                    </div>
                ) : (
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
                            companies={problem.companies}
                            companyTags={problem.companyTags}
                          />
                        )}
                        {activeTab === 'database' && (
                          <DatabaseSchemaViewer 
                            problemId={problem.id}
                            initialSchema={problem.initialSchema}
                            initialData={problem.initialData}
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
                        {activeTab === 'submission-details' && (
                          <SubmissionDetailsModal 
                            submission={selectedSubmission}
                            onClose={() => {
                              setSelectedSubmission(null);
                              setActiveTab('submissions');
                            }}
                          />
                        )}
                        {activeTab === 'solutions' && <DiscussionSection problemId={problem.id} />}
                        </div>
                    </div>
                )}
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
                            onMount={onEditorMount}
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

        {/* MOBILE WORKSPACE */}
        <div className="md:hidden flex flex-col h-full bg-[var(--card)] overflow-hidden relative">
            {mobileMainTab === 'others' ? (
                <>
                    <div className="flex items-center px-4 border-b border-[var(--border)] h-[44px] shrink-0 gap-6 bg-[var(--card)] overflow-x-auto no-scrollbar">
                        {([
                            { id: 'description', label: 'Description', icon: Info },
                            ...(problem.type === "SQL" ? [{ id: 'database', label: 'Database', icon: Database }] : []),
                            { id: 'resources', label: 'Resources', icon: Library },
                            { id: 'submissions', label: 'History', icon: History },
                            ...(selectedSubmission ? [{ id: 'submission-details', label: 'Result', icon: CheckCircle }] : []),
                            { id: 'solutions', label: 'Solutions', icon: MessageCircle },
                            { id: 'ai', label: 'Coach', icon: Sparkles }, 
                        ] as { id: "description" | "resources" | "submissions" | "solutions" | "ai" | "database" | "submission-details"; label: string; icon: typeof Info }[]).map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`relative h-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 px-1 shrink-0 ${
                                    activeTab === t.id ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                }`}
                            >
                                <t.icon size={13} className={activeTab === t.id ? "text-[var(--primary)]" : ""} />
                                {t.label}
                                {t.id === 'submission-details' && (
                                  <span 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSubmission(null);
                                      setActiveTab('submissions');
                                    }}
                                    className="ml-1 hover:bg-[var(--foreground)]/10 p-0.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                  >
                                    <X size={10} />
                                  </span>
                                )}
                                {activeTab === t.id && (
                                    <motion.div layoutId="mobile-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)]" />
                                )}
                            </button>
                        ))}
                    </div>
                    
                    {activeTab === 'ai' ? (
                        <div className="flex-1 min-h-0 overflow-hidden">
                            <GeminiChat problemId={problem.id} problemTitle={problem.title} problemDescription={problem.description} code={code} language={language} testCases={examples} />
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'description' && (
                              <ProblemDescription 
                                description={problem.description} 
                                examples={examples} 
                                difficulty={problem.difficulty}
                                category={problem.category}
                                timeLimit={problem.timeLimit}
                                memoryLimit={problem.memoryLimit}
                                companyTags={problem.companyTags}
                              />
                            )}
                            {activeTab === 'database' && (
                              <DatabaseSchemaViewer 
                                problemId={problem.id}
                                initialSchema={problem.initialSchema}
                                initialData={problem.initialData}
                              />
                            )}
                            {activeTab === 'resources' && <div className="p-6"><ProblemResources resources={problem.resources || []} /></div>}
                            {activeTab === 'submissions' && (
                                <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)]">
                                    {submissions.map((sub, i) => (
                                        <div 
                                        key={i} 
                                        onClick={() => setSelectedSubmission(sub)}
                                        className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] bg-[var(--foreground)]/[0.02] hover:bg-[var(--foreground)]/[0.05] transition-all cursor-pointer group"
                                        >
                                        <div className="flex items-center gap-3">
                                            <div className={sub.status === 'Accepted' ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                                                {sub.status === 'Accepted' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                            </div>
                                            <div>
                                                <div className="text-[13px] font-bold tracking-tight">{sub.status}</div>
                                                <div className="text-[9px] text-[var(--muted-foreground)] uppercase font-black tracking-widest mt-0.5">{new Date(sub.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="text-right font-mono text-[11px] font-bold text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">{sub.runtime}ms</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {activeTab === 'submission-details' && (
                              <div className="p-4 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar @container">
                                <SubmissionDetailsModal 
                                  submission={selectedSubmission}
                                  onClose={() => {
                                    setSelectedSubmission(null);
                                    setActiveTab('submissions');
                                  }}
                                />
                              </div>
                            )}
                            {activeTab === 'solutions' && <div className="p-6"><DiscussionSection problemId={problem.id} /></div>}
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* CODE WORKSPACE FOR MOBILE */}
                    <div className="flex items-center justify-between px-4 border-b border-[var(--border)] h-[44px] shrink-0 bg-[var(--card)]">
                        <div className="flex items-center gap-2">
                            <Code2 size={14} className="text-[var(--primary)]" />
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Code Editor</div>
                        </div>
                        
                        {/* Quick access settings: Language selector & Reset */}
                        <div className="flex items-center gap-2">
                            <EditorPanel
                                isToolbarOnly
                                language={language}
                                setLanguage={setLanguage}
                                onRun={(markersCb) => handleRun(markersCb)}
                                onSubmit={handleSubmit}
                                isRunning={isRunning}
                                isSubmitting={isSubmitting}
                                onReset={resetCode}
                            />
                        </div>
                    </div>
                    
                    {/* Editor area */}
                    <div className="flex-1 min-h-0 relative bg-[var(--card)]">
                        <EditorPanel
                            isEditorOnly
                            code={code}
                            setCode={setCode}
                            language={language}
                            setLanguage={setLanguage}
                            onMount={onEditorMount}
                        />
                        
                        {/* Sliding Console drawer */}
                        <AnimatePresence>
                          {isConsoleOpen && (
                            <motion.div
                              initial={{ y: "100%" }}
                              animate={{ y: 0 }}
                              exit={{ y: "100%" }}
                              transition={{ type: "spring", damping: 30, stiffness: 250 }}
                              className="absolute inset-x-0 bottom-0 top-0 bg-[var(--card)] z-[100] border-t border-[var(--border)] flex flex-col"
                            >
                              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--background)] shrink-0">
                                <div className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">Console Panel</div>
                                <button
                                  onClick={() => setIsConsoleOpen(false)}
                                  className="p-1 hover:bg-[var(--foreground)]/5 rounded-lg transition-all"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                              <div className="flex-1 min-h-0">
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
                            </motion.div>
                          )}
                        </AnimatePresence>
                    </div>
                    
                    {/* Mobile Run/Submit/Console panel bar */}
                    <div className="h-[48px] border-t border-[var(--border)] bg-[var(--card)] flex items-center justify-between px-4 shrink-0 z-10">
                        <button
                          onClick={() => {
                            setIsConsoleOpen(!isConsoleOpen);
                            if (!isConsoleOpen && results) {
                              setConsoleTab('result');
                            }
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--foreground)]/5 transition-all"
                        >
                          <Terminal size={14} className="text-[var(--primary)]" />
                          Console {isConsoleOpen ? "▼" : "▲"}
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRun((msg) => {})}
                            disabled={isRunning}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest text-[#a1a1aa] hover:text-[var(--foreground)] hover:bg-white/5 border border-[var(--border)] transition-all disabled:opacity-30"
                          >
                            {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} className="text-[#3b82f6]" />}
                            Run
                          </button>
                          <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest bg-white text-black hover:bg-[#3b82f6] hover:text-[var(--foreground)] transition-all disabled:opacity-30 active:scale-95"
                          >
                            {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                            Submit
                          </button>
                        </div>
                    </div>
                </>
            )}
            
            {/* PERSISTENT BOTTOM TAB BAR */}
            <div className="h-[56px] border-t border-[var(--border)] bg-[var(--card)] flex items-center justify-around px-4 shrink-0 z-50">
              <button
                onClick={() => setMobileMainTab('others')}
                className={`flex flex-col items-center justify-center gap-1 w-1/2 h-full transition-all relative ${
                  mobileMainTab === 'others' ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <Info size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Problem & Info</span>
                {mobileMainTab === 'others' && (
                  <motion.div layoutId="mobile-main-tab-indicator" className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-[var(--primary)]" />
                )}
              </button>
              
              <div className="w-px h-6 bg-[var(--border)] opacity-30" />
              
              <button
                onClick={() => setMobileMainTab('code')}
                className={`flex flex-col items-center justify-center gap-1 w-1/2 h-full transition-all relative ${
                  mobileMainTab === 'code' ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <Code2 size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Code Editor</span>
                {mobileMainTab === 'code' && (
                  <motion.div layoutId="mobile-main-tab-indicator" className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-[var(--primary)]" />
                )}
              </button>
            </div>
        </div>
      </main>

      <style jsx global>{`
        .gutter { z-index: 50; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }

        .flex-tab-btn {
          transition: all 0.2s ease;
        }

        @container sidebar (max-width: 480px) {
          .flex-tab-btn {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
            gap: 0.25rem !important;
          }
        }

        @container sidebar (max-width: 640px) {
          .tab-label-ai { display: none; }
          .tab-label-submission-details { display: none; }
        }
        @container sidebar (max-width: 560px) {
          .tab-label-solutions { display: none; }
        }
        @container sidebar (max-width: 485px) {
          .tab-label-submissions { display: none; }
        }
        @container sidebar (max-width: 410px) {
          .tab-label-resources { display: none; }
        }
        @container sidebar (max-width: 330px) {
          .tab-label-description { display: none; }
        }
      `}</style>
    </div>
  );
}
