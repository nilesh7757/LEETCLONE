"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import { 
  Zap, ChevronLeft, Cpu, ShieldCheck, Activity, 
  Terminal, Play, Target, CheckCircle2, AlertCircle,
  Database, LayoutTemplate, Code2, Binary, Users, UserPlus, X, Trash2, Loader2
} from "lucide-react";
import ProblemForm, { ProblemFormData } from "@/features/problems/components/ProblemForm";
import { motion, AnimatePresence } from "framer-motion";

interface Collaborator {
  id: string;
  userId: string;
  role: string;
  user: {
    name: string;
    email: string;
  }
}

interface UnitStatus {
  isVerified: boolean;
  testCount: number;
  hasReference: boolean;
  verificationStatus: string;
}

export default function ForgeWorkbench() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [problem, setProblem] = useState<ProblemFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState<UnitStatus>({
    isVerified: false,
    testCount: 0,
    hasReference: false,
    verificationStatus: "DRAFT"
  });
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Collaboration States
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [newCollabEmail, setNewCollabEmail] = useState("");
  const [collabRole, setCollabRole] = useState("TESTER");

  const fetchUnit = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/problems/id/${id}`);
      setProblem(data.problem);
      setCollaborators(data.problem.collaborators || []);
      setTelemetry({
        isVerified: data.problem.isVerified,
        testCount: (data.problem.testSets as { hidden?: unknown[] })?.hidden?.length || 0,
        hasReference: !!data.problem.referenceSolution,
        verificationStatus: data.problem.verificationStatus || "DRAFT"
      });
    } catch (err) {
      toast.error("Package sync failed");
      router.push("/architect");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchUnit();
  }, [status, fetchUnit, router]);

  const handleUpdate = async (data: ProblemFormData) => {
    try {
      await axios.patch(`/api/problems/id/${id}/update`, data);
      toast.success("Package parameters updated");
      fetchUnit();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Update failed");
      } else {
        toast.error("Update failed");
      }
    }
  };

  const addCollaborator = async () => {
    if (!newCollabEmail) return;
    try {
      await axios.post(`/api/problems/id/${id}/collaborators`, {
        email: newCollabEmail,
        role: collabRole
      });
      toast.success("Collaborator added");
      setNewCollabEmail("");
      fetchUnit();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Failed to add collaborator");
      } else {
        toast.error("Failed to add collaborator");
      }
    }
  };

  const removeCollaborator = async (collabId: string) => {
    try {
      await axios.delete(`/api/problems/id/${id}/collaborators/${collabId}`);
      toast.success("Collaborator removed");
      fetchUnit();
    } catch (err) {
      toast.error("Failed to remove collaborator");
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      await axios.patch(`/api/problems/id/${id}/update`, { verificationStatus: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchUnit();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const runVerification = async () => {
    if (!problem?.referenceSolution) {
      toast.error("Reference solution required for verification");
      return;
    }

    // Intelligent local detection to avoid Python-default errors
    const detectLang = (src: string) => {
      if (src.includes("#include") || src.includes("using namespace std;")) return "cpp";
      if (src.includes("def ") || src.includes("import ")) return "python";
      if (src.includes("public class ") || src.includes("System.out")) return "java";
      return problem.language || "javascript";
    };

    const finalLang = detectLang(problem.referenceSolution);

    setIsVerifying(true);
    const loadingToast = toast.loading("Running verification suite...");
    try {
      const { data } = await axios.post("/api/run", {
        problemId: id,
        code: problem.referenceSolution,
        language: finalLang,
        testCases: problem.testCasesInput,
        type: problem.type || "CODING",
        isOutputGeneration: true 
      });

      const allPassed = data.results.every((r: { status: string }) => r.status === "Accepted");
      
      if (allPassed) {
        await axios.patch(`/api/problems/id/${id}/update`, { isVerified: true });
        toast.success("Verification successful: All tests passed");
        fetchUnit();
      } else {
        const failedCase = data.results.find((r: { status: string; error?: string }) => r.status !== "Accepted");
        const errorMsg = failedCase 
          ? `Verification failed: ${failedCase.status}${failedCase.status === 'Wrong Answer' ? ' (Discrepancy)' : ''}`
          : "Verification failed: Discrepancy detected";
        toast.error(errorMsg, {
          description: failedCase?.error ? failedCase.error.slice(0, 100) + "..." : "Check your test cases and reference solution."
        });
      }
    } catch (err) {
      toast.error("Verification system error");
    } finally {
      setIsVerifying(false);
      toast.dismiss(loadingToast);
    }
  };

  if (loading) return (
     <main className="h-screen bg-[#0a0a0a] flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
           <div className="w-10 h-10 border-2 border-[#3b82f6]/20 border-t-[#3b82f6] rounded-full animate-spin" />
           <p className="text-[10px] uppercase tracking-widest text-[#52525b]">Loading Package...</p>
        </div>
     </main>
  );

  const isOwner = problem?.creatorId === session?.user?.id;
  const isTester = collaborators.some(c => c.userId === session?.user?.id && c.role === 'TESTER');

  return (
    <main className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden">
      {/* FORGE TOOLBAR */}
      <div className="h-10 bg-black border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-[60]">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
               <div className={`w-1.5 h-1.5 rounded-full ${
                  telemetry.verificationStatus === 'STABLE' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : 
                  telemetry.verificationStatus === 'VETTING' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "bg-white/20"
               }`} />
               <span className="text-[10px] font-bold uppercase tracking-widest text-[#52525b]">Status: {telemetry.verificationStatus}</span>
            </div>
            
            <div className="h-3 w-px bg-white/5" />
            
            <button onClick={() => setIsCollabModalOpen(true)} className="flex items-center gap-2 text-[10px] font-bold text-[#52525b] uppercase hover:text-white transition-all">
               <Users size={12} />
               Collaborators: {collaborators.length + 1}
            </button>

            <div className="h-3 w-px bg-white/5" />

            <div className="flex items-center gap-4">
               {isOwner && telemetry.verificationStatus === 'DRAFT' && (
                  <button onClick={() => updateStatus('VETTING')} className="text-[9px] font-bold text-[#3b82f6] uppercase tracking-widest hover:underline">Submit for Vetting</button>
               )}
               {(isOwner || isTester) && telemetry.verificationStatus === 'VETTING' && (
                  <button onClick={() => updateStatus('STABLE')} className="text-[9px] font-bold text-green-500 uppercase tracking-widest hover:underline">Mark as Stable</button>
               )}
               {telemetry.verificationStatus !== 'DRAFT' && isOwner && (
                  <button onClick={() => updateStatus('DRAFT')} className="text-[9px] font-bold text-[#52525b] uppercase tracking-widest hover:underline">Revert to Draft</button>
               )}
            </div>
         </div>
         
         <div className="flex items-center gap-4">
            {/* Toolbar actions now exclusively for status and collaboration */}
            <div className="text-[9px] font-mono text-[#262626] uppercase tracking-widest">Workbench Session Active</div>
         </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <ProblemForm 
           initialData={problem!} 
           onSubmit={handleUpdate} 
           isEditing={true}
           problemId={id}
        />
      </div>

      {/* COLLABORATION MODAL */}
      <AnimatePresence>
         {isCollabModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-white"
               >
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Users size={18} className="text-[#3b82f6]" />
                        <h3 className="text-sm font-bold">Collaborators</h3>
                     </div>
                     <button onClick={() => setIsCollabModalOpen(false)} className="p-1 hover:bg-white/5 rounded text-[#52525b] hover:text-white"><X size={18} /></button>
                  </div>

                  <div className="p-6 space-y-6">
                     {isOwner && (
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-[#52525b]">Add Collaborator</label>
                           <div className="flex gap-2">
                              <input 
                                 type="email" value={newCollabEmail} onChange={(e) => setNewCollabEmail(e.target.value)}
                                 placeholder="user@example.com"
                                 className="flex-1 bg-black border border-white/5 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#3b82f6]/50"
                              />
                              <select 
                                 value={collabRole} onChange={(e) => setCollabRole(e.target.value)}
                                 className="bg-black border border-white/5 rounded-xl px-3 text-[10px] font-bold uppercase outline-none"
                              >
                                 <option value="SETTER">Setter</option>
                                 <option value="TESTER">Tester</option>
                              </select>
                              <button onClick={addCollaborator} className="px-4 bg-white text-black rounded-xl hover:bg-[#3b82f6] hover:text-white transition-all"><UserPlus size={16} /></button>
                           </div>
                        </div>
                     )}

                     <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#52525b]">Active Team</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                           <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="w-7 h-7 rounded bg-[#3b82f6]/10 flex items-center justify-center text-[10px] font-bold text-[#3b82f6]">ME</div>
                                 <div className="flex flex-col">
                                    <span className="text-xs font-bold">Project Owner</span>
                                 </div>
                              </div>
                              <span className="text-[8px] font-bold uppercase tracking-widest text-[#3b82f6]">Owner</span>
                           </div>

                           {collaborators.map(c => (
                              <div key={c.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold text-[#52525b]">{c.user.name?.slice(0, 2).toUpperCase()}</div>
                                    <div className="flex flex-col">
                                       <span className="text-xs font-bold">{c.user.name}</span>
                                       <span className="text-[9px] text-[#52525b]">{c.user.email}</span>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#52525b]">{c.role}</span>
                                    {isOwner && (
                                       <button onClick={() => removeCollaborator(c.id)} className="text-rose-500/40 hover:text-rose-500"><Trash2 size={12} /></button>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </main>
  );
}
