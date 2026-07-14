"use client";

export interface LocalTestCase {
  input: string;
  expectedOutput: string;
}

export interface LocalExecutionResult {
  status: string;
  error?: string;
  actual?: string;
  input?: string;
  expected?: string;
}

export async function executeJavaScriptLocally(
  code: string,
  testCases: LocalTestCase[]
): Promise<LocalExecutionResult[]> {
  const runSingleTestCase = (tc: LocalTestCase): Promise<LocalExecutionResult> => {
    return new Promise((resolve) => {
      const workerCode = `
        self.onmessage = function(e) {
          const { code, stdin } = e.data;
          
          const stdoutLines = [];
          
          const console = {
            log: (...args) => {
              stdoutLines.push(args.map(x => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(' '));
            },
            error: (...args) => {
              stdoutLines.push("[ERROR] " + args.join(' '));
            },
            warn: (...args) => {
              stdoutLines.push("[WARN] " + args.join(' '));
            },
            info: (...args) => {
              stdoutLines.push("[INFO] " + args.join(' '));
            }
          };

          const require = (module) => {
            if (module === 'fs') {
              return {
                readFileSync: (fd, encoding) => {
                  return stdin;
                }
              };
            }
            throw new Error("Module not found: " + module);
          };

          const process = {
            exit: (code) => {
              throw new Error("Process exited with code " + code);
            },
            stdout: {
              write: (str) => {
                stdoutLines.push(str);
              }
            }
          };

          try {
            const runCode = new Function('console', 'require', 'process', 'stdin', code);
            runCode(console, require, process, stdin);
            
            self.postMessage({
              status: "success",
              actual: stdoutLines.join('\\n').trim()
            });
          } catch (err) {
            self.postMessage({
              status: "error",
              error: err.stack || err.message || String(err)
            });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      const workerUrl = URL.createObjectURL(blob);
      let worker: Worker | null = null;
      
      try {
        worker = new Worker(workerUrl);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        URL.revokeObjectURL(workerUrl);
        resolve({
          status: "Runtime Error",
          error: "Failed to initialize Web Worker: " + errorMsg,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: ""
        });
        return;
      }

      const timeoutId = setTimeout(() => {
        if (worker) {
          worker.terminate();
        }
        URL.revokeObjectURL(workerUrl);
        resolve({
          status: "Time Limit Exceeded",
          error: "Time Limit Exceeded (2000ms)",
          input: tc.input,
          expected: tc.expectedOutput,
          actual: ""
        });
      }, 2000);

      worker.onmessage = (e) => {
        clearTimeout(timeoutId);
        if (worker) {
          worker.terminate();
        }
        URL.revokeObjectURL(workerUrl);

        const { status: workerStatus, actual, error } = e.data;

        if (workerStatus === "error") {
          resolve({
            status: "Runtime Error",
            error: error,
            input: tc.input,
            expected: tc.expectedOutput,
            actual: ""
          });
        } else {
          const trimOutput = (str: string) => {
            return (str || "").trim().replace(/\\r\\n/g, "\\n").split("\\n").map(line => line.trimEnd()).join("\\n").trim();
          };
          const actualTrimmed = trimOutput(actual);
          const expectedTrimmed = trimOutput(tc.expectedOutput);
          const isCorrect = actualTrimmed === expectedTrimmed;

          resolve({
            status: isCorrect ? "Accepted" : "Wrong Answer",
            input: tc.input,
            expected: tc.expectedOutput,
            actual: actual
          });
        }
      };

      worker.onerror = (err) => {
        clearTimeout(timeoutId);
        if (worker) {
          worker.terminate();
        }
        URL.revokeObjectURL(workerUrl);
        resolve({
          status: "Runtime Error",
          error: err.message,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: ""
        });
      };

      worker.postMessage({ code, stdin: tc.input });
    });
  };

  const results: LocalExecutionResult[] = [];
  for (const tc of testCases) {
    const res = await runSingleTestCase(tc);
    results.push(res);
  }
  return results;
}
