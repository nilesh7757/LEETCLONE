export interface TestCaseResult {
  status: string;
  expectedOutput: string | object;
  actualOutput: string | object;
  runtime: number;
}

export interface Submission {
  id: string;
  status: string;
  code: string;
  language: string;
  runtime: number | null;
  memory: number | null;
  createdAt: string | Date;
  testCaseResults?: TestCaseResult[];
}
