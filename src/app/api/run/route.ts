import { NextResponse } from "next/server";
import { executeCode, TestInputOutput } from "@/lib/codeExecution";
import { ProblemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { executionQueue, queueEvents } from "@/lib/queue";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      language, 
      code, 
      problemId,
      type, 
      initialSchema,
      initialData,
      timeLimit,
      memoryLimit,
      testCases,
    } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    let problem = null;
    if (problemId) {
      problem = await prisma.problem.findUnique({
        where: { id: problemId },
        select: {
          type: true,
          timeLimit: true,
          memoryLimit: true,
          initialSchema: true,
          initialData: true,
          testSets: true,
          referenceSolution: true,
        },
      });
    }

    /**
     * ROBUST LANGUAGE DETECTOR (V2)
     */
    function detectLanguage(src: string): string {
      const clean = src.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").trim(); 
      if (clean.includes("#include") || clean.includes("using namespace std;")) return "cpp";
      if (
        (clean.includes("def ") && !clean.includes("function ")) || 
        (clean.includes("import ") && !clean.includes("from '") && !clean.includes("from \""))
      ) {
          return "python";
      }
      if (clean.includes("public class ") && clean.includes("static void main")) return "java";
      return "javascript"; 
    }

    const finalType = (problem?.type || type || "CODING") as ProblemType;

    // Determine test cases to run
    let finalTestCases: TestInputOutput[] = [];

    if (testCases && Array.isArray(testCases) && testCases.length > 0) {
      finalTestCases = testCases;
    } else if (problem) {
      let allTestSets: TestInputOutput[] = [];
      if (Array.isArray(problem.testSets)) {
        allTestSets = problem.testSets as unknown as TestInputOutput[];
      }
      finalTestCases = allTestSets.filter(tc => tc.isExample === true);
    } 

    try {
      // DYNAMIC EXPECTED OUTPUT GENERATION
      const generationCode = code || problem?.referenceSolution;
      const casesToGenerate = finalTestCases.filter(tc => !tc.expectedOutput || String(tc.expectedOutput).trim() === "");
      
      if (casesToGenerate.length > 0 && generationCode && finalType === "CODING") {
        const refLang = language || detectLanguage(generationCode);
        const refJob = await executionQueue.add('generate-outputs', {
          problemId: problemId || "ref-generator",
          type: "CODING" as ProblemType,
          code: generationCode,
          language: refLang,
          testCases: casesToGenerate.map(tc => ({ 
            input: typeof tc === 'string' ? tc : (tc.input || ""), 
            expectedOutput: "" 
          })),
          timeLimit: problem?.timeLimit || 2,
          memoryLimit: problem?.memoryLimit || 256,
          isOutputGeneration: true
        });

        const refResults = await refJob.waitUntilFinished(queueEvents, 30000);

        casesToGenerate.forEach((tc, idx) => {
          const res = refResults[idx];
          if (res && res.status === "Accepted") {
            tc.expectedOutput = res.actual;
          }
        });
      }
      
      const commonParams = {
        problemId: problemId || "new-problem",
        type: finalType,
        code,
        testCases: finalTestCases,
        timeLimit: problem?.timeLimit || timeLimit || 2,
        memoryLimit: problem?.memoryLimit || memoryLimit || 256,
        initialSchema: (problem?.initialSchema || initialSchema) ?? undefined,
        initialData: (problem?.initialData || initialData) ?? undefined,
      };

      let finalLanguage = language;
      if (finalType === "CODING") {
        finalLanguage = language || detectLanguage(code) || "javascript";
      } else if (finalType === "SQL") {
        finalLanguage = "sql";
      }

      const job = await executionQueue.add('run-code', { 
        ...commonParams, 
        language: finalLanguage 
      });

      const results = await job.waitUntilFinished(queueEvents, 30000); // 30 seconds timeout
      
      return NextResponse.json({ results });
    } catch (error: unknown) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Execution failed or timed out" }, { status: 400 });
    }

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
