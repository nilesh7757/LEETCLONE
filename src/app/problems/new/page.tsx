"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import ProblemForm, { ProblemFormData } from "@/components/ProblemForm";
import { motion } from "framer-motion";

export default function CreateProblemPage() {
  const { data: session, status } = useSession();
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
    } catch (error: any) {
      console.error("Error creating problem:", error);
      toast.error(error.response?.data?.error || "Failed to create problem.");
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
    <main className="flex flex-col h-screen pt-16">
      {contestId && (
        <div className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-2 flex items-center justify-center text-sm text-blue-400">
           <span className="font-semibold mr-2">Contest Mode:</span> Creating a private problem for contest.
        </div>
      )}
      <ProblemForm onSubmit={handleSubmit} contestId={contestId} />
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
