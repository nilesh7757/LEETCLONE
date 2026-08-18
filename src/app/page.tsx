import Hero from "@/components/Hero";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [problemsCount, userCount] = await Promise.all([
    prisma.problem.count().catch(() => 108),
    prisma.user
      .count({
        where: {
          isBanned: false,
          NOT: [
            { email: { startsWith: "guest_" } },
            { email: { contains: "@logiquest.com" } },
            { name: { startsWith: "Guest" } },
            { description: "Temporary Guest Account" },
          ],
        },
      })
      .catch(() => 17),
  ]);

  return (
    <main className="min-h-screen">
      <Hero initialProblemsCount={problemsCount} initialUserCount={userCount} />
    </main>
  );
}