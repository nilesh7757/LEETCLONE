import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, Trophy, ArrowRight, Layers } from "lucide-react";

export default async function StudyPlansPage() {
  const plans = await prisma.studyPlan.findMany({
    include: {
      _count: {
        select: { problems: true }
      }
    }
  });

  // If no plans exist, we might want to seed some or show empty state
  // For this prototype, I'll just show what's in DB.
  
  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">
          Interview Preparation
        </h1>
        <p className="text-lg text-[var(--foreground)]/60 max-w-2xl mx-auto">
          Curated study plans to help you ace your next coding interview. Master the patterns, data structures, and algorithms that matter.
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-20 bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)]">
          <Layers className="w-16 h-16 mx-auto text-[var(--foreground)]/20 mb-4" />
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">No Study Plans Yet</h2>
          <p className="text-[var(--foreground)]/60">Check back later for curated lists!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Link 
              key={plan.id} 
              href={`/study-plans/${plan.slug}`}
              className="group relative bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] overflow-hidden hover:border-[var(--accent-gradient-to)] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="aspect-video w-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-colors flex items-center justify-center">
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
                    Start <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
