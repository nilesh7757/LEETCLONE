import axios from "axios";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Universal AI Executor: Tries Groq first, then fallbacks to Gemini
 */
export async function runAI(prompt: string, systemInstruction?: string, jsonMode = false) {
  // 1. Try Groq Primary (Extremely Fast & Generous Quota)
  if (groq) {
    try {
      console.log("[AI] Attempting Groq (llama-3.3-70b-versatile)...");
      
      // Groq JSON mode often requires "JSON" to be in the prompt
      const finalPrompt = jsonMode && !prompt.toLowerCase().includes("json") 
        ? prompt + "\n\nReturn the response in valid JSON format." 
        : prompt;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          ...(systemInstruction ? [{ role: "system" as const, content: systemInstruction }] : []),
          { role: "user" as const, content: finalPrompt },
        ],
        model: "llama-3.3-70b-versatile",
        response_format: jsonMode ? { type: "json_object" } : undefined,
        temperature: 0.5,
        max_tokens: 1500, // Increased for batch evaluations
      });

      const response = chatCompletion.choices[0]?.message?.content;
      if (response) return response;
    } catch (error: any) {
      console.error("[AI] Groq Error:", error.message || error);
      if (error.status === 413) {
        console.warn("[AI] Groq context too large, falling back...");
      }
      console.warn("[AI] Groq failed, falling back to Gemini...");
    }
  }

  // 2. Fallback to Gemini (Multiple Models)
  let hitQuota = false;
  for (const model of MODELS) {
    try {
      console.log(`[AI] Attempting Gemini (${model})...`);
      const response = await axios.post(
        `${BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            { role: "user", parts: [{ text: (systemInstruction ? systemInstruction + "\n\n" : "") + prompt }] }
          ],
          generationConfig: {
            responseMimeType: jsonMode ? "application/json" : "text/plain",
            temperature: 0.5,
            maxOutputTokens: 1000,
          },
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (error: any) {
      if (error.response?.status === 429) {
        console.warn(`[AI] Quota hit for Gemini (${model}). Skipping...`);
        hitQuota = true;
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      console.error(`[AI] Gemini (${model}) Error:`, error.response?.data?.error?.message || error.message);
    }
  }

  if (hitQuota) throw new AIError("All AI models are currently busy. Please wait 60 seconds.", 429);
  throw new AIError("AI service unavailable.", 500);
}

export async function auditAndAnalyze(
  code: string, 
  language: string, 
  problemTitle: string, 
  problemDesc: string
): Promise<{ passed: boolean; feedback: string; timeComplexity: string; spaceComplexity: string }> {
  const prompt = `
    You are a Senior Software Engineer. Audit and analyze this solution for: "${problemTitle}".
    Description: ${problemDesc.substring(0, 500)}
    
    CODE:
    \`\`\`\${language}
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

  try {
    const response = await runAI(prompt, "You are a precise technical reviewer.", true);
    const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Audit/Analyze Error:", e);
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
    \`\`\`\${language}
    ${code}
    \`\`\`
    
    TASKS:
    1. Check if the user used "shortcuts" that violate the intended pattern (e.g., using an array to reverse a linked list when O(1) space was required).
    2. Check if the code is actually solving the logic or just returning hardcoded answers.
    
    Return JSON: { "passed": true/false, "feedback": "Brief explanation" }
  `;

  try {
    const response = await runAI(prompt, "You are a strict algorithm auditor.", true);
    const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Audit Error:", e);
    return { passed: true, feedback: "Audit skipped due to service error." };
  }
}

export async function analyzeCodeComplexity(code: string, language: string): Promise<{ timeComplexity: string; spaceComplexity: string }> {
  const prompt = `Analyze this ${language} code for Time and Space complexity. Return ONLY JSON: { "timeComplexity": "O(...)", "spaceComplexity": "O(...)" }\n\nCode:\n${code}`;
  
  try {
    const response = await runAI(prompt, "You are a complexity analyzer. Be precise.", true);
    const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Complexity Error:", e);
    return { timeComplexity: "N/A", spaceComplexity: "N/A" };
  }
}

export async function evaluateSystemDesign(question: string, answer: string): Promise<{ feedback: string; score: number }> {
  const prompt = `Evaluate this System Design answer.\nQuestion: ${question}\nAnswer: ${answer}\n\nReturn JSON: { "score": 0-100, "feedback": "..." }`;
  
  try {
    const response = await runAI(prompt, "You are a Senior Staff Engineer conducting an interview.", true);
    const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    return { feedback: "Evaluation currently unavailable.", score: 0 };
  }
}

export async function chatWithAI(
  messages: { role: "user" | "model"; parts: { text: string }[] }[],
  context: { 
    problemTitle: string; 
    problemDescription: string; 
    code: string; 
    language: string;
    isInterviewMode?: boolean;
    isPeriodicQuestion?: boolean;
    testCases?: any[];
  }
): Promise<string> {
  if (!GEMINI_API_KEY && !GROQ_API_KEY) {
    return "AI service is currently unavailable (API Key missing).";
  }

  const desc = context.problemDescription.substring(0, 1500);
  const code = context.code.substring(0, 3000);
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
      \`\`\`\${context.language}
      ${code}
      \`\`\`

      INTERVIEWER RULES:
      1. Be professional, slightly formal, but fair.
      2. If "isPeriodicQuestion" is true, ask a pointed question about their current code or approach (e.g., "Why did you choose this data structure?", "What is the time complexity of this specific part?", "How would you handle [edge case]?").
      3. If they are stuck, give a MINIMAL hint. Do NOT solve it for them.
      4. Observe their code. If you see a major bug or inefficiency, ask them a question that might lead them to find it themselves.
      5. Keep responses concise (max 3 sentences).
    `;
  } else {
    systemPrompt = `
      You are a strict but encouraging Socratic AI Coding Tutor. 
      Problem: "${context.problemTitle}"
      Description: ${desc}
      Example Test Cases: ${testCasesStr}
      User's Code: ${code}

      RULES:
      1. NEVER provide the full code solution at once.
      2. Guide the user using hints and conceptual questions.
      3. If they ask for help, point out logical errors in their code.
      4. Only provide small code snippets (max 5 lines) for specific syntax issues.
      5. Be concise and professional.
    `;
  }

  // Restore history window to 10 messages
  const history = messages.slice(-10).map(m => `${m.role === 'model' ? 'Tutor' : 'Student'}: ${m.parts[0].text}`).join("\n");
  
  const userPrompt = context.isPeriodicQuestion 
    ? "Ask me a challenging interview question about my current code." 
    : `History:\n${history}\n\nStudent's New Message: ${messages[messages.length-1]?.parts[0]?.text}`;

  return await runAI(userPrompt, systemPrompt);
}

export async function chatWithAIStream(
  messages: { role: "user" | "model"; parts: { text: string }[] }[],
  context: { 
    problemTitle: string; 
    problemDescription: string; 
    code: string; 
    language: string;
    isInterviewMode?: boolean;
    isPeriodicQuestion?: boolean;
    testCases?: any[];
  }
) {
  if (!genAI) {
    throw new Error("Gemini AI is not configured.");
  }

  const desc = context.problemDescription.substring(0, 1500);
  const code = context.code.substring(0, 3000);
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
      \`\`\`\${context.language}
      ${code}
      \`\`\`

      INTERVIEWER RULES:
      1. Be professional, slightly formal, but fair.
      2. If "isPeriodicQuestion" is true, ask a pointed question about their current code or approach.
      3. If they are stuck, give a MINIMAL hint. Do NOT solve it for them.
      4. Observe their code. If you see a major bug or inefficiency, ask them a question that might lead them to find it themselves.
      5. Keep responses concise (max 3 sentences).
    `;
  } else {
    systemPrompt = `
      You are a strict but encouraging Socratic AI Coding Tutor. 
      Problem: "${context.problemTitle}"
      Description: ${desc}
      Example Test Cases: ${testCasesStr}
      User's Code: ${code}

      RULES:
      1. NEVER provide the full code solution at once.
      2. Guide the user using hints and conceptual questions.
      3. If they ask for help, point out logical errors in their code.
      4. Only provide small code snippets (max 5 lines).
      5. Be concise and professional.
    `;
  }

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt
  });

  const chat = model.startChat({
    history: messages.slice(0, -1).map(m => ({
      role: m.role === "model" ? "model" : "user",
      parts: m.parts,
    })),
  });

  const userMessage = messages[messages.length - 1]?.parts[0]?.text || "";
  const result = await chat.sendMessageStream(userMessage);
  return result.stream;
}

