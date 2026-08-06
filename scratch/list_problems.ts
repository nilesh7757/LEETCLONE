import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const problems = await prisma.problem.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      difficulty: true,
      category: true,
      _count: {
        select: {
          submissions: true
        }
      }
    }
  });
  console.log("Problems in DB:", problems);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
