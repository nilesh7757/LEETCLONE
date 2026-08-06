import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const problem = await prisma.problem.findUnique({
    where: { slug: "flood-fill" }
  });
  if (problem) {
    console.log("TITLE:", problem.title);
    console.log("INPUT FORMAT / EXAMPLES / TEST CASES:");
    console.log(JSON.stringify(problem.testSets, null, 2));
    console.log("REFERENCE SOLUTION:");
    console.log(problem.referenceSolution);
  } else {
    console.log("Flood Fill not found");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
