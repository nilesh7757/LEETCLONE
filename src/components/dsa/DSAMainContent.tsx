"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, BookOpen, Code2 } from "lucide-react";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { CodeSnippet } from "./DocComponents";

interface DSACategory {
  id: string;
  title: string;
  description: string;
  themeColor: string;
  themeRGB: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: (speed: number, isFullscreen?: boolean) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detailedDocs: any;
  codeImplementations?: Record<string, string | undefined>;
}

interface DSAMainContentProps {
  selectedCategory: DSACategory;
  animationSpeed: number;
  isFullscreen: boolean;
  isStudio?: boolean;
}

const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) return (
    <div className="min-h-[480px] flex items-center justify-center bg-[var(--card)] rounded-2xl border border-[var(--border)]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-[1px] border-[#3b82f6]/20 border-t-[#3b82f6] rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.2)]" />
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-[var(--muted-foreground)] animate-pulse">Loading visualizer...</p>
      </div>
    </div>
  );
  return <>{children}</>;
};

export const DSAMainContent = ({ selectedCategory, animationSpeed, isFullscreen }: DSAMainContentProps) => {
  const [activeTab, setActiveTab] = useState<"viz" | "docs" | "code">("viz");

  const tabs = [
    { id: "viz", label: "Visualizer", icon: Activity },
    { id: "docs", label: "Resources", icon: BookOpen },
    { id: "code", label: "Code", icon: Code2 },
  ] as const;

  const VisualizationStage = (
    <div className="w-full">
       <ErrorBoundary name={selectedCategory.title} key={selectedCategory.id}>
          <ClientOnly>
             {selectedCategory.component(animationSpeed, isFullscreen)}
          </ClientOnly>
       </ErrorBoundary>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Tabs Selector Row */}
      <div className="flex gap-2 border-b border-[var(--border)]/40 pb-3">
         {tabs.map((tab) => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === tab.id 
                     ? "text-[var(--foreground)] bg-[var(--foreground)]/5 border border-[var(--border)]" 
                     : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
               }`}
            >
               <tab.icon size={12} className={activeTab === tab.id ? "text-[#3b82f6]" : "inherit"} />
               <span>{tab.label}</span>
            </button>
         ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={`${selectedCategory.id}-${activeTab}`} 
          initial={{ opacity: 0, scale: 0.99 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, filter: 'blur(20px)' }} 
          transition={{ duration: 0.3 }}
          className="relative w-full"
        >
          {activeTab === "viz" && VisualizationStage}

          {activeTab === "docs" && (
            <div className="min-h-[300px]">
              {selectedCategory.detailedDocs || (
                  <div className="p-16 rounded-2xl text-center bg-[var(--foreground)]/[0.01] border border-[var(--border)]">
                      <p className="text-[var(--muted-foreground)] text-[9px] font-mono uppercase tracking-[0.4em] animate-pulse">Resources coming soon...</p>
                  </div>
              )}
            </div>
          )}

          {activeTab === "code" && (
            <div className="p-6 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm">
               <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-[#3b82f6]" />
                  Source Implementation
               </h3>
               {selectedCategory.codeImplementations ? (
                  <CodeSnippet code={selectedCategory.codeImplementations} />
               ) : (
                   <div className="p-16 rounded-2xl text-center bg-[var(--foreground)]/[0.01] border border-dashed border-[var(--border)]">
                      <p className="text-[9px] text-[var(--muted-foreground)] font-black uppercase tracking-[0.4em]">No code available yet</p>
                   </div>
               )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
