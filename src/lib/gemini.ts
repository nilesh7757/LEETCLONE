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