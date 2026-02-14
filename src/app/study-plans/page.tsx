import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, Trophy, ArrowRight, Layers, Plus, Lock } from "lucide-react";
import { auth } from "@/auth";
import AIWeaknessAnalysis from "@/features/ai/components/AIWeaknessAnalysis";
import { Mic } from "lucide-react";

import Image from "next/image";

interface StudyPlan {
  id: string;
  slug: string;
  title: string;
  description: string;
  isPublic: boolean;
  isOfficial: boolean;
  coverImage?: string | null;
  _count: {
    problems: number;
  };
}

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
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative">
        <div className="text-left space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--viz-purple)]/10 rounded-xl text-[var(--viz-purple)] shadow-sm">
              <BookOpen size={24} />
            </div>
            <span className="text-[10px] font-black tracking-[0.3em] text-[var(--muted-foreground)] uppercase">Learning Pathways</span>
          </div>
          <h1 className="text-5xl font-light tracking-tight text-[var(--foreground)]">
            Study <span className="text-[var(--viz-purple)] font-medium">Dashboard</span>
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl font-light leading-relaxed">
            Accelerate your mastery through curated curriculum paths or design your own professional training manifolds.
          </p>
        </div>
        
        {userId && (
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/interview"
              className="flex items-center gap-2 px-6 py-3 bg-[var(--viz-red)] text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-[var(--viz-red)]/20"
            >
              <Mic className="w-4 h-4" />
              Mock Interview
            </Link>
            <Link
              href="/study-plans/new"
              className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-[var(--primary)]/20"
            >
              <Plus className="w-4 h-4" />
              Create Plan
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-20">
        {userId && <AIWeaknessAnalysis />}

        {/* My Plans Section */}
        {userId && (
          <section>
            <div className="flex items-center gap-4 mb-10">
                <div className="h-[1px] flex-1 bg-[var(--viz-purple)]/10" />
                <h2 className="text-[10px] font-black text-[var(--muted-foreground)]/40 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Layers size={14} className="text-[var(--viz-purple)]" />
                  Personal Manifolds
                </h2>
                <div className="h-[1px] flex-1 bg-[var(--viz-purple)]/10" />
            </div>
            
            {myPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myPlans.map(plan => (
                  <StudyPlanCard key={plan.id} plan={plan} userId={userId} />
                ))}
              </div>
            ) : (
              <div className="py-20 px-6 bg-[var(--card)] rounded-[3rem] text-center shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-grid-pattern" />
                <Layers className="w-16 h-16 mx-auto text-[var(--muted-foreground)]/20 mb-6 transition-transform group-hover:scale-110 duration-500" />
                <h3 className="text-xl font-bold text-[var(--foreground)]">Empty Training Buffer</h3>
                <p className="text-sm text-[var(--muted-foreground)]/60 mt-2 mb-8 max-w-sm mx-auto">Initialize a custom study manifold to target specific cognitive weaknesses.</p>
                <Link
                  href="/study-plans/new"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--viz-purple)]/10 text-[var(--viz-purple)] font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[var(--viz-purple)]/20 transition-all"
                >
                  Initialize First Plan <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Official Section */}
        {officialPlans.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-10">
                <div className="h-[1px] flex-1 bg-[var(--viz-gold)]/10" />
                <h2 className="text-[10px] font-black text-[var(--muted-foreground)]/40 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Trophy size={14} className="text-[var(--viz-gold)]" />
                  Curated Protocols
                </h2>
                <div className="h-[1px] flex-1 bg-[var(--viz-gold)]/10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {officialPlans.map(plan => (
                <StudyPlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </section>
        )}

        {plans.length === 0 && !userId && (
          <div className="text-center py-32 bg-[var(--card)] rounded-[3rem] shadow-xl">
            <Layers className="w-20 h-20 mx-auto text-[var(--muted-foreground)]/10 mb-6" />
            <h2 className="text-2xl font-light text-[var(--foreground)] mb-3 uppercase tracking-tighter">System Idle</h2>
            <p className="text-[var(--muted-foreground)]/60 font-mono text-sm uppercase tracking-widest">Awaiting user authentication to load training sets.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StudyPlanCard({ plan }: { plan: StudyPlan, userId?: string }) {
  const isPurple = !plan.isOfficial;
  const themeColor = isPurple ? "var(--viz-purple)" : "var(--viz-gold)";
  const themeRGB = isPurple ? "var(--viz-purple-rgb)" : "var(--viz-gold-rgb)";

  return (
    <Link 
      href={`/study-plans/${plan.slug}`}
      className="group relative bg-[var(--card)] rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full"
    >
      <div className="aspect-video w-full bg-[var(--muted)] flex items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-grid-pattern" />
         
         {!plan.isPublic && (
            <div className="absolute top-4 left-4 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[9px] font-black text-white flex items-center gap-1.5 uppercase tracking-widest z-10">
               <Lock className="w-3 h-3 text-[var(--viz-red)]" /> Private
            </div>
         )}
         {plan.isOfficial && (
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-[var(--viz-gold)] text-black rounded-xl text-[9px] font-black uppercase tracking-widest z-10 shadow-lg shadow-[var(--viz-gold)]/20">
               Official
            </div>
         )}
         
         {plan.coverImage ? (
            <Image 
                src={plan.coverImage} 
                alt={plan.title} 
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110" 
            />
         ) : (
            <Trophy className="w-16 h-16 transition-all duration-500 text-[var(--muted-foreground)]/20 group-hover:scale-110" style={{ color: `rgba(${themeRGB}, 0.2)` }} />
         )}

         {/* Gradient Overlay */}
         <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent opacity-60" />
      </div>

      <div className="p-8 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-3 group-hover:text-[var(--primary)] transition-colors line-clamp-1">
          {plan.title}
        </h3>
        <p className="text-sm text-[var(--muted-foreground)]/70 line-clamp-2 mb-6 font-light leading-relaxed">
          {plan.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-wider text-[var(--muted-foreground)]/40">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
            {plan._count.problems} Vectors
          </div>
          
          <div className="flex items-center gap-1 text-[var(--primary)] font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            Analyze <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}
