import { PrismaClient, ProblemType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const problemData = {
    title: "Design a Rate Limiter for an AI API",
    slug: "design-a-rate-limiter-for-an-ai-api",
    difficulty: "Medium",
    category: "Design",
    description: `
<h1>Design a Rate Limiter for an AI API</h1>

<p>You are designing a core component of an AI API Gateway. An AI worker receives requests from multiple customers. To prevent abuse and ensure fair sharing of GPU resources, you must implement a <strong>Token Bucket Rate Limiter</strong> in C++.</p>

<h3>System Requirements:</h3>
<ul>
  <li>Each customer has their own rate limits defined by a maximum <strong>Capacity</strong> (<code>C</code>) and a <strong>Refill Rate</strong> (<code>R</code> tokens per second).</li>
  <li>When a customer accesses the API for the first time, their bucket starts fully loaded with <code>C</code> tokens.</li>
  <li>For each subsequent request by a customer at a given timestamp <code>T</code> (in seconds), their bucket refills with tokens accumulated since the last request:
    <pre>New Tokens = (T_current - T_last) * Refill_Rate</pre>
    The bucket capacity is capped at <code>C</code>.
  </li>
  <li>If the bucket contains at least <code>cost</code> tokens, the request is allowed (allowed = <code>1</code>) and <code>cost</code> tokens are consumed.</li>
  <li>If the bucket contains fewer than <code>cost</code> tokens, the request is denied (allowed = <code>0</code>). No tokens are consumed.</li>
  <li><strong>Important:</strong> Whether a request is allowed or denied, the bucket's token count is updated with the refilled amount, and the customer's last update timestamp is updated to <code>T_current</code>.</li>
</ul>

<h3>Input Format:</h3>
<ol>
  <li>The first line contains two integers: <code>capacity</code> and <code>refill_rate</code>.</li>
  <li>The second line contains an integer <code>q</code>, the number of queries/requests.</li>
  <li>Each of the next <code>q</code> lines contains three space-separated fields representing a request:
    <ul>
      <li><code>customer_id</code> (string)</li>
      <li><code>timestamp</code> (integer, seconds)</li>
      <li><code>cost</code> (integer, tokens required)</li>
    </ul>
  </li>
</ol>

<h3>Output Format:</h3>
<p>For each request, output <code>1</code> if the request is allowed, or <code>0</code> if it is denied, each on a new line.</p>

<h3>Constraints:</h3>
<ul>
  <li><code>1 <= capacity <= 10^9</code></li>
  <li><code>0 <= refill_rate <= 10^9</code></li>
  <li><code>1 <= q <= 10^5</code></li>
  <li><code>0 <= timestamp <= 10^18</code> (non-decreasing per customer)</li>
  <li><code>0 <= cost <= 10^9</code></li>
</ul>

<h3>Visual Walkthrough of Token Bucket:</h3>
<p>Below is a state trace of a single customer bucket with <strong>Capacity = 10</strong>, <strong>Refill Rate = 2 tokens/sec</strong>:</p>

<pre>
   Time (T)  | Action  | Elapsed | Tokens Refilled | Tokens Before | Cost | Allowed? | Tokens After
  -----------+---------+---------+-----------------+---------------+------+----------+--------------
   T = 0     | Request |    0    |        0        |   10 (Full)   |  8   |   Yes    |      2
   T = 2     | Request |    2    |     2*2 = 4     |    2+4 = 6    |  5   |   Yes    |      1
   T = 3     | Request |    1    |     1*2 = 2     |    1+2 = 3    |  4   |    No    |      3
   T = 5     | Request |    2    |     2*2 = 4     |    3+4 = 7    |  4   |   Yes    |      3
</pre>

<p><strong>Visual Token Level Tracking Graph:</strong></p>
<pre>
Tokens  10 |=============|  (Initial Level: 10 tokens)
           |
   T = 0   |====|           (Consumed 8. Remaining: 2)
           |
   T = 2   |============|   (Refilled +4. Level: 6. Consumed 5. Remaining: 1)
           |
   T = 3   |======|         (Refilled +2. Level: 3. Cost 4 is higher than 3 -> Denied. Remaining: 3)
           |
   T = 5   |==============| (Refilled +4. Level: 7. Consumed 4. Remaining: 3)
</pre>
    `,
    testSets: [
      {
        input: "10 2\n5\nA 0 8\nA 2 5\nB 2 12\nA 3 4\nA 5 4",
        expectedOutput: "1\n1\n0\n0\n1",
        isExample: true
      },
      {
        input: "5 1\n4\nA 0 3\nA 100 5\nA 101 2\nA 200 5",
        expectedOutput: "1\n1\n0\n1",
        isExample: true
      },
      {
        input: "10 0\n4\nA 0 4\nA 10 4\nA 20 4\nA 30 2",
        expectedOutput: "1\n1\n0\n1",
        isExample: false
      },
      {
        input: "10 1\n6\ncust1 0 8\ncust2 0 8\ncust1 2 4\ncust2 2 3\ncust1 3 2\ncust2 3 2",
        expectedOutput: "1\n1\n1\n1\n0\n1",
        isExample: false
      },
      {
        input: "5 5\n3\nA 0 6\nA 10 5\nA 20 6",
        expectedOutput: "0\n1\n0",
        isExample: false
      },
      {
        input: "1000000000 1000000000\n3\nA 0 1000000000\nA 1000000000000 1000000000\nA 1000000000001 1000000000",
        expectedOutput: "1\n1\n1",
        isExample: false
      },
      {
        input: "10 2\n4\nA 10 4\nA 10 4\nA 10 3\nA 10 2",
        expectedOutput: "1\n1\n0\n1",
        isExample: false
      },
      {
        input: "10 2\n3\nA 0 8\nA 4 6\nA 4 5",
        expectedOutput: "1\n1\n0",
        isExample: false
      },
      {
        input: "5 1\n4\nA 0 0\nA 0 5\nA 0 0\nA 1 1",
        expectedOutput: "1\n1\n1\n1",
        isExample: false
      },
      {
        input: "100 10\n4\nA 0 60\nA 2 30\nA 4 30\nA 10 100",
        expectedOutput: "1\n1\n1\n0",
        isExample: false
      }
    ],
    referenceSolution: `
#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>

using namespace std;

struct Bucket {
    long long last_update;
    long long tokens;
};

int main() {
    // Fast I/O
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    long long capacity;
    long long refill_rate;
    if (!(cin >> capacity >> refill_rate)) return 0;

    int q;
    if (!(cin >> q)) return 0;

    unordered_map<string, Bucket> db;

    for (int i = 0; i < q; ++i) {
        string customer_id;
        long long timestamp;
        long long cost;
        cin >> customer_id >> timestamp >> cost;

        if (db.find(customer_id) == db.end()) {
            // First time seeing this customer, initialize bucket
            db[customer_id] = {timestamp, capacity};
        }

        Bucket& bucket = db[customer_id];
        long long elapsed = timestamp - bucket.last_update;
        
        if (elapsed > 0) {
            long long new_tokens = 0;
            if (refill_rate > 0) {
                if (elapsed > capacity / refill_rate) {
                    new_tokens = capacity;
                } else {
                    new_tokens = elapsed * refill_rate;
                }
            }
            bucket.tokens = min(capacity, bucket.tokens + new_tokens);
            bucket.last_update = timestamp;
        }

        if (bucket.tokens >= cost) {
            bucket.tokens -= cost;
            cout << "1\n";
        } else {
            cout << "0\n";
        }
    }

    return 0;
}
`.trim(),
    type: ProblemType.CODING,
    editorial: `The problem requires implementing the Token Bucket algorithm for rate limiting on a multi-tenant API.

### High-level Flow:
1. We keep a map tracking each customer's bucket state: \`last_update_time\` and \`current_tokens\`.
2. When a request comes in:
   - Calculate \`elapsed = current_time - last_update_time\`.
   - Compute \`new_tokens = elapsed * refill_rate\`.
   - Update bucket tokens: \`current_tokens = min(capacity, current_tokens + new_tokens)\`.
   - Update \`last_update_time = current_time\`.
3. Check if \`current_tokens >= cost\`:
   - If yes, decrement by \`cost\` and return \`true\` (allowed).
   - If no, return \`false\` (denied) without decrementing.

### Critical Edge Cases:
- **Integer Overflow:** If \`elapsed\` is very large and \`refill_rate\` is also large, doing \`elapsed * refill_rate\` will overflow \`long long\` range.
  - *Mitigation:* Before multiplying, check if \`elapsed > capacity / refill_rate\`. If so, we cap the new tokens directly to \`capacity\` without doing the multiplication.
- **Same-timestamp requests (Burst/Concurrent traffic):** If multiple requests arrive at the exact same timestamp, \`elapsed\` is 0. In this case, no tokens should be refilled, and we just consume tokens sequentially.
- **Refill Rate = 0:** Ensure no division-by-zero occurs during overflow checks.`,
    companies: ["Cloudflare", "Stripe", "Google", "Amazon"]
  };

  console.log("📝 Upserting problem in DB...");
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
