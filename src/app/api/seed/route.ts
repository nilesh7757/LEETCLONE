import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check if problems already exist
    const count = await prisma.problem.count();
    if (count > 0) {
      return NextResponse.json({ message: "Database already seeded" });
    }

    const problems = [
      {
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "Easy",
        category: "Array",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        examples: JSON.stringify([
          { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
          { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
        ]),
        testCases: JSON.stringify([]),
      },
      {
        title: "Reverse Linked List",
        slug: "reverse-linked-list",
        difficulty: "Easy",
        category: "Linked List",
        description: "Given the `head` of a singly linked list, reverse the list, and return *the reversed list*.",
        examples: JSON.stringify([
          { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
        ]),
        testCases: JSON.stringify([]),
      },
      {
        title: "Longest Substring Without Repeating Characters",
        slug: "longest-substring-without-repeating-characters",
        difficulty: "Medium",
        category: "String",
        description: "Given a string `s`, find the length of the **longest substring** without repeating characters.",
        examples: JSON.stringify([
          { input: "s = \"abcabcbb\"", output: "3" },
          { input: "s = \"bbbbb\"", output: "1" },
        ]),
        testCases: JSON.stringify([]),
      },
      {
        title: "Median of Two Sorted Arrays",
        slug: "median-of-two-sorted-arrays",
        difficulty: "Hard",
        category: "Array",
        description: "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be `O(log (m+n))`.",
        examples: JSON.stringify([
          { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000" },
        ]),
        testCases: JSON.stringify([]),
      },
      {
        title: "Valid Parentheses",
        slug: "valid-parentheses",
        difficulty: "Easy",
        category: "Stack",
        description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        examples: JSON.stringify([
          { input: "s = \"()\"", output: "true" },
          { input: "s = \"()[]{}\"", output: "true" },
        ]),
        testCases: JSON.stringify([]),
      },
    ];

    for (const problem of problems) {
      await prisma.problem.create({
        data: problem,
      });
    }

    return NextResponse.json({ message: "Database seeded successfully", count: problems.length });
  } catch (error) {
    return NextResponse.json({ error: "Failed to seed database", details: String(error) }, { status: 500 });
  }
}
