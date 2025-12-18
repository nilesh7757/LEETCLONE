import { PrismaClient, ProblemType } from "@prisma/client";
import { executeCode } from "./src/lib/codeExecution";

const prisma = new PrismaClient();

async function updateSqlExpectedOutputs() {
  console.log("Fetching SQL problems to update expected outputs...");
  
  const sqlProblems = await prisma.problem.findMany({
    where: { type: ProblemType.SQL },
  });

  console.log(`Found ${sqlProblems.length} SQL problems.`);

  for (const problem of sqlProblems) {
    if (!problem.referenceSolution || !problem.initialSchema) {
      console.log(`- Skipping ${problem.title} (Missing solution or schema)`);
      continue;
    }

    console.log(`- Processing ${problem.title}...`);

    try {
      // Execute the reference solution to get the actual formatted output
      const results = await executeCode({
        problemId: problem.id,
        type: ProblemType.SQL,
        code: problem.referenceSolution,
        testCases: [], // No existing test cases needed for generation
        initialSchema: problem.initialSchema,
        initialData: problem.initialData || "",
        isOutputGeneration: true
      });

      if (results.length > 0 && results[0].actual) {
        const actualOutput = results[0].actual;
        
        // Update the problem with the actual output formatted as a single test case
        await prisma.problem.update({
          where: { id: problem.id },
          data: {
            testSets: [
              {
                input: "",
                expectedOutput: actualOutput,
                isExample: true
              }
            ] as any
          }
        });
        console.log(`  Successfully updated expected output for ${problem.title}.`);
      } else {
        console.warn(`  Failed to get output for ${problem.title}: ${results[0]?.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error(`  Error processing ${problem.title}:`, error);
    }
  }

  console.log("SQL output generation completed.");
}

updateSqlExpectedOutputs()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
