"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, ChevronRight, Activity, Code2, Info, Target, Cpu, Terminal, Maximize2, Minimize2, X, Gauge, ChevronLeft, ChevronDown } from "lucide-react";
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
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-[var(--muted-foreground)] animate-pulse">Loading visualizer...</p>
      </div>
    </div>
  );
  return <>{children}</>;
};

export const DSAMainContent = ({ selectedCategory, isStudio }: DSAMainContentProps) => {
  const [activeTab, setActiveTab] = React.useState<"viz" | "docs" | "code">("viz");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [animationSpeed, setAnimationSpeed] = React.useState(800);
  const [showSpeedMenu, setShowSpeedMenu] = React.useState(false);
  const vizContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  const speedOptions = [
    { label: "0.5×", value: 1600 },
    { label: "1×", value: 800 },
    { label: "1.5×", value: 533 },
    { label: "2×", value: 400 },
    { label: "3×", value: 267 },
  ];
  const currentSpeedLabel = speedOptions.find(s => s.value === animationSpeed)?.label ?? "1×";
  
  const themeColor = selectedCategory.themeColor || "#3b82f6";
  const themeRGB = selectedCategory.themeRGB || "59, 130, 246";

  React.useEffect(() => {
    setActiveTab("viz");
    setScale(1);
    setShowSpeedMenu(false);
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
    { id: "viz", label: "Visualizer", icon: Activity },
  ] as const;

  const VisualizationStage = (
    <div ref={vizContainerRef} className="w-full">
       <ErrorBoundary name={selectedCategory.title} key={selectedCategory.id}>
          <ClientOnly>
             {selectedCategory.component(animationSpeed, isFullscreen)}
          </ClientOnly>
       </ErrorBoundary>
    </div>
  );

  return (
    <div className="w-full space-y-6 md:space-y-12 px-0 py-4 md:p-10">
      {/* 1. STAGE TABS */}
      {!isFullscreen && (
         <div className="flex items-center justify-between border-b border-[var(--border)] pb-6 px-2 md:px-0">
            <div className="flex gap-2">
               {tabs.length > 1 && tabs.map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all relative ${
                        activeTab === tab.id ? "text-[var(--foreground)] bg-[var(--foreground)]/5 border border-[var(--border)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                     }`}
                  >
                     <tab.icon size={14} style={{ color: activeTab === tab.id ? themeColor : "inherit" }} />
                     <span className="hidden sm:inline">{tab.label}</span>
                  </button>
               ))}
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2">
               {/* Speed selector (only on viz tab) */}
               {activeTab === "viz" && (
                  <div className="relative">
                     <button
                        onClick={() => setShowSpeedMenu(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all text-[10px] font-black uppercase tracking-wider"
                        title="Playback Speed"
                     >
                        <Gauge size={12} />
                        <span className="hidden sm:inline">{currentSpeedLabel}</span>
                        <ChevronDown size={10} />
                     </button>
                     {showSpeedMenu && (
                        <motion.div
                           initial={{ opacity: 0, y: -6 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="absolute right-0 mt-2 w-28 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl py-1.5 z-50"
                        >
                           {speedOptions.map(opt => (
                              <button
                                 key={opt.value}
                                 onClick={() => { setAnimationSpeed(opt.value); setShowSpeedMenu(false); }}
                                 className={`w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-[var(--foreground)]/5 ${
                                    animationSpeed === opt.value ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
                                 }`}
                              >
                                 {animationSpeed === opt.value && <span className="text-[var(--viz-green)] mr-1">✓</span>}
                                 {opt.label}
                              </button>
                           ))}
                        </motion.div>
                     )}
                  </div>
               )}

               {activeTab === "viz" && (
                  <button
                     onClick={toggleFullscreen}
                     className="p-2 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 border border-[var(--border)] rounded-xl text-[var(--foreground)] transition-all cursor-pointer flex items-center justify-center"
                     title="Fullscreen"
                  >
                     <Maximize2 size={14} />
                  </button>
               )}
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
                      <p className="text-[var(--muted-foreground)] text-[10px] font-mono uppercase tracking-[0.4em] animate-pulse relative z-10">Resources coming soon...</p>
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
