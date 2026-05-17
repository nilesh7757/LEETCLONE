import axios from "axios";
import { ProblemType } from "@prisma/client";
import { logger } from "./logger";

const JUDGE0_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";

// Map of LogiQuest languages to Judge0 language IDs
const LANGUAGE_ID_MAP: Record<string, number> = {
  javascript: 102, // Node.js 22.08.0
  python: 100,     // Python 3.12.5
  python3: 100,    // Python 3.12.5
  cpp: 105,        // C++ (GCC 14.1.0)
  "c++": 105,      // C++ (GCC 14.1.0)
  gcc: 105,        // C++ (GCC 14.1.0)
  sql: 82,         // SQL (SQLite 3.27.2)
  sqlite3: 82,     // SQL (SQLite 3.27.2)
  java: 91,        // Java (OpenJDK 17.0.2)
};

export interface TestInputOutput {
  input: string;
  expectedOutput: string;
  isExample?: boolean;
}

export interface ExecutionResult {
  input: string;
  expected: string;
  actual: string;
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error" | "Time Limit Exceeded" | "Memory Limit Exceeded" | "Service Unreachable";
  error?: string;
  runtime?: number;
}

export interface ExecuteCodeParams {
  code: string;
  testCases: TestInputOutput[];
  language?: string;
  type?: ProblemType;
  timeLimit?: number;
  memoryLimit?: number;
  isOutputGeneration?: boolean;
  problemId?: string;
  initialSchema?: string;
  initialData?: string;
}

/**
 * HIGH-RELIABILITY ENGINE: Judge0 Cloud Runner
 */
export async function executeCode(params: ExecuteCodeParams): Promise<ExecutionResult[]> {
  const { code, testCases, language = "javascript", type } = params;

  if (type !== ProblemType.CODING && type !== ProblemType.SQL) {
    logger.warn(`[EXEC_CODE] Unsupported problem type: ${type}`);
    return [];
  }

  const langId = LANGUAGE_ID_MAP[language.toLowerCase()];

  if (!langId) {
    logger.error(`[EXEC_CODE] Language not supported: ${language}`);
    throw new Error(`Language ${language} not supported yet.`);
  }

  let finalCode = code;
  if (type === ProblemType.SQL) {
    finalCode = `${params.initialSchema || ""}\n${params.initialData || ""}\n${code}`;
  }

  logger.info(`[EXEC_CODE] Executing ${testCases.length} test cases for ${language} using Judge0 Cloud...`);

  const results: ExecutionResult[] = [];
  const CHUNK_SIZE = 5;

  for (let i = 0; i < testCases.length; i += CHUNK_SIZE) {
    const chunk = testCases.slice(i, i + CHUNK_SIZE);
    
    const chunkResults = await Promise.all(
      chunk.map(async (tc, index) => {
        const actualIndex = i + index;
        try {
          if (!tc.input || String(tc.input).trim() === "") {
              logger.warn(`[EXEC_CODE] Executing test case ${actualIndex} with empty STDIN`);
          }

          const payload: {
            source_code: string;
            language_id: number;
            stdin: string;
            cpu_time_limit: number;
            memory_limit: number;
            expected_output?: string;
          } = {
            source_code: finalCode,
            language_id: langId,
            stdin: tc.input || "",
            cpu_time_limit: params.timeLimit || 5,
            memory_limit: (params.memoryLimit || 512) * 1024,
          };

          if (!params.isOutputGeneration && tc.expectedOutput) {
            payload.expected_output = tc.expectedOutput;
          }

          const response = await axios.post(JUDGE0_URL, payload);
          const data = response.data;
          
          if (!data || !data.status) {
             throw new Error("Invalid response from execution engine");
          }

          const statusId = data.status.id;

          let status: ExecutionResult["status"] = "Accepted";
          if (params.isOutputGeneration) {
            if (statusId === 3 || statusId === 4) status = "Accepted";
            else if (statusId === 5) status = "Time Limit Exceeded";
            else if (statusId === 6) status = "Compilation Error";
            else status = "Runtime Error";
          } else {
            if (statusId === 3) status = "Accepted";
            else if (statusId === 4) status = "Wrong Answer";
            else if (statusId === 5) status = "Time Limit Exceeded";
            else if (statusId === 6) status = "Compilation Error";
            else status = "Runtime Error";
          }

          return {
            input: String(tc.input || ""),
            expected: String(tc.expectedOutput || ""),
            actual: (data.stdout || "").trim(),
            status,
            error: data.stderr || data.compile_output || data.message,
            runtime: parseFloat(data.time) * 1000 || 0,
          };
        } catch (error: unknown) {
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          logger.error(`[EXEC_CODE] Judge0 API error for test case ${actualIndex}:`, errorMsg);
          return {
            input: String(tc.input || ""),
            expected: String(tc.expectedOutput || ""),
            actual: "",
            status: "Service Unreachable",
            error: errorMsg,
            runtime: 0,
          } as ExecutionResult;
        }
      })
    );

    results.push(...chunkResults);
    
    // Add a small delay between chunks to respect rate limits
    if (i + CHUNK_SIZE < testCases.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}
