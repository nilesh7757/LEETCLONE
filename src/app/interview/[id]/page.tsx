"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Send, 
  Loader2, 
  CheckCircle, 
  Bot, 
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  type: "CONCEPTUAL" | "CODING";
  question: string;
}

export default function InterviewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [interview, setInterview] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [localAnswers, setLocalAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [cooldown, setCooldown] = useState(0);

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
      } catch (error) {
        toast.error("Failed to load interview session.");
        router.push("/interview");
      }
    };
    fetchInterview();
  }, [id, router]);

  const handleNext = () => {
    if (!currentAnswer.trim()) return toast.error("Please provide an answer.");
    
    const updatedAnswers = [...localAnswers];
    updatedAnswers[currentIndex] = currentAnswer.trim();
    setLocalAnswers(updatedAnswers);

    if (currentIndex < interview.questions.length - 1) {
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

  const submitAll = async (answers: string[]) => {
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
    } catch (error: any) {
      console.error("Submission error:", error);
      if (error.response?.status === 429) {
        toast.error("AI Busy. Retrying in 10s...");
        setTimeout(() => submitAll(answers), 10000);
      } else {
        toast.error("Failed to evaluate interview. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!interview || !interview.questions) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
    </div>
  );

  if (results) return <InterviewResults results={results} interview={interview} />;

  const currentQuestion = interview.questions[currentIndex];

  if (!currentQuestion) {
    if (currentIndex >= interview.questions.length && interview.questions.length > 0) {
       return (
          <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <p className="text-[var(--foreground)]/60">Finalizing interview...</p>
          </div>
       );
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Bot className="w-12 h-12 text-purple-500 opacity-20" />
        <p className="text-[var(--foreground)]/60">Question not found.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">{interview.topic}</h2>
          <p className="text-sm text-[var(--foreground)]/60">Question {currentIndex + 1} of {interview.questions.length}</p>
        </div>
        <div className="flex gap-1">
          {interview.questions.map((_: any, i: number) => (
            <div 
              key={i} 
              className={`h-1.5 w-8 rounded-full transition-all ${
                i < currentIndex ? "bg-green-500" : i === currentIndex ? "bg-purple-500" : "bg-[var(--foreground)]/10"
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
          className="space-y-8"
        >
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Bot className="w-32 h-32 text-purple-500" />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                currentQuestion.type === "CODING" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
              }`}>
                {currentQuestion.type}
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] leading-relaxed mb-12">
              {currentQuestion.question}
            </h3>

            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Provide your detailed answer here..."
              disabled={isSubmitting}
              className="w-full h-64 p-6 bg-[var(--background)] border border-[var(--card-border)] rounded-2xl text-[var(--foreground)] focus:ring-2 focus:ring-purple-500/50 outline-none transition-all resize-none text-lg"
            />

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={handleBack}
                disabled={currentIndex === 0 || isSubmitting}
                className="px-6 py-3 text-sm font-bold text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors disabled:opacity-0"
              >
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={isSubmitting || !currentAnswer.trim()}
                className="px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-purple-500/20 disabled:opacity-50 flex items-center gap-3 group cursor-pointer"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Finalizing Interview...</>
                ) : (
                  <>
                    {currentIndex === interview.questions.length - 1 ? "Submit Interview" : "Next Question"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-[var(--background)]/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-6">
          <Loader2 className="w-16 h-16 animate-spin text-purple-500" />
          <h2 className="text-3xl font-black text-[var(--foreground)]">AI Performance Review</h2>
          <p className="text-[var(--foreground)]/60 max-w-sm">The AI is reviewing all your responses to provide a detailed performance report.</p>
        </div>
      )}
    </main>
  );
}

function InterviewResults({ results, interview }: { results: any, interview: any }) {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="p-4 bg-green-500/10 rounded-2xl w-fit mx-auto mb-6">
          <Award className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-4xl font-black text-[var(--foreground)] mb-2">Interview Complete</h1>
        <p className="text-[var(--foreground)]/60">Topic: {interview.topic} ({interview.difficulty})</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 flex flex-col items-center justify-center text-center">
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-[var(--foreground)]/5"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={364.4}
                strokeDashoffset={364.4 * (1 - results.score / 100)}
                className="text-purple-500 transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-3xl font-black text-[var(--foreground)]">{results.score}%</span>
          </div>
          <h3 className="font-bold text-[var(--foreground)]/60 uppercase tracking-widest text-xs">Total Score</h3>
        </div>

        <div className="md:col-span-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-500" /> AI Performance Review
          </h3>
          <div 
            className="prose prose-invert max-w-none text-sm text-[var(--foreground)]/80 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: results.feedback }}
          />
        </div>
      </div>

      {results.roadmap && Array.isArray(results.roadmap) && (
        <div className="mb-12 space-y-6">
          <h3 className="font-bold text-[var(--foreground)] uppercase tracking-widest text-sm px-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-500" /> Personalized Roadmap & Next Steps
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.roadmap.map((step: any, i: number) => (
              <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all">
                <div className={`absolute top-0 right-0 px-3 py-1 text-[8px] font-black uppercase tracking-tighter rounded-bl-xl ${
                  step.priority === 'High' ? 'bg-red-500/10 text-red-500' : 
                  step.priority === 'Medium' ? 'bg-orange-500/10 text-orange-500' : 
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  {step.priority} Priority
                </div>
                <h4 className="font-bold text-[var(--foreground)] mb-2 group-hover:text-purple-500 transition-colors">{step.topic}</h4>
                <p className="text-xs text-[var(--foreground)]/60 leading-relaxed">{step.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-bold text-[var(--foreground)] mb-4 uppercase tracking-widest text-sm px-2">Detailed Breakdown</h3>
        {interview.answers.map((ans: any, i: number) => {
          const q = interview.questions.find((q: any) => q.id === ans.questionId);
          return (
            <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
              <div className="flex justify-between items-start gap-4 mb-4">
                <h4 className="font-bold text-[var(--foreground)]">{q.question}</h4>
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${ans.score >= 70 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {ans.score}%
                </span>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-[var(--background)] rounded-xl border border-[var(--card-border)]">
                  <p className="text-xs font-bold text-[var(--foreground)]/40 uppercase tracking-wider mb-1">Your Answer</p>
                  <p className="text-sm text-[var(--foreground)]/80 italic line-clamp-3">"{ans.answer}"</p>
                </div>
                <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10">
                  <p className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-1">Feedback</p>
                  <p className="text-sm text-[var(--foreground)]/80">{ans.feedback}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
