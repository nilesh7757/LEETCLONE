import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import ContestClient from "./ContestClient";

interface ContestPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContestPage({ params }: ContestPageProps) {
  const { id } = await params;
  const session = await auth();

  const contest = await prisma.contest.findUnique({
    where: { id },
    include: {
      creator: {
        select: { name: true },
      },
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
        where: { userId: session?.user?.id },
      },
    },
  });

  if (!contest) {
    notFound();
  }

  const isRegistered = contest.registrations.length > 0;
  const isCreator = session?.user?.id === contest.creatorId;
  const hasStarted = new Date() >= contest.startTime;

  // Hide problems if:
  // 1. Contest hasn't started (and not creator)
  // 2. Contest is PRIVATE and user is not registered (and not creator)
  if ((!hasStarted || (contest.visibility === "PRIVATE" && !isRegistered)) && !isCreator) {
    contest.problems = [];
  }

  // Serialize dates to avoid Next.js warnings/errors with Client Components
  const serializedContest = {
    ...contest,
    startTime: contest.startTime.toISOString(),
    endTime: contest.endTime.toISOString(),
    createdAt: contest.createdAt.toISOString(),
    registrations: contest.registrations.map((r) => ({
      ...r,
      registeredAt: r.registeredAt ? r.registeredAt.toISOString() : null, // Handle potential nulls/dates in registrations if they exist (though schema says default now())
      // Add other date fields if schema changes
    })),
  };

  return (
    <main className="min-h-screen pt-20 pb-12 px-4 bg-[var(--background)]">
      <ContestClient contest={serializedContest} isRegistered={isRegistered} userId={session?.user?.id} />
    </main>
  );
}
