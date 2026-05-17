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
  passedLanguage?: string,
): Promise<GeneratedTestSet> {
  
  function detectLanguage(src: string): string {
    if (src.includes("def ") || src.includes("import sys")) return "python";
    if (src.includes("#include") || src.includes("std::")) return "cpp";
    if (src.includes("public class ") || src.includes("System.out.println")) return "java";
    return "javascript";
  }

  const language = passedLanguage || detectLanguage(referenceSolution);
  
  logger.info(`[TEST_CASE_GEN] Generating test cases for: ${problemTitle} using ${language}`);

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
    let rawInputs = await runAI(prompt, "You generate robust test inputs for algorithmic problems.", true);

    if (typeof rawInputs === 'string') {
      const cleanJson = rawInputs.replace(/```json/g, "").replace(/```/g, "").trim();
      rawInputs = JSON.parse(cleanJson);
    }

    const inputsObj = rawInputs as { examples: string[]; hidden: string[] };

    const allInputs = [
      ...inputsObj.examples.map((input: string) => ({ input, isExample: true })),
      ...inputsObj.hidden.map((input: string) => ({ input, isExample: false }))
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
