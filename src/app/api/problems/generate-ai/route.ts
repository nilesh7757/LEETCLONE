import { NextResponse } from "next/server";
import { runAI } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { apiHandler } from "@/lib/api-handler";
import { generateSlug } from "@/lib/utils";

interface AITestCase {
  input?: string;
  expectedOutput?: string;
  output?: string;
  isExample?: boolean;
}

interface GeneratedProblemData {
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  type: "CODING" | "SQL" | "SYSTEM_DESIGN" | "READING";
  testSets?: unknown;
  referenceSolution: string;
}

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { topic, studyPlanId } = await req.json();

  const systemPrompt = `
    You are an expert technical interviewer and educator. 
    Generate a learning artifact about the topic: ${topic}.
    
    Determine the most suitable type:
    - Use "CODING" if it's a standard algorithmic/coding challenge.
    - Use "SQL" if it's about database queries.
    - Use "SYSTEM_DESIGN" if it's about high-level architecture.
    - Use "READING" for ANYTHING else (ML, DevOps, Networking, Theory, etc.) where practice is not feasible here.
    
    Return a JSON object with:
    - title: A creative name
    - description: HTML formatted content. 
        - For READING: Provide a deep-dive "Study Guide" with clear sections (Overview, Key Concepts, Examples, Best Practices) and a "Resources for further learning" section.
        - For others: Standard problem statement.
    - difficulty: "Easy", "Medium", or "Hard"
    - category: The topic name
    - type: The determined type (CODING, SQL, SYSTEM_DESIGN, or READING)
    - testSets: { 
        "examples": [{"input": "...", "expectedOutput": "..."}], 
        "hidden": [{"input": "...", "expectedOutput": "..."}] 
      } (Required for CODING/SQL)
    - referenceSolution: (For READING, this should be a summary of key takeaways)
    
    CRITICAL: If the topic is complex (like Machine Learning), use "READING" to provide a well-structured documentation guide instead of a practice problem.
  `;

  const userPrompt = `Create a challenging but educational coding problem about ${topic}. 
  Ensure it is different from standard problems.`;

  const problemData = await runAI(userPrompt, systemPrompt, true) as GeneratedProblemData;

  // Format testSets correctly if they are flat or missing the standard structure
  const formattedTestSets: { examples: { input: string; expectedOutput: string }[], hidden: { input: string; expectedOutput: string }[] } = { examples: [], hidden: [] };
  if (problemData.testSets) {
    if (Array.isArray(problemData.testSets)) {
      // If AI returned a flat array, split based on isExample flag
      problemData.testSets.forEach((ts: AITestCase) => {
        const formatted = {
          input: ts.input || "",
          expectedOutput: ts.expectedOutput || ts.output || ""
        };
        if (ts.isExample === true) {
          formattedTestSets.examples.push(formatted);
        } else {
          formattedTestSets.hidden.push(formatted);
        }
      });
      
      // Fallback: If no isExample flags were found, put all in examples
      if (formattedTestSets.examples.length === 0 && formattedTestSets.hidden.length > 0) {
         formattedTestSets.examples = formattedTestSets.hidden;
         formattedTestSets.hidden = [];
      }
    } else if (typeof problemData.testSets === 'object' && problemData.testSets !== null) {
      const tsObj = problemData.testSets as { examples?: AITestCase[]; hidden?: AITestCase[] };
      formattedTestSets.examples = (tsObj.examples || []).map((ts: AITestCase) => ({
        input: ts.input || "",
        expectedOutput: ts.expectedOutput || ts.output || ""
      }));
      formattedTestSets.hidden = (tsObj.hidden || []).map((ts: AITestCase) => ({
        input: ts.input || "",
        expectedOutput: ts.expectedOutput || ts.output || ""
      }));
    }
  }


  // Create the problem in a "Draft/Unverified" state
  const problem = await prisma.problem.create({
    data: {
      title: problemData.title,
      description: problemData.description,
      difficulty: problemData.difficulty,
      category: problemData.category,
      type: problemData.type,
      referenceSolution: problemData.referenceSolution,
      testSets: JSON.stringify(formattedTestSets),
      slug: generateSlug(problemData.title) + "-" + Date.now(),
      isVerified: false,
      source: "AI_GENERATED",
      creatorId: session.user.id,
      isPublic: false, 
    }
  });

  // Link to Study Plan if provided
  if (studyPlanId) {
     const lastProblem = await prisma.studyPlanProblem.findFirst({
        where: { studyPlanId },
        orderBy: { order: 'desc' }
     });
     const nextOrder = (lastProblem?.order || 0) + 1;

     await prisma.studyPlanProblem.create({
        data: {
           studyPlanId,
           problemId: problem.id,
           order: nextOrder
        }
     });
  }

  return NextResponse.json({ success: true, problem });
});