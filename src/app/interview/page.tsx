"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Mic, 
  Sparkles, 
  Loader2, 
  User, 
  Code, 
  Layout, 
  ArrowRight, 
  History, 
  Calendar, 
  CheckCircle, 
  Clock,
  Zap
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";

interface InterviewSession {
  id: string;
  topic: string;
  difficulty: string;
  status: string;
  score?: number;
  createdAt: string;
}

export default function InterviewConfigPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Entry");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get("/api/interview/history");
        setHistory(data.history);
      } catch {
        console.error("Failed to load history");
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const startInterview = async () => {
    if (!topic.trim()) return toast.error("Please enter a topic.");
    
    setIsGenerating(true);
    try {
      const { data } = await axios.post("/api/interview/generate", { topic, difficulty });
      router.push(`/interview/${data.interview.id}`);
    } catch {
      toast.error("Failed to start interview.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen pt-12 pb-16 px-4 max-w-5xl mx-auto flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 space-y-4"
      >
        <div className="p-4 bg-[var(--viz-red)]/10 rounded-[2rem] w-fit mx-auto mb-6 shadow-sm">
          <Mic className="w-12 h-12 text-[var(--viz-red)]" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-black tracking-[0.4em] text-[var(--muted-foreground)]/40 uppercase">Assessment Protocol</span>
          <h1 className="text-5xl font-light tracking-tight text-[var(--foreground)]">
            AI Mock <span className="text-[var(--viz-red)] font-medium">Interview</span>
          </h1>
        </div>
        <p className="text-lg text-[var(--muted-foreground)] max-w-lg mx-auto font-light leading-relaxed">
          Practice high-pressure technical interviews with an AI that evaluates your logic and coding in real-time.
        </p>
      </motion.div>

      {/* Config Card */}
      <div className="w-full bg-[var(--card)] rounded-[3rem] p-10 shadow-2xl mb-20 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--viz-red)]/20 to-transparent" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-grid-pattern" />
        
        <div className="grid gap-10 relative z-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)]/40 flex items-center gap-2">
              <Layout className="w-4 h-4 text-[var(--viz-red)]" /> Target Role / Specialization
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Frontend Developer, Machine Learning Engineer..."
              className="w-full px-8 py-5 bg-[var(--muted)] rounded-2xl text-[var(--foreground)] focus:ring-2 focus:ring-[var(--viz-red)]/20 outline-none transition-all text-xl font-light shadow-inner border-none"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)]/40 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--viz-gold)]" /> Operational Complexity
            </label>
            <div className="grid grid-cols-3 gap-4">
              {["Entry", "Senior", "Staff"].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                    difficulty === level 
                      ? "bg-[var(--viz-red)] border-[var(--viz-red)] text-[var(--background)] shadow-xl shadow-[var(--viz-red)]/20" 
                      : "bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)]/60 hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startInterview}
            disabled={isGenerating || !topic.trim()}
            className="w-full py-6 bg-[var(--viz-red)] text-[var(--background)] rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all hover:scale-[1.02] shadow-2xl shadow-[var(--viz-red)]/30 disabled:opacity-50 flex items-center justify-center gap-4 cursor-pointer"
          >
            {isGenerating ? <><Loader2 className="w-6 h-6 animate-spin" /> Preparing Manifold...</> : <><Zap className="w-6 h-6 fill-current" /> Initialize Assessment</>}
          </button>
        </div>
      </div>

      {/* History Section */}
      <div className="w-full max-w-5xl mb-20">
        <div className="flex items-center gap-4 mb-10">
            <div className="h-[1px] flex-1 bg-[var(--viz-red)]/10" />
            <h2 className="text-[10px] font-black text-[var(--muted-foreground)]/40 uppercase tracking-[0.3em] flex items-center gap-3">
              <History size={14} className="text-[var(--viz-red)]" />
              Temporal Logs
            </h2>
            <div className="h-[1px] flex-1 bg-[var(--viz-red)]/10" />
        </div>

        {isLoadingHistory ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--viz-red)]/40" />
          </div>
        ) : history.length === 0 ? (
          <div className="bg-[var(--card)] rounded-[3rem] p-20 text-center shadow-xl">
            <p className="text-[var(--muted-foreground)]/20 text-xs font-mono uppercase tracking-widest italic">Neural history empty. Commence assessment to populate logs.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((session) => (
              <Link 
                key={session.id} 
                href={`/interview/${session.id}`}
                className="bg-[var(--card)] p-6 rounded-[2rem] transition-all duration-300 hover:shadow-2xl hover:-translate-x-1 flex items-center justify-between group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-[var(--border)] group-hover:bg-[var(--viz-red)] transition-all duration-300" />
                <div className="flex items-center gap-6">
                  <div className={`p-3 rounded-xl shadow-inner ${session.status === 'COMPLETED' ? 'bg-[var(--viz-green)]/10 text-[var(--viz-green)]' : 'bg-[var(--viz-gold)]/10 text-[var(--viz-gold)]'}`}>
                    {session.status === 'COMPLETED' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Clock className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--viz-red)] transition-colors truncate">
                      {session.topic}
                    </h4>
                    <div className="flex items-center gap-4 text-[10px] font-mono font-black text-[var(--muted-foreground)]/40 mt-2 uppercase tracking-widest">
                      <span className="text-[var(--viz-red)]/60">{session.difficulty}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(session.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  {session.status === 'COMPLETED' && (
                    <div className="text-right">
                      <div className="text-2xl font-black text-[var(--foreground)] font-mono">{session.score}%</div>
                      <div className="text-[9px] uppercase font-black text-[var(--viz-green)] tracking-[0.2em]">Efficiency</div>
                    </div>
                  )}
                  <div className="p-2 bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)]/20 group-hover:text-[var(--viz-red)] transition-all">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full text-center pb-20 mt-12">
        {[
          { icon: User, text: "Personalized Neural Mapping" },
          { icon: Code, text: "Real-time Vector Analysis" },
          { icon: Mic, text: "High-Frequency Evaluation" },
        ].map((item, i) => (
          <div key={i} className="space-y-4 group">
            <div className="p-4 bg-[var(--muted)] rounded-2xl w-fit mx-auto transition-transform group-hover:scale-110 duration-500 shadow-inner">
              <item.icon className="w-6 h-6 text-[var(--viz-red)]" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]/60">{item.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}