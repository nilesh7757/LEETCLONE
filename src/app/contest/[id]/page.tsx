import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import ContestClient from "./ContestClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArenaParticipationPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  const contest = await prisma.contest.findUnique({
    where: { id },
    include: {
      problems: {
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
          category: true,
        },
      },
      registrations: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!contest) {
    return notFound();
  }

  const isRegistered = contest.registrations.some(
    (reg) => reg.userId === session?.user?.id
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[#f59e0b]/30">
      {/* Background Architecture */}
      <div className="fixed inset-0 pointer-events-none z-0">
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
      </div>

      <ContestClient 
        contest={JSON.parse(JSON.stringify(contest))} 
        isRegistered={isRegistered} 
        userId={session?.user?.id}
      />
    </div>
  );
}
