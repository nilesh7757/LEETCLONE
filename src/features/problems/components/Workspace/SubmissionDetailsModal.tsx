/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, XCircle, Clock, Cpu, Layout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Submission } from "@/types/submission";

interface SubmissionDetailsModalProps {
  submission: Submission | null;
  onClose: () => void;
}

export default function SubmissionDetailsModal({ submission, onClose }: SubmissionDetailsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!submission) return null;

  const results = Array.isArray(submission.testCaseResults) ? submission.testCaseResults : [];

  return (
    <AnimatePresence>
      {mounted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90dvh] bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${submission.status === 'Accepted' ? 'bg-[var(--viz-green)]/10 text-[var(--viz-green)]' : 'bg-[var(--viz-red)]/10 text-[var(--viz-red)]'}`}>
                  {submission.status === 'Accepted' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{submission.status}</h2>
                  <p className="text-xs text-[var(--muted-foreground)] font-bold uppercase tracking-widest">
                    {submission.language} • {new Date(submission.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[var(--foreground)]/5 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatItem icon={Clock} label="Runtime" value={submission.runtime ? `${submission.runtime} ms` : "N/A"} />
                <StatItem icon={Cpu} label="Memory" value={submission.memory ? `${(submission.memory / 1024 / 1024).toFixed(2)} MB` : "N/A"} />
                <StatItem icon={Layout} label="Language" value={submission.language} />
              </div>

              {/* Code Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Submitted Code</h3>
                <div className="relative group">
                    <pre className="p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)] overflow-x-auto font-mono text-sm leading-relaxed text-[var(--foreground)]/80">
                    <code>{submission.code}</code>
                    </pre>
                </div>
              </div>

              {/* Test Cases Breakdown */}
              {results.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Test Case Results</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {results.map((res, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Case #{i + 1}</span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${res.status === 'Accepted' ? 'text-[var(--viz-green)]' : 'text-[var(--viz-red)]'}`}>{res.status}</span>
                        </div>
                        
                        {/* Display Input (Test Case) */}
                        {res.input !== undefined && res.input !== null && (
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Input</span>
                            <pre className="p-3 bg-black/20 rounded-lg text-xs font-mono max-h-40 overflow-y-auto whitespace-pre-wrap">{String(res.input)}</pre>
                          </div>
                        )}

                        {res.status !== 'Accepted' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Expected</span>
                              <pre className="p-3 bg-black/20 rounded-lg text-xs font-mono">
                                {res.expected !== undefined 
                                  ? (typeof res.expected === 'string' ? res.expected : JSON.stringify(res.expected))
                                  : (res.expectedOutput !== undefined 
                                      ? (typeof res.expectedOutput === 'string' ? res.expectedOutput : JSON.stringify(res.expectedOutput))
                                      : "N/A")}
                              </pre>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Actual</span>
                              <pre className="p-3 bg-black/20 rounded-lg text-xs font-mono text-red-400">
                                {res.actual !== undefined 
                                  ? (typeof res.actual === 'string' ? res.actual : JSON.stringify(res.actual))
                                  : (res.actualOutput !== undefined 
                                      ? (typeof res.actualOutput === 'string' ? res.actualOutput : JSON.stringify(res.actualOutput))
                                      : "N/A")}
                              </pre>
                            </div>
                          </div>
                        )}

                        {res.error && (
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-[var(--viz-red)] uppercase tracking-wider">Error Details</span>
                            <pre className="p-3 bg-red-950/20 text-red-400 border border-red-950/30 rounded-lg text-xs font-mono whitespace-pre-wrap">{res.error}</pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
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
