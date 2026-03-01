"use client";

import { FileText, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface TestCase {
  input: string | object;
  expectedOutput?: string | object;
}

interface ProblemDescriptionProps {
  description: string;
  examples: TestCase[];
}

export default function ProblemDescription({ description, examples }: ProblemDescriptionProps) {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="prose prose-invert prose-sm max-w-none 
        [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-tight [&_h1]:mb-6 [&_h1]:text-[var(--foreground)]
        [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-[var(--foreground)] [&_h2]:border-b [&_h2]:border-[var(--border)] [&_h2]:pb-2
        [&_p]:text-[var(--foreground)]/80 [&_p]:leading-relaxed [&_p]:mb-4
        [&_strong]:text-[var(--foreground)] [&_strong]:font-bold
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
        [&_li]:mb-2
        [&_code]:bg-[var(--viz-blue)]/10 [&_code]:text-[var(--viz-blue)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:font-mono [&_code]:before:content-none [&_code]:after:content-none
        [&_pre]:bg-[var(--card)]/50 [&_pre]:border [&_pre]:border-[var(--border)] [&_pre]:p-5 [&_pre]:rounded-2xl [&_pre]:shadow-inner [&_pre]:my-6
      ">
        <div dangerouslySetInnerHTML={{ __html: description }} />
      </div>
      
      {/* Examples Section */}
      {examples.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--viz-blue)]/10 text-[var(--viz-blue)]">
               <FileText size={18} />
            </div>
            <h3 className="text-xs font-black text-[var(--foreground)] uppercase tracking-[0.2em]">Examples</h3>
          </div>
          
          <div className="grid gap-4">
            {examples.map((ex, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-[var(--card)]/30 border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--viz-blue)]/30 transition-all overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--viz-blue)]/20 group-hover:bg-[var(--viz-blue)] transition-colors" />
                <div className="flex flex-col gap-4 text-xs font-mono">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Input</span>
                    <div className="p-3 bg-[var(--background)]/50 rounded-xl border border-[var(--border)] text-[var(--foreground)] break-all">
                      {typeof ex.input === 'object' ? JSON.stringify(ex.input, null, 2) : ex.input}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Output</span>
                    <div className="p-3 bg-[var(--viz-green)]/5 rounded-xl border border-[var(--viz-green)]/20 text-[var(--viz-green)] font-bold break-all">
                      {typeof ex.expectedOutput === 'object' ? JSON.stringify(ex.expectedOutput, null, 2) : ex.expectedOutput}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Constraints Callout (Optional/Placeholder) */}
      <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-[var(--viz-purple)]/5 to-transparent border border-[var(--viz-purple)]/10">
         <div className="flex items-center gap-3 mb-3">
            <Lightbulb size={16} className="text-[var(--viz-purple)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--viz-purple)]">Pro Tip</span>
         </div>
         <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Think about the edge cases! What happens if the input is empty or has only one element? Optimized solutions often use <span className="text-[var(--foreground)] font-bold">Two Pointers</span> or <span className="text-[var(--foreground)] font-bold">Sliding Window</span> techniques.
         </p>
      </div>
    </div>
  );
}
