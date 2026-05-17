"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import { 
  Zap, ChevronLeft, Cpu, ShieldCheck, Activity, 
  Terminal, Play, Target, CheckCircle2, AlertCircle,
  Database, LayoutTemplate, Code2, Binary, Users, UserPlus, X, Trash2, Loader2,
  FileText, Settings, Share2, Save, ArrowLeft, MessageSquare, Clipboard, Link as LinkIcon
} from "lucide-react";
import ProblemForm, { ProblemFormData } from "@/features/problems/components/ProblemForm";
import TestCaseEditor from "@/features/problems/components/TestCaseEditor";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Collaborator {
  id: string;
  userId: string;
  role: string;
  user: {
    name: string;
    email: string;
  }
}

interface Problem {
  id: string;
  title: string;
  verificationStatus: string;
  shareToken?: string;
  collaborators: Collaborator[];
}

export default function StudioProblemEditor() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"statement" | "testcases" | "solutions" | "collaborators" | "settings">("statement");
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Collaborator states
  const [newCollabUsername, setNewCollabUsername] = useState("");
  const [collabRole, setCollabRole] = useState("TESTER");

  const fetchProblem = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/problems/id/${id}`);
      setProblem(data.problem);
    } catch (err) {
      toast.error("Failed to load problem");
      router.push("/studio");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchProblem();
  }, [status, fetchProblem, router]);

  const handleUpdate = async (updateData: Partial<ProblemFormData>) => {
    setIsSaving(true);
    try {
      await axios.patch(`/api/problems/id/${id}/update`, updateData);
      toast.success("Changes saved");
      fetchProblem();
    } catch (err: unknown) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const addCollaborator = async () => {
    if (!newCollabUsername) return;
    try {
      await axios.post(`/api/problems/id/${id}/collaborators`, {
        username: newCollabUsername, // Need to ensure API supports username or adjust
        role: collabRole
      });
      toast.success("Collaborator added");
      setNewCollabUsername("");
      fetchProblem();
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) 
        ? err.response?.data?.error 
        : err instanceof Error ? err.message : "Failed to add collaborator";
      toast.error(errorMsg);
    }
  };

  const removeCollaborator = async (collabId: string) => {
    try {
      await axios.delete(`/api/problems/id/${id}/collaborators/${collabId}`);
      toast.success("Collaborator removed");
      fetchProblem();
    } catch (err) {
      toast.error("Failed to remove collaborator");
    }
  };

  const generateShareLink = async (role: string) => {
     // Implementation for shareable link logic would go here
     // For now, simulating with a toast
     const token = problem?.shareToken || "simulated-token-123";
     const url = `${window.location.origin}/studio/join/problem?token=${token}&role=${role}`;
     navigator.clipboard.writeText(url);
     toast.success(`${role} share link copied to clipboard`);
  };

  if (loading) return (
     <main className="h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-10 h-10 border-2 border-[#3b82f6]/20 border-t-[#3b82f6] rounded-full animate-spin" />
           <p className="text-[10px] uppercase tracking-widest text-[#52525b]">Loading Workspace...</p>
        </div>
     </main>
  );

  return (
    <main className="flex flex-col h-screen bg-[#050505] overflow-hidden">
      {/* TOOLBAR */}
      <header className="h-16 bg-[#080808] border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-[60]">
         <div className="flex items-center gap-6">
            <Link href="/studio" className="p-2 hover:bg-white/5 rounded-lg text-[#52525b] hover:text-white transition-all">
               <ArrowLeft size={18} />
            </Link>
            <div className="h-4 w-px bg-white/5" />
            <div className="flex flex-col">
               <span className="text-[9px] font-bold text-[#3b82f6] uppercase tracking-widest">Problem Editor</span>
               <h1 className="text-sm font-black text-white uppercase tracking-tight">{problem?.title}</h1>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
               <div className={`w-1.5 h-1.5 rounded-full ${problem?.verificationStatus === 'STABLE' ? 'bg-green-500' : 'bg-amber-500'}`} />
               <span className="text-[9px] font-bold uppercase tracking-widest text-[#a1a1aa]">{problem?.verificationStatus}</span>
            </div>
            <button 
               onClick={() => handleUpdate({})} // Save current state
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
               { id: 'statement', label: 'Statement', icon: FileText },
               { id: 'testcases', label: 'Test Cases', icon: Database },
               { id: 'solutions', label: 'Solutions', icon: Code2 },
               { id: 'collaborators', label: 'Collaborators', icon: Users },
               { id: 'settings', label: 'Settings', icon: Settings },
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "statement" | "testcases" | "solutions" | "collaborators" | "settings")}
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

         {/* CONTENT AREA */}
         <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#050505] p-12">
            <AnimatePresence mode="wait">
               {activeTab === 'statement' && (
                  <motion.div key="statement" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-5xl h-full">
                     <ProblemForm 
                        initialData={problem as unknown as ProblemFormData} 
                        onSubmit={handleUpdate}
                        hideHeader={true} // Need to update ProblemForm to accept this
                        onlyTab="context"
                     />
                  </motion.div>
               )}

               {activeTab === 'testcases' && (
                  <motion.div key="testcases" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-5xl">
                     <div className="space-y-12">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <h2 className="text-2xl font-black uppercase tracking-tight text-white">Test Cases</h2>
                              <p className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest">Define inputs and expected outputs for validation.</p>
                           </div>
                        </div>
                        
                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                           <ProblemForm 
                              initialData={problem as unknown as ProblemFormData} 
                              onSubmit={handleUpdate}
                              hideHeader={true}
                              onlyTab="setup" // Use setup tab for test cases in ProblemForm
                           />
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
                                 <option value="TESTER">Tester (View/Run)</option>
                              </select>
                           </div>
                           <button 
                              onClick={addCollaborator}
                              className="px-10 py-4 bg-white text-black rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#3b82f6] hover:text-white transition-all shadow-xl active:scale-95"
                           >
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
                              { role: 'Editor', icon: <Pencil size={14} />, desc: 'Allow others to edit statement and test cases.' },
                              { role: 'Tester', icon: <Activity size={14} />, desc: 'Allow others to run solutions and view tests.' }
                           ].map(link => (
                              <div key={link.role} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4 hover:border-[#3b82f6]/20 transition-all group">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       <div className="p-2 bg-[#3b82f6]/10 rounded-lg text-[#3b82f6]">{link.icon}</div>
                                       <span className="text-sm font-bold text-white">{link.role} Link</span>
                                    </div>
                                    <button onClick={() => generateShareLink(link.role)} className="p-2 hover:bg-white/5 rounded-lg text-[#52525b] hover:text-[#3b82f6] transition-all">
                                       <Clipboard size={16} />
                                    </button>
                                 </div>
                                 <p className="text-[10px] text-[#52525b] uppercase tracking-widest leading-relaxed">{link.desc}</p>
                              </div>
                           ))}
                        </div>
                     </section>

                     <section className="space-y-8">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#52525b] ml-1">Active Collaborators</h3>
                        <div className="grid grid-cols-1 gap-3">
                           {problem?.collaborators?.length === 0 ? (
                              <p className="text-[10px] italic text-[#262626] uppercase tracking-widest">No collaborators added yet.</p>
                           ) : (
                              problem?.collaborators?.map((collab: Collaborator) => (
                                 <div key={collab.id} className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-[#3b82f6]/20 transition-all">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-[#3b82f6]">
                                          {collab.user.name?.[0] || collab.user.email[0].toUpperCase()}
                                       </div>
                                       <div className="flex flex-col">
                                          <span className="text-sm font-bold text-white">{collab.user.name || "Anonymous"}</span>
                                          <span className="text-[9px] font-mono text-[#52525b]">{collab.user.email}</span>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                       <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[8px] font-bold text-[#a1a1aa] uppercase tracking-widest">{collab.role}</span>
                                       <button onClick={() => removeCollaborator(collab.id)} className="p-2 text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                          <Trash2 size={16} />
                                       </button>
                                    </div>
                                 </div>
                              ))
                           )}
                        </div>
                     </section>
                  </motion.div>
               )}

               {activeTab === 'settings' && (
                  <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl">
                     <ProblemForm 
                        initialData={problem as unknown as ProblemFormData} 
                        onSubmit={handleUpdate}
                        hideHeader={true}
                        onlyTab="meta"
                     />
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

function Pencil({ size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}
