import axios from "axios";
import { ProblemType } from "@prisma/client"; // Import ProblemType enum

const PISTON_API = "https://emkc.org/api/v2/piston/execute";

export interface TestInputOutput {
  input: string;
  expectedOutput: string;
  isExample?: boolean;
}

export interface ExecutionResult {
  input: string;
  expected: string;
  actual: string;
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Time Limit Exceeded" | "Memory Limit Exceeded" | "API Error" | "Service Unreachable";
  error?: string;
  runtime?: number; // in milliseconds
  memory?: number; // in kilobytes
}

export interface ExecuteCodeParams {
  problemId: string;
  type: ProblemType;
  code: string; // User's code
  testCases: TestInputOutput[]; // For coding problems: input/output
  timeLimit?: number; // in seconds
  memoryLimit?: number; // in MB
  language?: string; // For CODING problems
  isOutputGeneration?: boolean; // For when we need to generate outputs, not compare
  initialSchema?: string; // For SQL problems
  initialData?: string; // For SQL problems
}

export async function executeCode(params: ExecuteCodeParams): Promise<ExecutionResult[]> {
  const { problemId, type, code, testCases, timeLimit, memoryLimit, language, isOutputGeneration = false, initialSchema, initialData } = params;
  const results: ExecutionResult[] = [];

  console.log(`[EXECUTE_CODE] Entering executeCode for problemId: ${problemId}, type: ${type}`);
  console.log(`[EXECUTE_CODE] Number of test cases: ${testCases.length}`);

  if (type === ProblemType.CODING) {
    if (!language || timeLimit === undefined || memoryLimit === undefined) {
      console.error("[EXECUTE_CODE] Missing required parameters for CODING problem");
      throw new Error("Missing language, time limit, or memory limit for CODING problem");
    }

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
      console.error(`[EXECUTE_CODE] Unsupported language: ${language}`);
      throw new Error("Unsupported language");
    }

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`[EXECUTE_CODE] Processing CODING test case ${i + 1}/${testCases.length}`);
      // Introduce a delay to respect Piston API rate limits (1 request per 200ms)
      await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
      try {
        const startTime = performance.now();
        const requestPayload = {
          language: config.language,
          version: config.version,
          files: [{ content: code }],
          stdin: testCase.input,
          compile_timeout: timeLimit * 5 * 1000,
          run_timeout: timeLimit * 1000,
          memory_limit: memoryLimit * 1024,
        };
        console.log(`[EXECUTE_CODE] Test Case ${i + 1}: Sending request to Piston API. Payload (stripped code): ${JSON.stringify({...requestPayload, files: [{content: code.substring(0, 50) + '...'}]})}`);
        
        const response = await axios.post(PISTON_API, requestPayload, { timeout: 15000 }); // Add a 15-second network timeout
        const endTime = performance.now();
        const networkTime = Math.ceil(endTime - startTime);
        console.log(`[EXECUTE_CODE] Test Case ${i + 1}: Piston API responded in ${networkTime}ms. Status: ${response.status}`);
        console.log(`[EXECUTE_CODE] Test Case ${i + 1}: Raw response data: ${JSON.stringify(response.data)}`);

        const { run } = response.data;
        let status: ExecutionResult['status'] = "Accepted";
        let error: string | undefined;
        const runtime = run.time !== undefined ? Math.max(1, Math.ceil(run.time * 1000)) : networkTime;

        if (run.code !== 0) {
          status = "Runtime Error";
          error = run.stderr || `Exited with code ${run.code}`;
          console.log(`[EXECUTE_CODE] Test Case ${i + 1}: Runtime Error. Error: ${error}`);
        } else if (run.signal === "SIGKILL" || run.signal === "SIGTERM") {
          if (run.stdout.includes("Time Limit Exceeded") || run.stderr.includes("Time Limit Exceeded")) {
            status = "Time Limit Exceeded";
            console.log(`[EXECUTE_CODE] Test Case ${i + 1}: Time Limit Exceeded`);
          } else if (run.stdout.includes("Memory Limit Exceeded") || run.stderr.includes("Memory Limit Exceeded")) {
            status = "Memory Limit Exceeded";
            console.log(`[EXECUTE_CODE] Test Case ${i + 1}: Memory Limit Exceeded`);
          } else {
            status = "Runtime Error";
            console.log(`[EXECUTE_CODE] Test Case ${i + 1}: Runtime Error (SIGKILL/SIGTERM without specific message)`);
          }
          error = run.stdout + run.stderr;
        } else {
          if (isOutputGeneration) {
            status = "Accepted";
            console.log(`[EXECUTE_CODE] Test Case ${i + 1}: Output Generation Accepted`);
          } else {
            const actualOutput = (run.stdout || "").trim();
            const expectedOutput = (testCase.expectedOutput || "").trim();

            if (actualOutput !== expectedOutput) {
              const cleanActualOutput = actualOutput.replace(/\s+/g, ' ').trim();
              const cleanExpectedOutput = expectedOutput.replace(/\s+/g, ' ').trim();

              if (cleanActualOutput === cleanExpectedOutput) {
                status = "Accepted";
                console.log(`[EXECUTE_CODE] Test Case ${i + 1}: Accepted (whitespace diff only). Cleaned Actual: "${cleanActualOutput}", Cleaned Expected: "${cleanExpectedOutput}"`);
              } else {
                status = "Wrong Answer";
                console.log(`[EXECUTE_CODE] Test Case ${i + 1}: Wrong Answer`);
              }
            } else {
              console.log(`[EXECUTE_CODE] Test Case ${i + 1}: Accepted`);
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
          memory: run.memory ? Math.round(run.memory / 1024) : undefined,
        });
        console.log(`[EXECUTE_CODE] Test Case ${i + 1}: Result pushed: ${status}`);

      } catch (err: unknown) {
        let status: ExecutionResult['status'] = "Runtime Error";
        let errorMessage: string;

        if (axios.isAxiosError(err)) {
          console.error(`[EXECUTE_CODE] Test Case ${i + 1}: Axios Error Caught`);
          if (err.code === 'ECONNABORTED') { // Timeout error
            status = "Time Limit Exceeded";
            errorMessage = `Piston API request timed out after ${15000 / 1000} seconds.`;
            console.error("[EXECUTE_CODE] Piston timeout error:", errorMessage);
          } else if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            status = "API Error";
            errorMessage = `Piston API responded with status ${err.response.status}: ${err.response.data?.message || JSON.stringify(err.response.data)}`;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            console.error("[EXECUTE_CODE] Piston HTTP error:", errorMessage, (err.response.data as any));
          } else if (err.request) {
            // The request was made but no response was received
            status = "Service Unreachable";
            errorMessage = `Piston API is unreachable. No response received.`;
            console.error("[EXECUTE_CODE] Piston network error:", errorMessage, (err as Error).message);
          } else {
            // Something happened in setting up the request that triggered an Error
            errorMessage = `Error setting up Piston API request: ${(err as Error).message}`;
            console.error("[EXECUTE_CODE] Piston request setup error:", errorMessage);
          }
        } else if (err instanceof Error) {
          errorMessage = `Unexpected execution error: ${err.message}`;
          console.error("[EXECUTE_CODE] Unexpected execution error:", errorMessage, err);
        } else {
          errorMessage = `An unknown error occurred during execution.`;
          console.error("[EXECUTE_CODE] Unknown error during execution:", err);
        }
        
        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: "",
          status,
          error: errorMessage,
        });
        console.log(`[EXECUTE_CODE] Test Case ${i + 1}: Error result pushed: ${status}`);
      }
    }
  } else if (type === ProblemType.SQL) {
    if (!initialSchema) {
      console.error("[EXECUTE_CODE] Missing initialSchema for SQL problem");
      throw new Error("Missing initialSchema for SQL problem");
    }

    // Combine schema, data, and user query
    // We wrap the user query to ensure we output something visible if they just do UPDATE/INSERT
    // But usually SQL problems ask for a SELECT statement.
    const fullScript = [
      initialSchema,
      initialData || "",
      ".mode column",
      ".headers on",
      code
    ].join("\n");
    console.log(`[EXECUTE_CODE] Processing SQL problem. Full script (stripped): ${fullScript.substring(0, 100)}...`);

    try {
      const startTime = performance.now();
      const requestPayload = {
        language: "sqlite3",
        version: "3.36.0",
        files: [{ content: fullScript }],
        compile_timeout: 10000,
        run_timeout: 5000,
      };
      console.log(`[EXECUTE_CODE] Sending SQL request to Piston API. Payload (stripped content): ${JSON.stringify({...requestPayload, files: [{content: fullScript.substring(0, 50) + '...'}]})}`);

      const response = await axios.post(PISTON_API, requestPayload, { timeout: 15000 }); // Add a 15-second network timeout
      const endTime = performance.now();
      const runtime = Math.ceil(endTime - startTime);
      console.log(`[EXECUTE_CODE] SQL Piston API responded in ${runtime}ms. Status: ${response.status}`);
      console.log(`[EXECUTE_CODE] SQL Raw response data: ${JSON.stringify(response.data)}`);

      const { run } = response.data;
      
      let status: ExecutionResult['status'] = "Accepted";
      let error: string | undefined;

      if (run.code !== 0) {
         status = "Runtime Error";
         error = run.stderr || `Exited with code ${run.code}`;
         console.log(`[EXECUTE_CODE] SQL Runtime Error. Error: ${error}`);
      } else {
          // Compare with expected output if available (simplified for now)
          // For SQL, we usually only have one "Test Case" which is the full execution result
          if (!isOutputGeneration && testCases.length > 0) {
              const actualOutput = (run.stdout || "").trim();
              const expectedOutput = (testCases[0].expectedOutput || "").trim();
              
              if (actualOutput !== expectedOutput) {
                 const cleanActual = actualOutput.replace(/\s+/g, ' ').trim();
                 const cleanExpected = expectedOutput.replace(/\s+/g, ' ').trim();
                 if (cleanActual === cleanExpected) {
                    status = "Accepted";
                    console.log(`[EXECUTE_CODE] SQL Test Case: Accepted (whitespace diff only). Cleaned Actual: "${cleanActual}", Cleaned Expected: "${cleanExpected}"`);
                 } else {
                    status = "Wrong Answer";
                    console.log(`[EXECUTE_CODE] SQL Wrong Answer.`);
                 }
              }
          } else {
            console.log(`[EXECUTE_CODE] SQL Accepted (Output Generation or no test cases).`);
          }
      }

      results.push({
        input: "SQL Execution",
        expected: testCases.length > 0 ? testCases[0].expectedOutput : "",
        actual: run.stdout,
        status,
        error,
        runtime
      });
      console.log(`[EXECUTE_CODE] SQL Result pushed: ${status}`);

    } catch (err: unknown) {
        let errorMessage = "Unknown Error";
        console.error(`[EXECUTE_CODE] SQL Axios Error Caught`);
        if (axios.isAxiosError(err)) {
          if (err.code === 'ECONNABORTED') {
            status = "Time Limit Exceeded";
            errorMessage = `Piston API request timed out after ${15000 / 1000} seconds.`;
            console.error("[EXECUTE_CODE] SQL Piston timeout error:", errorMessage);
          } else {
           errorMessage = err.response?.data?.message || err.message;
           console.error("[EXECUTE_CODE] SQL Axios error:", errorMessage, err.response?.data);
          }
        } else if (err instanceof Error) {
           errorMessage = err.message;
           console.error("[EXECUTE_CODE] SQL Unexpected execution error:", errorMessage, err);
        } else {
           errorMessage = `An unknown error occurred during execution.`;
           console.error("[EXECUTE_CODE] SQL Unknown error during execution:", err);
        }
        results.push({
           input: "SQL Execution",
           expected: "",
           actual: "",
           status: "Runtime Error",
           error: errorMessage
        });
        console.log(`[EXECUTE_CODE] SQL Error result pushed: ${status}`);
    }

  } else {
    console.error(`[EXECUTE_CODE] Unsupported problem type for execution: ${type}`);
    throw new Error(`Unsupported problem type for execution: ${type}`);
  }
  console.log(`[EXECUTE_CODE] Exiting executeCode. Total results: ${results.length}`);
  return results;
}
