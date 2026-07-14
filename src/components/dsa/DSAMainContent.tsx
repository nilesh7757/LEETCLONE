"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, ChevronRight, Activity, Code2, Info, Target, Cpu, Terminal, Maximize2, Minimize2, X } from "lucide-react";
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
  isStudio?: boolean;
}

const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) return (
    <div className="min-h-[480px] flex items-center justify-center bg-[var(--card)]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-[1px] border-[#3b82f6]/20 border-t-[#3b82f6] rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.2)]" />
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-[var(--muted-foreground)] animate-pulse">Initializing Component...</p>
      </div>
    </div>
  );
  return <>{children}</>;
};

export const DSAMainContent = ({ selectedCategory, animationSpeed, isStudio }: DSAMainContentProps) => {
  const [activeTab, setActiveTab] = React.useState<"viz" | "docs" | "code">("viz");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const vizContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);
  
  const themeColor = selectedCategory.themeColor || "#3b82f6";
  const themeRGB = selectedCategory.themeRGB || "59, 130, 246";

  React.useEffect(() => {
    setActiveTab("viz");
    setScale(1);
  }, [selectedCategory.id]);

  // Sync state with browser fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  React.useEffect(() => {
    if (!wrapperRef.current || isFullscreen) return;
    
    const handleResize = () => {
      if (wrapperRef.current) {
        const width = wrapperRef.current.getBoundingClientRect().width;
        const targetWidth = 760;
        if (width > 100) {
          if (width < targetWidth) {
            setScale(Math.max(0.4, width / targetWidth));
          } else {
            setScale(1);
          }
        }
      }
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(wrapperRef.current);
    
    window.addEventListener("resize", handleResize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [isFullscreen, activeTab, selectedCategory.id]);

  const toggleFullscreen = async () => {
    if (!vizContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await vizContainerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen toggle failed:", err);
    }
  };

  const tabs = [
    { id: "viz", label: "Visualization", icon: Activity },
    { id: "docs", label: "Logic Trace", icon: Info },
    { id: "code", label: "Source Protocol", icon: Code2 },
  ] as const;

  const VisualizationStage = (
    <div 
      ref={vizContainerRef}
      style={isFullscreen ? {} : { minHeight: `${580 * scale}px` }}
      className="w-full relative bg-[var(--card)] rounded-[3rem] border border-[var(--border)] overflow-hidden shadow-2xl transition-all duration-500"
    >
      {/* HUD Elements */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-20 pointer-events-none opacity-40">
         <Target size={16} className="text-[#3b82f6]" />
         <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--foreground)]">Studio_Live_Feed.v2</span>
      </div>
      
      <div className="absolute top-8 right-8 flex items-center gap-4 z-20">
         <div className="flex gap-6 pointer-events-none opacity-20 mr-4 font-sans">
            <div className="flex flex-col items-end">
               <span className="text-[8px] font-black uppercase text-[var(--muted-foreground)] tracking-widest">Render Layer</span>
               <span className="text-[10px] font-mono text-[var(--foreground)]">GL-Core_04</span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[8px] font-black uppercase text-[var(--muted-foreground)] tracking-widest">Sync</span>
               <span className="text-[10px] font-mono text-[#22c55e]">Active</span>
            </div>
         </div>

         <button 
            onClick={toggleFullscreen}
            className="p-3 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 border border-[var(--border)] rounded-2xl text-[var(--foreground)] transition-all backdrop-blur-xl group cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen (F11 style)"}
         >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} className="group-hover:scale-110 transition-transform" />}
         </button>
      </div>
      
      <div className="absolute bottom-8 left-8 z-20 pointer-events-none opacity-20">
         <span className="text-[9px] font-mono uppercase tracking-widest text-[#3b82f6]">{selectedCategory.id} {"// System.Loaded"}</span>
      </div>

      <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${themeColor}4D, transparent)` }} />

      <div className={`transition-all duration-700 ${isFullscreen ? "h-full flex items-center justify-center pt-10" : "p-2 md:p-4"}`}>
         <ErrorBoundary name={selectedCategory.title} key={selectedCategory.id}>
            <ClientOnly>
               <div ref={wrapperRef} className="w-full flex justify-center items-center overflow-hidden">
                  <div 
                     style={isFullscreen ? { width: "100%", height: "100%" } : {
                        transform: `scale(${scale})`,
                        transformOrigin: "center center",
                        width: "760px",
                        height: `${500 * scale}px`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "transform 0.15s ease-out"
                     }}
                  >
                     {selectedCategory.component(animationSpeed, isFullscreen)}
                  </div>
               </div>
            </ClientOnly>
         </ErrorBoundary>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-8 md:space-y-12 p-4 md:p-10">
      {/* 1. STAGE TABS */}
      {!isFullscreen && (
         <div className="flex items-center justify-between border-b border-[var(--border)] pb-6">
            <div className="flex gap-2">
               {tabs.map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`flex items-center gap-3 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all relative ${
                        activeTab === tab.id ? "text-[var(--foreground)] bg-[var(--foreground)]/5 border border-[var(--border)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                     }`}
                  >
                     <tab.icon size={14} style={{ color: activeTab === tab.id ? themeColor : "inherit" }} />
                     {tab.label}
                     {activeTab === tab.id && (
                        <motion.div layoutId="tab-underline" className="absolute -bottom-[25px] left-0 right-0 h-0.5 bg-[#3b82f6] shadow-[0_0_10px_#3b82f6]" />
                     )}
                  </button>
               ))}
            </div>
            
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--foreground)]/[0.02] border border-[var(--border)]">
                  <Terminal size={12} className="text-[#3b82f6]" />
                  <span className="text-[9px] font-mono text-[var(--muted-foreground)]">trace_layer: core.01</span>
               </div>
            </div>
         </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div 
          key={`${selectedCategory.id}-${activeTab}`} 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, filter: 'blur(20px)' }} 
          transition={{ duration: 0.4 }}
          className="relative"
        >
          {activeTab === "viz" && VisualizationStage}

          {activeTab === "docs" && (
            <div className="min-h-[400px]">
              {selectedCategory.detailedDocs || (
                  <div className="p-24 rounded-[3rem] text-center bg-[var(--foreground)]/[0.01] border border-[var(--border)] relative overflow-hidden">
                      <p className="text-[var(--muted-foreground)] text-[10px] font-mono uppercase tracking-[0.4em] animate-pulse relative z-10">Neural documentation synthesizing...</p>
                  </div>
              )}
            </div>
          )}

          {activeTab === "code" && (
            <div className="p-10 bg-[var(--card)] rounded-[3rem] border border-[var(--border)] shadow-2xl relative overflow-hidden">
               <h3 className="text-xl font-bold mb-10 flex items-center gap-4">
                  <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: themeColor }} />
                  Source Implementation
               </h3>
               {selectedCategory.codeImplementations ? (
                  <CodeSnippet code={selectedCategory.codeImplementations} />
               ) : (
                  <div className="p-16 rounded-[2.5rem] text-center bg-[var(--foreground)]/[0.01] border border-dashed border-[var(--border)]">
                     <p className="text-[9px] text-[var(--muted-foreground)] font-black uppercase tracking-[0.4em]">Protocol Source Restricted</p>
                  </div>
               )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer Info */}
      {!isFullscreen && (
         <div className="flex flex-col sm:flex-row items-center justify-between p-4 px-6 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-2xl gap-4">
            <div className="flex items-center gap-4">
               <div className="w-9 h-9 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] border border-[#3b82f6]/20 shrink-0">
                  <Cpu size={18} />
               </div>
               <div>
                  <h4 className="text-xs font-bold text-[var(--foreground)] tracking-tight">Practice Module</h4>
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 tracking-wide">Solve algorithmic challenges related to {selectedCategory.title}.</p>
               </div>
            </div>
            <button className="w-full sm:w-auto px-5 py-2 bg-[var(--foreground)] text-[var(--background)] hover:bg-[#3b82f6] hover:text-[var(--foreground)] rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer">
               Initiate Training
            </button>
         </div>
      )}
    </div>
  );
};
