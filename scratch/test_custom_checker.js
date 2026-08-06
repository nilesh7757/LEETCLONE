const vm = require("vm");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runTest() {
  // 1. Get the customChecker from the database
  const problem = await prisma.problem.findUnique({
    where: { slug: "alien-dictionary" }
  });
  
  const customChecker = problem.customChecker;
  if (!customChecker) {
    console.error("❌ No custom checker found in database!");
    process.exit(1);
  }
  
  console.log("Loaded custom checker from DB.");

  // Helper to run VM sandbox
  const check = (input, expectedOutput, actualOutput) => {
    const sandbox = {
      input,
      expectedOutput,
      actualOutput,
      result: false,
      console
    };
    try {
      vm.createContext(sandbox);
      vm.runInContext(customChecker, sandbox, { timeout: 1000 });
      return sandbox.result;
    } catch (e) {
      console.error("Error running checker:", e);
      return false;
    }
  };

  console.log("\n--- Testing Custom Checker ---");

  // Test 1: Standard Example 1 (Matching expected)
  const input1 = "5 5\nwrt\nwrf\ner\nett\nrftt";
  const res1_match = check(input1, "wertf", "wertf");
  console.log(`Test 1 (Exact Match): ${res1_match === true ? "✅ PASSED" : "❌ FAILED"} (got ${res1_match})`);

  // Test 2: Standard Example 1 (Invalid Order "wtref")
  const res1_invalid = check(input1, "wertf", "wtref");
  console.log(`Test 2 (Invalid Order): ${res1_invalid === false ? "✅ PASSED" : "❌ FAILED"} (got ${res1_invalid})`);

  // Test 3: Standard Example 2 (Matching expected "cab")
  const input2 = "3 3\ncaa\naaa\naab";
  const res2_match = check(input2, "cab", "cab");
  console.log(`Test 3 (Example 2 Match): ${res2_match === true ? "✅ PASSED" : "❌ FAILED"} (got ${res2_match})`);

  // Test 4: Cycle Case (Expected "Impossible", Actual "Impossible")
  const input3 = "3 2\nz\nx\nz";
  const res3_match = check(input3, "Impossible", "Impossible");
  console.log(`Test 4 (Cycle Impossible Match): ${res3_match === true ? "✅ PASSED" : "❌ FAILED"} (got ${res3_match})`);

  // Test 5: Cycle Case (Expected "Impossible", Actual "zx")
  const res3_invalid = check(input3, "Impossible", "zx");
  console.log(`Test 5 (Cycle Invalid Actual): ${res3_invalid === false ? "✅ PASSED" : "❌ FAILED"} (got ${res3_invalid})`);

  // Test 6: Multiple answer test case
  // Words: "ab", "cd". k=4.
  // Rules: a < c (only comparing mismatch). No other rules!
  // Valid topological sorts: "abcd", "bacd", "abdc", "badc", "acbd", "acdb", etc. (where a appears before c)
  // Invalid: "cabd", "cdab" (where c appears before a)
  const input4 = "2 4\nab\ncd";
  const expected4 = "abcd";
  const res4_abcd = check(input4, expected4, "abcd");
  const res4_cabd = check(input4, expected4, "cabd"); // invalid
  const res4_cdab = check(input4, expected4, "cdab"); // invalid
  const res4_bacd = check(input4, expected4, "bacd"); // valid
  
  console.log(`Test 6a (Multiple - abcd): ${res4_abcd === true ? "✅ PASSED" : "❌ FAILED"} (got ${res4_abcd})`);
  console.log(`Test 6b (Multiple - cabd): ${res4_cabd === false ? "✅ PASSED" : "❌ FAILED"} (got ${res4_cabd})`);
  console.log(`Test 6c (Multiple - cdab): ${res4_cdab === false ? "✅ PASSED" : "❌ FAILED"} (got ${res4_cdab})`);
  console.log(`Test 6d (Multiple - valid bacd): ${res4_bacd === true ? "✅ PASSED" : "❌ FAILED"} (got ${res4_bacd})`);

  // Test 7: Invalid prefix case
  // Input: "abc", "ab" -> Impossible
  const input5 = "2 2\nabc\nab";
  const res5_match = check(input5, "Impossible", "Impossible");
  const res5_invalid = check(input5, "Impossible", "ab");
  console.log(`Test 7a (Prefix Impossible Match): ${res5_match === true ? "✅ PASSED" : "❌ FAILED"} (got ${res5_match})`);
  console.log(`Test 7b (Prefix Invalid Actual): ${res5_invalid === false ? "✅ PASSED" : "❌ FAILED"} (got ${res5_invalid})`);

  process.exit(0);
}

runTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
