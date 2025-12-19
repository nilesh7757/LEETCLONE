import { NextResponse } from "next/server";
import { runAI, AIError } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
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

    const responseText = await runAI(userPrompt, systemPrompt, true);
    
    // Cleanup potential markdown
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const problemData = JSON.parse(cleanJson);

    // Format testSets correctly if they are flat or missing the standard structure
    let formattedTestSets: { examples: any[], hidden: any[] } = { examples: [], hidden: [] };
    if (problemData.testSets) {
      if (Array.isArray(problemData.testSets)) {
        // If AI returned a flat array, split based on isExample flag
        problemData.testSets.forEach((ts: any) => {
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
      } else if (typeof problemData.testSets === 'object') {
        formattedTestSets.examples = (problemData.testSets.examples || []).map((ts: any) => ({
          input: ts.input || "",
          expectedOutput: ts.expectedOutput || ts.output || ""
        }));
        formattedTestSets.hidden = (problemData.testSets.hidden || []).map((ts: any) => ({
          input: ts.input || "",
          expectedOutput: ts.expectedOutput || ts.output || ""
        }));
      }
    }

    const generateSlug = (title: string) => {
      return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove non-word chars
        .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with single dash
        .replace(/^-+|-+$/g, ""); // Remove dashes from start/end
    };

    // Create the problem in a "Draft/Unverified" state
    const problem = await prisma.problem.create({
      data: {
        ...problemData,
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

  } catch (error: any) {
    console.error("AI Problem Gen Error:", error);
    if (error instanceof AIError && error.status === 429) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}