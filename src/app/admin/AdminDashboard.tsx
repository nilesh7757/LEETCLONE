"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { 
  AlertTriangle, Ban, CheckCircle, ShieldAlert, Users, 
  FileText, Lock, Unlock, Eye, EyeOff, Plus, Pencil, 
  Sparkles, Check, X, TrendingUp, Activity, 
  Search, Filter, ArrowUpRight, Clock
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Report {
  id: string;
  reason: string;
  createdAt: string;
  submission: {
    id: string;
    code: string;
    status: string;
    user: {
      id: string;
      name: string;
      email: string;
      warnings: number;
      isBanned: boolean;
    };
    problem: {
      title: string;
      slug: string;
    };
  };
  reporter: {
    name: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
  _count: {
    submissions: number;
  };
}

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  isPublic: boolean;
  isVerified: boolean;
  source: string;
  createdAt: string;
  creatorId: string | null;
  creator: {
    name: string;
    email: string;
  } | null;
}

interface StudyPlan {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  updatedAt: string;
  creator: {
    name: string;
    email: string;
  } | null;
  pendingData?: {
    title?: string;
    description?: string;
  };
}

interface TestCase {
  input: string | number | object | unknown[];
  output: string | number | object | unknown[];
}

interface GeneratedProblem {
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  description: string;
  testCases: TestCase[];
  referenceSolution: string;
  timeLimit: number;
  memoryLimit: number;
  problemType: string;
  hints: string[];
}

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend?: string;
}

const StatCard = ({ title, value, icon: Icon, trend }: StatCardProps) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-[var(--viz-red)]/30 transition-all duration-300"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-red-500/10`}>
        <Icon className={`w-6 h-6 text-red-500`} />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" /> {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-[var(--foreground)]/60 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-black text-[var(--foreground)] mt-1">{value}</p>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"reports" | "users" | "problems" | "ai_verification" | "verifications" | "architect">("reports");
  
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [pendingStudyPlans, setPendingStudyPlans] = useState<StudyPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [architectTopic, setArchitectTopic] = useState("");
  const [architectDifficulty, setArchitectDifficulty] = useState("MEDIUM");
  const [generatedProblem, setGeneratedProblem] = useState<GeneratedProblem | null>(null);
  const [isArchitectLoading, setIsArchitectLoading] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReports = async () => {
    try {
      const { data } = await axios.get("/api/admin/reports");
      setReports(data.reports);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("/api/admin/users");
      setUsers(data.users);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const fetchProblems = async () => {
    try {
      const { data } = await axios.get("/api/admin/problems");
      setProblems(data.problems);
    } catch (error) {
      console.error("Failed to fetch problems", error);
    }
  };

  const fetchPendingStudyPlans = async () => {
    try {
      const { data } = await axios.get("/api/admin/study-plans");
      setPendingStudyPlans(data.studyPlans);
    } catch (error) {
      console.error("Failed to fetch pending study plans", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchReports(), 
        fetchUsers(), 
        fetchProblems(),
        fetchPendingStudyPlans()
      ]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleAction = async (action: "WARN" | "BAN" | "DISMISS", report: Report) => {
    try {
      const response = await axios.post("/api/admin/actions", {
        action,
        reportId: report.id,
        userId: report.submission.user.id
      });
      toast.success(response.data.message);
      fetchReports(); 
      fetchUsers(); 
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Action failed");
      } else {
        toast.error("Action failed");
      }
    }
  };

  const handleBanToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await axios.post("/api/admin/users/ban", { userId, isBanned: !currentStatus });
      toast.success(currentStatus ? "User unbanned" : "User banned");
      fetchUsers();
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const handleVisibilityToggle = async (problemId: string, currentStatus: boolean) => {
    try {
      await axios.post("/api/admin/problems/toggle", { problemId, isPublic: !currentStatus });
      toast.success(currentStatus ? "Problem hidden" : "Problem published");
      fetchProblems();
    } catch {
      toast.error("Failed to update problem visibility");
    }
  };

  const handleVerify = async (problemId: string, isVerified: boolean) => {
    try {
      await axios.post("/api/admin/problems/verify", { problemId, isVerified });
      toast.success(isVerified ? "Problem verified & published!" : "Problem rejected");
      fetchProblems();
    } catch {
      toast.error("Failed to verify problem");
    }
  };

  const handleGenerateTestCases = async (problemId: string) => {
    const toastId = toast.loading("Generating comprehensive test cases via AI...");
    try {
      await axios.post("/api/admin/problems/generate-test-cases", { problemId });
      toast.success("Test cases generated and saved!", { id: toastId });
      fetchProblems();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Generation failed", { id: toastId });
      } else {
        toast.error("Generation failed", { id: toastId });
      }
    }
  };

  const handleStudyPlanReview = async (id: string, action: "APPROVE" | "REJECT") => {
    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this plan?`)) return;

    setIsSubmitting(true);
    try {
      await axios.post(`/api/admin/study-plans/${id}/review`, { action });
      toast.success(`Study plan ${action === "APPROVE" ? "approved" : "rejected"}.`);
      fetchPendingStudyPlans();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Review failed.");
      } else {
        toast.error("Review failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateProblem = async () => {
    if (!architectTopic) return toast.error("Please enter a topic");
    setIsArchitectLoading(true);
    try {
      const { data } = await axios.post("/api/admin/generate-problem", {
        topic: architectTopic,
        difficulty: architectDifficulty
      });
      setGeneratedProblem(data.data);
      toast.success("Problem generated successfully!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Generation failed");
      } else {
        toast.error("Generation failed");
      }
    } finally {
      setIsArchitectLoading(false);
    }
  };

  const handleSaveGeneratedProblem = async () => {
    if (!generatedProblem) return;
    setIsSubmitting(true);
    try {
      const payload = {
        title: generatedProblem.title,
        slug: generatedProblem.slug,
        difficulty: generatedProblem.difficulty === "EASY" ? "Easy" : generatedProblem.difficulty === "MEDIUM" ? "Medium" : "Hard",
        category: generatedProblem.category,
        description: generatedProblem.description,
        examplesInput: generatedProblem.testCases.slice(0, 2).map((tc: TestCase) => ({
          input: tc.input,
          output: tc.output
        })),
        testCasesInput: generatedProblem.testCases.slice(2).map((tc: TestCase) => ({
          input: tc.input
        })),
        referenceSolution: generatedProblem.referenceSolution,
        language: "javascript",
        timeLimit: generatedProblem.timeLimit,
        memoryLimit: generatedProblem.memoryLimit,
        problemType: generatedProblem.problemType,
        isPublic: false,
        editorial: "AI Generated Editorial"
      };

      await axios.post("/api/problems/create", payload);
      toast.success("Problem saved as draft!");
      setGeneratedProblem(null);
      fetchProblems();
      setActiveTab("ai_verification");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Failed to save problem");
      } else {
        toast.error("Failed to save problem");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-10 w-10 border-4 border-[var(--viz-red)] border-t-transparent rounded-full"
        />
    </div>
  );

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredProblems = problems.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const tabConfigs = [
    { id: "reports", label: "Reports", icon: ShieldAlert, color: "red", count: reports.length },
    { id: "users", label: "Users", icon: Users, color: "red", count: 0 },
    { id: "problems", label: "Problems", icon: FileText, color: "red", count: 0 },
    { id: "ai_verification", label: "AI Verification", icon: Sparkles, color: "red", count: problems.filter(p => !p.isVerified).length },
    { id: "verifications", label: "Study Plans", icon: CheckCircle, color: "red", count: pendingStudyPlans.length },
    { id: "architect", label: "Architect", icon: Sparkles, color: "red", count: 0 },
  ] as const;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[var(--background)] selection:bg-[var(--viz-red)]/30">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
      >
        <div>
          <h1 className="text-4xl font-bold text-[var(--foreground)] tracking-tight flex items-center gap-3">
            <div className="p-3 bg-[var(--viz-red)]/10 rounded-2xl">
              <ShieldAlert className="w-10 h-10 text-[var(--viz-red)]" />
            </div>
            Admin Dashboard
          </h1>
          <p className="text-[var(--foreground)]/50 mt-2 font-medium">System overview and management controls.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/40 group-focus-within:text-[var(--viz-red)] transition-colors" />
            <input 
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-6 py-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full md:w-80 outline-none focus:ring-2 focus:ring-[var(--viz-red)]/50 focus:border-[var(--viz-red)] transition-all font-medium"
            />
          </div>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl hover:bg-[var(--muted)] transition-colors"
          >
            <Filter className="w-5 h-5 text-[var(--foreground)]/60" />
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Users" value={users.length} icon={Users} color="red" trend="+12%" />
        <StatCard title="Active Problems" value={problems.length} icon={FileText} color="red" trend="+5%" />
        <StatCard title="Pending Reports" value={reports.length} icon={AlertTriangle} color="red" />
        <StatCard title="AI Verifications" value={problems.filter(p => !p.isVerified).length} icon={Activity} color="red" />
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-4 no-scrollbar">
        {tabConfigs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-6 py-3 text-sm font-bold rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-lg border border-[var(--border-strong)]" 
                : "text-[var(--foreground)]/40 hover:text-[var(--foreground)] hover:bg-[var(--card)]/50"
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? `text-[var(--viz-${tab.color})]` : ""}`} />
            {tab.label}
            {tab.count > 0 && (
              <span className={`bg-[var(--viz-${tab.color})] text-white text-[10px] px-2 py-0.5 rounded-full`}>
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <motion.div layoutId="tab-underline" className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--viz-${tab.color})]`} />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px]"
        >
          {activeTab === "architect" && (
            <div className="space-y-8">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <Sparkles className="w-40 h-40 text-[var(--viz-red)]" />
                </div>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-[var(--viz-red)]/10 rounded-2xl">
                    <Sparkles className="w-8 h-8 text-[var(--viz-red)]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[var(--foreground)]">Agentic Problem Architect</h2>
                    <p className="text-[var(--foreground)]/50 font-medium">Generate high-fidelity coding problems using iterative AI loops.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-end">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--foreground)]/40 ml-1">Core Concept</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={architectTopic}
                        onChange={(e) => setArchitectTopic(e.target.value)}
                        placeholder="e.g. Red-Black Trees, Matrix DP..."
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-5 py-4 text-[var(--foreground)] focus:ring-2 focus:ring-[var(--viz-red)] outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--foreground)]/40 ml-1">Complexity</label>
                    <select
                      value={architectDifficulty}
                      onChange={(e) => setArchitectDifficulty(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-5 py-4 text-[var(--foreground)] focus:ring-2 focus:ring-[var(--viz-red)] outline-none transition-all font-medium appearance-none"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleGenerateProblem}
                  disabled={isArchitectLoading || !architectTopic}
                  className="mt-10 w-full py-5 bg-[var(--viz-red)] hover:brightness-110 disabled:opacity-50 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-900/20"
                >
                  {isArchitectLoading ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Architecting Problem...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" /> Generate Masterpiece
                    </>
                  )}
                </motion.button>
              </div>

              {generatedProblem && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[var(--card)] border border-[var(--border-strong)] rounded-3xl overflow-hidden shadow-2xl"
                >
                  <div className="p-8 border-b border-[var(--border)] bg-[var(--viz-red)]/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <h3 className="text-xl font-black text-[var(--foreground)]">
                        {generatedProblem.title}
                      </h3>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => setGeneratedProblem(null)}
                        className="flex-1 px-6 py-3 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]/60 hover:text-[var(--foreground)] rounded-2xl font-bold transition-all"
                      >
                        Discard
                      </button>
                      <button 
                        onClick={handleSaveGeneratedProblem}
                        disabled={isSubmitting}
                        className="flex-1 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-red-900/20"
                      >
                        {isSubmitting ? "Persisting..." : "Save Draft"}
                      </button>
                    </div>
                  </div>

                  <div className="p-10 grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-10">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--foreground)]/30 mb-4 flex items-center gap-2">
                          <FileText className="w-3 h-3" /> Problem Statement
                        </h4>
                        <div className="prose prose-invert max-w-none bg-[var(--background)] p-8 rounded-3xl border border-[var(--border)] text-[var(--foreground)]/80 leading-relaxed font-medium">
                          {generatedProblem.description}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/30 mb-4 flex items-center gap-2">
                          <Lock className="w-3 h-3" /> Reference Solution
                        </h4>
                        <div className="bg-black/60 p-8 rounded-3xl font-mono text-sm overflow-x-auto border border-[var(--border)] relative group">
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold text-[var(--viz-red)] bg-[var(--viz-red)]/10 px-2 py-1 rounded">JavaScript</span>
                          </div>
                          <pre className="text-red-300 leading-relaxed">{generatedProblem.referenceSolution}</pre>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-10">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--foreground)]/30 mb-4 flex items-center gap-2">
                          <CheckCircle className="w-3 h-3" /> Test Matrix
                        </h4>
                        <div className="space-y-4">
                          {generatedProblem.testCases.map((tc: TestCase, i: number) => (
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              key={i} 
                              className="bg-[var(--background)] p-5 rounded-2xl border border-[var(--border)] group hover:border-[var(--viz-red)]/50 transition-all shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-[var(--foreground)]/30 uppercase">Case #{i + 1}</span>
                                <ArrowUpRight className="w-3 h-3 text-[var(--foreground)]/20 group-hover:text-[var(--viz-red)] transition-colors" />
                              </div>
                              <div className="text-[var(--viz-red)] font-bold text-xs mb-2 truncate">
                                <span className="text-[var(--foreground)]/40 font-medium mr-2">In:</span> 
                                {typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input)}
                              </div>
                              <div className="text-[var(--viz-red)] font-bold text-xs truncate">
                                <span className="text-[var(--foreground)]/40 font-medium mr-2">Out:</span> 
                                {typeof tc.output === 'string' ? tc.output : JSON.stringify(tc.output)}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--foreground)]/30 mb-4 flex items-center gap-2">
                          <Sparkles className="w-3 h-3" /> AI Insights
                        </h4>
                        <div className="space-y-3">
                          {generatedProblem.hints.map((hint: string, i: number) => (
                            <div key={i} className="text-sm text-[var(--foreground)]/70 flex gap-4 p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                              <span className="text-[var(--viz-red)] font-black text-xs mt-0.5">0{i+1}</span> 
                              <span className="font-medium">{hint}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="grid gap-6">
                {reports.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 bg-[var(--card)] rounded-3xl border border-[var(--border)] border-dashed">
                    <CheckCircle className="w-12 h-12 text-green-500/30 mb-4" />
                    <p className="text-[var(--foreground)]/50 font-bold">All reports cleared. Good job!</p>
                  </motion.div>
                ) : (
                  reports.map((report, idx) => (
                    <motion.div 
                      key={report.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-500/20">
                              {report.reason}
                            </div>
                            <span className="text-[var(--foreground)]/30 text-xs font-bold flex items-center gap-2">
                              <Clock className="w-3 h-3" /> {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-500/20 to-orange-500/20 flex items-center justify-center font-black text-red-500 text-lg">
                              {report.submission.user.name[0]}
                            </div>
                            <div>
                                <Link href={`/profile/${report.submission.user.id}`} className="text-xl font-black hover:text-[var(--viz-red)] transition-colors">
                                    {report.submission.user.name}
                                </Link>
                                <p className="text-sm text-[var(--foreground)]/50 font-medium">Warnings: {report.submission.user.warnings}/3 • {report.submission.user.isBanned ? <span className="text-red-500">BANNED</span> : "Active"}</p>
                            </div>
                          </div>

                          <div className="bg-[var(--background)] p-6 rounded-2xl border border-[var(--border)] group relative">
                            <div className="absolute top-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link href={`/problems/${report.submission.problem.slug}`} className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1">
                                    View Problem <ArrowUpRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <p className="text-[10px] font-black text-[var(--foreground)]/30 uppercase mb-3">Submitted Code</p>
                            <pre className="text-sm font-mono leading-relaxed overflow-x-auto">{report.submission.code}</pre>
                          </div>
                        </div>

                        <div className="flex lg:flex-col gap-3 w-full lg:w-48">
                          <button 
                            onClick={() => handleAction("WARN", report)}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-500/10 text-red-600 rounded-2xl font-black text-sm hover:bg-red-500/20 transition-all border border-red-500/20"
                          >
                            <AlertTriangle className="w-4 h-4" /> Warn
                          </button>
                          <button 
                            onClick={() => handleAction("BAN", report)}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-sm hover:bg-red-500/20 transition-all border border-red-500/20"
                          >
                            <Ban className="w-4 h-4" /> Ban
                          </button>
                          <button 
                            onClick={() => handleAction("DISMISS", report)}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[var(--background)] text-[var(--foreground)]/60 rounded-2xl font-black text-sm hover:bg-[var(--muted)] transition-all border border-[var(--border)]"
                          >
                            <CheckCircle className="w-4 h-4" /> Dismiss
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
            </div>
          )}

          {activeTab === "users" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--background)] border-b border-[var(--border)]">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-bold text-[var(--foreground)]/30 uppercase tracking-widest">User</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-[var(--foreground)]/30 uppercase tracking-widest">Role</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-[var(--foreground)]/30 uppercase tracking-widest">Submissions</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-[var(--foreground)]/30 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-[var(--foreground)]/30 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {filteredUsers.map((user, idx) => (
                                <motion.tr 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: idx * 0.02 }}
                                  key={user.id} 
                                  className="group hover:bg-[var(--foreground)]/5 transition-colors"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--viz-red)]/10 flex items-center justify-center font-black text-[var(--viz-red)] text-sm">
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <Link href={`/profile/${user.id}`} className="font-black text-[var(--foreground)] group-hover:text-[var(--viz-red)] transition-colors block">
                                                    {user.name}
                                                </Link>
                                                <div className="text-xs text-[var(--foreground)]/40 font-medium">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 font-black text-sm">{user._count.submissions}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.isBanned ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`} />
                                            <span className={`text-xs font-black uppercase tracking-widest ${user.isBanned ? 'text-red-500' : 'text-green-500'}`}>
                                                {user.isBanned ? "Banned" : "Active"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleBanToggle(user.id, user.isBanned)}
                                            className={`p-2.5 rounded-xl transition-all ${user.isBanned ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20" : "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"}`}
                                            title={user.isBanned ? "Unban User" : "Ban User"}
                                        >
                                            {user.isBanned ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                        </motion.button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
          )}

          {activeTab === "problems" && (
            <div className="space-y-6">
                <div className="flex justify-between items-center bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)]">
                    <div className="flex items-center gap-4 text-sm font-bold text-[var(--foreground)]/60">
                        <Activity className="w-5 h-5 text-[var(--viz-red)]" />
                        Showing {filteredProblems.length} repository assets
                    </div>
                    <Link
                        href="/problems/new"
                        className="px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-2xl text-sm font-black hover:brightness-110 flex items-center gap-2 transition-all shadow-lg"
                    >
                        <Plus className="w-5 h-5" /> New Problem
                    </Link>
                </div>

                <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--background)] border-b border-[var(--border)]">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-[var(--foreground)]/30 uppercase tracking-[0.2em]">Asset Title</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[var(--foreground)]/30 uppercase tracking-[0.2em]">Complexity</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[var(--foreground)]/30 uppercase tracking-[0.2em]">Taxonomy</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[var(--foreground)]/30 uppercase tracking-[0.2em]">Visibility</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[var(--foreground)]/30 uppercase tracking-[0.2em]">Direct Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {filteredProblems.map((problem, idx) => (
                                    <motion.tr 
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: idx * 0.02 }}
                                      key={problem.id} 
                                      className="group hover:bg-[var(--foreground)]/5 transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <Link href={`/problems/${problem.slug}`} className="font-black text-[var(--foreground)] group-hover:text-[var(--viz-red)] transition-colors block">
                                                {problem.title}
                                            </Link>
                                            <div className="text-xs text-[var(--foreground)]/40 font-medium">
                                                by {problem.creator?.name || "System"}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                problem.difficulty === 'Medium' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                'bg-red-500/10 text-red-500 border border-red-500/20'
                                            }`}>
                                                {problem.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-medium">{problem.category}</td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${problem.isPublic ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                                {problem.isPublic ? "Public" : "Private"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 flex gap-2">
                                            <button
                                                onClick={() => handleGenerateTestCases(problem.id)}
                                                className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-all"
                                                title="Re-architect Test Cases"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                            </button>
                                            <Link
                                                href={`/problems/${problem.slug}/edit`}
                                                className="p-2.5 rounded-xl bg-[var(--background)] text-[var(--foreground)]/60 hover:text-[var(--foreground)] border border-[var(--border)] transition-all"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleVisibilityToggle(problem.id, problem.isPublic)}
                                                className={`p-2.5 rounded-xl transition-all ${problem.isPublic ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" : "bg-green-500/10 text-green-500 border border-green-500/20"}`}
                                            >
                                                {problem.isPublic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
          )}

          {activeTab === "ai_verification" && (
            <div className="space-y-6">
                <div className="flex items-center gap-4 bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)]">
                    <div className="p-3 bg-[var(--viz-red)]/10 rounded-2xl">
                        <Sparkles className="w-8 h-8 text-[var(--viz-red)]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[var(--foreground)]">Problem Verification</h2>
                        <p className="text-sm text-[var(--foreground)]/50 font-medium">Verify and approve new problems before they are made public.</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {problems.filter(p => !p.isVerified).map((problem, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={problem.id} 
                        className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-[var(--viz-red)]/50 transition-all"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-[var(--viz-red)] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">New Draft</span>
                            <h3 className="font-bold text-lg text-[var(--foreground)]">{problem.title}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-bold text-[var(--foreground)]/40 uppercase">
                            <span>{problem.category}</span>
                            <span className="w-1 h-1 bg-[var(--border-strong)] rounded-full" />
                            <span className={
                              problem.difficulty === 'Easy' ? 'text-green-500' :
                              problem.difficulty === 'Medium' ? 'text-red-500' : 'text-red-500'
                            }>{problem.difficulty}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <Link 
                            href={`/problems/${problem.slug}`}
                            className="flex-1 md:flex-none p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]/60 hover:text-[var(--foreground)] flex justify-center transition-all"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => handleVerify(problem.id, true)}
                            className="flex-[2] md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-[var(--viz-red)] text-white font-black rounded-xl shadow-lg shadow-red-900/20 hover:brightness-110 transition-all"
                          >
                            <Check className="w-5 h-5" /> Approve
                          </button>
                          <button 
                            onClick={() => handleVerify(problem.id, false)}
                            className="flex-1 md:flex-none p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 flex justify-center transition-all"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </div>
            </div>
          )}

          {activeTab === "verifications" && (
            <div className="grid gap-6">
                {pendingStudyPlans.map((plan, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={plan.id} 
                    className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 flex flex-col lg:flex-row gap-10"
                  >
                    <div className="flex-1 space-y-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-black text-[var(--foreground)]">{plan.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              plan.status === "PENDING_PUBLISH" ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                            }`}>
                              {plan.status === "PENDING_PUBLISH" ? "Ingress Request" : "Mutation Request"}
                            </span>
                          </div>
                          <div className="flex items-center gap-6 text-xs font-bold text-[var(--foreground)]/40 uppercase">
                            <div className="flex items-center gap-2">
                              <Users className="w-3.5 h-3.5" /> {plan.creator?.name || "Anonymous"}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5" /> {new Date(plan.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Link 
                          href={`/study-plans/${plan.slug}`}
                          target="_blank"
                          className="p-3 bg-[var(--background)] border border-[var(--border)] hover:border-[var(--viz-red)] rounded-2xl text-[var(--foreground)]/40 hover:text-[var(--viz-red)] transition-all"
                        >
                          <ArrowUpRight className="w-6 h-6" />
                        </Link>
                      </div>

                      <p className="text-base text-[var(--foreground)]/70 font-medium leading-relaxed">
                        {plan.description}
                      </p>

                      {plan.status === "PENDING_UPDATE" && plan.pendingData && (
                         <div className="p-6 bg-orange-500/5 border border-orange-500/20 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/50" />
                            <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                               <AlertTriangle className="w-4 h-4" /> Diff detected in request
                            </h4>
                            <div className="text-sm text-[var(--foreground)]/80 space-y-3 font-medium">
                               {plan.pendingData.title !== plan.title && <div className="flex gap-2"><span className="text-orange-500 font-black tracking-tighter">NEW_TITLE:</span> {plan.pendingData.title}</div>}
                               {plan.pendingData.description !== plan.description && <div className="flex gap-2"><span className="text-orange-500 font-black tracking-tighter">NEW_DESC:</span> {plan.pendingData.description}</div>}
                            </div>
                         </div>
                      )}
                    </div>

                    <div className="flex lg:flex-col justify-end gap-3 min-w-[200px]">
                      <button
                        onClick={() => handleStudyPlanReview(plan.id, "APPROVE")}
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-900/20 transition-all disabled:opacity-50"
                      >
                        <Check className="w-5 h-5" /> Commit Plan
                      </button>
                      <button
                        onClick={() => handleStudyPlanReview(plan.id, "REJECT")}
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-[var(--background)] text-red-500 border border-red-500/20 hover:bg-red-500/5 rounded-2xl font-black text-sm transition-all disabled:opacity-50"
                      >
                        <X className="w-5 h-5" /> Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
