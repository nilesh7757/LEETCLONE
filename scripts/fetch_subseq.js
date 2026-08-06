const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const problems = await prisma.problem.findMany({
        where: {
            title: {
                contains: "Number of Subsequences That Satisfy the Given Sum Condition",
                mode: "insensitive"
            }
        },
        select: {
            id: true,
            title: true,
            slug: true
        }
    });
    console.log(JSON.stringify(problems, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
