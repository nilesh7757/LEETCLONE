"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import Split from "react-split";
import Editor from "@monaco-editor/react";
import { AnimatePresence, motion } from "framer-motion";

import { PlusCircle, Trash2, Code, FileText, LayoutTemplate, SlidersHorizontal, ListChecks, Hash, BookOpen, ChevronLeft, Clock, HardDrive, Save, Code2, ChevronDown, CheckCircle, Wand2, Loader2, AlertCircle, RotateCcw, Settings, Play, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { languages, getStarterCode } from "@/lib/starterCode";

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
  editorial: string; // Added editorial
  hints: string[]; // Added hints
  examplesInput: TestCase[];
  testCasesInput: TestCase[];
  referenceSolution: string;
  initialSchema: string; // Added initialSchema
  initialData: string; // Added initialData
  language: string;
  timeLimit: number;
  memoryLimit: number;
  isPublic: boolean;
  problemType: "CODING" | "SHELL" | "INTERACTIVE" | "SYSTEM_DESIGN" | "SQL"; // Added SQL
}

interface ProblemFormProps {
  initialData?: ProblemFormData;
  onSubmit: (data: ProblemFormData) => Promise<void>;
  isEditing?: boolean;
  contestId?: string | null;
}

const difficulties = ["Easy", "Medium", "Hard"];
const categories = ["Arrays", "Strings", "Trees", "Graphs", "Dynamic Programming", "Other"];

export default function ProblemForm({ initialData, onSubmit, isEditing = false, contestId }: ProblemFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingEditorial, setIsGeneratingEditorial] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "editorial" | "sql_setup">("details"); // Added sql_setup tab
  const editorConsoleSplitRef = useRef<any>(null);
  const [syntaxError, setSyntaxError] = useState<string | null>(null); // Declare syntaxError

  // Language Dropdown State
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const { resolvedTheme } = useTheme();
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
      editorial: "", // Default empty
      hints: [], // Default empty hints
      examplesInput: [],
      testCasesInput: [],
      referenceSolution: getStarterCode("javascript"),
      initialSchema: "CREATE TABLE Users (id INTEGER PRIMARY KEY, name TEXT);",
      initialData: "INSERT INTO Users (id, name) VALUES (1, 'Alice');",
      language: "javascript",
      timeLimit: 2,
      memoryLimit: 256,
      isPublic: false,
      problemType: "CODING", // Default problem type
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const problemTitle = watch("title");
  const language = watch("language");
  const referenceSolution = watch("referenceSolution");
  const selectedCategory = watch("category");
  const problemSlug = watch("slug"); // Watch slug for API call
  const problemType = watch("problemType"); // Watch problemType
  const initialSchema = watch("initialSchema");
  const initialDataVal = watch("initialData");

  useEffect(() => {
    if (!isEditing && problemTitle) {
      setValue("slug", generateSlug(problemTitle));
    }
  }, [problemTitle, setValue, isEditing]);

  // Force isPublic to false if contestId is present
  useEffect(() => {
    if (contestId) {
      setValue("isPublic", false);
    }
  }, [contestId, setValue]);

  // Handle category other
  useEffect(() => {
    if (initialData && !categories.includes(initialData.category)) {
      setValue("category", "Other");
      setCustomCategory(initialData.category);
    }
  }, [initialData, setValue]);

  const handleGenerateEditorial = async () => {
    if (!isEditing) {
      toast.error("Please save the problem first to generate an editorial.");
      return;
    }
    const currentSolution = getValues("referenceSolution");
    if (!currentSolution) {
      toast.error("Please provide a reference solution first.");
      return;
    }

    setIsGeneratingEditorial(true);
    toast.info("Generating editorial with AI... This may take a minute.");

    try {
      const { data } = await axios.post(`/api/problems/${problemSlug}/generate-editorial`, {
        language: getValues("language")
      });
      setValue("editorial", data.editorial);
      toast.success("Editorial generated successfully!");
    } catch (error: any) {
      console.error("Editorial generation error:", error);
      toast.error(error.response?.data?.error || "Failed to generate editorial.");
    } finally {
      setIsGeneratingEditorial(false);
    }
  };

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
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[var(--card)]/50 backdrop-blur-md shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[var(--foreground)]/5 rounded-xl transition-all text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="h-4 w-px bg-[var(--border)]" />
          <h1 className="font-bold text-sm tracking-tight text-[var(--foreground)] uppercase tracking-widest">{isEditing ? "Modify Module" : "New Problem Protocol"}</h1>
        </div>
        <button
          type="button"
          onClick={handleSubmit(handleFormSubmit)}
          disabled={isSubmitting}
          className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-gradient-to-r from-[var(--viz-cyan)] to-[var(--viz-blue)] rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-[var(--viz-cyan)]/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isEditing ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          {isEditing ? "Push Changes" : "Establish Module"}
        </button>
      </div>

      <Split
        className="flex-1 flex overflow-hidden"
        sizes={[50, 50]}
        minSize={400}
        gutterSize={6}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
      >
        {/* Left Panel: Details & Editorial Tabs */}
        <div className="h-full flex flex-col bg-[var(--card)]/20 overflow-hidden border-r border-[var(--border)]">
          {/* Tabs */}
          <div className="h-11 border-b border-[var(--border)] flex items-center gap-1 px-3 bg-[var(--card)]/30 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'details' ? "bg-[var(--viz-cyan)]/10 text-[var(--viz-cyan)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
            >
              <FileText className="w-3.5 h-3.5" /> Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('editorial')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'editorial' ? "bg-[var(--viz-purple)]/10 text-[var(--viz-purple)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Editorial
            </button>
            {problemType === "SQL" && (
              <button
                type="button"
                onClick={() => setActiveTab('sql_setup')}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'sql_setup' ? "bg-[var(--viz-amber)]/10 text-[var(--viz-amber)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
              >
                <HardDrive className="w-3.5 h-3.5" /> SQL Config
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar relative">
            {activeTab === 'details' ? (
              <form className="space-y-10">
                {/* Problem Title */}
                <div className="space-y-2">
                  <label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                    Identification Title
                  </label>
                  <div className="relative group">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--viz-cyan)] transition-colors" />
                    <input
                      id="title"
                      type="text"
                      {...register("title", { required: "Problem title is required" })}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--card)]/50 border-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/40 focus:ring-2 focus:ring-[var(--viz-cyan)]/20 outline-none transition-all shadow-inner"
                      placeholder="e.g., Two Sum"
                    />
                    {errors.title && (
                      <p className="text-[var(--viz-red)] text-[10px] font-bold mt-1 ml-1 uppercase">{errors.title.message}</p>
                    )}
                  </div>
                </div>

                {/* Problem Slug and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label htmlFor="slug" className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                      Resource URI Slug
                    </label>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--viz-cyan)] transition-colors" />
                      <input
                        id="slug"
                        type="text"
                        readOnly={isEditing}
                        {...register("slug", { required: "Problem slug is required" })}
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--card)]/50 border-none text-[var(--foreground)]/80 focus:ring-2 focus:ring-[var(--viz-cyan)]/20 outline-none transition-all shadow-inner ${isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                        placeholder="e.g., two-sum (auto-generated)"
                      />
                      {errors.slug && (
                        <p className="text-[var(--viz-red)] text-[10px] font-bold mt-1 ml-1 uppercase">{errors.slug.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="problemType" className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                      Computational Logic Type
                    </label>
                    <div className="relative group">
                      <LayoutTemplate className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--viz-cyan)] transition-colors" />
                      <select
                        id="problemType"
                        {...register("problemType", { required: "Problem type is required" })}
                        className="w-full pl-12 pr-10 py-4 rounded-2xl bg-[var(--card)]/50 border-none text-[var(--foreground)] focus:ring-2 focus:ring-[var(--viz-cyan)]/20 outline-none transition-all shadow-inner appearance-none"
                      >
                        <option value="CODING">Coding Core</option>
                        <option value="SQL">Structured Query (SQL)</option>
                        <option value="SYSTEM_DESIGN">Architecture (System Design)</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
                      {errors.problemType && (
                        <p className="text-[var(--viz-red)] text-[10px] font-bold mt-1 ml-1 uppercase">{errors.problemType.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Difficulty and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label htmlFor="difficulty" className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                      Complexity Grade
                    </label>
                    <div className="relative group">
                      <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--viz-cyan)] transition-colors" />
                      <select
                        id="difficulty"
                        {...register("difficulty", { required: "Difficulty is required" })}
                        className="w-full pl-12 pr-10 py-4 rounded-2xl bg-[var(--card)]/50 border-none text-[var(--foreground)] focus:ring-2 focus:ring-[var(--viz-cyan)]/20 outline-none transition-all shadow-inner appearance-none"
                      >
                        {difficulties.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
                      {errors.difficulty && (
                        <p className="text-[var(--viz-red)] text-[10px] font-bold mt-1 ml-1 uppercase">{errors.difficulty.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                      Logical Taxonomy
                    </label>
                    <div className="relative group">
                      <ListChecks className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--viz-cyan)] transition-colors" />
                      <select
                        id="category"
                        {...register("category", { required: "Category is required" })}
                        className="w-full pl-12 pr-10 py-4 rounded-2xl bg-[var(--card)]/50 border-none text-[var(--foreground)] focus:ring-2 focus:ring-[var(--viz-cyan)]/20 outline-none transition-all shadow-inner appearance-none"
                      >
                        {categories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
                      {errors.category && (
                        <p className="text-[var(--viz-red)] text-[10px] font-bold mt-1 ml-1 uppercase">{errors.category.message}</p>
                      )}
                    </div>
                    {selectedCategory === "Other" && (
                      <div className="mt-3">
                        <input
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="Specify Taxonomy..."
                          className="w-full px-4 py-4 rounded-2xl bg-[var(--card)]/50 border-none text-[var(--foreground)] focus:ring-2 focus:ring-[var(--viz-cyan)]/20 outline-none transition-all shadow-inner"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Visibility - Conditional Render */}
                {!contestId && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                      Privacy Protocol
                    </label>
                    <label className="flex items-center gap-4 p-6 rounded-[2rem] bg-[var(--card)]/30 cursor-pointer hover:bg-[var(--card)]/50 transition-all group">
                      <div className="relative flex items-center">
                        <input
                          id="isPublic"
                          type="checkbox"
                          {...register("isPublic")}
                          className="w-6 h-6 rounded-lg appearance-none bg-[var(--card)] border-none checked:bg-[var(--viz-green)] transition-all cursor-pointer shadow-inner"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white font-bold opacity-0 check-icon">
                          ✓
                        </div>
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-[var(--foreground)]">Broadcast Publicly</span>
                        <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-tight">
                          Authorize full indexation and global visibility
                        </p>
                      </div>
                    </label>
                  </div>
                )}
                {contestId && (
                  <input type="hidden" {...register("isPublic")} value="false" />
                )}

                {/* Time Limit and Memory Limit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label htmlFor="timeLimit" className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                      Execution Timeout (Sec)
                    </label>
                    <div className="relative group">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--viz-cyan)] transition-colors" />
                      <input
                        id="timeLimit"
                        type="number"
                        {...register("timeLimit", { required: "Time limit is required", valueAsNumber: true, min: 0.1 })}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--card)]/50 border-none text-[var(--foreground)] focus:ring-2 focus:ring-[var(--viz-cyan)]/20 outline-none transition-all shadow-inner"
                        placeholder="e.g., 2"
                        step="0.1"
                      />
                      {errors.timeLimit && (
                        <p className="text-[var(--viz-red)] text-[10px] font-bold mt-1 ml-1 uppercase">{errors.timeLimit.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="memoryLimit" className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                      Buffer Capacity (MB)
                    </label>
                    <div className="relative group">
                      <HardDrive className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--viz-cyan)] transition-colors" />
                      <input
                        id="memoryLimit"
                        type="number"
                        {...register("memoryLimit", { required: "Memory limit is required", valueAsNumber: true, min: 1 })}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--card)]/50 border-none text-[var(--foreground)] focus:ring-2 focus:ring-[var(--viz-cyan)]/20 outline-none transition-all shadow-inner"
                        placeholder="e.g., 256"
                      />
                      {errors.memoryLimit && (
                        <p className="text-[var(--viz-red)] text-[10px] font-bold mt-1 ml-1 uppercase">{errors.memoryLimit.message}</p>
                      )}
                    </div>
                  </div>
                </div>


                {/* Problem Description (Rich Text Editor) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                    Contextual Specification
                  </label>
                  <div className="rounded-[2rem] overflow-hidden bg-[var(--card)]/30 border border-[var(--border)] p-1">
                    <Controller
                      name="description"
                      control={control}
                      rules={{ required: "Problem description is required" }}
                      render={({ field }) => (
                        <TiptapEditor
                          description={field.value || ''}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                  {errors.description && (
                    <p className="text-[var(--viz-red)] text-[10px] font-bold mt-1 ml-1 uppercase">{errors.description.message}</p>
                  )}
                </div>

                {/* Hints Section */}
                <div className="space-y-6 pt-10 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                      Progressive Heuristics (Hints)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const currentHints = getValues("hints") || [];
                        setValue("hints", [...currentHints, ""]);
                      }}
                      className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 bg-[var(--viz-blue)]/10 text-[var(--viz-blue)] rounded-xl hover:bg-[var(--viz-blue)]/20 transition-all flex items-center gap-2"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Inject Hint
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {(watch("hints") || []).map((hint, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex-1 relative group">
                          <span className="absolute left-4 top-5 text-[10px] font-black text-[var(--muted-foreground)]/30 group-focus-within:text-[var(--viz-blue)] transition-colors">{idx + 1}</span>
                          <textarea
                            value={hint}
                            onChange={(e) => {
                              const newHints = [...getValues("hints")];
                              newHints[idx] = e.target.value;
                              setValue("hints", newHints);
                            }}
                            placeholder={`Define hint ${idx + 1}...`}
                            className="w-full pl-10 pr-4 py-4 bg-[var(--card)]/30 border border-transparent focus:border-[var(--viz-blue)]/20 rounded-2xl text-sm text-[var(--foreground)] outline-none min-h-[80px] resize-none transition-all shadow-inner"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newHints = getValues("hints").filter((_, i) => i !== idx);
                            setValue("hints", newHints);
                          }}
                          className="p-3 bg-red-500/5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all self-start"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    {(!watch("hints") || watch("hints").length === 0) && (
                      <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest text-center py-6 opacity-30">No heuristics defined for this module.</p>
                    )}
                  </div>
                </div>
              </form>
            ) : activeTab === 'sql_setup' ? (
              // SQL Setup Tab
              <div className="space-y-10 h-full flex flex-col">
                 <div className="flex flex-col h-1/2 space-y-3">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Initial Schema Configuration (DDL)</h3>
                   <div className="flex-1 rounded-3xl overflow-hidden bg-[var(--card)]/20 border border-[var(--border)] relative">
                      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
                      <Editor
                        language="sql"
                        theme={mounted && resolvedTheme === "dark" ? "vs-dark" : "light"}
                        value={initialSchema}
                        onChange={(val) => setValue("initialSchema", val || "")}
                        options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 16 } }}
                      />
                   </div>
                 </div>
                 <div className="flex flex-col h-1/2 space-y-3">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Baseline Data Ingestion (DML)</h3>
                   <div className="flex-1 rounded-3xl overflow-hidden bg-[var(--card)]/20 border border-[var(--border)] relative">
                      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
                      <Editor
                        language="sql"
                        theme={mounted && resolvedTheme === "dark" ? "vs-dark" : "light"}
                        value={initialDataVal}
                        onChange={(val) => setValue("initialData", val || "")}
                        options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 16 } }}
                      />
                   </div>
                 </div>
              </div>
            ) : (
              // Editorial Tab
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-4 bg-[var(--viz-purple)]/5 p-6 rounded-3xl border border-[var(--viz-purple)]/10">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight">Technical Editorial</h3>
                    <p className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-widest">Synthesize solution patterns with Groq Intelligence</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateEditorial}
                    disabled={isGeneratingEditorial || !isEditing}
                    className="px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-purple-600 text-white rounded-[1.5rem] hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 transition-all shadow-xl shadow-purple-600/20 active:scale-95"
                  >
                    {isGeneratingEditorial ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    Generate Synthesis
                  </button>
                </div>

                <div className="rounded-[2.5rem] overflow-hidden bg-[var(--card)]/30 border border-[var(--border)] p-1">
                  <Controller
                    name="editorial"
                    control={control}
                    render={({ field }) => (
                      <TiptapEditor
                        description={field.value || ''}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Reference Solution Editor and Test Cases */}
        <Split
          direction="vertical"
          sizes={[70, 30]}
          minSize={0}
          gutterSize={6}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          className="flex flex-col bg-[var(--background)] h-full"
        >
          {problemType === "CODING" || problemType === "SQL" ? (
            <div className="flex flex-col h-full min-h-0 bg-[var(--card)]/10">
              <div className="h-11 border-b border-[var(--border)] flex items-center justify-between px-4 bg-[var(--card)]/30 shrink-0 z-20">
                {problemType === "CODING" && (
                  <div className="relative" ref={langDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsLangOpen(!isLangOpen)}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] hover:text-[var(--foreground)]/80 transition-all px-3 py-1.5 rounded-lg hover:bg-[var(--foreground)]/5 cursor-pointer"
                    >
                      <Code2 className="w-4 h-4 text-[var(--viz-cyan)]" />
                      {languages.find(l => l.value === language)?.label}
                      <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isLangOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.1 }}
                          className="absolute top-full left-0 mt-2 w-52 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden py-2 z-50 backdrop-blur-xl"
                        >
                          {languages.map((lang) => (
                            <button
                              type="button"
                              key={lang.value}
                              onClick={() => {
                                setValue("language", lang.value);
                                setValue("referenceSolution", getStarterCode(lang.value));
                                setIsLangOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer ${language === lang.value ? "text-[var(--viz-cyan)] bg-[var(--viz-cyan)]/5" : "text-[var(--foreground)]"
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
                {problemType === "SQL" && (
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] px-3 py-1.5">
                      <HardDrive className="w-4 h-4 text-[var(--viz-amber)]" /> Query Buffer
                   </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 hover:bg-[var(--foreground)]/5 rounded-lg transition-all text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                    title="Reset Code"
                    onClick={() => setValue("referenceSolution", getStarterCode(problemType === "SQL" ? "sql" : language) || "")}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 hover:bg-[var(--foreground)]/5 rounded-lg transition-all text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 relative min-h-0 bg-[var(--background)]">
                <Editor
                  height="100%"
                  language={problemType === "SQL" ? "sql" : language}
                  theme={mounted && resolvedTheme === "dark" ? "vs-dark" : mounted && resolvedTheme === "cream" ? "cream" : "light"}
                  beforeMount={handleEditorWillMount}
                  value={referenceSolution}
                  onChange={(value) => setValue("referenceSolution", value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 20, bottom: 20 },
                    renderValidationDecorations: "on",
                    fontFamily: "'JetBrains Mono', monospace",
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                  }}
                />
              </div>
            </div>
          ) : problemType === "SYSTEM_DESIGN" ? (
             <div className="flex flex-col h-full min-h-0 bg-[var(--background)] p-8 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Blueprint Specification (Ideal Answer)</h3>
                   <button
                      type="button"
                      className="p-2 hover:bg-[var(--foreground)]/5 rounded-lg transition-all text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                      title="Reset"
                      onClick={() => setValue("referenceSolution", "")}
                   >
                      <RotateCcw className="w-4 h-4" />
                   </button>
                </div>
                <div className="rounded-[2.5rem] overflow-hidden bg-[var(--card)]/30 border border-[var(--border)] p-1">
                  <Controller
                    name="referenceSolution"
                    control={control}
                    render={({ field }) => (
                        <TiptapEditor
                          description={field.value || ''}
                          onChange={field.onChange}
                        />
                    )}
                  />
                </div>
             </div>
          ) : (
            <div className="flex flex-col h-full min-h-0 justify-center items-center text-[var(--muted-foreground)] p-12 text-center">
              <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">Interface Unavailable</p>
              <p className="text-[10px] uppercase tracking-tighter mt-1">Select a valid logic type to initialize editor.</p>
            </div>
          )}

          {/* Bottom section of right panel: Test Case Editors */}
          <div className="flex flex-col h-full bg-[var(--card)]/5 min-h-0 overflow-y-auto p-8 space-y-8 custom-scrollbar relative">
            {(problemType as any) === "SYSTEM_DESIGN" ? (
               <div className="flex flex-col items-center justify-center h-full text-[var(--muted-foreground)] text-center p-8 opacity-40">
                  <LayoutTemplate className="w-12 h-12 mb-4 stroke-1" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Architecture Assessment Mode</p>
                  <p className="text-[9px] font-bold uppercase tracking-tighter mt-2 max-w-[250px]">
                    Inputs/Outputs are non-applicable. Neural analysis will evaluate textual specifications.
                  </p>
               </div>
            ) : problemType === "SQL" ? (
               <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4 bg-[var(--viz-cyan)]/5 p-4 rounded-2xl border border-[var(--viz-cyan)]/10">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">Oracle Validation</p>
                        <p className="text-[9px] text-[var(--muted-foreground)] font-bold uppercase tracking-tighter">Define the target dataset schema</p>
                     </div>
                     <button
                        type="button"
                        onClick={async () => {
                           const loadingToast = toast.loading("Executing SQL...");
                           try {
                              const res = await axios.post("/api/run", {
                                 type: "SQL",
                                 code: getValues("referenceSolution"),
                                 initialSchema: getValues("initialSchema"),
                                 initialData: getValues("initialData"),
                                 testCases: []
                              });
                              
                              if (res.data.results && res.data.results.length > 0) {
                                 const output = res.data.results[0].actual;
                                 if (res.data.results[0].status !== "Accepted") {
                                    toast.error("Execution Error: " + (res.data.results[0].error || "Unknown"));
                                 } else {
                                    setValue("examplesInput", [{ input: "", output: output }]);
                                    toast.success("Oracle signal received!");
                                 }
                              }
                           } catch (e: any) {
                              toast.error("Oracle Failure: " + e.message);
                           } finally {
                              toast.dismiss(loadingToast);
                           }
                        }}
                        className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-[var(--viz-cyan)] text-white rounded-xl hover:bg-[var(--viz-cyan)]/90 transition-all shadow-lg shadow-[var(--viz-cyan)]/20 flex items-center gap-2"
                     >
                        <Play className="w-3.5 h-3.5 fill-current" /> Synchronize
                     </button>
                  </div>
                  <Controller
                    name="examplesInput"
                    control={control}
                    rules={{
                       validate: (value) => {
                          if (value.length === 0) return "Oracle requires at least one target result.";
                          if (value.some(tc => !tc.output?.trim())) return "Output buffer cannot be empty.";
                          return true;
                       }
                    }}
                    render={({ field }) => (
                      <TestCaseEditor
                        name={field.name}
                        label="Target Dataset (Oracle Result)"
                        showOutputs={true}
                        control={control}
                        register={register}
                        hideInput={true}
                      />
                    )}
                  />
               </div>
            ) : (
              <div className="space-y-8">
                                <Controller
                                  name="examplesInput"
                                  control={control}
                                  rules={{
                                    validate: (value) => {
                                       if ((problemType as any) === "SYSTEM_DESIGN") return true;
                                       if (value.length === 0) return "At least one example test case is required";
                                       if (value.some(tc => !tc.input.trim() || !tc.output.trim())) return "Input and Output cannot be blank for example test cases.";
                                       return true;
                                    },
                                  }}
                                  render={({ field }) => (
                                    <TestCaseEditor
                                      name={field.name}
                                      label="Public Test Vectors (Examples)"
                                      showOutputs={true}
                                      control={control}
                                      register={register}
                                    />
                                  )}
                                />
                                {errors.examplesInput && (
                                  <p className="text-[var(--viz-red)] text-[10px] font-bold mt-1 ml-1 uppercase">{errors.examplesInput.message}</p>
                                )}
                
                                            {(
                                              <Controller
                                                name="testCasesInput"
                                                control={control}
                                                rules={{
                                                  validate: (value) => {
                                                    if ((problemType as any) === "SYSTEM_DESIGN") return true;
                                                    return value.length > 0 || "At least one hidden test case is required";
                                                  }
                                                }}
                                                render={({ field }) => (
                                                  <TestCaseEditor
                                                    name={field.name}
                                                    label="Encrypted Validation Vectors (Hidden)"
                                                    showOutputs={false}
                                                    control={control}
                                                    register={register}
                                                  />
                                                )}
                                              />
                                            )}
                                            {errors.testCasesInput && (
                                              <p className="text-[var(--viz-red)] text-[10px] font-bold mt-1 ml-1 uppercase">{errors.testCasesInput.message}</p>
                                            )}
                              </div>
            )}
            
            {syntaxError && (
              <div className="flex items-center gap-2 text-[var(--viz-red)] text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-[var(--viz-red)]/10 rounded-xl animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="truncate">Syntax Anomaly Detected</span>
              </div>
            )}
          </div>
        </Split>
      </Split>
    </div>
  );
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with single dash
    .replace(/^-+|-+$/g, ""); // Remove dashes from start/end
}

function Loader() {
  return (
    <div className="flex items-center justify-center space-x-2 text-[var(--foreground)]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-4 h-4 border-2 border-[var(--foreground)]/50 border-t-[var(--foreground)] rounded-full"
      />
      <span>Loading...</span>
    </div>
  );
}