"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Send, 
  Loader2, 
  CheckCircle2,
  Lightbulb,
  Bot, 
  TrendingUp,
  Award,
  BrainCircuit
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  type: "CONCEPTUAL" | "CODING";
  question: string;
}

interface Answer {
  questionId: string;
  answer: string;
  score: number;
  feedback: string;
  idealAnswer?: string;
  improvement?: string;
}

interface RoadmapStep {
  topic: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface InterviewResultsData {
  score: number;
  feedback: string;
  roadmap: RoadmapStep[];
}

interface Interview {
  id: string;
  topic: string;
  difficulty: string;
  status: string;
  questions: Question[];
  answers: Answer[];
}

export default function InterviewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [localAnswers, setLocalAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<InterviewResultsData | null>(null);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const { data } = await axios.get(`/api/interview/${id}`);
        setInterview(data.interview);
        if (data.interview.status === "COMPLETED") {
          setResults({
            score: data.interview.score,
            feedback: data.interview.feedback,
            roadmap: data.interview.roadmap
          });
        }
      } catch {
        toast.error("Failed to load interview session.");
        router.push("/interview");
      }
    };
    fetchInterview();
  }, [id, router]);

  const submitAll = useCallback(async (answers: string[]) => {
    setIsSubmitting(true);
    try {
      const { data } = await axios.post("/api/interview/submit-all", {
        interviewId: id,
        answers
      });

      if (data.success) {
        setResults({
          score: data.score,
          feedback: data.feedback,
          roadmap: data.roadmap
        });
        toast.success("Interview submitted for review!");
      }
    } catch (error) {
      console.error("Submission error:", error);
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        toast.error("AI Busy. Retrying in 10s...");
        setTimeout(() => submitAll(answers), 10000);
      } else {
        toast.error("Failed to evaluate interview. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [id]);

  const handleNext = () => {
    if (!currentAnswer.trim()) return toast.error("Please provide an answer.");
    
    const updatedAnswers = [...localAnswers];
    updatedAnswers[currentIndex] = currentAnswer.trim();
    setLocalAnswers(updatedAnswers);

    if (interview && currentIndex < interview.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentAnswer(localAnswers[currentIndex + 1] || "");
    } else {
      submitAll(updatedAnswers);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      // Save current work before going back
      const updatedAnswers = [...localAnswers];
      updatedAnswers[currentIndex] = currentAnswer.trim();
      setLocalAnswers(updatedAnswers);

      setCurrentIndex(prev => prev - 1);
      setCurrentAnswer(localAnswers[currentIndex - 1] || "");
    }
  };


  if (!interview || !interview.questions) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--viz-red)]" />
    </div>
  );

  if (results) return <InterviewResults results={results} interview={interview} />;

  const currentQuestion = interview.questions[currentIndex];

  if (!currentQuestion) {
    if (currentIndex >= interview.questions.length && interview.questions.length > 0) {
       return (
          <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--viz-red)]" />
            <p className="text-[var(--muted-foreground)]/60 font-mono text-xs uppercase tracking-widest">Finalizing Assessment...</p>
          </div>
       );
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Bot className="w-12 h-12 text-[var(--viz-red)] opacity-20" />
        <p className="text-[var(--muted-foreground)]/60 font-mono text-xs uppercase tracking-widest">Data Point Missing</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-12 pb-16 px-4 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <h2 className="text-2xl font-light tracking-tight text-[var(--foreground)]">{interview.topic}</h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]/40">Temporal State</span>
            <span className="text-[10px] font-mono font-bold text-[var(--viz-red)]">Unit {currentIndex + 1} of {interview.questions.length}</span>
          </div>
        </div>
        <div className="flex gap-1.5 p-1 bg-[var(--muted)] rounded-full px-3 shadow-inner">
          {interview.questions.map((_: Question, i: number) => (
            <div 
              key={i} 
              className={`h-1.5 w-10 rounded-full transition-all duration-500 ${
                i < currentIndex ? "bg-[var(--viz-green)] shadow-[0_0_10px_rgba(var(--viz-green-rgb),0.3)]" : i === currentIndex ? "bg-[var(--viz-red)] shadow-[0_0_10px_rgba(var(--viz-red-rgb),0.3)]" : "bg-[var(--foreground)]/5"
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-10"
        >
          <div className="bg-[var(--card)] rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--viz-red)]/20 to-transparent" />
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-grid-pattern" />
            
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 pointer-events-none">
              <Bot className="w-48 h-48 text-[var(--viz-red)]" />
            </div>
            
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-[var(--viz-red)]/10 rounded-xl text-[var(--viz-red)] shadow-sm">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                currentQuestion.type === "CODING" ? "bg-[var(--viz-blue)]/10 text-[var(--viz-blue)] border-[var(--viz-blue)]/20" : "bg-[var(--viz-purple)]/10 text-[var(--viz-purple)] border-[var(--viz-purple)]/20"
              }`}>
                {currentQuestion.type} Analysis
              </span>
            </div>

            <h3 className="text-3xl md:text-4xl font-light text-[var(--foreground)] leading-tight mb-16 tracking-tight">
              {currentQuestion.question}
            </h3>

            <div className="relative group/editor">
              {currentQuestion.type === "CODING" && (
                <div className="absolute top-4 right-6 px-3 py-1 bg-[var(--card)] text-[9px] font-mono font-black text-[var(--muted-foreground)]/40 uppercase tracking-widest pointer-events-none group-focus-within/editor:text-[var(--viz-red)] transition-colors z-10 shadow-sm rounded-md">
                  Active Buffer
                </div>
              )}
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder={currentQuestion.type === "CODING" ? "// Enter your professional implementation here..." : "Articulate your conceptual reasoning here..."}
                disabled={isSubmitting}
                spellCheck={currentQuestion.type !== "CODING"}
                className={`w-full h-[400px] p-8 bg-[var(--muted)] rounded-[2rem] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--viz-red)]/20 outline-none transition-all resize-none text-lg font-light shadow-inner border-none ${
                  currentQuestion.type === "CODING" 
                    ? "font-mono text-sm leading-relaxed whitespace-pre" 
                    : ""
                }`}
              />
            </div>

            <div className="mt-12 flex justify-between items-center relative z-10">
              <button
                onClick={handleBack}
                disabled={currentIndex === 0 || isSubmitting}
                className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40 hover:text-[var(--foreground)] transition-all disabled:opacity-0"
              >
                Previous Unit
              </button>

              <button
                onClick={handleNext}
                disabled={isSubmitting || !currentAnswer.trim()}
                className="px-12 py-4 bg-[var(--viz-red)] text-[var(--background)] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-xl shadow-[var(--viz-red)]/20 disabled:opacity-50 flex items-center gap-4 group cursor-pointer"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Evaluating Performance...</>
                ) : (
                  <>
                    {currentIndex === interview.questions.length - 1 ? "Initialize Synthesis" : "Next Unit"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {isSubmitting && (
        <div className="fixed inset-0 z-[100] bg-[var(--background)]/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in fade-in duration-500">
          <div className="relative">
            <Loader2 className="w-20 h-20 animate-spin text-[var(--viz-red)] opacity-40" />
            <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[var(--viz-red)]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-light tracking-tight text-[var(--foreground)]">Neural Review <span className="text-[var(--viz-red)] font-medium">Active</span></h2>
            <p className="text-[var(--muted-foreground)]/60 font-mono text-xs uppercase tracking-[0.3em]">Synthesizing performance metrics and constructing roadmap.</p>
          </div>
        </div>
      )}
    </main>
  );
}

function InterviewResults({ results, interview }: { results: InterviewResultsData, interview: Interview }) {
  return (
    <main className="min-h-screen pt-12 pb-16 px-4 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="p-4 bg-[var(--viz-green)]/10 rounded-[2rem] w-fit mx-auto mb-6 shadow-sm">
          <Award className="w-12 h-12 text-[var(--viz-green)]" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-black tracking-[0.4em] text-[var(--muted-foreground)]/40 uppercase">Assessment Concluded</span>
          <h1 className="text-5xl font-light tracking-tight text-[var(--foreground)]">Performance <span className="text-[var(--viz-green)] font-medium">Report</span></h1>
        </div>
        <p className="text-[var(--muted-foreground)]/60 font-mono text-xs uppercase tracking-widest">Manifold: {interview.topic} • Complexity: {interview.difficulty}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-[var(--card)] rounded-[3rem] p-10 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--viz-green)]/20 to-transparent" />
          <div className="relative w-40 h-40 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="72"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-[var(--foreground)]/5"
              />
              <motion.circle
                initial={{ strokeDashoffset: 452.4 }}
                animate={{ strokeDashoffset: 452.4 * (1 - results.score / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                cx="80"
                cy="80"
                r="72"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={452.4}
                className="text-[var(--viz-green)] shadow-[0_0_20px_rgba(var(--viz-green-rgb),0.3)]"
              />
            </svg>
            <span className="absolute text-4xl font-black text-[var(--foreground)] font-mono">{results.score}%</span>
          </div>
          <h3 className="font-black text-[var(--muted-foreground)]/40 uppercase tracking-[0.3em] text-[10px]">Neural Efficiency</h3>
        </div>

        <div className="lg:col-span-8 bg-[var(--card)] rounded-[3rem] p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--viz-blue)]/20 to-transparent" />
          <h3 className="text-[10px] font-black text-[var(--muted-foreground)]/40 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <Bot size={14} className="text-[var(--viz-blue)]" /> Technical Evaluation
          </h3>
          <div 
            className="prose prose-invert max-w-none text-sm text-[var(--muted-foreground)] font-light leading-relaxed prose-p:mb-4"
            dangerouslySetInnerHTML={{ __html: results.feedback }}
          />
        </div>
      </div>

      {results.roadmap && Array.isArray(results.roadmap) && (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-[var(--viz-purple)]/10" />
              <h2 className="text-[10px] font-black text-[var(--muted-foreground)]/40 uppercase tracking-[0.3em] flex items-center gap-3">
                <TrendingUp size={14} className="text-[var(--viz-purple)]" />
                Strategic Roadmap
              </h2>
              <div className="h-[1px] flex-1 bg-[var(--viz-purple)]/10" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {results.roadmap.map((step: RoadmapStep, i: number) => (
              <div key={i} className="bg-[var(--card)] rounded-[2rem] p-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <div className={`absolute top-0 right-0 px-4 py-1.5 text-[9px] font-black uppercase tracking-tighter rounded-bl-2xl ${
                  step.priority === 'High' ? "bg-[var(--viz-red)]/10 text-[var(--viz-red)]" : 
                  step.priority === 'Medium' ? "bg-[var(--viz-gold)]/10 text-[var(--viz-gold)]" : 
                  "bg-[var(--viz-blue)]/10 text-[var(--viz-blue)]"
                }`}>
                  {step.priority} Priority
                </div>
                <h4 className="text-lg font-bold text-[var(--foreground)] mb-3 group-hover:text-[var(--primary)] transition-colors">{step.topic}</h4>
                <p className="text-xs text-[var(--muted-foreground)]/70 font-light leading-relaxed">{step.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-10">
        <div className="flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-[var(--border)]" />
            <h2 className="text-[10px] font-black text-[var(--muted-foreground)]/40 uppercase tracking-[0.3em]">Detailed Breakdown</h2>
            <div className="h-[1px] flex-1 bg-[var(--border)]" />
        </div>

        {interview.answers.map((ans: Answer, i: number) => {
          const q = interview.questions.find((q: Question) => q.id === ans.questionId);
          if (!q) return null;
          return (
            <div key={i} className="bg-[var(--card)] rounded-[3rem] p-10 space-y-10 relative overflow-hidden shadow-xl">
              <div className="flex justify-between items-start gap-8 pb-8 border-b border-[var(--border)]">
                <h4 className="text-2xl font-light tracking-tight text-[var(--foreground)] leading-tight">{q.question}</h4>
                <div className="shrink-0 flex flex-col items-end">
                  <div className="text-2xl font-black text-[var(--foreground)] font-mono">{ans.score}%</div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Efficiency</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-[var(--muted-foreground)]/40 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Send className="w-3 h-3 text-[var(--viz-blue)]" /> Transmission
                    </label>
                    <div className="p-6 bg-[var(--muted)] rounded-2xl shadow-inner">
                      <p className="text-sm text-[var(--foreground)] font-light italic leading-relaxed">&quot;{ans.answer}&quot;</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-[var(--viz-purple)] uppercase tracking-[0.3em] flex items-center gap-2">
                      <Bot className="w-3 h-3" /> Synthesis Feedback
                    </label>
                    <div className="p-6 bg-[var(--viz-purple)]/[0.03] rounded-2xl border border-[var(--viz-purple)]/10">
                      <p className="text-sm text-[var(--muted-foreground)] font-light leading-relaxed">{ans.feedback}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {ans.idealAnswer && (
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-[var(--viz-green)] uppercase tracking-[0.3em] flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" /> Theoretical Optimum
                      </label>
                      <div className="p-6 bg-[var(--viz-green)]/[0.03] rounded-2xl border border-[var(--viz-green)]/10">
                        <p className="text-sm text-[var(--muted-foreground)] font-light leading-relaxed">{ans.idealAnswer}</p>
                      </div>
                    </div>
                  )}

                  {ans.improvement && (
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-[var(--viz-gold)] uppercase tracking-[0.3em] flex items-center gap-2">
                        <Lightbulb className="w-3 h-3" /> Refinement Logic
                      </label>
                      <div className="p-6 bg-[var(--viz-gold)]/[0.03] rounded-2xl border border-[var(--viz-gold)]/10">
                        <p className="text-sm text-[var(--muted-foreground)] font-light leading-relaxed">{ans.improvement}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
