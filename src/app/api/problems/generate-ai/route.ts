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
      - testSets: (Only for CODING/SQL)
      - referenceSolution: (For READING, this should be a summary of key takeaways)
      
      CRITICAL: If the topic is complex (like Machine Learning), use "READING" to provide a well-structured documentation guide instead of a practice problem.
    `;

    const userPrompt = `Create a challenging but educational coding problem about \${topic}. 
    Ensure it is different from standard problems.`;

    const responseText = await runAI(userPrompt, systemPrompt, true);
    
    // Cleanup potential markdown
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const problemData = JSON.parse(cleanJson);

    // Create the problem in a "Draft/Unverified" state
    const problem = await prisma.problem.create({
      data: {
        ...problemData,
        slug: problemData.title.toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
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