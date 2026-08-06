const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const problem = await prisma.problem.findFirst({
    where: { slug: "critical-connections" }
  });
  if (problem) {
    console.log("CRITICAL CONNECTIONS DESCRIPTION:");
    console.log(problem.description);
  } else {
    console.log("Critical connections not found");
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
