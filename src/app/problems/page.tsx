import { prisma } from "@/lib/prisma";
import ProblemTable from "@/components/ProblemTable";
import ProblemFilters from "@/components/ProblemFilters";
import { auth } from "@/auth"; 
import Link from "next/link"; 

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ 
    tab?: string;
    page?: string;
    search?: string;
    difficulty?: string;
    category?: string;
  }>;
}

export default async function ProblemsPage({ searchParams }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  
  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab === "mine" ? "mine" : "public";
  const currentPage = parseInt(resolvedSearchParams.page || "1");
  const pageSize = 20;
  const skip = (currentPage - 1) * pageSize;

  // Build Filter Query
  const whereClause: any = {};

  // Tab Logic
  if (currentTab === "mine" && userId) {
    whereClause.creatorId = userId;
  } else {
    // Default Public Tab Logic
    whereClause.OR = [
      { isPublic: true },
      { contests: { some: { endTime: { lte: new Date() }, publishProblems: true } } }
    ];
  }

  // Search & Filters
  if (resolvedSearchParams.search) {
    whereClause.title = { contains: resolvedSearchParams.search, mode: 'insensitive' };
  }
  if (resolvedSearchParams.difficulty) {
    whereClause.difficulty = resolvedSearchParams.difficulty;
  }
  if (resolvedSearchParams.category) {
    whereClause.category = resolvedSearchParams.category;
  }

  // Fetch Data
  const [problems, totalCount] = await prisma.$transaction([
    prisma.problem.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.problem.count({ where: whereClause })
  ]);

  // Determine Solved Status
  let solvedProblemIds: Set<string> = new Set();
  let attemptedProblemIds: Set<string> = new Set();

  if (userId) {
    const allSubmissions = await prisma.submission.findMany({
      where: {
        userId: userId,
        problemId: { in: problems.map(p => p.id) } // Optimization: only fetch for current page problems? 
        // No, to be accurate about "Attempted" globally we might need more, but checking against *these* 20 is efficient.
        // Actually, if I solved it 2 years ago, I want it marked solved even if I didn't submit *recently*.
        // The previous code fetched ALL submissions. For 2000 problems and 10k submissions, that's heavy.
        // Better: Fetch submissions ONLY for the problems displayed on this page.
      },
      select: {
        problemId: true,
        status: true,
      },
    });

    allSubmissions.forEach(sub => {
      attemptedProblemIds.add(sub.problemId);
      if (sub.status === "Accepted") {
        solvedProblemIds.add(sub.problemId);
      }
    });
  }

  const problemsWithStatus = problems.map(problem => ({
    ...problem,
    isSolved: solvedProblemIds.has(problem.id),
    isAttempted: attemptedProblemIds.has(problem.id) && !solvedProblemIds.has(problem.id),
  }));

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Background Gradients */}
      <div className="fixed inset-0 bg-[var(--background)] -z-20 transition-colors duration-300" />
      <div className="fixed inset-0 bg-grid-pattern opacity-10 -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
            Problems
          </h1>
          <p className="text-[var(--foreground)]/60 max-w-2xl">
            Browse our collection of coding challenges. Filter by difficulty, category, 
            or search for specific topics to practice.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 mb-8 border-b border-[var(--card-border)]">
          <Link
            href="/problems?tab=public"
            className={`pb-3 text-sm font-medium transition-colors relative ${
              currentTab === "public"
                ? "text-[var(--foreground)]"
                : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
            }`}
          >
            Public Problems
            {currentTab === "public" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-gradient-to)] rounded-t-full" />
            )}
          </Link>
          
          {userId && (
            <Link
              href="/problems?tab=mine"
              className={`pb-3 text-sm font-medium transition-colors relative ${
                currentTab === "mine"
                  ? "text-[var(--foreground)]"
                  : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
              }`}
            >
              My Problems
              {currentTab === "mine" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-gradient-to)] rounded-t-full" />
              )}
            </Link>
          )}
        </div>

        <ProblemFilters />

        <ProblemTable 
          problems={problemsWithStatus} 
          totalPages={totalPages} 
          currentPage={currentPage} 
        />
      </div>
    </main>
  );
}