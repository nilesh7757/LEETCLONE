"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import Split from "react-split";
import Editor from "@monaco-editor/react";
import { AnimatePresence, motion } from "framer-motion";

import { 
  PlusCircle, Trash2, FileText, LayoutTemplate, SlidersHorizontal, 
  Save, Code2, ChevronDown, CheckCircle, Loader2, 
  RotateCcw, Target, ShieldAlert,
  Zap, ChevronRight, CheckCircle2, ChevronLeft, Play, Upload, Users
} from "lucide-react";
import { useTheme } from "next-themes";
import { languages, getStarterCode } from "@/lib/starterCode";
import { generateSlug, detectLanguage } from "@/lib/utils";

import TiptapEditor from "@/features/editor/components/TiptapEditor";
import TestCaseEditor from "./TestCaseEditor";

interface TestCase {
  input: string;
  output: string;
}

export interface ProblemFormData {
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  description: string;
  editorial: string;
  hints: string[];
  examplesInput: TestCase[];
  testCasesInput: TestCase[];
  referenceSolution: string;
  initialSchema: string;
  initialData: string;
  language: string;
  timeLimit: number;
  memoryLimit: number;
  isPublic: boolean;
  problemType: "CODING" | "SHELL" | "INTERACTIVE" | "SYSTEM_DESIGN" | "SQL" | "READING"; 
  type?: string;
  creatorId?: string;
}

interface ProblemFormProps {
  initialData?: ProblemFormData;
  onSubmit: (data: ProblemFormData) => Promise<void>;
  isEditing?: boolean;
  contestId?: string | null;
  problemId?: string; // Add problemId for verification
  hideHeader?: boolean;
  onlyTab?: "meta" | "context" | "setup" | "intel";
  verificationStatus?: string;
  onUpdateStatus?: (status: string) => void;
  collaboratorsCount?: number;
  onCollabClick?: () => void;
}

const difficulties = ["Easy", "Medium", "Hard"];
const categories = ["Arrays", "Strings", "Trees", "Graphs", "Dynamic Programming", "Other"];

export default function ProblemForm({ 
  initialData, onSubmit, isEditing = false, contestId, problemId,
  hideHeader = false, onlyTab,
  verificationStatus, onUpdateStatus, collaboratorsCount, onCollabClick
}: ProblemFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false); // Add verification state
  const [isGeneratingEditorial, setIsGeneratingEditorial] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [activeTab, setActiveTab] = useState<"meta" | "context" | "setup" | "intel">(onlyTab || "meta");
  const [descriptionMode, setDescriptionMode] = useState<"RICH_TEXT" | "MARKDOWN" | "PDF">("RICH_TEXT");
  const [markdownPreview, setMarkdownPreview] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onlyTab) setActiveTab(onlyTab);
  }, [onlyTab]);

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<ProblemFormData>({
    defaultValues: initialData || {
      title: "",
      slug: "",
      difficulty: difficulties[0],
      category: categories[0],
      description: "",
      editorial: "",
      hints: [],
      examplesInput: [],
      testCasesInput: [],
      referenceSolution: getStarterCode("javascript"),
      initialSchema: "CREATE TABLE Users (id INTEGER PRIMARY KEY, name TEXT);",
      initialData: "INSERT INTO Users (id, name) VALUES (1, 'Alice');",
      language: "javascript",
      timeLimit: 2,
      memoryLimit: 256,
      isPublic: false,
      problemType: "CODING",
    },
  });

  const runVerification = async () => {
    const currentCode = getValues("referenceSolution");
    const currentExamples = getValues("examplesInput") || [];
    const currentTests = getValues("testCasesInput") || [];
    
    if (!currentCode) {
      toast.error("Reference solution required for verification");
      return;
    }

    if (currentExamples.length === 0 && currentTests.length === 0) {
      toast.error("Add at least one example or test case before verifying");
      return;
    }

    const combinedTests = [
      ...currentExamples.map(tc => ({ ...tc, isExample: true })),
      ...currentTests.map(tc => ({ ...tc, isExample: false }))
    ];

    const finalLang = detectLanguage(currentCode);
    setIsVerifying(true);
    const loadingToast = toast.loading("Running verification suite...");
    
    try {
      const { data } = await axios.post("/api/run", {
        problemId: problemId,
        code: currentCode,
        language: finalLang,
        testCases: combinedTests,
        type: getValues("problemType") || "CODING",
        isOutputGeneration: true 
      });

      const allPassed = data.results.every((r: { status: string }) => r.status === "Accepted");
      
      if (allPassed) {
        // Automatically populate outputs if they were generated
        const updatedExamples = getValues("examplesInput").map((tc, idx) => {
          const res = data.results[idx] as { actual?: string };
          return res && res.actual ? { ...tc, output: res.actual } : tc;
        });
        setValue("examplesInput", updatedExamples);

        const updatedTestCases = getValues("testCasesInput").map((tc, idx) => {
          const res = data.results[getValues("examplesInput").length + idx] as { actual?: string };
          return res && res.actual ? { ...tc, output: res.actual } : tc;
        });
        setValue("testCasesInput", updatedTestCases);

        if (problemId) {
          await axios.patch(`/api/problems/id/${problemId}/update`, { isVerified: true });
        }
        toast.success("Verification successful: All outputs updated");
      } else {
        const failedCase = data.results.find((r: { status: string }) => r.status !== "Accepted") as { status: string; error?: string } | undefined;
        const errorMsg = failedCase 
          ? `Verification failed: ${failedCase.status}`
          : "Verification failed: Discrepancy detected";
        toast.error(errorMsg, {
          description: failedCase?.error ? failedCase.error.slice(0, 100) + "..." : "Check your test cases and reference solution."
        });
      }
    } catch (err) {
      toast.error("Verification system error");
    } finally {
      setIsVerifying(false);
      toast.dismiss(loadingToast);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (!categories.includes(initialData.category)) {
        setValue("category", "Other");
        setCustomCategory(initialData.category);
      }
    }
  }, [initialData, reset, setValue]);

  const problemTitle = watch("title");
  const language = watch("language");
  const referenceSolution = watch("referenceSolution");
  const selectedCategory = watch("category");
  const problemSlug = watch("slug");
  const problemType = watch("problemType");
  const initialSchema = watch("initialSchema");
  const initialDataVal = watch("initialData");

  useEffect(() => {
    if (!isEditing && problemTitle) {
      setValue("slug", generateSlug(problemTitle));
    }
  }, [problemTitle, setValue, isEditing]);

  useEffect(() => {
    if (contestId) setValue("isPublic", false);
  }, [contestId, setValue]);

  const handleFormSubmit = async (data: ProblemFormData) => {
    setIsSubmitting(true);
    if (data.category === "Other" && !customCategory.trim()) {
      toast.error("Please specify the custom category.");
      setIsSubmitting(false);
      return;
    }
    const finalData = {
      ...data,
      category: data.category === "Other" ? customCategory.trim() : data.category,
    };
    try {
      await onSubmit(finalData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex flex-col ${hideHeader ? 'h-full' : 'h-screen'} bg-[var(--background)] text-[var(--foreground)] font-sans overflow-hidden`}>
      
      {/* 1. FORGE HEADER */}
      {!hideHeader && (
        <header className="h-14 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between px-6 shrink-0 z-50 shadow-sm">
           <div className="flex items-center gap-6">
              <button onClick={() => router.back()} className="p-2 hover:bg-[var(--foreground)]/5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all">
                 <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20 animate-pulse">
                    <LayoutTemplate size={16} className="text-[var(--primary)]" />
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)]">Problem Editor</span>
              </div>

              {verificationStatus && (
                 <>
                    <div className="h-4 w-px bg-[var(--border)]" />
                    <div className="flex items-center gap-2 select-none">
                       <div className={`w-1.5 h-1.5 rounded-full ${
                          verificationStatus === 'STABLE' ? "bg-[var(--viz-green)] shadow-[0_0_8px_rgba(34,197,94,0.4)]" : 
                          verificationStatus === 'VETTING' ? "bg-[var(--viz-gold)] shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "bg-[var(--foreground)]/20"
                       }`} />
                       <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Status: {verificationStatus}</span>
                       
                       {onUpdateStatus && (
                          <div className="flex items-center gap-2 ml-1">
                             {verificationStatus === 'DRAFT' && (
                                <button type="button" onClick={() => onUpdateStatus('VETTING')} className="text-[9px] font-black text-[var(--primary)] uppercase tracking-widest hover:underline ml-1">Submit for Vetting</button>
                             )}
                             {verificationStatus === 'VETTING' && (
                                <button type="button" onClick={() => onUpdateStatus('STABLE')} className="text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:underline ml-1">Mark as Stable</button>
                             )}
                             {verificationStatus !== 'DRAFT' && (
                                <button type="button" onClick={() => onUpdateStatus('DRAFT')} className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest hover:underline ml-1">Revert to Draft</button>
                             )}
                          </div>
                       )}
                    </div>
                 </>
              )}

              {collaboratorsCount !== undefined && onCollabClick && (
                 <>
                    <div className="h-4 w-px bg-[var(--border)]" />
                    <button type="button" onClick={onCollabClick} className="flex items-center gap-2 text-[10px] font-black text-[var(--muted-foreground)] uppercase hover:text-[var(--foreground)] transition-all">
                       <Users size={12} className="text-[var(--primary)]" />
                       Team: {collaboratorsCount}
                    </button>
                 </>
              )}
           </div>

           <div className="flex items-center gap-4">
              <button
                 type="button"
                 onClick={runVerification}
                 disabled={isVerifying}
                 className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-lg flex items-center gap-2 transition-all hover:bg-[var(--foreground)]/5 disabled:opacity-50 cursor-pointer"
              >
                 {isVerifying ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                 Verify Suite
              </button>

              <div className="h-4 w-px bg-[var(--border)] mx-2" />

              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${isEditing ? "bg-[var(--viz-gold)]/5 border-[var(--viz-gold)]/10 text-[var(--viz-gold)]" : "bg-[var(--primary)]/5 border-[var(--primary)]/10 text-[var(--primary)]"}`}>
                 <div className={`w-1 h-1 rounded-full ${isEditing ? "bg-[var(--viz-gold)]" : "bg-[var(--primary)]"}`} />
                 <span className="text-[9px] font-bold uppercase tracking-widest">{isEditing ? "Editing Mode" : "New Package"}</span>
              </div>
              <button
                 type="button"
                 onClick={handleSubmit(handleFormSubmit)}
                 disabled={isSubmitting}
                 className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--background)] bg-[var(--foreground)] rounded-lg flex items-center gap-2 transition-all hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                 {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : isEditing ? <Save size={14} /> : <PlusCircle size={14} />}
                 {isEditing ? "Save Changes" : "Create Package"}
              </button>
           </div>
        </header>
      )}

      <Split
        className="flex-1 flex min-h-0"
        sizes={hideHeader ? [100, 0] : [45, 55]}
        minSize={hideHeader ? 0 : 450}
        gutterSize={hideHeader ? 0 : 2}
        gutter={() => {
            const gutter = document.createElement('div');
            gutter.className = hideHeader ? 'hidden' : 'w-[2px] bg-[var(--background)] hover:bg-[var(--primary)]/40 transition-all cursor-col-resize z-50';
            return gutter;
        }}
      >
        {/* LEFT PANEL: SPECIFICATIONS */}
        <div className={`h-full flex flex-col ${hideHeader ? 'bg-transparent' : 'bg-[var(--background)] border-r border-[var(--border)]'} overflow-hidden`}>
          {/* Tabs */}
          {!onlyTab && (
            <div className="h-12 border-b border-[var(--border)] flex items-center gap-6 px-6 bg-[var(--card)] shrink-0">
              {[
                 { id: 'meta', label: 'Basic Info', icon: Target },
                 { id: 'context', label: 'Description', icon: FileText },
                 { id: 'setup', label: 'Settings', icon: SlidersHorizontal },
                 { id: 'intel', label: 'Hints & Editorial', icon: ShieldAlert },
              ].map(t => (
                 <button
                    key={t.id} type="button" onClick={() => setActiveTab(t.id as "meta" | "context" | "setup" | "intel")}
                    className={`relative h-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 px-1 transition-all ${activeTab === t.id ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
                 >
                    <t.icon size={14} className={activeTab === t.id ? "text-[var(--primary)]" : ""} />
                    {t.label}
                    {activeTab === t.id && (
                       <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]" />
                    )}
                 </button>
              ))}
            </div>
          )}

          <div className={`flex-1 ${onlyTab ? 'p-0' : 'p-8'} overflow-y-auto custom-scrollbar relative`}>
            <AnimatePresence mode="wait">
               {activeTab === 'meta' && (
                  <motion.div key="meta" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="space-y-10">
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Problem Title</label>
                        <input 
                           {...register("title", { required: true })}
                           placeholder="Enter problem title..."
                           className="w-full bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl py-4 px-6 text-xl font-bold text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]/50 transition-all"
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Problem Type</label>
                           <select 
                              {...register("problemType")}
                              className="w-full bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-bold text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]/50 appearance-none transition-all"
                           >
                              <option value="CODING">Coding Problem</option>
                              <option value="SQL">SQL Query</option>
                              <option value="SYSTEM_DESIGN">System Design</option>
                           </select>
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Difficulty</label>
                           <select 
                              {...register("difficulty")}
                              className="w-full bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-bold text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]/50 appearance-none transition-all"
                           >
                              {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                           </select>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Category</label>
                           <select 
                              {...register("category")}
                              className="w-full bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-bold text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]/50 appearance-none transition-all"
                           >
                              {categories.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>

                        {selectedCategory === "Other" && (
                           <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)] ml-1">Specify Category</label>
                              <input 
                                 value={customCategory}
                                 onChange={(e) => setCustomCategory(e.target.value)}
                                 placeholder="e.g. SegTree..."
                                 className="w-full bg-[var(--foreground)]/[0.02] border border-[var(--primary)]/20 rounded-xl py-3 px-4 text-sm font-bold text-[var(--foreground)] focus:outline-none transition-all"
                              />
                           </div>
                        )}
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">URL Slug</label>
                        <input 
                           {...register("slug", { required: true })} readOnly={isEditing}
                           className={`w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-3 px-4 text-xs font-mono text-[var(--muted-foreground)] ${isEditing ? 'opacity-40' : 'focus:border-[var(--primary)]/50'}`}
                        />
                     </div>

                     {!contestId && (
                        <div className="p-6 rounded-2xl bg-[var(--foreground)]/[0.01] border border-[var(--border)] flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${watch("isPublic") ? "bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)]" : "bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)]/30"}`}>
                                 <Zap size={14} fill={watch("isPublic") ? "currentColor" : "none"} />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-sm font-bold text-[var(--foreground)]">Public Visibility</span>
                                 <span className="text-[8px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">Available to all users</span>
                              </div>
                           </div>
                           <div className="relative inline-flex items-center h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none bg-[var(--foreground)]/5">
                              <input type="checkbox" {...register("isPublic")} className="sr-only peer" />
                              <div className="w-9 h-5 bg-[var(--muted)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--foreground)] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[var(--foreground)] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary)]" />
                           </div>
                        </div>
                     )}
                  </motion.div>
               )}

               {activeTab === 'context' && (
                  <motion.div key="context" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col space-y-6">
                     <div className="flex p-1 bg-[var(--foreground)]/5 rounded-xl w-fit border border-[var(--border)] shrink-0">
                        {[
                           { id: 'RICH_TEXT', label: 'Rich Text' },
                           { id: 'MARKDOWN', label: 'Markdown' },
                           { id: 'PDF', label: 'PDF' }
                        ].map(mode => (
                           <button
                              key={mode.id} type="button" onClick={() => setDescriptionMode(mode.id as "RICH_TEXT" | "MARKDOWN" | "PDF")}
                              className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${descriptionMode === mode.id ? "bg-[var(--foreground)] text-[var(--background)] shadow-lg" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
                           >
                              {mode.label}
                           </button>
                        ))}
                     </div>

                     <div className="flex-1 rounded-2xl overflow-hidden bg-[var(--foreground)]/[0.01] border border-[var(--border)] flex flex-col min-h-0">
                        {descriptionMode === "RICH_TEXT" && (
                           <Controller
                              name="description" control={control} rules={{ required: true }}
                              render={({ field }) => (
                                 <TiptapEditor description={field.value || ''} onChange={field.onChange} />
                              )}
                           />
                        )}

                        {descriptionMode === "MARKDOWN" && (
                           <div className="flex flex-col h-full min-h-0">
                              <div className="h-8 border-b border-[var(--border)] flex items-center justify-between px-4 bg-[var(--foreground)]/5 shrink-0">
                                 <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Markdown Editor</span>
                                 <button type="button" onClick={() => setMarkdownPreview(!markdownPreview)} className="text-[8px] font-bold uppercase tracking-widest text-[var(--primary)] hover:underline">
                                    {markdownPreview ? "Edit Mode" : "Preview Mode"}
                                 </button>
                              </div>
                              <div className="flex-1 min-h-0 relative">
                                 {markdownPreview ? (
                                    <div className="h-full p-6 overflow-y-auto custom-scrollbar prose prose-invert prose-sm max-w-none">
                                       <div dangerouslySetInnerHTML={{ __html: watch("description") }} />
                                       {/* Note: Ideally use a markdown parser here, but for now showing raw/tiptap html if stored as such */}
                                       <p className="text-[8px] text-[var(--muted-foreground)]/30 uppercase mt-10 tracking-widest italic">Previewing content</p>
                                    </div>
                                 ) : (
                                    <textarea 
                                       {...register("description")}
                                       className="w-full h-full bg-transparent p-6 font-mono text-sm text-[var(--muted-foreground)] focus:outline-none resize-none"
                                       placeholder="Write your problem statement in markdown..."
                                    />
                                 )}
                              </div>
                           </div>
                        )}

                        {descriptionMode === "PDF" && (
                           <div className="flex flex-col items-center justify-center h-full space-y-6 p-10 text-center">
                              <div className="w-16 h-16 rounded-3xl bg-[var(--primary)]/5 flex items-center justify-center border border-[var(--border)]">
                                 <Upload className="h-8 w-8 text-[var(--primary)] opacity-40" />
                              </div>
                              <div className="space-y-2">
                                 <h4 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-widest">Upload Problem PDF</h4>
                                 <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider leading-relaxed">Select a PDF file containing the problem description.</p>
                              </div>
                              <input 
                                 type="file" accept=".pdf" 
                                 onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                 className="hidden" id="pdf-upload" 
                              />
                              <label htmlFor="pdf-upload" className="px-8 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-all cursor-pointer">
                                 {pdfFile ? pdfFile.name : "Select PDF File"}
                              </label>
                              {pdfFile && (
                                 <button type="button" onClick={() => setPdfFile(null)} className="text-[8px] font-bold text-[var(--viz-red)] uppercase tracking-widest hover:underline">Remove File</button>
                              )}
                           </div>
                        )}
                     </div>
                  </motion.div>
               )}

               {activeTab === 'setup' && (
                  <motion.div key="setup" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="space-y-10">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Time Limit (s)</label>
                           <input 
                              type="number" step="0.1" {...register("timeLimit", { valueAsNumber: true })}
                              className="w-full bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]/50 transition-all"
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Memory Limit (MB)</label>
                           <input 
                              type="number" {...register("memoryLimit", { valueAsNumber: true })}
                              className="w-full bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]/50 transition-all"
                           />
                        </div>
                     </div>

                     {problemType === "SQL" && (
                        <div className="space-y-8">
                           <div className="flex flex-col gap-3">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Schema DDL</label>
                              <div className="h-[200px] rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--background)]">
                                 <Editor 
                                    language="sql" theme={resolvedTheme === 'dark' || resolvedTheme === 'batman' ? "vs-dark" : "light"} value={initialSchema}
                                    onChange={(v) => setValue("initialSchema", v || "")}
                                    options={{ minimap: { enabled: false }, fontSize: 12, padding: { top: 12 } }}
                                 />
                              </div>
                           </div>
                           <div className="flex flex-col gap-3">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Seed Data DML</label>
                              <div className="h-[200px] rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--background)]">
                                 <Editor 
                                    language="sql" theme={resolvedTheme === 'dark' || resolvedTheme === 'batman' ? "vs-dark" : "light"} value={initialDataVal}
                                    onChange={(v) => setValue("initialData", v || "")}
                                    options={{ minimap: { enabled: false }, fontSize: 12, padding: { top: 12 } }}
                                 />
                              </div>
                           </div>
                        </div>
                     )}
                  </motion.div>
               )}

               {activeTab === 'intel' && (
                  <motion.div key="intel" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="space-y-10">
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Hints</label>
                           <button type="button" onClick={() => setValue("hints", [...(watch("hints") || []), ""])} className="text-[9px] font-bold text-[var(--primary)] uppercase tracking-widest hover:opacity-80 flex items-center gap-1">
                              <PlusCircle size={12} /> Add Hint
                           </button>
                        </div>
                        <div className="space-y-3">
                           {(watch("hints") || []).map((h, i) => (
                              <div key={i} className="flex gap-3">
                                 <textarea 
                                    value={h} onChange={(e) => {
                                       const nh = [...getValues("hints")]; nh[i] = e.target.value; setValue("hints", nh);
                                    }}
                                    className="flex-1 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--muted-foreground)] focus:border-[var(--primary)]/30 transition-all resize-none"
                                 />
                                 <button onClick={() => setValue("hints", getValues("hints").filter((_, idx) => idx !== i))} className="p-2 text-[var(--viz-red)]/40 hover:text-[var(--viz-red)] transition-all rounded-lg self-start">
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-4 pt-10 border-t border-[var(--border)]">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Editorial</label>
                        <div className="rounded-xl overflow-hidden bg-[var(--foreground)]/[0.01] border border-[var(--border)] h-[300px]">
                           <Controller
                              name="editorial" control={control}
                              render={({ field }) => (
                                 <TiptapEditor description={field.value || ''} onChange={field.onChange} />
                              )}
                           />
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT PANEL: EDITOR & TESTS */}
        <Split
          direction="vertical"
          sizes={[60, 40]}
          minSize={200}
          gutterSize={2}
          gutter={() => {
               const gutter = document.createElement('div');
               gutter.className = 'w-[2px] bg-[var(--background)] hover:bg-[var(--primary)]/40 transition-all cursor-col-resize z-50';
               return gutter;
          }}
          className="flex flex-col h-full bg-[var(--background)]"
        >
          {/* EDITOR */}
          <div className="flex flex-col h-full min-h-0 bg-[var(--card)]">
            <div className="h-10 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[var(--card)] shrink-0 z-20">
               <div className="flex items-center gap-4 relative" ref={langDropdownRef}>
                  <button type="button" onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)] hover:bg-[var(--foreground)]/5 px-2 py-1 rounded-lg transition-all">
                     <Code2 size={12} className="text-[var(--primary)]" />
                     {languages.find(l => l.value === language)?.label || "Node_JS"}
                     <ChevronDown size={10} className={`opacity-40 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isLangOpen && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full left-0 mt-1 w-48 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden py-1 z-50">
                        {languages.map(l => (
                          <button key={l.value} type="button" onClick={() => { setValue("language", l.value); setValue("referenceSolution", getStarterCode(l.value)); setIsLangOpen(false); }} className={`w-full text-left px-4 py-2 text-[9px] font-bold uppercase flex items-center justify-between hover:bg-[var(--foreground)]/5 transition-all ${language === l.value ? "text-[var(--primary)] bg-[var(--primary)]/5" : "text-[var(--muted-foreground)]"}`}>
                             {l.label}
                             {language === l.value && <CheckCircle size={10} />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>

               <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setValue("referenceSolution", getStarterCode(language))} className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all"><RotateCcw size={14} /></button>
                  <div className="h-3 w-px bg-[var(--border)]" />
                  <span className="text-[9px] font-bold text-[var(--muted-foreground)]/30 uppercase tracking-widest">Reference Solution</span>
               </div>
            </div>

            <div className="flex-1 bg-[var(--background)] relative min-h-0">
               <Editor 
                  height="100%" language={problemType === "SQL" ? "sql" : language} 
                  theme={resolvedTheme === 'dark' || resolvedTheme === 'batman' ? "vs-dark" : "light"}
                  value={referenceSolution} onChange={(v) => setValue("referenceSolution", v || "")}
                  options={{
                    minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false,
                    automaticLayout: true, padding: { top: 16, bottom: 16 },
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
               />
            </div>
          </div>

          {/* TESTS */}
          <div className="flex-1 flex flex-col min-h-0 bg-[var(--background)] p-6 overflow-y-auto custom-scrollbar">
             {problemType === "SYSTEM_DESIGN" ? (
                <div className="flex flex-col items-center justify-center h-full text-[var(--muted-foreground)]/30 text-center p-8 space-y-4">
                   <LayoutTemplate size={24} />
                   <p className="text-[9px] font-bold uppercase tracking-widest">No executable tests for design modules.</p>
                </div>
             ) : (
                <div className="space-y-10">
                   <TestCaseEditor
                      name="examplesInput" label="Public Examples" showOutputs={true}
                      control={control} register={register} hideInput={problemType === "SQL"}
                   />
                   <div className="h-px w-full bg-[var(--border)]" />
                   <TestCaseEditor
                      name="testCasesInput" label="Hidden Test Cases" showOutputs={false}
                      control={control} register={register}
                   />
                </div>
             )}
          </div>
        </Split>
      </Split>
      
      <style jsx global>{`
         .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
      `}</style>
    </div>
  );
}
