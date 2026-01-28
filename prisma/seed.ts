import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  const problemsData = [
    {
      title: "Two Sum",
      slug: "two-sum",
      difficulty: "Easy",
      category: "Array",
      description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
      testSets: [
        { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isExample: true },
        { input: "3\n3 2 4\n6", expectedOutput: "1 2", isExample: true },
        { input: "2\n3 3\n6", expectedOutput: "0 1", isExample: false }
      ],
    },
    {
      title: "Reverse Linked List",
      slug: "reverse-linked-list",
      difficulty: "Easy",
      category: "Linked List",
      description: "Given the `head` of a singly linked list, reverse the list.",
      testSets: [],
    },
    {
      title: "Longest Substring Without Repeating Characters",
      slug: "longest-substring-without-repeating-characters",
      difficulty: "Medium",
      category: "String",
      description: "Find the length of the longest substring without repeating characters.",
      testSets: [],
    },
    {
      title: "Valid Parentheses",
      slug: "valid-parentheses",
      difficulty: "Easy",
      category: "Stack",
      description: "Determine if the input string is valid.",
      testSets: [],
    },
    {
        title: "Merge Two Sorted Lists",
        slug: "merge-two-sorted-lists",
        difficulty: "Easy",
        category: "Linked List",
        description: "Merge two sorted linked lists and return it as a sorted list.",
        testSets: [],
    },
    {
        title: "Container With Most Water",
        slug: "container-with-most-water",
        difficulty: "Medium",
        category: "Array",
        description: "Find two lines that together with the x-axis form a container, such that the container contains the most water.",
        testSets: [
          { input: "9\n1 8 6 2 5 4 8 3 7", expectedOutput: "49", isExample: true },
          { input: "2\n1 1", expectedOutput: "1", isExample: true }
        ],
    }
  ];

  const problemIds: Record<string, string> = {};

  for (const prob of problemsData) {
    const upserted = await prisma.problem.upsert({
      where: { slug: prob.slug },
      update: {},
      create: prob,
    });
    problemIds[prob.slug] = upserted.id;
  }

  // Create Study Plans
  const prepPlan = await prisma.studyPlan.upsert({
    where: { slug: "7-day-interview-prep" },
    update: {},
    create: {
      title: "7-Day Interview Prep",
      slug: "7-day-interview-prep",
      description: "A week-long crash course on the most frequently asked interview questions. Perfect for last-minute revision.",
      durationDays: 7,
    }
  });

  // Assign Problems to Days
  const assignments = [
    { slug: "two-sum", order: 1 },
    { slug: "valid-parentheses", order: 1 },
    { slug: "reverse-linked-list", order: 2 },
    { slug: "merge-two-sorted-lists", order: 2 },
    { slug: "longest-substring-without-repeating-characters", order: 3 },
    { slug: "container-with-most-water", order: 4 },
  ];

  for (const assign of assignments) {
      await prisma.studyPlanProblem.upsert({
          where: {
              studyPlanId_problemId: {
                  studyPlanId: prepPlan.id,
                  problemId: problemIds[assign.slug]
              }
          },
          update: { order: assign.order },
          create: {
              studyPlanId: prepPlan.id,
              problemId: problemIds[assign.slug],
              order: assign.order
          }
      });
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
