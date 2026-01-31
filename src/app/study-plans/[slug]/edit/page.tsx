"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Save, 
  Trash2, 
  GripVertical, 
  Calendar, 
  Info, 
  Lock, 
  Globe,
  Loader2,
  Clock,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import ProblemSearch from "@/features/problems/components/ProblemSearch";

interface SelectedProblem {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  day: number;
}

interface EditStudyPlanPageProps {
  params: Promise<{ slug: string }>;
}

export default function EditStudyPlanPage({ params }: EditStudyPlanPageProps) {
  const router = useRouter();
  const { slug } = use(params);
  
  const [planId, setPlanId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [durationDays, setDurationDays] = useState(7);
  const [selectedProblems, setSelectedProblems] = useState<SelectedProblem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const { data } = await axios.get(`/api/study-plans/by-slug/${slug}`);
        const plan = data.studyPlan;
        setPlanId(plan.id);
        setTitle(plan.title);
        setDescription(plan.description);
        setStatus(plan.status);
        setDurationDays(plan.durationDays || 7);
        setSelectedProblems(plan.problems.map((p: any) => ({
          id: p.problem.id,
          title: p.problem.title,
          difficulty: p.problem.difficulty,
          category: p.problem.category,
          day: p.order
        })));
      } catch (error) {
        toast.error("Failed to fetch study plan.");
        router.push("/study-plans");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlan();
  }, [slug, router]);

  const handleAddProblem = (problem: any) => {
    setSelectedProblems([
      ...selectedProblems,
      {
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        category: problem.category,
        day: 1,
      },
    ]);
  };

  const handleRemoveProblem = (id: string) => {
    setSelectedProblems(selectedProblems.filter((p) => p.id !== id));
  };

  const handleUpdateDay = (id: string, day: number) => {
    setSelectedProblems(
      selectedProblems.map((p) => (p.id === id ? { ...p, day: Math.max(1, day) } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.patch(`/api/study-plans/${planId}`, {
        title,
        description,
        durationDays,
        problems: selectedProblems.map((p) => ({
          problemId: p.id,
          order: p.day,
        })),
      });
      
      if (status === "PUBLISHED") {
        toast.success("Changes submitted for admin approval!");
      } else {
        toast.success("Study plan updated successfully!");
      }
      router.push(`/study-plans/${slug}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update study plan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <Link 
        href={`/study-plans/${slug}`}
        className="inline-flex items-center gap-2 text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Plan
      </Link>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Edit Study Plan</h1>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {status === "PUBLISHED" ? "Request Update" : "Save Changes"}
          </button>
        </div>

        {status === "PUBLISHED" && (
           <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
              <p className="text-xs text-orange-500/90 leading-relaxed">
                 This plan is currently live. Any changes you save will be submitted for admin review before appearing publicly.
              </p>
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]/70">Plan Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[var(--foreground)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]/70">Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[var(--foreground)] resize-none"
                />
              </div>

              <div className="space-y-4 pt-4">
                <label className="text-sm font-semibold text-[var(--foreground)]/70 mb-4">Selected Problems ({selectedProblems.length})</label>
                <ProblemSearch onSelect={handleAddProblem} excludeIds={selectedProblems.map(p => p.id)} />
                <div className="space-y-3 mt-6">
                  {selectedProblems.map((problem) => (
                    <div key={problem.id} className="flex items-center gap-4 p-4 bg-[var(--background)] border border-[var(--card-border)] rounded-xl group">
                      <GripVertical className="w-5 h-5 text-[var(--foreground)]/20" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[var(--foreground)] truncate">{problem.title}</h4>
                        <span className="text-[10px] font-bold uppercase text-blue-500">{problem.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg">
                          <span className="text-xs text-[var(--foreground)]/60">Day</span>
                          <input 
                            type="number" 
                            min="1"
                            value={problem.day}
                            onChange={(e) => handleUpdateDay(problem.id, parseInt(e.target.value))}
                            className="w-12 bg-transparent text-center text-sm font-bold text-[var(--foreground)] outline-none"
                          />
                        </div>
                        <button type="button" onClick={() => handleRemoveProblem(problem.id)} className="p-2 text-red-500/60 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-8 sticky top-24">
              <div className="space-y-4">
                <h3 className="font-bold text-[var(--foreground)] flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /> Plan Settings</h3>
                <div className="space-y-2 p-4 bg-[var(--background)] border border-[var(--card-border)] rounded-xl">
                  <label className="text-xs font-bold text-[var(--foreground)]/60 uppercase tracking-wider mb-2 flex items-center gap-2"><Clock className="w-3 h-3" /> Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-[var(--foreground)] text-sm font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
