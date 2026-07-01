"use client";

import { FileText, Lightbulb, Hash, Timer, Cpu, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { useTheme } from "next-themes";

interface TestCase {
  input: string | object;
  expectedOutput?: string | object;
}

interface ProblemDescriptionProps {
  description: string;
  examples: TestCase[];
  difficulty: string;
  category: string;
  timeLimit: number;
  memoryLimit: number;
}

export default function ProblemDescription({
  description,
  examples,
  difficulty,
  category,
  timeLimit,
  memoryLimit,
}: ProblemDescriptionProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState(description);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setSanitizedHtml(DOMPurify.sanitize(description));
  }, [description]);

  const isDark = resolvedTheme !== "light" && resolvedTheme !== "cream";

  const diffColor = 
    difficulty.toLowerCase() === "easy" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
    difficulty.toLowerCase() === "medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
    "bg-red-500/10 text-red-500 border-red-500/20";

  return (
    <div className="flex flex-col gap-8 pb-12 select-text bg-transparent">
      {/* Dynamic Metadata Bar */}
      <div className="flex flex-wrap gap-2 items-center border-b border-[var(--border)] pb-5 shrink-0">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${diffColor}`}>
          {difficulty}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--foreground)]/5 border border-[var(--border)] text-[var(--muted-foreground)] flex items-center gap-1.5">
          <Tag size={12} />
          {category}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--foreground)]/5 border border-[var(--border)] text-[var(--muted-foreground)] flex items-center gap-1.5">
          <Timer size={12} />
          {timeLimit > 10 ? timeLimit / 1000 : timeLimit}s Limit
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--foreground)]/5 border border-[var(--border)] text-[var(--muted-foreground)] flex items-center gap-1.5">
          <Cpu size={12} />
          {memoryLimit}MB Limit
        </span>
      </div>

      {/* Main Prose description */}
      <div
        className={`prose prose-sm max-w-none ${isDark ? "prose-invert" : ""}
        [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-tighter [&_h1]:mb-6 [&_h1]:text-[var(--foreground)]
        [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-[var(--foreground)] [&_h2]:border-b [&_h2]:border-[var(--border)] [&_h2]:pb-2
        [&_p]:text-[var(--muted-foreground)] [&_p]:leading-relaxed [&_p]:mb-4 [&_p]:text-[14px]
        [&_strong]:text-[var(--foreground)] [&_strong]:font-semibold
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
        [&_li]:mb-2 [&_li]:text-[var(--muted-foreground)]
        [&_code]:bg-[var(--primary)]/10 [&_code]:text-[var(--primary)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:font-mono [&_code]:font-semibold [&_code]:before:content-none [&_code]:after:content-none
        [&_pre]:bg-[var(--muted)] [&_pre]:border [&_pre]:border-[var(--border)] [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:my-6 [&_pre]:shadow-sm [&_pre]:text-[var(--foreground)]
      `}
      >
        <div
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </div>

      {/* Scenarios Section */}
      {examples.length > 0 && (
        <div className="space-y-6 mt-4">
          <div className="flex items-center gap-3">
             <div className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2rem]">Examples</div>
             <div className="flex-1 h-px bg-gradient-to-r from-[var(--border)] to-transparent" />
          </div>

          <div className="space-y-4">
            {examples.map((ex, i) => (
              <div
                key={i}
                className="bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-2xl p-4 transition-all duration-300"
              >
                <div className="text-[10px] font-black text-[var(--muted-foreground)]/50 uppercase tracking-wider mb-3">Example {i + 1}</div>
                <div className="font-mono text-xs space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-wider w-16 shrink-0">Input:</span>
                    <span className="text-[var(--foreground)] font-medium break-all whitespace-pre-wrap">
                      {typeof ex.input === "object" ? JSON.stringify(ex.input) : ex.input}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider w-16 shrink-0">Output:</span>
                    <span className="text-emerald-500 font-bold break-all whitespace-pre-wrap">
                      {typeof ex.expectedOutput === "object" ? JSON.stringify(ex.expectedOutput) : ex.expectedOutput}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
