import Split from "react-split";
import { Editor } from "@monaco-editor/react";
import { Play, Send, ChevronLeft, Settings, RotateCcw } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WorkspaceClient from "./WorkspaceClient";
import { auth } from "@/auth";

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
  referenceSolution: string | null;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  creatorId: string | null;
  contests: {
    startTime: Date;
    creatorId: string;
  }[];
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

  let allTestSets: { examples: any[], hidden: any[] } = { examples: [], hidden: [] };
  console.log("Value of problem.testSets before parsing:", problem.testSets);
  const rawTestSets = problem.testSets;

  if (typeof rawTestSets === 'string' && rawTestSets.trim() !== '') {
    try {
      const parsed = JSON.parse(rawTestSets);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) { // Ensure it's an object, not an array or null
        allTestSets = {
          examples: Array.isArray(parsed.examples) ? parsed.examples : [],
          hidden: Array.isArray(parsed.hidden) ? parsed.hidden : [],
        };
      } else {
        console.error("Parsed problem.testSets is not an object or is null:", parsed, rawTestSets);
      }
    } catch (e) {
      console.error("Error parsing problem.testSets:", e, rawTestSets);
    }
  } else {
    // If rawTestSets is not a string, or is an empty string, it defaults to { examples: [], hidden: [] }
    console.log("problem.testSets is not a non-empty string, defaulting.", rawTestSets);
  }
  const examples = allTestSets.examples || [];

  return (
    <main className="h-screen flex flex-col pt-16 overflow-hidden bg-[var(--background)]">
      {/* Main Workspace - Client Component for Interactive Elements */}
      <WorkspaceClient problem={problem} examples={examples} />
    </main>
  );
}
