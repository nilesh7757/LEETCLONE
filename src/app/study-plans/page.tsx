import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, Trophy, ArrowRight, Layers, Plus, Lock, Globe } from "lucide-react";
import { auth } from "@/auth";
import AIWeaknessAnalysis from "@/components/AIWeaknessAnalysis";
import { Mic } from "lucide-react";

export default async function StudyPlansPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const plans = await prisma.studyPlan.findMany({
    where: {
      OR: [
        { isPublic: true },
        { creatorId: userId || "" }
      ]
    },
    include: {
      _count: {
        select: { problems: true }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const officialPlans = plans.filter(p => p.isOfficial);
  const myPlans = plans.filter(p => p.creatorId === userId);

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="text-left">
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">
            Study Dashboard
          </h1>
          <p className="text-lg text-[var(--foreground)]/60 max-w-2xl">
            Track your progress through official paths or your own custom personal study plans.
          </p>
        </div>
        
        {userId && (
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/interview"
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20 whitespace-nowrap"
            >
              <Mic className="w-5 h-5" />
              Start Mock Interview
            </Link>
            <Link
              href="/study-plans/new"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Create Personal Plan
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-16">
        {userId && <AIWeaknessAnalysis />}

        {/* My Plans Section - Priority for logged in users */}
        {userId && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">My Study Plans</h2>
            </div>
            
            {myPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myPlans.map(plan => (
                  <StudyPlanCard key={plan.id} plan={plan} userId={userId} />
                ))}
              </div>
            ) : (
              <div className="py-12 px-6 bg-[var(--card-bg)] rounded-2xl border border-dashed border-[var(--card-border)] text-center">
                <Layers className="w-12 h-12 mx-auto text-[var(--foreground)]/20 mb-4" />
                <h3 className="text-lg font-bold text-[var(--foreground)]">No Personal Plans Yet</h3>
                <p className="text-sm text-[var(--foreground)]/50 mt-1 mb-6">Create a custom plan to track specific problems for your interview prep.</p>
                <Link
                  href="/study-plans/new"
                  className="inline-flex items-center gap-2 text-blue-500 font-medium hover:underline"
                >
                  Create your first plan <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Official Section */}
        {officialPlans.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Trophy className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Official Curated Paths</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {officialPlans.map(plan => (
                <StudyPlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </section>
        )}

        {plans.length === 0 && !userId && (
          <div className="text-center py-20 bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)]">
            <Layers className="w-16 h-16 mx-auto text-[var(--foreground)]/20 mb-4" />
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">No Study Plans Found</h2>
            <p className="text-[var(--foreground)]/60">Please sign in to create your own study plans.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function StudyPlanCard({ plan, userId }: { plan: any, userId?: string }) {
  return (
    <Link 
      href={`/study-plans/${plan.slug}`}
      className="group relative bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] overflow-hidden hover:border-[var(--accent-gradient-to)] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="aspect-video w-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-colors flex items-center justify-center relative">
         {!plan.isPublic && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-md text-[10px] font-bold text-white flex items-center gap-1 uppercase tracking-wider z-10">
               <Lock className="w-3 h-3" /> Private
            </div>
         )}
         {plan.isOfficial && (
            <div className="absolute top-3 right-3 px-2 py-1 bg-blue-500 rounded-md text-[10px] font-bold text-white flex items-center gap-1 uppercase tracking-wider z-10 shadow-lg">
               Official
            </div>
         )}
         {plan.status !== "PUBLISHED" && plan.status !== "DRAFT" && (
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-yellow-500 rounded-md text-[10px] font-bold text-white flex items-center gap-1 uppercase tracking-wider z-10 shadow-lg">
               Review Pending
            </div>
         )}
         {plan.status === "DRAFT" && plan.creatorId === userId && (
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-[var(--foreground)]/20 backdrop-blur-sm rounded-md text-[10px] font-bold text-white flex items-center gap-1 uppercase tracking-wider z-10">
               Draft
            </div>
         )}
         {plan.coverImage ? (
            <img src={plan.coverImage} alt={plan.title} className="w-full h-full object-cover" />
         ) : (
            <Trophy className="w-16 h-16 text-[var(--foreground)]/20 group-hover:text-[var(--accent-gradient-to)] transition-colors" />
         )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2 group-hover:text-blue-500 transition-colors">
          {plan.title}
        </h3>
        <p className="text-sm text-[var(--foreground)]/60 line-clamp-2 mb-4">
          {plan.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-[var(--foreground)]/60">
            <Layers className="w-4 h-4" />
            {plan._count.problems} Problems
          </span>
          <span className="flex items-center gap-1 text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
            View <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
