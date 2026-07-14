"use client";

import { useState, useRef, useEffect } from "react";
import { Building2, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CompanyPrepButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const companies = ["Google", "Amazon", "Microsoft", "Meta", "Adobe", "Samsung"];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreatePrepKit = async (company: string) => {
    setIsLoading(company);
    setIsOpen(false);
    try {
      const res = await fetch("/api/study-plans/generate-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate prep kit");
      }

      toast.success(`${company} Prep Kit Generated!`, {
        description: `Successfully loaded ${data.problemsCount} questions.`,
      });

      router.push(`/study-plans/${data.slug}`);
      router.refresh();
    } catch (error: unknown) {
      toast.error("Generation Failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading !== null}
        className="flex items-center gap-2 px-6 py-3.5 bg-[#0a0a0a] border border-white/5 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-white/5 active:scale-95 shadow-xl disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        ) : (
          <Building2 className="w-4 h-4 text-blue-500" />
        )}
        {isLoading ? `Assembling ${isLoading}...` : "Company Prep Kit"}
        <ChevronDown size={12} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#0e0e11] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 mb-1.5">
            Select Targeted Company
          </div>
          {companies.map((company) => (
            <button
              key={company}
              onClick={() => handleCreatePrepKit(company)}
              className="w-full text-left px-4 py-2 text-xs font-bold text-gray-300 hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
            >
              {company}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
