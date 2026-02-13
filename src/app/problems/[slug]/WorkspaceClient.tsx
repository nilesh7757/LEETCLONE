"use client";

import { useState, useEffect, useRef } from "react";
import Split from "react-split";
import { Editor } from "@monaco-editor/react";
import { 
  Settings, RotateCcw, Play, Send, ChevronUp, ChevronDown, CheckCircle, 
  XCircle, AlertTriangle, AlertCircle, ChevronLeft, FileText, History, 
  X, MessageSquare, Code2, Plus, Terminal, Loader2, Sparkles, 
  Maximize2, Minimize2, Flame, Layout, Clock, Database, Braces, Check 
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import NotificationBell from "@/components/ui/NotificationBell";
import { toast } from "sonner";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DiscussionSection from "@/features/problems/components/Discussion/DiscussionSection";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { languages, getStarterCode } from "@/lib/starterCode";
import GeminiChat from "@/features/ai/components/GeminiChat";
import BlueprintModal from "@/features/problems/components/Blueprint/BlueprintModal";

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
  blueprint?: any[] | null;
}

interface WorkspaceClientProps {
  problem: Problem;
  examples: any[];
  showBlueprint?: boolean;
  alreadySolved?: boolean;
}

export default function WorkspaceClient({ problem, examples, showBlueprint = false, alreadySolved = false }: WorkspaceClientProps) {
  // --- Initialization ---
  const initialCode = problem.type === "SQL" ? "SELECT * FROM Users;" : getStarterCode("javascript"); 
  const initialLanguage = problem.type === "SQL" ? "sql" : "javascript";

  // --- State ---
  const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'solutions' | 'ai'>('description');
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [consoleTab, setConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [activeTestCaseId, setActiveTestCaseId] = useState(0);
  const [localTestCases, setLocalTestCases] = useState<any[]>(examples);
  const [results, setResults] = useState<any[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  
  // Layout State
  const [editorConsoleSizes, setEditorConsoleSizes] = useState<number[]>([60, 40]);

  // Collab & Socket
  const [collabRoomId, setCollabRoomId] = useState<string | null>(null);
  const collabSocketRef = useRef<Socket | null>(null);
  const isRemoteUpdate = useRef(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();
  const { update } = useSession();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const contestId = searchParams.get("contestId");

  // --- Effects ---
  useEffect(() => { setMounted(true); }, []);

  // Sync Code Ref
  const codeRef = useRef(code);
  useEffect(() => { codeRef.current = code; }, [code]);

  // Autosave & Load Draft
  useEffect(() => {
    const draftKey = `draft_${problem.id}_${language}`;
    const saved = localStorage.getItem(draftKey);
    
    // Clear Markers when language changes
    if (monacoRef.current && editorRef.current) {
       monacoRef.current.editor.setModelMarkers(editorRef.current.getModel(), "api-feedback", []);
    }

    if (saved) {
      setCode(saved);
    } else {
      // Set starter code if no draft exists
      if (problem.type === "CODING") {
         setCode(getStarterCode(language));
      } else if (problem.type === "SQL") {
         setCode("SELECT * FROM Users;");
      }
    }
  }, [language, problem.id, problem.type]);

  useEffect(() => {
    const draftKey = `draft_${problem.id}_${language}`;
    const defaultCode = problem.type === "SQL" ? "SELECT * FROM Users;" : getStarterCode(language);
    if (code !== defaultCode) localStorage.setItem(draftKey, code);
  }, [code, language, problem.id]);

  // Click outside listener for Language Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---

  // --- Helper: Parse Error Lines ---
  const parseAndSetMarkers = (errorMsg: string) => {
     if (!monacoRef.current || !editorRef.current) return;
     
     const model = editorRef.current.getModel();
     const markers: any[] = [];
     const lines = errorMsg.split('\n');
     
     // Smarter Regex: Captures Line and Column
     // GCC/Clang: "filename:line:col: error: message"
     // Python: "File \"...\", line 5"
     // Java: "Main.java:5: error: message"
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

           // GCC Semicolon Logic: Often reports error on the NEXT line
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
                 severity: monacoRef.current.MarkerSeverity.Error
              });
           }
        }
     });

     monacoRef.current.editor.setModelMarkers(model, "api-feedback", markers);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setConsoleOpen(true);
    setConsoleTab('result');
    setResults(null);
    setSyntaxError(null);
    
    // Clear previous markers
    if (monacoRef.current && editorRef.current) {
       monacoRef.current.editor.setModelMarkers(editorRef.current.getModel(), "api-feedback", []);
    }
    
    try {
      const sanitizedTestCases = localTestCases.map(tc => ({
        input: typeof tc.input === 'object' ? JSON.stringify(tc.input) : String(tc.input),
        expectedOutput: typeof tc.expectedOutput === 'object' ? JSON.stringify(tc.expectedOutput) : String(tc.expectedOutput || "")
      }));

      const { data } = await axios.post("/api/run", {
        problemId: problem.id,
        code,
        type: problem.type,
        language,
        testCases: sanitizedTestCases
      });
      
      setResults(data.results);
      
      // Check for errors to highlight
      const errorResult = data.results.find((r: any) => r.status === "Compilation Error" || r.status === "Runtime Error" || r.error);
      if (errorResult && errorResult.error) {
         parseAndSetMarkers(errorResult.error);
      }

      if (data.results.some((r: any) => r.status !== "Accepted")) {
        toast.error("Execution failed.");
      } else {
        toast.success("Finished");
      }
    } catch (e: any) {
      toast.error("Execution Error: " + (e.response?.data?.error || e.message));
    } finally {
      setIsRunning(false);
    }
  };

  // --- Real-time Syntax Linter (Debounced) ---
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!monacoRef.current || !editorRef.current || !code.trim()) return;

      // JavaScript built-in validation is handled by Monaco automatically,
      // so we only need to handle other languages here.
      if (language === "javascript") {
          // We can still do a quick check to update our own state if needed,
          // but Monaco handles the underlines.
          return;
      } 
      
      // Background check for Compiled/Interpreted Languages (only if code length is reasonable)
      if (["cpp", "python", "java", "csharp", "go", "rust"].includes(language) && code.length < 5000) {
         try {
            const { data } = await axios.post("/api/run", {
               problemId: problem.id, code, type: problem.type, language,
               testCases: examples.slice(0, 1) 
            });
            const compError = data.results.find((r: any) => r.status === "Compilation Error" || r.status === "Runtime Error");
            if (compError && compError.error) {
                parseAndSetMarkers(compError.error);
            } else {
                monacoRef.current.editor.setModelMarkers(editorRef.current.getModel(), "api-feedback", []);
            }
         } catch (e) { /* ignore silent background failures */ }
      }
    }, 1200); // 1.2s debounce

    return () => clearTimeout(timer);
  }, [code, language]);

  // ... (rest of the file)
  
    const handleSubmit = async () => {
      setIsSubmitting(true);
      try {
        const { data } = await axios.post("/api/submission", {
          problemId: problem.id,
          code,
          type: problem.type,
          language
        });
        
        if (data.submission.status === "Accepted") {
          toast.success("Accepted! 🎉");
          if (data.newStreak) update({ streak: data.newStreak });
          setActiveTab('submissions');
          fetchSubmissions();
        } else {
          toast.error("Wrong Answer");
          setConsoleOpen(true);
          setConsoleTab('result');
          if (data.failedTestCase) {
             setResults([{
                status: "Wrong Answer",
                input: data.failedTestCase.input,
                actual: data.failedTestCase.output,
                expected: data.failedTestCase.expected
             }]);
          }
        }
      } catch (e) {
        toast.error("Submission failed");
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const fetchSubmissions = async () => {
      try {
        const { data } = await axios.get(`/api/submission?problemId=${problem.id}`);
        setSubmissions(data.submissions);
      } catch (e) { console.error(e); }
    };
  
    useEffect(() => {
      if (activeTab === 'submissions') fetchSubmissions();
    }, [activeTab]);
  
    const handleAddTestCase = () => {
       const newCases = [...localTestCases, { input: "", expectedOutput: "" }];
       setLocalTestCases(newCases);
       // Set active to the new index (length - 1)
       setActiveTestCaseId(newCases.length - 1);
    };
    return (
    <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden font-sans selection:bg-[var(--viz-cyan)]/20">
      
      {/* --- Header (LeetCode Style) --- */}
      <header className="h-12 border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-md flex items-center px-4 shrink-0 z-50 relative">
        <div className="flex items-center gap-4 z-10">
          <Link href="/problems" className="p-1.5 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors">
            <ChevronLeft size={18} className="text-[var(--muted-foreground)]" />
          </Link>
          <div className="h-4 w-px bg-[var(--border)]" />
          <div className="flex items-center gap-3">
             <h1 className="font-semibold text-sm truncate max-w-[150px] md:max-w-xs">{problem.title}</h1>
             <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                problem.difficulty === "Easy" ? "text-[var(--viz-green)] bg-[var(--viz-green)]/10" :
                problem.difficulty === "Medium" ? "text-[var(--viz-amber)] bg-[var(--viz-amber)]/10" :
                "text-[var(--viz-red)] bg-[var(--viz-red)]/10"
             }`}>
                {problem.difficulty}
             </span>
          </div>
        </div>

        {/* Centered Buttons */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="flex items-center gap-1 bg-[var(--background)] rounded-lg p-1 border border-[var(--border)] pointer-events-auto shadow-sm">
              <button 
                onClick={handleRun}
                disabled={isRunning}
                className="px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                 <Play size={12} fill="currentColor" /> Run
              </button>
              <div className="w-px h-4 bg-[var(--border)]" />
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider text-[var(--viz-green)] hover:bg-[var(--viz-green)]/10 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                 {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Submit
              </button>
           </div>
        </div>

        <div className="flex items-center gap-3 ml-auto z-10">
           <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--viz-amber)]/10 text-[var(--viz-amber)] border border-[var(--viz-amber)]/20 transition-all hover:bg-[var(--viz-amber)]/20 group cursor-default">
                 <Flame size={16} className="fill-current group-hover:scale-110 transition-transform" />
                 <span className="text-xs font-black">{(session?.user as any)?.streak || 0}</span>
              </div>
              <NotificationBell />
              <ThemeToggle direction="down" />
           </div>
        </div>
      </header>

      {/* --- Main Workspace Split --- */}
      <Split
        className="flex-1 flex overflow-hidden"
        sizes={[45, 55]}
        minSize={350}
        gutterSize={6}
        gutterAlign="center"
        dragInterval={1}
      >
        {/* === LEFT PANEL: Description & Tabs === */}
        <div className="flex flex-col h-full bg-[var(--card)]/20 border-r border-[var(--border)]">
           <div className="flex items-center gap-1 px-2 border-b border-[var(--border)] bg-[var(--background)]/50 shrink-0">
              {[
                 { id: 'description', label: 'Description', icon: FileText },
                 { id: 'submissions', label: 'Submissions', icon: History },
                 { id: 'solutions', label: 'Solutions', icon: Braces },
                 { id: 'ai', label: 'AI Helper', icon: Sparkles },
              ].map(t => (
                 <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border-b-2 transition-all ${
                       activeTab === t.id 
                       ? "border-[var(--viz-blue)] text-[var(--foreground)]" 
                       : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                 >
                    <t.icon size={14} /> {t.label}
                 </button>
              ))}
           </div>

           <div className={`flex-1 overflow-y-auto custom-scrollbar ${activeTab === 'ai' ? 'p-0' : 'p-6'}`}>
              {activeTab === 'description' && (
                 <div className="prose prose-invert prose-sm max-w-none 
                    [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-4
                    [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
                    [&_strong]:text-[var(--foreground)]
                    [&_code]:bg-[var(--foreground)]/10 [&_code]:px-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-[var(--viz-blue)]
                    [&_pre]:bg-[var(--card)] [&_pre]:border [&_pre]:border-[var(--border)] [&_pre]:p-4 [&_pre]:rounded-lg
                 ">
                    <div dangerouslySetInnerHTML={{ __html: problem.description }} />
                    
                    {/* Examples Section */}
                    {examples.length > 0 && (
                       <div className="mt-8 space-y-6">
                          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">Examples</h3>
                          {examples.map((ex, i) => (
                             <div key={i} className="bg-[var(--card)]/30 border border-[var(--border)] rounded-lg p-4 text-xs font-mono">
                                <div className="mb-2">
                                   <span className="font-bold text-[var(--muted-foreground)] uppercase tracking-wide mr-2">Input:</span>
                                   <span className="text-[var(--foreground)] bg-[var(--background)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                                      {typeof ex.input === 'object' ? JSON.stringify(ex.input) : ex.input}
                                   </span>
                                </div>
                                <div>
                                   <span className="font-bold text-[var(--muted-foreground)] uppercase tracking-wide mr-2">Output:</span>
                                   <span className="text-[var(--foreground)] bg-[var(--background)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                                      {typeof ex.expectedOutput === 'object' ? JSON.stringify(ex.expectedOutput) : ex.expectedOutput}
                                   </span>
                                </div>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
              )}

              {activeTab === 'submissions' && (
                 <div className="space-y-2">
                    <h3 className="font-bold text-sm text-[var(--foreground)] mb-4">My Submissions</h3>
                    {submissions.length === 0 && <p className="text-xs text-[var(--muted-foreground)]">No submissions yet.</p>}
                    {submissions.map((sub, i) => (
                       <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--viz-blue)]/50 transition-colors cursor-pointer" onClick={() => setSelectedSubmission(sub)}>
                          <div className="flex items-center gap-3">
                             {sub.status === 'Accepted' ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                             <div>
                                <div className={`text-xs font-bold ${sub.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>{sub.status}</div>
                                <div className="text-[10px] text-[var(--muted-foreground)]">{new Date(sub.createdAt).toLocaleString()}</div>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="text-xs font-mono text-[var(--foreground)]">{sub.runtime ? `${sub.runtime}ms` : '-'}</div>
                             <div className="text-[10px] text-[var(--muted-foreground)]">{sub.language}</div>
                          </div>
                       </div>
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
           </div>
        </div>

        {/* === RIGHT PANEL: Editor & Console === */}
        <div className="h-full flex flex-col bg-[var(--background)]">
           <Split
              direction="vertical"
              sizes={consoleOpen ? [60, 40] : [100, 0]}
              minSize={consoleOpen ? 100 : 0}
              gutterSize={consoleOpen ? 6 : 0}
              onDragEnd={(sizes) => setEditorConsoleSizes(sizes)}
              className="flex-1 flex flex-col h-full"
           >
              {/* --- EDITOR AREA --- */}
              <div className="flex flex-col h-full min-h-0 overflow-hidden">
                 {/* Editor Controls */}
                 <div className="h-10 flex items-center justify-between px-3 border-b border-[var(--border)] bg-[var(--card)]/30 shrink-0">
                    <div className="flex items-center gap-2 relative" ref={langDropdownRef}>
                       <button
                          onClick={() => setIsLangOpen(!isLangOpen)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all group"
                       >
                          <Code2 size={14} className="text-[var(--viz-cyan)] group-hover:scale-110 transition-transform" />
                          <span>{languages.find(l => l.value === language)?.label || language}</span>
                          <ChevronDown size={12} className={`opacity-50 transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
                       </button>
                       
                       <AnimatePresence>
                          {isLangOpen && (
                             <motion.div
                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                transition={{ duration: 0.1 }}
                                className="absolute top-full left-0 mt-1 w-48 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden py-1 max-h-64 overflow-y-auto custom-scrollbar backdrop-blur-xl"
                             >
                                {languages.map(l => (
                                   <button 
                                      key={l.value}
                                      onClick={() => { setLanguage(l.value); setIsLangOpen(false); }}
                                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-[var(--foreground)]/5 transition-colors ${language === l.value ? "text-[var(--viz-cyan)] font-bold bg-[var(--viz-cyan)]/5" : "text-[var(--foreground)]"}`}
                                   >
                                      {l.label}
                                      {language === l.value && <Check size={12} />}
                                   </button>
                                ))}
                             </motion.div>
                          )}
                       </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-2">
                       <button onClick={() => setCode(initialCode)} className="p-1.5 hover:bg-[var(--foreground)]/10 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors" title="Reset Code">
                          <RotateCcw size={14} />
                       </button>
                    </div>
                 </div>
                 
                 <div className="flex-1 relative min-h-0">
                                         <Editor
                                           height="100%"
                                           language={language}
                                           theme={mounted && resolvedTheme === "dark" ? "vs-dark" : "light"}
                                           value={code}
                                           onChange={(val) => {
                                              const newCode = val || "";
                                              setCode(newCode);
                                              codeRef.current = newCode;
                                              
                                              // Clear Error Markers on Edit
                                              if (monacoRef.current && editorRef.current) {
                                                 monacoRef.current.editor.setModelMarkers(editorRef.current.getModel(), "api-feedback", []);
                                              }
                    
                                              if (!isRemoteUpdate.current && collabSocketRef.current && collabRoomId) {
                                                 collabSocketRef.current.emit("code_update", { roomId: collabRoomId, code: newCode, language });
                                              }
                                           }}                       options={{
                          minimap: { enabled: false },
                          fontSize: 13,
                          lineNumbers: "on",
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          padding: { top: 12 },
                          fontFamily: "'JetBrains Mono', monospace",
                          cursorBlinking: "smooth",
                          cursorSmoothCaretAnimation: "on",
                          glyphMargin: true,
                          folding: true,
                          lineDecorationsWidth: 10,
                          lineNumbersMinChars: 3,
                       }}
                       onMount={(editor, monaco) => {
                          editorRef.current = editor;
                          monacoRef.current = monaco;

                          // VS Code like diagnostics for JS/TS
                          monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                             noSemanticValidation: false,
                             noSyntaxValidation: false,
                          });
                          
                          // Optional: Set some compiler options to be more lenient if needed
                          monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                             target: monaco.languages.typescript.ScriptTarget.ESNext,
                             allowNonTsExtensions: true,
                          });
                       }}
                    />
                 </div>
              </div>

              {/* --- CONSOLE AREA --- */}
              {consoleOpen && (
                 <div className="flex flex-col h-full min-h-0 bg-[var(--card)]/10 overflow-hidden">
                    <div className="flex items-center justify-between px-3 h-9 border-b border-[var(--border)] bg-[var(--card)]/30 shrink-0">
                       <div className="flex gap-4 h-full">
                          <button 
                             onClick={() => setConsoleTab('testcase')} 
                             className={`text-xs font-medium h-full border-b-2 transition-colors flex items-center gap-2 ${consoleTab === 'testcase' ? 'border-[var(--foreground)] text-[var(--foreground)]' : 'border-transparent text-[var(--muted-foreground)]'}`}
                          >
                             <div className={`w-1.5 h-1.5 rounded-full ${consoleTab === 'testcase' ? 'bg-[var(--viz-green)]' : 'bg-[var(--muted-foreground)]'}`} />
                             Testcase
                          </button>
                          <button 
                             onClick={() => setConsoleTab('result')} 
                             className={`text-xs font-medium h-full border-b-2 transition-colors flex items-center gap-2 ${consoleTab === 'result' ? 'border-[var(--foreground)] text-[var(--foreground)]' : 'border-transparent text-[var(--muted-foreground)]'}`}
                          >
                             <Terminal size={12} />
                             Test Result
                          </button>
                       </div>
                       <button onClick={() => setConsoleOpen(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Minimize2 size={14} />
                       </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                       {consoleTab === 'testcase' ? (
                          <div className="space-y-4">
                             <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                                {localTestCases.map((_, i) => (
                                   <button 
                                      key={i} 
                                      onClick={() => setActiveTestCaseId(i)}
                                      className={`relative px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                                         activeTestCaseId === i 
                                         ? "bg-[var(--card)] border-[var(--viz-cyan)] text-[var(--foreground)] shadow-md" 
                                         : "bg-transparent border-transparent text-[var(--muted-foreground)] hover:bg-[var(--foreground)]/5"
                                      }`}
                                   >
                                      Case {i + 1}
                                      {/* Delete button for custom cases */}
                                      {i >= examples.length && (
                                         <span 
                                            onClick={(e) => {
                                               e.stopPropagation();
                                               const newCases = localTestCases.filter((_, idx) => idx !== i);
                                               setLocalTestCases(newCases);
                                               if (activeTestCaseId >= newCases.length) setActiveTestCaseId(Math.max(0, newCases.length - 1));
                                            }}
                                            className="absolute -top-1 -right-1 bg-[var(--card-bg)] text-[var(--muted-foreground)] hover:text-red-500 rounded-full p-0.5 border border-[var(--border)] shadow-sm"
                                         >
                                            <X size={10} />
                                         </span>
                                      )}
                                   </button>
                                ))}
                                <button 
                                   onClick={handleAddTestCase}
                                   className="px-3 py-2 rounded-lg text-xs font-medium text-[var(--foreground)] hover:bg-[var(--foreground)]/10 transition-colors border border-dashed border-[var(--border)] flex items-center gap-1"
                                >
                                   <Plus size={12} />
                                </button>
                             </div>

                             {localTestCases[activeTestCaseId] && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                   <div className="space-y-1.5">
                                      <label className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest ml-1">Input</label>
                                      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-[var(--viz-cyan)]/50 transition-all">
                                         <textarea 
                                            className="w-full bg-transparent p-3 text-xs font-mono text-[var(--foreground)] outline-none resize-none min-h-[60px]"
                                            value={typeof localTestCases[activeTestCaseId].input === 'object' ? JSON.stringify(localTestCases[activeTestCaseId].input, null, 2) : localTestCases[activeTestCaseId].input}
                                            onChange={(e) => {
                                               const newCases = [...localTestCases];
                                               newCases[activeTestCaseId] = { ...newCases[activeTestCaseId], input: e.target.value };
                                               setLocalTestCases(newCases);
                                            }}
                                            spellCheck={false}
                                         />
                                      </div>
                                   </div>
                                   <div className="space-y-1.5">
                                      <label className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest ml-1">Expected Output (Optional)</label>
                                       <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-[var(--viz-green)]/50 transition-all">
                                         <textarea 
                                            className="w-full bg-transparent p-3 text-xs font-mono text-[var(--foreground)]/80 outline-none resize-none min-h-[60px]"
                                            value={typeof localTestCases[activeTestCaseId].expectedOutput === 'object' ? JSON.stringify(localTestCases[activeTestCaseId].expectedOutput, null, 2) : localTestCases[activeTestCaseId].expectedOutput}
                                            onChange={(e) => {
                                               const newCases = [...localTestCases];
                                               newCases[activeTestCaseId] = { ...newCases[activeTestCaseId], expectedOutput: e.target.value };
                                               setLocalTestCases(newCases);
                                            }}
                                            spellCheck={false}
                                         />
                                      </div>
                                   </div>
                                </div>
                             )}
                          </div>
                       ) : (
                          <div className="h-full">
                             {!results ? (
                                <div className="h-full flex flex-col items-center justify-center text-[var(--muted-foreground)] opacity-50">
                                   <Terminal size={32} strokeWidth={1} className="mb-2" />
                                   <p className="text-xs uppercase tracking-widest font-medium">Ready to Execute</p>
                                </div>
                             ) : (
                                <div className="space-y-6">
                                   {/* Status Header */}
                                   <div className="flex flex-col gap-1">
                                      {(() => {
                                         const currentResult = results[activeTestCaseId];
                                         const globalError = results.find((r: any) => r.status === "Compilation Error" || r.status === "Runtime Error");
                                         const displayStatus = currentResult?.status || globalError?.status || "Execution Failed";
                                         const isSuccess = displayStatus === 'Accepted';
                                         const isError = displayStatus !== 'Accepted';

                                         return (
                                            <>
                                               <div className={`text-xl font-black tracking-tight ${isSuccess ? "text-[var(--viz-green)]" : "text-[var(--viz-red)]"}`}>
                                                  {displayStatus}
                                               </div>
                                               {isSuccess ? (
                                                  <p className="text-xs text-[var(--muted-foreground)]">Runtime: <span className="text-[var(--foreground)] font-mono">0ms</span></p>
                                               ) : (
                                                  <p className="text-xs text-[var(--viz-red)]/80">
                                                     {displayStatus === "Compilation Error" ? "Syntax or Compilation Error found." : "Check your logic and try again."}
                                                  </p>
                                               )}
                                            </>
                                         );
                                      })()}
                                   </div>

                                   {/* Case Selector */}
                                   <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                                      {/* Show tabs for all local cases, even if backend didn't return all of them yet */}
                                      {localTestCases.map((_, i) => {
                                         const res = results[i];
                                         // If global error (like compilation), mark all as error
                                         const isGlobalError = results.some((r: any) => r.status === "Compilation Error");
                                         const status = isGlobalError ? "Compilation Error" : (res?.status || "Unknown");
                                         
                                         return (
                                            <button 
                                               key={i} 
                                               onClick={() => setActiveTestCaseId(i)}
                                               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                                                  activeTestCaseId === i 
                                                  ? "bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] shadow-md" 
                                                  : "bg-transparent border-transparent text-[var(--muted-foreground)] hover:bg-[var(--foreground)]/5"
                                               }`}
                                            >
                                               <div className={`w-2 h-2 rounded-full ${status === 'Accepted' ? "bg-[var(--viz-green)] shadow-[0_0_8px_var(--viz-green)]" : "bg-[var(--viz-red)] shadow-[0_0_8px_var(--viz-red)]"}`} />
                                               Case {i + 1}
                                            </button>
                                         );
                                      })}
                                   </div>

                                   {/* Result Details */}
                                   {(() => {
                                      // Fallback logic: 
                                      // 1. Exact match for this case
                                      // 2. If Compilation Error, show that error (usually in first result or all)
                                      // 3. Fallback "Not Run" state
                                      const currentResult = results[activeTestCaseId];
                                      const globalError = results.find((r: any) => r.status === "Compilation Error");
                                      const resultToDisplay = currentResult || globalError;

                                      if (!resultToDisplay) return <div className="text-xs text-[var(--muted-foreground)]">Result pending or not returned for this case.</div>;

                                      return (
                                         <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            {resultToDisplay.error ? (
                                               <div className="p-4 bg-[var(--viz-red)]/5 border border-[var(--viz-red)]/20 rounded-xl text-xs font-mono text-[var(--viz-red)] whitespace-pre-wrap">
                                                  <div className="font-bold mb-2 uppercase tracking-wider opacity-70">Error Log</div>
                                                  {resultToDisplay.error}
                                               </div>
                                            ) : (
                                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  <div className="space-y-1.5">
                                                     <label className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest ml-1">Input</label>
                                                     <div className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs font-mono text-[var(--foreground)] whitespace-pre-wrap">
                                                        {/* Prefer showing the LOCAL input so user sees what they typed, even if backend failed to echo it */}
                                                        {typeof localTestCases[activeTestCaseId].input === 'object' ? JSON.stringify(localTestCases[activeTestCaseId].input, null, 2) : localTestCases[activeTestCaseId].input}
                                                     </div>
                                                  </div>
                                                  
                                                  <div className="space-y-1.5">
                                                     <label className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest ml-1">Output</label>
                                                     <div className={`p-3 bg-[var(--background)] border rounded-xl text-xs font-mono whitespace-pre-wrap ${
                                                        resultToDisplay.status === 'Accepted' 
                                                        ? "text-[var(--foreground)] border-[var(--border)]" 
                                                        : "text-[var(--viz-red)] border-[var(--viz-red)]/30 bg-[var(--viz-red)]/5"
                                                     }`}>
                                                        {typeof resultToDisplay.actual === 'object' ? JSON.stringify(resultToDisplay.actual, null, 2) : (resultToDisplay.actual || "N/A")}
                                                     </div>
                                                  </div>

                                                  <div className="space-y-1.5">
                                                     <label className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest ml-1">Expected</label>
                                                     <div className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs font-mono text-[var(--viz-green)] whitespace-pre-wrap">
                                                        {typeof localTestCases[activeTestCaseId].expectedOutput === 'object' ? JSON.stringify(localTestCases[activeTestCaseId].expectedOutput, null, 2) : localTestCases[activeTestCaseId].expectedOutput || "N/A"}
                                                     </div>
                                                  </div>
                                               </div>
                                            )}
                                         </div>
                                      );
                                   })()}
                                </div>
                             )}
                          </div>
                       )}
                    </div>
                 </div>
              )}
           </Split>
           
           {/* Console Toggle Footer */}
           {!consoleOpen && (
              <div className="h-9 border-t border-[var(--border)] bg-[var(--card)]/30 flex items-center justify-between px-4 cursor-pointer hover:bg-[var(--foreground)]/5 transition-colors" onClick={() => setConsoleOpen(true)}>
                 <div className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-2">
                    <Terminal size={12} /> Console
                 </div>
                 <ChevronUp size={14} className="text-[var(--muted-foreground)]" />
              </div>
           )}
        </div>
      </Split>

      {/* --- Submission Modal --- */}
      <AnimatePresence>
         {selectedSubmission && (
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
               onClick={() => setSelectedSubmission(null)}
            >
               <motion.div 
                  initial={{ scale: 0.95 }} 
                  animate={{ scale: 1 }} 
                  exit={{ scale: 0.95 }}
                  className="bg-[var(--card)] border border-[var(--border)] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
                  onClick={e => e.stopPropagation()}
               >
                  <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--card)]/50">
                     <h3 className="font-bold text-[var(--foreground)]">Submission Details</h3>
                     <button onClick={() => setSelectedSubmission(null)} className="p-1 hover:bg-[var(--foreground)]/10 rounded"><X size={18} /></button>
                  </div>
                  <div className="p-6 overflow-y-auto custom-scrollbar">
                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className={`p-4 rounded-xl border text-center ${selectedSubmission.status === 'Accepted' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                           <div className="text-[10px] uppercase font-bold opacity-70">Status</div>
                           <div className="text-xl font-bold">{selectedSubmission.status}</div>
                        </div>
                        <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] text-center">
                           <div className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">Runtime</div>
                           <div className="text-xl font-bold text-[var(--foreground)]">{selectedSubmission.runtime || 'N/A'} <span className="text-xs font-normal text-[var(--muted-foreground)]">ms</span></div>
                        </div>
                     </div>
                     <div className="rounded-xl border border-[var(--border)] overflow-hidden h-[300px]">
                        <Editor 
                           height="100%" 
                           language={selectedSubmission.language} 
                           value={selectedSubmission.code} 
                           theme={mounted && resolvedTheme === "dark" ? "vs-dark" : "light"}
                           options={{ readOnly: true, minimap: { enabled: false }, padding: { top: 16 } }} 
                        />
                     </div>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}