import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckCircle, Circle, ChevronLeft, Calendar } from "lucide-react";
import { auth } from "@/auth";
import AIWeaknessAnalysis from "@/components/AIWeaknessAnalysis";
import StudyPlanControls from "@/components/StudyPlanControls";

interface StudyPlanDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function StudyPlanDetailPage({ params }: StudyPlanDetailPageProps) {
  const { slug } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  const plan = await prisma.studyPlan.findUnique({
    where: { slug },
    include: {
      problems: {
        orderBy: { order: "asc" },
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              slug: true,
              difficulty: true,
              category: true,
              submissions: userId ? {
                 where: { userId, status: "Accepted" },
                 select: { id: true }
              } : false
            }
          }
        }
      }
    }
  });

  if (!plan) {
    notFound();
  }

  // Access control for private study plans
  if (!plan.isPublic && plan.creatorId !== userId && !isAdmin) {
    notFound();
  }

  // Calculate progress
  const totalProblems = plan.problems.length;
  const solvedProblems = plan.problems.filter(p => p.problem.submissions && p.problem.submissions.length > 0).length;
  const progress = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <Link 
          href="/study-plans"
          className="inline-flex items-center gap-2 text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Plans
        </Link>

        <StudyPlanControls 
          planId={plan.id}
          slug={plan.slug}
          status={plan.status}
          isCreator={plan.creatorId === userId}
          isAdmin={isAdmin}
        />
      </div>

      {userId && <AIWeaknessAnalysis studyPlanId={plan.id} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar: Plan Info */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 sticky top-24">
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">{plan.title}</h1>
              <p className="text-[var(--foreground)]/70 mb-6 text-sm leading-relaxed">
                {plan.description}
              </p>
              
              <div className="space-y-2 mb-6">
                 <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--foreground)]/60">Progress</span>
                    <span className="font-medium text-[var(--foreground)]">{progress}%</span>
                 </div>
                 <div className="h-2 w-full bg-[var(--foreground)]/10 rounded-full overflow-hidden">
                    <div 
                       className="h-full bg-blue-500 transition-all duration-500 ease-out"
                       style={{ width: `${progress}%` }}
                    />
                 </div>
                 <p className="text-xs text-[var(--foreground)]/50 text-center mt-1">
                    {solvedProblems} of {totalProblems} problems solved
                 </p>
              </div>
           </div>
        </div>

        {/* Right Content: Problem List */}
        <div className="lg:col-span-2 space-y-6">
           {/* Daily Schedule View */}
           <div className="space-y-8">
              {Array.from({ length: plan.durationDays || 1 }).map((_, dayIdx) => {
                 const dayProblems = plan.problems.filter(p => p.order === dayIdx + 1);
                 if (dayProblems.length === 0 && dayIdx > 0) return null; // Skip empty days except day 1
                 
                 return (
                    <div key={dayIdx} className="space-y-4">
                       <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
                          <Calendar className="w-5 h-5 text-blue-500" />
                          Day {dayIdx + 1}
                       </h2>
                       <div className="space-y-3">
                          {dayProblems.length === 0 ? (
                             <div className="p-8 text-center bg-[var(--card-bg)]/50 rounded-xl border border-dashed border-[var(--card-border)] text-[var(--foreground)]/40 text-sm">
                                No problems assigned for this day.
                             </div>
                          ) : (
                             dayProblems.map((spProblem) => {
                                const { problem } = spProblem;
                                const isSolved = problem.submissions && (problem.submissions as any).length > 0;
                                return (
                                  <Link
                                    key={problem.id}
                                    href={`/problems/${problem.slug}?studyPlanId=${plan.id}`}
                                    className="block group"
                                  >
                                     <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 flex items-center gap-4 hover:border-[var(--accent-gradient-to)] transition-all duration-200 hover:shadow-md">
                                        <div className="shrink-0">
                                           {isSolved ? (
                                              <CheckCircle className="w-6 h-6 text-green-500" />
                                           ) : (
                                              <Circle className="w-6 h-6 text-[var(--foreground)]/10 group-hover:text-[var(--foreground)]/20" />
                                           )}
                                        </div>
                                        <div className="flex-1">
                                           <h3 className="font-medium text-[var(--foreground)] group-hover:text-blue-500 transition-colors">
                                              {problem.title}
                                           </h3>
                                           <div className="flex items-center gap-2 mt-1">
                                              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                                                 problem.difficulty === "Easy" ? "text-green-500 bg-green-500/10 border-green-500/20" :
                                                 problem.difficulty === "Medium" ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" :
                                                 "text-red-500 bg-red-500/10 border-red-500/20"
                                              }`}>
                                                 {problem.difficulty}
                                              </span>
                                              <span className="text-xs text-[var(--foreground)]/50">
                                                 {problem.category}
                                              </span>
                                           </div>
                                        </div>
                                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <ChevronLeft className="w-5 h-5 rotate-180 text-[var(--foreground)]/40" />
                                        </div>
                                     </div>
                                  </Link>
                                );
                             })
                          )}
                       </div>
                    </div>
                 );
              })}
           </div>
        </div>
      </div>
    </main>
  );
}