"use client";

import { useState } from "react";
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
  Sparkles,
  X,
  Eye,
  Code2,
  Wand2
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
  slug: string; // Added slug
  description?: string;
  type?: string;
  day: number;
}

export default function CreateStudyPlanPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [durationDays, setDurationDays] = useState(7);
  const [selectedProblems, setSelectedProblems] = useState<SelectedProblem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");

  const handleAddProblem = (problem: any) => {
    setSelectedProblems([
      ...selectedProblems,
      {
        id: problem.id,
        title: problem.title,
        slug: problem.slug, // Pass slug
        difficulty: problem.difficulty,
        category: problem.category,
        description: problem.description,
        type: problem.type,
        day: 1, // Default to Day 1
      },
    ]);
  };

  const handleGenerateAI = async (topic: string) => {
    if (!topic.trim()) return;
    setIsGeneratingAI(true);
    setIsModalOpen(false);
    setAiTopic("");
    toast.info(`AI is crafting a problem for "${topic}"...`);
    try {
      const { data } = await axios.post("/api/problems/generate-ai", { topic });
      if (data.success) {
        handleAddProblem(data.problem);
        toast.success("AI Problem generated and added!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to generate AI problem.");
    } finally {
      setIsGeneratingAI(false);
    }
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
    if (selectedProblems.length === 0) {
      toast.error("Please add at least one problem to your study plan.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/api/study-plans", {
        title,
        description,
        isPublic,
        durationDays,
        problems: selectedProblems.map((p) => ({
          problemId: p.id,
          order: p.day,
        })),
      });
      toast.success("Study plan created successfully!");
      router.push("/study-plans");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create study plan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <Link 
        href="/study-plans"
        className="inline-flex items-center gap-2 text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Plans
      </Link>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Create Study Plan</h1>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSubmitting ? "Creating..." : "Save Study Plan"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]/70 flex items-center gap-2">
                   Plan Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 14 Days of Dynamic Programming"
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[var(--foreground)] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]/70 flex items-center gap-2">
                   Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what this plan covers and who it's for..."
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[var(--foreground)] transition-all resize-none"
                />
              </div>

              <div className="space-y-4 pt-4">
                <label className="text-sm font-semibold text-[var(--foreground)]/70 flex items-center gap-2 mb-4">
                   Selected Problems ({selectedProblems.length})
                </label>
                
                <ProblemSearch 
                   onSelect={handleAddProblem} 
                   onGenerateAI={(topic) => {
                     setAiTopic(topic);
                     setIsModalOpen(true);
                   }}
                   excludeIds={selectedProblems.map(p => p.id)} 
                />

                {isGeneratingAI && (
                  <div className="flex items-center gap-3 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl animate-pulse">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                    <span className="text-sm font-medium text-purple-500">AI is generating a unique problem for you...</span>
                  </div>
                )}

                <div className="space-y-3 mt-6">
                  {selectedProblems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 bg-[var(--background)]/50 rounded-2xl border border-dashed border-[var(--card-border)] text-center space-y-4">
                      <div className="p-3 bg-blue-500/5 rounded-full">
                         <Info className="w-6 h-6 text-blue-500/50" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]/60">No problems added yet.</p>
                        <p className="text-xs text-[var(--foreground)]/40 mt-1">Search above or let AI create a unique problem for your plan.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate Problem with AI
                      </button>
                    </div>
                  ) : (
                    selectedProblems.map((problem) => (
                      <div 
                        key={problem.id}
                        className="flex items-center gap-4 p-4 bg-[var(--background)] border border-[var(--card-border)] rounded-xl group hover:border-[var(--foreground)]/20 transition-all shadow-sm"
                      >
                        <div className="shrink-0 text-[var(--foreground)]/20">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[var(--foreground)] truncate">{problem.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              problem.difficulty === "Easy" ? "text-green-500" :
                              problem.difficulty === "Medium" ? "text-yellow-500" :
                              "text-red-500"
                            }`}>
                              {problem.difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <button 
                             type="button"
                             onClick={() => router.push(`/problems/${problem.slug}?returnTo=/study-plans/new`)}
                             className="p-2 text-blue-500/60 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                             title="Preview & Fix in Workspace"
                           >
                             <Eye className="w-4 h-4" />
                           </button>
                           <div className="flex items-center gap-2 px-3 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg">
                              <span className="text-xs text-[var(--foreground)]/60 whitespace-nowrap">Day</span>
                              <input 
                                 type="number" 
                                 min="1"
                                 value={problem.day}
                                 onChange={(e) => handleUpdateDay(problem.id, parseInt(e.target.value))}
                                 className="w-12 bg-transparent text-center text-sm font-bold text-[var(--foreground)] outline-none"
                              />
                           </div>
                           <button 
                             type="button"
                             onClick={() => handleRemoveProblem(problem.id)}
                             className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-8 sticky top-24">
              <div className="space-y-4">
                <h3 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  Plan Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Lock className="w-5 h-5 text-blue-500" />
                      <span className="font-bold text-[var(--foreground)] text-sm">Personal Plan</span>
                    </div>
                    <p className="text-[10px] text-[var(--foreground)]/60 leading-relaxed">
                      This study plan is private and strictly for your own use. It will not be visible to other users.
                    </p>
                  </div>

                  <div className="space-y-2 p-4 bg-[var(--background)] border border-[var(--card-border)] rounded-xl">
                    <label className="text-xs font-bold text-[var(--foreground)]/60 flex items-center gap-2 uppercase tracking-wider mb-2">
                       <Clock className="w-3 h-3" /> Duration (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={durationDays}
                      onChange={(e) => setDurationDays(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-[var(--foreground)] text-sm font-bold"
                    />
                    <p className="text-[10px] text-[var(--foreground)]/40 italic">
                      How many days will it take to complete?
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                <p className="text-xs text-blue-500/80 leading-relaxed flex gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  Private plans are only visible to you. You can change this later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* AI Problem Generation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">Generate AI Problem</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-[var(--foreground)]/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--foreground)]/40" />
                </button>
              </div>

              <p className="text-sm text-[var(--foreground)]/60">
                Enter a topic and our AI will craft a unique problem, complete with test cases and solutions.
              </p>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/40">Topic or Concept</label>
                <input
                  autoFocus
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateAI(aiTopic)}
                  placeholder="e.g. Dijkstra's Algorithm, React Context API..."
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-[var(--foreground)] transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)] font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleGenerateAI(aiTopic)}
                  disabled={!aiTopic.trim() || isGeneratingAI}
                  className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                  {isGeneratingAI ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Generate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
