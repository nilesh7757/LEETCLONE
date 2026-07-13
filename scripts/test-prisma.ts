import { PrismaClient } from "@prisma/client";

async function test() {
  const prisma = new PrismaClient();
  try {
    console.log("Attempting to create a test contest...");
    const contest = await prisma.contest.create({
      data: {
        title: "Test Contest",
        description: "Test description",
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        creatorId: "temp-id", // This might fail if user doesn't exist, but we want to see the FIELD error
        scoringProtocol: "CLASSIC",
      }
    });
    console.log("Success:", contest.id);
  } catch (err: unknown) {
    console.log("Error Message:", err instanceof Error ? err.message : String(err));
  } finally {
    await prisma.$disconnect();
  }
}

test();
