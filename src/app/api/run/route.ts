import { NextResponse } from "next/server";
import { executeCode, TestInputOutput } from "@/lib/codeExecution";
import { ProblemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { 
      language, 
      code, 
      problemId,
      type, // Allow passing type directly for new problems
      initialSchema,
      initialData,
      timeLimit,
      memoryLimit,
      testCases,
    } = await req.json();

    // Basic validation
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
        },
      });
    }

    // Filter for example test cases
    let exampleTestCases: TestInputOutput[] = [];
    
    if (problem) {
      let allTestSets: TestInputOutput[] = [];
      if (Array.isArray(problem.testSets)) {
        allTestSets = problem.testSets as unknown as TestInputOutput[];
      }
      exampleTestCases = allTestSets.filter(tc => tc.isExample === true);
    } else if (testCases) {
      exampleTestCases = testCases;
    }

    try {
      let results;
      const finalType = (problem?.type || type) as ProblemType;
      
      const commonParams = {
        problemId: problemId || "new-problem",
        type: finalType,
        code,
        testCases: exampleTestCases,
        timeLimit: problem?.timeLimit || timeLimit || 2,
        memoryLimit: problem?.memoryLimit || memoryLimit || 256,
        initialSchema: (problem?.initialSchema || initialSchema) ?? undefined,
        initialData: (problem?.initialData || initialData) ?? undefined,
      };

      if (finalType === ProblemType.CODING) {
        const finalLanguage = language || "javascript";
        results = await executeCode({ ...commonParams, language: finalLanguage });
      } else if (finalType === ProblemType.SQL) {
         results = await executeCode(commonParams);
      } else {
        return NextResponse.json({ error: `Unsupported problem type: ${finalType}` }, { status: 400 });
      }
      
      return NextResponse.json({ results });
    } catch (error: unknown) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Execution failed" }, { status: 400 });
    }

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
