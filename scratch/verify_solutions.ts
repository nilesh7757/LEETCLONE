import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function runPythonSolution(code: string, input: string): Promise<string> {
  const tempFile = path.join(__dirname, 'temp_solution.py');
  fs.writeFileSync(tempFile, code);

  let pythonCmd = 'python';
  // Try running with standard python commands
  try {
    const output = execSync(`${pythonCmd} "${tempFile}"`, {
      input,
      encoding: 'utf8',
      timeout: 3000,
    });
    fs.unlinkSync(tempFile);
    return output.trim();
  } catch (err) {
    // If standard python fails, try python3
    try {
      pythonCmd = 'python3';
      const output = execSync(`${pythonCmd} "${tempFile}"`, {
        input,
        encoding: 'utf8',
        timeout: 3000,
      });
      fs.unlinkSync(tempFile);
      return output.trim();
    } catch (err2) {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      throw new Error(`Python execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

async function main() {
  const slugs = ['rotting-oranges', 'critical-connections'];

  for (const slug of slugs) {
    console.log(`\n========================================`);
    console.log(`Verifying problem: ${slug}`);
    console.log(`========================================`);

    const problem = await prisma.problem.findUnique({
      where: { slug }
    });

    if (!problem) {
      console.error(`❌ Problem not found in database: ${slug}`);
      continue;
    }

    const testSets = problem.testSets as any[];
    const referenceSolution = problem.referenceSolution;

    if (!referenceSolution) {
      console.error(`❌ Reference solution is missing for: ${slug}`);
      continue;
    }

    console.log(`Found ${testSets.length} test cases.`);
    let passed = 0;
    let failed = 0;

    for (let i = 0; i < testSets.length; i++) {
      const tc = testSets[i];
      const input = tc.input;
      const expected = tc.expectedOutput.trim();

      try {
        const actual = (await runPythonSolution(referenceSolution, input)).replace(/\r\n/g, '\n').trim();
        const normalizedExpected = expected.replace(/\r\n/g, '\n').trim();
        if (actual === normalizedExpected) {
          passed++;
        } else {
          failed++;
          console.log(`❌ Case #${i} FAILED:`);
          console.log(`   Input:\n${input}`);
          console.log(`   Expected: "${expected}"`);
          console.log(`   Actual:   "${actual}"`);
        }
      } catch (err) {
        failed++;
        console.log(`💥 Case #${i} ERROR: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    console.log(`\n📊 Verification result for ${slug}: ${passed}/${testSets.length} PASSED, ${failed} FAILED`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
