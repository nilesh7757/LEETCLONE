const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const problems = await prisma.problem.findMany({
    where: {
      slug: { in: ["critical-connections", "articulation-point-in-graph"] }
    },
    select: { slug: true, customChecker: true }
  });
  console.log("Current Custom Checkers:");
  console.log(JSON.stringify(problems, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
