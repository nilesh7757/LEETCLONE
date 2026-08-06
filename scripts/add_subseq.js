const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateTestCases() {
    const testCases = [];
    
    // Static examples
    testCases.push({ input: '4\n3 5 6 7\n9', expectedOutput: '4' });
    testCases.push({ input: '4\n3 3 6 8\n10', expectedOutput: '6' });
    testCases.push({ input: '6\n2 3 3 4 6 7\n12', expectedOutput: '61' });
    testCases.push({ input: '1\n5\n5', expectedOutput: '1' });
    testCases.push({ input: '1\n5\n4', expectedOutput: '0' });
    testCases.push({ input: '2\n2 2\n4', expectedOutput: '3' });
    
    function solve(nums, target) {
        nums.sort((a, b) => a - b);
        let count = 0n;
        const MOD = 1000000007n;
        
        let left = 0, right = nums.length - 1;
        
        let pow2 = new Array(nums.length);
        pow2[0] = 1n;
        for (let i = 1; i < nums.length; i++) {
            pow2[i] = (pow2[i - 1] * 2n) % MOD;
        }
        
        while (left <= right) {
            if (nums[left] + nums[right] <= target) {
                count = (count + pow2[right - left]) % MOD;
                left++;
            } else {
                right--;
            }
        }
        return count.toString();
    }
    
    // Generate up to 55 test cases
    for (let i = testCases.length; i < 55; i++) {
        let len = 0;
        if (i < 20) len = Math.floor(Math.random() * 20) + 1;
        else if (i < 40) len = Math.floor(Math.random() * 1000) + 500;
        else len = Math.floor(Math.random() * 100000) + 50000;
        
        let nums = [];
        let maxVal = i < 30 ? 100 : 1000000;
        for (let j = 0; j < len; j++) {
            nums.push(Math.floor(Math.random() * maxVal) + 1);
        }
        
        let target = 0;
        if (i % 3 === 0) {
            target = nums[0] + nums[len - 1] + Math.floor(Math.random() * 10);
        } else if (i % 3 === 1) {
            target = Math.floor(Math.random() * maxVal);
        } else {
            target = Math.floor(Math.random() * maxVal * 2);
        }
        
        const ans = solve([...nums], target);
        testCases.push({
            input: `${len}\n${nums.join(' ')}\n${target}`,
            expectedOutput: ans
        });
    }
    return testCases;
}

const descriptionHtml = `<p>You are given an array of integers <code>nums</code> and an integer <code>target</code>.</p>
<p>Return the number of <strong>non-empty</strong> subsequences of <code>nums</code> such that the sum of the minimum and maximum element on it is less or equal to <code>target</code>. Since the answer may be too large, return it <strong>modulo</strong> <code>10<sup>9</sup> + 7</code>.</p>

<div style="margin-top: 20px;">
  <h3 class="text-xl font-bold mb-4">Visualization of Valid Subsequences</h3>
  <svg viewBox="0 0 600 250" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="250" fill="#1e1e1e" rx="10"/>
    
    <text x="300" y="40" fill="#ffffff" font-family="monospace" font-size="18" text-anchor="middle">nums = [3, 5, 6, 7], target = 9</text>
    
    <!-- Step 1 -->
    <rect x="50" y="70" width="80" height="30" fill="#444" rx="5"/>
    <text x="90" y="90" fill="#fff" font-family="monospace" font-size="14" text-anchor="middle">[3]</text>
    <text x="210" y="90" fill="#55ff55" font-family="monospace" font-size="14" text-anchor="middle">min:3, max:3 (3+3 <= 9)</text>

    <!-- Step 2 -->
    <rect x="50" y="110" width="80" height="30" fill="#444" rx="5"/>
    <text x="90" y="130" fill="#fff" font-family="monospace" font-size="14" text-anchor="middle">[3, 5]</text>
    <text x="210" y="130" fill="#55ff55" font-family="monospace" font-size="14" text-anchor="middle">min:3, max:5 (3+5 <= 9)</text>

    <!-- Step 3 -->
    <rect x="50" y="150" width="80" height="30" fill="#444" rx="5"/>
    <text x="90" y="170" fill="#fff" font-family="monospace" font-size="14" text-anchor="middle">[3, 5, 6]</text>
    <text x="210" y="170" fill="#55ff55" font-family="monospace" font-size="14" text-anchor="middle">min:3, max:6 (3+6 <= 9)</text>
    
    <!-- Step 4 -->
    <rect x="50" y="190" width="80" height="30" fill="#444" rx="5"/>
    <text x="90" y="210" fill="#fff" font-family="monospace" font-size="14" text-anchor="middle">[3, 6]</text>
    <text x="210" y="210" fill="#55ff55" font-family="monospace" font-size="14" text-anchor="middle">min:3, max:6 (3+6 <= 9)</text>
    
    <text x="450" y="150" fill="#ffaa00" font-family="sans-serif" font-size="24" text-anchor="middle" font-weight="bold">Total: 4</text>
  </svg>
</div>`;

const cppSolution = `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int numSubseq(vector<int>& nums, int target) {
        sort(nums.begin(), nums.end());
        int n = nums.size();
        int left = 0, right = n - 1;
        int count = 0;
        int MOD = 1e9 + 7;
        
        vector<int> pow2(n, 1);
        for (int i = 1; i < n; i++) {
            pow2[i] = (pow2[i - 1] * 2) % MOD;
        }
        
        while (left <= right) {
            if (nums[left] + nums[right] <= target) {
                count = (count + pow2[right - left]) % MOD;
                left++;
            } else {
                right--;
            }
        }
        
        return count;
    }
};

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    int target;
    cin >> target;
    Solution sol;
    cout << sol.numSubseq(nums, target) << "\\n";
    return 0;
}
`;

async function main() {
    console.log("Generating test cases...");
    const testSets = generateTestCases();
    console.log("Adding problem...");
    await prisma.problem.create({
        data: {
            title: "Number of Subsequences That Satisfy the Given Sum Condition",
            slug: "number-of-subsequences-that-satisfy-the-given-sum-condition",
            difficulty: "Medium",
            category: "Two Pointers",
            description: descriptionHtml,
            testSets: testSets,
            referenceSolution: cppSolution,
            type: "CODING",
            isPublic: true,
            isVerified: true
        }
    });
    console.log("Successfully added Number of Subsequences");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
