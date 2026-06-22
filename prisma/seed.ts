import { PrismaClient, ProblemType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Clean Slate Seeding...");

  // 1. CLEAR EXISTING DATA
  console.log("🧹 Clearing existing problems and study plans...");
  await prisma.studyPlanProblem.deleteMany({});
  await prisma.studyPlanEnrollment.deleteMany({});
  await prisma.studyPlan.deleteMany({});
  await prisma.commentVote.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.problem.deleteMany({});

  const problemsData = [
    {
      title: "Two Sum",
      slug: "two-sum",
      difficulty: "Easy",
      category: "Array",
      description: `
<h1>Two Sum</h1>
<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
<p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
<p>You can return the answer in any order.</p>

<h2>Example 1:</h2>
<pre>
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
</pre>
      `,
      testSets: [
        { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isExample: true },
        { input: "3\n3 2 4\n6", expectedOutput: "1 2", isExample: true },
        { input: "2\n3 3\n6", expectedOutput: "0 1", isExample: true }
      ],
      referenceSolution: `
import sys

def solve():
    try:
        line1 = sys.stdin.readline().strip()
        if not line1: return
        n = int(line1)
        
        line2 = sys.stdin.readline().strip()
        nums = list(map(int, line2.split()))
        
        line3 = sys.stdin.readline().strip()
        target = int(line3)
        
        prevMap = {} # val : index
        for i, n in enumerate(nums):
            diff = target - n
            if diff in prevMap:
                print(f"{prevMap[diff]} {i}")
                return
            prevMap[n] = i
    except EOFError:
        pass

if __name__ == "__main__":
    solve()
      `.trim(),
      type: ProblemType.CODING,
    },
    {
      title: "Valid Parentheses",
      slug: "valid-parentheses",
      difficulty: "Easy",
      category: "Stack",
      description: `
<h1>Valid Parentheses</h1>
<p>Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.</p>
<p>An input string is valid if:</p>
<ul>
  <li>Open brackets must be closed by the same type of brackets.</li>
  <li>Open brackets must be closed in the correct order.</li>
  <li>Every close bracket has a corresponding open bracket of the same type.</li>
</ul>

<h2>Example 1:</h2>
<pre>
Input: s = "()"
Output: true
</pre>
      `,
      testSets: [
        { input: "()", expectedOutput: "true", isExample: true },
        { input: "()[]{}", expectedOutput: "true", isExample: true },
        { input: "(]", expectedOutput: "false", isExample: true },
        { input: "([)]", expectedOutput: "false", isExample: false }
      ],
      referenceSolution: `
import sys

def isValid(s: str) -> bool:
    Map = {")": "(", "]": "[", "}": "{"}
    stack = []
    for c in s:
        if c in Map:
            if stack and stack[-1] == Map[c]:
                stack.pop()
            else:
                return False
        else:
            stack.append(c)
    return True if not stack else False

if __name__ == "__main__":
    input_data = sys.stdin.read().strip()
    if input_data:
        print(str(isValid(input_data)).lower())
      `.trim(),
      type: ProblemType.CODING,
    },
    {
        title: "Palindrome Number",
        slug: "palindrome-number",
        difficulty: "Easy",
        category: "Math",
        description: `
<h1>Palindrome Number</h1>
<p>Given an integer <code>x</code>, return <code>true</code> if <code>x</code> is a palindrome, and <code>false</code> otherwise.</p>

<h2>Example 1:</h2>
<pre>
Input: x = 121
Output: true
Explanation: 121 reads as 121 from left to right and from right to left.
</pre>
        `,
        testSets: [
          { input: "121", expectedOutput: "true", isExample: true },
          { input: "-121", expectedOutput: "false", isExample: true },
          { input: "10", expectedOutput: "false", isExample: true }
        ],
        referenceSolution: `
import sys

def isPalindrome(x: int) -> bool:
    if x < 0: return False
    
    div = 1
    while x >= 10 * div:
        div *= 10
        
    while x:
        right = x % 10
        left = x // div
        
        if left != right: return False
        
        x = (x % div) // 10
        div = div // 100
    return True

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        try:
            print(str(isPalindrome(int(line))).lower())
        except:
            pass
        `.trim(),
        type: ProblemType.CODING,
    },
    {
      title: "Longest Substring Without Repeating Characters",
      slug: "longest-substring-without-repeating-characters",
      difficulty: "Medium",
      category: "String",
      description: `
<h1>Longest Substring Without Repeating Characters</h1>
<p>Given a string <code>s</code>, find the length of the <b>longest substring</b> without repeating characters.</p>

<h2>Example 1:</h2>
<pre>
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.
</pre>
      `,
      testSets: [
        { input: "abcabcbb", expectedOutput: "3", isExample: true },
        { input: "bbbbb", expectedOutput: "1", isExample: true },
        { input: "pwwkew", expectedOutput: "3", isExample: true }
      ],
      referenceSolution: `
import sys

def lengthOfLongestSubstring(s: str) -> int:
    charSet = set()
    l = 0
    res = 0
    for r in range(len(s)):
        while s[r] in charSet:
            charSet.remove(s[l])
            l += 1
        charSet.add(s[r])
        res = max(res, r - l + 1)
    return res

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    # Read handles empty or single word inputs
    print(lengthOfLongestSubstring(s))
      `.trim(),
      type: ProblemType.CODING,
    },
    {
        title: "Container With Most Water",
        slug: "container-with-most-water",
        difficulty: "Medium",
        category: "Array",
        description: `
<h1>Container With Most Water</h1>
<p>You are given an integer array <code>height</code> of length <code>n</code>. There are <code>n</code> vertical lines drawn such that the two endpoints of the <code>i<sup>th</sup></code> line are <code>(i, 0)</code> and <code>(i, height[i])</code>.</p>
<p>Find two lines that together with the x-axis form a container, such that the container contains the most water.</p>
<p>Return the maximum amount of water a container can store.</p>

<h2>Example 1:</h2>
<pre>
Input: height = [1,8,6,2,5,4,8,3,7]
Output: 49
</pre>
        `,
        testSets: [
          { input: "9\n1 8 6 2 5 4 8 3 7", expectedOutput: "49", isExample: true },
          { input: "2\n1 1", expectedOutput: "1", isExample: true }
        ],
        referenceSolution: `
import sys

def maxArea(height: list[int]) -> int:
    l, r = 0, len(height) - 1
    res = 0
    while l < r:
        area = (r - l) * min(height[l], height[r])
        res = max(res, area)
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return res

if __name__ == "__main__":
    lines = sys.stdin.readlines()
    if len(lines) >= 2:
        h = list(map(int, lines[1].split()))
        print(maxArea(h))
        `.trim(),
        type: ProblemType.CODING,
    },
    {
      title: "Binary Search",
      slug: "binary-search",
      difficulty: "Medium",
      category: "Binary Search",
      description: `
<h1>Binary Search</h1>
<p>Given an array of integers <code>nums</code> sorted in ascending order, and an integer <code>target</code>, write a function to search <code>target</code> in <code>nums</code>. If <code>target</code> exists, return its index. Otherwise, return <code>-1</code>.</p>
<p>You must write an algorithm with <code>O(log n)</code> runtime complexity.</p>

<h2>Example 1:</h2>
<pre>
Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4
Explanation: 9 exists in nums and its index is 4.
</pre>

<h2>Example 2:</h2>
<pre>
Input: nums = [-1,0,3,5,9,12], target = 2
Output: -1
Explanation: 2 does not exist in nums so return -1.
</pre>

<h2>Constraints:</h2>
<ul>
  <li><code>1 ≤ nums.length ≤ 10<sup>4</sup></code></li>
  <li><code>-10<sup>4</sup> < nums[i] < 10<sup>4</sup></code></li>
  <li>All the integers in <code>nums</code> are <strong>unique</strong>.</li>
  <li><code>nums</code> is sorted in ascending order.</li>
  <li><code>-10<sup>4</sup> < target < 10<sup>4</sup></code></li>
</ul>
      `,
      testSets: [
        { input: "6\n-1 0 3 5 9 12\n9", expectedOutput: "4", isExample: true },
        { input: "6\n-1 0 3 5 9 12\n2", expectedOutput: "-1", isExample: true },
        { input: "1\n5\n5", expectedOutput: "0", isExample: false },
        { input: "1\n5\n-5", expectedOutput: "-1", isExample: false },
        { input: "4\n1 3 5 7\n3", expectedOutput: "1", isExample: false },
        { input: "4\n1 3 5 7\n8", expectedOutput: "-1", isExample: false }
      ],
      referenceSolution: `
import sys

def search(nums: list[int], target: int) -> int:
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    return -1

if __name__ == "__main__":
    lines = sys.stdin.readlines()
    if len(lines) >= 3:
        n = int(lines[0].strip())
        nums = list(map(int, lines[1].split()))
        target = int(lines[2].strip())
        print(search(nums, target))
      `.trim(),
      type: ProblemType.CODING,
    },
    {
        title: "Weird Algorithm",
        slug: "weird-algorithm",
        difficulty: "Easy",
        category: "Math",
        description: `
<h1>Weird Algorithm</h1>
<p>Consider an algorithm that takes as input a positive integer <code>n</code>. If <code>n</code> is even, the algorithm divides it by two, and if <code>n</code> is odd, the algorithm multiplies it by three and adds one. The algorithm repeats this, until <code>n</code> is one.</p>
<p>For example, the sequence for <code>n=3</code> is as follows:</p>
<code>3 &rarr; 10 &rarr; 5 &rarr; 16 &rarr; 8 &rarr; 4 &rarr; 2 &rarr; 1</code>
<p>Your task is to simulate the execution of the algorithm for a given value of <code>n</code>.</p>

<h2>Input</h2>
<p>The only input line contains an integer <code>n</code>.</p>

<h2>Output</h2>
<p>Print a line that contains all values of <code>n</code> during the algorithm.</p>

<h2>Constraints</h2>
<ul>
  <li><code>1 &le; n &le; 10<sup>6</sup></code></li>
</ul>

<h2>Example 1:</h2>
<pre>
Input: 3
Output: 3 10 5 16 8 4 2 1
</pre>
        `,
        testSets: [
          { input: "3", expectedOutput: "3 10 5 16 8 4 2 1", isExample: true },
          { input: "1", expectedOutput: "1", isExample: true },
          { input: "5", expectedOutput: "5 16 8 4 2 1", isExample: false },
          { input: "10", expectedOutput: "10 5 16 8 4 2 1", isExample: false }
        ],
        referenceSolution: `
import sys

def solve():
    try:
        input_data = sys.stdin.read().split()
        if not input_data: return
        n = int(input_data[0])
        res = [str(n)]
        while n != 1:
            if n % 2 == 0:
                n //= 2
            else:
                n = n * 3 + 1
            res.append(str(n))
        print(" ".join(res))
    except EOFError:
        pass

if __name__ == "__main__":
    solve()
        `.trim(),
        type: ProblemType.CODING,
    }
  ];

  const problemIds: Record<string, string> = {};

  console.log("📝 Creating problems...");
  for (const prob of problemsData) {
    const created = await prisma.problem.create({
      data: {
        ...prob,
        isPublic: true,
        isVerified: true,
        source: "SYSTEM",
      },
    });
    console.log(`   ✅ Created: ${prob.title}`);
    problemIds[prob.slug] = created.id;
  }

  // Create Study Plans
  console.log("📚 Creating Study Plans...");
  const prepPlan = await prisma.studyPlan.create({
    data: {
      title: "LogiQuest Top 50 Essentials",
      slug: "top-50-essentials",
      description: "Master the fundamental patterns including Sliding Window, Two Pointers, and Stacks.",
      durationDays: 30,
      isPublic: true,
      isOfficial: true,
      status: "PUBLISHED"
    }
  });

  // Assign Problems to Days
  const assignments = [
    { slug: "two-sum", order: 1 },
    { slug: "palindrome-number", order: 2 },
    { slug: "valid-parentheses", order: 3 },
    { slug: "longest-substring-without-repeating-characters", order: 4 },
    { slug: "container-with-most-water", order: 5 },
  ];

  for (const assign of assignments) {
      await prisma.studyPlanProblem.create({
          data: {
              studyPlanId: prepPlan.id,
              problemId: problemIds[assign.slug],
              order: assign.order
          }
      });
  }

  console.log("\n✨ Seeding completed successfully! Every problem now supports dynamic evaluation.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
