import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const problems = await prisma.problem.findMany({
      where: { isPublic: true },
      select: { id: true, title: true, slug: true, difficulty: true, category: true, type: true },
      orderBy: { createdAt: 'asc' },
    });
    console.log("Success:", problems.length, "problems found.");
    if (problems.length > 0) {
        console.log("First problem:", problems[0]);
    }
  } catch (e) {
    console.error("Error executing query:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
