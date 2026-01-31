"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ArrowRight, BrainCircuit, Lightbulb, Loader2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

interface BlueprintModalProps {
  problemTitle: string;
  problemDescription: string;
  onComplete: () => void;
  patternName?: string;
}

export default function BlueprintModal({ problemTitle, problemDescription, onComplete, patternName }: BlueprintModalProps) {
  const [logicText, setLogicText] = useState("");
  const [isJudging, setIsJudging] = useState(false);
  const [feedback, setFeedback] = useState<{
    passed: boolean;
    explanation: string;
    suggestions?: string[];
  } | null>(null);

  const handleJudge = async () => {
    if (!logicText.trim() || isJudging) return;

    setIsJudging(true);
    setFeedback(null);
    try {
      const { data } = await axios.post("/api/gemini/judge-logic", {
        title: problemTitle,
        description: problemDescription,
        logic: logicText
      });

      setFeedback(data);
      if (data.passed) {
        toast.success("Logic approved!");
      } else {
        toast.error("Logic needs improvement.");
      }
    } catch (error: any) {
      console.error("Judging error:", error);
      if (error.response?.status === 429) {
        toast.error("AI Quota reached. Please wait 60s.");
      } else {
        toast.error("Failed to judge logic. Please try again.");
      }
    } finally {
      setIsJudging(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-[var(--background)]/95 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--card-border)] bg-[var(--background)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">Logic Blueprint</h2>
              <p className="text-sm text-[var(--foreground)]/60">
                {patternName ? `Pattern: ${patternName}` : "Explain your approach before coding"}
              </p>
            </div>
          </div>
          {feedback?.passed && (
            <div className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
              Verified
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {!feedback?.passed ? (
            <>
              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2 leading-relaxed">
                  How would you solve this?
                </h3>
                <p className="text-sm text-[var(--foreground)]/60 mb-4">
                  Describe your algorithm, data structures, and how you'll handle edge cases.
                </p>
              </div>

              <div className="relative">
                <textarea
                  value={logicText}
                  onChange={(e) => setLogicText(e.target.value)}
                  placeholder="Example: I will use a hash map to store frequencies of each character. Then, I'll iterate through the string to find the first character with frequency 1..."
                  disabled={isJudging}
                  className="w-full h-48 p-4 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] focus:ring-2 focus:ring-blue-500/50 outline-none resize-none transition-all disabled:opacity-50"
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-[var(--foreground)]/40 font-mono">
                  {logicText.length} characters
                </div>
              </div>

              {feedback && !feedback.passed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-2"
                >
                  <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                    <XCircle className="w-4 h-4" />
                    <span>Improvement Needed</span>
                  </div>
                  <p className="text-sm text-[var(--foreground)]/80">
                    {feedback.explanation}
                  </p>
                  {feedback.suggestions && feedback.suggestions.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-[var(--foreground)]/60 space-y-1 pl-1">
                      {feedback.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center text-center space-y-4"
            >
              <div className="p-4 bg-green-500/10 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[var(--foreground)]">Excellent Logic!</h3>
                <p className="text-[var(--foreground)]/60 max-w-sm mt-2">
                  Your approach is sound. You've correctly identified the core logic and handled the constraints.
                </p>
              </div>
              
              <div className="w-full mt-8 p-6 bg-green-500/5 border border-green-500/20 rounded-2xl text-left">
                <div className="flex gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-[var(--foreground)] mb-1">AI Feedback</h4>
                    <p className="text-sm text-[var(--foreground)]/80 leading-relaxed">
                      {feedback.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--card-border)] bg-[var(--background)] flex justify-end gap-3">
          {!feedback?.passed ? (
            <button
              onClick={handleJudge}
              disabled={isJudging || logicText.trim().length < 20}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isJudging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Judging...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Logic
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-500/20 animate-pulse"
            >
              Start Coding <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}