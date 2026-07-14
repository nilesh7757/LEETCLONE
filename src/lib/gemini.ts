import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { logger } from "./logger";
import { prisma } from "./prisma";
import crypto from "crypto";
import { z } from "zod";
import axios from "axios";

// API Keys getter to allow for dynamic environment changes (useful for testing)
const getKeys = () => ({
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
  HF_API_KEY: process.env.HF_API_KEY,
});

let groq: Groq | null = null;
let genAI: GoogleGenerativeAI | null = null;
let nvidia: OpenAI | null = null;

function initClients() {
  const keys = getKeys();
  if (!groq && keys.GROQ_API_KEY) groq = new Groq({ apiKey: keys.GROQ_API_KEY });
  if (!genAI && keys.GEMINI_API_KEY) genAI = new GoogleGenerativeAI(keys.GEMINI_API_KEY);
  if (!nvidia && keys.NVIDIA_API_KEY) nvidia = new OpenAI({
    apiKey: keys.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
    timeout: 60000,
  });
}

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

interface ZodInternalDef {
  description?: string;
  innerType?: z.ZodTypeAny;
  schema?: z.ZodTypeAny;
  in?: z.ZodTypeAny;
  options?: z.ZodTypeAny[];
  values?: string[];
}

function getZodTypeDescription(field: z.ZodTypeAny, depth: number = 0): string {
  const indent = "  ".repeat(depth);
  
  let current = field;
  let desc = field.description || "";
  while (current && current._def) {
    const def = current._def as unknown as ZodInternalDef;
    if (def.description && !desc) desc = def.description;
    
    const constructorName = current.constructor.name;
    if (
      constructorName === "ZodDefault" || 
      constructorName === "ZodOptional" || 
      constructorName === "ZodNullable"
    ) {
      if (def.innerType) current = def.innerType;
      else break;
    } else if (constructorName === "ZodEffects") {
      if (def.schema) current = def.schema;
      else break;
    } else if (constructorName === "ZodPipe") {
      if (def.in) current = def.in;
      else break;
    } else {
      break;
    }
  }

  if (current instanceof z.ZodObject) {
    const shape = current.shape;
    const lines: string[] = [];
    for (const key of Object.keys(shape)) {
      const valueType = getZodTypeDescription(shape[key] as z.ZodTypeAny, depth + 1);
      lines.push(`${indent}  "${key}": ${valueType}`);
    }
    return `{\n${lines.join(",\n")}\n${indent}}`;
  }

  if (current instanceof z.ZodArray) {
    const elementType = current.element;
    const elementDesc = getZodTypeDescription(elementType as z.ZodTypeAny, depth);
    return `Array of ${elementDesc}`;
  }

  if (current instanceof z.ZodString) {
    return `string${desc ? ` (${desc})` : ""}`;
  }
  if (current instanceof z.ZodNumber) {
    return `number${desc ? ` (${desc})` : ""}`;
  }
  if (current instanceof z.ZodBoolean) {
    return `boolean${desc ? ` (${desc})` : ""}`;
  }
  if (current instanceof z.ZodUnion) {
    const def = current._def as unknown as ZodInternalDef;
    const options = (def.options || []).map((o: z.ZodTypeAny) => getZodTypeDescription(o, depth));
    return `(${options.join(" | ")})${desc ? ` (${desc})` : ""}`;
  }
  if (current instanceof z.ZodEnum) {
    const def = current._def as unknown as ZodInternalDef;
    return `enum [${(def.values || []).map((v: string) => `"${v}"`).join(", ")}]${desc ? ` (${desc})` : ""}`;
  }
  
  return `${current?.constructor?.name?.replace("Zod", "").toLowerCase() || "any"}${desc ? ` (${desc})` : ""}`;
}

function getZodSchemaInstructions(schema: z.ZodTypeAny): string {
  if (schema instanceof z.ZodObject) {
    return `\n\nCRITICAL: Your output must be a single JSON object conforming exactly to this structure (do NOT include extra fields or markdown formatting unless wrapping in standard json block):\n${getZodTypeDescription(schema, 0)}`;
  }
  return "";
}

/**
 * Universal AI Executor - Type-safe with Ultimate Resilience
 */
export async function runAI<T = unknown>(
  prompt: string, 
  systemInstruction?: string, 
  schemaOrJsonMode?: z.ZodSchema<T> | boolean,
  fastMode: boolean = false
): Promise<T | string> {
  initClients();
  const keys = getKeys();
  const isJsonMode = !!schemaOrJsonMode;
  const schema = schemaOrJsonMode instanceof z.ZodType ? schemaOrJsonMode : null;

  if (!keys.GEMINI_API_KEY && !keys.GROQ_API_KEY && !keys.NVIDIA_API_KEY && !keys.HF_API_KEY) {
    throw new AIError("No AI API Keys configured.", 500);
  }

  let enhancedPrompt = prompt;
  if (schema) {
    enhancedPrompt += getZodSchemaInstructions(schema as z.ZodTypeAny);
  }

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

  // 1. Try NVIDIA (Llama 3.3 70B)
  if (nvidia && keys.NVIDIA_API_KEY && !fastMode) {
    try {
      const completion = await nvidia.chat.completions.create({
        messages: [
          ...(systemInstruction ? [{ role: "system" as const, content: systemInstruction }] : []),
          { role: "user" as const, content: enhancedPrompt + (isJsonMode ? "\n\nCRITICAL: Return valid JSON ONLY." : "") },
        ],
        model: "meta/llama-3.3-70b-instruct",
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
    } catch (error) {
      logger.error("[AI_NVIDIA_ERROR]", error);
    }
  }

  // 2. Try Groq (Llama 3.3 70B)
  if (groq && keys.GROQ_API_KEY) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          ...(systemInstruction ? [{ role: "system" as const, content: systemInstruction }] : []),
          { role: "user" as const, content: enhancedPrompt + (isJsonMode ? "\n\nSTRICT JSON ONLY." : "") },
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
    } catch (error) {
      logger.error("[AI_GROQ_ERROR]", error);
    }
  }

  // 3. Try Gemini (Using stable gemini-pro if flash fails)
  if (genAI && keys.GEMINI_API_KEY) {
    const geminiModels = ["gemini-1.5-flash", "gemini-pro"];
    
    for (const modelId of geminiModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelId });
          const combinedPrompt = (systemInstruction ? `System: ${systemInstruction}\n\n` : "") + 
                                 `User: ${enhancedPrompt}` + (isJsonMode ? `\n\nCRITICAL: Return only the JSON object.` : "");

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
  if (keys.HF_API_KEY) {
      try {
          const hfRes = await axios.post(
              "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-70B-Instruct",
              { 
                inputs: (systemInstruction ? `<|system|>\n${systemInstruction}\n` : "") + `<|user|>\n${enhancedPrompt}` + (isJsonMode ? "\n\nReturn JSON only." : "") + "\n<|assistant|>",
                parameters: { max_new_tokens: 2048, return_full_text: false }
              },
              { headers: { Authorization: `Bearer ${keys.HF_API_KEY}` }, timeout: 30000 }
          );
          const content = hfRes.data[0]?.generated_text || hfRes.data.generated_text || "";
          if (isJsonMode) return parseResponse(content);
          return content;
      } catch (error) {
        logger.error("[AI_HF_ERROR]", error);
      }
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
  const prompt = `
    Analyze the following ${language} code and determine its exact Time Complexity and Space Complexity.
    
    Code:
    ${code}
    
    Instructions:
    1. Identify all loops, nested loops, recursive calls, and library functions.
    2. Trace how the input size (typically N) affects the runtime.
    3. Calculate the tightest Big-O bounds. Be precise (e.g., O(1), O(log N), O(N), O(N log N), O(N^2), O(2^N)).
    4. Estimate the auxiliary and total space complexity, including recursion call stacks or dynamic allocations.
    5. Pinpoint any complexity bottleneck in the code. Do not write or include any optimized code or solution snippets in your bottleneck description.
  `.trim();

  const systemInstruction = `
    You are an expert static analyzer and algorithms specialist.
    Analyze the provided code carefully and output its Big-O time complexity, space complexity, and specific bottleneck.
    Do not default to O(N) unless the code is strictly linear. Trace nested loops (O(N^2) or O(N log N) if binary search / sorting is present) and logarithmic processes (O(log N)) carefully.
    CRITICAL: In your bottleneck description, you must NOT provide any optimized code or rewrite the user's code. Only point out the exact lines, loops, or recursion causing the suboptimal complexity.
  `.trim();

  try {
    return await runAI(prompt, systemInstruction, ComplexitySchema) as z.infer<typeof ComplexitySchema>;
  } catch (error) {
    return { timeComplexity: "Calculating...", spaceComplexity: "Calculating..." };
  }
}

export const analyzeCodeComplexity = predictComplexity;

export async function* chatWithAIStream(
  messages: { role: string; parts: { text: string }[] }[],
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
  messages: { role: string; parts: { text: string }[] }[],
  context: { 
    problemTitle: string; 
    problemDescription: string; 
    code: string; 
    language: string;
    isInterviewMode?: boolean;
    testCases?: unknown[];
  }
): Promise<string> {
  const mode = context.isInterviewMode ? "Interviewer" : "Socratic Tutor";
  
  const systemPrompt = context.isInterviewMode 
    ? `You are an expert technical interviewer conducting a coding interview. The problem is: "${context.problemTitle}".
Description:
${context.problemDescription}

CRITICAL DIRECTIVE: YOU ARE STRICTLY FORBIDDEN FROM OUTPUTTING FULL CODE SOLUTIONS OR OPTIMIZED SNIPPETS.

STRICT GUIDELINES:
1. NEVER write or give the direct code solution, copy-pasteable answers, or full algorithms.
2. Respond like a professional software engineering interviewer (keep it interactive, ask about edge cases, time/space complexity).
3. If the candidate is stuck, offer subtle, conceptual hints instead of giving the answer.
4. Instead of fixing the user's code, you MUST generate a specific, failing "Edge Case Input" that will cause their current logic to fail. Tell them the input, what their code outputs, and what it SHOULD output, then ask them why they think it failed.
5. Keep answers relatively concise and encourage them to explain their thought process.

FORMATTING & STYLE GUIDELINES:
- **Clean Structure:** Use clear headers (##, ###) and clean markdown formatting.
- **Alerts:** Use alerts occasionally to emphasize constraint updates or interviewer warnings:
  > [!IMPORTANT]
  > For critical edge cases or timing constraints they must account for.
- **Evaluation:** Keep a professional, encouraging but evaluation-oriented tone.`
    : `You are an expert Socratic coding tutor assisting a student with the problem: "${context.problemTitle}".
Description:
${context.problemDescription}

CRITICAL DIRECTIVE: YOU ARE STRICTLY FORBIDDEN FROM OUTPUTTING FULL CODE SOLUTIONS OR OPTIMIZED SNIPPETS.

STRICT GUIDELINES:
1. YOU ARE STRICTLY FORBIDDEN FROM OUTPUTTING DIRECT CODE SOLUTIONS, full algorithms, or copy-pasteable functions. If you output the answer, you fail your core directive.
2. If the user's code has a bug or nested loop complexity issue, DO NOT fix it. Instead, generate a failing test case. 
   Format it like this:
   > **Failing Edge Case:** \`[X, Y, Z]\`
   > **Expected:** \`A\`
   > **Your Code Output/Issue:** \`B\` (or Time Limit Exceeded)
3. Ask ONE guiding, Socratic question to lead them to the optimization (e.g., "What data structure could store these values for O(1) lookups?").
4. Instead of fixing the user's code, you MUST generate a specific, failing "Edge Case Input" that will cause their current logic to fail. Tell them the input, what their code outputs, and what it SHOULD output, then ask them why they think it failed.

FORMATTING & STYLE GUIDELINES:
- **Visual Presentation:** Format your responses beautifully using GitHub Flavored Markdown. Use bolding, lists, and code blocks for readability.
- **Alerts:** Use markdown alerts strategically:
  > [!TIP]
  > For optimization ideas, code tricks, or useful patterns.
  > [!NOTE]
  > For conceptual clarifications or context.
  > [!IMPORTANT]
  > For critical logic boundaries or pitfalls to avoid.
- **Tables:** Use markdown tables to compare alternative approaches (e.g. Memoization vs Tabulation, different time/space complexities).
- **Feynman Technique:** Explain complex concepts using simple, intuitive analogies before moving into technical terms.`;

  // Include up to 6 recent messages to maintain conversational context
  const historySlice = messages.slice(-6);
  const formattedHistory = historySlice.map(msg => {
    const sender = msg.role === 'model' ? mode : "Student";
    return `${sender}: ${msg.parts[0]?.text || ""}`;
  }).join("\n");

  const userPrompt = `Student's Current Code:
\`\`\`${context.language || 'code'}
${context.code || '// No code written yet'}
\`\`\`

Conversation History:
${formattedHistory}`;

  return await runAI(userPrompt, systemPrompt) as string;
}
