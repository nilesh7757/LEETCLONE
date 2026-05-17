/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.problem.count();
    console.log('Problem Count:', count);
    const problems = await prisma.problem.findMany({
      select: { slug: true, isPublic: true }
    });
    console.log('Problems:', problems);
  } catch (err) {
    console.error('Database Connection Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
