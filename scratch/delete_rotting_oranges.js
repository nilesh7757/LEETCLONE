const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runWithRetry(fn, retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      console.warn(`[RETRY ${i + 1}/${retries}] Attempt failed:`, err.message);
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, delay));
      delay *= 1.5;
    }
  }
}

async function main() {
  await runWithRetry(async () => {
    // 1. Delete associated learning resource
    const resDel = await prisma.learningResource.deleteMany({
      where: { url: "https://www.youtube.com/watch?v=y704fEOx0s0" }
    });
    console.log(`Deleted ${resDel.count} learning resources.`);

    // 2. Delete problem
    const probDel = await prisma.problem.deleteMany({
      where: { slug: "rotting-oranges" }
    });
    console.log(`Deleted ${probDel.count} problem records.`);
  });
}

main()
  .catch(e => console.error("Final Error:", e))
  .finally(() => prisma.$disconnect());
