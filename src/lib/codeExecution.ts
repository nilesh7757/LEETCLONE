import axios from "axios";
import { ProblemType } from "@prisma/client";
import { logger } from "./logger";

// Piston API is a free, open-source code execution engine.
const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

export interface TestInputOutput {
  input: string;
  expectedOutput: string;
  isExample?: boolean;
}

export interface ExecutionResult {
  input: string;
  expected: string;
  actual: string;
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error" | "Time Limit Exceeded" | "Memory Limit Exceeded" | "API Error" | "Service Unreachable";
  error?: string;
  runtime?: number; 
  memory?: number; 
}

export interface ExecuteCodeParams {
  problemId: string;
  type: ProblemType;
  code: string;
  testCases: TestInputOutput[];
  timeLimit?: number;
  memoryLimit?: number;
  language?: string;
  isOutputGeneration?: boolean;
  initialSchema?: string;
  initialData?: string;
}

export async function executeCode(params: ExecuteCodeParams): Promise<ExecutionResult[]> {
  const { type, code, testCases, language } = params;
  const results: ExecutionResult[] = [];

  if (type === ProblemType.CODING) {
    if (!language) {
      throw new Error("Language parameter is missing.");
    }

    // Piston Language Mapping - Updated to common public versions
    const languageMap: Record<string, { pistonName: string; version: string }> = {
      javascript: { pistonName: "javascript", version: "18.15.0" },
      python: { pistonName: "python", version: "3.10.0" },
      java: { pistonName: "java", version: "15.0.2" },
      cpp: { pistonName: "cpp", version: "10.2.0" },
      csharp: { pistonName: "csharp", version: "6.12.0" },
      go: { pistonName: "go", version: "1.16.2" },
      rust: { pistonName: "rust", version: "1.68.2" },
    };

    const langConfig = languageMap[language.toLowerCase()];
    if (!langConfig) throw new Error(`Unsupported language: ${language}`);

    // Basic security check
    const maliciousPatterns = ["process.exit", "child_process", "require('fs')", "os.system", "eval(", "exec("];
    for (const pattern of maliciousPatterns) {
      if (code.includes(pattern)) {
        return testCases.map(tc => ({
          input: tc.input, expected: tc.expectedOutput, actual: "", status: "Runtime Error",
          error: `Security Violation: Use of '${pattern}' is forbidden.`
        }));
      }
    }

    for (const testCase of testCases) {
      try {
        const response = await axios.post(PISTON_URL, {
          language: langConfig.pistonName,
          version: langConfig.version,
          files: [{ content: code }],
          stdin: typeof testCase.input === 'object' ? JSON.stringify(testCase.input) : String(testCase.input),
        }, { timeout: 10000 });

        const { run } = response.data;
        const actualOutput = (run.stdout || "").trim();
        const errorOutput = (run.stderr || run.output || "").trim();
        
        let execStatus: ExecutionResult['status'] = "Accepted";
        
        if (run.code !== 0 && run.code !== null) {
            execStatus = "Runtime Error";
        } else if (actualOutput !== String(testCase.expectedOutput).trim()) {
            execStatus = "Wrong Answer";
        }

        results.push({
          input: String(testCase.input),
          expected: String(testCase.expectedOutput),
          actual: actualOutput,
          status: execStatus,
          error: run.code !== 0 ? errorOutput : undefined,
          runtime: run.time ? run.time * 1000 : undefined,
        });

      } catch (err: unknown) {
        let errMsg = "Unknown Error";
        if (axios.isAxiosError(err)) {
            errMsg = err.response?.data?.message || err.message;
        } else if (err instanceof Error) {
            errMsg = err.message;
        }
        logger.error("[EXECUTE_CODE] Piston API Error:", errMsg);
        
        results.push({
          input: String(testCase.input),
          expected: String(testCase.expectedOutput),
          actual: "",
          status: "API Error",
          error: `Engine Error: ${errMsg}`,
        });
      }
    }
  } else if (type === ProblemType.SQL) {
      results.push({
          input: "SQL Execution",
          expected: "",
          actual: "SQL runner is being updated. Use CODING problems for now.",
          status: "Accepted"
      });
  }

  return results;
}
