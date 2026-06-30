"use client";

import { motion } from "framer-motion";
import { ExternalLink, Youtube, Book, FileText, Globe, MonitorPlay, Layout } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
  creator?: string | null;
}

interface ProblemResourcesProps {
  resources: Resource[];
}

export default function ProblemResources({ resources }: ProblemResourcesProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "VIDEO": return <Youtube size={16} className="text-rose-500" />;
      case "BOOK": return <Book size={16} className="text-emerald-500" />;
      case "BLOG": return <FileText size={16} className="text-[var(--primary)]" />;
      case "WEBSITE": return <Globe size={16} className="text-amber-500" />;
      case "ANIMATION": return <MonitorPlay size={16} className="text-purple-500" />;
      default: return <Layout size={16} />;
    }
  };

  if (!resources || resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-transparent">
        <div className="w-16 h-16 bg-[var(--foreground)]/5 rounded-full flex items-center justify-center mb-6 border border-[var(--border)]">
          <Book size={24} className="text-[var(--muted-foreground)]/30" />
        </div>
        <h4 className="text-[var(--foreground)] font-bold mb-2">No specialized resources</h4>
        <p className="text-xs text-[var(--muted-foreground)] max-w-[200px]">{"Our curators haven't linked specific materials to this problem yet."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-transparent">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-4 bg-[var(--primary)] rounded-full" />
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--foreground)]">Curated Intelligence</h3>
      </div>
      
      {resources.map((res, i) => (
        <motion.a
          key={res.id}
          href={res.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="block p-5 rounded-2xl bg-[var(--card)]/50 border border-[var(--border)] hover:border-[var(--primary)]/30 hover:bg-[var(--card)] transition-all group shadow-sm"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-[var(--foreground)]/5 rounded-lg border border-[var(--border)]">
              {getIcon(res.type)}
            </div>
            <div className="text-[8px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40 group-hover:text-[var(--primary)] transition-colors">
              {res.type}
            </div>
          </div>
          
          <h4 className="text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors mb-1">
            {res.title}
          </h4>
          <p className="text-[10px] text-[var(--muted-foreground)] font-medium uppercase tracking-widest">
            {res.creator || "System Resource"}
          </p>

          <div className="mt-4 flex items-center justify-end text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
             <ExternalLink size={12} />
          </div>
        </motion.a>
      ))}
    </div>
  );
}
