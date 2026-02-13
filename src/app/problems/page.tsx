import { prisma } from "@/lib/prisma";
import ProblemTable from "@/features/problems/components/ProblemTable";
import ProblemFilters from "@/features/problems/components/ProblemFilters";
import DailyProblemCard from "@/features/problems/components/DailyProblemCard";
import { auth } from "@/auth"; 
import { Trophy, Target, Sparkles } from "lucide-react";

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

async function getStats(userId?: string) {
  const totalProblems = await prisma.problem.count();
  
  let solvedCount = 0;
  let attemptCount = 0;

  if (userId) {
    const submissions = await prisma.submission.findMany({
      where: { userId },
      select: { status: true, problemId: true }
    });
    
    const uniqueSolved = new Set(submissions.filter(s => s.status === "Accepted").map(s => s.problemId));
    solvedCount = uniqueSolved.size;
    attemptCount = new Set(submissions.map(s => s.problemId)).size;
  }

  return { totalProblems, solvedCount, attemptCount };
}

interface WhereClause {
  creatorId?: string;
  OR?: any[];
  title?: { contains: string; mode: 'insensitive' };
  difficulty?: string;
  category?: string;
}

export default async function ProblemsPage({ searchParams }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  const stats = await getStats(userId);
  
  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab === "mine" ? "mine" : "public";
  const currentPage = parseInt(resolvedSearchParams.page || "1");
  const pageSize = 12; 
  const skip = (currentPage - 1) * pageSize;

  const whereClause: WhereClause = {};
  if (currentTab === "mine" && userId) {
    whereClause.creatorId = userId;
  } else {
    whereClause.OR = [
      { isPublic: true },
      { contests: { some: { endTime: { lte: new Date() }, publishProblems: true } } }
    ];
  }

  if (resolvedSearchParams.search) {
    whereClause.title = { contains: resolvedSearchParams.search, mode: 'insensitive' };
  }
  if (resolvedSearchParams.difficulty && resolvedSearchParams.difficulty !== "All") {
    whereClause.difficulty = resolvedSearchParams.difficulty;
  }
  if (resolvedSearchParams.category && resolvedSearchParams.category !== "All") {
    whereClause.category = resolvedSearchParams.category;
  }

  const [problems, totalCount] = await prisma.$transaction([
    prisma.problem.findMany({
      where: whereClause as any,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.problem.count({ where: whereClause as any })
  ]);

  const solvedProblemIds: Set<string> = new Set();
  const attemptedProblemIds: Set<string> = new Set();

  if (userId) {
    const allSubmissions = await prisma.submission.findMany({
      where: {
        userId: userId,
        problemId: { in: problems.map(p => p.id) }
      },
      select: { problemId: true, status: true },
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
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[var(--viz-cyan)]/30">
      
      {/* Cinematic Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--viz-purple)]/5 blur-[150px] rounded-full mix-blend-screen" />
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-[var(--viz-cyan)]/5 blur-[150px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-[var(--viz-blue)]/5 blur-[150px] rounded-full mix-blend-screen" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[var(--viz-cyan)]/10 rounded-xl text-[var(--viz-cyan)] shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                <Sparkles size={20} />
              </div>
              <span className="text-[10px] font-black tracking-[0.3em] text-[var(--muted-foreground)] uppercase">
                Engineering Challenges
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-light tracking-tight text-[var(--foreground)]">
              Problem <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--viz-cyan)] to-[var(--viz-blue)] font-medium">Matrix</span>
            </h1>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl font-light leading-relaxed">
              Explore a vast collection of algorithmic challenges designed to refine your cognitive stack.
            </p>
          </div>

          {/* Stats Pills */}
          <div className="flex gap-4">
             <div className="group relative overflow-hidden bg-[var(--card)]/50 backdrop-blur-md rounded-2xl px-6 py-4 flex items-center gap-4 transition-all hover:bg-[var(--card)] hover:shadow-2xl hover:shadow-[var(--viz-cyan)]/10">
                <div className="p-3 bg-[var(--viz-cyan)]/10 rounded-xl text-[var(--viz-cyan)] group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--foreground)]">{stats.totalProblems}</div>
                  <div className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Available</div>
                </div>
             </div>
             
             {userId && (
                <div className="group relative overflow-hidden bg-[var(--card)]/50 backdrop-blur-md rounded-2xl px-6 py-4 flex items-center gap-4 transition-all hover:bg-[var(--card)] hover:shadow-2xl hover:shadow-[var(--viz-green)]/10">
                    <div className="p-3 bg-[var(--viz-green)]/10 rounded-xl text-[var(--viz-green)] group-hover:scale-110 transition-transform">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[var(--foreground)]">{stats.solvedCount}</div>
                      <div className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Solved</div>
                    </div>
                </div>
             )}
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Sidebar Filters (Left) */}
          <div className="lg:col-span-3 space-y-8">
            <DailyProblemCard />
            <div className="sticky top-8">
              <ProblemFilters />
            </div>
          </div>

          {/* Main Content (Right) */}
          <div className="lg:col-span-9 space-y-8">
             <ProblemTable 
                problems={problemsWithStatus} 
                totalPages={totalPages} 
                currentPage={currentPage} 
             />
          </div>
        </div>
      </div>
    </div>
  );
}