import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const slugsToRemove = [
  // System Design
  "design-url-shortener", "design-notification-system", "design-uber", "design-rate-limiter", "design-distributed-kv-store",
  // SQL
  "big-countries", "combine-two-tables", "employees-earning-more-than-managers", "duplicate-emails", "customers-who-never-order", "rising-temperature", "nth-highest-salary", "rank-scores", "department-highest-salary", "swap-salary",
  // Coding
  "normal-problem-cf", "aaa-atcoder", "longest-push-time", "hard-problem-cf", "arc-admission", "poster-perimeter", "smallest-divisible-digit-product", "counting-pairs-cf", "insane-problem-cf", "largest-palindromic-number", "manhattan-distance-abc", "bulk-of-books", "gcd-on-grid", "tree-level-order", "min-costs-dest"
];

async function main() {
  console.log("Removing recently added problems...");
  
  const deleted = await prisma.problem.deleteMany({
    where: {
      slug: {
        in: slugsToRemove
      }
    }
  });

  console.log(`Successfully removed ${deleted.count} problems.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
