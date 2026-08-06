const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const problem = await prisma.problem.findFirst({
    where: {
      OR: [
        { title: { contains: "Articulation" } },
        { slug: { contains: "articulation" } }
      ]
    }
  });
  if (problem) {
    console.log("TITLE:", problem.title);
    console.log("SLUG:", problem.slug);
    console.log("ID:", problem.id);
    console.log("DESCRIPTION LENGTH:", problem.description?.length);
    console.log("DESCRIPTION SAMPLE:");
    console.log(problem.description);
    console.log("TEST SETS COUNT:", problem.testSets?.length);
    console.log("REFERENCE SOLUTION:");
    console.log(problem.referenceSolution);
  } else {
    console.log("Problem not found");
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
