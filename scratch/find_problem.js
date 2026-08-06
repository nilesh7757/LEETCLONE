const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const problems = await prisma.problem.findMany();
  const target = problems.filter(p => p.title.toLowerCase().includes("articulation") || p.slug.toLowerCase().includes("articulation"));
  console.log("Matching target problems:");
  console.log(JSON.stringify(target, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
