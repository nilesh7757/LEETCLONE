"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Calendar, Edit2, Clock, Hash, Zap, Lock } from "lucide-react"; // Removed Plus, X, Link
import { toast } from "sonner";
import axios from "axios";
import { useForm } from "react-hook-form";
import Select, { MultiValue } from "react-select";
// Removed Select, MultiValue, Link

interface ProblemOption {
  value: string;
  label: string;
  difficulty: string;
}

interface ContestFormData {
  title: string;
  description: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  publishProblems: boolean; // New field
  visibility: "PUBLIC" | "PRIVATE";
  accessCode?: string;
  selectedProblemIds: string[]; // Added field for problems
}

export default function CreateContestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableProblems, setAvailableProblems] = useState<ProblemOption[]>([]);
  const [isProblemsLoading, setIsProblemsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue, // Added for react-select
    control, // Added for react-select
    formState: { errors },
  } = useForm<ContestFormData>({
    defaultValues: {
      publishProblems: false, // Default false
      visibility: "PUBLIC",
      selectedProblemIds: [], // Default empty array for problems
    },
  });

  const visibility = watch("visibility");
  const selectedProblems = watch("selectedProblemIds"); // To display selected problems

  // Fetch problems on component mount
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axios.get("/api/problems"); // Fetch all problems for now
        const formattedProblems: ProblemOption[] = data.problems.map((p: any) => ({
          value: p.id,
          label: `${p.title} (${p.difficulty})`,
          difficulty: p.difficulty,
        }));
        setAvailableProblems(formattedProblems);
      } catch (error) {
        console.error("Failed to fetch problems:", error);
        toast.error("Failed to load problems.");
      } finally {
        setIsProblemsLoading(false);
      }
    };
    fetchProblems();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const onSubmit = async (data: ContestFormData) => {
    setIsSubmitting(true);
    toast.info("Creating contest...");

    try {
      const { selectedProblemIds, ...rest } = data; // Destructure to separate problemIds
      
      const response = await axios.post("/api/contest/create", {
        ...rest,
        startTime: new Date(rest.startTime).toISOString(),
        endTime: new Date(rest.endTime).toISOString(),
        problemIds: selectedProblemIds, // Pass selected problem IDs
      });
      toast.success("Contest created! Redirecting to dashboard...");
      router.push(`/contest/${response.data.contest.id}/manage`); // Redirect to manage page
    } catch (error: any) {
      console.error("Failed to create contest:", error);
      toast.error(error.response?.data?.error || "Failed to create contest.");
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
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      {/* Background Gradients */}
      <div className="fixed inset-0 bg-[var(--background)] -z-20 transition-colors duration-300" />
      <div className="fixed inset-0 bg-grid-pattern opacity-10 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl p-8 space-y-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl backdrop-blur-md"
      >
        <h2 className="text-3xl font-bold text-center text-[var(--foreground)]">
          Create New Contest
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
              Contest Title
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/60" />
              <input
                id="title"
                type="text"
                {...register("title", { required: "Contest title is required" })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none"
                placeholder="e.g., Weekly LeetClone Challenge"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
              Description
            </label>
            <div className="relative">
              <Edit2 className="absolute left-3 top-3 w-4 h-4 text-[var(--foreground)]/60" />
              <textarea
                id="description"
                {...register("description")}
                rows={4}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none resize-y"
                placeholder="Brief description of the contest rules and theme."
              ></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
                Start Time
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/60" />
                <input
                  id="startTime"
                  type="datetime-local"
                  {...register("startTime", { required: "Start time is required" })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none"
                />
                {errors.startTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
                End Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/60" />
                <input
                  id="endTime"
                  type="datetime-local"
                  {...register("endTime", {
                    required: "End time is required",
                    validate: (value, formValues) =>
                      new Date(value) > new Date(formValues.startTime) ||
                      "End time must be after start time",
                  })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none"
                />
                {errors.endTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.endTime.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Visibility Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-2">
              Contest Visibility
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                visibility === "PUBLIC" 
                  ? "border-[var(--accent-gradient-to)] bg-[var(--accent-gradient-to)]/10" 
                  : "border-[var(--card-border)] bg-[var(--background)]/50 hover:bg-[var(--foreground)]/5"
              }`}>
                <input
                  type="radio"
                  value="PUBLIC"
                  {...register("visibility")}
                  className="w-4 h-4 text-[var(--accent-gradient-to)] focus:ring-[var(--accent-gradient-to)]"
                />
                <div>
                  <span className="block text-sm font-medium text-[var(--foreground)]">Public Contest</span>
                  <span className="block text-xs text-[var(--foreground)]/50">Visible to everyone on the contest list.</span>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                visibility === "PRIVATE" 
                  ? "border-[var(--accent-gradient-to)] bg-[var(--accent-gradient-to)]/10" 
                  : "border-[var(--card-border)] bg-[var(--background)]/50 hover:bg-[var(--foreground)]/5"
              }`}>
                <input
                  type="radio"
                  value="PRIVATE"
                  {...register("visibility")}
                  className="w-4 h-4 text-[var(--accent-gradient-to)] focus:ring-[var(--accent-gradient-to)]"
                />
                <div>
                  <span className="block text-sm font-medium text-[var(--foreground)]">Private Contest</span>
                  <span className="block text-xs text-[var(--foreground)]/50">Only accessible via link and access code.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Access Code Input (Removed as per user request) */}

          {/* Publish Problems Checkbox */}
          <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
                Post-Contest Visibility
              </label>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50">
                <input
                  id="publishProblems"
                  type="checkbox"
                  {...register("publishProblems")}
                  className="w-5 h-5 rounded border-gray-300 text-[var(--accent-gradient-to)] focus:ring-[var(--accent-gradient-to)]"
                />
                <label htmlFor="publishProblems" className="text-sm text-[var(--foreground)] cursor-pointer select-none">
                  Make problems <span className="font-bold">Public</span> after contest ends?
                  <p className="text-xs text-[var(--foreground)]/50 font-normal">
                    If checked, private problems will become visible to everyone once the contest is over.
                  </p>
                </label>
              </div>
          </div>

          {/* Problem Selector */}
          <div>
            <label htmlFor="problems" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
              Select Problems
            </label>
            <Select
              id="problems"
              instanceId="problems-select" // Added for SSR hydration
              options={availableProblems}
              isMulti
              isLoading={isProblemsLoading}
              closeMenuOnSelect={false}
              onChange={(selectedOptions: MultiValue<ProblemOption>) => {
                setValue(
                  "selectedProblemIds",
                  selectedOptions.map((option) => option.value)
                );
              }}
              // Custom styles for dark theme
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: "var(--background)",
                  borderColor: "var(--card-border)",
                  color: "var(--foreground)",
                  "&:hover": {
                    borderColor: "var(--accent-gradient-to)",
                  },
                }),
                menu: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: "var(--background)",
                  borderColor: "var(--card-border)",
                }),
                option: (baseStyles, state) => ({
                  ...baseStyles,
                  backgroundColor: state.isFocused
                    ? "var(--foreground)/5"
                    : state.isSelected
                    ? "var(--accent-gradient-to)"
                    : "var(--background)",
                  color: state.isSelected
                    ? "var(--background)"
                    : "var(--foreground)",
                  "&:active": {
                    backgroundColor: "var(--accent-gradient-to)",
                  },
                }),
                multiValue: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: "var(--card-border)",
                  color: "var(--foreground)",
                }),
                multiValueLabel: (baseStyles) => ({
                  ...baseStyles,
                  color: "var(--foreground)",
                }),
                multiValueRemove: (baseStyles) => ({
                  ...baseStyles,
                  color: "var(--foreground)",
                  "&:hover": {
                    backgroundColor: "var(--foreground)",
                    color: "var(--background)",
                  },
                }),
                input: (baseStyles) => ({
                  ...baseStyles,
                  color: "var(--foreground)",
                }),
                placeholder: (baseStyles) => ({
                  ...baseStyles,
                  color: "var(--foreground)/60",
                }),
                singleValue: (baseStyles) => ({
                  ...baseStyles,
                  color: "var(--foreground)",
                }),
              }}
            />
             {errors.selectedProblemIds && (
              <p className="text-red-500 text-xs mt-1">{errors.selectedProblemIds.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isProblemsLoading} // Disable if problems are still loading
            className="w-full px-6 py-3 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
          >
            {isSubmitting ? (
              <Loader />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Create Contest
          </button>
        </form>
      </motion.div>
    </main>
  );
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