import { PrismaClient, ProblemType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const problemData = {
    title: "Allocate Minimum Number of Pages",
    slug: "allocate-minimum-number-of-pages",
    difficulty: "Hard",
    category: "Binary Search",
    description: `
<h1>Allocate Minimum Number of Pages</h1>
<p>Given an array <code>books</code> of integer numbers where <code>books[i]</code> represents the number of pages in the <code>i</code>-th book. There are <code>m</code> students, and the task is to allocate all the books to the students.</p>

<p>Allocate books in such a way that:</p>
<ol>
  <li>Each student gets at least one book.</li>
  <li>Each book should be allocated to a student.</li>
  <li>Book allocation should be in a contiguous manner.</li>
</ol>

<p>You need to allocate the books so that the <strong>maximum number of pages assigned to a student is minimized</strong>.</p>
<p>If the allocation of books is not possible, return <code>-1</code>.</p>

<h2>Example 1:</h2>
<pre>
Input: books = [12, 34, 67, 90], m = 2
Output: 113
Explanation: 
There are 2 number of students. Books can be distributed in following fashion :
  1) [12] and [34, 67, 90]
      Max number of pages is max(12, 191) = 191.
  2) [12, 34] and [67, 90]
      Max number of pages is max(46, 157) = 157.
  3) [12, 34, 67] and [90]
      Max number of pages is max(113, 90) = 113.
Therefore, the minimum of these maximums is 113.
</pre>

<h2>Example 2:</h2>
<pre>
Input: books = [15, 17, 20], m = 2
Output: 32
Explanation: 
The allocation is [15, 17] and [20]. The maximum is max(32, 20) = 32.
</pre>

<h2>Constraints:</h2>
<ul>
  <li><code>1 <= books.length <= 10^5</code></li>
  <li><code>1 <= books[i] <= 10^4</code></li>
  <li><code>1 <= m <= 10^5</code></li>
</ul>
    `,
    testSets: [
      { input: "4\n12 34 67 90\n2", expectedOutput: "113", isExample: true },
      { input: "3\n15 17 20\n2", expectedOutput: "32", isExample: true },
      { input: "4\n10 20 30 40\n5", expectedOutput: "-1", isExample: false },
      { input: "5\n25 46 28 49 24\n4", expectedOutput: "71", isExample: false },
      { input: "4\n10 10 10 10\n4", expectedOutput: "10", isExample: false }
    ],
    referenceSolution: `
import sys

def allocateBooks(books: list[int], m: int) -> int:
    if len(books) < m: return -1
    
    low = max(books)
    high = sum(books)
    result = -1
    
    def isValid(mid):
        studentCount = 1
        currentPages = 0
        for book in books:
            if currentPages + book > mid:
                studentCount += 1
                currentPages = book
                if studentCount > m: return False
            else:
                currentPages += book
        return True

    while low <= high:
        mid = (low + high) // 2
        if isValid(mid):
            result = mid
            high = mid - 1
        else:
            low = mid + 1
            
    return result

if __name__ == "__main__":
    lines = sys.stdin.read().split()
    if len(lines) > 0:
        n = int(lines[0])
        books = [int(x) for x in lines[1:n+1]]
        m = int(lines[n+1])
        print(allocateBooks(books, m))
    `,
    type: ProblemType.CODING,
    editorial: `The problem asks us to minimize the maximum pages assigned to a student. This is a classic 'Minimax' problem which can often be solved using Binary Search on the answer.

### Approach: Binary Search on Answer
1. **Search Space:** The minimum possible answer is the maximum number of pages in a single book (since a student must take at least one book and we can't split a book). The maximum possible answer is the sum of all pages (if there is only 1 student).
2. **Predicate Function \`isValid(mid)\`:** For a given maximum limit \`mid\`, can we allocate the books to at most \`m\` students? We iterate through the books and greedily allocate them to a student as long as their total pages don't exceed \`mid\`. If we need more than \`m\` students, \`mid\` is too small.
3. **Binary Search:** We binary search for the minimum \`mid\` that satisfies \`isValid(mid)\`.`,
    companies: ["Amazon", "Microsoft", "Google", "CodeNation", "Flipkart"]
  };

  console.log("📝 Creating problem...");
  try {
    const existing = await prisma.problem.findUnique({ where: { slug: problemData.slug } });
    if (existing) {
        console.log("Problem already exists, updating...");
        await prisma.problem.update({
            where: { slug: problemData.slug },
            data: {
                ...problemData,
                isPublic: true,
                isVerified: true,
                source: "SYSTEM",
            }
        });
        console.log("✅ Problem updated successfully!");
    } else {
        await prisma.problem.create({
          data: {
            ...problemData,
            isPublic: true,
            isVerified: true,
            source: "SYSTEM",
          },
        });
        console.log("✅ Problem created successfully!");
    }
  } catch (error) {
      console.error("❌ Error adding problem:", error);
  } finally {
      await prisma.$disconnect();
  }
}

main();
