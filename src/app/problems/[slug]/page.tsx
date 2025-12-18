import Split from "react-split";
import { Editor } from "@monaco-editor/react";
import { Play, Send, ChevronLeft, Settings, RotateCcw } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WorkspaceClient from "./WorkspaceClient";
import { auth } from "@/auth";
import { TestInputOutput } from "@/lib/codeExecution";

interface WorkspaceProps {
  params: Promise<{ slug: string }>;
}

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  description: string;
  timeLimit: number;
  memoryLimit: number;
  testSets: any;
  hints: string[];
  referenceSolution: string | null;
  initialSchema: string | null;
  initialData: string | null;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  creatorId: string | null;
  contests: {
    startTime: Date;
    creatorId: string;
  }[];
  // New fields for diverse problem types
  type: "CODING" | "SHELL" | "INTERACTIVE" | "SYSTEM_DESIGN" | "SQL"; // Corrected from problemType to type
}

export default async function Workspace({ params }: WorkspaceProps) {
  const { slug } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  
  const problem = await prisma.problem.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      difficulty: true,
      category: true,
      description: true,
      timeLimit: true,
      memoryLimit: true,
      testSets: true,
      hints: true,
      referenceSolution: true,
      createdAt: true,
      updatedAt: true,
      isPublic: true,
      creatorId: true,
      contests: {
        select: {
          startTime: true,
          creatorId: true,
        },
      },
      // Select new problem type fields
      type: true,
      initialSchema: true,
      initialData: true,
    }
  }) as Problem;

  if (!problem) {
    notFound();
  }

  // Access Control Check
  const now = new Date();
  const isVisible =
    problem.isPublic ||
    (userId && problem.creatorId === userId) ||
    problem.contests.some((contest) => {
      const hasStarted = new Date(contest.startTime) <= now;
      const isContestCreator = userId ? contest.creatorId === userId : false;
      return hasStarted || isContestCreator;
    });

  if (!isVisible) {
    notFound(); // Or redirect to /problems
  }

  let allTestCases: TestInputOutput[] = [];
  let rawTestSets = problem.testSets;

  if (typeof rawTestSets === 'string') {
    try {
      rawTestSets = JSON.parse(rawTestSets);
    } catch (e) {
      console.error("Failed to parse testSets string", e);
    }
  }

  if (Array.isArray(rawTestSets)) {
    allTestCases = rawTestSets;
  } else if (rawTestSets && typeof rawTestSets === 'object' && 'examples' in rawTestSets && 'hidden' in rawTestSets) {
    (rawTestSets.examples as TestInputOutput[]).forEach(tc => allTestCases.push({ ...tc, isExample: true }));
    (rawTestSets.hidden as TestInputOutput[]).forEach(tc => allTestCases.push({ ...tc, isExample: false }));
  } else {
    console.error("page.tsx: Unexpected format for problem.testSets:", rawTestSets);
    allTestCases = [];
  }

  // Filter for only example test cases to pass to WorkspaceClient
  const examplesForClient = allTestCases.filter(tc => tc.isExample === true);

  return (
    <main className="h-screen flex flex-col pt-16 overflow-hidden bg-[var(--background)]">
      {/* Main Workspace - Client Component for Interactive Elements */}
      <WorkspaceClient 
        problem={{
          ...problem,
          initialSchema: problem.initialSchema || undefined,
          initialData: problem.initialData || undefined,
        }}
        examples={examplesForClient} // Pass only the example test cases
      />
    </main>
  );
}
