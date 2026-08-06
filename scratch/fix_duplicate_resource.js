const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Disconnecting old duplicate resource for Alien Dictionary...");
  
  // 1. Disconnect duplicate resource from the problem
  await prisma.problem.update({
    where: { slug: "alien-dictionary" },
    data: {
      resources: {
        disconnect: [
          { id: "5d4b9e50-49ad-40b7-be9f-50bf9c9497e6" }
        ]
      }
    }
  });
  console.log("   ✅ Disconnected from problem.");

  // 2. Delete the old duplicate resource record completely to keep DB clean
  try {
    await prisma.learningResource.delete({
      where: { id: "5d4b9e50-49ad-40b7-be9f-50bf9c9497e6" }
    });
    console.log("   ✅ Deleted duplicate resource from LearningResource table.");
  } catch (err) {
    console.warn("Could not delete resource from table (it might still be connected elsewhere):", err.message);
  }

  // 3. Print final connected resources to verify
  const problem = await prisma.problem.findUnique({
    where: { slug: "alien-dictionary" },
    include: { resources: true }
  });
  console.log("\nRemaining connected resources for Alien Dictionary:");
  console.log(JSON.stringify(problem.resources, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
