"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  Plus, Calendar, Clock, Settings, Globe, 
  Target, Activity, ChevronRight, Loader2, ArrowLeft,
  LayoutTemplate, AlignLeft, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";

export default function ArenaLaunchpad() {
  const { status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [scoringType, setScoringType] = useState<"FIXED" | "DECAY">("FIXED");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!title || !startTime || !endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (title.length < 3) {
      toast.error("Title must be at least 3 characters");
      return;
    }

    if (title.length > 200) {
      toast.error("Title must be less than 200 characters");
      return;
    }

    if (description && description.length > 5000) {
      toast.error("Description must be less than 5000 characters");
      return;
    }

    const contestStartTime = new Date(startTime);
    const contestEndTime = new Date(endTime);
    const now = new Date();

    if (contestStartTime < now) {
      toast.error("Start time cannot be in the past");
      return;
    }

    if (contestEndTime <= contestStartTime) {
      toast.error("End time must be after start time");
      return;
    }

    const duration = contestEndTime.getTime() - contestStartTime.getTime();
    const minDuration = 15 * 60 * 1000; // 15 minutes
    if (duration < minDuration) {
      toast.error("Contest must be at least 15 minutes long");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Creating contest...");
    try {
      const { data } = await axios.post("/api/contest/create", {
        title,
        description,
        startTime: contestStartTime.toISOString(),
        endTime: contestEndTime.toISOString(),
        visibility,
        scoringType: scoringType === "DECAY" ? "TACTICAL" : "CLASSIC",
        problemIds: [],
      });
      toast.success("Contest created successfully");
      router.push(`/arena/${data.contest.id}/manage`);
    } catch (err: unknown) {
      let errorMessage = "Creation failed";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans pb-20">
      {/* HEADER */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-between px-8 sticky top-0 z-50">
         <div className="flex items-center gap-6">
            <Link href="/arena" className="p-2 hover:bg-[var(--foreground)]/5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all">
               <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center border border-[#3b82f6]/20">
                  <Plus size={16} className="text-[#3b82f6]" />
               </div>
               <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--foreground)]">Create New Contest</span>
            </div>
         </div>

         <button
            onClick={handleLaunch}
            disabled={isSubmitting}
            className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--background)] bg-[var(--foreground)] rounded-lg flex items-center gap-2 transition-all hover:bg-[#3b82f6] hover:text-[var(--foreground)] active:scale-95 disabled:opacity-50"
         >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            Create Contest
         </button>
      </header>

      <div className="max-w-4xl mx-auto mt-12 px-6">
        <div className="mb-12 space-y-2">
           <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">Contest Details</h1>
           <p className="text-[var(--muted-foreground)] text-sm font-medium">Set up your contest parameters. You can add problems after creation.</p>
        </div>

        <form onSubmit={handleLaunch} className="space-y-8">
           {/* Section 1: Basic Info */}
           <div className="bg-[var(--card)] border border-[var(--border)] rounded-[2rem] overflow-hidden shadow-xl">
              <div className="px-8 py-4 border-b border-[var(--border)] bg-[var(--foreground)]/2 flex items-center gap-3">
                 <AlignLeft size={14} className="text-[#3b82f6]" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">General Information</span>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Contest Title *</label>
                    <input 
                       value={title} onChange={(e) => setTitle(e.target.value)}
                       placeholder="e.g. Weekly Algorithm Challenge #1"
                       className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 text-lg font-bold text-[var(--foreground)] focus:outline-none focus:border-[#3b82f6]/50 transition-all"
                       required
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Description & Rules</label>
                    <textarea 
                       value={description} onChange={(e) => setDescription(e.target.value)}
                       placeholder="Enter contest description, rules, and prizes..."
                       className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--muted-foreground)] focus:outline-none focus:border-[#3b82f6]/50 transition-all min-h-[150px] resize-none"
                    />
                 </div>
              </div>
           </div>

           {/* Section 2: Scheduling */}
           <div className="bg-[var(--card)] border border-[var(--border)] rounded-[2rem] overflow-hidden shadow-xl">
              <div className="px-8 py-4 border-b border-[var(--border)] bg-[var(--foreground)]/2 flex items-center gap-3">
                 <Clock size={14} className="text-[#3b82f6]" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Scheduling</span>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1 flex items-center gap-2">
                       <Calendar size={12} /> Start Time *
                    </label>
                    <input 
                       type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                       className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--foreground)] focus:outline-none focus:border-[#3b82f6]/50"
                       required
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1 flex items-center gap-2">
                       <Calendar size={12} /> End Time *
                    </label>
                    <input 
                       type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                       className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--foreground)] focus:outline-none focus:border-[#3b82f6]/50"
                       required
                    />
                 </div>
              </div>
           </div>

           {/* Section 3: Configuration */}
           <div className="bg-[var(--card)] border border-[var(--border)] rounded-[2rem] overflow-hidden shadow-xl">
              <div className="px-8 py-4 border-b border-[var(--border)] bg-[var(--foreground)]/2 flex items-center gap-3">
                 <Settings size={14} className="text-[#3b82f6]" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Advanced Settings</span>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Scoring System</label>
                    <select 
                       value={scoringType} onChange={(e) => setScoringType(e.target.value as "FIXED" | "DECAY")}
                       className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 text-sm font-bold text-[var(--foreground)] focus:outline-none focus:border-[#3b82f6]/50 appearance-none transition-all"
                    >
                       <option value="FIXED">Classic (Fixed Points)</option>
                       <option value="DECAY">Tactical (Points decrease over time)</option>
                    </select>
                    <p className="text-[8px] text-[var(--muted-foreground)] uppercase tracking-widest mt-1 ml-1">Determines how points are awarded for solved problems.</p>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Visibility</label>
                    <select 
                       value={visibility} onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
                       className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 text-sm font-bold text-[var(--foreground)] focus:outline-none focus:border-[#3b82f6]/50 appearance-none transition-all"
                    >
                       <option value="PUBLIC">Public (Visible to everyone)</option>
                       <option value="PRIVATE">Private (Invite only)</option>
                    </select>
                    <p className="text-[8px] text-[var(--muted-foreground)] uppercase tracking-widest mt-1 ml-1">Public contests appear in the Arena dashboard.</p>
                 </div>
              </div>
           </div>

           {/* Submit Button (Footer) */}
           <div className="pt-8 flex justify-end">
              <button 
                 type="submit"
                 disabled={isSubmitting}
                 className="flex items-center gap-3 px-12 py-5 bg-[#3b82f6] text-[var(--foreground)] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#2563eb] transition-all shadow-2xl active:scale-95 disabled:opacity-30"
              >
                 {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                 Establish Arena & Continue
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
