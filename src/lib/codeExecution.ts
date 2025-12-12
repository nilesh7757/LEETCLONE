import axios from "axios";

const PISTON_API = "https://emkc.org/api/v2/piston/execute";

export interface TestInputOutput {
  input: string;
  expectedOutput: string;
}

export interface ExecutionResult {
  input: string;
  expected: string;
  actual: string;
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Time Limit Exceeded" | "Memory Limit Exceeded";
  error?: string;
  runtime?: number; // in milliseconds
  memory?: number; // in kilobytes
}

export async function executeCode(
  language: string,
  code: string,
  testCases: TestInputOutput[],
  timeLimit: number, // in seconds
  memoryLimit: number, // in MB
  isOutputGeneration: boolean = false // New parameter with default
): Promise<ExecutionResult[]> {
  const languageMap: Record<string, { language: string; version: string }> = {
    javascript: { language: "javascript", version: "18.15.0" },
    python: { language: "python", version: "3.10.0" },
    java: { language: "java", version: "15.0.2" },
    cpp: { language: "c++", version: "10.2.0" },
    csharp: { language: "csharp", version: "6.12.0" },
    go: { language: "go", version: "1.16.2" },
    ruby: { language: "ruby", version: "3.0.1" },
    swift: { language: "swift", version: "5.3.3" },
    rust: { language: "rust", version: "1.50.0" },
    php: { language: "php", version: "8.2.3" },
  };

  const config = languageMap[language];
  if (!config) {
    throw new Error("Unsupported language");
  }

  const results: ExecutionResult[] = [];

  for (const testCase of testCases) {
    try {
      const startTime = performance.now();
      const response = await axios.post(PISTON_API, {
        language: config.language,
        version: config.version,
        files: [{ content: code }],
        stdin: testCase.input,
        // Increased compile_timeout for C++ compilation, as it can be resource intensive.
        compile_timeout: timeLimit * 5 * 1000, // 5 times the run time limit for compilation
        run_timeout: timeLimit * 1000,
        memory_limit: memoryLimit * 1024,
      });
      const endTime = performance.now();
      const networkTime = Math.ceil(endTime - startTime);

      const { run } = response.data;
      let status: ExecutionResult['status'] = "Accepted";
      let error: string | undefined;

      // Use Piston's reported time if available, otherwise fallback to network time
      // Piston returns time in seconds, we convert to ms.
      const runtime = run.time !== undefined ? Math.max(1, Math.ceil(run.time * 1000)) : networkTime;

      if (run.code !== 0) {
        status = "Runtime Error";
        error = run.stderr || `Exited with code ${run.code}`;
      } else if (run.signal === "SIGKILL" || run.signal === "SIGTERM") {
        // Piston's stdout often contains messages about timeouts/memory limits
        if (run.stdout.includes("Time Limit Exceeded") || run.stderr.includes("Time Limit Exceeded")) {
          status = "Time Limit Exceeded";
        } else if (run.stdout.includes("Memory Limit Exceeded") || run.stderr.includes("Memory Limit Exceeded")) {
          status = "Memory Limit Exceeded";
        } else {
          status = "Runtime Error"; // Generic runtime error if signal is not clearly TLE/MLE
        }
        error = run.stdout + run.stderr; // Combine stdout and stderr for better error context
      } else {
        // If generating output, skip comparison and assume Accepted if run is clean
        if (isOutputGeneration) {
          status = "Accepted";
        } else {
          const actualOutput = run.stdout.trim();
          const expectedOutput = testCase.expectedOutput.trim();

          // Perform a "strict" comparison first, then a "cleaned" comparison (ignoring whitespace differences)
          // This gives more robust judging for competitive programming.
          if (actualOutput !== expectedOutput) {
            const cleanActualOutput = actualOutput.replace(/\s+/g, ' ').trim();
            const cleanExpectedOutput = expectedOutput.replace(/\s+/g, ' ').trim();

            if (cleanActualOutput === cleanExpectedOutput) {
              status = "Accepted";
            } else {
              status = "Wrong Answer";
            }
          }
        }
      }
      
      results.push({
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: run.stdout,
        status,
        error: error || run.stderr || (status === "Accepted" || status === "Wrong Answer" ? undefined : "Unknown error"),
        runtime, 
        memory: run.memory ? Math.round(run.memory / 1024) : undefined, // Piston memory is in bytes
      });

    } catch (err: any) {
      console.error("Piston execution error:", err.response?.data || err.message);
      results.push({
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: "",
        status: "Runtime Error",
        error: `Execution failed: ${err.response?.data?.message || err.message}`,
      });
    }
  }

  return results;
}
