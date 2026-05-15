import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, Trophy, ArrowRight, Layers, Plus, Lock, Mic, Zap, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import AIWeaknessAnalysis from "@/features/ai/components/AIWeaknessAnalysis";
import GeneratePlanButton from "@/features/study-plans/components/GeneratePlanButton";
import Image from "next/image";

interface StudyPlan {
  id: string;
  slug: string;
  title: string;
  description: string;
  isPublic: boolean;
  isOfficial: boolean;
  coverImage?: string | null;
  creatorId: string;
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
    <div className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-16">
      {/* PROFESSIONAL HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative">
        <div className="text-left space-y-6 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#3b82f6]/10 rounded-xl text-[#3b82f6] border border-[#3b82f6]/20">
              <BookOpen size={20} />
            </div>
            <span className="text-[10px] font-black tracking-[0.3em] text-[#52525b] uppercase font-mono">Curriculum Manifolds</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-white leading-tight">
            Study <span className="text-[#3b82f6]">Dashboard</span>
          </h1>
          <p className="text-base text-[#71717a] leading-relaxed font-medium">
            Accelerate your mastery through curated high-performance paths or architect your own specialized training protocols to target algorithmic bottlenecks.
          </p>
        </div>
        
        {userId && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="p-1 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-1">
                <GeneratePlanButton />
            </div>
            
            <Link
              href="/interview"
              className="flex items-center gap-2.5 px-6 py-3.5 bg-[#0a0a0a] border border-white/5 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-white/5 active:scale-95 shadow-xl"
            >
              <Mic className="w-4 h-4 text-rose-500" />
              Mock Session
            </Link>

            <Link
              href="/study-plans/new"
              className="flex items-center gap-2.5 px-8 py-3.5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-[#3b82f6] hover:text-white active:scale-95 shadow-2xl shadow-white/5"
            >
              <Plus className="w-4 h-4" />
              Create Plan
            </Link>
          </div>
        )}

        {/* BACKGROUND DECORATION */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#3b82f6]/5 blur-[100px] rounded-full pointer-events-none" />
      </div>

      <div className="space-y-24">
        {userId && (
            <div className="relative">
                <AIWeaknessAnalysis />
                {/* Visual Connector */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-white/5 to-transparent" />
            </div>
        )}

        {/* My Plans Section */}
        {userId && (
          <section>
            <div className="flex items-center gap-4 mb-12">
                <div className="h-[1px] flex-1 bg-white/5" />
                <h2 className="text-[10px] font-black text-[#52525b] uppercase tracking-[0.4em] flex items-center gap-3">
                  <Layers size={14} className="text-[#3b82f6]" />
                  Personal Registry
                </h2>
                <div className="h-[1px] flex-1 bg-white/5" />
            </div>
            
            {myPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myPlans.map(plan => (
                  <StudyPlanCard key={plan.id} plan={plan as any} userId={userId} />
                ))}
              </div>
            ) : (
              <div className="py-24 px-8 bg-[#0a0a0a] rounded-[3rem] border border-white/5 text-center relative overflow-hidden group">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-grid-pattern" />
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5">
                    <Layers className="w-8 h-8 text-[#262626] transition-transform group-hover:scale-110 duration-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Empty Protocol Buffer</h3>
                <p className="text-sm text-[#52525b] mb-10 max-w-sm mx-auto font-medium">Initialize a custom study manifold to target specific cognitive weaknesses identified by the system.</p>
                <Link
                  href="/study-plans/new"
                  className="inline-flex items-center gap-3 px-10 py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-[#3b82f6] hover:text-white transition-all shadow-xl active:scale-95"
                >
                  New Deployment <Plus className="w-4 h-4" />
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Official Section */}
        {officialPlans.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-12">
                <div className="h-[1px] flex-1 bg-white/5" />
                <h2 className="text-[10px] font-black text-[#52525b] uppercase tracking-[0.4em] flex items-center gap-3">
                  <Trophy size={14} className="text-amber-500" />
                  Official Protocols
                </h2>
                <div className="h-[1px] flex-1 bg-white/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {officialPlans.map(plan => (
                <StudyPlanCard key={plan.id} plan={plan as any} />
              ))}
            </div>
          </section>
        )}

        {plans.length === 0 && !userId && (
          <div className="text-center py-40 bg-[#0a0a0a] rounded-[3rem] border border-white/5 shadow-2xl">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5">
                <Zap className="w-10 h-10 text-[#262626]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 uppercase tracking-tighter">System Standby</h2>
            <p className="text-[#52525b] font-mono text-[10px] uppercase tracking-[0.3em]">Authentication required to synchronize training sets.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StudyPlanCard({ plan }: { plan: StudyPlan, userId?: string }) {
  const isPurple = !plan.isOfficial;
  const themeColor = isPurple ? "#3b82f6" : "#f59e0b";

  return (
    <Link 
      href={`/study-plans/${plan.slug}`}
      className="group relative bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 overflow-hidden transition-all duration-700 hover:shadow-[0_20px_80px_-15px_rgba(0,0,0,1)] hover:-translate-y-2 flex flex-col h-[420px]"
    >
      <div className="aspect-video w-full bg-[#050505] flex items-center justify-center relative overflow-hidden border-b border-white/5">
         <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-grid-pattern" />
         
         {!plan.isPublic && (
            <div className="absolute top-6 left-6 px-2.5 py-1.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-[8px] font-black text-white flex items-center gap-1.5 uppercase tracking-widest z-20">
               <Lock className="w-3 h-3 text-rose-500" /> Encrypted
            </div>
         )}
         {plan.isOfficial && (
            <div className="absolute top-6 right-6 px-4 py-1.5 bg-amber-500 text-black rounded-xl text-[9px] font-black uppercase tracking-widest z-20 shadow-lg shadow-amber-500/20">
               CORE
            </div>
         )}
         
         {plan.coverImage ? (
            <Image 
                src={plan.coverImage} 
                alt={plan.title} 
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110" 
            />
         ) : (
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                <Trophy className="w-8 h-8 transition-all duration-700 text-[#1a1a1a] group-hover:text-white" style={{ color: isPurple ? undefined : '#f59e0b' }} />
            </div>
         )}

         {/* Gradient Overlay */}
         <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
         
         {/* AI Indicator for Personal Plans */}
         {isPurple && (
             <div className="absolute bottom-6 right-6 w-10 h-10 bg-white/5 rounded-full border border-white/5 flex items-center justify-center backdrop-blur-sm">
                 <Sparkles size={16} className="text-[#3b82f6]/40" />
             </div>
         )}
      </div>

      <div className="p-8 flex flex-col flex-1 relative">
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#3b82f6] transition-colors line-clamp-1">
          {plan.title}
        </h3>
        <p className="text-[13px] text-[#52525b] line-clamp-2 mb-8 font-medium leading-relaxed group-hover:text-[#71717a] transition-colors">
          {plan.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-[#262626] group-hover:text-[#3f3f46] transition-colors">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }} />
            {plan._count.problems} Challenges
          </div>
          
          <div className="flex items-center gap-2 text-[#3b82f6] font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
            Commence <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* CARD DECORATION */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#3b82f6]/[0.02] rounded-full blur-[40px] pointer-events-none group-hover:bg-[#3b82f6]/[0.05] transition-colors duration-700" />
    </Link>
  );
}
