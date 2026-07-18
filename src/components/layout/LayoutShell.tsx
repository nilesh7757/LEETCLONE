"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import UserTopNav from "./UserTopNav";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hiddenPaths = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify"];

  const isHidden = hiddenPaths.some(path => pathname === path || pathname.startsWith(path + "/"));
  const isWorkspace = (pathname.startsWith("/problems/") && !pathname.endsWith("/edit") && !pathname.endsWith("/new")) || pathname.startsWith("/dsa");

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("sidebar_collapsed");
    if (stored === "true") {
      setTimeout(() => {
        setIsCollapsed(true);
      }, 0);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  if (isHidden) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex">

      {/* Skip-to-content: visually hidden until focused — keyboard/screen-reader users bypass sidebar */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#8F44F0] focus:text-white focus:font-bold focus:text-sm focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Desktop Top Utilities Header */}
      {!isWorkspace && (
        <header 
          className={`hidden md:flex fixed top-0 right-0 z-40 ${
            isCollapsed ? "left-20" : "left-64"
          } h-16 items-center justify-end px-8 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)] transition-all duration-300 ease-in-out`}
        >
          <UserTopNav />
        </header>
      )}

      {/* Main Content Area */}
      <main
        id="main-content"
        className={`flex-1 ${isCollapsed ? "md:pl-20" : "md:pl-64"} min-h-screen relative flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}
      >
        <div className={`flex-1 w-full flex flex-col ${isWorkspace ? "max-w-none pt-16 md:pt-0" : "max-w-[1800px] mx-auto p-4 md:p-8 pt-20 md:pt-20 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto"}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
