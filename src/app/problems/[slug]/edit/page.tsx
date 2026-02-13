"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import axios from "axios";
import ProblemForm, { ProblemFormData } from "@/features/problems/components/ProblemForm";
import { motion } from "framer-motion";
import { use } from "react";

interface TestSetItem {
  input: string;
  output: string;
  isExample?: boolean;
  expectedOutput?: string;
}

export default function EditProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const { status } = useSession();
  const router = useRouter();
  const [initialData, setInitialData] = useState<ProblemFormData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProblem = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/problems/${slug}/details`); // I will create this.
      
      const p = data.problem;
      const parsedTestSets: { examples: TestSetItem[], hidden: TestSetItem[] } = { examples: [], hidden: [] };
      
      try {
          let rawData = p.testSets;
          if (typeof rawData === "string") {
            rawData = JSON.parse(rawData);
          }

          if (Array.isArray(rawData)) {
            // Handle legacy flat array format
            rawData.forEach((ts: TestSetItem) => {
              const item = {
                input: ts.input || "",
                output: ts.expectedOutput || ts.output || ""
              };
              if (ts.isExample === true) {
                parsedTestSets.examples.push(item);
              } else {
                parsedTestSets.hidden.push(item);
              }
            });
            // Fallback: If no isExample flags were found, put all in examples
            if (parsedTestSets.examples.length === 0 && parsedTestSets.hidden.length > 0) {
               parsedTestSets.examples = parsedTestSets.hidden;
               parsedTestSets.hidden = [];
            }
          } else if (rawData && typeof rawData === "object") {
            // Handle standard { examples: [], hidden: [] } format
            parsedTestSets.examples = (rawData.examples || []).map((t: TestSetItem) => ({
              input: t.input || "",
              output: t.expectedOutput || t.output || ""
            }));
            parsedTestSets.hidden = (rawData.hidden || []).map((t: TestSetItem) => ({
              input: t.input || "",
              output: t.expectedOutput || t.output || ""
            }));
          }
      } catch (e) {
        console.error("Failed to parse testSets", e);
      }

      setInitialData({
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        category: p.category,
        description: p.description,
        examplesInput: parsedTestSets.examples,
        testCasesInput: parsedTestSets.hidden,
        referenceSolution: p.referenceSolution || "",
        initialSchema: p.initialSchema || "",
        initialData: p.initialData || "",
        language: "javascript", 
        timeLimit: p.timeLimit,
        memoryLimit: p.memoryLimit,
        isPublic: p.isPublic,
        editorial: p.editorial || "",
        problemType: p.type || "CODING",
        hints: p.hints || []
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load problem details");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProblem();
    }
  }, [status, router, fetchProblem]);

  const handleSubmit = async (data: ProblemFormData) => {
    toast.info("Updating problem...");
    try {
      const { slug: newSlug } = data; // Slug might change? Assuming slug update allowed for now.
      
      // We use the original slug for the URL param, but payload contains new data.
      await axios.put(`/api/problems/${slug}/update`, data);
      
      toast.success("Problem updated successfully!");
      if (returnTo) {
        router.push(returnTo);
      } else {
        router.push(`/problems/${newSlug}`); // Redirect to new slug
      }
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Failed to update problem.");
      } else {
        toast.error("Failed to update problem.");
      }
    }
  };

  if (loading || status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 pt-16">
        <Loader />
      </main>
    );
  }

  if (!initialData) return null;

  return (
    <main className="flex flex-col h-screen pt-16">
      <ProblemForm initialData={initialData} onSubmit={handleSubmit} isEditing={true} />
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
