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
      case "BLOG": return <FileText size={16} className="text-[#3b82f6]" />;
      case "WEBSITE": return <Globe size={16} className="text-amber-500" />;
      case "ANIMATION": return <MonitorPlay size={16} className="text-purple-500" />;
      default: return <Layout size={16} />;
    }
  };

  if (!resources || resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
          <Book size={24} className="text-[#262626]" />
        </div>
        <h4 className="text-white font-bold mb-2">No specialized resources</h4>
        <p className="text-xs text-[#52525b] max-w-[200px]">{"Our curators haven't linked specific materials to this problem yet."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-4 bg-[#3b82f6] rounded-full" />
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Curated Intelligence</h3>
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
          className="block p-5 rounded-2xl bg-[#111111]/50 border border-white/5 hover:border-[#3b82f6]/30 hover:bg-[#111111] transition-all group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
              {getIcon(res.type)}
            </div>
            <div className="text-[8px] font-black uppercase tracking-widest text-[#262626] group-hover:text-[#3b82f6] transition-colors">
              {res.type}
            </div>
          </div>
          
          <h4 className="text-sm font-bold text-white group-hover:text-[#3b82f6] transition-colors mb-1">
            {res.title}
          </h4>
          <p className="text-[10px] text-[#52525b] font-medium uppercase tracking-widest">
            {res.creator || "System Resource"}
          </p>

          <div className="mt-4 flex items-center justify-end text-[#3b82f6] opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
             <ExternalLink size={12} />
          </div>
        </motion.a>
      ))}
    </div>
  );
}
