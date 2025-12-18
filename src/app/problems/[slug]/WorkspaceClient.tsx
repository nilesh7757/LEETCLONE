"use client";

import { useState, useEffect, useRef } from "react";
import Split from "react-split";
import { Editor } from "@monaco-editor/react";
import { Settings, RotateCcw, Play, Send, ChevronUp, ChevronDown, CheckCircle, XCircle, AlertTriangle, AlertCircle, ChevronLeft, FileText, History, X, MessageSquare, Flag, Code2, PlusCircle, Bookmark, Trash2, Terminal } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DiscussionSection from "@/components/Discussion/DiscussionSection";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { languages, getStarterCode } from "@/lib/starterCode";
import TiptapEditor from "@/components/TiptapEditor";
import Whiteboard from "@/components/Whiteboard";

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  description: string;
  timeLimit: number;
  memoryLimit: number;
  initialSchema?: string;
  initialData?: string;
  // Added fields from Prisma schema
  type: "CODING" | "SHELL" | "INTERACTIVE" | "SYSTEM_DESIGN" | "SQL";
}

interface WorkspaceClientProps {
  problem: Problem;
  examples: any[];
}

export default function WorkspaceClient({ problem, examples }: WorkspaceClientProps) {
  const initialCode = problem.type === "SQL" 
      ? "SELECT * FROM Users;" 
      : getStarterCode("javascript"); 
  const initialLanguage = problem.type === "SQL" ? "sql" : "javascript";

  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [activeTestCaseId, setActiveTestCaseId] = useState(0);
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  const [editorAndConsoleSizes, setEditorAndConsoleSizes] = useState<number[]>([70, 30]);
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'submissions' | 'discussion'>('description');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  
  // Snippets State
  const [showSnippets, setShowSnippets] = useState(false);
  const [snippets, setSnippets] = useState<any[]>([]);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [isSavingSnippet, setIsSavingSnippet] = useState(false);
  
  // Test Cases State
  const [localTestCases, setLocalTestCases] = useState<any[]>(examples);
  const [consoleTab, setConsoleTab] = useState<'testcases' | 'results'>('testcases');

  // Language Dropdown State
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Reporting State
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showReportDialog, setShowReportDialog] = useState(false);

  const { resolvedTheme } = useTheme();
  const { update } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Click outside handler for language dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme('cream', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: '', foreground: '3E3028', background: 'EAE0D5' },
      ],
      colors: {
        'editor.background': '#EAE0D5',
        'editor.foreground': '#3E3028',
        'editor.lineHighlightBackground': '#D6C8BC',
        'editorCursor.foreground': '#3E3028',
        'editorIndentGuide.background': '#D6C8BC',
        'editorLineNumber.foreground': '#8A6A4B',
      }
    });
  };

  const handleReport = async () => {
    if (!selectedSubmission) return;
    setIsReporting(true);
    try {
      await axios.post("/api/reports/create", {
        submissionId: selectedSubmission.id,
        reason: reportReason || "Suspected AI generation"
      });
      toast.success("Report submitted successfully.");
      setShowReportDialog(false);
      setReportReason("");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit report.");
    } finally {
      setIsReporting(false);
    }
  };

  const editorConsoleSplitRef = useRef<any>(null);
  const searchParams = useSearchParams();
  const contestId = searchParams.get("contestId");

  useEffect(() => {
    if (problem.type === "CODING") {
      const savedLanguage = localStorage.getItem("preferredLanguage");
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    }
  }, [problem.type]);

  // Autosave & Load Draft
  useEffect(() => {
    // When language changes, try to load draft
    const draftKey = `draft_${problem.id}_${language}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      setCode(savedDraft);
    } else {
      if (problem.type === "CODING") {
        setCode(getStarterCode(language));
      } else if (problem.type === "SQL") {
        setCode("SELECT * FROM Users;"); // Reset to default if no draft
      }
    }
  }, [language, problem.id, problem.type]); // Add problem.type to dependencies

  useEffect(() => {
    // Save draft on code change
    const draftKey = `draft_${problem.id}_${language}`;
    // Debounce saving slightly if needed, but for local storage direct write is usually fine for text
    const defaultCode = problem.type === "SQL" ? "SELECT * FROM Users;" : getStarterCode(language);
    if (code !== defaultCode) {
        localStorage.setItem(draftKey, code);
    }
  }, [code, language, problem.id, problem.type]);

  useEffect(() => {
    if (activeLeftTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeLeftTab]);

  const fetchSnippets = async () => {
    try {
      const { data } = await axios.get(`/api/snippets?language=${language}`);
      setSnippets(data.snippets);
    } catch (error) {
      console.error("Failed to fetch snippets", error);
    }
  };

  useEffect(() => {
    if (showSnippets) {
      fetchSnippets();
    }
  }, [showSnippets, language]);

  const handleSaveSnippet = async () => {
    if (!snippetTitle.trim()) {
      toast.error("Please enter a title for your snippet.");
      return;
    }
    setIsSavingSnippet(true);
    try {
      await axios.post("/api/snippets", {
        title: snippetTitle,
        code,
        language
      });
      toast.success("Snippet saved!");
      setSnippetTitle("");
      fetchSnippets();
    } catch (error) {
      toast.error("Failed to save snippet.");
    } finally {
      setIsSavingSnippet(false);
    }
  };

  const handleDeleteSnippet = async (id: string) => {
    try {
      await axios.delete(`/api/snippets/${id}`);
      toast.success("Snippet deleted.");
      fetchSnippets();
    } catch (error) {
      toast.error("Failed to delete snippet.");
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data } = await axios.get(`/api/submission?problemId=${problem.id}&t=${Date.now()}`);
      setSubmissions(data.submissions);
    } catch (error) {
      console.error("Failed to fetch submissions", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (language === "javascript") {
        try {
          new Function(code);
          setSyntaxError(null);
        } catch (e: any) {
          if (e.name === "SyntaxError") {
            setSyntaxError(e.message);
          } else {
             setSyntaxError(null);
          }
        }
      } else {
        setSyntaxError(null);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [code, language]);

  const handleRun = async () => {
    setIsRunning(true);
    setResults(null);
    setSyntaxError(null);
    setConsoleTab('results');
    toast.info("Running code...");

    try {
      let requestBody: any = {
        problemId: problem.id, // Always send problemId
        code,
        type: problem.type, // Send problem type
      };

      if (problem.type === "CODING") {
        requestBody = {
          ...requestBody,
          language,
          testCases: localTestCases.map(e => ({ 
            input: e.input, 
            expectedOutput: (e.expectedOutput === null || e.expectedOutput === undefined) ? "" : String(e.expectedOutput) 
          })), // Safely handle undefined/null output
          timeLimit: problem.timeLimit,
          memoryLimit: problem.memoryLimit,
        };
      } else if (problem.type === "SQL") {
         requestBody = {
            ...requestBody,
            initialSchema: problem.initialSchema,
            initialData: problem.initialData,
            testCases: localTestCases.length > 0 ? localTestCases : [],
         }
      }
      // Add other problem types here

      const { data } = await axios.post("/api/run", requestBody);

      setResults(data.results);
      
      const firstFailedIndex = data.results.findIndex((r: any) => r.status !== "Accepted");
      
      if (firstFailedIndex !== -1) {
        setActiveTestCaseId(firstFailedIndex);
        toast.error(`Test Case ${firstFailedIndex + 1} Failed`);
      } else {
        toast.success("All Test Cases Passed!");
        setActiveTestCaseId(0);
      }
      if (editorAndConsoleSizes[1] < 10) {
          setEditorAndConsoleSizes([60, 40]);
      }

    } catch (error: any) {
      console.error(error);
      toast.error("Execution failed: " + (error.response?.data?.error || error.message));
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    toast.info("Submitting solution...");

    try {
      let requestBody: any = {
        problemId: problem.id,
        code,
        type: problem.type, // Send problem type
      };

      if (problem.type === "CODING") {
        requestBody = {
          ...requestBody,
          language,
          // For submission, test cases are not sent from client. Server uses problem.testSets
        };
      } else if (problem.type === "SQL") {
          requestBody = {
            ...requestBody,
            // SQL might need schemas on server side too if checking against hidden cases
          }
      }
      // Add other problem types here

      const { data } = await axios.post("/api/submission", requestBody);

      if (data.submission.status === "Accepted") {
        toast.success("Accepted! 🎉");
        if (data.newStreak) {
           update({ streak: data.newStreak });
        }
      } else {
        const failed = data.failedTestCase;
        if (failed) {
           toast.error(`Wrong Answer on Input: ${failed.input}`);
           // Also log to console for debugging
           console.log("Failed Test Case:", failed);
           // Show more details in toast description if supported or just relying on console/toast title
           toast.error(`Expected: ${failed.expected} | Output: ${failed.output}`);
        } else {
           toast.error("Wrong Answer 😔");
        }
      }
      
      setActiveLeftTab('submissions');
      fetchSubmissions();

    } catch (error: any) {
      console.error(error);
      toast.error("Submission failed: " + (error.response?.data?.error || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleConsoleHeight = () => {
    if (editorAndConsoleSizes[1] < 5) {
      setEditorAndConsoleSizes([70, 30]);
    } else {
      setEditorAndConsoleSizes([100, 0]);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="h-14 border-b border-[var(--card-border)] flex items-center justify-between px-4 bg-[var(--card-bg)] shrink-0">
        <div className="flex items-center gap-2">
          <Link 
            href={contestId ? `/contest/${contestId}` : "/problems"} 
            className="p-1.5 hover:bg-[var(--foreground)]/5 rounded-md transition-colors text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
            title={contestId ? "Back to Contest" : "Back to Problems"}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold text-[var(--foreground)]">{problem.title}</span>
        </div>
        <div className="flex items-center gap-3">
          {problem.type !== "SYSTEM_DESIGN" && (
            <button 
              onClick={handleRun}
              disabled={isRunning}
              className="px-4 py-1.5 text-sm font-medium text-[var(--foreground)]/80 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-4 h-4 text-[var(--foreground)]/60" /> {isRunning ? "Running..." : "Run"}
            </button>
          )}
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || isRunning}
            className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-green-900/20 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? <span className="animate-spin">⌛</span> : <Send className="w-4 h-4" />} Submit
          </button>
        </div>
      </div>

      <Split
        className="flex-1 flex overflow-hidden"
        sizes={[50, 50]}
        minSize={400}
        gutterSize={8}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
      >
        {/* Left Panel: Description & Submissions */}
        <div className="h-full flex flex-col bg-[var(--background)]">
          {/* Tabs */}
          <div className="h-10 border-b border-[var(--card-border)] flex items-center gap-1 px-2 bg-[var(--card-bg)] shrink-0">
            <button
              onClick={() => setActiveLeftTab('description')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-colors cursor-pointer ${activeLeftTab === 'description' ? "bg-[var(--foreground)]/10 text-[var(--foreground)]" : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}
            >
              <FileText className="w-3.5 h-3.5" /> Description
            </button>
            <button
              onClick={() => setActiveLeftTab('submissions')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-colors cursor-pointer ${activeLeftTab === 'submissions' ? "bg-[var(--foreground)]/10 text-[var(--foreground)]" : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}
            >
              <History className="w-3.5 h-3.5" /> Submissions
            </button>
            <button
              onClick={() => setActiveLeftTab('discussion')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-colors cursor-pointer ${activeLeftTab === 'discussion' ? "bg-[var(--foreground)]/10 text-[var(--foreground)]" : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Discussion
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeLeftTab === 'description' ? (
              <div className="prose prose-invert max-w-none">
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">{problem.title}</h1>
                <div className="inline-flex items-center gap-2 mb-6">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    problem.difficulty === "Easy"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : problem.difficulty === "Medium"
                      ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      : "bg-red-500/10 text-red-500 border-red-500/20"
                  }`}>
                    {problem.difficulty}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--foreground)]/5 text-[var(--foreground)]/60 border border-[var(--card-border)]">
                    {problem.category}
                  </span>
                </div>

                <div 
                  className="prose max-w-none text-[var(--foreground)] mb-8 font-sans 
                    [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-[var(--foreground)] [&_h1]:mb-6 [&_h1]:block
                    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--foreground)] [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:block
                    [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[var(--foreground)] [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:block
                    [&_p]:text-[var(--foreground)]/80 [&_p]:leading-relaxed [&_p]:mb-4
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:text-[var(--foreground)]/80
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:text-[var(--foreground)]/80
                    [&_li]:mb-1 [&_strong]:text-[var(--foreground)] [&_strong]:font-bold"
                  dangerouslySetInnerHTML={{ __html: problem.description }}
                />

                {examples.map((example: any, index: number) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">Example {index + 1}:</h3>
                    <div className="bg-[var(--card-bg)] p-4 rounded-lg border border-[var(--card-border)] font-mono text-sm">
                      <p className="text-[var(--foreground)]/80 mb-2 whitespace-pre-wrap">
                        <strong className="text-[var(--foreground)]">Input:</strong><br />{example.input}
                      </p>
                      <p className="text-[var(--foreground)]/80 whitespace-pre-wrap">
                        <strong className="text-[var(--foreground)]">Output:</strong><br />{example.expectedOutput}
                      </p>
                      {example.explanation && (
                        <p className="text-[var(--foreground)]/80 mt-2">
                          <strong className="text-[var(--foreground)]">Explanation:</strong> {example.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : activeLeftTab === 'submissions' ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">My Submissions</h2>
                {submissions.length === 0 ? (
                  <div className="text-[var(--foreground)]/40 text-center py-10 text-sm">
                    No submissions yet.
                  </div>
                ) : (
                  submissions.map((sub: any) => (
                    <div 
                      key={sub.id} 
                      onClick={() => setSelectedSubmission(sub)}
                      className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] flex items-center justify-between hover:border-[var(--foreground)]/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {sub.status === "Accepted" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <p className={`font-medium ${sub.status === "Accepted" ? "text-green-500" : "text-red-500"}`}>
                            {sub.status}
                          </p>
                          <p className="text-xs text-[var(--foreground)]/60">
                            {new Date(sub.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono bg-[var(--foreground)]/10 px-2 py-1 rounded text-[var(--foreground)]/80">
                          {problem.type === "SYSTEM_DESIGN" && sub.score !== null ? `Score: ${sub.score}%` : sub.language}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
               <div className="p-4">
                  <DiscussionSection problemId={problem.id} />
               </div>
            )}
          </div>
        </div>

        {/* Right Panel: Code Editor & Console */}
        {problem.type === "SYSTEM_DESIGN" ? (
          <div className="flex flex-col h-full bg-[var(--background)] border-l border-[var(--card-border)] overflow-hidden">
             <div className="h-10 border-b border-[var(--card-border)] flex items-center justify-between px-4 bg-[var(--card-bg)] shrink-0">
                <div className="text-sm font-medium text-[var(--foreground)]">Design Document</div>
                <div className="flex items-center gap-3">
                   <button
                      className="p-1.5 hover:bg-[var(--foreground)]/10 rounded-md transition-colors text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
                      title="Reset"
                      onClick={() => setCode("")}
                   >
                      <RotateCcw className="w-4 h-4" />
                   </button>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                <TiptapEditor 
                   description={code}
                   onChange={(html) => setCode(html)}
                />
             </div>
          </div>
        ) : (
        <Split
          ref={editorConsoleSplitRef}
          direction="vertical"
          sizes={editorAndConsoleSizes}
          minSize={0}
          gutterSize={8}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          className="flex flex-col bg-[var(--background)] h-full"
          onDragEnd={(newSizes) => setEditorAndConsoleSizes(newSizes)}
        >
          {problem.type === "CODING" || problem.type === "SQL" ? (
            <div className="flex flex-col h-full min-h-0">
              <div className="h-10 border-b border-[var(--card-border)] flex items-center justify-between px-4 bg-[var(--background)] shrink-0 z-20">
                {problem.type === "CODING" && (
                  <div className="relative" ref={langDropdownRef}>
                    <button
                      onClick={() => setIsLangOpen(!isLangOpen)}
                      className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)] hover:text-[var(--foreground)]/80 transition-colors px-2 py-1.5 rounded-md hover:bg-[var(--foreground)]/5 cursor-pointer"
                    >
                      <Code2 className="w-4 h-4 text-green-500" />
                      {languages.find(l => l.value === language)?.label}
                      <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isLangOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.1 }}
                          className="absolute top-full left-0 mt-1 w-48 bg-[var(--background)] border border-[var(--card-border)] rounded-lg shadow-xl overflow-hidden py-1 z-50"
                        >
                          {languages.map((lang) => (
                            <button
                              key={lang.value}
                              onClick={() => {
                                setLanguage(lang.value);
                                localStorage.setItem("preferredLanguage", lang.value);
                                setIsLangOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer ${
                                language === lang.value ? "text-green-500 bg-[var(--foreground)]/5" : "text-[var(--foreground)]"
                              }`}
                            >
                              {lang.label}
                              {language === lang.value && <CheckCircle className="w-3 h-3" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                {problem.type === "SQL" && (
                   <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)] px-2 py-1.5">
                      <Code2 className="w-4 h-4 text-blue-500" /> SQL Query
                   </div>
                )}
                
                <div className="flex items-center gap-3">
                  {syntaxError && (
                    <div className="flex items-center gap-1.5 text-red-400 text-xs px-2 py-1 bg-red-500/10 rounded animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      <span className="truncate max-w-[150px]">{syntaxError}</span>
                    </div>
                  )}
                  <button
                    className="p-1.5 hover:bg-[var(--foreground)]/10 rounded-md transition-colors text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
                    title="Reset Code"
                    onClick={() => setCode(problem.type === "SQL" ? "SELECT * FROM Users;" : getStarterCode(language) || "")}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${showSnippets ? "bg-blue-500/20 text-blue-500" : "text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10"}`}
                    title="My Snippets"
                    onClick={() => setShowSnippets(!showSnippets)}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-[var(--foreground)]/10 rounded-md transition-colors text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 relative min-h-0">
                <AnimatePresence>
                  {showSnippets && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="absolute top-0 right-0 w-72 h-full bg-[var(--card-bg)] border-l border-[var(--card-border)] z-30 flex flex-col shadow-xl backdrop-blur-md"
                    >
                      <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
                        <h3 className="font-bold text-sm text-[var(--foreground)] flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-blue-500" /> My Snippets
                        </h3>
                        <button onClick={() => setShowSnippets(false)} className="text-[var(--foreground)]/40 hover:text-[var(--foreground)]">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                        {/* Save Current Code */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/50">Save current code</label>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={snippetTitle}
                              onChange={(e) => setSnippetTitle(e.target.value)}
                              placeholder="Snippet title..."
                              className="flex-1 min-w-0 px-2 py-1.5 bg-[var(--background)] border border-[var(--card-border)] rounded text-xs text-[var(--foreground)] outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button 
                              onClick={handleSaveSnippet}
                              disabled={isSavingSnippet || !code.trim()}
                              className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="h-px bg-[var(--card-border)]" />

                        {/* List Snippets */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/50">{language} snippets</label>
                          {snippets.length === 0 ? (
                            <p className="text-[10px] text-[var(--foreground)]/40 text-center py-4 italic">No {language} snippets saved.</p>
                          ) : (
                            snippets.map(snippet => (
                              <div key={snippet.id} className="group p-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg hover:border-blue-500/30 transition-all">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-bold text-[var(--foreground)] truncate pr-2">{snippet.title}</span>
                                  <button 
                                    onClick={() => handleDeleteSnippet(snippet.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded transition-all"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <button 
                                  onClick={() => {
                                    setCode(prev => prev + "\n" + snippet.code);
                                    setShowSnippets(false);
                                    toast.success("Snippet inserted!");
                                  }}
                                  className="w-full py-1.5 bg-[var(--foreground)]/5 hover:bg-blue-500/10 text-[var(--foreground)] hover:text-blue-500 text-[10px] font-bold rounded border border-[var(--card-border)] transition-all"
                                >
                                  Insert to Editor
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Editor
                  height="100%"
                  language={language}
                  theme={mounted && resolvedTheme === "dark" ? "vs-dark" : mounted && resolvedTheme === "cream" ? "cream" : "light"}
                  beforeMount={handleEditorWillMount}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    renderValidationDecorations: "on",
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full min-h-0 justify-center items-center text-[var(--foreground)]/60 text-lg">
              <p>Editor not available for this problem type.</p>
              <p>Please select a different problem type.</p>
            </div>
          )}

          {/* Console Panel Section */}
          <div className="flex flex-col h-full bg-[var(--background)] min-h-0 border-t border-[var(--card-border)]">
            <div className="flex items-center justify-between px-4 h-10 bg-[var(--card-bg)] border-b border-[var(--card-border)] shrink-0 cursor-pointer" onClick={toggleConsoleHeight}>
              <div className="flex gap-4 items-center h-full">
                <button 
                  onClick={(e) => { e.stopPropagation(); setConsoleTab('testcases'); }}
                  className={`text-sm font-medium h-full flex items-center border-b-2 transition-colors ${consoleTab === 'testcases' ? 'border-[var(--foreground)] text-[var(--foreground)]' : 'border-transparent text-[var(--foreground)]/60 hover:text-[var(--foreground)]'}`}
                >
                  Test Cases
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setConsoleTab('results'); }}
                  className={`text-sm font-medium h-full flex items-center border-b-2 transition-colors ${consoleTab === 'results' ? 'border-[var(--foreground)] text-[var(--foreground)]' : 'border-transparent text-[var(--foreground)]/60 hover:text-[var(--foreground)]'}`}
                >
                  Test Results
                </button>
                {results && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    results.every((r: any) => r.status === "Accepted") 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-red-500/20 text-red-400"
                  }`}>
                    {results.filter((r: any) => r.status === "Accepted").length}/{results.length} Passed
                  </span>
                )}
              </div>
              <button 
                className="text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
                title={editorAndConsoleSizes[1] < 5 ? "Show Console" : "Hide Console"}
              >
                {editorAndConsoleSizes[1] < 5 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex">
              {consoleTab === 'testcases' ? (
                 <div className="flex-1 flex overflow-hidden">
                    {/* Test Case Selector */}
                    <div className="w-40 border-r border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col overflow-y-auto custom-scrollbar">
                        {localTestCases.map((_, idx) => (
                           <button
                              key={idx}
                              onClick={() => setActiveTestCaseId(idx)}
                              className={`px-4 py-3 text-sm text-left flex items-center justify-between gap-2 hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer ${activeTestCaseId === idx ? "bg-[var(--foreground)]/10 text-[var(--foreground)]" : "text-[var(--foreground)]/60"}`}
                           >
                              <span className="truncate">Case {idx + 1}</span>
                              <X 
                                className="w-3 h-3 hover:text-red-500" 
                                onClick={(e) => {
                                   e.stopPropagation();
                                   const newCases = localTestCases.filter((__, i) => i !== idx);
                                   setLocalTestCases(newCases);
                                   if (activeTestCaseId >= newCases.length) setActiveTestCaseId(Math.max(0, newCases.length - 1));
                                }} 
                              />
                           </button>
                        ))}
                        <button
                           onClick={() => {
                              setLocalTestCases([...localTestCases, { input: "", expectedOutput: "" }]);
                              setActiveTestCaseId(localTestCases.length);
                           }}
                           className="px-4 py-3 text-sm text-center text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer border-t border-[var(--card-border)]"
                        >
                           + Add Case
                        </button>
                    </div>
                    {/* Test Case Editor */}
                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                       {localTestCases.length > 0 && localTestCases[activeTestCaseId] ? (
                          <div className="space-y-4 font-mono text-sm">
                             <div>
                                <div className="text-[var(--foreground)]/60 mb-2 text-xs uppercase tracking-wider">Input</div>
                                <textarea
                                   value={localTestCases[activeTestCaseId].input}
                                   onChange={(e) => {
                                      const newCases = [...localTestCases];
                                      newCases[activeTestCaseId] = { ...newCases[activeTestCaseId], input: e.target.value };
                                      setLocalTestCases(newCases);
                                   }}
                                   className="w-full p-3 bg-[var(--foreground)]/5 rounded-lg text-[var(--foreground)] outline-none focus:ring-1 focus:ring-[var(--foreground)]/20 resize-y min-h-[100px]"
                                   placeholder="Enter input..."
                                />
                             </div>
                             <div>
                                <div className="text-[var(--foreground)]/60 mb-2 text-xs uppercase tracking-wider">Expected Output</div>
                                <textarea
                                   value={localTestCases[activeTestCaseId].expectedOutput}
                                   onChange={(e) => {
                                      const newCases = [...localTestCases];
                                      newCases[activeTestCaseId] = { ...newCases[activeTestCaseId], expectedOutput: e.target.value };
                                      setLocalTestCases(newCases);
                                   }}
                                   className="w-full p-3 bg-[var(--foreground)]/5 rounded-lg text-[var(--foreground)] outline-none focus:ring-1 focus:ring-[var(--foreground)]/20 resize-y min-h-[100px]"
                                   placeholder="Enter expected output..."
                                />
                             </div>
                          </div>
                       ) : (
                          <div className="text-[var(--foreground)]/60 text-center mt-20">
                             No test cases selected
                          </div>
                       )}
                    </div>
                 </div>
              ) : (
                 <>
                    {/* Test Results View (Existing) */}
                    <div className="w-40 border-r border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col overflow-y-auto custom-scrollbar">
                      {results ? (
                        results.map((result: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => setActiveTestCaseId(idx)}
                            className={`px-4 py-3 text-sm text-left flex items-center gap-2 hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer ${activeTestCaseId === idx ? "bg-[var(--foreground)]/10 text-[var(--foreground)]" : "text-[var(--foreground)]/60"}`}
                          >
                            {result.status === "Accepted" ? (
                              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                            ) : result.status === "Runtime Error" ? (
                              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                            )}
                            <span className="truncate">Case {idx + 1}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-xs text-[var(--foreground)]/60 text-center">No results yet</div>
                      )}
                    </div>

                    {/* Result Details */}
                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                      {results && results[activeTestCaseId] ? (
                        <div className="space-y-4 font-mono text-sm">
                          {results[activeTestCaseId].status === "Accepted" ? (
                            <div className="text-green-500 font-semibold text-lg mb-4">Accepted</div>
                          ) : results[activeTestCaseId].status === "Runtime Error" ? (
                            <div className="text-red-500 font-semibold text-lg mb-4">Runtime Error</div>
                          ) : (
                            <div className="text-red-500 font-semibold text-lg mb-4">Wrong Answer</div>
                          )}

                          {results[activeTestCaseId].error ? (
                            <div className="p-4 bg-red-900/20 border border-red-500/20 text-red-400 rounded-lg whitespace-pre-wrap">
                              {results[activeTestCaseId].error}
                            </div>
                          ) : (
                            <>
                              <div>
                                <div className="text-[var(--foreground)]/60 mb-1 text-xs uppercase tracking-wider">Input</div>
                                <div className="p-3 bg-[var(--foreground)]/5 rounded-lg text-[var(--foreground)] whitespace-pre-wrap mt-1">
                                  {results[activeTestCaseId].input}
                                </div>
                              </div>
                              <div>
                                <div className="text-[var(--foreground)]/60 mb-1 text-xs uppercase tracking-wider">Output</div>
                                <div className={`p-3 rounded-lg ${results[activeTestCaseId].status === "Accepted" ? "bg-[var(--foreground)]/5 text-[var(--foreground)]" : "bg-red-900/20 text-red-300"} whitespace-pre-wrap mt-1`}>
                                  {results[activeTestCaseId].actual}
                                </div>
                              </div>
                              <div>
                                <div className="text-[var(--foreground)]/60 mb-1 text-xs uppercase tracking-wider">Expected</div>
                                <div className="p-3 bg-[var(--foreground)]/5 rounded-lg text-[var(--foreground)] whitespace-pre-wrap mt-1">
                                  {results[activeTestCaseId].expected}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="text-[var(--foreground)]/60 text-center mt-20">
                          Run your code to see results
                        </div>
                      )}
                    </div>
                 </>
              )}
            </div>
          </div>
        </Split>
        )}
      </Split>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
              <div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">Submission Details</h3>
                <p className="text-xs text-[var(--foreground)]/60">{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReportDialog(true)}
                  className="px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <Flag className="w-3.5 h-3.5" /> Report
                </button>
                <button 
                  onClick={() => setSelectedSubmission(null)} 
                  className="p-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {showReportDialog && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                 <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-lg w-full max-w-sm shadow-xl space-y-4">
                    <h4 className="font-bold text-lg text-[var(--foreground)]">Report Submission</h4>
                    <p className="text-sm text-[var(--foreground)]/70">Why are you reporting this submission?</p>
                    <textarea
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="e.g. Suspected AI generation..."
                        className="w-full p-3 rounded-md bg-[var(--background)] border border-[var(--card-border)] text-sm focus:border-red-500/50 outline-none resize-none h-24"
                    />
                    <div className="flex justify-end gap-2">
                       <button 
                          onClick={() => setShowReportDialog(false)}
                          className="px-4 py-2 text-sm text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/10 rounded-md"
                       >
                          Cancel
                       </button>
                       <button 
                          onClick={handleReport}
                          disabled={isReporting || !reportReason.trim()}
                          className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                       >
                          {isReporting ? "Submitting..." : "Submit Report"}
                       </button>
                    </div>
                 </div>
              </div>
            )}
            
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
              {/* Status & Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--card-border)] flex flex-col items-center justify-center text-center">
                   <div className="text-xs text-[var(--foreground)]/60 mb-1 uppercase tracking-wider">Status</div>
                   <div className={`font-bold text-lg ${selectedSubmission.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>{selectedSubmission.status}</div>
                </div>
                <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--card-border)] flex flex-col items-center justify-center text-center">
                   <div className="text-xs text-[var(--foreground)]/60 mb-1 uppercase tracking-wider">
                      {problem.type === "SYSTEM_DESIGN" ? "Score" : "Runtime"}
                   </div>
                   <div className={`font-bold text-lg ${problem.type === "SYSTEM_DESIGN" ? 'text-blue-500' : 'text-[var(--foreground)]'}`}>
                      {problem.type === "SYSTEM_DESIGN" 
                        ? (selectedSubmission.score !== null ? `${selectedSubmission.score}%` : 'N/A')
                        : (selectedSubmission.runtime !== null ? `${selectedSubmission.runtime} ms` : 'N/A')
                      }
                   </div>
                </div>
                <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--card-border)] flex flex-col items-center justify-center text-center">
                   <div className="text-xs text-[var(--foreground)]/60 mb-1 uppercase tracking-wider">Time Complexity</div>
                   <div className="font-bold text-lg text-[var(--foreground)]">{selectedSubmission.timeComplexity || 'N/A'}</div>
                </div>
                <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--card-border)] flex flex-col items-center justify-center text-center">
                   <div className="text-xs text-[var(--foreground)]/60 mb-1 uppercase tracking-wider">Space Complexity</div>
                   <div className="font-bold text-lg text-[var(--foreground)]">{selectedSubmission.spaceComplexity || 'N/A'}</div>
                </div>
                {selectedSubmission.testCaseResults && Array.isArray(selectedSubmission.testCaseResults) && (
                  <div className="col-span-2 md:col-span-4 p-4 bg-[var(--background)] rounded-lg border border-[var(--card-border)]">
                    <div className="text-xs text-[var(--foreground)]/60 mb-3 uppercase tracking-wider font-semibold">Test Case Details</div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {selectedSubmission.testCaseResults.map((result: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] text-sm">
                           <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-[var(--foreground)]/80">Case {idx + 1}</span>
                              <div className="flex items-center gap-2">
                                 {result.status !== "Accepted" && (
                                    <button
                                       onClick={() => {
                                          const newCases = [...localTestCases, { 
                                             input: result.input, 
                                             expectedOutput: result.expected 
                                          }];
                                          setLocalTestCases(newCases);
                                          setConsoleTab('testcases');
                                          setActiveTestCaseId(newCases.length - 1);
                                          setSelectedSubmission(null);
                                          toast.success("Test case added to console");
                                                                                     if (editorAndConsoleSizes[1] < 10) {
                                                                                       setEditorAndConsoleSizes([60, 40]);
                                                                                     }                                       }}
                                       className="text-xs flex items-center gap-1 text-[var(--foreground)]/60 hover:text-[var(--foreground)] bg-[var(--foreground)]/5 px-2 py-1 rounded hover:bg-[var(--foreground)]/10 transition-colors"
                                    >
                                       <PlusCircle className="w-3 h-3" /> Use Test Case
                                    </button>
                                 )}
                                 <span className={`px-2 py-0.5 rounded text-xs font-medium ${result.status === "Accepted" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                                    {result.status}
                                 </span>
                              </div>
                           </div>
                           {(result.status !== "Accepted" || problem.type === "SYSTEM_DESIGN") && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 font-mono text-xs">
                                 <div>
                                    <div className="text-[var(--foreground)]/40 mb-1">Input</div>
                                    <div className="p-2 bg-[var(--foreground)]/5 rounded text-[var(--foreground)]/80 break-words whitespace-pre-wrap">{result.input}</div>
                                 </div>
                                 <div className="md:col-span-2">
                                    <div className="text-[var(--foreground)]/40 mb-1">
                                       {problem.type === "SYSTEM_DESIGN" ? "AI Feedback" : "Output"}
                                    </div>
                                    <div className={`p-2 rounded break-words whitespace-pre-wrap ${result.status === "Accepted" ? "bg-green-500/5 text-green-600" : "bg-red-500/5 text-red-400"}`}>
                                       {result.actual}
                                    </div>
                                 </div>
                                 {problem.type !== "SYSTEM_DESIGN" && (
                                    <div>
                                       <div className="text-[var(--foreground)]/40 mb-1">Expected</div>
                                       <div className="p-2 bg-green-500/5 text-green-500 rounded break-all">{result.expected}</div>
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Code View */}
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-[var(--foreground)]">Source Code</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-[var(--foreground)]/10 px-2 py-1 rounded text-[var(--foreground)]/80">
                      {selectedSubmission.language}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedSubmission.code);
                        toast.success("Code copied to clipboard!");
                      }}
                      className="px-3 py-1 text-xs font-medium text-[var(--foreground)]/70 bg-[var(--background)] hover:bg-[var(--foreground)]/10 rounded-md transition-colors border border-[var(--card-border)]"
                      title="Copy Code"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden border border-[var(--card-border)] h-[400px]">
                   {problem.type === "SYSTEM_DESIGN" ? (
                      <div className="h-full overflow-y-auto bg-[var(--card-bg)] p-4 custom-scrollbar">
                         <TiptapEditor 
                            description={selectedSubmission.code}
                            onChange={() => {}}
                            editable={false}
                         />
                      </div>
                   ) : (
                      <Editor
                         height="100%"
                         language={selectedSubmission.language}
                         theme={mounted && resolvedTheme === "dark" ? "vs-dark" : mounted && resolvedTheme === "cream" ? "cream" : "light"}
                         value={selectedSubmission.code}
                         options={{ 
                           readOnly: true, 
                           minimap: { enabled: false }, 
                           fontSize: 13,
                           scrollBeyondLastLine: false,
                           padding: { top: 16, bottom: 16 }
                         }}
                      />
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
