/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Clock, Cpu, Layout, Sparkles, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Submission } from "@/types/submission";
import axios from "axios";
import { toast } from "sonner";

interface SubmissionDetailsModalProps {
  submission: Submission | null;
  onClose: () => void;
}

export default function SubmissionDetailsModal({ submission, onClose }: SubmissionDetailsModalProps) {
  const [complexity, setComplexity] = useState<{ time: string; space: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setComplexity(null);
  }, [submission?.id]);

  if (!submission) return null;

  const handleAnalyzeComplexity = async () => {
    setIsAnalyzing(true);
    try {
      const { data } = await axios.post("/api/ai/predict-complexity", {
        code: submission.code,
        language: submission.language
      });
      setComplexity({
        time: data.timeComplexity || "O(N)",
        space: data.spaceComplexity || "O(1)"
      });
      toast.success("AI complexity analysis complete!");
    } catch (err) {
      toast.error("Failed to analyze complexity");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const results = Array.isArray(submission.testCaseResults) ? submission.testCaseResults : [];
  
  // Filter for only failed test cases
  const failedResults = results.filter((res) => res.status !== "Accepted");
  const isAccepted = submission.status === "Accepted";
  const executionError = results.find((res) => res.error)?.error;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]">
        <div className="flex items-center gap-3.5">
          <div className={`p-2.5 rounded-xl ${isAccepted ? 'bg-[var(--viz-green)]/10 text-[var(--viz-green)]' : 'bg-[var(--viz-red)]/10 text-[var(--viz-red)]'}`}>
            {isAccepted ? <CheckCircle size={20} /> : <XCircle size={20} />}
          </div>
          <div>
            <h3 className="font-black text-lg leading-none mb-1">{submission.status}</h3>
            <p className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-widest">
              {submission.language} • {new Date(submission.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <button 
          onClick={onClose} 
          className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--foreground)]/5 transition-all"
        >
          Close Result
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatItem icon={Clock} label="Runtime" value={submission.runtime ? `${submission.runtime} ms` : "N/A"} />
        <StatItem icon={Cpu} label="Memory" value={submission.memory ? `${(submission.memory / 1024 / 1024).toFixed(2)} MB` : "N/A"} />
        <StatItem icon={Layout} label="Language" value={submission.language} />
      </div>

      {/* Complexity Analysis Panel */}
      {isAccepted && (
        <div className="pt-2">
          {complexity ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 font-bold shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-0.5 font-sans">Time Complexity</p>
                  <p className="font-bold text-sm text-amber-500 font-mono">{complexity.time}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
                  <Cpu size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-0.5 font-sans">Space Complexity</p>
                  <p className="font-bold text-sm text-purple-500 font-mono">{complexity.space}</p>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleAnalyzeComplexity}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border border-[var(--primary)]/20 text-[var(--primary)] rounded-2xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 border-none"
            >
              {isAnalyzing ? (
                 <>
                   <Loader2 size={14} className="animate-spin" /> Analyzing Complexity...
                 </>
              ) : (
                 <>
                   <Sparkles size={14} /> Analyze Time & Space Complexity (AI)
                 </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Test Cases Results */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Test Case Results</h3>
        
        {isAccepted ? (
          <div className="p-5 rounded-2xl bg-[var(--viz-green)]/[0.03] border border-[var(--viz-green)]/15 flex items-center gap-3.5">
            <div className="p-2 bg-[var(--viz-green)]/10 text-[var(--viz-green)] rounded-xl shrink-0">
              <CheckCircle size={18} />
            </div>
            <div>
              <p className="font-bold text-sm text-[var(--foreground)]">All test cases passed!</p>
              <p className="text-xs text-[var(--muted-foreground)]">Your solution is fully correct and optimal.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {failedResults.length > 0 ? (
              failedResults.map((res, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Failing Case #{i + 1}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--viz-red)]">{res.status}</span>
                  </div>
                  
                  {res.input !== undefined && res.input !== null && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Input</span>
                      <pre className="p-3 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-xs font-mono max-h-40 overflow-y-auto whitespace-pre-wrap">{String(res.input)}</pre>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                         <span>Actual Output</span>
                         <XCircle size={10} className="text-red-500" />
                      </div>
                      <pre className="p-3 bg-red-500/5 border border-red-500/20 text-red-500 rounded-lg text-xs font-mono max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {res.actual !== undefined 
                          ? (typeof res.actual === 'string' ? res.actual : JSON.stringify(res.actual))
                          : (res.actualOutput !== undefined 
                              ? (typeof res.actualOutput === 'string' ? res.actualOutput : JSON.stringify(res.actualOutput))
                              : "N/A")}
                      </pre>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                         <span>Expected Output</span>
                         <CheckCircle size={10} className="text-green-500" />
                      </div>
                      <pre className="p-3 bg-green-500/5 border border-green-500/20 text-green-500 rounded-lg text-xs font-mono max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {res.expected !== undefined 
                          ? (typeof res.expected === 'string' ? res.expected : JSON.stringify(res.expected))
                          : (res.expectedOutput !== undefined 
                              ? (typeof res.expectedOutput === 'string' ? res.expectedOutput : JSON.stringify(res.expectedOutput))
                              : "N/A")}
                      </pre>
                    </div>
                  </div>

                  {res.error && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Error Details</span>
                      <pre className="p-3 bg-red-500/5 text-red-500 border border-red-500/20 rounded-lg text-xs font-mono whitespace-pre-wrap">{res.error}</pre>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--viz-red)]">
                  <AlertTriangle size={16} />
                  <span>Execution Failure Details</span>
                </div>
                {executionError ? (
                  <pre className="p-3 bg-red-500/5 text-red-500 border border-red-500/20 rounded-lg text-xs font-mono whitespace-pre-wrap">{executionError}</pre>
                ) : (
                  <p className="text-xs text-[var(--muted-foreground)]">No test case details are available for this run status.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Code Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Submitted Code</h3>
        <pre className="p-5 bg-[var(--background)] rounded-2xl border border-[var(--border)] overflow-x-auto font-mono text-sm leading-relaxed text-[var(--foreground)]/80">
          <code>{submission.code}</code>
        </pre>
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-center gap-4">
      <div className="p-2.5 rounded-xl bg-[var(--foreground)]/5 text-[var(--muted-foreground)]">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-0.5">{label}</p>
        <p className="font-bold text-sm">{value}</p>
      </div>
    </div>
  );
}
