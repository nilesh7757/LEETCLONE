import axios from "axios";
import { ProblemType } from "@prisma/client";
import { logger } from "./logger";
import vm from "vm";

// NOTE: We are using ce.judge0.com which is the free public tier of Judge0.
// It has strict rate limits. Under high production load, this should be migrated
// to a dedicated, self-hosted Judge0 instance.
const JUDGE0_BATCH_URL = "https://ce.judge0.com/submissions/batch?base64_encoded=false";

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
  initialSchema?: string;
  initialData?: string;
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
  problemSlug?: string;
  problemTitle?: string;
  customChecker?: string | null;
  initialSchema?: string;
  initialData?: string;
}

/**
 * HIGH-RELIABILITY ENGINE: Judge0 Cloud Runner (Asynchronous Webhook Callback & Local Polling)
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

  // Determine if we should use the webhook callback flow
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://logiquest.nileshmori.me";
  const isLocalHost = appUrl.includes("localhost") || appUrl.includes("127.0.0.1");
  const isTest = process.env.NODE_ENV === "test";
  const callbackUrl = isTest ? null : (process.env.JUDGE0_CALLBACK_URL || (!isLocalHost ? `${appUrl}/api/judge0-callback` : null));

  logger.info(`[EXEC_CODE] Submitting ${testCases.length} test cases to Judge0 Batch API... Callback url: ${callbackUrl || "None (direct polling fallback)"}`);

  // 1. Construct submission payloads
  const submissionsPayload = testCases.map((tc) => {
    let sourceCode = code;
    if (type === ProblemType.SQL) {
      const schema = tc.initialSchema || params.initialSchema || "";
      const data = (tc.input && tc.input.trim() !== "") ? tc.input : (tc.initialData || params.initialData || "");
      sourceCode = `.headers on\n.mode csv\n${schema}\n${data}\n${code}`;
    }

    const payload: {
      source_code: string;
      language_id: number;
      stdin: string;
      cpu_time_limit: number;
      memory_limit: number;
      expected_output?: string;
      callback_url?: string;
    } = {
      source_code: sourceCode,
      language_id: langId,
      stdin: tc.input || "",
      cpu_time_limit: (params.timeLimit && params.timeLimit > 10 ? params.timeLimit / 1000 : params.timeLimit) || 5,
      memory_limit: (params.memoryLimit || 512) * 1024,
    };

    if (callbackUrl) {
      payload.callback_url = callbackUrl;
    }

    if (!params.isOutputGeneration && tc.expectedOutput) {
      payload.expected_output = tc.expectedOutput;
    }

    return payload;
  });

  // 2. Submit batches of up to 20 submissions at once
  const tokens: string[] = [];
  const BATCH_LIMIT = 20;

  for (let i = 0; i < submissionsPayload.length; i += BATCH_LIMIT) {
    const chunk = submissionsPayload.slice(i, i + BATCH_LIMIT);
    try {
      const response = await axios.post(JUDGE0_BATCH_URL, { submissions: chunk });
      const data = response.data;
      if (Array.isArray(data)) {
        tokens.push(...data.map((item: { token: string }) => item.token));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      logger.error(`[EXEC_CODE] Judge0 Batch submission failed for chunk at index ${i}:`, errorMsg);
      return testCases.map((tc) => ({
        input: String(tc.input || ""),
        expected: String(tc.expectedOutput || ""),
        actual: "",
        status: "Service Unreachable",
        error: errorMsg,
        runtime: 0,
      }));
    }
  }

  if (tokens.length !== testCases.length) {
    return testCases.map((tc) => ({
      input: String(tc.input || ""),
      expected: String(tc.expectedOutput || ""),
      actual: "",
      status: "Service Unreachable",
      error: "Failed to register all test cases with Judge0.",
      runtime: 0,
    }));
  }

  // 3. Poll batch statuses dynamically (either from Redis/memory callbacks, or direct Judge0 GET fallback)
  const results: ExecutionResult[] = new Array(testCases.length);
  const finished = new Set<number>();
  let attempts = 0;
  const maxAttempts = 40; // Max 16 seconds of polling
  let hasFailure = false;

  const globalStore = ((globalThis as unknown as Record<string, unknown>)._judge0CallbackStore as Map<string, unknown>) || new Map<string, unknown>();
  const redis = (globalThis as unknown as { _redisConnection: import("ioredis").Redis | undefined })._redisConnection;

  while (finished.size < testCases.length && attempts < maxAttempts && !hasFailure) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 400));

    const pendingIndices = testCases.map((_, idx) => idx).filter(idx => !finished.has(idx));
    const pendingTokens = pendingIndices.map(idx => tokens[idx]);

    try {
      let submissions: unknown[] = [];

      if (callbackUrl) {
        // --- WEBHOOK FLOW: Poll local memory and Redis ---
        submissions = await Promise.all(
          pendingTokens.map(async (token) => {
            // Check global memory store first
            if (globalStore.has(token)) {
              return globalStore.get(token);
            }

            // Check Redis store
            try {
              if (redis && redis.status === "ready") {
                const cached = await redis.get(`judge0:token:${token}`);
                if (cached) {
                  const parsed = JSON.parse(cached);
                  globalStore.set(token, parsed);
                  return parsed;
                }
              }
            } catch (redisErr) {
              logger.warn(`[EXEC_CODE] Redis read failed for ${token}:`, redisErr);
            }

            // Still processing
            return { status: { id: 1 } };
          })
        );
      } else {
        // --- POLLING FALLBACK: Poll Judge0 directly ---
        const pollResponse = await axios.get(
          `https://ce.judge0.com/submissions/batch?tokens=${pendingTokens.join(",")}&base64_encoded=false&fields=status_id,status,stdout,stderr,compile_output,message,time,memory`
        );
        submissions = pollResponse.data.submissions;
      }

      if (!submissions || !Array.isArray(submissions)) {
        throw new Error("Invalid response from execution stores.");
      }

      for (let k = 0; k < submissions.length; k++) {
        const sub = submissions[k] as {
          status?: { id: number; description?: string };
          status_id?: number;
          stdout?: string;
          stderr?: string;
          compile_output?: string;
          message?: string;
          time?: string;
          memory?: number;
        };
        const actualIndex = pendingIndices[k];
        const tc = testCases[actualIndex];
        const statusId = sub.status?.id || sub.status_id;

        // Status 1: In Queue, Status 2: Processing, undefined/missing: Pending
        if (!statusId || statusId === 1 || statusId === 2) {
          continue;
        }

        let status: ExecutionResult["status"] = "Accepted";
        if (params.isOutputGeneration) {
          if (statusId === 3 || statusId === 4) status = "Accepted";
          else if (statusId === 5) status = "Time Limit Exceeded";
          else if (statusId === 6) status = "Compilation Error";
          else status = "Runtime Error";
        } else {
          if (statusId === 3) {
            status = "Accepted";
          } else if (statusId === 4) {
            if (checkSpecialJudge(params.customChecker, params.problemSlug, params.problemTitle, tc.input || "", (sub.stdout || "").trim(), tc.expectedOutput || "", type === ProblemType.SQL)) {
              status = "Accepted";
            } else {
              status = "Wrong Answer";
            }
          } else if (statusId === 5) {
            status = "Time Limit Exceeded";
          } else if (statusId === 6) {
            status = "Compilation Error";
          } else {
            status = "Runtime Error";
          }
        }

        results[actualIndex] = {
          input: String(tc.input || ""),
          expected: String(tc.expectedOutput || ""),
          actual: (sub.stdout || "").trim(),
          status,
          error: sub.stderr || sub.compile_output || sub.message,
          runtime: parseFloat(sub.time || "0") * 1000 || 0,
        };

        finished.add(actualIndex);

        // Clean up from local stores
        if (callbackUrl) {
          globalStore.delete(tokens[actualIndex]);
          try {
            if (redis && redis.status === "ready") {
              await redis.del(`judge0:token:${tokens[actualIndex]}`);
            }
          } catch (delErr) {
            logger.warn(`[EXEC_CODE] Redis del failed for ${tokens[actualIndex]}:`, delErr);
          }
        }
      }

      // Early termination check in sequential order
      for (let idx = 0; idx < testCases.length; idx++) {
        if (finished.has(idx)) {
          if (results[idx].status !== "Accepted") {
            hasFailure = true;
            break;
          }
        } else {
          break;
        }
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      logger.error("[EXEC_CODE] Polling error during status retrieval:", errorMsg);
      pendingIndices.forEach(idx => {
        results[idx] = {
          input: String(testCases[idx].input || ""),
          expected: String(testCases[idx].expectedOutput || ""),
          actual: "",
          status: "Service Unreachable",
          error: errorMsg,
          runtime: 0,
        };
        finished.add(idx);
      });
      break;
    }
  }

  // Aggregate results and apply sequential early termination
  const finalResults: ExecutionResult[] = [];
  for (let idx = 0; idx < testCases.length; idx++) {
    if (results[idx]) {
      finalResults.push(results[idx]);
      if (results[idx].status !== "Accepted") {
        break; // Stop reporting past the first failing test case
      }
    } else {
      break; // Exited early
    }
  }

  return finalResults;
}

function validateTopologicalSort(input: string, actualOutput: string): boolean {
  try {
    const lines = input.trim().split(/\s+/);
    if (lines.length < 2) return false;
    
    const n = parseInt(lines[0]);
    const m = parseInt(lines[1]);
    
    // Parse edges
    const edges: [number, number][] = [];
    let idx = 2;
    for (let i = 0; i < m; i++) {
      if (idx + 1 >= lines.length) break;
      const u = parseInt(lines[idx]);
      const v = parseInt(lines[idx + 1]);
      edges.push([u, v]);
      idx += 2;
    }
    
    // Parse user's output
    const outputTokens = actualOutput.trim().split(/\s+/).map(t => parseInt(t));
    
    // Check if the output has exactly N elements
    if (outputTokens.length !== n) return false;
    
    // Check if it is a permutation of 0 to N-1
    const seen = new Set(outputTokens);
    if (seen.size !== n) return false;
    for (let i = 0; i < n; i++) {
      if (!seen.has(i)) return false;
    }
    
    // Check if all topological constraints (edges) are satisfied
    const pos = new Map<number, number>();
    outputTokens.forEach((v, index) => {
      pos.set(v, index);
    });
    
    for (const [u, v] of edges) {
      const posU = pos.get(u);
      const posV = pos.get(v);
      if (posU === undefined || posV === undefined || posU >= posV) {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
}

function compareFloatsAndStrings(actual: string, expected: string): boolean {
  try {
    const actualTokens = actual.trim().split(/\s+/);
    const expectedTokens = expected.trim().split(/\s+/);

    if (actualTokens.length !== expectedTokens.length) {
      return false;
    }

    for (let i = 0; i < actualTokens.length; i++) {
      const act = actualTokens[i];
      const exp = expectedTokens[i];

      const actNum = Number(act);
      const expNum = Number(exp);

      if (!isNaN(actNum) && !isNaN(expNum) && act.trim() !== "" && exp.trim() !== "") {
        if (Math.abs(actNum - expNum) > 1e-6) {
          return false;
        }
      } else {
        if (act !== exp) {
          return false;
        }
      }
    }

    return true;
  } catch {
    return false;
  }
}

function compareSqlResults(actual: string, expected: string): boolean {
  try {
    const actualLines = actual.trim().split("\n").map(l => l.trim()).filter(Boolean);
    const expectedLines = expected.trim().split("\n").map(l => l.trim()).filter(Boolean);

    if (actualLines.length !== expectedLines.length) return false;
    if (actualLines.length === 0) return true;

    // Compare headers case-insensitively
    const actualHeaders = actualLines[0].toLowerCase().split(",").map(h => h.trim());
    const expectedHeaders = expectedLines[0].toLowerCase().split(",").map(h => h.trim());

    if (actualHeaders.length !== expectedHeaders.length) return false;
    for (let i = 0; i < actualHeaders.length; i++) {
      if (actualHeaders[i] !== expectedHeaders[i]) return false;
    }

    // Sort actual and expected rows for order-insensitivity
    const actualRows = actualLines.slice(1).sort();
    const expectedRows = expectedLines.slice(1).sort();

    for (let i = 0; i < actualRows.length; i++) {
      const actRow = actualRows[i];
      const expRow = expectedRows[i];

      const actCols = actRow.split(",").map(c => c.trim());
      const expCols = expRow.split(",").map(c => c.trim());

      if (actCols.length !== expCols.length) return false;

      for (let j = 0; j < actCols.length; j++) {
        const actVal = actCols[j];
        const expVal = expCols[j];

        const actNum = Number(actVal);
        const expNum = Number(expVal);

        if (!isNaN(actNum) && !isNaN(expNum) && actVal !== "" && expVal !== "") {
          if (Math.abs(actNum - expNum) > 1e-6) return false;
        } else {
          if (actVal.toLowerCase() !== expVal.toLowerCase()) return false;
        }
      }
    }

    return true;
  } catch {
    return false;
  }
}

function checkSpecialJudge(
  customChecker: string | undefined | null,
  problemSlug: string | undefined,
  problemTitle: string | undefined,
  input: string,
  actualOutput: string,
  expectedOutput: string,
  isSql?: boolean
): boolean {
  if (isSql) {
    return compareSqlResults(actualOutput, expectedOutput);
  }

  // 1. Run dynamic custom checker in Node VM sandbox if present
  if (customChecker) {
    try {
      const sandbox = {
        input,
        actualOutput,
        expectedOutput,
        result: false,
        console,
      };

      vm.createContext(sandbox);
      vm.runInContext(customChecker, sandbox, { timeout: 1000 });

      return sandbox.result === true;
    } catch (e) {
      logger.error("[VM_CHECKER] Custom checker execution failed:", e);
    }
  }

  const normTitle = (problemTitle || "").toLowerCase();
  const normSlug = (problemSlug || "").toLowerCase();

  // 2. Fallback to hardcoded topological sort check
  if (
    normTitle.includes("topo") || 
    normSlug.includes("topo") || 
    normTitle.includes("topological") || 
    normSlug.includes("topological") ||
    normSlug.includes("cycle")
  ) {
    return validateTopologicalSort(input, actualOutput);
  }

  // 3. Fallback to float-tolerant token comparison (e.g. 2 vs 2.0)
  return compareFloatsAndStrings(actualOutput, expectedOutput);
}

