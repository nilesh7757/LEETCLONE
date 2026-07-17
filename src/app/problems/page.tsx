import { prisma } from "@/lib/prisma";
import ProblemTable from "@/features/problems/components/ProblemTable";
import ProblemFilters from "@/features/problems/components/ProblemFilters";
import MasteryCalendar from "@/features/problems/components/MasteryCalendar";
import ReviewQueueWidget from "@/features/problems/components/ReviewQueueWidget";
import { auth } from "@/auth"; 
import Link from "next/link";
import { Trophy } from "lucide-react";
import { Prisma } from "@prisma/client";

export const metadata = {
  title: "Problems | LogiQuest",
  description: "Browse curated algorithmic problems spanning arrays, graphs, DP, trees, and more.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ 
    tab?: string;
    page?: string;
    search?: string;
    difficulty?: string;
    category?: string;
    company?: string;
    starred?: string;
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

export default async function ProblemsPage({ searchParams }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  const stats = await getStats(userId);
  
  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab === "mine" 
    ? "mine" 
    : resolvedSearchParams.tab === "sql" 
      ? "sql" 
      : "public";
  const currentPage = parseInt(resolvedSearchParams.page || "1");
  const pageSize = 8; 
  const skip = (currentPage - 1) * pageSize;

  const whereClause: Prisma.ProblemWhereInput = {};
  if (currentTab === "mine" && userId) {
    whereClause.creatorId = userId;
  } else {
    whereClause.OR = [
      { isPublic: true },
      { contests: { some: { endTime: { lte: new Date() }, publishProblems: true } } }
    ];
    
    if (currentTab === "sql") {
      whereClause.type = "SQL";
    } else {
      whereClause.type = "CODING";
    }
  }

  if (resolvedSearchParams.search) {
    whereClause.title = { contains: resolvedSearchParams.search, mode: 'insensitive' as Prisma.QueryMode };
  }
  if (resolvedSearchParams.difficulty && resolvedSearchParams.difficulty !== "All") {
    whereClause.difficulty = resolvedSearchParams.difficulty;
  }
  if (resolvedSearchParams.category && resolvedSearchParams.category !== "All") {
    const cat = resolvedSearchParams.category;
    if (cat === "Arrays & Hashing") {
      whereClause.category = { in: ["Arrays & Hashing", "Array", "Arrays"] };
    } else if (cat === "Math & Geometry") {
      whereClause.category = { in: ["Math & Geometry", "Math", "Geometry"] };
    } else if (cat === "1-D DP" || cat === "2-D DP") {
      whereClause.category = { in: [cat, "Dynamic Programming", "DP"] };
    } else if (cat === "Trees") {
      whereClause.category = { in: ["Trees", "Tree"] };
    } else if (cat === "Graphs" || cat === "Advanced Graphs") {
      whereClause.category = { in: ["Graphs", "Graph", "Advanced Graphs"] };
    } else {
      whereClause.category = cat;
    }
  }
  if (resolvedSearchParams.company && resolvedSearchParams.company !== "All") {
    whereClause.companies = {
      has: resolvedSearchParams.company
    };
  }
  if (resolvedSearchParams.starred === "true" && userId) {
    whereClause.starredBy = {
      some: {
        userId
      }
    };
  }

  const [problems, totalCount] = await prisma.$transaction([
    prisma.problem.findMany({
      where: whereClause as Prisma.ProblemWhereInput,
      include: {
        submissions: {
          select: {
            status: true
          }
        },
        ...(userId ? {
          starredBy: {
            where: { userId },
            select: { id: true }
          }
        } : {})
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.problem.count({ where: whereClause as Prisma.ProblemWhereInput })
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

  const problemsWithStatus = problems.map(problem => {
    const total = problem.submissions.length;
    let rateStr = "";
    if (total > 0) {
      const accepted = problem.submissions.filter(s => s.status === "Accepted").length;
      rateStr = ((accepted / total) * 100).toFixed(1);
    } else {
      const titleSum = problem.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const diff = problem.difficulty;
      if (diff === "Easy") {
        rateStr = ((titleSum % 20) + 65.4).toFixed(1);
      } else if (diff === "Medium") {
        rateStr = ((titleSum % 15) + 43.1).toFixed(1);
      } else {
        rateStr = ((titleSum % 15) + 22.7).toFixed(1);
      }
    }

    return {
      id: problem.id,
      title: problem.title,
      slug: problem.slug,
      difficulty: problem.difficulty,
      category: problem.category,
      isSolved: solvedProblemIds.has(problem.id),
      isAttempted: attemptedProblemIds.has(problem.id) && !solvedProblemIds.has(problem.id),
      isStarred: userId ? ((problem as unknown as { starredBy?: { id: string }[] }).starredBy?.length ?? 0) > 0 : false,
      acceptanceRate: rateStr,
      companyTags: problem.companyTags || [],
    };
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[var(--primary)]/30 overflow-x-hidden">
      
      {/* 1. BACKGROUND ARCHITECTURE */}
      <div className="fixed inset-0 pointer-events-none z-0">
         {/* Perspective Grid Floor */}
         <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{ 
               backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, 
               backgroundSize: '100px 100px',
               perspective: '1200px',
               transform: 'rotateX(65deg) translateY(-10%)',
               transformOrigin: 'top'
            }} 
         />
         {/* Atmospheric Glows */}
         <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[var(--primary)]/5 rounded-full blur-[160px]" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[var(--viz-purple)]/5 rounded-full blur-[140px]" />
      </div>
      
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12 relative z-10"> 
      
        {/* 2. DASHBOARD HEADER & STATS (REFINED & COMPACTED) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[var(--border)]/40">
          <div className="flex items-center gap-3">
             <div className="p-1.5 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
                <Trophy size={14} />
             </div>
             <h1 className="text-lg font-black tracking-tight text-[var(--foreground)]">
               Problem Set
             </h1>
             <span className="text-[10px] font-mono bg-[var(--foreground)]/5 border border-[var(--border)] px-2 py-0.5 rounded-md text-[var(--muted-foreground)]">
               {stats.totalProblems} Challenges
             </span>
          </div>

          {userId && (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] font-black text-[var(--muted-foreground)]/50 uppercase tracking-widest">Progress</span>
                <div className="text-sm font-black font-mono text-[var(--foreground)]">
                  <span className="text-emerald-500">{stats.solvedCount}</span>
                  <span className="text-[var(--muted-foreground)]/40 mx-1">/</span>
                  <span>{stats.totalProblems}</span>
                  <span className="text-[10px] text-[var(--muted-foreground)]/60 font-medium ml-1.5">
                    ({Math.round((stats.solvedCount / Math.max(1, stats.totalProblems)) * 100)}%)
                  </span>
                </div>
              </div>
              <div className="w-32 h-1.5 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${(stats.solvedCount / Math.max(1, stats.totalProblems)) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 4. MAIN CONTENT GRID (Equal Heights via items-stretch) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">  

          {/* SIDEBAR (col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full">
            {userId && <ReviewQueueWidget />}

            <div className="flex-grow flex flex-col gap-3">
               <div className="flex items-center gap-2 px-1 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Mastery Planner</span>
               </div>
               <div className="flex-1">
                 <MasteryCalendar />
               </div>
            </div>
          </div>

          {/* MAIN PROBLEMS TABLE (col-span-8) */}
          <div className="lg:col-span-8 flex flex-col h-full">             
             <div className="bg-[var(--card)] border border-[var(--border)] rounded-[2.5rem] p-6 lg:p-8 shadow-2xl relative flex flex-col gap-6 h-full justify-between w-full">
                <div className="flex bg-[var(--foreground)]/5 border border-[var(--border)] rounded-2xl p-1 gap-1 shrink-0 max-w-md">
                  {[
                    { id: "public", label: "Coding Set" },
                    { id: "sql", label: "Database (SQL)" },
                    { id: "mine", label: "My Foundry" }
                  ].map(t => {
                    const isActive = currentTab === t.id;
                    const href = `?tab=${t.id}`;
                    return (
                      <Link
                        key={t.id}
                        href={href}
                        className={`flex-1 text-center py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          isActive 
                            ? "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] shadow-md"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        {t.label}
                      </Link>
                    );
                  })}
                </div>
                <ProblemFilters />
                <div className="flex-grow">
                  <ProblemTable 
                     problems={problemsWithStatus} 
                     totalPages={totalPages} 
                     currentPage={currentPage} 
                  />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
