import { NextResponse } from "next/server";
import { executeCode, TestInputOutput } from "@/lib/codeExecution";
import { ProblemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { 
      language, 
      code, 
      problemId, // Only problemId is needed from req.json() for problem fetching
    } = await req.json();

    // Basic validation
    if (!code || !problemId) {
      return NextResponse.json({ error: "Missing code or problem ID" }, { status: 400 });
    }

    const problem = await prisma.problem.findUnique({
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

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Filter for example test cases
    let allTestSets: TestInputOutput[] = [];
    if (Array.isArray(problem.testSets)) {
      allTestSets = problem.testSets as unknown as TestInputOutput[];
    } else {
      console.error("api/run/route.ts: problem.testSets was not an array or expected format:", problem.testSets);
      allTestSets = [];
    }

    const exampleTestCases = allTestSets.filter(tc => tc.isExample === true);

    try {
      let results;
      const commonParams = {
        problemId,
        type: problem.type,
        code,
        testCases: exampleTestCases, // Pass only example test cases
        timeLimit: problem.timeLimit,
        memoryLimit: problem.memoryLimit,
        initialSchema: problem.initialSchema ?? undefined,
        initialData: problem.initialData ?? undefined,
      };

      if (problem.type === ProblemType.CODING) {
        if (!language) {
          return NextResponse.json({ error: "Missing language for CODING problem" }, { status: 400 });
        }
        results = await executeCode({ ...commonParams, language });
      } else if (problem.type === ProblemType.SQL) {
         results = await executeCode(commonParams);
      } else {
        return NextResponse.json({ error: `Unsupported problem type: ${problem.type}` }, { status: 400 });
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
