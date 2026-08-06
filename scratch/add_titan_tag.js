const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.problem.findUnique({
    where: { slug: "allocate-minimum-number-of-pages" }
  });

  if (!p) {
    console.error("Problem not found!");
    return;
  }

  const updatedCompanies = Array.from(new Set([...p.companies, "Titan"]));
  const updatedCompanyTags = Array.from(new Set([...p.companyTags, "Titan"]));

  const result = await prisma.problem.update({
    where: { slug: "allocate-minimum-number-of-pages" },
    data: {
      companies: updatedCompanies,
      companyTags: updatedCompanyTags
    }
  });

  console.log("Successfully updated Allocate Minimum Number of Pages!");
  console.log("Companies:", result.companies);
  console.log("Company Tags:", result.companyTags);
}

main()
  .catch(e => {
    console.error("❌ Update failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
