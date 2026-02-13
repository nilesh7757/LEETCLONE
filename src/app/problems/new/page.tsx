"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Zap } from "lucide-react";
import ProblemForm, { ProblemFormData } from "@/features/problems/components/ProblemForm";
import { motion } from "framer-motion";

export default function CreateProblemPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const contestId = searchParams.get("contestId");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSubmit = async (data: ProblemFormData) => {
    toast.info("Creating problem and generating test case outputs...");

    try {
      const apiData = {
        ...data,
        examplesInput: data.examplesInput,
        testCasesInput: data.testCasesInput,
        contestId: contestId, 
      };

      const response = await axios.post("/api/problems/create", apiData);
      toast.success(`Problem "${response.data.problem.title}" created successfully!`);
      
      if (contestId) {
          router.push(`/contest/${contestId}/manage`);
      } else {
          router.push(`/problems/${response.data.problem.slug}`);
      }
    } catch (error) {
      console.error("Error creating problem:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Failed to create problem.");
      } else {
        toast.error("Failed to create problem.");
      }
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 pt-16">
        <Loader />
      </main>
    );
  }

  if (status === "unauthenticated") {
    return null; 
  }
  
  return (
    <main className="flex flex-col h-screen bg-[var(--background)]">
      {contestId && (
        <div className="bg-[var(--viz-cyan)]/10 border-b border-[var(--viz-cyan)]/20 px-4 py-2.5 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-[var(--viz-cyan)] z-50">
           <Zap className="w-3 h-3 mr-2 fill-current" /> Contest Transmission: Private Problem Protocol Active
        </div>
      )}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10" />
        <ProblemForm onSubmit={handleSubmit} contestId={contestId} />
      </div>
    </main>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center space-x-2 text-[var(--foreground)]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-4 h-4 border-2 border-[var(--foreground)]/50 border-t-[var(--foreground)] rounded-full"
      />
      <span>Loading...</span>
    </div>
  );
}
