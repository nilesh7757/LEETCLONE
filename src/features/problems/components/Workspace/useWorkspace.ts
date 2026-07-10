"use client";

import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import confetti from "canvas-confetti";
import { getStarterCode } from "@/lib/starterCode";
import { Submission } from "@/types/submission";

interface TestCase {
  input: string | object;
  expectedOutput?: string | object;
}

interface Result {
  status: string;
  error?: string;
  actual?: string | object;
  input?: string | object;
  expected?: string | object;
}

interface Problem {
  id: string;
  title: string;
  type: string;
  timeLimit: number;
  memoryLimit: number;
}

export function useWorkspace(problem: Problem, initialExamples: TestCase[]) {
  const { update } = useSession();

  const initialLanguage = problem.type === "SQL" ? "sql" : "javascript";
  const initialCode =
    problem.type === "SQL"
      ? "SELECT * FROM Users;"
      : getStarterCode(initialLanguage);

  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);

  // Persistence: Load last language
  useEffect(() => {
    const lastLang = localStorage.getItem("last_language");
    if (lastLang && problem.type !== "SQL") {
       setLanguage(lastLang);
    }
  }, [problem.type]);

  // Persistence: Save last language
  useEffect(() => {
    if (problem.type !== "SQL") {
       localStorage.setItem("last_language", language);
    }
  }, [language, problem.type]);

  const [localTestCases, setLocalTestCases] =
    useState<TestCase[]>(initialExamples);
  const [results, setResults] = useState<Result[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [activeTab, setActiveTab] = useState<
    "description" | "resources" | "submissions" | "solutions" | "ai"
  >("description");
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [consoleTab, setConsoleTab] = useState<"testcase" | "result">(
    "testcase",
  );
  const [activeTestCaseId, setActiveTestCaseId] = useState(0);
  const [streak, setStreak] = useState(0);
  const [solvedToday, setSolvedToday] = useState(false);

  const fetchStreak = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/profile/streak");
      setStreak(data.streak);
      setSolvedToday(data.solvedToday);
    } catch (err) {
      console.error("Failed to fetch streak", err);
    }
  }, []);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  // Sync with localStorage
  useEffect(() => {
    const draftKey = `draft_${problem.id}_${language}`;
    const saved = localStorage.getItem(draftKey);
    if (saved) setCode(saved);
    else
      setCode(
        problem.type === "SQL"
          ? "SELECT * FROM Users;"
          : getStarterCode(language),
      );
  }, [language, problem.id, problem.type]);

  useEffect(() => {
    const draftKey = `draft_${problem.id}_${language}`;
    const defaultCode =
      problem.type === "SQL"
        ? "SELECT * FROM Users;"
        : getStarterCode(language);
    if (code !== defaultCode) localStorage.setItem(draftKey, code);
  }, [code, language, problem.id, problem.type]);

  const fetchSubmissions = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `/api/submission?problemId=${problem.id}`,
      );
      setSubmissions(data.submissions);
    } catch (err) {
      console.error("Failed to fetch submissions", err);
    }
  }, [problem.id]);

  const handleRun = async (parseAndSetMarkers: (msg: string) => void) => {
    setIsRunning(true);
    setConsoleOpen(true);
    setConsoleTab("result");
    setResults(null);

    try {
      const sanitizedTestCases = localTestCases.map((tc) => ({
        input:
          typeof tc.input === "object"
            ? JSON.stringify(tc.input)
            : String(tc.input),
        expectedOutput:
          typeof tc.expectedOutput === "object"
            ? JSON.stringify(tc.expectedOutput)
            : String(tc.expectedOutput || ""),
      }));

      const { data } = await axios.post("/api/run", {
        problemId: problem.id,
        code,
        type: problem.type,
        language,
        testCases: sanitizedTestCases,
      }, {
        timeout: 15000 // Prevent UI freezing if API hangs
      });

      setResults(data.results);

      // EXTRACT ERROR FOR MARKERS
      const errorResult = data.results.find(
        (r: Result) =>
          r.status === "Compilation Error" ||
          r.status === "Runtime Error" ||
          r.error,
      );
      
      if (errorResult && errorResult.error) {
        parseAndSetMarkers(errorResult.error);
      }

      if (data.results.some((r: Result) => r.status !== "Accepted")) {
        toast.error("Execution failed.");
      } else {
        toast.success("Finished");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMsg = err.code === "ECONNABORTED" 
          ? "Request timed out. Please try again."
          : (err.response?.data?.error || err.message);
        toast.error("Execution Error: " + errorMsg);
      } else {
        toast.error("Execution Error");
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data } = await axios.post("/api/submission", {
        problemId: problem.id,
        code,
        type: problem.type,
        language,
      }, {
        timeout: 20000 // Prevent UI freezing if submission hangs
      });

      // Always fetch latest submissions list to show the new run
      await fetchSubmissions();

      if (data.submission.status === "Accepted") {
        toast.success("Accepted! 🎉");
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#22c55e", "#3b82f6", "#eab308", "#ef4444"],
        });
        if (data.newStreak) update({ streak: data.newStreak });
        setActiveTab("submissions");
        setSelectedSubmission(data.submission);
      } else {
        toast.error(data.submission.status || "Wrong Answer");
        setConsoleOpen(true);
        setConsoleTab("result");
        setActiveTestCaseId(0);
        setActiveTab("submissions");
        setSelectedSubmission(data.submission);
        if (data.failedTestCase) {
          setResults([
            {
              status: data.submission.status || "Wrong Answer",
              input: data.failedTestCase.input,
              actual: data.failedTestCase.output,
              expected: data.failedTestCase.expected,
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Submission failed", err);
      toast.error("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTestCase = () => {
    const newCases = [...localTestCases, { input: "", expectedOutput: "" }];
    setLocalTestCases(newCases);
    setActiveTestCaseId(newCases.length - 1);
  };

  const updateTestCase = (
    index: number,
    field: "input" | "expectedOutput",
    value: string,
  ) => {
    const newCases = [...localTestCases];
    newCases[index] = { ...newCases[index], [field]: value };
    setLocalTestCases(newCases);
  };

  const removeTestCase = (index: number) => {
    const newCases = localTestCases.filter((_, idx) => idx !== index);
    setLocalTestCases(newCases);
    if (activeTestCaseId >= newCases.length) {
      setActiveTestCaseId(Math.max(0, newCases.length - 1));
    }
  };

  return {
    code,
    setCode,
    language,
    setLanguage,
    localTestCases,
    setLocalTestCases,
    results,
    setResults,
    isRunning,
    setIsRunning,
    isSubmitting,
    setIsSubmitting,
    submissions,
    setSubmissions,
    selectedSubmission,
    setSelectedSubmission,
    activeTab,
    setActiveTab,
    consoleOpen,
    setConsoleOpen,
    consoleTab,
    setConsoleTab,
    activeTestCaseId,
    setActiveTestCaseId,
    handleRun,
    handleSubmit,
    handleAddTestCase,
    updateTestCase,
    removeTestCase,
    fetchSubmissions,
    streak,
    solvedToday,
    resetCode: useCallback(() => {
      const draftKey = `draft_${problem.id}_${language}`;
      localStorage.removeItem(draftKey);
      const defaultCode =
        problem.type === "SQL"
          ? "SELECT * FROM Users;"
          : getStarterCode(language);
      setCode(defaultCode);
      toast.success("Code reset to starter template");
    }, [problem.id, problem.type, language]),
  };
}
