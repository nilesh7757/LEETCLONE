"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import { 
  Trophy, Settings, Target, Megaphone, Users, 
  Plus, Search, ArrowLeft, Save, Loader2,
  Clock, Activity, Globe, ShieldCheck, CheckCircle2,
  X, Layers, Trash2, ArrowRight, Clipboard, UserPlus,
  Share2, MessageSquare, PlusCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface ContestProblem {
  id: string;
  title: string;
  difficulty: string;
  category: string;
}

interface Contest {
  id: string;
  title: string;
  description: string;
  status: string;
  visibility: string;
  startTime: string | null;
  endTime: string | null;
  problems: ContestProblem[];
}

export default function StudioContestEditor() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"general" | "problems" | "announcements" | "collaborators">("general");
  const [isSaving, setIsSaving] = useState(false);

  // Problem management states
  const [myProblems, setMyProblems] = useState<ContestProblem[]>([]);
  const [problemSearch, setProblemSearch] = useState("");
  const [isAddingProblem, setIsAddingProblem] = useState(false);

  // Collaborator states
  const [newCollabUsername, setNewCollabUsername] = useState("");
  const [collabRole, setCollabRole] = useState("SETTER");

  const fetchContest = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/contest/${id}`);
      setContest(data.contest);
    } catch (err) {
      toast.error("Failed to load contest");
      router.push("/studio");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const fetchMyProblems = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/problems?tab=mine&foundry=true");
      setMyProblems(data.problems);
    } catch (err) {
      console.error("Failed to fetch problems");
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetchContest();
      fetchMyProblems();
    }
  }, [status, fetchContest, fetchMyProblems, router]);

  const handleUpdate = async (updateData: Partial<Contest> | Record<string, unknown>) => {
    setIsSaving(true);
    try {
      await axios.patch(`/api/contest/${id}/update`, updateData);
      toast.success("Contest updated");
      fetchContest();
    } catch (err: unknown) {
      toast.error("Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const addProblemToContest = async (problemId: string) => {
     if (!contest) return;
     const currentIds = contest.problems.map(p => p.id);
     if (currentIds.includes(problemId)) return;
     
     handleUpdate({ problemIds: [...currentIds, problemId] });
  };

  const removeProblemFromContest = async (problemId: string) => {
     if (!contest) return;
     const currentIds = contest.problems.map(p => p.id);
     handleUpdate({ problemIds: currentIds.filter(pid => pid !== problemId) });
  };

  if (loading) return (
     <main className="h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-10 h-10 border-2 border-[#3b82f6]/20 border-t-[#3b82f6] rounded-full animate-spin" />
           <p className="text-[10px] uppercase tracking-widest text-[#52525b]">Loading Manager...</p>
        </div>
     </main>
  );

  if (!contest) return null;

  return (
    <main className="flex flex-col h-screen bg-[#050505] overflow-hidden">
      {/* HEADER */}
      <header className="h-16 bg-[#080808] border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-[60]">
         <div className="flex items-center gap-6">
            <Link href="/studio" className="p-2 hover:bg-white/5 rounded-lg text-[#52525b] hover:text-white transition-all">
               <ArrowLeft size={18} />
            </Link>
            <div className="h-4 w-px bg-white/5" />
            <div className="flex flex-col">
               <span className="text-[9px] font-bold text-[#3b82f6] uppercase tracking-widest">Contest Manager</span>
               <h1 className="text-sm font-black text-white uppercase tracking-tight">{contest.title}</h1>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
               <div className={`w-1.5 h-1.5 rounded-full ${contest.status === 'LIVE' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
               <span className="text-[9px] font-bold uppercase tracking-widest text-[#a1a1aa]">{contest.status}</span>
            </div>
            <button 
               onClick={() => handleUpdate({})} 
               disabled={isSaving}
               className="px-6 py-2 bg-white text-black rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#3b82f6] hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
            >
               {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
               Save Changes
            </button>
         </div>
      </header>

      <div className="flex-1 flex min-h-0">
         {/* SIDEBAR */}
         <aside className="w-64 border-r border-white/5 bg-[#080808] p-4 flex flex-col gap-2">
            {[
               { id: 'general', label: 'General Info', icon: Settings },
               { id: 'problems', label: 'Problems', icon: Target },
               { id: 'announcements', label: 'Live Ops', icon: Megaphone },
               { id: 'collaborators', label: 'Collaborators', icon: Users },
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "general" | "problems" | "announcements" | "collaborators")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                     activeTab === tab.id 
                     ? "bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 shadow-lg" 
                     : "text-[#52525b] hover:text-white hover:bg-white/5"
                  }`}
               >
                  <tab.icon size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
               </button>
            ))}
         </aside>

         {/* CONTENT */}
         <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#050505] p-12">
            <AnimatePresence mode="wait">
               {activeTab === 'general' && (
                  <motion.div key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl space-y-12">
                     <section className="space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#3b82f6]">
                              <Settings size={20} />
                           </div>
                           <h2 className="text-2xl font-black uppercase tracking-tight text-white">Basic Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-8 p-8 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                           <div className="space-y-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b] ml-1">Contest Title</label>
                              <input 
                                 value={contest.title} onChange={e => setContest({...contest, title: e.target.value})}
                                 className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-lg font-bold text-white focus:outline-none focus:border-[#3b82f6]/50 transition-all"
                                 placeholder="Enter title..."
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b] ml-1">Description & Rules</label>
                              <textarea 
                                 value={contest.description} onChange={e => setContest({...contest, description: e.target.value})}
                                 className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-sm text-[#a1a1aa] focus:outline-none focus:border-[#3b82f6]/50 transition-all min-h-[120px] resize-none"
                                 placeholder="Enter rules..."
                              />
                           </div>
                           <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-3">
                                 <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b] ml-1">Visibility</label>
                                 <select 
                                    value={contest.visibility} onChange={e => setContest({...contest, visibility: e.target.value})}
                                    className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-white outline-none focus:border-[#3b82f6]/50"
                                 >
                                    <option value="PUBLIC">Public</option>
                                    <option value="PRIVATE">Private</option>
                                 </select>
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b] ml-1">Status</label>
                                 <select 
                                    value={contest.status} onChange={e => setContest({...contest, status: e.target.value})}
                                    className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-white outline-none focus:border-[#3b82f6]/50"
                                 >
                                    <option value="DRAFT">Draft</option>
                                    <option value="READY">Ready</option>
                                    <option value="LIVE">Live</option>
                                    <option value="ENDED">Ended</option>
                                 </select>
                              </div>
                           </div>
                        </div>
                     </section>

                     <section className="space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#3b82f6]">
                              <Clock size={20} />
                           </div>
                           <h2 className="text-2xl font-black uppercase tracking-tight text-white">Date & Time</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-8 p-8 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                           <div className="space-y-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b] ml-1">Start Time</label>
                              <input 
                                 type="datetime-local" value={contest.startTime ? new Date(contest.startTime).toISOString().slice(0, 16) : ""} 
                                 onChange={e => setContest({...contest, startTime: e.target.value})}
                                 className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-bold uppercase text-white outline-none"
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b] ml-1">End Time</label>
                              <input 
                                 type="datetime-local" value={contest.endTime ? new Date(contest.endTime).toISOString().slice(0, 16) : ""}
                                 onChange={e => setContest({...contest, endTime: e.target.value})}
                                 className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-bold uppercase text-white outline-none"
                              />
                           </div>
                        </div>
                     </section>
                  </motion.div>
               )}

               {activeTab === 'problems' && (
                  <motion.div key="problems" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-6xl space-y-12">
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <h2 className="text-2xl font-black uppercase tracking-tight text-white">Contest Problems</h2>
                           <p className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest">{contest.problems.length} problems added</p>
                        </div>
                        <button 
                           onClick={() => setIsAddingProblem(!isAddingProblem)}
                           className={`px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${isAddingProblem ? "bg-white/5 text-white" : "bg-[#3b82f6] text-white shadow-xl hover:bg-[#2563eb]"}`}
                        >
                           {isAddingProblem ? <X size={16} /> : <PlusCircle size={16} />}
                           {isAddingProblem ? "Close Selector" : "Add From Bank"}
                        </button>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* CURRENT PROBLEMS */}
                        <div className="space-y-4">
                           <h3 className="text-[10px] font-black uppercase tracking-widest text-[#52525b] ml-1">Current Roster</h3>
                           <div className="space-y-3">
                              {contest.problems.length === 0 ? (
                                 <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] text-[#262626] uppercase text-[10px] font-bold tracking-widest">No problems added yet</div>
                              ) : (
                                 contest.problems.map((p, idx) => (
                                    <div key={p.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-amber-500/30 transition-all">
                                       <div className="flex items-center gap-6">
                                          <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center font-black text-[#52525b] group-hover:text-amber-500">{String.fromCharCode(65 + idx)}</div>
                                          <div className="flex flex-col">
                                             <span className="text-sm font-bold text-white">{p.title}</span>
                                             <span className="text-[8px] uppercase font-bold text-[#52525b] tracking-widest">{p.difficulty} • {p.category}</span>
                                          </div>
                                       </div>
                                       <button onClick={() => removeProblemFromContest(p.id)} className="p-2 text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                          <Trash2 size={16} />
                                       </button>
                                    </div>
                                 ))
                              )}
                           </div>
                        </div>

                        {/* PROBLEM SELECTOR (INLINE) */}
                        <div className={`space-y-6 transition-all duration-500 ${isAddingProblem ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10 pointer-events-none"}`}>
                           <h3 className="text-[10px] font-black uppercase tracking-widest text-[#3b82f6] ml-1">My Problem Bank</h3>
                           <div className="relative">
                              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b]" />
                              <input 
                                 value={problemSearch} onChange={e => setProblemSearch(e.target.value)}
                                 placeholder="Filter bank..."
                                 className="w-full bg-black border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-[#3b82f6]/30 transition-all"
                              />
                           </div>
                           <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                              {myProblems.filter(p => p.title.toLowerCase().includes(problemSearch.toLowerCase())).map(p => {
                                 const isAlreadyAdded = contest.problems.some(cp => cp.id === p.id);
                                 return (
                                    <button 
                                       key={p.id} 
                                       disabled={isAlreadyAdded}
                                       onClick={() => addProblemToContest(p.id)}
                                       className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${isAlreadyAdded ? "bg-green-500/5 border-green-500/10 opacity-50" : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-[#3b82f6]/30"}`}
                                    >
                                       <div className="flex flex-col items-start text-left">
                                          <span className="text-xs font-bold text-white">{p.title}</span>
                                          <span className="text-[8px] uppercase text-[#52525b] font-bold">{p.difficulty}</span>
                                       </div>
                                       {isAlreadyAdded ? <CheckCircle2 size={16} className="text-green-500" /> : <Plus size={16} className="text-[#3b82f6]" />}
                                    </button>
                                 );
                              })}
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}

               {activeTab === 'collaborators' && (
                  <motion.div key="collaborators" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl space-y-12">
                     <section className="space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#3b82f6]">
                              <UserPlus size={20} />
                           </div>
                           <h2 className="text-2xl font-black uppercase tracking-tight text-white">Add Collaborators</h2>
                        </div>

                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex flex-col md:flex-row gap-6 items-end">
                           <div className="flex-1 space-y-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b] ml-1">Username or Email</label>
                              <input 
                                 value={newCollabUsername} onChange={e => setNewCollabUsername(e.target.value)}
                                 placeholder="Search by username..."
                                 className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-[#3b82f6]/50 transition-all"
                              />
                           </div>
                           <div className="w-48 space-y-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[#52525b] ml-1">Role</label>
                              <select 
                                 value={collabRole} onChange={e => setCollabRole(e.target.value)}
                                 className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-white outline-none"
                              >
                                 <option value="SETTER">Setter (Editor)</option>
                                 <option value="COORDINATOR">Coordinator (Management)</option>
                                 <option value="TESTER">Tester (Internal testing)</option>
                              </select>
                           </div>
                           <button className="px-10 py-4 bg-white text-black rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#3b82f6] hover:text-white transition-all shadow-xl active:scale-95">
                              Invite
                           </button>
                        </div>
                     </section>

                     <section className="space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#3b82f6]">
                              <Share2 size={20} />
                           </div>
                           <h2 className="text-2xl font-black uppercase tracking-tight text-white">Shareable Links</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {[
                              { role: 'Editor', icon: <PlusCircle size={14} />, desc: 'Allow others to manage problems and announcements.' },
                              { role: 'Tester', icon: <Activity size={14} />, desc: 'Allow others to test problems before the live date.' }
                           ].map(link => (
                              <div key={link.role} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4 hover:border-[#3b82f6]/20 transition-all group">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       <div className="p-2 bg-[#3b82f6]/10 rounded-lg text-[#3b82f6]">{link.icon}</div>
                                       <span className="text-sm font-bold text-white">{link.role} Link</span>
                                    </div>
                                    <button className="p-2 hover:bg-white/5 rounded-lg text-[#52525b] hover:text-[#3b82f6] transition-all">
                                       <Clipboard size={16} />
                                    </button>
                                 </div>
                                 <p className="text-[10px] text-[#52525b] uppercase tracking-widest leading-relaxed">{link.desc}</p>
                              </div>
                           ))}
                        </div>
                     </section>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>

      <style jsx global>{`
         .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </main>
  );
}
