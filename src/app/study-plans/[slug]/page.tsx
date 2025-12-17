import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckCircle, Circle, ChevronLeft, Lock } from "lucide-react";
import { auth } from "@/auth";

interface StudyPlanDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function StudyPlanDetailPage({ params }: StudyPlanDetailPageProps) {
  const { slug } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const plan = await prisma.studyPlan.findUnique({
    where: { slug },
    include: {
      problems: {
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
  });

  if (!plan) {
    notFound();
  }

  // Calculate progress
  const totalProblems = plan.problems.length;
  const solvedProblems = plan.problems.filter(p => p.submissions && p.submissions.length > 0).length;
  const progress = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Link 
        href="/study-plans"
        className="inline-flex items-center gap-2 text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Plans
      </Link>

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

              {!userId && (
                 <div className="p-3 bg-blue-500/10 text-blue-500 text-xs rounded-lg text-center">
                    Sign in to track your progress
                 </div>
              )}
           </div>
        </div>

        {/* Right Content: Problem List */}
        <div className="lg:col-span-2 space-y-4">
           {plan.problems.map((problem, idx) => {
              const isSolved = problem.submissions && problem.submissions.length > 0;
              return (
                <Link
                  key={problem.id}
                  href={`/problems/${problem.slug}`}
                  className="block group"
                >
                   <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 flex items-center gap-4 hover:border-[var(--accent-gradient-to)] transition-all duration-200 hover:shadow-md">
                      <div className="shrink-0 text-[var(--foreground)]/40 font-mono text-sm w-6 text-center">
                         {idx + 1}
                      </div>
                      <div className="shrink-0">
                         {isSolved ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                         ) : (
                            <Circle className="w-5 h-5 text-[var(--foreground)]/20 group-hover:text-[var(--foreground)]/40" />
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
           })}
        </div>
      </div>
    </main>
  );
}
