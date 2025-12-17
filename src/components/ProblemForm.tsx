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

import { PlusCircle, Trash2, Code, FileText, LayoutTemplate, SlidersHorizontal, ListChecks, Hash, BookOpen, ChevronLeft, Clock, HardDrive, Save, Code2, ChevronDown, CheckCircle, Wand2, Loader2, AlertCircle, RotateCcw, Settings, Play } from "lucide-react";
import { useTheme } from "next-themes";
import { languages, getStarterCode } from "@/lib/starterCode";

import TiptapEditor from "@/components/TiptapEditor";
import TestCaseEditor from "@/components/TestCaseEditor";

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
    formState: { errors },
  } = useForm<ProblemFormData>({
    defaultValues: initialData || {
      title: "",
      slug: "",
      difficulty: difficulties[0],
      category: categories[0],
      description: "",
      editorial: "", // Default empty
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
    <div className="flex flex-col h-full">
      <div className="h-14 border-b border-[var(--card-border)] flex items-center justify-between px-4 bg-[var(--card-bg)] shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-[var(--foreground)]/5 rounded-md transition-colors text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-[var(--foreground)]">{isEditing ? "Edit Problem" : "Create New Problem"}</span>
        </div>
        <button
          type="button"
          onClick={handleSubmit(handleFormSubmit)}
          disabled={isSubmitting}
          className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-green-900/20 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? <Loader /> : isEditing ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          {isEditing ? "Save Changes" : "Create Problem"}
        </button>
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
        {/* Left Panel: Details & Editorial Tabs */}
        <div className="h-full flex flex-col bg-[var(--background)] overflow-hidden">
          {/* Tabs */}
          <div className="h-10 border-b border-[var(--card-border)] flex items-center gap-1 px-2 bg-[var(--card-bg)] shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-colors cursor-pointer ${activeTab === 'details' ? "bg-[var(--foreground)]/10 text-[var(--foreground)]" : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}
            >
              <FileText className="w-3.5 h-3.5" /> Problem Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('editorial')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-colors cursor-pointer ${activeTab === 'editorial' ? "bg-[var(--foreground)]/10 text-[var(--foreground)]" : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Editorial
            </button>
            {problemType === "SQL" && (
              <button
                type="button"
                onClick={() => setActiveTab('sql_setup')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-colors cursor-pointer ${activeTab === 'sql_setup' ? "bg-[var(--foreground)]/10 text-[var(--foreground)]" : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}
              >
                <HardDrive className="w-3.5 h-3.5" /> SQL Setup
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'details' ? (
              <form className="space-y-6">
                {/* Problem Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
                    Problem Title
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/60" />
                    <input
                      id="title"
                      type="text"
                      {...register("title", { required: "Problem title is required" })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none"
                      placeholder="e.g., Two Sum"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                    )}
                  </div>
                </div>

                {/* Problem Slug */}
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
                    Problem Slug
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/60" />
                    <input
                      id="slug"
                      type="text"
                      readOnly={isEditing}
                      {...register("slug", { required: "Problem slug is required" })}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-[var(--foreground)]/80 focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none ${isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                      placeholder="e.g., two-sum (auto-generated)"
                    />
                    {errors.slug && (
                      <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>
                    )}
                  </div>
                </div>

                {/* Problem Type */}
                <div>
                  <label htmlFor="problemType" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
                    Problem Type
                  </label>
                  <div className="relative">
                    <LayoutTemplate className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/60" />
                    <select
                      id="problemType"
                      {...register("problemType", { required: "Problem type is required" })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none appearance-none"
                    >
                      <option value="CODING">Coding</option>
                      <option value="SQL">SQL</option>
                      <option value="SYSTEM_DESIGN">System Design</option>
                      {/* Add other types as they are implemented */}
                    </select>
                    {errors.problemType && (
                      <p className="text-red-500 text-xs mt-1">{errors.problemType.message}</p>
                    )}
                  </div>
                </div>

                {/* Difficulty and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
                      Difficulty
                    </label>
                    <div className="relative">
                      <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/60" />
                      <select
                        id="difficulty"
                        {...register("difficulty", { required: "Difficulty is required" })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none appearance-none"
                      >
                        {difficulties.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      {errors.difficulty && (
                        <p className="text-red-500 text-xs mt-1">{errors.difficulty.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
                      Category
                    </label>
                    <div className="relative">
                      <ListChecks className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/60" />
                      <select
                        id="category"
                        {...register("category", { required: "Category is required" })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none appearance-none"
                      >
                        {categories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
                      )}
                    </div>
                    {selectedCategory === "Other" && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="Enter custom category"
                          className="w-full px-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Visibility - Conditional Render */}
                {!contestId && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
                      Visibility
                    </label>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50">
                      <input
                        id="isPublic"
                        type="checkbox"
                        {...register("isPublic")}
                        className="w-5 h-5 rounded border-gray-300 text-[var(--accent-gradient-to)] focus:ring-[var(--accent-gradient-to)]"
                      />
                      <label htmlFor="isPublic" className="text-sm text-[var(--foreground)] cursor-pointer select-none">
                        Make this problem <span className="font-bold">Public</span>?
                        <p className="text-xs text-[var(--foreground)]/50 font-normal">
                          Uncheck to keep it Private.
                        </p>
                      </label>
                    </div>
                  </div>
                )}
                {contestId && (
                  <input type="hidden" {...register("isPublic")} value="false" />
                )}

                {/* Time Limit and Memory Limit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="timeLimit" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
                      Time Limit (seconds)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/60" />
                      <input
                        id="timeLimit"
                        type="number"
                        {...register("timeLimit", { required: "Time limit is required", valueAsNumber: true, min: 0.1 })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none"
                        placeholder="e.g., 2"
                        step="0.1"
                      />
                      {errors.timeLimit && (
                        <p className="text-red-500 text-xs mt-1">{errors.timeLimit.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="memoryLimit" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
                      Memory Limit (MB)
                    </label>
                    <div className="relative">
                      <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/60" />
                      <input
                        id="memoryLimit"
                        type="number"
                        {...register("memoryLimit", { required: "Memory limit is required", valueAsNumber: true, min: 1 })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none"
                        placeholder="e.g., 256"
                      />
                      {errors.memoryLimit && (
                        <p className="text-red-500 text-xs mt-1">{errors.memoryLimit.message}</p>
                      )}
                    </div>
                  </div>
                </div>


                {/* Problem Description (Rich Text Editor) */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
                    Problem Description (Rich Text Editor)
                  </label>
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
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                  )}
                </div>
              </form>
            ) : activeTab === 'sql_setup' ? (
              // SQL Setup Tab
              <div className="space-y-6 h-full flex flex-col">
                 <div className="flex flex-col h-1/2">
                   <h3 className="text-sm font-medium text-[var(--foreground)]/70 mb-2">Initial Schema (CREATE TABLE)</h3>
                   <div className="flex-1 rounded-lg overflow-hidden border border-[var(--card-border)]">
                      <Editor
                        language="sql"
                        theme={mounted && resolvedTheme === "dark" ? "vs-dark" : "light"}
                        value={initialSchema}
                        onChange={(val) => setValue("initialSchema", val || "")}
                        options={{ minimap: { enabled: false }, fontSize: 13 }}
                      />
                   </div>
                 </div>
                 <div className="flex flex-col h-1/2">
                   <h3 className="text-sm font-medium text-[var(--foreground)]/70 mb-2">Initial Data (INSERT INTO)</h3>
                   <div className="flex-1 rounded-lg overflow-hidden border border-[var(--card-border)]">
                      <Editor
                        language="sql"
                        theme={mounted && resolvedTheme === "dark" ? "vs-dark" : "light"}
                        value={initialDataVal}
                        onChange={(val) => setValue("initialData", val || "")}
                        options={{ minimap: { enabled: false }, fontSize: 13 }}
                      />
                   </div>
                 </div>
              </div>
            ) : (
              // Editorial Tab
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--foreground)]/70">Problem Editorial</h3>
                    <p className="text-xs text-[var(--foreground)]/50">Explain the solution and provide code in multiple languages.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateEditorial}
                    disabled={isGeneratingEditorial || !isEditing}
                    className="px-3 py-1.5 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                  >
                    {isGeneratingEditorial ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    Generate with AI
                  </button>
                </div>

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
            )}
          </div>
        </div>

        {/* Right Panel: Reference Solution Editor and Test Cases */}
        <Split
          direction="vertical"
          sizes={[70, 30]} // Example split: 70% for editor, 30% for test cases
          minSize={0}
          gutterSize={8}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          className="flex flex-col bg-[var(--background)] h-full"
        >
          {problemType === "CODING" || problemType === "SQL" ? (
            <div className="flex flex-col h-full min-h-0">
              <div className="h-10 border-b border-[var(--card-border)] flex items-center justify-between px-4 bg-[var(--background)] shrink-0 z-20">
                {problemType === "CODING" && (
                  <div className="relative" ref={langDropdownRef}>
                    <button
                      type="button"
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
                              type="button"
                              key={lang.value}
                              onClick={() => {
                                setValue("language", lang.value);
                                setValue("referenceSolution", getStarterCode(lang.value));
                                setIsLangOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer ${language === lang.value ? "text-green-500 bg-[var(--foreground)]/5" : "text-[var(--foreground)]"
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
                   <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)] px-2 py-1.5">
                      <HardDrive className="w-4 h-4 text-blue-500" /> SQL Query
                   </div>
                )}
                <div className="flex items-center gap-3">

                  <button
                    className="p-1.5 hover:bg-[var(--foreground)]/10 rounded-md transition-colors text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
                    title="Reset Code"
                    onClick={() => setValue("referenceSolution", getStarterCode(problemType === "SQL" ? "sql" : language) || "")} // Use setValue
                  >
                    <RotateCcw className="w-4 h-4" />
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
                <Editor
                  height="100%"
                  language={problemType === "SQL" ? "sql" : language}
                  theme={mounted && resolvedTheme === "dark" ? "vs-dark" : mounted && resolvedTheme === "cream" ? "cream" : "light"}
                  beforeMount={handleEditorWillMount}
                  value={referenceSolution}
                  onChange={(value) => setValue("referenceSolution", value || "")}
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

          {/* Bottom section of right panel: Test Case Editors */}
          <div className="flex flex-col h-full bg-[var(--background)] min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {(problemType as any) === "SYSTEM_DESIGN" ? (
               <div className="flex flex-col items-center justify-center h-full text-[var(--foreground)]/40 text-center p-8">
                  <LayoutTemplate className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-medium">System Design Mode</p>
                  <p className="text-xs max-w-[200px] mt-1">Test cases are not required for system design problems. AI will evaluate the textual answer.</p>
               </div>
            ) : problemType === "SQL" ? (
               <div className="text-sm text-[var(--foreground)]/60">
                  <div className="flex justify-between items-center mb-2">
                     <p>For SQL problems, provide the expected output table below.</p>
                     <button
                        type="button"
                        onClick={async () => {
                           const loadingToast = toast.loading("Running SQL...");
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
                                    toast.success("Output generated!");
                                 }
                              }
                           } catch (e: any) {
                              toast.error("Failed to run SQL: " + e.message);
                           } finally {
                              toast.dismiss(loadingToast);
                           }
                        }}
                        className="text-xs px-2 py-1 bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20 transition-colors flex items-center gap-1"
                     >
                        <Play className="w-3 h-3" /> Run & Generate Output
                     </button>
                  </div>
                  <Controller
                    name="examplesInput"
                    control={control}
                    rules={{
                       validate: (value) => {
                          if (value.length === 0) return "At least one expected result is required for SQL problems.";
                          if (value.some(tc => !tc.output?.trim())) return "Expected Output cannot be blank.";
                          return true;
                       }
                    }}
                    render={({ field }) => (
                      <TestCaseEditor
                        name={field.name}
                        label="Expected Result (One Case Recommended)"
                        showOutputs={true}
                        control={control}
                        register={register}
                        hideInput={true} // Hide Input field for SQL
                      />
                    )}
                  />
                  {errors.examplesInput && (
                    <p className="text-red-500 text-xs mt-1">{errors.examplesInput.message}</p>
                  )}
               </div>
            ) : (
              <>
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
                                      label="Example Test Cases"
                                      showOutputs={true}
                                      control={control} // Pass control
                                      register={register} // Pass register
                                    />
                                  )}
                                />
                                {errors.examplesInput && (
                                  <p className="text-red-500 text-xs mt-1">{errors.examplesInput.message}</p>
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
                                                    label="Hidden Test Cases (Inputs Only)"
                                                    showOutputs={false}
                                                    control={control} // Pass control
                                                    register={register} // Pass register
                                                  />
                                                )}
                                              />
                                            )}
                                            {errors.testCasesInput && (
                                              <p className="text-red-500 text-xs mt-1">{errors.testCasesInput.message}</p>
                                            )}
                              </>
            )}
            
            {syntaxError && (
              <div className="flex items-center gap-1.5 text-red-400 text-xs px-2 py-1 bg-red-500/10 rounded animate-pulse">
                <AlertCircle className="w-3 h-3" />
                <span className="truncate max-w-[150px]">{syntaxError}</span>
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