"use client";

import { useState } from "react";
import { Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function GeneratePlanButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/study-plans/generate", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate plan");
      }

      toast.success("Personalized Bootcamp Generated!", {
        description: `Plan: ${data.title}`,
      });

      router.push(`/study-plans/${data.slug}`);
      router.refresh();
    } catch (error: unknown) {
      toast.error("Generation Failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={isLoading}
      className="flex items-center gap-2 px-6 py-3 bg-[var(--viz-gold)] text-black rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-[var(--viz-gold)]/20 disabled:opacity-50 disabled:scale-100"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Zap className="w-4 h-4" />
      )}
      {isLoading ? "Analyzing..." : "AI Bootcamp"}
    </button>
  );
}
