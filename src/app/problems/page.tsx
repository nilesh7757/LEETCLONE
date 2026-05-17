import { prisma } from "@/lib/prisma";
import ProblemTable from "@/features/problems/components/ProblemTable";
import ProblemFilters from "@/features/problems/components/ProblemFilters";
import DailyProblemCard from "@/features/problems/components/DailyProblemCard";
import { auth } from "@/auth"; 
import { Trophy, Target, Sparkles } from "lucide-react";
import { Prisma, ProblemType } from "@prisma/client";
import * as motion from "framer-motion/client";

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
  OR?: Prisma.ProblemWhereInput[];
  title?: { contains: string; mode: Prisma.QueryMode };
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
      where: whereClause as Prisma.ProblemWhereInput,
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

  const problemsWithStatus = problems.map(problem => ({
    ...problem,
    isSolved: solvedProblemIds.has(problem.id),
    isAttempted: attemptedProblemIds.has(problem.id) && !solvedProblemIds.has(problem.id),
  }));

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen w-full bg-[#020202] text-[#e1e1e1] font-sans selection:bg-[#3b82f6]/30 overflow-x-hidden">
      
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
         <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#3b82f6]/5 rounded-full blur-[160px]" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#a855f7]/5 rounded-full blur-[140px]" />
      </div>
      
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12 relative z-10"> 
      
        {/* 2. DASHBOARD HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-[#3b82f6]/10 rounded-lg text-[#3b82f6]">
                  <Sparkles size={20} />
               </div>
               <span className="text-[10px] font-bold tracking-widest text-[#52525b] uppercase">Algorithm Repository</span>
            </div>

            <div className="space-y-2">
               <h1 className="text-5xl font-bold tracking-tight text-white">
                 Problem <span className="text-[#3b82f6]">Set</span>
               </h1>
               <p className="text-lg text-[#a1a1aa] max-w-2xl font-normal leading-relaxed">
                 Explore a collection of curated coding challenges. Practice, learn, and master algorithmic patterns.
               </p>
            </div>
          </div>

          {/* 3. STATS */}
          <div className="flex gap-4">
             <div className="p-6 bg-[#111] border border-white/5 rounded-3xl flex flex-col gap-2 min-w-[180px] shadow-2xl relative overflow-hidden group hover:border-[#3b82f6]/30 transition-all duration-300">
                <div className="flex justify-between items-center relative z-10">
                   <span className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest">Total Problems</span>
                   <Target className="w-3.5 h-3.5 text-[#3b82f6] opacity-40 group-hover:opacity-100 transition-all" />
                </div>
                <div className="text-4xl font-bold text-white tabular-nums group-hover:text-[#3b82f6] transition-colors">{stats.totalProblems}</div>
             </div>

             {userId && (
                <div className="p-6 bg-[#111] border border-white/5 rounded-3xl flex flex-col gap-2 min-w-[180px] shadow-2xl relative overflow-hidden group hover:border-[#22c55e]/30 transition-all duration-300">
                   <div className="flex justify-between items-center relative z-10">
                      <span className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest">Solved</span>
                      <Trophy className="w-3.5 h-3.5 text-[#22c55e] opacity-40 group-hover:opacity-100 transition-all" />
                   </div>
                   <div className="text-4xl font-bold text-[#22c55e] tabular-nums">{stats.solvedCount}</div>
                </div>
             )}
          </div>
        </div>

        {/* 4. MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">  

          {/* SIDEBAR */}
          <div className="lg:col-span-3 space-y-10">
            <div className="space-y-3">
               <div className="flex items-center gap-2 px-1">
                  <div className="w-1 h-1 rounded-full bg-[#3b82f6]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#52525b]">Daily Challenge</span>
               </div>
               <DailyProblemCard />
            </div>

            <div className="lg:sticky lg:top-12 space-y-3">
               <div className="flex items-center gap-2 px-1">
                  <div className="w-1 h-1 rounded-full bg-[#a855f7]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#52525b]">Filters</span>
               </div>
               <ProblemFilters />
            </div>
          </div>

          {/* MAIN TABLE */}
          <div className="lg:col-span-9">             
             <div className="bg-[#111] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
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
  );
}
