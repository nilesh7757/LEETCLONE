const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateTestCases() {
    const testCases = [];
    
    // Static examples
    testCases.push({ input: '\"(()\"', expectedOutput: '2' });
    testCases.push({ input: '\")()())\"', expectedOutput: '4' });
    testCases.push({ input: '\"\"', expectedOutput: '0' });
    testCases.push({ input: '\"()\"', expectedOutput: '2' });
    testCases.push({ input: '\"((()))\"', expectedOutput: '6' });
    testCases.push({ input: '\"()(()\"', expectedOutput: '2' });
    testCases.push({ input: '\")()())()()(\"', expectedOutput: '4' });
    
    // Generate up to 55
    const generateRandomStr = (len, validWeight = 0.5) => {
        let res = '';
        for (let i = 0; i < len; i++) {
            res += Math.random() < validWeight ? '(' : ')';
        }
        return res;
    };
    
    function solve(s) {
        let left = 0, right = 0, maxlength = 0;
        for (let i = 0; i < s.length; i++) {
            if (s[i] === '(') left++;
            else right++;
            if (left === right) maxlength = Math.max(maxlength, 2 * right);
            else if (right > left) left = right = 0;
        }
        left = right = 0;
        for (let i = s.length - 1; i >= 0; i--) {
            if (s[i] === '(') left++;
            else right++;
            if (left === right) maxlength = Math.max(maxlength, 2 * left);
            else if (left > right) left = right = 0;
        }
        return maxlength;
    }
    
    for (let i = testCases.length; i < 55; i++) {
        let len = 0;
        if (i < 20) len = Math.floor(Math.random() * 20) + 1;
        else if (i < 40) len = Math.floor(Math.random() * 1000) + 500;
        else len = Math.floor(Math.random() * 30000) + 10000;
        
        let validWeight = 0.5;
        if (i % 3 === 0) validWeight = 0.7; // more left
        if (i % 3 === 1) validWeight = 0.3; // more right
        
        let str = generateRandomStr(len, validWeight);
        // Sometimes just a completely valid string repeated
        if (i === 15) str = "()".repeat(len/2);
        if (i === 16) str = "(".repeat(len/2) + ")".repeat(len/2);
        
        let out = solve(str);
        testCases.push({
            input: `\"${str}\"`,
            expectedOutput: out.toString()
        });
    }
    return testCases;
}

const cppSolution = `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

class Solution {
public:
    int longestValidParentheses(string s) {
        int left = 0, right = 0, maxlength = 0;
        for (int i = 0; i < s.length(); i++) {
            if (s[i] == '(') {
                left++;
            } else {
                right++;
            }
            if (left == right) {
                maxlength = max(maxlength, 2 * right);
            } else if (right > left) {
                left = right = 0;
            }
        }
        left = right = 0;
        for (int i = s.length() - 1; i >= 0; i--) {
            if (s[i] == '(') {
                left++;
            } else {
                right++;
            }
            if (left == right) {
                maxlength = max(maxlength, 2 * left);
            } else if (left > right) {
                left = right = 0;
            }
        }
        return maxlength;
    }
};`;

const javaSolution = `class Solution {
    public int longestValidParentheses(String s) {
        int left = 0, right = 0, maxlength = 0;
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '(') {
                left++;
            } else {
                right++;
            }
            if (left == right) {
                maxlength = Math.max(maxlength, 2 * right);
            } else if (right > left) {
                left = right = 0;
            }
        }
        left = right = 0;
        for (int i = s.length() - 1; i >= 0; i--) {
            if (s.charAt(i) == '(') {
                left++;
            } else {
                right++;
            }
            if (left == right) {
                maxlength = Math.max(maxlength, 2 * left);
            } else if (left > right) {
                left = right = 0;
            }
        }
        return maxlength;
    }
}`;

const jsSolution = `/**
 * @param {string} s
 * @return {number}
 */
var longestValidParentheses = function(s) {
    let left = 0, right = 0, maxlength = 0;
    for (let i = 0; i < s.length; i++) {
        if (s[i] === '(') left++;
        else right++;
        if (left === right) maxlength = Math.max(maxlength, 2 * right);
        else if (right > left) left = right = 0;
    }
    left = right = 0;
    for (let i = s.length - 1; i >= 0; i--) {
        if (s[i] === '(') left++;
        else right++;
        if (left === right) maxlength = Math.max(maxlength, 2 * left);
        else if (left > right) left = right = 0;
    }
    return maxlength;
};`;

const pythonSolution = `class Solution:
    def longestValidParentheses(self, s: str) -> int:
        left = 0
        right = 0
        maxlength = 0
        
        for char in s:
            if char == '(':
                left += 1
            else:
                right += 1
            
            if left == right:
                maxlength = max(maxlength, 2 * right)
            elif right > left:
                left = right = 0
                
        left = right = 0
        for char in reversed(s):
            if char == '(':
                left += 1
            else:
                right += 1
            
            if left == right:
                maxlength = max(maxlength, 2 * left)
            elif left > right:
                left = right = 0
                
        return maxlength`;


const descriptionHtml = `Given a string containing just the characters <code>'('</code> and <code>')'</code>, return the length of the longest valid (well-formed) parentheses substring.

<div style="margin-top: 20px;">
  <h3 class="text-xl font-bold mb-4">Visualization of Valid Parentheses Substring</h3>
  <svg viewBox="0 0 600 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="200" fill="#1e1e1e" rx="10"/><text x="300" y="40" fill="#ffffff" font-family="monospace" font-size="20" text-anchor="middle">s = ") ( ) ( ) )"</text><text x="180" y="70" fill="#888" font-family="monospace" font-size="14" text-anchor="middle">0</text><text x="228" y="70" fill="#888" font-family="monospace" font-size="14" text-anchor="middle">1</text><text x="276" y="70" fill="#888" font-family="monospace" font-size="14" text-anchor="middle">2</text><text x="324" y="70" fill="#888" font-family="monospace" font-size="14" text-anchor="middle">3</text><text x="372" y="70" fill="#888" font-family="monospace" font-size="14" text-anchor="middle">4</text><text x="420" y="70" fill="#888" font-family="monospace" font-size="14" text-anchor="middle">5</text><text x="180" y="100" fill="#ff5555" font-family="monospace" font-size="24" text-anchor=\"middle\" font-weight=\"bold\">)</text><text x="228" y="100" fill="#55ff55" font-family="monospace" font-size="24" text-anchor="middle" font-weight="bold">(</text><text x="276" y="100" fill="#55ff55" font-family="monospace" font-size="24" text-anchor="middle" font-weight="bold">)</text><text x="324" y="100" fill="#55ff55" font-family="monospace" font-size="24" text-anchor="middle" font-weight="bold">(</text><text x="372" y="100" fill="#55ff55" font-family="monospace" font-size="24" text-anchor="middle" font-weight="bold">)</text><text x="420" y="100" fill="#ff5555" font-family="monospace" font-size="24" text-anchor="middle" font-weight="bold">)</text><rect x="210" y="75" width="180" height="35" fill="none" stroke="#55ff55" stroke-width="2" stroke-dasharray="4" rx="5"/><text x="300" y="140" fill="#55ff55" font-family="sans-serif" font-size="16" text-anchor="middle">Length: 4</text><text x="300" y="170" fill="#aaaaaa" font-family="sans-serif" font-size="14" text-anchor="middle">Indices 1 to 4 form the longest valid sequence</text></svg>
</div>`;

async function main() {
    const testSets = generateTestCases();
    
    await prisma.problem.update({
        where: {
            slug: "longest-valid-parentheses"
        },
        data: {
            description: descriptionHtml,
            testSets: testSets,
            referenceSolution: cppSolution
        }
    });
    
    console.log("Successfully updated Longest Valid Parentheses");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
