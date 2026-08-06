const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const p = await prisma.problem.findFirst({
        where: { title: { contains: "Split Array Largest Sum", mode: "insensitive" } }
    });
    console.log(p);
}
main().catch(console.error).finally(() => prisma.$disconnect());
