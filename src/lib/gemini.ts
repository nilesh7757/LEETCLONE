import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// List of models to try in order of preference.
// We prioritize 2.5-flash and 2.0-flash as they are the currently available models.
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-exp",
];

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export async function analyzeCodeComplexity(code: string, language: string): Promise<{ timeComplexity: string; spaceComplexity: string }> {
  if (!GEMINI_API_KEY) {
    console.error("Gemini API Key is not set in environment variables.");
    return { timeComplexity: "N/A", spaceComplexity: "N/A" };
  }

  const prompt = `Analyze the following ${language} code and determine its time complexity and space complexity.

Code:
` + "```" + language + `
${code}
` + "```" + `

Provide the answer as a JSON object with two fields: 'timeComplexity' and 'spaceComplexity'.
Example:
{
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(1)"
}

If complexity cannot be determined, state 'N/A' for the respective field.`;

  for (const model of MODELS) {
    try {
      const response = await axios.post(
        `${BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let geminiOutput: string = "";
      const candidate = response.data.candidates?.[0];
      
      if (candidate?.content?.parts?.[0]?.text) {
          geminiOutput = candidate.content.parts[0].text;
      } else {
          // Fallback if structure is unexpected
          geminiOutput = JSON.stringify(candidate);
      }
      
      let parsedComplexity: { timeComplexity?: string; spaceComplexity?: string } = {};
      try {
          // Clean markdown code blocks if present (even with JSON mode, some models might wrap it)
          const cleanJson = geminiOutput.replace(/```json\n?|```/g, "").trim();
          parsedComplexity = JSON.parse(cleanJson);
      } catch (parseError) {
          console.warn(`Failed to parse Gemini output for model ${model}. Raw output: ${geminiOutput.substring(0, 50)}...`);
          continue; 
      }

      const timeComplexity = parsedComplexity.timeComplexity || "N/A";
      const spaceComplexity = parsedComplexity.spaceComplexity || "N/A";

      return { timeComplexity, spaceComplexity };

    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.message;
      console.warn(`Model ${model} failed: ${msg}`);
      
      // If we are at the last model and it failed, we return N/A.
      // Otherwise loop continues to next model.
    }
  }

  console.error("All Gemini models failed to analyze code complexity.");
  return { timeComplexity: "N/A", spaceComplexity: "N/A" };
}

export async function evaluateSystemDesign(question: string, answer: string): Promise<{ feedback: string; score: number }> {
  if (!GEMINI_API_KEY) {
    return { feedback: "AI evaluation unavailable (API Key missing).", score: 0 };
  }

  // Extract base64 images from HTML (from our custom drawing-block or standard img tags)
  const imageMatches = answer.matchAll(/data:image\/[a-zA-Z]*;base64,([^"'>\s]+)/g);
  const inlineImages = Array.from(imageMatches).map(match => match[1]);

  // Clean the answer text for the prompt (remove the huge base64 strings to save tokens)
  const cleanAnswer = answer.replace(/data:image\/[a-zA-Z]*;base64,[^"'>\s]+/g, "[Image Attachment]");

  const prompt = `You are a Senior Staff Engineer conducting a System Design interview.
  
Evaluate the following candidate's answer based on the problem description. 
IMPORTANT: The candidate may have provided architectural diagrams (attached as images). Please analyze both the text and the diagrams.

Problem:
${question}

Candidate's Answer:
${cleanAnswer}

Tasks:
1. Score the answer from 0 to 100 based on completeness, correctness, and understanding of system design concepts (scalability, availability, consistency, etc.).
2. Provide concise, constructive feedback. Highlight missing components or good points from both the text and the diagrams.

Output Format (JSON):
{
  "score": 85,
  "feedback": "..."
}`;

  const parts: any[] = [{ text: prompt }];
  
  // Add images to the request
  inlineImages.forEach(base64Data => {
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: base64Data
      }
    });
  });

  for (const model of MODELS) {
    try {
      const response = await axios.post(
        `${BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const candidate = response.data.candidates?.[0];
      let text = candidate?.content?.parts?.[0]?.text || "";
      const cleanJson = text.replace(/```json\n?|```/g, "").trim();
      const result = JSON.parse(cleanJson);

      return {
        score: result.score || 0,
        feedback: result.feedback || "No feedback provided.",
      };

    } catch (error: any) {
      console.warn(`Model ${model} failed for system design eval:`, error.message);
    }
  }

  return { feedback: "Failed to evaluate answer.", score: 0 };
}