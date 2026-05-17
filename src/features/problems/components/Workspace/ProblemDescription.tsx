"use client";

import { FileText, Lightbulb, Hash } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import DOMPurify from "dompurify";

interface TestCase {
  input: string | object;
  expectedOutput?: string | object;
}

interface ProblemDescriptionProps {
  description: string;
  examples: TestCase[];
}

export default function ProblemDescription({
  description,
  examples,
}: ProblemDescriptionProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState(description);

  useEffect(() => {
    setSanitizedHtml(DOMPurify.sanitize(description));
  }, [description]);

  return (
    <div className="flex flex-col gap-10 pb-20 select-text">
      <div
        className="prose prose-invert prose-sm max-w-none
        [&_h1]:text-3xl [&_h1]:font-black [&_h1]:tracking-tighter [&_h1]:mb-8 [&_h1]:text-white [&_h1]:bg-clip-text [&_h1]:text-transparent [&_h1]:bg-gradient-to-r [&_h1]:from-white [&_h1]:to-white/50
        [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:text-white [&_h2]:border-b [&_h2]:border-white/10 [&_h2]:pb-3
        [&_p]:text-[#a1a1aa] [&_p]:leading-relaxed [&_p]:mb-6 [&_p]:text-[15px]
        [&_strong]:text-white [&_strong]:font-black
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6
        [&_li]:mb-3 [&_li]:text-[#a1a1aa]
        [&_code]:bg-[#3b82f6]/10 [&_code]:text-[#3b82f6] [&_code]:px-2 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:font-mono [&_code]:font-bold [&_code]:before:content-none [&_code]:after:content-none
        [&_pre]:bg-[#0a0a0a] [&_pre]:border [&_pre]:border-white/10 [&_pre]:p-6 [&_pre]:rounded-2xl [&_pre]:my-8 [&_pre]:shadow-2xl
      "
      >
        <div
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </div>

      {/* Scenarios Section */}
      {examples.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
             <div className="text-[11px] font-black text-[#3b82f6] uppercase tracking-[0.3em]">Execution Scenarios</div>
             <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="grid gap-6">
            {examples.map((ex, i) => (
              <div
                key={i}
                className="group relative bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 hover:border-[#3b82f6]/30 transition-all duration-500 overflow-hidden shadow-xl"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                   <Hash size={40} className="text-white" />
                </div>
                <div className="flex flex-col gap-6 text-[13px] font-mono relative z-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-1 rounded-full bg-[#3b82f6]" />
                       <span className="text-[10px] font-black text-[#52525b] uppercase tracking-widest">Input</span>
                    </div>
                    <div className="p-4 bg-black/60 rounded-2xl border border-white/5 text-[#f5f5f5] break-all shadow-inner leading-relaxed">
                      {typeof ex.input === "object"
                        ? JSON.stringify(ex.input, null, 2)
                        : ex.input}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-1 rounded-full bg-[#22c55e]" />
                       <span className="text-[10px] font-black text-[#52525b] uppercase tracking-widest">Expected Output</span>
                    </div>
                    <div className="p-4 bg-[#111111] rounded-2xl border border-white/5 text-[#22c55e] font-bold break-all shadow-inner leading-relaxed">
                      {typeof ex.expectedOutput === "object"
                        ? JSON.stringify(ex.expectedOutput, null, 2)
                        : ex.expectedOutput}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Constraints Footer */}
      <div className="mt-12 p-8 rounded-[2rem] bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#3b82f6]/5 blur-[80px] rounded-full group-hover:bg-[#3b82f6]/10 transition-colors duration-1000" />
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-[#3b82f6]/10">
             <Lightbulb size={16} className="text-[#3b82f6]" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
            Engineering Insights
          </span>
        </div>
        <p className="text-[14px] text-[#52525b] leading-relaxed relative z-10">
          Prioritize <span className="text-white font-bold">algorithmic efficiency</span>. 
          Analyze constraints to choose between <span className="text-[#3b82f6] font-mono">O(N)</span> and <span className="text-[#3b82f6] font-mono">O(N log N)</span> approaches. 
          Use spatial memoization to trade memory for speed where applicable.
        </p>
      </div>
    </div>
  );
}
