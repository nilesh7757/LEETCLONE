import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const slugs = ['rotting-oranges', 'critical-connections'];

  for (const slug of slugs) {
    const problem = await prisma.problem.findUnique({
      where: { slug }
    });

    if (problem) {
      const testCases = problem.testSets as any[];
      console.log(`✅ Problem found: "${problem.title}"`);
      console.log(`   Slug: ${problem.slug}`);
      console.log(`   Difficulty: ${problem.difficulty}`);
      console.log(`   Category: ${problem.category}`);
      console.log(`   Test Cases: ${testCases.length}`);
    } else {
      console.log(`❌ Problem NOT found: ${slug}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
