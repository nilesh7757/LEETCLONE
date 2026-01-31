"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export const CodeSnippet = ({ code, language = "cpp" }: { code: string, language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-card/50 group">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">{language}</span>
        <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-xs font-mono leading-relaxed text-foreground/80">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

interface DocSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  color?: string;
}

export const DocSection = ({ title, icon: Icon, children, color = "#58C4DD" }: DocSectionProps) => (
  <section className="relative p-8 bg-card/30 border border-border rounded-[2.5rem] overflow-hidden group transition-all hover:border-foreground/20">
    <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 group-hover:opacity-[0.1] transition-all duration-700">
      <Icon size={120} style={{ color }} />
    </div>
    <h4 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ color }}>
      <div className="w-1 h-6 rounded-full" style={{ backgroundColor: color }} />
      {title}
    </h4>
    <div className="relative z-10 leading-relaxed text-sm font-light text-muted-foreground space-y-4">
      {children}
    </div>
  </section>
);

export const ComplexityCard = ({ time, space }: { time: string, space: string }) => (
  <div className="p-6 bg-card/40 border border-border rounded-[2rem] flex flex-col gap-4">
    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Asymptotic Bounds</h5>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <p className="text-[10px] text-muted-foreground/40 font-mono">Temporal</p>
        <p className="text-lg font-bold text-[#f59e0b] font-mono">{time}</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] text-muted-foreground/40 font-mono">Spatial</p>
        <p className="text-lg font-bold text-[#58C4DD] font-mono">{space}</p>
      </div>
    </div>
  </div>
);