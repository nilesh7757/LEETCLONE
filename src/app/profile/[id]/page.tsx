import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PublicProfileClient from "./PublicProfileClient";

interface PublicProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { id } = await params;
  
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      website: true,
      description: true,
      rating: true,
      createdAt: true,
      email: true // Needed for layout but masked usually, or for avatar fallback
    }
  });

  if (!user) {
    notFound();
  }

  return <PublicProfileClient user={user} />;
}
