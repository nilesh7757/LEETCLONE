const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateTestCases() {
    const testCases = [];
    
    // Static examples
    // Example 1: edges = [2,2,3,-1], node1 = 0, node2 = 1 -> Output: 2
    testCases.push({ input: '4\n2 2 3 -1\n0 1', expectedOutput: '2' });
    // Example 2: edges = [1,2,-1], node1 = 0, node2 = 2 -> Output: 2
    testCases.push({ input: '3\n1 2 -1\n0 2', expectedOutput: '2' });
    // Edge case: unreachable
    testCases.push({ input: '3\n1 -1 -1\n0 2', expectedOutput: '-1' });
    // Edge case: self loop / small graph
    testCases.push({ input: '2\n1 0\n0 1', expectedOutput: '0' });
    // Cycle in graph
    testCases.push({ input: '4\n1 2 0 -1\n0 2', expectedOutput: '0' }); // Dist from 0->0 is 0. Dist 2->0 is 1. Max(0,1)=1. For 1: Dist 0->1 is 1, Dist 2->1 is 2. Max(1,2)=2. For 2: Dist 0->2 is 2, Dist 2->2 is 0. Max(2,0)=2. So 0 is smallest max dist.

    function solve(edges, node1, node2) {
        let n = edges.length;
        
        function getDists(start) {
            let dist = new Array(n).fill(-1);
            let curr = start;
            let d = 0;
            while (curr !== -1 && dist[curr] === -1) {
                dist[curr] = d++;
                curr = edges[curr];
            }
            return dist;
        }
        
        let dist1 = getDists(node1);
        let dist2 = getDists(node2);
        
        let minDist = Infinity;
        let bestNode = -1;
        
        for (let i = 0; i < n; i++) {
            if (dist1[i] !== -1 && dist2[i] !== -1) {
                let maxD = Math.max(dist1[i], dist2[i]);
                if (maxD < minDist) {
                    minDist = maxD;
                    bestNode = i;
                }
            }
        }
        
        return bestNode.toString();
    }
    
    // Generate up to 55 test cases
    for (let i = testCases.length; i < 55; i++) {
        let n = 0;
        if (i < 20) n = Math.floor(Math.random() * 20) + 2;
        else if (i < 40) n = Math.floor(Math.random() * 1000) + 500;
        else n = Math.floor(Math.random() * 9000) + 1000; // max 10^4
        
        let edges = new Array(n);
        for (let j = 0; j < n; j++) {
            // about 10% chance to be -1
            if (Math.random() < 0.1) {
                edges[j] = -1;
            } else {
                edges[j] = Math.floor(Math.random() * n);
            }
        }
        
        // Some tests can be permutation-like cycles
        if (i % 5 === 0) {
            for (let j = 0; j < n; j++) {
                edges[j] = (j + 1) % n;
            }
            if (n > 5) edges[n - 1] = -1;
        }
        
        let node1 = Math.floor(Math.random() * n);
        let node2 = Math.floor(Math.random() * n);
        
        const ans = solve(edges, node1, node2);
        testCases.push({
            input: `${n}\n${edges.join(' ')}\n${node1} ${node2}`,
            expectedOutput: ans
        });
    }
    return testCases;
}

const descriptionHtml = `<p>You are given a directed graph of <code>n</code> nodes numbered from <code>0</code> to <code>n - 1</code>, where each node has <strong>at most one</strong> outgoing edge.</p>

<p>The graph is represented with a given <strong>0-indexed</strong> array <code>edges</code> of size <code>n</code>, indicating that there is a directed edge from node <code>i</code> to node <code>edges[i]</code>. If there is no outgoing edge from <code>i</code>, then <code>edges[i] == -1</code>.</p>

<p>You are also given two integers <code>node1</code> and <code>node2</code>.</p>

<p>Return <em>the <strong>index</strong> of the node that can be reached from both <code>node1</code> and <code>node2</code>, such that the <strong>maximum</strong> between the distance from <code>node1</code> to that node, and from <code>node2</code> to that node is <strong>minimized</strong></em>.</p>

<p>If there are multiple answers, return the node with the <strong>smallest</strong> index, and if no possible answer exists, return <code>-1</code>.</p>

<p>Note that the distance between two nodes is the number of edges in the path between them.</p>

<div style="margin-top: 20px;">
  <h3 class="text-xl font-bold mb-4">Visualization of Nearest Meeting Cell</h3>
  <svg viewBox="0 0 600 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="300" fill="#1e1e1e" rx="10"/>
    
    <text x="300" y="40" fill="#ffffff" font-family="monospace" font-size="18" text-anchor="middle">edges = [2, 2, 3, -1], node1 = 0, node2 = 1</text>
    
    <!-- Nodes -->
    <circle cx="150" cy="120" r="25" fill="#3b82f6" stroke="#1d4ed8" stroke-width="3"/>
    <text x="150" y="126" fill="#ffffff" font-family="monospace" font-size="18" text-anchor="middle" font-weight="bold">0</text>
    
    <circle cx="150" cy="220" r="25" fill="#ef4444" stroke="#b91c1c" stroke-width="3"/>
    <text x="150" y="226" fill="#ffffff" font-family="monospace" font-size="18" text-anchor="middle" font-weight="bold">1</text>
    
    <circle cx="300" cy="170" r="25" fill="#22c55e" stroke="#15803d" stroke-width="3"/>
    <text x="300" y="176" fill="#ffffff" font-family="monospace" font-size="18" text-anchor="middle" font-weight="bold">2</text>
    
    <circle cx="450" cy="170" r="25" fill="#4b5563" stroke="#374151" stroke-width="3"/>
    <text x="450" y="176" fill="#ffffff" font-family="monospace" font-size="18" text-anchor="middle" font-weight="bold">3</text>

    <!-- Edges -->
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="25" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#aaaaaa" />
      </marker>
    </defs>
    
    <!-- 0 -> 2 -->
    <path d="M 172 133 L 278 157" stroke="#aaaaaa" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
    <!-- 1 -> 2 -->
    <path d="M 172 207 L 278 183" stroke="#aaaaaa" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
    <!-- 2 -> 3 -->
    <path d="M 325 170 L 425 170" stroke="#aaaaaa" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
    
    <!-- Explanation -->
    <text x="150" y="90" fill="#3b82f6" font-family="monospace" font-size="14" text-anchor="middle">node1</text>
    <text x="150" y="265" fill="#ef4444" font-family="monospace" font-size="14" text-anchor="middle">node2</text>
    <text x="300" y="130" fill="#22c55e" font-family="monospace" font-size="14" text-anchor="middle">Meeting Node</text>

    <rect x="50" y="260" width="500" height="30" fill="none" stroke="#22c55e" stroke-dasharray="4" rx="5"/>
    <text x="300" y="280" fill="#ffffff" font-family="sans-serif" font-size="14" text-anchor="middle">Max dist: max(dist(0,2), dist(1,2)) = max(1, 1) = 1</text>
  </svg>
</div>`;

const cppSolution = `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int closestMeetingNode(vector<int>& edges, int node1, int node2) {
        int n = edges.size();
        
        auto getDists = [&](int start) {
            vector<int> dist(n, -1);
            int curr = start;
            int d = 0;
            while (curr != -1 && dist[curr] == -1) {
                dist[curr] = d++;
                curr = edges[curr];
            }
            return dist;
        };
        
        vector<int> dist1 = getDists(node1);
        vector<int> dist2 = getDists(node2);
        
        int minDist = 1e9;
        int bestNode = -1;
        
        for (int i = 0; i < n; i++) {
            if (dist1[i] != -1 && dist2[i] != -1) {
                int maxD = max(dist1[i], dist2[i]);
                if (maxD < minDist) {
                    minDist = maxD;
                    bestNode = i;
                }
            }
        }
        
        return bestNode;
    }
};

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> edges(n);
    for (int i = 0; i < n; i++) {
        cin >> edges[i];
    }
    int node1, node2;
    cin >> node1 >> node2;
    
    Solution sol;
    cout << sol.closestMeetingNode(edges, node1, node2) << "\n";
    return 0;
}
`;

async function main() {
    console.log("Generating test cases...");
    const testSets = generateTestCases();
    console.log("Adding problem...");
    await prisma.problem.upsert({
        where: { slug: "nearest-meeting-cell" },
        update: {
            title: "Nearest Meeting Cell",
            difficulty: "Medium",
            category: "Graphs",
            description: descriptionHtml,
            testSets: testSets,
            referenceSolution: cppSolution,
            type: "CODING",
            isPublic: true,
            isVerified: true
        },
        create: {
            title: "Nearest Meeting Cell",
            slug: "nearest-meeting-cell",
            difficulty: "Medium",
            category: "Graphs",
            description: descriptionHtml,
            testSets: testSets,
            referenceSolution: cppSolution,
            type: "CODING",
            isPublic: true,
            isVerified: true
        }
    });
    console.log("Successfully added Nearest Meeting Cell");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
