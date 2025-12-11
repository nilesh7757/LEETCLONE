import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ManageContestClient from "./ManageContestClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ManageContestPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const contest = await prisma.contest.findUnique({
    where: { id: id },
    include: { 
        problems: {
            select: {
                id: true,
                title: true,
                difficulty: true,
                slug: true
            }
        } 
    }
  });

  if (!contest) redirect("/contest");
  
  // Ensure only the creator can access the manage page
  if (contest.creatorId !== session.user.id) {
    // Optionally verify if user is ADMIN for official contests
    // const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    // if (user.role !== "ADMIN") redirect("/contest");
    redirect("/contest");
  }

  return <ManageContestClient contest={contest} />;
}
