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
  BrainCircuit,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from "dompurify";

interface Question {
  id: string;
  type: "CONCEPTUAL" | "CODING";
  question: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: string;
  expectedConcepts: string[];
}

interface Interview {
  id: string;
  title: string;
  difficulty: string;
  questions: Question[];
}

interface Answer {
  questionId: string;
  content: string;
  isSkipped: boolean;
}

interface InterviewResult {
  score: number;
  feedback: string;
  categoryScores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export default function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<InterviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [visibleCount, setVisibleCount] = useState(2);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await axios.get(`/api/interview/${id}`);
        setInterview(response.data);
      } catch (err) {
        toast.error("Failed to load interview session");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInterview();
  }, [id]);

  const handleNext = useCallback(() => {
    if (!interview) return;

    const newAnswer: Answer = {
      questionId: interview.questions[currentStep].id,
      content: currentAnswer,
      isSkipped: currentAnswer.trim() === "",
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer("");

    if (currentStep < interview.questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      submitInterview(newAnswers);
    }
  }, [currentStep, currentAnswer, interview, answers]);

  const submitInterview = async (finalAnswers: Answer[]) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`/api/interview/${id}/submit`, {
        answers: finalAnswers,
      });
      setResults(response.data);
      toast.success("Interview completed and analyzed!");
    } catch (err) {
      toast.error("Failed to analyze interview");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-gradient-to)]" />
      </div>
    );
  }

  if (!interview) return null;

  if (results) {
    return <InterviewReport results={results} interview={interview} answers={answers} visibleCount={visibleCount} setVisibleCount={setVisibleCount} />;
  }

  const currentQuestion = interview.questions[currentStep];
  const progress = ((currentStep + 1) / interview.questions.length) * 100;

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-8 flex flex-col items-center max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="w-full mb-12">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
            Question {currentStep + 1} of {interview.questions.length}
          </span>
          <span className="text-[10px] font-black text-[var(--accent-gradient-to)] bg-[var(--accent-gradient-to)]/10 px-3 py-1 rounded-full border border-[var(--accent-gradient-to)]/20">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="h-1.5 w-full bg-[var(--muted)] rounded-full overflow-hidden border border-[var(--border)]">
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--accent-gradient-from)] to-[var(--accent-gradient-to)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--accent-gradient-to)]/5 to-transparent blur-3xl rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-gradient-to-tr from-[var(--accent-gradient-from)]/5 to-transparent blur-3xl rounded-full" />

          <div className="flex items-center gap-4 mb-8">
            <span className="px-4 py-1.5 rounded-full bg-[var(--muted)] text-[9px] font-black uppercase tracking-widest text-[var(--foreground)] border border-[var(--border)]">
              {currentQuestion.category}
            </span>
            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
              currentQuestion.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
              currentQuestion.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
              'bg-rose-500/10 text-rose-500 border-rose-500/20'
            }`}>
              {currentQuestion.difficulty}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-10 leading-tight text-[var(--foreground)] group-hover:text-[var(--accent-gradient-to)] transition-colors duration-300">
            {currentQuestion.question}
          </h2>

          <div className="space-y-6">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here... (be as detailed as possible)"
              className="w-full h-64 bg-[var(--muted)]/30 border border-[var(--border)] rounded-2xl p-6 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gradient-to)]/30 focus:border-[var(--accent-gradient-to)] transition-all resize-none font-mono text-sm leading-relaxed"
            />
            
            <div className="flex justify-between items-center pt-4">
              <p className="text-[10px] text-[var(--muted-foreground)] font-medium italic">
                {currentQuestion.type === 'CODING' ? 'Write clean, idiomatic code with explanations.' : 'Explain concepts clearly with examples.'}
              </p>
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center gap-3 bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95 group shadow-lg shadow-[var(--foreground)]/10"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    {currentStep < interview.questions.length - 1 ? "Next Question" : "Complete Interview"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function InterviewReport({ results, interview, answers, visibleCount, setVisibleCount }: { 
  results: InterviewResult; 
  interview: Interview; 
  answers: Answer[];
  visibleCount: number;
  setVisibleCount: (val: number | ((prev: number) => number)) => void;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-12 max-w-5xl mx-auto space-y-12">
      {/* Header Summary */}
      <div className="text-center relative py-12">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-gradient-to)]/5 to-transparent blur-3xl -z-10 rounded-full" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block p-8 rounded-[40px] bg-[var(--card-bg)] border border-[var(--border)] shadow-2xl mb-8"
        >
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--muted-foreground)] mb-2">Overall Score</div>
          <div className="text-7xl font-black bg-gradient-to-r from-[var(--accent-gradient-from)] to-[var(--accent-gradient-to)] bg-clip-text text-transparent">
            {results.score}%
          </div>
        </motion.div>
        <h1 className="text-4xl font-black tracking-tight text-[var(--foreground)] mb-4">{interview.title}</h1>
        <p className="text-[var(--muted-foreground)] max-w-xl mx-auto text-sm leading-relaxed">
          Comprehensive AI analysis of your technical performance across {interview.questions.length} assessments.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(results.categoryScores).map(([category, score], idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={category}
            className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl hover:border-[var(--accent-gradient-to)]/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">{category}</span>
              <TrendingUp className="w-4 h-4 text-[var(--accent-gradient-to)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-3xl font-black text-[var(--foreground)]">{score}%</div>
            <div className="w-full h-1 bg-[var(--muted)] rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--accent-gradient-from)] to-[var(--accent-gradient-to)]"
                style={{ width: `${score}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Feedback & Recs */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-10 bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] shadow-xl">
            <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-widest mb-8">
              <Bot className="w-5 h-5 text-[var(--accent-gradient-to)]" />
              Detailed AI Feedback
            </h3>
            <div
              className="prose prose-invert max-w-none text-sm text-[var(--muted-foreground)] font-light leading-relaxed prose-p:mb-4"
              dangerouslySetInnerHTML={{
                __html: typeof window !== 'undefined' ? DOMPurify.sanitize(results.feedback || "") : (results.feedback || ""),
              }}
            />
          </div>

          <div className="p-10 bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] shadow-xl">
            <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-widest mb-8 text-amber-500">
              <Lightbulb className="w-5 h-5" />
              Learning Roadmap
            </h3>
            <div className="space-y-4">
              {results.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-4 p-5 bg-[var(--muted)]/30 rounded-2xl border border-[var(--border)] hover:border-amber-500/30 transition-all">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <p className="text-sm text-[var(--foreground)]/80 font-medium">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Strengths/Weaknesses */}
        <div className="space-y-8">
          <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[32px]">
            <h3 className="flex items-center gap-3 text-xs font-black uppercase tracking-widest mb-6 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
              Core Strengths
            </h3>
            <div className="space-y-3">
              {results.strengths.map((s, i) => (
                <div key={i} className="text-sm font-bold text-emerald-500/80 bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/10">
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 bg-rose-500/5 border border-rose-500/20 rounded-[32px]">
            <h3 className="flex items-center gap-3 text-xs font-black uppercase tracking-widest mb-6 text-rose-500">
              <BrainCircuit className="w-4 h-4" />
              Areas to Improve
            </h3>
            <div className="space-y-3">
              {results.weaknesses.map((w, i) => (
                <div key={i} className="text-sm font-bold text-rose-500/80 bg-rose-500/10 px-4 py-3 rounded-xl border border-rose-500/10">
                  {w}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Answer Review Section */}
      <div className="space-y-8 pt-12 border-t border-[var(--border)]">
        <h3 className="text-2xl font-black text-center mb-12">Performance Audit</h3>
        <div className="space-y-8">
          {interview.questions.slice(0, visibleCount).map((q, idx) => {
            const answer = answers.find(a => a.questionId === q.id);
            return (
              <motion.div 
                key={q.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="p-8 bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl group hover:border-[var(--accent-gradient-to)]/20 transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-gradient-to)]">Assessment {idx + 1}</span>
                    <h4 className="text-lg font-bold text-[var(--foreground)]">{q.question}</h4>
                  </div>
                  <span className="px-3 py-1 bg-[var(--muted)] text-[8px] font-black uppercase tracking-widest rounded-lg border border-[var(--border)]">
                    {q.category}
                  </span>
                </div>
                <div className="bg-[var(--muted)]/30 rounded-2xl p-6 border border-[var(--border)] group-hover:bg-[var(--muted)]/50 transition-all">
                  <pre className="text-xs text-[var(--muted-foreground)] whitespace-pre-wrap font-mono leading-relaxed">
                    {answer?.content || 'No response provided.'}
                  </pre>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Show More Pagination */}
      {visibleCount < answers.length && (
        <div className="flex justify-center pt-8">
          <button
            onClick={() => setVisibleCount((prev) => prev + 2)}
            className="px-10 py-4 bg-[var(--muted)] hover:bg-[var(--foreground)]/5 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-[var(--border)] transition-all"
          >
            Show more detailed analysis ({answers.length - visibleCount} units
            remaining)
          </button>
        </div>
      )}
    </div>
  );
}
