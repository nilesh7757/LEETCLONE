import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const problem = await prisma.problem.findFirst({
    where: {
      type: 'SQL'
    },
    select: {
      id: true,
      title: true,
      slug: true,
      initialSchema: true,
      initialData: true,
      type: true
    }
  });

  console.log(JSON.stringify(problem, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
