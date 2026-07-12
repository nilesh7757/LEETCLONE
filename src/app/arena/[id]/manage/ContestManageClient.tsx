"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Box, Target, 
  Cpu, Activity, Clock, 
  Settings, Loader2,
  Megaphone, LayoutTemplate, Save, ArrowLeft, PlusCircle,
  Trash, Play, Terminal, Pencil, Trash2, Rocket
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";
import ProblemForm, { ProblemFormData } from "@/features/problems/components/ProblemForm";

interface ProblemUnit {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  verificationStatus: string;
  referenceSolution?: string;
}

interface Announcement {
  id: string;
  message: string;
  createdAt: string;
}

interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  visibility: string;
  accessCode?: string;
  scoringProtocol: string;
  status: string;
  publishProblems: boolean;
  problems: ProblemUnit[];
  creatorId: string;
}

export default function ContestManageClient({ contestId }: { contestId: string }) {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"settings" | "problems" | "announcements" | "sandbox">("settings");
  
  // Announcement States
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Inline Problem Editing States
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingProblemData, setEditingProblemData] = useState<any>(null);
  const [loadingProblem, setLoadingProblem] = useState(false);

  // Sandbox States
  const [sandboxCode, setSandboxCode] = useState("");
  const [sandboxInput, setSandboxInput] = useState("");
  const [sandboxResult, setSandboxResult] = useState<{
    status: string;
    runtime?: number;
    actual?: string;
    error?: string;
  } | null>(null);
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    visibility: "PUBLIC",
    accessCode: "",
    scoringProtocol: "FIXED",
    status: "DRAFT",
    publishProblems: false
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchContest = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/contest/${contestId}`);
      setContest(data.contest);
      setSettings({
        title: data.contest.title,
        description: data.contest.description,
        startTime: new Date(data.contest.startTime).toISOString().slice(0, 16),
        endTime: new Date(data.contest.endTime).toISOString().slice(0, 16),
        visibility: data.contest.visibility,
        accessCode: data.contest.accessCode || "",
        scoringProtocol: data.contest.scoringProtocol,
        status: data.contest.status,
        publishProblems: data.contest.publishProblems
      });
      
      // Verification: Only creator or admin
      if (authStatus === "authenticated" && session?.user?.id !== data.contest.creatorId && session?.user?.role !== "ADMIN") {
          toast.error("Unauthorized access");
          router.push(`/arena/${contestId}`);
      }
    } catch (err) {
      toast.error("Failed to load contest data");
    } finally {
      setLoading(false);
    }
  }, [contestId, authStatus, session, router]);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/contest/${contestId}/announcements`);
      setAnnouncements(data.announcements);
    } catch (err) {
      console.error("Failed to load announcements");
    }
  }, [contestId]);

  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/login");
    if (authStatus === "authenticated") {
        fetchContest();
        fetchAnnouncements();
    }
  }, [authStatus, fetchContest, fetchAnnouncements, router]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await axios.patch(`/api/contest/${contestId}`, settings);
      toast.success("Contest configuration updated");
      fetchContest();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Update failed");
      } else {
        toast.error("Update failed");
      }
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleBroadcast = async () => {
    if (!newAnnouncement.trim()) return;
    setIsBroadcasting(true);
    try {
      await axios.post(`/api/contest/${contestId}/announcements`, { message: newAnnouncement });
      toast.success("Announcement broadcasted");
      setNewAnnouncement("");
      fetchAnnouncements();
    } catch (err) {
      toast.error("Broadcast failed");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleRemoveFromContest = async (problemId: string) => {
    const currentProblemIds = contest?.problems.map(p => p.id) || [];
    try {
      await axios.patch(`/api/contest/${contestId}`, {
        problemIds: currentProblemIds.filter(id => id !== problemId)
      });
      toast.success("Problem removed from contest");
      fetchContest();
    } catch (err: unknown) {
      toast.error("Removal failed");
    }
  };

  const handleCreateProblem = async (data: ProblemFormData) => {
    try {
      await axios.post("/api/problems/create", {
        ...data,
        isPublic: false,
        contestId: contestId
      }, {
        headers: { "x-source": "FOUNDRY" }
      });
      toast.success("Contest unit established");
      fetchContest();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Creation failed");
      } else {
        toast.error("Creation failed");
      }
    }
  };

   const handleDestroyProblem = async (problemId: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this problem? This cannot be undone.")) return;
    try {
      await axios.delete(`/api/problems/id/${problemId}`);
      toast.success("Problem deleted successfully");
      fetchContest();
    } catch (err) {
      toast.error("Failed to delete problem");
    }
  };

  const startEditingProblem = async (problemId: string) => {
    try {
      setLoadingProblem(true);
      const { data } = await axios.get(`/api/problems/id/${problemId}`);
      setEditingProblemId(problemId);
      setEditingProblemData(data);
    } catch (err) {
      toast.error("Failed to fetch problem data");
    } finally {
      setLoadingProblem(false);
    }
  };

  const handleSaveProblem = async (problemId: string, formData: ProblemFormData) => {
    try {
      await axios.patch(`/api/problems/id/${problemId}/update`, formData);
      toast.success("Problem saved successfully");
      setEditingProblemId(null);
      setEditingProblemData(null);
      fetchContest();
    } catch (err) {
      toast.error("Failed to save problem");
    }
  };

  const initializeNewProblem = async () => {
    try {
       const { data } = await axios.post("/api/problems/create", {
          title: "Untitled Problem",
          slug: `contest-${contestId}-${Date.now()}`,
          difficulty: "Easy",
          category: "General",
          description: "Problem statement here...",
          examplesInput: [],
          testCasesInput: [],
          referenceSolution: "// write your solution",
          language: "javascript",
          timeLimit: 2000,
          memoryLimit: 256,
          isPublic: false,
          contestId: contestId
       });
       toast.success("Problem initialized");
       await fetchContest();
       setEditingProblemId(data.id);
       setEditingProblemData({
          title: "Untitled Problem",
          slug: `contest-${contestId}-${Date.now()}`,
          difficulty: "Easy",
          category: "General",
          description: "Problem statement here...",
          examplesInput: [],
          testCasesInput: [],
          referenceSolution: "// write your solution",
          language: "javascript",
          timeLimit: 2000,
          memoryLimit: 256,
       });
    } catch (err) {
       toast.error("Failed to initialize problem");
    }
  };

  const handleRunSandbox = async () => {
    if (!sandboxCode) return;
    setIsSandboxRunning(true);
    setSandboxResult(null);
    try {
      const { data } = await axios.post("/api/run", {
        code: sandboxCode,
        testCases: [{ input: sandboxInput, expectedOutput: "" }],
        type: "CODING"
      });
      setSandboxResult(data.results[0]);
    } catch (err) {
      toast.error("Sandbox execution failed");
    } finally {
      setIsSandboxRunning(false);
    }
  };

  if (loading) return (
    <div className="h-screen bg-[var(--background)] flex items-center justify-center font-mono">
       <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">Syncing Control Center...</p>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[var(--primary)]/30 flex flex-col">
      
      {/* 1. MANAGEMENT HEADER */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-between px-8 sticky top-0 z-50">
         <div className="flex items-center gap-8">
            <Link href={`/arena/${contestId}`} className="group flex items-center gap-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all">
               <div className="p-2 bg-[var(--foreground)]/5 rounded-lg group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)] transition-all">
                  <ArrowLeft size={16} />
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest">Back to Arena</span>
            </Link>
            <div className="h-4 w-px border-[var(--border)]" />
            <div className="flex flex-col">
               <span className="text-[9px] font-bold text-[var(--primary)] uppercase tracking-widest">Contest Manager</span>
               <h1 className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight">{contest?.title}</h1>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--foreground)]/5 border border-[var(--border)]">
               <div className={`w-1.5 h-1.5 rounded-full ${contest?.status === 'LIVE' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
               <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">{contest?.status}</span>
            </div>
            <button 
               onClick={handleSaveSettings}
               disabled={isSavingSettings}
               className="px-6 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[var(--primary)] hover:text-[var(--foreground)] transition-all flex items-center gap-2 disabled:opacity-50"
            >
               {isSavingSettings ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
               Save Changes
            </button>
         </div>
      </header>

      <div className="flex-1 flex min-h-0 overflow-hidden">
         {/* 2. NAVIGATION SIDEBAR */}
         <aside className="w-64 border-r border-[var(--border)] bg-[var(--background)] p-4 flex flex-col gap-2">
            {[
               { id: 'settings', label: 'General Info', icon: Settings },
               { id: 'problems', label: 'Contest Problems', icon: Target },
               { id: 'announcements', label: 'Announcements', icon: Megaphone },
               { id: 'sandbox', label: 'Code Sandbox', icon: Cpu },
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "settings" | "problems" | "announcements" | "sandbox")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                     activeTab === tab.id 
                     ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                     : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                  }`}
               >
                  <tab.icon size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
               </button>
            ))}
         </aside>

         {/* 3. MAIN DASHBOARD AREA */}
         <main className="flex-1 overflow-y-auto custom-scrollbar p-12 bg-[var(--background)]">
            <AnimatePresence mode="wait">
               {activeTab === 'settings' && (
                  <motion.div 
                     key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                     className="max-w-4xl space-y-12"
                  >
                     <section className="space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
                              <Settings size={20} />
                           </div>
                           <h2 className="text-2xl font-black uppercase tracking-tight text-[var(--foreground)]">Basic Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-8 p-8 bg-[var(--foreground)]/2 border border-[var(--border)] rounded-[2rem]">
                           <div className="space-y-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Contest Title</label>
                              <input 
                                 value={settings.title} onChange={e => setSettings({...settings, title: e.target.value})}
                                 className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-lg font-bold text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]/50 transition-all"
                                 placeholder="Enter contest title..."
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Description & Rules</label>
                              <textarea 
                                 value={settings.description} onChange={e => setSettings({...settings, description: e.target.value})}
                                 className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-sm text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]/50 transition-all min-h-[120px] resize-none"
                                 placeholder="Enter contest description and rules..."
                              />
                           </div>
                           <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-3">
                                 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Visibility</label>
                                 <select 
                                    value={settings.visibility} onChange={e => setSettings({...settings, visibility: e.target.value})}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)] outline-none focus:border-[var(--primary)]/50"
                                 >
                                    <option value="PUBLIC">Public</option>
                                    <option value="PRIVATE">Private</option>
                                    <option value="PROTECTED">Protected (Access Code)</option>
                                 </select>
                              </div>
                              {settings.visibility === 'PROTECTED' && (
                                 <div className="space-y-3">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--primary)] ml-1">Access Code</label>
                                    <input 
                                       value={settings.accessCode} onChange={e => setSettings({...settings, accessCode: e.target.value})}
                                       className="w-full bg-[var(--background)] border border-[var(--primary)]/20 rounded-2xl py-4 px-6 text-[10px] font-mono font-bold text-[var(--primary)] outline-none"
                                       placeholder="e.g. SECRET123"
                                    />
                                 </div>
                              )}
                           </div>
                        </div>
                     </section>

                     <section className="space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
                              <Clock size={20} />
                           </div>
                           <h2 className="text-2xl font-black uppercase tracking-tight text-[var(--foreground)]">Date & Time</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-8 p-8 bg-[var(--foreground)]/2 border border-[var(--border)] rounded-[2rem]">
                           <div className="space-y-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Start Time</label>
                              <input 
                                 type="datetime-local" value={settings.startTime} onChange={e => setSettings({...settings, startTime: e.target.value})}
                                 className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-[10px] font-bold uppercase text-[var(--foreground)] outline-none"
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">End Time</label>
                              <input 
                                 type="datetime-local" value={settings.endTime} onChange={e => setSettings({...settings, endTime: e.target.value})}
                                 className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-[10px] font-bold uppercase text-[var(--foreground)] outline-none"
                              />
                           </div>
                        </div>
                     </section>

                     <section className="space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
                              <Activity size={20} />
                           </div>
                           <h2 className="text-2xl font-black uppercase tracking-tight text-[var(--foreground)]">Scoring & Status</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-8 p-8 bg-[var(--foreground)]/2 border border-[var(--border)] rounded-[2rem]">
                           <div className="space-y-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Scoring Type</label>
                              <select 
                                 value={settings.scoringProtocol} onChange={e => setSettings({...settings, scoringProtocol: e.target.value})}
                                 className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)] outline-none"
                              >
                                 <option value="FIXED">Fixed Points</option>
                                 <option value="DECAY">Point Decay</option>
                              </select>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Contest Status</label>
                              <select 
                                 value={settings.status} onChange={e => setSettings({...settings, status: e.target.value})}
                                 className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)] outline-none"
                              >
                                 <option value="DRAFT">Draft</option>
                                 <option value="VETTING">Review</option>
                                 <option value="READY">Ready</option>
                                 <option value="LIVE">Live</option>
                                 <option value="ENDED">Ended</option>
                              </select>
                           </div>
                           <div className="col-span-2 pt-4 border-t border-[var(--border)]">
                              <div className="flex items-center justify-between">
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold text-[var(--foreground)]">Public Availability</span>
                                    <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">Allow problems to be added to the public set after contest</span>
                                 </div>
                                 <div className="relative inline-flex items-center h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none bg-[var(--foreground)]/5">
                                    <input 
                                       type="checkbox" checked={settings.publishProblems} 
                                       onChange={e => setSettings({...settings, publishProblems: e.target.checked})}
                                       className="sr-only peer" 
                                    />
                                    <div className="w-9 h-5 bg-[#262626] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--foreground)] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[var(--foreground)] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary)]" />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </section>
                  </motion.div>
               )}

               {activeTab === 'problems' && (
                  <motion.div 
                     key="problems" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                     className="space-y-6"
                  >
                     {loadingProblem ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-4">
                           <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
                           <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] font-bold">Synchronizing Problem Template...</p>
                        </div>
                     ) : editingProblemId && editingProblemData ? (
                        <div className="space-y-6">
                           <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                              <button 
                                 onClick={() => {
                                    setEditingProblemId(null);
                                    setEditingProblemData(null);
                                 }}
                                 className="px-4 py-2 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl text-xs font-bold uppercase tracking-widest hover:text-[var(--foreground)] transition-all flex items-center gap-2 cursor-pointer border-none"
                              >
                                 <ArrowLeft size={14} /> Back to Contest Problems
                              </button>
                           </div>
                           <ProblemForm 
                              problemId={editingProblemId}
                              initialData={editingProblemData}
                              isEditing={true}
                              onSubmit={async (data) => {
                                 await handleSaveProblem(editingProblemId, data);
                              }}
                           />
                        </div>
                     ) : (
                        <>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
                                    <Target size={20} />
                                 </div>
                                 <div className="flex flex-col">
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-[var(--foreground)]">Contest Problems</h2>
                                    <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">{contest?.problems.length} Problems Added</span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <Link 
                                    href="/studio"
                                    className="px-6 py-2.5 bg-[var(--foreground)]/5 border border-[var(--border)] hover:border-[var(--primary)]/30 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
                                 >
                                    <Box size={14} /> Add from Studio
                                 </Link>
                                 <button 
                                    onClick={initializeNewProblem}
                                    className="px-6 py-2.5 bg-[var(--primary)] text-[var(--foreground)] rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#2563eb] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.2)] cursor-pointer"
                                 >
                                    <PlusCircle size={14} /> Create New Problem
                                 </button>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 gap-3">
                              {contest?.problems.length === 0 ? (
                                 <div className="py-24 text-center border-2 border-dashed border-[var(--border)] rounded-[2rem]">
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--foreground)]/5 flex items-center justify-center mx-auto mb-4 text-[#262626]">
                                       <LayoutTemplate size={24} />
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">No problems assigned to this contest yet.</p>
                                 </div>
                              ) : (
                                 contest?.problems.map((problem, index) => (
                                    <div 
                                       key={problem.id}
                                       className="group flex items-center justify-between p-6 bg-[var(--foreground)]/2 border border-[var(--border)] hover:border-[var(--primary)]/30 rounded-2xl transition-all duration-300"
                                     >
                                       <div className="flex items-center gap-6">
                                          <div className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[11px] font-black text-[var(--muted-foreground)] group-hover:text-[var(--primary)]">
                                             {String.fromCharCode(65 + index)}
                                          </div>
                                          <div className="flex flex-col">
                                             <h3 className="text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{problem.title}</h3>
                                             <div className="flex items-center gap-3">
                                                <span className={`text-[8px] font-black uppercase tracking-widest ${
                                                   problem.difficulty === 'Easy' ? 'text-green-500' : problem.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'
                                                }`}>{problem.difficulty}</span>
                                                <span className="text-[9px] font-mono text-[#262626] uppercase tracking-widest">{problem.category}</span>
                                             </div>
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-3">
                                          <button 
                                             onClick={() => startEditingProblem(problem.id)} 
                                             className="p-3 bg-[var(--foreground)]/5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--primary)]/20 transition-all border border-transparent hover:border-[var(--primary)]/20 cursor-pointer" 
                                             title="Edit Problem"
                                          >
                                             <Pencil size={16} />
                                          </button>
                                          <button 
                                             onClick={() => handleRemoveFromContest(problem.id)}
                                             className="p-3 bg-[var(--foreground)]/5 rounded-xl text-[var(--muted-foreground)] hover:text-amber-500 hover:bg-amber-500/10 transition-all border border-transparent hover:border-amber-500/20 cursor-pointer"
                                             title="Remove from Contest"
                                          >
                                             <Trash size={16} />
                                          </button>
                                          <button 
                                             onClick={() => handleDestroyProblem(problem.id)}
                                             className="p-3 bg-[var(--foreground)]/5 rounded-xl text-[var(--muted-foreground)] hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20 cursor-pointer"
                                             title="Delete Permanently"
                                          >
                                             <Trash2 size={16} />
                                          </button>
                                       </div>
                                    </div>
                                 ))
                              )}
                           </div>
                        </>
                     )}
                  </motion.div>
               )}

               {activeTab === 'announcements' && (
                  <motion.div 
                     key="announcements" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                     className="space-y-12 max-w-4xl"
                  >
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
                           <Megaphone size={20} />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-[var(--foreground)]">Announcement Center</h2>
                     </div>

                     <div className="p-8 bg-[var(--foreground)]/2 border border-[var(--border)] rounded-[2.5rem] space-y-6">
                        <textarea 
                           value={newAnnouncement} onChange={e => setNewAnnouncement(e.target.value)}
                           className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-6 px-8 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]/50 transition-all min-h-[160px] resize-none text-sm leading-relaxed"
                           placeholder="Type a message to all participants..."
                        />
                        <div className="flex justify-end">
                           <button 
                              onClick={handleBroadcast}
                              disabled={isBroadcasting || !newAnnouncement.trim()}
                              className="px-8 py-3 bg-[var(--primary)] text-[var(--foreground)] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#2563eb] transition-all flex items-center gap-3 shadow-xl active:scale-95 disabled:opacity-30"
                           >
                              {isBroadcasting ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
                              Send Announcement
                           </button>
                        </div>
                     </div>

                     <div className="space-y-6 pt-12 border-t border-[var(--border)]">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">History</h3>
                        <div className="space-y-4">
                           {announcements.length === 0 ? (
                              <p className="text-[9px] font-bold text-[#262626] uppercase tracking-widest">No previous announcements.</p>
                           ) : (
                              announcements.map(a => (
                                 <div key={a.id} className="p-6 bg-[var(--foreground)]/1 border border-[var(--border)] rounded-2xl flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                       <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">Sent Successfully</span>
                                       <span className="text-[9px] font-mono text-[#262626]">{new Date(a.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed italic border-l-2 border-[var(--primary)]/20 pl-4">{a.message}</p>
                                 </div>
                              ))
                           )}
                        </div>
                     </div>
                  </motion.div>
               )}

               {activeTab === 'sandbox' && (
                  <motion.div 
                     key="sandbox" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                     className="max-w-6xl space-y-12"
                  >
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
                              <Cpu size={20} />
                           </div>
                           <div className="flex flex-col">
                              <h2 className="text-2xl font-black uppercase tracking-tight text-[var(--foreground)]">Execution Sandbox</h2>
                              <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">Test problems against input</span>
                           </div>
                        </div>
                        <button 
                           onClick={handleRunSandbox}
                           disabled={isSandboxRunning || !sandboxCode}
                           className="px-8 py-3 bg-[var(--primary)] text-[var(--foreground)] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#2563eb] transition-all flex items-center gap-3 shadow-xl disabled:opacity-30"
                        >
                           {isSandboxRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                           Run Code
                        </button>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Editor Side */}
                        <div className="space-y-6">
                           <div className="space-y-3">
                              <div className="flex items-center justify-between px-1">
                                 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Code</label>
                                 <select 
                                    className="bg-transparent border-none text-[9px] font-black text-[var(--primary)] uppercase tracking-widest focus:ring-0"
                                    onChange={(e) => {
                                       const p = contest?.problems.find(p => p.id === e.target.value);
                                       if (p) setSandboxCode(p.referenceSolution || "");
                                    }}
                                 >
                                    <option value="">Load Problem Template...</option>
                                    {contest?.problems.map(p => (
                                       <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                 </select>
                              </div>
                              <div className="relative group">
                                 <div className="absolute inset-0 bg-[var(--primary)]/5 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-all" />
                                 <textarea 
                                    value={sandboxCode} onChange={e => setSandboxCode(e.target.value)}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[2rem] p-8 font-mono text-xs text-[var(--foreground)] min-h-[400px] focus:outline-none focus:border-[var(--primary)]/30 transition-all relative z-10"
                                    placeholder="// Paste code or load a template above..."
                                 />
                              </div>
                           </div>

                           <div className="space-y-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Input (STDIN)</label>
                              <textarea 
                                 value={sandboxInput} onChange={e => setSandboxInput(e.target.value)}
                                 className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 font-mono text-[10px] text-[var(--muted-foreground)] min-h-[120px] focus:outline-none focus:border-[var(--primary)]/30 transition-all"
                                 placeholder="e.g. 5\n1 2 3 4 5"
                              />
                           </div>
                        </div>

                        {/* Result Side */}
                        <div className="space-y-6 flex flex-col">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Console Output</label>
                           <div className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-[2rem] overflow-hidden flex flex-col">
                              <div className="h-10 border-b border-[var(--border)] bg-[var(--foreground)]/2 flex items-center px-6 gap-2">
                                 <Terminal size={14} className="text-[var(--muted-foreground)]" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Output Console</span>
                              </div>
                              <div className="flex-1 p-8 font-mono text-xs overflow-y-auto custom-scrollbar">
                                 {isSandboxRunning ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-4 opacity-30">
                                       <Loader2 className="animate-spin" size={24} />
                                       <span className="text-[10px] uppercase tracking-widest">Running...</span>
                                    </div>
                                 ) : sandboxResult ? (
                                    <div className="space-y-8">
                                       <div className="flex items-center gap-6">
                                          <div className="flex flex-col gap-1">
                                             <span className="text-[8px] font-bold text-[var(--muted-foreground)] uppercase">Status</span>
                                             <span className={`text-[10px] font-black uppercase ${sandboxResult.status === 'Accepted' ? 'text-green-500' : 'text-rose-500'}`}>{sandboxResult.status}</span>
                                          </div>
                                          <div className="flex flex-col gap-1">
                                             <span className="text-[8px] font-bold text-[var(--muted-foreground)] uppercase">Runtime</span>
                                             <span className="text-[10px] font-black text-[var(--foreground)]">{sandboxResult.runtime?.toFixed(0)}ms</span>
                                          </div>
                                       </div>

                                       <div className="space-y-3">
                                          <span className="text-[8px] font-bold text-[var(--muted-foreground)] uppercase">Stdout</span>
                                          <pre className="p-4 bg-[var(--foreground)]/5 rounded-xl text-[var(--foreground)] whitespace-pre-wrap">{sandboxResult.actual || "(No output)"}</pre>
                                       </div>

                                       {sandboxResult.error && (
                                          <div className="space-y-3">
                                             <span className="text-[8px] font-bold text-rose-500 uppercase tracking-widest">System Error</span>
                                             <pre className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 whitespace-pre-wrap">{sandboxResult.error}</pre>
                                          </div>
                                       )}
                                    </div>
                                 ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-10 italic">
                                       <Terminal size={48} className="mb-4" />
                                       <p className="text-[10px] uppercase tracking-widest">Awaiting execution...</p>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </main>
      </div>

      <style jsx global>{`
         .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--foreground)/5; border-radius: 10px; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--foreground)/10; }
      `}</style>
    </div>
  );
}
