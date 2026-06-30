"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import axios from "axios";
import { 
  Zap, ChevronLeft, Cpu, ShieldCheck, Activity, 
  Terminal, Play, Target, CheckCircle2, AlertCircle,
  Database, Code2, Users, UserPlus, Trash2, Loader2,
  FileText, Settings, Share2, Save, ArrowLeft, Clipboard,
  Plus, Upload, FileCode2, Info, Eye, Check, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Collaborator {
  id: string;
  userId: string;
  role: string;
  user: {
    name: string;
    email: string;
  }
}

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  description: string;
  timeLimit: number;
  memoryLimit: number;
  referenceSolution?: string;
  language?: string;
  verificationStatus: string;
  shareToken?: string;
  isPublic: boolean;
  type: string;
  collaborators: Collaborator[];
  testSets?: {
    examples: Array<{ input: string; expectedOutput: string }>;
    hidden: Array<{ input: string; expectedOutput: string }>;
  };
}

export default function StudioProblemEditor() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"statement" | "solution" | "testcases" | "collaborators" | "settings">("statement");
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Statement editor states
  const [description, setDescription] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  // Solution editor states
  const [referenceSolution, setReferenceSolution] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [sandboxInput, setSandboxInput] = useState("");
  const [sandboxResult, setSandboxResult] = useState<{
    status: string;
    runtime?: number;
    actual?: string;
    error?: string;
  } | null>(null);
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);

  // Test Case states
  const [examples, setExamples] = useState<Array<{ id: string; input: string; output: string; status?: string; runtime?: number }>>([]);
  const [testCases, setTestCases] = useState<Array<{ id: string; input: string; output: string; status?: string; runtime?: number }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Collaborator states
  const [newCollabUsername, setNewCollabUsername] = useState("");
  const [collabRole, setCollabRole] = useState("TESTER");

  // Metadata Settings states
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDifficulty, setMetaDifficulty] = useState("Easy");
  const [metaCategory, setMetaCategory] = useState("Algorithms");
  const [metaTimeLimit, setMetaTimeLimit] = useState(2000);
  const [metaMemoryLimit, setMetaMemoryLimit] = useState(256);
  const [metaIsPublic, setMetaIsPublic] = useState(false);
  const [metaProblemType, setMetaProblemType] = useState("CODING");

  const fetchProblem = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/problems/id/${id}`);
      const p = data.problem as Problem;
      setProblem(p);
      setDescription(p.description || "");
      setReferenceSolution(p.referenceSolution || "");
      setLanguage(p.language || "javascript");
      
      // Load settings
      setMetaTitle(p.title || "");
      setMetaDifficulty(p.difficulty || "Easy");
      setMetaCategory(p.category || "General");
      setMetaTimeLimit(p.timeLimit || 2000);
      setMetaMemoryLimit(p.memoryLimit || 256);
      setMetaIsPublic(p.isPublic || false);
      setMetaProblemType(p.type || "CODING");

      // Parse test sets
      let parsedExamples: any[] = [];
      let parsedHidden: any[] = [];
      if (p.testSets) {
        const sets = p.testSets as any;
        if (Array.isArray(sets.examples)) {
          parsedExamples = sets.examples.map((ex: any, idx: number) => ({
            id: `ex-${idx}-${Date.now()}`,
            input: ex.input || "",
            output: ex.expectedOutput || ""
          }));
        }
        if (Array.isArray(sets.hidden)) {
          parsedHidden = sets.hidden.map((tc: any, idx: number) => ({
            id: `tc-${idx}-${Date.now()}`,
            input: tc.input || "",
            output: tc.expectedOutput || ""
          }));
        }
      }
      setExamples(parsedExamples);
      setTestCases(parsedHidden);
    } catch (err) {
      toast.error("Failed to load problem workspace");
      router.push("/studio");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchProblem();
  }, [status, fetchProblem, router]);

  const handleSave = async (silent = false) => {
    setIsSaving(true);
    try {
      const payload = {
        title: metaTitle,
        difficulty: metaDifficulty,
        category: metaCategory,
        description: description,
        examplesInput: examples.map(ex => ({ input: ex.input, output: ex.output })),
        testCasesInput: testCases.map(tc => ({ input: tc.input, output: tc.output })),
        referenceSolution: referenceSolution,
        language: language,
        timeLimit: metaTimeLimit,
        memoryLimit: metaMemoryLimit,
        isPublic: metaIsPublic,
        problemType: metaProblemType,
        isVerified: true
      };

      await axios.patch(`/api/problems/id/${id}/update`, payload);
      if (!silent) toast.success("Workspace saved successfully");
      fetchProblem();
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Run Sandbox code
  const handleRunSandbox = async () => {
    if (!referenceSolution.trim()) return toast.error("Provide solution code first");
    setIsSandboxRunning(true);
    setSandboxResult(null);
    try {
      const { data } = await axios.post("/api/run", {
        code: referenceSolution,
        language: language,
        testCases: [{ input: sandboxInput, expectedOutput: "" }],
        type: metaProblemType
      });
      setSandboxResult(data.results[0]);
    } catch (err) {
      toast.error("Sandbox code execution failed");
    } finally {
      setIsSandboxRunning(false);
    }
  };

  // Run all test cases against the reference solution and check outputs
  const runTestCases = async () => {
    if (!referenceSolution.trim()) {
      toast.error("Please add a reference solution first");
      return;
    }
    setIsVerifying(true);
    try {
      // 1. Run Examples
      if (examples.length > 0) {
        const { data: exData } = await axios.post("/api/run", {
          code: referenceSolution,
          language: language,
          testCases: examples.map(ex => ({ input: ex.input, expectedOutput: ex.output })),
          type: metaProblemType
        });
        setExamples(prev => prev.map((ex, idx) => ({
          ...ex,
          status: exData.results[idx]?.status || "Failed",
          runtime: exData.results[idx]?.runtime || 0
        })));
      }

      // 2. Run Hidden Cases
      if (testCases.length > 0) {
        const { data: tcData } = await axios.post("/api/run", {
          code: referenceSolution,
          language: language,
          testCases: testCases.map(tc => ({ input: tc.input, expectedOutput: tc.output })),
          type: metaProblemType
        });
        setTestCases(prev => prev.map((tc, idx) => ({
          ...tc,
          status: tcData.results[idx]?.status || "Failed",
          runtime: tcData.results[idx]?.runtime || 0
        })));
      }
      toast.success("Validation run complete!");
    } catch (err) {
      toast.error("Failed to validate test cases");
    } finally {
      setIsVerifying(false);
    }
  };

  // Generate expected outputs automatically from reference solution
  const autoGenerateOutputs = async () => {
    if (!referenceSolution.trim()) {
      toast.error("A reference solution is required to generate outputs");
      return;
    }
    setIsVerifying(true);
    try {
      if (examples.length > 0) {
        const { data: exData } = await axios.post("/api/run", {
          code: referenceSolution,
          language: language,
          testCases: examples.map(ex => ({ input: ex.input, expectedOutput: "" })),
          type: metaProblemType
        });
        setExamples(prev => prev.map((ex, idx) => ({
          ...ex,
          output: exData.results[idx]?.actual || ""
        })));
      }

      if (testCases.length > 0) {
        const { data: tcData } = await axios.post("/api/run", {
          code: referenceSolution,
          language: language,
          testCases: testCases.map(tc => ({ input: tc.input, expectedOutput: "" })),
          type: metaProblemType
        });
        setTestCases(prev => prev.map((tc, idx) => ({
          ...tc,
          output: tcData.results[idx]?.actual || ""
        })));
      }
      toast.success("Expected outputs successfully generated!");
    } catch (err) {
      toast.error("Failed to generate test case outputs");
    } finally {
      setIsVerifying(false);
    }
  };

  // Text files upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        // Append input file to hidden test cases
        setTestCases(prev => [...prev, {
          id: `tc-${Date.now()}-${Math.random()}`,
          input: text,
          output: "",
          status: undefined
        }]);
        toast.success(`Loaded test input from ${file.name}`);
      };
      reader.readAsText(file);
    });
  };

  // Add collaborator
  const addCollaborator = async () => {
    if (!newCollabUsername) return;
    try {
      await axios.post(`/api/problems/id/${id}/collaborators`, {
        username: newCollabUsername,
        role: collabRole
      });
      toast.success("Collaborator added");
      setNewCollabUsername("");
      fetchProblem();
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) 
        ? err.response?.data?.error 
        : err instanceof Error ? err.message : "Failed to add collaborator";
      toast.error(errorMsg);
    }
  };

  const removeCollaborator = async (collabId: string) => {
    try {
      await axios.delete(`/api/problems/id/${id}/collaborators/${collabId}`);
      toast.success("Collaborator removed");
      fetchProblem();
    } catch (err) {
      toast.error("Failed to remove collaborator");
    }
  };

  const generateShareLink = async (role: string) => {
     const token = problem?.shareToken || "token-stub-123";
     const url = `${window.location.origin}/studio/join/problem?token=${token}&role=${role}`;
     navigator.clipboard.writeText(url);
     toast.success(`${role} share link copied to clipboard`);
  };

  if (loading) return (
     <main className="h-screen bg-[#050505] flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
           <div className="w-10 h-10 border-2 border-[#3b82f6]/20 border-t-[#3b82f6] rounded-full animate-spin" />
           <p className="text-[10px] uppercase tracking-widest text-[#52525b]">Syncing Studio Workspace...</p>
        </div>
     </main>
  );

  return (
    <main className="flex flex-col h-screen bg-[#050505] overflow-hidden text-white font-sans">
      {/* 1. TOP HEADER */}
      <header className="h-16 bg-[#080808]/90 backdrop-blur border-b border-white/5 flex items-center justify-between px-8 shrink-0 z-50">
         <div className="flex items-center gap-6">
            <Link href="/studio" className="p-2 hover:bg-white/5 rounded-lg text-[#52525b] hover:text-white transition-all">
               <ArrowLeft size={18} />
            </Link>
            <div className="h-4 w-px bg-white/5" />
            <div className="flex flex-col">
               <span className="text-[9px] font-bold text-[#3b82f6] uppercase tracking-widest">Foundry Studio</span>
               <h1 className="text-sm font-black uppercase tracking-tight">{problem?.title}</h1>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
               <div className={`w-1.5 h-1.5 rounded-full ${problem?.verificationStatus === 'STABLE' ? 'bg-green-500' : 'bg-amber-500'}`} />
               <span className="text-[9px] font-bold uppercase tracking-widest text-[#a1a1aa]">{problem?.verificationStatus}</span>
            </div>
            <button 
               onClick={() => handleSave(false)}
               disabled={isSaving}
               className="px-6 py-2 bg-[#3b82f6] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#2563eb] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
               {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
               Save Changes
            </button>
         </div>
      </header>

      {/* 2. BODY LAYOUT */}
      <div className="flex-1 flex min-h-0">
         {/* SIDE BAR BUTTONS */}
         <aside className="w-64 border-r border-white/5 bg-[#080808] p-4 flex flex-col gap-2 shrink-0">
            {[
               { id: 'statement', label: 'Problem Statement', icon: FileText },
               { id: 'solution', label: 'Reference Solution', icon: FileCode2 },
               { id: 'testcases', label: 'Test Cases', icon: Database },
               { id: 'collaborators', label: 'Collaborators', icon: Users },
               { id: 'settings', label: 'Metadata Settings', icon: Settings },
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 border text-left cursor-pointer ${
                     activeTab === tab.id 
                     ? "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20 shadow-[0_0_20px_rgba(59,130,246,0.1)] font-semibold" 
                     : "text-[#52525b] border-transparent hover:text-white hover:bg-white/5"
                  }`}
               >
                  <tab.icon size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
               </button>
            ))}
         </aside>

         {/* MAIN WORKSPACE SCREEN */}
         <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#050505] p-12">
            <AnimatePresence mode="wait">
               {/* STATEMENT EDITOR */}
               {activeTab === 'statement' && (
                  <motion.div 
                     key="statement" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                     className="max-w-6xl h-full flex flex-col gap-6"
                  >
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <h2 className="text-2xl font-black uppercase tracking-tight text-white">Problem Statement</h2>
                           <p className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest">Describe the rules, inputs, format, and examples of the task.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-1 rounded-xl">
                           <button 
                              onClick={() => setPreviewMode(false)}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer ${!previewMode ? "bg-[#3b82f6] text-white" : "text-[#52525b] hover:text-white"}`}
                           >
                              Edit Statement
                           </button>
                           <button 
                              onClick={() => setPreviewMode(true)}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer ${previewMode ? "bg-[#3b82f6] text-white" : "text-[#52525b] hover:text-white"}`}
                           >
                              <Eye size={10} className="inline mr-1" /> Preview
                           </button>
                        </div>
                     </div>

                     <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[480px]">
                        {/* Editor Block */}
                        <div className={`flex flex-col gap-3 ${previewMode ? "hidden lg:flex" : "flex"}`}>
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b]">Markdown Content</label>
                           <textarea
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="# Problem Title&#10;&#10;Write details, constraints, and formats..."
                              className="flex-1 w-full bg-[#080808] border border-white/5 rounded-2xl p-6 font-mono text-xs text-white leading-relaxed focus:outline-none focus:border-[#3b82f6]/30 transition-all resize-none min-h-[400px]"
                           />
                        </div>

                        {/* Live Preview Panel */}
                        <div className={`flex flex-col gap-3 ${!previewMode ? "hidden lg:flex" : "flex"}`}>
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#3b82f6]">Live Render</label>
                           <div className="flex-1 bg-[#080808] border border-white/5 rounded-2xl p-8 overflow-y-auto max-h-[500px] prose prose-invert prose-sm max-w-none text-white font-sans leading-relaxed">
                              {description ? (
                                 <div className="space-y-4">
                                    <h1 className="text-xl font-bold uppercase border-b border-white/5 pb-2">{metaTitle || "Untitled"}</h1>
                                    <div className="text-xs text-[#a1a1aa] whitespace-pre-wrap leading-relaxed">
                                       {description}
                                    </div>
                                 </div>
                              ) : (
                                 <span className="italic text-[#52525b] text-xs">Nothing to render. Write statement to see live render output.</span>
                              )}
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}

               {/* REFERENCE SOLUTION */}
               {activeTab === 'solution' && (
                  <motion.div 
                     key="solution" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                     className="max-w-6xl space-y-8"
                  >
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <h2 className="text-2xl font-black uppercase tracking-tight text-white">Reference Solution</h2>
                           <p className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest">Write the correct implementation to automatically verify outputs.</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <select 
                              value={language} 
                              onChange={(e) => setLanguage(e.target.value)}
                              className="bg-black border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none text-[#3b82f6]"
                           >
                              <option value="javascript">JavaScript</option>
                              <option value="python">Python</option>
                              <option value="cpp">C++</option>
                              <option value="java">Java</option>
                           </select>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Reference Code Panel */}
                        <div className="space-y-3">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b]">Reference Code</label>
                           <textarea
                              value={referenceSolution}
                              onChange={(e) => setReferenceSolution(e.target.value)}
                              placeholder="// Complete reference solution here..."
                              className="w-full bg-[#080808] border border-white/5 rounded-3xl p-6 font-mono text-xs text-white leading-relaxed focus:outline-none focus:border-[#3b82f6]/30 transition-all min-h-[420px] resize-none"
                           />
                        </div>

                        {/* Verification Sandbox */}
                        <div className="flex flex-col gap-6 bg-white/[0.01] border border-white/5 rounded-[2rem] p-8">
                           <div className="flex items-center justify-between border-b border-white/5 pb-4">
                              <div className="flex items-center gap-2 text-[#3b82f6]">
                                 <Cpu size={16} />
                                 <span className="text-[10px] font-bold uppercase tracking-widest">Local Sandbox Run</span>
                              </div>
                              <button
                                 onClick={handleRunSandbox}
                                 disabled={isSandboxRunning || !referenceSolution.trim()}
                                 className="px-5 py-2 bg-[#3b82f6] text-white hover:bg-[#2563eb] text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-30 cursor-pointer"
                              >
                                 {isSandboxRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} className="inline mr-1" />}
                                 Execute Code
                              </button>
                           </div>

                           <div className="space-y-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b]">Console Input (STDIN)</label>
                              <textarea
                                 value={sandboxInput}
                                 onChange={(e) => setSandboxInput(e.target.value)}
                                 placeholder="Provide input arguments..."
                                 className="w-full bg-black border border-white/5 rounded-xl p-4 font-mono text-xs text-[#a1a1aa] min-h-[100px] focus:outline-none"
                              />
                           </div>

                           <div className="flex-1 flex flex-col min-h-[150px] bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
                              <div className="h-8 border-b border-white/5 bg-white/[0.02] flex items-center px-4 gap-2">
                                 <Terminal size={12} className="text-[#52525b]" />
                                 <span className="text-[8px] font-bold uppercase tracking-widest text-[#52525b]">Console Output</span>
                              </div>
                              <div className="flex-1 p-6 font-mono text-xs overflow-y-auto custom-scrollbar max-h-[160px]">
                                 {isSandboxRunning ? (
                                    <div className="h-full flex items-center justify-center gap-2 opacity-35">
                                       <Loader2 className="animate-spin" size={14} />
                                       <span className="text-[9px] uppercase tracking-widest">Running...</span>
                                    </div>
                                 ) : sandboxResult ? (
                                    <div className="space-y-4">
                                       <div className="flex items-center gap-6 border-b border-white/5 pb-2">
                                          <div className="flex flex-col">
                                             <span className="text-[8px] uppercase text-[#52525b] font-bold">Status</span>
                                             <span className={`text-[10px] font-black uppercase ${sandboxResult.status === 'Accepted' ? 'text-green-500' : 'text-rose-500'}`}>{sandboxResult.status}</span>
                                          </div>
                                          <div className="flex flex-col">
                                             <span className="text-[8px] uppercase text-[#52525b] font-bold">Runtime</span>
                                             <span className="text-[10px] font-black text-white">{sandboxResult.runtime?.toFixed(0)}ms</span>
                                          </div>
                                       </div>
                                       {sandboxResult.actual && (
                                          <pre className="text-[10px] text-[#a1a1aa] whitespace-pre-wrap">{sandboxResult.actual}</pre>
                                       )}
                                       {sandboxResult.error && (
                                          <pre className="text-[10px] text-rose-400 whitespace-pre-wrap bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{sandboxResult.error}</pre>
                                       )}
                                    </div>
                                 ) : (
                                    <div className="h-full flex items-center justify-center opacity-10 italic">
                                       Console outputs display here.
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}

               {/* TEST CASES */}
               {activeTab === 'testcases' && (
                  <motion.div 
                     key="testcases" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                     className="max-w-6xl space-y-8"
                  >
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <h2 className="text-2xl font-black uppercase tracking-tight text-white">Test Cases Workspace</h2>
                           <p className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest">Define multiple test vectors. Upload files to bulk add inputs.</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                              onClick={autoGenerateOutputs}
                              disabled={isVerifying || !referenceSolution.trim()}
                              className="px-5 py-2 bg-white/5 border border-white/5 hover:border-[#3b82f6]/30 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer disabled:opacity-30"
                              title="Generates outputs automatically using your reference solution"
                           >
                              {isVerifying ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} className="text-amber-500" />}
                              Auto-Generate Outputs
                           </button>
                           <button 
                              onClick={runTestCases}
                              disabled={isVerifying || !referenceSolution.trim()}
                              className="px-5 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer disabled:opacity-30"
                           >
                              {isVerifying ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                              Run Validation
                           </button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Test Cases Table Stream */}
                        <div className="lg:col-span-2 space-y-6">
                           {/* Example Test Cases Block */}
                           <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                 <label className="text-[9px] font-bold uppercase tracking-widest text-[#3b82f6]">Example Cases (Visible to Users)</label>
                                 <button
                                    onClick={() => setExamples(prev => [...prev, { id: `ex-${Date.now()}`, input: "", output: "" }])}
                                    className="p-1 rounded bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 hover:bg-[#3b82f6]/20 text-[9px] uppercase font-black tracking-widest flex items-center gap-1 cursor-pointer"
                                 >
                                    <Plus size={10} /> Add Example
                                 </button>
                              </div>
                              <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                                 {examples.length === 0 ? (
                                    <div className="py-8 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-2xl text-xs text-[#52525b] uppercase font-bold tracking-wider">
                                       No examples configured.
                                    </div>
                                 ) : (
                                    examples.map((ex, idx) => (
                                       <div key={ex.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-3 relative group">
                                          <button 
                                             onClick={() => setExamples(prev => prev.filter(item => item.id !== ex.id))}
                                             className="absolute top-2 right-2 p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
                                          >
                                             <Trash2 size={12} />
                                          </button>
                                          <div className="grid grid-cols-2 gap-4">
                                             <div className="space-y-1">
                                                <span className="text-[8px] text-[#52525b] uppercase font-bold">Input Example {idx + 1}</span>
                                                <textarea 
                                                   value={ex.input} 
                                                   onChange={e => setExamples(prev => prev.map(item => item.id === ex.id ? { ...item, input: e.target.value } : item))}
                                                   className="w-full bg-black border border-white/5 rounded-xl p-3 font-mono text-[10px] text-white outline-none resize-none min-h-[60px]"
                                                />
                                             </div>
                                             <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                   <span className="text-[8px] text-[#52525b] uppercase font-bold">Expected Output</span>
                                                   {ex.status && (
                                                      <span className={`text-[8px] font-black uppercase flex items-center gap-1 ${ex.status === 'Accepted' ? 'text-green-500' : 'text-rose-500'}`}>
                                                         {ex.status === 'Accepted' ? <Check size={8} /> : <X size={8} />} {ex.status}
                                                      </span>
                                                   )}
                                                </div>
                                                <textarea 
                                                   value={ex.output} 
                                                   onChange={e => setExamples(prev => prev.map(item => item.id === ex.id ? { ...item, output: e.target.value } : item))}
                                                   className="w-full bg-black border border-white/5 rounded-xl p-3 font-mono text-[10px] text-white outline-none resize-none min-h-[60px]"
                                                />
                                             </div>
                                          </div>
                                       </div>
                                    ))
                                 )}
                              </div>
                           </div>

                           {/* Hidden Test Cases Block */}
                           <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                 <label className="text-[9px] font-bold uppercase tracking-widest text-[#3b82f6]">Hidden Cases (Vetting Suite)</label>
                                 <button
                                    onClick={() => setTestCases(prev => [...prev, { id: `tc-${Date.now()}`, input: "", output: "" }])}
                                    className="p-1 rounded bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 hover:bg-[#3b82f6]/20 text-[9px] uppercase font-black tracking-widest flex items-center gap-1 cursor-pointer"
                                 >
                                    <Plus size={10} /> Add Case
                                 </button>
                              </div>
                              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                 {testCases.length === 0 ? (
                                    <div className="py-8 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-2xl text-xs text-[#52525b] uppercase font-bold tracking-wider">
                                       No hidden test cases loaded.
                                    </div>
                                 ) : (
                                    testCases.map((tc, idx) => (
                                       <div key={tc.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-3 relative group">
                                          <button 
                                             onClick={() => setTestCases(prev => prev.filter(item => item.id !== tc.id))}
                                             className="absolute top-2 right-2 p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
                                          >
                                             <Trash2 size={12} />
                                          </button>
                                          <div className="grid grid-cols-2 gap-4">
                                             <div className="space-y-1">
                                                <span className="text-[8px] text-[#52525b] uppercase font-bold">Input {idx + 1}</span>
                                                <textarea 
                                                   value={tc.input} 
                                                   onChange={e => setTestCases(prev => prev.map(item => item.id === tc.id ? { ...item, input: e.target.value } : item))}
                                                   className="w-full bg-black border border-white/5 rounded-xl p-3 font-mono text-[10px] text-white outline-none resize-none min-h-[60px]"
                                                />
                                             </div>
                                             <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                   <span className="text-[8px] text-[#52525b] uppercase font-bold">Expected Output</span>
                                                   {tc.status && (
                                                      <span className={`text-[8px] font-black uppercase flex items-center gap-1 ${tc.status === 'Accepted' ? 'text-green-500' : 'text-rose-500'}`}>
                                                         {tc.status === 'Accepted' ? <Check size={8} /> : <X size={8} />} {tc.status}
                                                      </span>
                                                   )}
                                                </div>
                                                <textarea 
                                                   value={tc.output} 
                                                   onChange={e => setTestCases(prev => prev.map(item => item.id === tc.id ? { ...item, output: e.target.value } : item))}
                                                   className="w-full bg-black border border-white/5 rounded-xl p-3 font-mono text-[10px] text-white outline-none resize-none min-h-[60px]"
                                                />
                                             </div>
                                          </div>
                                       </div>
                                    ))
                                 )}
                              </div>
                           </div>
                        </div>

                        {/* File Upload Side Panel */}
                        <div className="space-y-6">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b]">Bulk Upload Panel</label>
                           
                           {/* Drag & Drop Card */}
                           <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="border-2 border-dashed border-white/10 hover:border-[#3b82f6]/40 rounded-3xl p-8 bg-white/[0.01] hover:bg-[#3b82f6]/5 text-center transition-all cursor-pointer group relative overflow-hidden"
                           >
                              <input 
                                 type="file" 
                                 ref={fileInputRef} 
                                 onChange={handleFileUpload} 
                                 className="hidden" 
                                 multiple 
                                 accept=".txt,.in,.out"
                              />
                              <Upload className="mx-auto w-8 h-8 text-[#52525b] group-hover:text-[#3b82f6] group-hover:scale-105 transition-all mb-4" />
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Drag & Drop files</h4>
                              <p className="text-[9px] text-[#52525b] uppercase font-semibold tracking-wider mt-2">Accepts .txt, .in, or .out test input vectors</p>
                           </div>

                           <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col gap-3">
                              <div className="flex items-center gap-2 text-[#3b82f6]">
                                 <Info size={14} />
                                 <span className="text-[9px] font-bold uppercase tracking-widest">Vetting Advice</span>
                              </div>
                              <p className="text-[10px] text-[#52525b] leading-relaxed uppercase tracking-wider">
                                 1. Write your solution in reference code.<br/>
                                 2. Add inputs manually or drop input files.<br/>
                                 3. Click <strong className="text-white">Auto-Generate Outputs</strong> to run reference solution and generate outputs.<br/>
                                 4. Click <strong className="text-white">Save Changes</strong> to sync problem model.
                              </p>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}

               {/* COLLABORATORS */}
               {activeTab === 'collaborators' && (
                  <motion.div 
                     key="collaborators" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                     className="max-w-4xl space-y-12"
                  >
                     <section className="space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#3b82f6]">
                              <UserPlus size={20} />
                           </div>
                           <h2 className="text-2xl font-black uppercase tracking-tight text-white">Add Collaborators</h2>
                        </div>

                        <div className="p-8 bg-[#080808] border border-white/5 rounded-[2.5rem] flex flex-col md:flex-row gap-6 items-end">
                           <div className="flex-1 space-y-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b] ml-1">Username or Email</label>
                              <input 
                                 value={newCollabUsername} 
                                 onChange={e => setNewCollabUsername(e.target.value)}
                                 placeholder="Search by username..."
                                 className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-[#3b82f6]/50 transition-all text-xs"
                              />
                           </div>
                           <div className="w-48 space-y-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b] ml-1">Role</label>
                              <select 
                                 value={collabRole} 
                                 onChange={e => setCollabRole(e.target.value)}
                                 className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-white outline-none"
                              >
                                 <option value="SETTER">Setter (Editor)</option>
                                 <option value="TESTER">Tester (View/Run)</option>
                              </select>
                           </div>
                           <button 
                              onClick={addCollaborator}
                              className="px-10 py-4 bg-white text-black rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#3b82f6] hover:text-white transition-all shadow-xl cursor-pointer"
                           >
                              Invite
                           </button>
                        </div>
                     </section>

                     <section className="space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#3b82f6]">
                              <Share2 size={20} />
                           </div>
                           <h2 className="text-2xl font-black uppercase tracking-tight text-white">Shareable Links</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {[
                              { role: 'Editor', icon: <Code2 size={14} />, desc: 'Allow others to edit statement and test cases.' },
                              { role: 'Tester', icon: <Activity size={14} />, desc: 'Allow others to run solutions and view tests.' }
                           ].map(link => (
                              <div key={link.role} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4 hover:border-[#3b82f6]/20 transition-all group">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       <div className="p-2 bg-[#3b82f6]/10 rounded-lg text-[#3b82f6]">{link.icon}</div>
                                       <span className="text-sm font-bold text-white">{link.role} Link</span>
                                    </div>
                                    <button onClick={() => generateShareLink(link.role)} className="p-2 hover:bg-white/5 rounded-lg text-[#52525b] hover:text-[#3b82f6] transition-all border-none bg-transparent cursor-pointer">
                                       <Clipboard size={16} />
                                    </button>
                                 </div>
                                 <p className="text-[10px] text-[#52525b] uppercase tracking-widest leading-relaxed">{link.desc}</p>
                              </div>
                           ))}
                        </div>
                     </section>

                     <section className="space-y-8">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#52525b] ml-1">Active Collaborators</h3>
                        <div className="grid grid-cols-1 gap-3">
                           {problem?.collaborators?.length === 0 ? (
                              <p className="text-[10px] italic text-[#262626] uppercase tracking-widest">No collaborators added yet.</p>
                           ) : (
                              problem?.collaborators?.map((collab: Collaborator) => (
                                 <div key={collab.id} className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-[#3b82f6]/20 transition-all">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-[#3b82f6]">
                                          {collab.user.name?.[0] || collab.user.email[0].toUpperCase()}
                                       </div>
                                       <div className="flex flex-col">
                                          <span className="text-sm font-bold text-white">{collab.user.name || "Anonymous"}</span>
                                          <span className="text-[9px] font-mono text-[#52525b]">{collab.user.email}</span>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                       <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[8px] font-bold text-[#a1a1aa] uppercase tracking-widest">{collab.role}</span>
                                       <button onClick={() => removeCollaborator(collab.id)} className="p-2 text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 border-none bg-transparent cursor-pointer">
                                          <Trash2 size={16} />
                                       </button>
                                    </div>
                                 </div>
                              ))
                           )}
                        </div>
                     </section>
                  </motion.div>
               )}

               {/* METADATA SETTINGS */}
               {activeTab === 'settings' && (
                  <motion.div 
                     key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                     className="max-w-4xl space-y-12"
                  >
                     <section className="space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#3b82f6]">
                              <Settings size={20} />
                           </div>
                           <h2 className="text-2xl font-black uppercase tracking-tight text-white">General Parameters</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-8 p-8 bg-[#080808] border border-white/5 rounded-[2.5rem]">
                           <div className="space-y-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b] ml-1">Problem Title</label>
                              <input 
                                 value={metaTitle} 
                                 onChange={e => setMetaTitle(e.target.value)}
                                 className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-[#3b82f6]/50 transition-all font-bold"
                              />
                           </div>

                           <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-3">
                                 <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b] ml-1">Difficulty</label>
                                 <select 
                                    value={metaDifficulty} 
                                    onChange={e => setMetaDifficulty(e.target.value)}
                                    className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-white outline-none"
                                 >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                 </select>
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b] ml-1">Category</label>
                                 <input 
                                    value={metaCategory} 
                                    onChange={e => setMetaCategory(e.target.value)}
                                    className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-[#3b82f6]/50"
                                 />
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-3">
                                 <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b] ml-1">Time Limit (ms)</label>
                                 <input 
                                    type="number" 
                                    value={metaTimeLimit} 
                                    onChange={e => setMetaTimeLimit(parseInt(e.target.value))}
                                    className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-[#3b82f6]/50"
                                 />
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b] ml-1">Memory Limit (MB)</label>
                                 <input 
                                    type="number" 
                                    value={metaMemoryLimit} 
                                    onChange={e => setMetaMemoryLimit(parseInt(e.target.value))}
                                    className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-[#3b82f6]/50"
                                 />
                              </div>
                           </div>

                           <div className="pt-4 border-t border-white/5">
                              <div className="flex items-center justify-between">
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">Public problem pool</span>
                                    <span className="text-[9px] font-bold text-[#52525b] uppercase tracking-widest mt-1">Make this problem visible inside public library</span>
                                 </div>
                                 <div className="relative inline-flex items-center h-5 w-9 shrink-0 cursor-pointer rounded-full bg-white/5">
                                    <input 
                                       type="checkbox" 
                                       checked={metaIsPublic} 
                                       onChange={e => setMetaIsPublic(e.target.checked)}
                                       className="sr-only peer" 
                                    />
                                    <div className="w-9 h-5 bg-[#262626] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3b82f6]" />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </section>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>

      <style jsx global>{`
         .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </main>
  );
}
