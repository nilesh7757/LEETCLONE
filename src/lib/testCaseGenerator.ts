import { runAI } from "./gemini";
import { executeCode, TestInputOutput } from "./codeExecution";
import { ProblemType } from "@prisma/client";
import { logger } from "./logger";

export interface GeneratedTestSet {
  examples: TestInputOutput[];
  hidden: TestInputOutput[];
}

/**
 * Automatically generates comprehensive test cases using AI and a reference solution.
 */
export async function generateTestCases(
  problemTitle: string,
  problemDescription: string,
  difficulty: string,
  category: string,
  referenceSolution: string,
  language: string = "python" // Default to python for running the reference solution
): Promise<GeneratedTestSet> {
  logger.info(`[TEST_CASE_GEN] Generating test cases for: ${problemTitle}`);

  const prompt = `
    You are an expert competitive programmer and test engineer. 
    Generate a diverse set of test inputs for the following coding problem.
    
    PROBLEM: ${problemTitle}
    DIFFICULTY: ${difficulty}
    CATEGORY: ${category}
    DESCRIPTION: ${problemDescription}
    
    REQUIREMENTS:
    1. Provide 2-3 simple "example" cases (easy to understand).
    2. Provide 5-8 "hidden" cases that cover:
       - Edge cases (empty input, single element, negative numbers, etc.)
       - Max constraints (very large arrays or numbers).
       - Randomized complex inputs.
    3. Return ONLY a JSON object:
       {
         "examples": ["input1", "input2"],
         "hidden": ["input3", "input4", ...]
       }
    
    CRITICAL: Only provide the INPUT strings. Do not provide expected outputs.
  `;

  try {
    const response = await runAI(prompt, "You generate robust test inputs for algorithmic problems.", true);
    const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
    const rawInputs = JSON.parse(cleanJson);

    const allInputs = [
      ...rawInputs.examples.map((input: string) => ({ input, isExample: true })),
      ...rawInputs.hidden.map((input: string) => ({ input, isExample: false }))
    ];

    logger.info(`[TEST_CASE_GEN] Running reference solution against ${allInputs.length} inputs...`);

    // Execute reference solution to get "Expected Output"
    // We use isOutputGeneration=true so executeCode knows we just want the output
    const executionResults = await executeCode({
      problemId: "generator",
      type: ProblemType.CODING,
      code: referenceSolution,
      language: language,
      testCases: allInputs.map(i => ({ input: i.input, expectedOutput: "" })),
      timeLimit: 5, // More time for generator
      memoryLimit: 512,
      isOutputGeneration: true
    });

    const result: GeneratedTestSet = { examples: [], hidden: [] };

    executionResults.forEach((res, index) => {
      const testCase: TestInputOutput = {
        input: res.input,
        expectedOutput: res.actual, // The output from our reference solution
        isExample: allInputs[index].isExample
      };

      if (testCase.isExample) {
        result.examples.push(testCase);
      } else {
        result.hidden.push(testCase);
      }
    });

    return result;
  } catch (error) {
    logger.error("[TEST_CASE_GEN] Error generating test cases:", error);
    throw error;
  }
}
