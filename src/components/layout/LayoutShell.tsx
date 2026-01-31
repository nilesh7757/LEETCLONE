"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import UserTopNav from "./UserTopNav";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hiddenPaths = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify"];

  const isHidden = hiddenPaths.some(path => pathname === path || pathname.startsWith(path + "/"));

  // Determine if we need high-density layout (workspace) or standard padded layout
  const isWorkspace = pathname.startsWith("/problems/") && !pathname.endsWith("/edit") && !pathname.endsWith("/new");

  if (isHidden) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Desktop Top Utilities */}
      <div className="hidden md:block fixed top-0 right-0 z-40">
        <UserTopNav />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 pt-16 md:pt-0 min-h-screen relative flex flex-col transition-all duration-200 ease-in-out overflow-hidden">
        <div className={`flex-1 w-full flex flex-col ${isWorkspace ? "" : "p-4 md:p-8 pt-20 md:pt-16 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto"}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
