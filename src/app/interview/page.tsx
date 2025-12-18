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
  Clock 
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function InterviewConfigPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Entry");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get("/api/interview/history");
        setHistory(data.history);
      } catch (error) {
        console.error("Failed to load history", error);
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
    } catch (error) {
      toast.error("Failed to start interview.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="p-4 bg-purple-500/10 rounded-2xl w-fit mx-auto mb-6">
          <Mic className="w-12 h-12 text-purple-500" />
        </div>
        <h1 className="text-4xl font-black text-[var(--foreground)] mb-4">AI Mock Interview</h1>
        <p className="text-lg text-[var(--foreground)]/60 max-w-lg mx-auto">
          Practice high-pressure technical interviews with an AI that evaluates your skills and coding logic in real-time.
        </p>
      </motion.div>

      {/* Config Card */}
      <div className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 shadow-xl mb-12">
        <div className="grid gap-8">
          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/40 flex items-center gap-2">
              <Layout className="w-4 h-4" /> Interview Role/Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Frontend Developer, Machine Learning Engineer..."
              className="w-full px-6 py-4 bg-[var(--background)] border border-[var(--card-border)] rounded-2xl text-[var(--foreground)] focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-lg"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/40 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Level
            </label>
            <div className="grid grid-cols-3 gap-4">
              {["Entry", "Senior", "Staff"].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-3 rounded-xl font-bold transition-all border ${
                    difficulty === level 
                      ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20" 
                      : "bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)]/60 hover:border-[var(--foreground)]/20"
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
            className="w-full py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xl transition-all shadow-xl shadow-purple-500/20 disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
          >
            {isGenerating ? <><Loader2 className="w-6 h-6 animate-spin" /> Preparing Room...</> : <><Sparkles className="w-6 h-6" /> Start My Interview</>}
          </button>
        </div>
      </div>

      {/* History Section */}
      <div className="w-full max-w-4xl mb-12">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="p-2 bg-[var(--foreground)]/5 rounded-lg">
            <History className="w-5 h-5 text-[var(--foreground)]/60" />
          </div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Interview History</h2>
        </div>

        {isLoadingHistory ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        ) : history.length === 0 ? (
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-12 text-center border-dashed">
            <p className="text-[var(--foreground)]/40 text-sm italic">No past interviews found. Start your first session above!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((session) => (
              <Link 
                key={session.id} 
                href={`/interview/${session.id}`}
                className="bg-[var(--card-bg)] border border-[var(--card-border)] p-5 rounded-2xl hover:border-purple-500/30 transition-all flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${session.status === 'COMPLETED' ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                    {session.status === 'COMPLETED' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--foreground)] group-hover:text-purple-500 transition-colors">
                      {session.topic}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-[var(--foreground)]/40 mt-1 uppercase font-bold tracking-tighter">
                      <span>{session.difficulty}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(session.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {session.status === 'COMPLETED' && (
                    <div className="text-right">
                      <div className="text-xl font-black text-[var(--foreground)]">{session.score}%</div>
                      <div className="text-[10px] uppercase font-black text-green-500 tracking-widest">Score</div>
                    </div>
                  )}
                  <ArrowRight className="w-5 h-5 text-[var(--foreground)]/20 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-center pb-16 border-t border-[var(--card-border)] pt-12">
        {[
          { icon: User, text: "Personalized based on your skills" },
          { icon: Code, text: "Coding & System Design included" },
          { icon: Mic, text: "Real-time AI evaluation" },
        ].map((item, i) => (
          <div key={i} className="p-4 space-y-2">
            <item.icon className="w-6 h-6 text-purple-500 mx-auto" />
            <p className="text-xs font-medium text-[var(--foreground)]/60">{item.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}