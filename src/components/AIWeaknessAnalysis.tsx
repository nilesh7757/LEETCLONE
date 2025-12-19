"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Sparkles, Loader2, AlertCircle, ArrowRight, BrainCircuit, CheckCircle, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AIWeaknessAnalysis({ studyPlanId }: { studyPlanId?: string }) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [customRequest, setCustomRequest] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  // Cooldown logic
  useEffect(() => {
    const checkCooldown = () => {
      const savedCooldownEnd = localStorage.getItem("gemini_cooldown_end");
      if (savedCooldownEnd) {
        const remaining = Math.ceil((parseInt(savedCooldownEnd) - Date.now()) / 1000);
        if (remaining > 0) {
          setCooldown(remaining);
        } else {
          localStorage.removeItem("gemini_cooldown_end");
          setCooldown(0);
        }
      }
    };

    checkCooldown();
    window.addEventListener('storage', checkCooldown);
    return () => window.removeEventListener('storage', checkCooldown);
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const fetchAnalysis = async () => {
    if (cooldown > 0) return; 
    setIsLoading(true);
    try {
      const url = studyPlanId 
        ? `/api/study-plans/analyze-weakness?studyPlanId=${studyPlanId}`
        : "/api/study-plans/analyze-weakness";
      const { data } = await axios.get(url);
      setAnalysis(data);
    } catch (error: any) {
      if (error.response?.status === 429) {
        const end = Date.now() + (60 * 1000);
        localStorage.setItem("gemini_cooldown_end", end.toString());
        setCooldown(60);
      }
      console.error("Failed to fetch weakness analysis", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateProblem = async () => {
    const topic = customRequest.trim() || analysis?.recommendedTopic;
    if (!topic || cooldown > 0) return;
    setIsGenerating(true);
    toast.info("AI is crafting a unique problem for you...");

    try {
      const { data } = await axios.post("/api/problems/generate-ai", {
        topic,
        studyPlanId 
      });
      
      if (data.success) {
        toast.success("Problem generated and added to your plan!");
        router.push(`/problems/${data.problem.slug}?edit=true`);
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        const end = Date.now() + (60 * 1000);
        localStorage.setItem("gemini_cooldown_end", end.toString());
        setCooldown(60);
        toast.error("AI Quota reached. Cooling down...");
      } else {
        toast.error("Failed to generate AI problem.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateStudyPlan = async () => {
    setIsGeneratingPlan(true);
    toast.info("AI is building your personalized roadmap...");
    try {
      const { data } = await axios.post("/api/study-plans/generate-ai", {
        customRequest: customRequest.trim() || undefined
      });
      if (data.success) {
        toast.success("Study Plan Created! Taking you there...");
        router.push(`/study-plans/${data.plan.slug}`);
      }
    } catch (error) {
      toast.error("Failed to generate study plan.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  if (cooldown > 0) return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 flex flex-col items-center justify-center space-y-2 mb-16">
      <div className="flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
        <span className="text-[var(--foreground)] font-bold uppercase tracking-widest text-xs">AI Cooling Down ({cooldown}s)</span>
      </div>
      <p className="text-[var(--foreground)]/40 text-xs">We hit the Gemini free tier limit. Analysis will resume shortly.</p>
    </div>
  );

  if (!analysis) return (
    <div className="bg-gradient-to-br from-purple-600/5 to-blue-600/5 border border-dashed border-[var(--card-border)] rounded-2xl p-8 mb-16 flex flex-col items-center justify-center text-center space-y-4">
       <div className="p-3 bg-purple-500/10 rounded-full">
          <BrainCircuit className="w-8 h-8 text-purple-500" />
       </div>
       <div>
          <h3 className="text-lg font-bold text-[var(--foreground)]">Personalized Skill Mapping</h3>
          <p className="text-sm text-[var(--foreground)]/60 max-w-sm mx-auto">Let AI analyze your recent performance to identify patterns you should practice next.</p>
       </div>
       <button 
          onClick={fetchAnalysis}
          disabled={isLoading}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
       >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Run AI Skill Analysis
       </button>
    </div>
  );

  // No longer returning null here as we now provide a default 'Starting Out' analysis from the API
  // if (analysis.weakness === "No data yet") return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-600/10 via-[var(--card-bg)] to-blue-600/10 border border-purple-500/20 rounded-2xl p-8 mb-16 relative overflow-hidden group shadow-xl"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Sparkles className="w-32 h-32 text-purple-500" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500 rounded-lg shadow-lg shadow-purple-500/20">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">AI Skill Analysis</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-500 mb-1 block">Current Weakness</label>
              <h3 className="text-3xl font-black text-[var(--foreground)]">{analysis.weakness}</h3>
            </div>
            <p className="text-[var(--foreground)]/70 leading-relaxed max-w-lg">
              {analysis.analysis}
            </p>
            
            {!studyPlanId && (
              <div className="pt-2">
                 <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/40 mb-2 block">Custom Request (Optional)</label>
                 <textarea
                    value={customRequest}
                    onChange={(e) => setCustomRequest(e.target.value)}
                    placeholder="e.g. 'I want to practice SQL Joins' or 'System Design of WhatsApp'"
                    className="w-full p-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--foreground)] focus:ring-2 focus:ring-purple-500/50 outline-none resize-none h-20 transition-all"
                 />
              </div>
            )}

            <div className="flex items-center gap-2 text-sm font-medium text-purple-500 bg-purple-500/5 px-3 py-1.5 rounded-full w-fit border border-purple-500/10">
              <CheckCircle className="w-4 h-4" />
              Recommended: {analysis.recommendedTopic}
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end justify-center gap-3">
            <button
              onClick={handleGenerateProblem}
              disabled={isGenerating || isGeneratingPlan}
              className="group/btn relative w-full md:w-fit px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer overflow-hidden"
            >
              {isGenerating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> {studyPlanId ? "Generate Next Problem" : "Quick Practice"}</>
              )}
            </button>

            {!studyPlanId && (
              <button
                onClick={handleGenerateStudyPlan}
                disabled={isGenerating || isGeneratingPlan}
                className="group/btn relative w-full md:w-fit px-8 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingPlan ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Building Plan...</>
                ) : (
                  <><BookOpen className="w-5 h-5" /> Create AI Study Plan</>
                )}
              </button>
            )}
            <p className="mt-1 text-[10px] text-[var(--foreground)]/40 font-medium uppercase tracking-wider text-right">
              Powered by Groq • Llama 3.3
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}