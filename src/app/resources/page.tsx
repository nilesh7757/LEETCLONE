"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, BookOpen, Filter, 
  RotateCcw, AlertCircle, LayoutGrid,
  Library, GraduationCap
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import ResourceCard, { ResourceType } from "@/features/academy/components/ResourceCard";

const TOPICS = [
  "All", "Arrays", "Linked Lists", "Strings", "Trees", 
  "Graphs", "Dynamic Programming", "Sorting", "Searching",
  "Recursion", "Two Pointers", "Sliding Window", "Heaps"
];

const TYPES: { label: string; value: ResourceType | "ALL" }[] = [
  { label: "All Types", value: "ALL" },
  { label: "Videos", value: "VIDEO" },
  { label: "Books", value: "BOOK" },
  { label: "Blogs", value: "BLOG" },
  { label: "Websites", value: "WEBSITE" },
  { label: "Animations", value: "ANIMATION" },
];

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedType, setSelectedType] = useState<ResourceType | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let url = "/api/resources";
      const params = new URLSearchParams();
      if (selectedTopic !== "All") params.append("topic", selectedTopic);
      if (selectedType !== "ALL") params.append("type", selectedType);
      
      const { data } = await axios.get(`${url}?${params.toString()}`);
      setResources(data.resources);
    } catch (err) {
      console.error(err);
      setError("Unable to synchronize with the knowledge base.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTopic, selectedType]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#020202] text-[#e1e1e1] font-sans selection:bg-[#3b82f6]/30 pb-20 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-6 py-12 lg:py-16">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative">
           <div className="space-y-6 max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                 <div className="p-2.5 bg-[#3b82f6]/10 rounded-xl text-[#3b82f6] border border-[#3b82f6]/20">
                    <GraduationCap size={20} />
                 </div>
                 <span className="text-[10px] font-black tracking-[0.3em] text-[#52525b] uppercase font-mono">Cognitive Repository</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                  Knowledge <span className="text-[#3b82f6]">Vault</span>
                </h1>
                <p className="text-base text-[#71717a] leading-relaxed max-w-xl">
                  A curated aggregation of high-fidelity learning materials. Access premier 
                  content from industry-leading creators across the algorithmic landscape.
                </p>
              </motion.div>
           </div>

           {/* DECORATIVE BLOBS */}
           <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#3b82f6]/5 blur-[120px] rounded-full pointer-events-none" />
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-12">
            {/* Search */}
            <div className="relative w-full lg:w-96 group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3f3f46] group-focus-within:text-[#3b82f6] transition-colors" />
                <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search the vault..."
                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-[#3b82f6]/40 focus:bg-[#0c0c0c] transition-all placeholder:text-[#3f3f46]"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
               <div className="p-1 bg-[#0a0a0a] border border-white/5 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {TYPES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setSelectedType(t.value)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            selectedType === t.value ? "bg-white text-black shadow-lg" : "text-[#52525b] hover:text-white"
                        }`}
                      >
                        {t.label}
                      </button>
                  ))}
               </div>
            </div>
        </div>

        {/* TOPIC CHIPS */}
        <div className="flex items-center gap-3 mb-12 overflow-x-auto no-scrollbar pb-2">
            <div className="flex items-center gap-2 mr-4 text-[9px] font-black uppercase tracking-widest text-[#262626]">
                <Filter size={12} /> Topics
            </div>
            {TOPICS.map(topic => (
                <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-5 py-2 rounded-full text-[10px] font-bold transition-all border whitespace-nowrap ${
                        selectedTopic === topic 
                        ? "bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                        : "bg-[#0a0a0a] border-white/5 text-[#52525b] hover:border-white/10 hover:text-[#a1a1aa]"
                    }`}
                >
                    {topic}
                </button>
            ))}
        </div>

        {/* GRID AREA */}
        <AnimatePresence mode="wait">
           {isLoading ? (
               <motion.div 
                 key="loading" 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
               >
                   {[...Array(8)].map((_, i) => <SkeletonLoader key={i} />)}
               </motion.div>
           ) : error ? (
               <motion.div 
                 key="error" 
                 initial={{ opacity: 0, scale: 0.98 }} 
                 animate={{ opacity: 1, scale: 1 }}
                 className="py-32 text-center rounded-[3rem] bg-[#0a0a0a] border border-white/5 border-dashed"
               >
                  <AlertCircle className="w-16 h-16 text-rose-500/20 mx-auto mb-8" />
                  <h3 className="text-xl font-bold text-white mb-4">Registry Offline</h3>
                  <p className="text-sm text-[#52525b] max-w-sm mx-auto mb-10">{error}</p>
                  <button 
                    onClick={fetchResources}
                    className="inline-flex items-center gap-2 px-10 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-[#3b82f6] hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5"
                  >
                    <RotateCcw size={16} /> Retry Sync
                  </button>
               </motion.div>
           ) : filteredResources.length === 0 ? (
               <motion.div 
                 key="empty" 
                 initial={{ opacity: 0, y: 10 }} 
                 animate={{ opacity: 1, y: 0 }}
                 className="py-40 text-center rounded-[3rem] bg-[#0a0a0a] border border-white/5 border-dashed"
               >
                  <Library className="w-20 h-20 text-[#1a1a1a] mx-auto mb-8" />
                  <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-tighter">No Materials Found</h3>
                  <p className="text-sm text-[#52525b] max-w-xs mx-auto">
                    No resources matched your current filter criteria. Try expanding your search or clearing filters.
                  </p>
               </motion.div>
           ) : (
               <motion.div 
                 key="grid" 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }}
                 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
               >
                  {filteredResources.map((res, i) => (
                      <ResourceCard key={res.id} resource={res} index={i} />
                  ))}
               </motion.div>
           )}
        </AnimatePresence>
      </div>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}

function SkeletonLoader() {
    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 h-[320px] flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white/5 rounded-xl animate-pulse" />
                <div className="w-16 h-5 bg-white/5 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-4 mb-8">
                <div className="w-3/4 h-7 bg-white/5 rounded-xl animate-pulse" />
                <div className="w-1/2 h-4 bg-white/5 rounded-lg animate-pulse" />
                <div className="w-full h-12 bg-white/5 rounded-xl animate-pulse" />
            </div>
            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="w-20 h-3 bg-white/5 rounded-full animate-pulse" />
                <div className="w-12 h-3 bg-white/5 rounded-full animate-pulse" />
            </div>
        </div>
    );
}
