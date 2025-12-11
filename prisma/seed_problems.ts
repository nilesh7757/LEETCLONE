const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');
  
  // Clean related data
  await prisma.submission.deleteMany({});
  await prisma.commentVote.deleteMany({});
  await prisma.comment.deleteMany({});
  
  // Clean problems
  await prisma.problem.deleteMany({});

  console.log('Database cleaned. Seeding problems...');

  const problems = [
    {
      title: "Two Sum",
      slug: "two-sum",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
      difficulty: "Easy",
      category: "Array",
      timeLimit: 2,
      memoryLimit: 256,
      testSets: {
        examples: [
          { input: "[2,7,11,15]\n9", output: "[0,1]", isPublic: true },
          { input: "[3,2,4]\n6", output: "[1,2]", isPublic: true },
          { input: "[3,3]\n6", output: "[0,1]", isPublic: true },
        ],
        hidden: []
      }
    },
    {
      title: "Reverse String",
      slug: "reverse-string",
      description: "Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
      difficulty: "Easy",
      category: "String",
      timeLimit: 2,
      memoryLimit: 256,
      testSets: {
        examples: [
          { input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]', isPublic: true },
          { input: '["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]', isPublic: true },
        ],
        hidden: []
      }
    },
    {
      title: "Palindrome Number",
      slug: "palindrome-number",
      description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
      difficulty: "Easy",
      category: "Math",
      timeLimit: 2,
      memoryLimit: 256,
      testSets: {
        examples: [
          { input: "121", output: "true", isPublic: true },
          { input: "-121", output: "false", isPublic: true },
          { input: "10", output: "false", isPublic: true },
        ],
        hidden: []
      }
    },
     {
      title: "Valid Parentheses",
      slug: "valid-parentheses",
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
      difficulty: "Easy",
      category: "Stack",
      timeLimit: 2,
      memoryLimit: 256,
      testSets: {
        examples: [
          { input: '"()"', output: "true", isPublic: true },
          { input: '"()[]{}"', output: "true", isPublic: true },
          { input: '"(]"', output: "false", isPublic: true },
        ],
        hidden: []
      }
    },
    {
      title: "Merge Two Sorted Lists",
      slug: "merge-two-sorted-lists",
      description: "You are given the heads of two sorted linked lists list1 and list2.\n\nMerge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.",
      difficulty: "Easy",
      category: "LinkedList",
      timeLimit: 2,
      memoryLimit: 256,
      testSets: {
        examples: [
          { input: "[1,2,4]\n[1,3,4]", output: "[1,1,2,3,4,4]", isPublic: true },
          { input: "[]\n[]", output: "[]", isPublic: true },
          { input: "[]\n[0]", output: "[0]", isPublic: true },
        ],
        hidden: []
      }
    },
    {
      title: "Best Time to Buy and Sell Stock",
      slug: "best-time-to-buy-and-sell-stock",
      description: "You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
      difficulty: "Easy",
      category: "Array",
      timeLimit: 2,
      memoryLimit: 256,
      testSets: {
        examples: [
          { input: "[7,1,5,3,6,4]", output: "5", isPublic: true },
          { input: "[7,6,4,3,1]", output: "0", isPublic: true },
        ],
        hidden: []
      }
    },
    {
      title: "Valid Anagram",
      slug: "valid-anagram",
      description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
      difficulty: "Easy",
      category: "String",
      timeLimit: 2,
      memoryLimit: 256,
      testSets: {
        examples: [
          { input: '"anagram"\n"nagaram"', output: "true", isPublic: true },
          { input: '"rat"\n"car"', output: "false", isPublic: true },
        ],
        hidden: []
      }
    },
    {
      title: "Binary Search",
      slug: "binary-search",
      description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.",
      difficulty: "Easy",
      category: "Binary Search",
      timeLimit: 2,
      memoryLimit: 256,
      testSets: {
        examples: [
          { input: "[-1,0,3,5,9,12]\n9", output: "4", isPublic: true },
          { input: "[-1,0,3,5,9,12]\n2", output: "-1", isPublic: true },
        ],
        hidden: []
      }
    },
    {
      title: "Maximum Subarray",
      slug: "maximum-subarray",
      description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
      difficulty: "Medium",
      category: "Array",
      timeLimit: 2,
      memoryLimit: 256,
      testSets: {
        examples: [
          { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6", isPublic: true },
          { input: "[1]", output: "1", isPublic: true },
          { input: "[5,4,-1,7,8]", output: "23", isPublic: true },
        ],
        hidden: []
      }
    },
    {
      title: "Length of Last Word",
      slug: "length-of-last-word",
      description: "Given a string s consisting of words and spaces, return the length of the last word in the string.\n\nA word is a maximal substring consisting of non-space characters only.",
      difficulty: "Easy",
      category: "String",
      timeLimit: 2,
      memoryLimit: 256,
      testSets: {
        examples: [
          { input: '"Hello World"', output: "5", isPublic: true },
          { input: '"   fly me   to   the moon  "', output: "4", isPublic: true },
          { input: '"luffy is still joyboy"', output: "6", isPublic: true },
        ],
        hidden: []
      }
    },
    {
      title: "Plus One",
      slug: "plus-one",
      description: "You are given a large integer represented as an integer array digits, where each digits[i] is the ith digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading 0's.\n\nIncrement the large integer by one and return the resulting array of digits.",
      difficulty: "Easy",
      category: "Array",
      timeLimit: 2,
      memoryLimit: 256,
      testSets: {
        examples: [
          { input: "[1,2,3]", output: "[1,2,4]", isPublic: true },
          { input: "[4,3,2,1]", output: "[4,3,2,2]", isPublic: true },
          { input: "[9]", output: "[1,0]", isPublic: true },
        ],
        hidden: []
      }
    },
    {
      title: "Climbing Stairs",
      slug: "climbing-stairs",
      description: "You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
      difficulty: "Easy",
      category: "DP",
      timeLimit: 2,
      memoryLimit: 256,
      testSets: {
        examples: [
          { input: "2", output: "2", isPublic: true },
          { input: "3", output: "3", isPublic: true },
        ],
        hidden: []
      }
    },
    {
      title: "Sqrt(x)",
      slug: "sqrtx",
      description: "Given a non-negative integer x, return the square root of x rounded down to the nearest integer. The returned integer should be non-negative as well.\n\nYou must not use any built-in exponent function or operator.",
      difficulty: "Easy",
      category: "Math",
      timeLimit: 2,
      memoryLimit: 256,
      testSets: {
        examples: [
          { input: "4", output: "2", isPublic: true },
          { input: "8", output: "2", isPublic: true },
        ],
        hidden: []
      }
    },
     {
      title: "Remove Duplicates from Sorted List",
      slug: "remove-duplicates-from-sorted-list",
      description: "Given the head of a sorted linked list, delete all duplicates such that each element appears only once. Return the linked list sorted as well.",
      difficulty: "Easy",
      category: "LinkedList",
      timeLimit: 2,
      memoryLimit: 256,
      testSets: {
        examples: [
          { input: "[1,1,2]", output: "[1,2]", isPublic: true },
          { input: "[1,1,2,3,3]", output: "[1,2,3]", isPublic: true },
        ],
        hidden: []
      }
    },
    {
      title: "Single Number",
      slug: "single-number",
      description: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.\n\nYou must implement a solution with a linear runtime complexity and use only constant extra space.",
      difficulty: "Easy",
      category: "Bit Manipulation",
      timeLimit: 2,
      memoryLimit: 256,
      testSets: {
        examples: [
          { input: "[2,2,1]", output: "1", isPublic: true },
          { input: "[4,1,2,1,2]", output: "4", isPublic: true },
          { input: "[1]", output: "1", isPublic: true },
        ],
        hidden: []
      }
    }
  ];

  for (const problem of problems) {
    await prisma.problem.create({
      data: problem
    });
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });