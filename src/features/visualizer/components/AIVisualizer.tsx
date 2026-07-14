"use client";

import { useState } from "react";
import { Play, ChevronLeft, ChevronRight, LayoutPanelTop, Terminal, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  description: string;
  variables: Record<string, unknown>;
  highlightLines: number[];
}

interface AIVisualizerProps {
  code: string;
  language: string;
  input: string;
  problemTitle: string;
}

export default function AIVisualizer({ code, language, input, problemTitle }: AIVisualizerProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [show, setShow] = useState(false);

  const generateVisualization = async () => {
    setIsGenerating(true);
    setShow(true);
    try {
      const res = await fetch("/api/ai/visualize", {
        method: "POST",
        body: JSON.stringify({ code, language, input, problemTitle }),
      });
      const data = await res.json();
      setSteps(data.steps || []);
      setCurrentStep(0);
    } catch (e) {
      console.error("Failed to generate visualization", e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!show) {
    return (
      <button
        onClick={generateVisualization}
        className="flex items-center gap-2 px-4 py-2 bg-[var(--viz-blue)]/10 text-[var(--viz-blue)] rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[var(--viz-blue)]/20 transition-all border border-[var(--viz-blue)]/20 shadow-lg shadow-[var(--viz-blue)]/5"
      >
        <LayoutPanelTop size={14} />
        Visualize Logic
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[var(--card)] border border-[var(--border)] rounded-[2.5rem] w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="h-16 px-8 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)]/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--viz-blue)]/10 rounded-lg text-[var(--viz-blue)]">
              <Layers size={18} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--foreground)]">Execution Visualizer</h2>
          </div>
          <button onClick={() => setShow(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[var(--muted-foreground)]">
             <Terminal size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Steps & Descriptions */}
          <div className="w-1/3 border-r border-[var(--border)] flex flex-col p-8 bg-[var(--muted)]/20">
            <div className="flex-1 overflow-y-auto space-y-6">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-10 h-10 border-4 border-[var(--viz-blue)]/30 border-t-[var(--viz-blue)] rounded-full animate-spin" />
                  <p className="text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)]">AI Analyzing Path...</p>
                </div>
              ) : (
                steps.map((step, idx) => (
                  <motion.div 
                    key={idx}
                    animate={{ opacity: currentStep === idx ? 1 : 0.4, x: currentStep === idx ? 0 : -10 }}
                    className={`p-5 rounded-2xl border transition-all ${currentStep === idx ? "bg-[var(--card)] border-[var(--viz-blue)] shadow-xl" : "border-transparent"}`}
                  >
                    <div className="text-[10px] font-black text-[var(--viz-blue)] mb-2 uppercase tracking-[0.1em]">Step {idx + 1}</div>
                    <p className="text-sm text-[var(--foreground)] leading-relaxed">{step.description}</p>
                  </motion.div>
                ))
              )}
            </div>

            {/* Controls */}
            {!isGenerating && (
              <div className="mt-8 flex items-center justify-between gap-4">
                <button 
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="p-4 bg-[var(--card)] rounded-2xl border border-[var(--border)] disabled:opacity-20 hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="text-[10px] font-mono font-black text-[var(--muted-foreground)]">
                  {currentStep + 1} / {steps.length}
                </div>
                <button 
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                  className="p-4 bg-[var(--viz-blue)] text-white rounded-2xl disabled:opacity-20 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--viz-blue)]/20"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Variables & State */}
          <div className="flex-1 p-8 overflow-y-auto">
             <div className="mb-8">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-6 flex items-center gap-2">
                 <Terminal size={12} className="text-[var(--viz-blue)]" />
                 State Manifold
               </h3>
               <div className="grid grid-cols-2 gap-4">
                 {steps[currentStep]?.variables && Object.entries(steps[currentStep].variables).map(([key, val]) => (
                   <div key={key} className="p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm">
                      <div className="text-[10px] font-mono text-[var(--muted-foreground)] mb-1 uppercase opacity-40">{key}</div>
                      <div className="font-mono text-lg text-[var(--viz-blue)] font-bold">{JSON.stringify(val)}</div>
                   </div>
                 ))}
               </div>
             </div>
             
             {/* Code Preview (Static Placeholder for now, could integrate Monaco) */}
             <div className="mt-auto">
                <div className="p-6 bg-[var(--muted)] rounded-3xl border border-[var(--border)] font-mono text-xs text-[var(--muted-foreground)]/80 leading-loose overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-4 text-[8px] font-black uppercase tracking-[0.2em] opacity-20">Source Preview</div>
                   <pre className="whitespace-pre-wrap">
                      {code.split('\n').map((line, i) => (
                        <div key={i} className={`${steps[currentStep]?.highlightLines.includes(i + 1) ? "text-[var(--viz-blue)] font-bold bg-[var(--viz-blue)]/10 -mx-6 px-6" : ""}`}>
                          <span className="inline-block w-8 opacity-20">{i + 1}</span> {line}
                        </div>
                      ))}
                   </pre>
                </div>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
