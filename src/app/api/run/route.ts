import { NextResponse } from "next/server";
import { executeCode, TestInputOutput } from "@/lib/codeExecution"; // Import TestInputOutput

export async function POST(req: Request) {
  try {
    const { language, code, testCases, timeLimit, memoryLimit } = await req.json(); // Added timeLimit, memoryLimit

    if (!code || !testCases || timeLimit === undefined || memoryLimit === undefined) { // Updated validation
      return NextResponse.json({ error: "Missing code, test cases, time limit, or memory limit" }, { status: 400 });
    }

    try {
      // Cast testCases to the correct type to ensure type safety, though it should be handled client-side
      const typedTestCases: TestInputOutput[] = testCases;
      const results = await executeCode(language, code, typedTestCases, timeLimit, memoryLimit); // Passed new params
      return NextResponse.json({ results });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || "Execution failed" }, { status: 400 });
    }

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
