import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckCircle, Circle, ChevronLeft, Calendar, Info, ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import AIWeaknessAnalysis from "@/features/ai/components/AIWeaknessAnalysis";
import StudyPlanControls from "@/features/study-plans/components/StudyPlanControls";
import { motion } from "framer-motion";

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
    <main className="min-h-screen pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-2">
          <Link 
            href="/study-plans"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]/40 hover:text-[var(--primary)] transition-all group"
          >
            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Manifolds
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-light tracking-tight text-[var(--foreground)]">{plan.title}</h1>
            {plan.isOfficial && (
              <span className="px-2 py-0.5 bg-[var(--viz-gold)]/10 text-[var(--viz-gold)] text-[9px] font-black uppercase tracking-widest rounded border border-[var(--viz-gold)]/20 shadow-sm">Official</span>
            )}
          </div>
        </div>

        <StudyPlanControls 
          planId={plan.id}
          slug={plan.slug}
          status={plan.status}
          isCreator={plan.creatorId === userId}
          isAdmin={isAdmin}
        />
      </div>

      {userId && <AIWeaknessAnalysis studyPlanId={plan.id} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
        {/* Left Sidebar: Plan Info */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-[var(--card)] rounded-[2.5rem] p-8 sticky top-24 shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent" />
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-grid-pattern" />
              
              <h3 className="text-[10px] font-black text-[var(--muted-foreground)]/40 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <Info size={14} className="text-[var(--primary)]" />
                Manifold Metadata
              </h3>
              
              <p className="text-[var(--muted-foreground)] mb-10 text-sm leading-relaxed font-light">
                {plan.description}
              </p>
              
              <div className="space-y-6">
                 <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Convergence</span>
                      <div className="text-3xl font-black text-[var(--foreground)] font-mono">{progress}%</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Resolved</span>
                      <div className="text-sm font-bold text-[var(--viz-green)] font-mono">{solvedProblems}/{totalProblems}</div>
                    </div>
                 </div>
                 
                 <div className="h-1.5 w-full bg-[var(--muted)] rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${progress}%` }}
                       className="h-full bg-gradient-to-r from-[var(--viz-blue)] to-[var(--viz-purple)] shadow-[0_0_15px_rgba(var(--viz-blue-rgb),0.3)]"
                       transition={{ duration: 1, ease: "easeOut" }}
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Right Content: Problem List */}
        <div className="lg:col-span-8 space-y-10">
           {/* Daily Schedule View */}
           <div className="space-y-12">
              {Array.from({ length: plan.durationDays || 1 }).map((_, dayIdx) => {
                 const dayProblems = plan.problems.filter(p => p.order === dayIdx + 1);
                 if (dayProblems.length === 0 && dayIdx > 0) return null; // Skip empty days except day 1
                 
                 return (
                    <div key={dayIdx} className="space-y-6">
                       <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--muted)] shadow-inner">
                            <span className="text-xs font-black text-[var(--primary)] font-mono">{dayIdx + 1}</span>
                          </div>
                          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
                            Temporal Unit {dayIdx + 1}
                          </h2>
                          <div className="h-px flex-1 bg-[var(--primary)]/10" />
                       </div>

                       <div className="grid gap-4">
                          {dayProblems.length === 0 ? (
                             <div className="p-12 text-center bg-[var(--card)] rounded-[2rem] shadow-sm border border-dashed border-[var(--border)]">
                                <p className="text-[var(--muted-foreground)]/30 text-xs font-mono uppercase tracking-widest text-center">No vectors assigned to this temporal unit.</p>
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
                                     <div className={`bg-[var(--card)] rounded-2xl p-5 flex items-center gap-6 transition-all duration-300 hover:shadow-xl hover:-translate-x-1 relative overflow-hidden ${isSolved ? "bg-[var(--viz-green)]/[0.02]" : ""}`}>
                                        <div className="absolute left-0 top-0 h-full w-1 transition-all duration-300 group-hover:w-1.5" style={{ backgroundColor: isSolved ? "var(--viz-green)" : "var(--border)" }} />
                                        
                                        <div className="shrink-0">
                                           {isSolved ? (
                                              <div className="p-2 bg-[var(--viz-green)]/10 rounded-lg text-[var(--viz-green)] shadow-sm">
                                                <CheckCircle className="w-5 h-5" />
                                              </div>
                                           ) : (
                                              <div className="p-2 bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)]/20 group-hover:text-[var(--muted-foreground)]/40 transition-colors shadow-inner">
                                                <Circle className="w-5 h-5" />
                                              </div>
                                           )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                           <h3 className="font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
                                              {problem.title}
                                           </h3>
                                           <div className="flex items-center gap-3 mt-1.5">
                                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                                 problem.difficulty === "Easy" ? "text-[var(--viz-green)] bg-[var(--viz-green)]/10" :
                                                 problem.difficulty === "Medium" ? "text-[var(--viz-gold)] bg-[var(--viz-gold)]/10" :
                                                 "text-[var(--viz-red)] bg-[var(--viz-red)]/10"
                                              }`}>
                                                 {problem.difficulty}
                                              </span>
                                              <span className="text-[10px] font-mono text-[var(--muted-foreground)]/40 uppercase">
                                                 {problem.category}
                                              </span>
                                           </div>
                                        </div>
                                        
                                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                           <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
                                              <ChevronRight className="w-4 h-4" />
                                           </div>
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