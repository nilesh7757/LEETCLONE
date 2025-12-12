"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Split from "react-split";
import { Editor } from "@monaco-editor/react";
import { toast } from "sonner";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { PlusCircle, Trash2, Code, FileText, LayoutTemplate, SlidersHorizontal, ListChecks, Hash, BookOpen, ChevronLeft, Clock, HardDrive } from "lucide-react";

import TiptapEditor from "@/components/TiptapEditor";
import TestCaseEditor from "@/components/TestCaseEditor";

interface TestCase {
  input: string;
  output: string;
}

interface ProblemFormData {
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  description: string;
  examplesInput: TestCase[];
  testCasesInput: TestCase[];
  referenceSolution: string;
  language: string;
  timeLimit: number; // Time limit in seconds
  memoryLimit: number; // Memory limit in MB
  isPublic: boolean; // New field
}

const difficulties = ["Easy", "Medium", "Hard"];
const categories = ["Arrays", "Strings", "Trees", "Graphs", "Dynamic Programming", "Other"];
const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];

export default function CreateProblemPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const contestId = searchParams.get("contestId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const editorConsoleSplitRef = useRef<any>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProblemFormData>({
    defaultValues: {
      title: "",
      slug: "",
      difficulty: difficulties[0],
      category: categories[0],
      description: "",
      examplesInput: [], 
      testCasesInput: [], 
      referenceSolution: "",
      language: "javascript",
      timeLimit: 2, 
      memoryLimit: 256, 
      isPublic: false, // Default to private
    },
  });

  const problemTitle = watch("title");
  const language = watch("language");
  const referenceSolution = watch("referenceSolution");
  const selectedCategory = watch("category");

  useEffect(() => {
    if (problemTitle) {
      setValue("slug", generateSlug(problemTitle));
    }
  }, [problemTitle, setValue]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Force isPublic to false if contestId is present
  useEffect(() => {
    if (contestId) {
      setValue("isPublic", false);
    }
  }, [contestId, setValue]);

  const onSubmit = async (data: ProblemFormData) => {
    setIsSubmitting(true);
    toast.info("Creating problem and generating test case outputs...");

    if (data.category === "Other" && !customCategory.trim()) {
      toast.error("Please specify the custom category.");
      setIsSubmitting(false);
      return;
    }

    try {
      const apiData = {
        ...data,
        category: data.category === "Other" ? customCategory.trim() : data.category,
        examplesInput: data.examplesInput,
        testCasesInput: data.testCasesInput,
        contestId: contestId, // Pass contestId to API
      };

      const response = await axios.post("/api/problems/create", apiData);
      toast.success(`Problem "${response.data.problem.title}" created successfully!`);
      
      if (contestId) {
          router.push(`/contest/${contestId}/manage`);
      } else {
          router.push(`/problems/${response.data.problem.slug}`);
      }
    } catch (error: any) {
      console.error("Error creating problem:", error);
      toast.error(error.response?.data?.error || "Failed to create problem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 pt-16">
        <Loader />
      </main>
    );
  }

  if (status === "unauthenticated") {
    return null; // Redirect handled by useEffect
  }
  
  return (
    <main className="flex flex-col h-screen pt-16">
      {/* Contest Banner */}
      {contestId && (
        <div className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-2 flex items-center justify-center text-sm text-blue-400">
           <span className="font-semibold mr-2">Contest Mode:</span> Creating a private problem for contest.
        </div>
      )}

      <div className="h-14 border-b border-[var(--card-border)] flex items-center justify-between px-4 bg-[var(--card-bg)] shrink-0">
        <div className="flex items-center gap-2">
            <button 
                onClick={() => router.back()} 
                className="p-1.5 hover:bg-[var(--foreground)]/5 rounded-md transition-colors text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
                title="Back"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-[var(--foreground)]">Create New Problem</span>
        </div>
        <button 
            type="button" // Important for form submit
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-green-900/20 disabled:opacity-50 cursor-pointer"
        >
            {isSubmitting ? <Loader /> : <PlusCircle className="w-4 h-4" />} Create Problem
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
        {/* Left Panel: Problem Details Form */}
        <div className="h-full flex flex-col bg-[var(--background)] overflow-y-auto p-6 custom-scrollbar">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    readOnly
                    {...register("slug", { required: "Problem slug is required" })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-[var(--foreground)]/80 focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none"
                    placeholder="e.g., two-sum (auto-generated)"
                  />
                  {errors.slug && (
                    <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>
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
                       Make this problem <span className="font-bold">Public</span> immediately?
                       <p className="text-xs text-[var(--foreground)]/50 font-normal">
                         Uncheck to keep it Private (e.g., for a future Contest).
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
          className="flex flex-col bg-[#1e1e1e] h-full"
        >
          {/* Top section of right panel: Language Selector and Reference Solution Editor */}
          <div className="flex flex-col h-full min-h-0">
            <div className="h-10 border-b border-[#333] flex items-center justify-between px-4 bg-[#1e1e1e] shrink-0">
              <label htmlFor="language-select" className="text-sm text-gray-300">Reference Solution Language:</label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setValue("language", e.target.value)}
                className="bg-transparent text-sm text-gray-300 outline-none cursor-pointer"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 relative min-h-0">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
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

          {/* Bottom section of right panel: Test Case Editors */}
          <div className="flex flex-col h-full bg-[var(--background)] min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {/* Examples Inputs */}
            <Controller
              name="examplesInput"
              control={control}
              rules={{ 
                validate: (value) => value.length > 0 || "At least one example test case is required",
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

            {/* Hidden Test Cases Inputs */}
            <Controller
              name="testCasesInput"
              control={control}
              rules={{ 
                validate: (value) => value.length > 0 || "At least one hidden test case is required",
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
            {errors.testCasesInput && (
              <p className="text-red-500 text-xs mt-1">{errors.testCasesInput.message}</p>
            )}
          </div>
        </Split>
      </Split>
    </main>
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