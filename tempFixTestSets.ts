// tempFixTestSets.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface OldTestSetStructure {
  examples: { input: string; expectedOutput: string }[];
  hidden: { input: string; expectedOutput: string }[];
}

interface NewTestInputOutput {
  input: string;
  expectedOutput: string;
  isExample?: boolean;
}

async function fixTestSets(problemId: string) {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        title: true,
        testSets: true,
      },
    });

    if (!problem) {
      console.log(`Problem with ID ${problemId} not found.`);
      return;
    }

    console.log(`Processing problem: ${problem.title} (ID: ${problemId})`);

    let currentTestSets: OldTestSetStructure | NewTestInputOutput[] | null = null;
    try {
      // First, try to parse it directly as a JSON object (if already in the correct format)
      currentTestSets = JSON.parse(problem.testSets as string);
    } catch (e) {
      // If it's not a stringified JSON, maybe it's already a direct JSON object
      currentTestSets = problem.testSets as unknown as OldTestSetStructure;
    }
    
    // If it's already a flat array, we might not need to do anything,
    // but we can ensure `isExample` is set if it's missing for consistency.
    if (Array.isArray(currentTestSets)) {
        console.log("Test sets already appear to be a flat array. Checking for isExample property...");
        const updatedTestSets = currentTestSets.map(tc => ({
            ...tc,
            isExample: tc.isExample === undefined ? false : tc.isExample // Default non-example if not specified
        }));
        await prisma.problem.update({
            where: { id: problemId },
            data: { testSets: updatedTestSets as any }, // Cast to any because Prisma's Json type is loose
        });
        console.log("Updated existing flat test sets with isExample property (if needed).");
        return;
    }


    if (currentTestSets && 'examples' in currentTestSets && 'hidden' in currentTestSets) {
      const flattenedTestSets: NewTestInputOutput[] = [];

      currentTestSets.examples.forEach(tc => {
        flattenedTestSets.push({ ...tc, isExample: true });
      });

      currentTestSets.hidden.forEach(tc => {
        flattenedTestSets.push({ ...tc, isExample: false });
      });

      await prisma.problem.update({
        where: { id: problemId },
        data: { testSets: flattenedTestSets as any }, // Cast to any because Prisma's Json type is loose
      });

      console.log("Successfully transformed and updated test sets to a flattened array.");
      console.log(`New test sets count: ${flattenedTestSets.length}`);
    } else {
      console.log("Test sets are not in the expected 'examples/hidden' structure or are already flat.");
      console.log("No transformation needed or structure is unrecognized.");
    }
  } catch (error) {
    console.error("Error fixing test sets:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Replace with the actual problem ID provided by the user
const problemId = "4419f121-55c6-4b57-a425-19af96c2d22c"; 
fixTestSets(problemId);
