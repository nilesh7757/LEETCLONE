"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Edit2, Clock, Hash, Zap, Lock, Plus } from "lucide-react";
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

interface Problem {
  id: string;
  title: string;
  difficulty: string;
}

export default function CreateContestPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableProblems, setAvailableProblems] = useState<ProblemOption[]>([]);
  const [isProblemsLoading, setIsProblemsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue, // Added for react-select
    formState: { errors },
  } = useForm<ContestFormData>({
    defaultValues: {
      publishProblems: false, // Default false
      visibility: "PUBLIC",
      selectedProblemIds: [], // Default empty array for problems
    },
  });

  const visibility = watch("visibility");

  // Fetch problems on component mount
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axios.get("/api/problems"); // Fetch all problems for now
        const formattedProblems: ProblemOption[] = data.problems.map((p: Problem) => ({
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
    } catch (error) {
      console.error("Failed to create contest:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Failed to create contest.");
      } else {
        toast.error("Failed to create contest.");
      }
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
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex justify-center bg-[var(--background)]">
      {/* Atmospheric Backgrounds */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl p-10 space-y-10 rounded-[2.5rem] bg-[var(--card)]/40 shadow-2xl backdrop-blur-3xl relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--viz-cyan)]/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--viz-purple)]/10 rounded-full blur-3xl -ml-32 -mb-32" />

        <div className="text-center relative">
          <h2 className="text-4xl font-black text-[var(--foreground)] tracking-tight mb-2">
            Initiate Contest
          </h2>
          <p className="text-[var(--muted-foreground)] text-sm font-medium uppercase tracking-[0.2em]">
            Configure your neural competitive arena
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 relative">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                  Contest Title
                </label>
                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--viz-cyan)] transition-colors" />
                  <input
                    id="title"
                    type="text"
                    {...register("title", { required: "Contest title is required" })}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--card)]/50 border-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/40 focus:ring-2 focus:ring-[var(--viz-cyan)]/20 outline-none transition-all shadow-inner"
                    placeholder="e.g., Weekly LeetClone Challenge"
                  />
                  {errors.title && (
                    <p className="text-[var(--viz-red)] text-[10px] font-bold mt-1 ml-1 uppercase">{errors.title.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                  Contextual Description
                </label>
                <div className="relative group">
                  <Edit2 className="absolute left-4 top-5 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--viz-cyan)] transition-colors" />
                  <textarea
                    id="description"
                    {...register("description")}
                    rows={4}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--card)]/50 border-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/40 focus:ring-2 focus:ring-[var(--viz-cyan)]/20 outline-none transition-all shadow-inner resize-none"
                    placeholder="Define the arena parameters..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label htmlFor="startTime" className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                  Start Sequence
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--viz-cyan)] transition-colors" />
                  <input
                    id="startTime"
                    type="datetime-local"
                    {...register("startTime", { required: "Start time is required" })}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--card)]/50 border-none text-[var(--foreground)] focus:ring-2 focus:ring-[var(--viz-cyan)]/20 outline-none transition-all shadow-inner"
                  />
                  {errors.startTime && (
                    <p className="text-[var(--viz-red)] text-[10px] font-bold mt-1 ml-1 uppercase">{errors.startTime.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="endTime" className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                  End Sequence
                </label>
                <div className="relative group">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--viz-cyan)] transition-colors" />
                  <input
                    id="endTime"
                    type="datetime-local"
                    {...register("endTime", {
                      required: "End time is required",
                      validate: (value, formValues) =>
                        new Date(value) > new Date(formValues.startTime) ||
                        "Sequence must end after it starts",
                    })}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--card)]/50 border-none text-[var(--foreground)] focus:ring-2 focus:ring-[var(--viz-cyan)]/20 outline-none transition-all shadow-inner"
                  />
                  {errors.endTime && (
                    <p className="text-[var(--viz-red)] text-[10px] font-bold mt-1 ml-1 uppercase">{errors.endTime.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
              Arena Visibility
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className={`group relative flex items-center gap-4 p-6 rounded-3xl border-none cursor-pointer transition-all ${
                visibility === "PUBLIC" 
                  ? "bg-[var(--viz-cyan)]/10 ring-2 ring-[var(--viz-cyan)]/30" 
                  : "bg-[var(--card)]/30 hover:bg-[var(--card)]/50"
              }`}>
                <input
                  type="radio"
                  value="PUBLIC"
                  {...register("visibility")}
                  className="hidden"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${visibility === "PUBLIC" ? "border-[var(--viz-cyan)] bg-[var(--viz-cyan)]" : "border-[var(--muted-foreground)]/30"}`}>
                  {visibility === "PUBLIC" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="block text-sm font-bold text-[var(--foreground)]">Public Arena</span>
                  <span className="block text-[10px] text-[var(--muted-foreground)] uppercase tracking-tight">Open for all combatants</span>
                </div>
              </label>

              <label className={`group relative flex items-center gap-4 p-6 rounded-3xl border-none cursor-pointer transition-all ${
                visibility === "PRIVATE" 
                  ? "bg-[var(--viz-purple)]/10 ring-2 ring-[var(--viz-purple)]/30" 
                  : "bg-[var(--card)]/30 hover:bg-[var(--card)]/50"
              }`}>
                <input
                  type="radio"
                  value="PRIVATE"
                  {...register("visibility")}
                  className="hidden"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${visibility === "PRIVATE" ? "border-[var(--viz-purple)] bg-[var(--viz-purple)]" : "border-[var(--muted-foreground)]/30"}`}>
                  {visibility === "PRIVATE" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="block text-sm font-bold text-[var(--foreground)]">Encrypted Private</span>
                  <span className="block text-[10px] text-[var(--muted-foreground)] uppercase tracking-tight">Invite-only transmission</span>
                </div>
              </label>
            </div>
          </div>

          <AnimatePresence>
            {visibility === "PRIVATE" && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label htmlFor="accessCode" className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                  Security Access Code
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--viz-purple)] transition-colors" />
                  <input
                    id="accessCode"
                    type="text"
                    {...register("accessCode", { required: visibility === "PRIVATE" ? "Access code is required" : false })}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--card)]/50 border-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/40 focus:ring-2 focus:ring-[var(--viz-purple)]/20 outline-none transition-all shadow-inner"
                    placeholder="Enter entry passkey..."
                  />
                </div>
                {errors.accessCode && (
                  <p className="text-[var(--viz-red)] text-[10px] font-bold mt-1 ml-1 uppercase">{errors.accessCode.message}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                Post-Operation Protocol
              </label>
              <label className="flex items-center gap-4 p-6 rounded-3xl bg-[var(--card)]/30 cursor-pointer hover:bg-[var(--card)]/40 transition-all">
                <div className="relative flex items-center">
                  <input
                    id="publishProblems"
                    type="checkbox"
                    {...register("publishProblems")}
                    className="w-6 h-6 rounded-lg appearance-none bg-[var(--card)] border-none checked:bg-[var(--viz-green)] transition-all cursor-pointer shadow-inner"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white font-bold opacity-0 check-icon">
                    ✓
                  </div>
                </div>
                <div>
                  <span className="block text-sm font-bold text-[var(--foreground)]">Declassify Problems</span>
                  <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-tight">
                    Merge arena challenges into public database after completion
                  </p>
                </div>
              </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1 px-1">
               <label htmlFor="problems" className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                 Select Combat Modules (Problems)
               </label>
               <button 
                  type="button"
                  onClick={() => router.push('/problems/new')}
                  className="text-[10px] font-black uppercase tracking-widest text-[var(--viz-cyan)] hover:opacity-80 transition-opacity flex items-center gap-1.5"
               >
                  <Plus className="w-3 h-3" /> Create New Module
               </button>
            </div>
            <Select
              id="problems"
              instanceId="problems-select"
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
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: "var(--card)/30",
                  border: "none",
                  borderRadius: "1.25rem",
                  padding: "0.5rem",
                  color: "var(--foreground)",
                  boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
                }),
                menu: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: "var(--card)",
                  borderRadius: "1.25rem",
                  border: "none",
                  padding: "0.5rem",
                  overflow: "hidden",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                }),
                option: (baseStyles, state) => ({
                  ...baseStyles,
                  backgroundColor: state.isFocused
                    ? "var(--foreground)/5"
                    : state.isSelected
                    ? "var(--viz-cyan)/20"
                    : "transparent",
                  color: state.isSelected
                    ? "var(--viz-cyan)"
                    : "var(--foreground)",
                  borderRadius: "0.75rem",
                  margin: "0.25rem 0",
                  cursor: "pointer",
                }),
                multiValue: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: "var(--viz-cyan)/10",
                  borderRadius: "0.5rem",
                  padding: "0.125rem",
                }),
                multiValueLabel: (baseStyles) => ({
                  ...baseStyles,
                  color: "var(--viz-cyan)",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                }),
                multiValueRemove: (baseStyles) => ({
                  ...baseStyles,
                  color: "var(--viz-cyan)",
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: "var(--viz-red)",
                  },
                }),
              }}
            />
             {errors.selectedProblemIds && (
              <p className="text-[var(--viz-red)] text-[10px] font-bold mt-1 ml-1 uppercase">{errors.selectedProblemIds.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isProblemsLoading}
            className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-[var(--viz-cyan)] to-[var(--viz-blue)] text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-[var(--viz-cyan)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <Loader />
            ) : (
              <>
                <Zap className="w-5 h-5 fill-current" />
                Establish Contest
              </>
            )}
          </button>
        </form>
      </motion.div>

      <style jsx global>{`
        input:checked ~ .check-icon {
          opacity: 1;
        }
      `}</style>
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