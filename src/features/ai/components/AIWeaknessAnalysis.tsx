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
    <div className="bg-gradient-to-br from-[var(--viz-purple)]/5 to-[var(--viz-blue)]/5 border border-dashed border-[var(--border)] rounded-[2.5rem] p-12 mb-16 flex flex-col items-center justify-center text-center space-y-6 shadow-sm relative overflow-hidden">
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-grid-pattern" />
       <div className="p-4 bg-[var(--viz-purple)]/10 rounded-2xl text-[var(--viz-purple)] shadow-inner">
          <BrainCircuit className="w-10 h-10" />
       </div>
       <div className="space-y-2">
          <h3 className="text-2xl font-light tracking-tight text-[var(--foreground)]">Personalized <span className="text-[var(--viz-purple)] font-medium">Skill Mapping</span></h3>
          <p className="text-sm text-[var(--muted-foreground)] max-w-sm mx-auto font-light leading-relaxed">Let AI analyze your recent performance to identify hidden patterns and optimize your next practice unit.</p>
       </div>
       <button 
          onClick={fetchAnalysis}
          disabled={isLoading}
          className="px-10 py-3 bg-[var(--viz-purple)] text-[var(--background)] font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all hover:scale-105 shadow-lg shadow-[var(--viz-purple)]/20 flex items-center gap-3 disabled:opacity-50 cursor-pointer"
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
      className="bg-[var(--card)] rounded-[2.5rem] p-10 mb-16 relative overflow-hidden group shadow-xl"
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--viz-purple)]/20 to-transparent" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-grid-pattern" />
      
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 pointer-events-none">
        <Sparkles className="w-48 h-48 text-[var(--viz-purple)]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2.5 bg-[var(--viz-purple)]/10 rounded-xl text-[var(--viz-purple)] shadow-sm">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">AI Intelligence <span className="text-[var(--muted-foreground)]/40 font-light tracking-widest uppercase text-[10px] ml-2">Layer 01</span></h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--viz-purple)] block opacity-60">Identified Critical Weakness</label>
              <h3 className="text-4xl font-light tracking-tight text-[var(--foreground)]">{analysis.weakness}</h3>
            </div>
            <p className="text-[var(--muted-foreground)] leading-relaxed max-w-lg font-light">
              {analysis.analysis}
            </p>
            
            {!studyPlanId && (
              <div className="pt-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40 mb-3 block">Neural Focus Override</label>
                 <textarea
                    value={customRequest}
                    onChange={(e) => setCustomRequest(e.target.value)}
                    placeholder="e.g. 'I want to practice SQL Joins' or 'System Design of WhatsApp'"
                    className="w-full p-4 bg-[var(--muted)] rounded-2xl text-sm text-[var(--foreground)] focus:ring-2 focus:ring-[var(--viz-purple)]/20 outline-none resize-none h-24 transition-all shadow-inner border-none"
                 />
              </div>
            )}

            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--viz-purple)] bg-[var(--viz-purple)]/5 px-4 py-2 rounded-xl w-fit">
              <CheckCircle className="w-4 h-4" />
              Recommended Focus: {analysis.recommendedTopic}
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end justify-center gap-4">
            <button
              onClick={handleGenerateProblem}
              disabled={isGenerating || isGeneratingPlan}
              className="group/btn relative w-full lg:w-fit px-10 py-4 bg-[var(--viz-purple)] text-[var(--background)] rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-xl shadow-[var(--viz-purple)]/20 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer overflow-hidden"
            >
              {isGenerating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Synthesizing...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> {studyPlanId ? "Generate Next Unit" : "Begin Neural Unit"}</>
              )}
            </button>

            {!studyPlanId && (
              <button
                onClick={handleGenerateStudyPlan}
                disabled={isGenerating || isGeneratingPlan}
                className="group/btn relative w-full lg:w-fit px-10 py-4 bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-[var(--muted)] flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isGeneratingPlan ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Constructing...</>
                ) : (
                  <><BookOpen className="w-5 h-5 text-[var(--viz-purple)]" /> Construct Manifold</>
                )}
              </button>
            )}
            <div className="mt-2 text-right">
              <p className="text-[9px] text-[var(--muted-foreground)]/40 font-black uppercase tracking-[0.3em]">
                System Architecture: Gemini 2.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}