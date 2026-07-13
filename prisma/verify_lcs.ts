// Verification script: compile the C++ solution and run all 30 test cases
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const dir = path.resolve(__dirname);
const cppFile = path.join(dir, "verify_lcs.cpp");
const exeFile = path.join(dir, "verify_lcs.exe");

// Compile
console.log("🔨 Compiling C++ reference solution...");
try {
  execSync(`g++ -std=c++17 -O2 -o "${exeFile}" "${cppFile}"`, { stdio: "inherit" });
  console.log("✅ Compilation successful!\n");
} catch (e) {
  console.error("❌ Compilation failed!");
  process.exit(1);
}

// All 30 test cases with manually computed expected outputs
const testCases = [
  // === EXAMPLE CASES (3) ===
  { id: 1, input: "6\n100 4 200 1 3 2", expected: "4", note: "Classic: 1,2,3,4" },
  { id: 2, input: "10\n0 3 7 2 5 8 4 6 0 1", expected: "9", note: "0 through 8, with duplicate 0" },
  { id: 3, input: "3\n-1 0 1", expected: "3", note: "Negative to positive span" },

  // === SINGLE ELEMENT (2) ===
  { id: 4, input: "1\n1", expected: "1", note: "Single element" },
  { id: 5, input: "1\n0", expected: "1", note: "Single zero" },

  // === ALREADY SORTED / REVERSE SORTED (2) ===
  { id: 6, input: "5\n1 2 3 4 5", expected: "5", note: "Already sorted consecutive" },
  { id: 7, input: "5\n5 4 3 2 1", expected: "5", note: "Reverse sorted consecutive" },

  // === NO CONSECUTIVE ELEMENTS (2) ===
  { id: 8, input: "5\n1 3 5 7 9", expected: "1", note: "All odd, no consecutive pair" },
  { id: 9, input: "5\n100 200 300 400 500", expected: "1", note: "Large gaps, no consecutive" },

  // === ALL DUPLICATES (1) ===
  { id: 10, input: "4\n1 1 1 1", expected: "1", note: "All same elements" },

  // === NEGATIVE NUMBERS (3) ===
  { id: 11, input: "5\n-5 -4 -3 -2 -1", expected: "5", note: "All negative consecutive" },
  { id: 12, input: "7\n-3 -2 -1 0 1 2 3", expected: "7", note: "Negative to positive" },
  { id: 13, input: "5\n1 0 -1 -2 2", expected: "5", note: "Shuffled -2 to 2" },

  // === DUPLICATES WITH CONSECUTIVE (2) ===
  { id: 14, input: "4\n1 2 0 1", expected: "3", note: "Duplicate 1, sequence 0,1,2" },
  { id: 15, input: "6\n4 2 2 3 1 5", expected: "5", note: "Duplicate 2, sequence 1-5" },

  // === MULTIPLE DISJOINT SEQUENCES (3) ===
  { id: 16, input: "7\n1 2 3 100 101 102 103", expected: "4", note: "Two sequences: 1-3 and 100-103" },
  { id: 17, input: "8\n1 2 3 10 11 12 20 21", expected: "3", note: "Three sequences: max is 3" },
  { id: 18, input: "9\n-10 -9 -8 5 6 7 8 9 10", expected: "6", note: "Neg seq(3) vs pos seq(6)" },

  // === SHUFFLED FULL SEQUENCE (2) ===
  { id: 19, input: "5\n1 3 5 2 4", expected: "5", note: "Shuffled 1-5" },
  { id: 20, input: "10\n5 6 1 2 8 9 3 7 4 10", expected: "10", note: "Shuffled 1-10" },

  // === DUPLICATES WITH GAPS (2) ===
  { id: 21, input: "6\n7 7 7 8 8 9", expected: "3", note: "Duplicates 7,8 with seq 7,8,9" },
  { id: 22, input: "3\n10 30 20", expected: "1", note: "No consecutive at all" },

  // === MIXED NEGATIVE/POSITIVE COMPLEX (3) ===
  { id: 23, input: "11\n9 1 4 7 3 -1 0 5 8 -1 6", expected: "7", note: "Seq 3-9 = 7" },
  { id: 24, input: "10\n3 -2 7 10 -1 0 1 2 8 9", expected: "6", note: "Seq -2 to 3 = 6" },
  { id: 25, input: "7\n0 -1 1 -2 2 -3 3", expected: "7", note: "-3 to 3" },

  // === TWO ELEMENTS (2) ===
  { id: 26, input: "2\n1 2", expected: "2", note: "Two consecutive" },
  { id: 27, input: "2\n2 1", expected: "2", note: "Two consecutive reversed" },

  // === EDGE: INT OVERFLOW (1) ===
  { id: 28, input: "2\n2147483647 -2147483648", expected: "1", note: "INT_MAX and INT_MIN, no consecutive" },

  // === MEDIUM SIZE (2) ===
  { id: 29, input: "9\n10 5 12 3 55 30 4 11 2", expected: "4", note: "Seq 2-5 = 4" },
  { id: 30, input: "15\n8 4 2 10 3 1 5 7 9 6 20 21 22 23 24", expected: "10", note: "Seq 1-10 = 10 vs 20-24 = 5" },
];

console.log(`🧪 Running ${testCases.length} test cases...\n`);

let passed = 0;
let failed = 0;
const failures: { id: number; note: string; expected: string; actual: string; input: string }[] = [];

for (const tc of testCases) {
  try {
    const actual = execSync(`echo ${tc.input.replace(/\n/g, "& echo ")} | "${exeFile}"`, {
      shell: "cmd.exe",
      timeout: 5000,
    })
      .toString()
      .trim();

    if (actual === tc.expected) {
      console.log(`  ✅ Case #${tc.id}: PASS  (expected=${tc.expected}, got=${actual}) — ${tc.note}`);
      passed++;
    } else {
      console.log(`  ❌ Case #${tc.id}: FAIL  (expected=${tc.expected}, got=${actual}) — ${tc.note}`);
      failed++;
      failures.push({ id: tc.id, note: tc.note, expected: tc.expected, actual, input: tc.input });
    }
  } catch (err: any) {
    console.log(`  💥 Case #${tc.id}: ERROR — ${err.message}`);
    failed++;
    failures.push({ id: tc.id, note: tc.note, expected: tc.expected, actual: "ERROR", input: tc.input });
  }
}

console.log(`\n${"=".repeat(60)}`);
console.log(`📊 Results: ${passed}/${testCases.length} passed, ${failed} failed`);

if (failures.length > 0) {
  console.log("\n❌ Failed cases:");
  for (const f of failures) {
    console.log(`   Case #${f.id}: expected="${f.expected}" actual="${f.actual}" — ${f.note}`);
    console.log(`     Input: ${f.input.replace(/\n/g, " | ")}`);
  }
}

// Cleanup
try {
  fs.unlinkSync(exeFile);
  fs.unlinkSync(cppFile);
} catch {}

process.exit(failed > 0 ? 1 : 0);
