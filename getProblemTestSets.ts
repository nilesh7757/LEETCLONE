// getProblemTestSets.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getTestSets(problemId: string) {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        title: true,
        testSets: true,
      },
    });

    if (problem) {
      console.log(`Title: ${problem.title}`);
      console.log("Test Sets (raw JSON):");
      console.log(JSON.stringify(problem.testSets, null, 2));
    } else {
      console.log(`Problem with ID ${problemId} not found.`);
    }
  } catch (error) {
    console.error("Error fetching test sets:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Replace with the actual problem ID provided by the user
const problemId = "4419f121-55c6-4b57-a425-19af96c2d22c"; 
getTestSets(problemId);
