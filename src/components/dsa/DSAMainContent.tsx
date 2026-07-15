"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

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
    <div className="w-full flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedCategory.id} 
          initial={{ opacity: 0, scale: 0.99 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, filter: 'blur(20px)' }} 
          transition={{ duration: 0.3 }}
          className="relative w-full"
        >
          {VisualizationStage}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
