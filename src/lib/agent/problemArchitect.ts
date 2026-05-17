import { runAI } from "@/lib/gemini";
import { executeCode } from "@/lib/codeExecution";
import { ProblemType } from "@prisma/client";
import { logger } from "@/lib/logger";

interface GeneratedProblem {
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: string;
  referenceSolution: string;
  testCases: { input: string; output: string }[];
  hints: string[];
}

interface Blueprint {
  title: string;
  description: string;
  hints: string[];
}

export class ProblemArchitect {
  private topic: string;
  private difficulty: string;

  constructor(topic: string, difficulty: string) {
    this.topic = topic;
    this.difficulty = difficulty;
  }

  async generate(): Promise<GeneratedProblem | null> {
    logger.info(`[Architect] Planning problem for: ${this.topic} (${this.difficulty})`);

    // Step 1: Blueprint & Description
    const blueprint = await this.createBlueprint() as Blueprint;
    
    // Step 2: Reference Solution
    const solution = await this.createReferenceSolution(blueprint);

    // Step 3: Test Cases (Initial Inputs Only)
    const testInputs = await this.createTestInputs(blueprint);

    // Step 4: Execution & Verification Loop (Agentic Workflow)
    // We run the AI's solution against the AI's inputs to get the GROUND TRUTH outputs.
    let verifiedTestCases = await this.verifyAndExecute(solution, testInputs);

    // If execution failed (Runtime Error, TLE, etc.), we ask the AI to fix the solution or inputs.
    if (!verifiedTestCases.success) {
      logger.info("[Architect] Execution failed. Attempting to fix...");
      // For simplicity in V1, we try to regenerate the solution once.
      // In a full agent, this would be a loop.
      const fixedSolution = await this.fixSolution(blueprint, solution, verifiedTestCases.error || "Unknown Error");
      verifiedTestCases = await this.verifyAndExecute(fixedSolution, testInputs);
      
      // If it still fails, we might just return what we have with a warning flag, or throw.
      if (!verifiedTestCases.success) {
         logger.warn("[Architect] Final verification failed.");
      } else {
         // Update to the fixed solution
         return this.formatResult(blueprint, fixedSolution, verifiedTestCases.data);
      }
    }

    return this.formatResult(blueprint, solution, verifiedTestCases.data);
  }

  private formatResult(blueprint: Blueprint, solution: string, testCases: { input: string; output: string }[]): GeneratedProblem {
      return {
        title: blueprint.title,
        description: blueprint.description,
        difficulty: this.difficulty as "EASY" | "MEDIUM" | "HARD",
        category: this.topic,
        referenceSolution: solution,
        testCases: testCases,
        hints: blueprint.hints,
      };
  }

  private async createBlueprint(): Promise<Blueprint> {
    const prompt = `
      Plan a competitive programming problem about "${this.topic}" with difficulty "${this.difficulty}".
      
      Requirements:
      1. STRICTLY follow Standard I/O formats (Codeforces/CodeChef style).
      2. Input Format: explicitly state how to read the input (e.g., "First line contains N and K. Second line contains N integers...").
      3. Output Format: explicitly state what to print to stdout.
      
      Output JSON:
      {
        "title": "Creative Title",
        "description": "Full markdown description including Input/Output Format sections...",
        "hints": ["hint1", "hint2"]
      }
    `;
    const res = await runAI(prompt, "You are a competitive programming problem setter.", true);
    return res as Blueprint;
  }

  private async createReferenceSolution(blueprint: Blueprint) {
    const prompt = `
      Write a complete JavaScript (Node.js) solution for this problem:
      Title: ${blueprint.title}
      Description: ${blueprint.description}

      CRITICAL REQUIREMENTS:
      1. Use ONLY plain JavaScript (no TypeScript types like ': number[]').
      2. The code MUST read from STDIN and print to STDOUT.
      3. Use 'const fs = require("fs"); const input = fs.readFileSync(0, "utf8");' to read input.
      4. Handle the specific "Input Format" described.
      5. Print ONLY the final answer to stdout.

      Return ONLY the code inside a markdown block.
    `;
    const res = await runAI(prompt, "You are a Competitive Programmer.", false) as string;
    
    // Improved extraction: find content between ```...```
    const match = res.match(/```(?:javascript|js|typescript|ts)?\s*([\s\S]*?)```/);
    const code = match ? match[1] : res;
    
    return code.trim();
  }

  private async createTestInputs(blueprint: Blueprint): Promise<string[]> {
    const prompt = `
      Generate 5 test case INPUTS for this problem based on the following description:
      
      DESCRIPTION:
      ${blueprint.description}
      
      CRITICAL: 
      1. Follow the "Input Format" section exactly.
      2. Return ONLY a JSON Array of strings. Do not wrap it in an object.
      3. Use raw strings with newlines for multi-line inputs.
      
      Example: ["5\\n1 0 1 1 0", "3\\n1 1 1"]
    `;
    const res = await runAI(prompt, "You are a QA Engineer.", true);
    logger.debug("[Architect] Raw Test Inputs Response:", res);
    
    try {
        const parsed = res as unknown;
        if (Array.isArray(parsed)) return parsed;
        
        if (typeof parsed === 'object' && parsed !== null) {
            const p = parsed as { inputs?: string[]; test_cases?: string[]; testCases?: (string | { input: string })[] };
            if (p.inputs && Array.isArray(p.inputs)) return p.inputs;
            if (p.test_cases && Array.isArray(p.test_cases)) return p.test_cases;
            if (p.testCases && Array.isArray(p.testCases)) {
                return p.testCases.map((tc: { input: string } | string) => typeof tc === 'string' ? tc : tc.input);
            }
        }
        return [];
    } catch (e) {
        logger.error("[Architect] Failed to parse test inputs:", e instanceof Error ? e.message : String(e));
        return [];
    }
  }

  private async verifyAndExecute(solution: string, inputs: string[]) {
      try {
          logger.info("[Architect] Executing solution against", inputs.length, "inputs...");
          const results = await executeCode({
              problemId: "architect-verify",
              type: ProblemType.CODING,
              code: solution,
              language: "javascript",
              testCases: inputs.map(inp => ({ input: inp, expectedOutput: "" })), 
              timeLimit: 2,
              memoryLimit: 256,
              isOutputGeneration: true
          });

          // Process results: If it has an error, show the error. If it has output, show output.
          const processedData = results.map(r => {
             if (r.status === "Accepted" && r.actual) return { input: r.input, output: r.actual.trim() };
             if (r.error) return { input: r.input, output: `Error: ${r.status} - ${r.error}` };
             return { input: r.input, output: "No Output (Empty)" };
          });

          // Count valid executions (those that produced non-error output)
          const validCount = results.filter(r => r.status === "Accepted" && r.actual).length;
          const success = validCount === results.length;

          logger.info(`[Architect] Execution finished. Valid: ${validCount}/${results.length}`);

          return {
              success: success,
              data: processedData,
              error: !success ? results.find(r => r.error)?.error : undefined
          };
      } catch (e: unknown) {
          logger.error("[Architect] Execution System Error:", e instanceof Error ? e.message : String(e));
          return { success: false, error: e instanceof Error ? e.message : "Unknown Error", data: inputs.map(i => ({ input: i, output: "System Error" })) };
      }
  }

  private async fixSolution(blueprint: Blueprint, brokenSolution: string, error: string) {
      const prompt = `
        The previous solution failed execution.
        Error: ${error}
        
        Problem: ${blueprint.title}
        Broken Solution: 
        ${brokenSolution}

        Task: Fix the solution to handle the input correctly and not crash.
        Return ONLY the fixed code.
      `;
      const res = await runAI(prompt, "You are a Senior Debugger.", false) as string;
      return res.replace(/```typescript/g, "").replace(/```/g, "").trim();
  }
}