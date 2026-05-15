import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WorkspaceClient from "./WorkspaceClient";
import { auth } from "@/auth";
import { TestInputOutput } from "@/lib/codeExecution";

interface WorkspaceProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface Blueprint {
  id: string;
  type: string;
  data: unknown;
}

interface ProblemData {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  description: string;
  timeLimit: number;
  memoryLimit: number;
  testSets: string | { examples: TestInputOutput[], hidden: TestInputOutput[] } | TestInputOutput[];
  hints: string[];
  referenceSolution: string | null;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  creatorId: string | null;
  contests: {
    startTime: Date;
    creatorId: string;
  }[];
  type: "CODING" | "SHELL" | "INTERACTIVE" | "SYSTEM_DESIGN" | "SQL" | "READING";
  initialSchema: string | null;
  initialData: string | null;
  pattern: string | null;
  blueprint: Blueprint[] | null;
  resources: {
    id: string;
    title: string;
    url: string;
    type: string;
    creator: string | null;
  }[];
}

export default async function Workspace({ params, searchParams }: WorkspaceProps) {
  const { slug } = await params;
  const { studyPlanId } = await searchParams;
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
      pattern: true,
      blueprint: true,
      resources: {
        select: {
          id: true,
          title: true,
          url: true,
          type: true,
          creator: true,
        },
        where: {
          isPublic: true
        }
      }
    }
  }) as ProblemData;

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
    allTestCases = rawTestSets.map(tc => ({ ...tc, isExample: tc.isExample ?? true }));
  } else if (rawTestSets && typeof rawTestSets === 'object' && 'examples' in rawTestSets && 'hidden' in rawTestSets) {
    (rawTestSets.examples as TestInputOutput[]).forEach(tc => allTestCases.push({ ...tc, isExample: true }));
    (rawTestSets.hidden as TestInputOutput[]).forEach(tc => allTestCases.push({ ...tc, isExample: false }));
  } else {
    allTestCases = [];
  }

  // Filter for only example test cases to pass to WorkspaceClient
  const examplesForClient = allTestCases.filter(tc => tc.isExample !== false);

  // Check if user has already solved this problem to skip blueprint
  const userSubmission = userId ? await prisma.submission.findFirst({
    where: { userId, problemId: problem.id, status: "Accepted" },
    select: { id: true }
  }) : null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)] relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-grid-pattern opacity-[0.02]" />
      
      {/* Main Workspace - Client Component for Interactive Elements */}
      <WorkspaceClient 
        problem={{
          ...(problem as any),
          initialSchema: (problem as any).initialSchema || undefined,
          initialData: (problem as any).initialData || undefined,
          blueprint: (problem as any).blueprint || undefined, // Ensure blueprint is passed
        }}
        examples={examplesForClient} // Pass only the example test cases
        showBlueprint={!!studyPlanId}
        alreadySolved={!!userSubmission}
      />
    </div>
  );
}