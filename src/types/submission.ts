export interface TestCaseResult {
  status: string;
  expectedOutput?: string | object;
  actualOutput?: string | object;
  expected?: string | object;
  actual?: string | object;
  input?: string;
  error?: string;
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
