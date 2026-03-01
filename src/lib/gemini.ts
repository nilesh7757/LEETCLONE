import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "./logger";
import { prisma } from "./prisma";
import crypto from "crypto";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export class AIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Fallback Gemini models
export const MODELS = [
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-pro",
];

/**
 * Universal AI Executor: Tries Groq first, then fallbacks to Gemini
 */
export async function runAI(prompt: string, systemInstruction?: string, jsonMode = false): Promise<string> {
  if (!GROQ_API_KEY && !GEMINI_API_KEY) {
    throw new AIError("No AI API Keys configured.", 500);
  }

  // 1. Try Groq (Llama 3 70B is very fast and capable)
  if (groq && GROQ_API_KEY) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          ...(systemInstruction ? [{ role: "system" as const, content: systemInstruction }] : []),
          { role: "user" as const, content: prompt },
        ],
        model: "llama-3.3-70b-versatile",
        response_format: jsonMode ? { type: "json_object" } : undefined,
        temperature: 0.2,
      });

      return completion.choices[0]?.message?.content || "";
    } catch (error) {
      logger.error("[AI_GROQ_ERROR] Groq failed, falling back to Gemini:", error instanceof Error ? error.message : String(error));
    }
  }

  // 2. Fallback to Gemini
  if (genAI && GEMINI_API_KEY) {
    try {
      // Use the first available model from our list
      const modelName = MODELS[0];
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: systemInstruction,
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error("[AI_GEMINI_ERROR] Gemini also failed:", error instanceof Error ? error.message : String(error));
      throw new AIError("AI Service unavailable. Both Groq and Gemini failed.", 503);
    }
  }

  throw new AIError("AI Configuration error.", 500);
}

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface GenerativeMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface AuditAndAnalyzeResult {
    passed: boolean;
    feedback: string;
    timeComplexity: string;
    spaceComplexity: string;
}

/**
 * Helper to generate a unique hash for code-related tasks to use in caching
 */
function generateHash(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function auditAndAnalyze(
  code: string, 
  language: string, 
  problemTitle: string, 
  problemDesc: string
): Promise<AuditAndAnalyzeResult> {
  const cacheKey = generateHash(`${problemTitle}:${language}:${code}`);

  try {
    const cached = await prisma.codeCache.findUnique({
      where: { hash: cacheKey }
    });

    if (cached) {
      logger.info(`[AI_CACHE] Cache hit for key: ${cacheKey.substring(0, 8)}...`);
      return cached.result as unknown as AuditAndAnalyzeResult;
    }

    const prompt = `
      You are a Senior Software Engineer. Audit and analyze this solution for: "${problemTitle}".
      Description: ${problemDesc.substring(0, 500)}
      
      CODE:
      \`\`\`${language}
      ${code}
      \`\`\`
      
      TASKS:
      1. Audit: Check for logic shortcuts or hardcoded answers.
      2. Complexity: Determine Time and Space complexity (O(...) format).
      
      Return ONLY JSON: 
      { 
        "passed": true/false, 
        "feedback": "Audit feedback", 
        "timeComplexity": "O(...)", 
        "spaceComplexity": "O(...)" 
      }
    `;

    const response = await runAI(prompt, "You are a precise technical reviewer.", true);
    const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanJson) as AuditAndAnalyzeResult;

    // 2. Save to Cache (Background)
    prisma.codeCache.create({
      data: {
        id: crypto.randomUUID(),
        hash: cacheKey,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result: result as unknown as any // JSON fields in Prisma need specialized handling, any is common here but casting to unknown first is safer
      }
    }).catch(err => logger.error("[AI_CACHE] Failed to save cache:", err));

    return result;
  } catch (error) {
    logger.error("Audit/Analyze Error:", error);
    return { 
      passed: true, 
      feedback: "Analysis partially skipped due to service error.",
      timeComplexity: "N/A",
      spaceComplexity: "N/A"
    };
  }
}

export async function auditSolution(
  code: string, 
  language: string, 
  problemTitle: string, 
  problemDesc: string
): Promise<{ passed: boolean; feedback: string }> {
  const prompt = `
    You are a code reviewer. Audit the following solution for the problem: "${problemTitle}".
    Description: ${problemDesc.substring(0, 500)}
    
    CODE:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    TASKS:
    1. Check if the user used "shortcuts" that violate the intended pattern.
    2. Check if the code is actually solving the logic or just returning hardcoded answers.
    
    Return JSON: { "passed": true/false, "feedback": "Brief explanation" }
  `;

  try {
    const response = await runAI(prompt, "You are a strict algorithm auditor.", true);
    const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    logger.error("Audit Error:", error);
    return { passed: true, feedback: "Audit skipped due to service error." };
  }
}

export async function analyzeCodeComplexity(code: string, language: string): Promise<{ timeComplexity: string; spaceComplexity: string }> {
  const prompt = `Analyze this ${language} code for Time and Space complexity. Return ONLY JSON: { "timeComplexity": "O(...)", "spaceComplexity": "O(...)" }\n\nCode:\n${code}`;
  
  try {
    const response = await runAI(prompt, "You are a complexity analyzer. Be precise.", true);
    const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    logger.error("Complexity Error:", error);
    return { timeComplexity: "N/A", spaceComplexity: "N/A" };
  }
}

export async function evaluateSystemDesign(question: string, answer: string): Promise<{ feedback: string; score: number }> {
  const prompt = `Evaluate this System Design answer.\nQuestion: ${question}\nAnswer: ${answer}\n\nReturn JSON: { "score": 0-100, "feedback": "..." }`;
  
  try {
    const response = await runAI(prompt, "You are a Senior Staff Engineer conducting an interview.", true);
    const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    logger.error("System Design Evaluation Error:", error);
    return { feedback: "Evaluation currently unavailable.", score: 0 };
  }
}

export async function chatWithAI(
  messages: GenerativeMessage[],
  context: { 
    problemTitle: string; 
    problemDescription: string; 
    code: string; 
    language: string;
    isInterviewMode?: boolean;
    isPeriodicQuestion?: boolean;
    testCases?: TestCase[];
  }
): Promise<string> {
  if (!GEMINI_API_KEY && !GROQ_API_KEY) {
    return "AI service is currently unavailable (API Key missing).";
  }

  const desc = context.problemDescription.substring(0, 1500);
  const userCode = context.code.substring(0, 3000);
  const testCasesStr = context.testCases && context.testCases.length > 0 
    ? JSON.stringify(context.testCases.map(tc => ({ input: tc.input, expected: tc.expectedOutput })), null, 2)
    : "No test cases provided.";

  let systemPrompt = "";

  if (context.isInterviewMode) {
    systemPrompt = `
      You are a Senior Technical Interviewer at a top tech company (like Google or Meta).
      You are conducting a live technical interview for the problem: "${context.problemTitle}".
      
      Problem Description: ${desc}
      Example Test Cases: ${testCasesStr}

      User's Current Code:
      \`\`\`${context.language}
      ${userCode}
      \`\`\`

      INTERVIEWER RULES:
      1. Be professional, slightly formal, but fair.
      2. If "isPeriodicQuestion" is true, ask a pointed question about their current code or approach.
      3. If they are stuck, give a MINIMAL hint. Do NOT solve it for them.
      4. Observe their code. If you see a major bug, ask a leading question.
      5. Keep responses concise (max 3 sentences).
    `;
  } else {
    systemPrompt = `
      You are a strict but encouraging Socratic AI Coding Tutor. 
      Problem: "${context.problemTitle}"
      Description: ${desc}
      Example Test Cases: ${testCasesStr}
      User's Code: ${userCode}

      RULES:
      1. NEVER provide the full code solution at once.
      2. Guide the user using hints and conceptual questions.
      3. Point out logical errors.
      4. Only provide small code snippets (max 5 lines).
      5. Be concise and professional.
    `;
  }

  const historyText = messages.slice(-20).map(m => `${m.role === 'model' ? 'Tutor' : 'Student'}: ${m.parts[0].text}`).join("\n");
  
  const userPrompt = context.isPeriodicQuestion 
    ? "Ask me a challenging interview question about my current code." 
    : `History:\n${historyText}\n\nStudent's New Message: ${messages[messages.length-1]?.parts[0]?.text}`;

  return await runAI(userPrompt, systemPrompt);
}

export async function chatWithAIStream(
  messages: GenerativeMessage[],
  context: { 
    problemTitle: string; 
    problemDescription: string; 
    code: string; 
    language: string;
    isInterviewMode?: boolean;
    isPeriodicQuestion?: boolean;
    testCases?: TestCase[];
  }
) {
  if (!genAI) {
    throw new Error("Gemini AI is not configured.");
  }

  const desc = context.problemDescription.substring(0, 1500);
  const userCode = context.code.substring(0, 3000);
  const testCasesStr = context.testCases && context.testCases.length > 0 
    ? JSON.stringify(context.testCases.map(tc => ({ input: tc.input, expected: tc.expectedOutput })), null, 2)
    : "No test cases provided.";

  let systemPrompt = "";

  if (context.isInterviewMode) {
    systemPrompt = `
      You are a Senior Technical Interviewer for: "${context.problemTitle}".
      Problem Description: ${desc}
      Example Test Cases: ${testCasesStr}
      User's Current Code:
      \`\`\`${context.language}
      ${userCode}
      \`\`\`
      INTERVIEWER RULES: Be professional. If periodic, ask a question. If stuck, minimal hint. Max 3 sentences.
    `;
  } else {
    systemPrompt = `
      You are a Socratic AI Coding Tutor for: "${context.problemTitle}".
      Description: ${desc}
      User's Code: ${userCode}
      RULES: No full solutions. Use hints. Point out errors. snippets max 5 lines.
    `;
  }

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt
  });

  const history: GenerativeMessage[] = [];
  let lastRole = "";

  for (const m of messages.slice(0, -1)) {
    const role = m.role === "model" ? "model" : "user";
    if (role === lastRole) continue;
    if (history.length === 0 && role !== "user") continue;

    history.push({
      role: role,
      parts: m.parts,
    });
    lastRole = role;
  }

  const chat = model.startChat({
    history: history,
  });

  const userMessage = messages[messages.length - 1]?.parts[0]?.text || "Hello";
  const result = await chat.sendMessageStream(userMessage);
  return result.stream;
}
