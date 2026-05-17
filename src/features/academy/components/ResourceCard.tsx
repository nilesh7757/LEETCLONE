"use client";

import { motion } from "framer-motion";
import { 
  Book, Globe, Layout, 
  ExternalLink, Youtube, FileText, 
  MonitorPlay
} from "lucide-react";

export type ResourceType = "VIDEO" | "BOOK" | "BLOG" | "WEBSITE" | "ANIMATION";

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: ResourceType;
  topic: string;
  creator: string | null;
}

interface ResourceCardProps {
  resource: Resource;
  index: number;
}

export default function ResourceCard({ resource, index }: ResourceCardProps) {
  const getIcon = (type: ResourceType) => {
    switch (type) {
      case "VIDEO": return <Youtube size={20} className="text-rose-500" />;
      case "BOOK": return <Book size={20} className="text-emerald-500" />;
      case "BLOG": return <FileText size={20} className="text-[#3b82f6]" />;
      case "WEBSITE": return <Globe size={20} className="text-amber-500" />;
      case "ANIMATION": return <MonitorPlay size={20} className="text-purple-500" />;
      default: return <Layout size={20} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      <a 
        href={resource.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block h-full bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 transition-all duration-500 hover:border-[#3b82f6]/30 hover:bg-[#0c0c0c] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] relative overflow-hidden"
      >
        {/* Type Badge */}
        <div className="flex justify-between items-start mb-6">
          <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center">
            {getIcon(resource.type)}
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.02] border border-white/5 rounded-lg">
             <div className="w-1 h-1 rounded-full bg-[#3b82f6]" />
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#52525b]">{resource.type}</span>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#3b82f6] transition-colors line-clamp-2 leading-snug">
            {resource.title}
          </h3>
          <p className="text-[12px] text-[#52525b] font-medium uppercase tracking-widest mb-4">
             by <span className="text-[#71717a]">{resource.creator || "System Curated"}</span>
          </p>
          <p className="text-[13px] text-[#52525b] line-clamp-2 leading-relaxed group-hover:text-[#71717a] transition-colors">
            {resource.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
           <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#262626] group-hover:text-[#3f3f46] transition-colors">
              {resource.topic}
           </span>
           <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#3b82f6] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
              Access <ExternalLink size={12} />
           </div>
        </div>

        {/* Decoration */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#3b82f6]/[0.02] rounded-full blur-3xl pointer-events-none group-hover:bg-[#3b82f6]/[0.05] transition-all duration-700" />
      </a>
    </motion.div>
  );
}
