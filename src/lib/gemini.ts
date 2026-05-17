import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { logger } from "./logger";
import { prisma } from "./prisma";
import crypto from "crypto";
import { z } from "zod";
import axios from "axios";

// API Keys
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const HF_API_KEY = process.env.HF_API_KEY;

const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const nvidia = NVIDIA_API_KEY ? new OpenAI({
  apiKey: NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
  timeout: 60000,
}) : null;

export class AIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Updated stable model IDs
export const MODELS = [
  "gemini-1.5-flash", 
  "gemini-pro",
];

/**
 * Universal AI Executor - Type-safe with Ultimate Resilience
 */
export async function runAI<T = unknown>(
  prompt: string, 
  systemInstruction?: string, 
  schemaOrJsonMode?: z.ZodSchema<T> | boolean,
  fastMode: boolean = false
): Promise<T | string> {
  const isJsonMode = !!schemaOrJsonMode;
  const schema = schemaOrJsonMode instanceof z.ZodType ? schemaOrJsonMode : null;

  const parseResponse = (text: string) => {
    try {
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON found");
      const clean = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(clean) as T;
    } catch (e) {
        try {
            const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(clean) as T;
        } catch (e2) {
            throw new Error("Mangled JSON response");
        }
    }
  };

  // 1. Try NVIDIA (Llama 3.1 405B)
  if (nvidia && NVIDIA_API_KEY && !fastMode) {
    try {
      const completion = await nvidia.chat.completions.create({
        messages: [
          ...(systemInstruction ? [{ role: "system" as const, content: systemInstruction }] : []),
          { role: "user" as const, content: prompt + "\n\nCRITICAL: Return valid JSON ONLY." },
        ],
        model: "meta/llama-3.1-405b-instruct",
        response_format: isJsonMode ? { type: "json_object" } : undefined,
        temperature: 0.1,
      });

      const content = completion.choices[0]?.message?.content || "";
      if (schema) {
         const parsed = parseResponse(content);
         const validated = schema.safeParse(parsed);
         if (validated.success) return validated.data;
      } else {
         return (isJsonMode ? parseResponse(content) : content) as T | string;
      }
    } catch (error) {}
  }

  // 2. Try Groq (Llama 3.3 70B)
  if (groq && GROQ_API_KEY) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          ...(systemInstruction ? [{ role: "system" as const, content: systemInstruction }] : []),
          { role: "user" as const, content: prompt + "\n\nSTRICT JSON ONLY." },
        ],
        model: "llama-3.3-70b-versatile",
        response_format: isJsonMode ? { type: "json_object" } : undefined,
        temperature: 0.1,
      });

      const content = completion.choices[0]?.message?.content || "";
      if (schema) {
         const parsed = parseResponse(content);
         const validated = schema.safeParse(parsed);
         if (validated.success) return validated.data;
      } else {
         return (isJsonMode ? parseResponse(content) : content) as T | string;
      }
    } catch (error) {}
  }

  // 3. Try Gemini (Using stable gemini-pro if flash fails)
  if (genAI && GEMINI_API_KEY) {
    const geminiModels = ["gemini-1.5-flash", "gemini-pro"];
    
    for (const modelId of geminiModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelId });
          const combinedPrompt = (systemInstruction ? `System: ${systemInstruction}\n\n` : "") + 
                                 `User: ${prompt}\n\nCRITICAL: Return only the JSON object.`;

          const result = await model.generateContent(combinedPrompt);
          const response = await result.response;
          const text = response.text();

          if (isJsonMode) {
            const parsed = parseResponse(text);
            if (schema) {
                const validated = schema.safeParse(parsed);
                if (validated.success) return validated.data;
                return parsed;
            }
            return parsed;
          }
          return text;
        } catch (error: unknown) {
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          logger.error(`[AI_GEMINI_ERROR] ${modelId} failed:`, errorMsg);
          continue; // Try next gemini model
        }
    }
  }

  // 4. HF Fallback
  if (HF_API_KEY) {
      try {
          const hfRes = await axios.post(
              "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-70B-Instruct",
              { 
                inputs: (systemInstruction ? `<|system|>\n${systemInstruction}\n` : "") + `<|user|>\n${prompt}\n\nReturn JSON only.\n<|assistant|>`,
                parameters: { max_new_tokens: 2048, return_full_text: false }
              },
              { headers: { Authorization: `Bearer ${HF_API_KEY}` }, timeout: 30000 }
          );
          const content = hfRes.data[0]?.generated_text || hfRes.data.generated_text || "";
          if (isJsonMode) return parseResponse(content);
          return content;
      } catch (error) {}
  }

  throw new AIError("Intelligence grid offline. Please try again.", 500);
}

// --- Structured Schemas ---
export const AuditSchema = z.object({
  passed: z.boolean().default(true),
  feedback: z.string().default("No feedback provided."),
  timeComplexity: z.string().default("O(N)"),
  spaceComplexity: z.string().default("O(N)"),
  hints: z.array(z.string()).optional(),
});

export const ComplexitySchema = z.object({
  timeComplexity: z.string().default("O(N)"),
  spaceComplexity: z.string().default("O(N)"),
  bottleneck: z.string().optional(),
});

export type AuditAndAnalyzeResult = z.infer<typeof AuditSchema>;

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
    const cached = await prisma.codeCache.findUnique({ where: { hash: cacheKey } });
    if (cached) return cached.result as unknown as AuditAndAnalyzeResult;

    const prompt = `
      Audit this ${language} solution for: "${problemTitle}" in JSON format.
      Code: ${code}
    `;

    const result = await runAI(prompt, "You are a technical reviewer.", AuditSchema);

    prisma.codeCache.create({
      data: { id: crypto.randomUUID(), hash: cacheKey, result: result as object }
    }).catch(e => logger.error("Cache save failed", e));

    return result as AuditAndAnalyzeResult;
  } catch (error) {
    return { 
      passed: true, 
      feedback: "Analysis currently offline.",
      timeComplexity: "N/A",
      spaceComplexity: "N/A"
    };
  }
}

export async function predictComplexity(code: string, language: string): Promise<z.infer<typeof ComplexitySchema>> {
  const prompt = `Predict complexity for this ${language} code in JSON format. Code:\n${code}`;
  try {
    return await runAI(prompt, "Be a fast complexity estimator.", ComplexitySchema) as z.infer<typeof ComplexitySchema>;
  } catch (error) {
    return { timeComplexity: "Calculating...", spaceComplexity: "Calculating..." };
  }
}

export const analyzeCodeComplexity = predictComplexity;

export async function* chatWithAIStream(
  messages: { parts: { text: string }[] }[],
  context: {
    problemTitle: string;
    problemDescription: string;
    code: string;
    language: string;
    isInterviewMode?: boolean;
    testCases?: unknown[];
  }
) {
  const response = await chatWithAI(messages, context);
  yield { text: () => response };
}

export async function evaluateSystemDesign(question: string, answer: string): Promise<{ feedback: string; score: number }> {
  const Schema = z.object({ feedback: z.string(), score: z.number() });
  const prompt = `Evaluate System Design: Q: ${question} A: ${answer}`;
  try {
    return await runAI(prompt, "You are a Staff Engineer.", Schema) as { feedback: string; score: number };
  } catch (error) {
    return { feedback: "Evaluation unavailable.", score: 0 };
  }
}

export async function chatWithAI(
  messages: { parts: { text: string }[] }[],
  context: { 
    problemTitle: string; 
    problemDescription: string; 
    code: string; 
    language: string;
    isInterviewMode?: boolean;
    testCases?: unknown[];
  }
): Promise<string> {
  const systemPrompt = context.isInterviewMode 
    ? `You are an Interviewer. Problem: ${context.problemTitle}.`
    : `You are a Socratic Tutor. Problem: ${context.problemTitle}.`;

  const userPrompt = `Student Code: ${context.code}\n\nStudent: ${messages[messages.length-1]?.parts[0]?.text}`;
  return await runAI(userPrompt, systemPrompt) as string;
}
