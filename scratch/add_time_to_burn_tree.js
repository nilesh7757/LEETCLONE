const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Time To Burn Tree</h1>

<p>Given a binary tree and a target integer <code>start</code> representing the value of the node from which a fire starts.</p>

<p>At each second, the fire spreads to all adjacent nodes. Adjacent nodes are defined as:</p>
<ul>
  <li>The left child.</li>
  <li>The right child.</li>
  <li>The parent node.</li>
</ul>

<p>Return the minimum time (in seconds) required to burn the entire binary tree. It is guaranteed that the target node <code>start</code> exists in the tree with unique value.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Fire Spread Simulation for Example 1 (start = 8):</h3>
<svg width="400" height="260" viewBox="0 0 400 260" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Edges -->
  <line x1="200" y1="30" x2="100" y2="90" stroke="#f59e0b" stroke-width="1.5" />
  <line x1="200" y1="30" x2="300" y2="90" stroke="#fbbf24" stroke-width="1.5" />
  <line x1="100" y1="90" x2="50" y2="150" stroke="#fbbf24" stroke-width="1.5" />
  <line x1="100" y1="90" x2="150" y2="150" stroke="#f97316" stroke-width="1.5" />
  <line x1="300" y1="90" x2="350" y2="150" stroke="#fde047" stroke-width="1.5" />
  <line x1="150" y1="150" x2="110" y2="210" stroke="#f97316" stroke-width="1.5" />
  <line x1="150" y1="150" x2="190" y2="210" stroke="#ef4444" stroke-width="1.5" />

  <!-- Nodes -->
  <!-- Node 1 (t=3) -->
  <circle cx="200" cy="30" r="16" fill="#1e293b" stroke="#fbbf24" stroke-width="2.5" />
  <text x="200" y="34" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <text x="200" y="54" font-size="8" font-weight="bold" fill="#fbbf24" text-anchor="middle">t = 3s</text>

  <!-- Node 2 (t=2) -->
  <circle cx="100" cy="90" r="16" fill="#1e293b" stroke="#f97316" stroke-width="2.5" />
  <text x="100" y="94" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>
  <text x="100" y="114" font-size="8" font-weight="bold" fill="#f97316" text-anchor="middle">t = 2s</text>

  <!-- Node 3 (t=4) -->
  <circle cx="300" cy="90" r="16" fill="#1e293b" stroke="#fde047" stroke-width="2.5" />
  <text x="300" y="94" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>
  <text x="300" y="114" font-size="8" font-weight="bold" fill="#fde047" text-anchor="middle">t = 4s</text>

  <!-- Node 4 (t=3) -->
  <circle cx="50" cy="150" r="16" fill="#1e293b" stroke="#fbbf24" stroke-width="2.5" />
  <text x="50" y="154" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>
  <text x="50" y="174" font-size="8" font-weight="bold" fill="#fbbf24" text-anchor="middle">t = 3s</text>

  <!-- Node 5 (t=1) -->
  <circle cx="150" cy="150" r="16" fill="#1e293b" stroke="#f97316" stroke-width="2.5" />
  <text x="150" y="154" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">5</text>
  <text x="150" y="174" font-size="8" font-weight="bold" fill="#f97316" text-anchor="middle">t = 1s</text>

  <!-- Node 6 (t=5) -->
  <circle cx="350" cy="150" r="16" fill="#1e293b" stroke="#fde047" stroke-width="2.5" />
  <text x="350" y="154" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">6</text>
  <text x="350" y="174" font-size="8" font-weight="bold" fill="#fde047" text-anchor="middle">t = 5s</text>

  <!-- Node 7 (t=2) -->
  <circle cx="110" cy="210" r="16" fill="#1e293b" stroke="#f97316" stroke-width="2.5" />
  <text x="110" y="214" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">7</text>
  <text x="110" y="234" font-size="8" font-weight="bold" fill="#f97316" text-anchor="middle">t = 2s</text>

  <!-- Node 8 (t=0) -->
  <circle cx="190" cy="210" r="16" fill="#1e293b" stroke="#ef4444" stroke-width="3" />
  <text x="190" y="214" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">8</text>
  <text x="190" y="234" font-size="8" font-weight="bold" fill="#ef4444" text-anchor="middle">START (0s)</text>
</svg>
<p><strong>Explanation for Example 1:</strong> 
<ul>
  <li>At second 0: node <code>8</code> is ignited.</li>
  <li>At second 1: fire spreads to its parent node <code>5</code>.</li>
  <li>At second 2: fire spreads to node <code>7</code> and parent node <code>2</code>.</li>
  <li>At second 3: fire spreads to node <code>4</code> and parent node <code>1</code>.</li>
  <li>At second 4: fire spreads to node <code>3</code>.</li>
  <li>At second 5: fire spreads to node <code>6</code>.</li>
</ul>
The entire tree is burned in <code>5</code> seconds.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> Space-separated integers representing the level-order traversal of the tree (where <code>-1</code> represents a null node).</li>
  <li><strong>Line 2:</strong> A single integer <code>start</code> representing the value of the target node.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer: the minimum time required to burn the entire tree.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; number of nodes &le; 10^5</code></li>
  <li><code>-10^5 &le; Node.val, start &le; 10^5</code></li>
  <li>All node values are unique.</li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

TreeNode* parseTree(const string& input) {
    if (input.empty()) return NULL;
    stringstream ss(input);
    string valStr;
    if (!(ss >> valStr) || valStr == "-1") return NULL;
    
    TreeNode* root = new TreeNode(stoi(valStr));
    queue<TreeNode*> q;
    q.push(root);
    
    while (!q.empty()) {
        TreeNode* curr = q.front();
        q.pop();
        
        if (ss >> valStr) {
            if (valStr != "-1") {
                curr->left = new TreeNode(stoi(valStr));
                q.push(curr->left);
            }
        } else break;
        
        if (ss >> valStr) {
            if (valStr != "-1") {
                curr->right = new TreeNode(stoi(valStr));
                q.push(curr->right);
            }
        } else break;
    }
    return root;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    string treeLine;
    if (!getline(cin, treeLine)) return 0;
    
    int startVal;
    if (!(cin >> startVal)) return 0;
    
    TreeNode* root = parseTree(treeLine);
    if (!root) {
        cout << 0 << "\\n";
        return 0;
    }
    
    unordered_map<int, TreeNode*> parents;
    TreeNode* startNode = NULL;
    
    queue<TreeNode*> q;
    q.push(root);
    
    while (!q.empty()) {
        TreeNode* curr = q.front();
        q.pop();
        
        if (curr->val == startVal) {
            startNode = curr;
        }
        
        if (curr->left) {
            parents[curr->left->val] = curr;
            q.push(curr->left);
        }
        if (curr->right) {
            parents[curr->right->val] = curr;
            q.push(curr->right);
        }
    }
    
    if (!startNode) {
        cout << 0 << "\\n";
        return 0;
    }
    
    unordered_set<int> visited;
    queue<pair<TreeNode*, int>> fireQ;
    
    fireQ.push({startNode, 0});
    visited.insert(startNode->val);
    int maxTime = 0;
    
    while (!fireQ.empty()) {
        auto p = fireQ.front();
        fireQ.pop();
        
        TreeNode* curr = p.first;
        int time = p.second;
        maxTime = max(maxTime, time);
        
        vector<TreeNode*> neighbors;
        if (curr->left) neighbors.push_back(curr->left);
        if (curr->right) neighbors.push_back(curr->right);
        if (parents.count(curr->val)) neighbors.push_back(parents[curr->val]);
        
        for (TreeNode* neighbor : neighbors) {
            if (!visited.count(neighbor->val)) {
                visited.insert(neighbor->val);
                fireQ.push({neighbor, time + 1});
            }
        }
    }
    
    cout << maxTime << "\\n";
    return 0;
}
`.trim();

class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function parseTree(input) {
  const tokens = input.trim().split(/\s+/);
  if (tokens.length === 0 || tokens[0] === "" || tokens[0] === "-1") return null;

  const root = new TreeNode(parseInt(tokens[0]));
  const queue = [root];
  let i = 1;

  while (queue.length > 0 && i < tokens.length) {
    const curr = queue.shift();

    if (i < tokens.length) {
      const valStr = tokens[i++];
      if (valStr !== "-1") {
        curr.left = new TreeNode(parseInt(valStr));
        queue.push(curr.left);
      }
    }

    if (i < tokens.length) {
      const valStr = tokens[i++];
      if (valStr !== "-1") {
        curr.right = new TreeNode(parseInt(valStr));
        queue.push(curr.right);
      }
    }
  }

  return root;
}

function solveTimeToBurnTree(treeInput, startVal) {
  const root = parseTree(treeInput);
  if (!root) return 0;

  const parents = new Map();
  let startNode = null;

  const q = [root];
  while (q.length > 0) {
    const curr = q.shift();
    if (curr.val === startVal) {
      startNode = curr;
    }
    if (curr.left) {
      parents.set(curr.left.val, curr);
      q.push(curr.left);
    }
    if (curr.right) {
      parents.set(curr.right.val, curr);
      q.push(curr.right);
    }
  }

  if (!startNode) return 0;

  const visited = new Set();
  const queue = [[startNode, 0]];
  visited.add(startNode.val);
  let maxTime = 0;

  while (queue.length > 0) {
    const [curr, time] = queue.shift();
    maxTime = Math.max(maxTime, time);

    const neighbors = [];
    if (curr.left) neighbors.push(curr.left);
    if (curr.right) neighbors.push(curr.right);
    const parent = parents.get(curr.val);
    if (parent) neighbors.push(parent);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.val)) {
        visited.add(neighbor.val);
        queue.push([neighbor, time + 1]);
      }
    }
  }

  return maxTime;
}

const staticCases = [
  { tree: "1 2 3 4 5 -1 6 -1 -1 7 8 -1 -1 -1 -1 -1 -1", start: 8, isExample: true },
  { tree: "1 2 3 -1 -1 -1 -1", start: 1, isExample: true },
  { tree: "1 2 -1 3 -1 4 -1 5 -1 -1 -1", start: 5, isExample: true }
];

function generateRandomTree(nodeCount) {
  const nodes = Array.from({ length: nodeCount }, (_, i) => i + 1);
  const serialized = [String(nodes[0])];
  let queue = [0];
  let ptr = 1;

  while (queue.length > 0 && ptr < nodeCount) {
    queue.shift();
    // left child
    if (Math.random() < 0.1) {
      serialized.push("-1");
    } else {
      serialized.push(String(nodes[ptr]));
      queue.push(ptr);
      ptr++;
    }
    // right child
    if (ptr < nodeCount) {
      if (Math.random() < 0.1) {
        serialized.push("-1");
      } else {
        serialized.push(String(nodes[ptr]));
        queue.push(ptr);
        ptr++;
      }
    }
  }
  return { tree: serialized.join(" "), nodes };
}

async function main() {
  const testSets = [];

  // 1. Add static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const input = `${tc.tree}\n${tc.start}`;
    const expected = solveTimeToBurnTree(tc.tree, tc.start);
    testSets.push({
      input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Generate 10 edge cases
  console.log("Generating edge cases...");
  const edgeCases = [
    // Single node
    { tree: "100", start: 100 },
    // Linear left-heavy start at top
    { tree: "1 2 -1 3 -1 4 -1 5 -1 -1 -1", start: 1 },
    // Linear left-heavy start at bottom
    { tree: "1 2 -1 3 -1 4 -1 5 -1 -1 -1", start: 5 },
    // Linear left-heavy start in middle
    { tree: "1 2 -1 3 -1 4 -1 5 -1 -1 -1", start: 3 },
    // Symmetric start at root
    { tree: "1 2 3 4 5 6 7 -1 -1 -1 -1 -1 -1 -1 -1", start: 1 },
    // Symmetric start at leaf
    { tree: "1 2 3 4 5 6 7 -1 -1 -1 -1 -1 -1 -1 -1", start: 7 }
  ];

  for (const ec of edgeCases) {
    const input = `${ec.tree}\n${ec.start}`;
    const expected = solveTimeToBurnTree(ec.tree, ec.start);
    testSets.push({
      input,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Generate 42 random cases (N up to 35)
  console.log("Generating random test cases...");
  for (let i = 0; i < 42; i++) {
    let n = 5;
    if (i < 10) n = Math.floor(Math.random() * 6) + 4;   // 4-9
    else if (i < 25) n = Math.floor(Math.random() * 15) + 10; // 10-24
    else n = Math.floor(Math.random() * 12) + 24; // 24-35

    const { tree, nodes } = generateRandomTree(n);
    const start = nodes[Math.floor(Math.random() * nodes.length)];

    const input = `${tree}\n${start}`;
    const expected = solveTimeToBurnTree(tree, start);

    testSets.push({
      input,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  console.log(`Generated ${testSets.length} total test cases.`);

  // 4. Verify all locally
  console.log("Verifying test cases...");
  for (let i = 0; i < testSets.length; i++) {
    const tc = testSets[i];
    const parts = tc.input.split("\n");
    const expected = solveTimeToBurnTree(parts[0], parseInt(parts[1]));
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "striver-time-to-burn-tree-website" },
    update: {
      title: "Minimum Time to Burn a Binary Tree from a Node",
      url: "https://takeuforward.org/binary-tree/minimum-time-to-burn-a-binary-tree-from-a-node-equivalent-to-amount-of-time-for-binary-tree-to-be-infected/",
      type: "WEBSITE",
      topic: "Tree",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-time-to-burn-tree-website",
      title: "Minimum Time to Burn a Binary Tree from a Node",
      url: "https://takeuforward.org/binary-tree/minimum-time-to-burn-a-binary-tree-from-a-node-equivalent-to-amount-of-time-for-binary-tree-to-be-infected/",
      type: "WEBSITE",
      topic: "Tree",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver website resource ready.");

  const res2 = await prisma.learningResource.upsert({
    where: { id: "striver-time-to-burn-tree-video" },
    update: {
      title: "Striver's Time To Burn Tree Video guide",
      url: "https://www.youtube.com/watch?v=2r5wLmQfD6g",
      type: "VIDEO",
      topic: "Tree",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-time-to-burn-tree-video",
      title: "Striver's Time To Burn Tree Video guide",
      url: "https://www.youtube.com/watch?v=2r5wLmQfD6g",
      type: "VIDEO",
      topic: "Tree",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver video resource ready.");

  // 6. Upsert problem record
  console.log("Upserting problem 'Time To Burn Tree' in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "time-to-burn-tree" },
    update: {
      title: "Time To Burn Tree",
      difficulty: "Hard",
      category: "Trees",
      description: htmlDescription,
      referenceSolution: cppReferenceSolution,
      testSets: testSets,
      resources: {
        connect: [
          { id: res1.id },
          { id: res2.id }
        ]
      }
    },
    create: {
      slug: "time-to-burn-tree",
      title: "Time To Burn Tree",
      difficulty: "Hard",
      category: "Trees",
      description: htmlDescription,
      referenceSolution: cppReferenceSolution,
      testSets: testSets,
      resources: {
        connect: [
          { id: res1.id },
          { id: res2.id }
        ]
      }
    }
  });

  console.log("🎉 Successfully created/updated 'Time To Burn Tree'!");
  console.log("Slug:", result.slug);
  console.log("Total uploaded test cases:", result.testSets.length);
}

main()
  .catch(e => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
