const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Boundary Traversal of Binary Tree</h1>

<p>Given the root of a binary tree, return the values of its boundary in <strong>anti-clockwise</strong> direction starting from the root.</p>

<p>The boundary of a binary tree includes:</p>
<ol>
  <li>The <strong>left boundary</strong> (the path from the root to the left-most node, excluding leaf nodes).</li>
  <li>The <strong>leaf nodes</strong> (from left to right).</li>
  <li>The <strong>right boundary</strong> in reverse order (the path from the root to the right-most node, excluding leaf nodes).</li>
</ol>

<p>Note: If the root node is a leaf node, return <code>[root.val]</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Tree Boundary & Traversal for Example 1:</h3>
<svg width="400" height="250" viewBox="0 0 400 250" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Edges -->
  <!-- 1-2 (Green) -->
  <line x1="200" y1="30" x2="100" y2="90" stroke="#10b981" stroke-width="2" />
  <!-- 1-3 (Green) -->
  <line x1="200" y1="30" x2="300" y2="90" stroke="#10b981" stroke-width="2" />

  <!-- 2-4 (Green) -->
  <line x1="100" y1="90" x2="50" y2="150" stroke="#10b981" stroke-width="2" />
  <!-- 2-5 (Gray) -->
  <line x1="100" y1="90" x2="150" y2="150" stroke="#475569" stroke-width="1.5" />

  <!-- 3-6 (Green) -->
  <line x1="300" y1="90" x2="350" y2="150" stroke="#10b981" stroke-width="2" />

  <!-- 5-7 (Green) -->
  <line x1="150" y1="150" x2="110" y2="210" stroke="#10b981" stroke-width="2" />
  <!-- 5-8 (Green) -->
  <line x1="150" y1="150" x2="190" y2="210" stroke="#10b981" stroke-width="2" />

  <!-- Nodes -->
  <!-- Node 1 -->
  <circle cx="200" cy="30" r="15" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="200" y="34" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>

  <!-- Node 2 -->
  <circle cx="100" cy="90" r="15" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="100" y="94" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>

  <!-- Node 3 -->
  <circle cx="300" cy="90" r="15" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="300" y="94" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>

  <!-- Node 4 -->
  <circle cx="50" cy="150" r="15" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="50" y="154" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>

  <!-- Node 5 -->
  <circle cx="150" cy="150" r="15" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="150" y="154" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">5</text>

  <!-- Node 6 -->
  <circle cx="350" cy="150" r="15" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="350" y="154" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">6</text>

  <!-- Node 7 -->
  <circle cx="110" cy="210" r="15" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="110" y="214" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">7</text>

  <!-- Node 8 -->
  <circle cx="190" cy="210" r="15" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="190" y="214" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">8</text>
</svg>
<p><strong>Explanation for Example 1:</strong> 
<ul>
  <li>Left boundary nodes: <code>[1, 2]</code> (leaf 4 is excluded).</li>
  <li>Leaf nodes (left-to-right): <code>[4, 7, 8, 6]</code>.</li>
  <li>Right boundary nodes (reversed): <code>[3]</code> (leaf 6 is excluded, root 1 is already visited).</li>
</ul>
Combining them in anti-clockwise order yields: <code>1 2 4 7 8 6 3</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li>A single line containing space-separated integers representing the level-order traversal of the tree (where <code>-1</code> represents a null node).</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print space-separated integers representing the boundary traversal of the binary tree.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; number of nodes &le; 10^5</code></li>
  <li><code>-10^5 &le; Node.val &le; 10^5</code></li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <queue>
#include <string>
#include <sstream>

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

bool isLeaf(TreeNode* node) {
    return node && !node->left && !node->right;
}

void addLeftBoundary(TreeNode* root, vector<int>& res) {
    TreeNode* curr = root->left;
    while (curr) {
        if (!isLeaf(curr)) res.push_back(curr->val);
        if (curr->left) curr = curr->left;
        else curr = curr->right;
    }
}

void addLeaves(TreeNode* node, vector<int>& res) {
    if (!node) return;
    if (isLeaf(node)) {
        res.push_back(node->val);
        return;
    }
    addLeaves(node->left, res);
    addLeaves(node->right, res);
}

void addRightBoundary(TreeNode* root, vector<int>& res) {
    TreeNode* curr = root->right;
    vector<int> temp;
    while (curr) {
        if (!isLeaf(curr)) temp.push_back(curr->val);
        if (curr->right) curr = curr->right;
        else curr = curr->left;
    }
    for (int i = (int)temp.size() - 1; i >= 0; --i) {
        res.push_back(temp[i]);
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    string line;
    if (getline(cin, line)) {
        TreeNode* root = parseTree(line);
        if (!root) return 0;
        
        vector<int> res;
        if (!isLeaf(root)) {
            res.push_back(root->val);
        }
        addLeftBoundary(root, res);
        addLeaves(root, res);
        addRightBoundary(root, res);
        
        for (size_t i = 0; i < res.size(); ++i) {
            cout << res[i] << (i == res.size() - 1 ? "" : " ");
        }
        cout << "\\n";
    }
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

function isLeaf(node) {
  return node && !node.left && !node.right;
}

function addLeftBoundary(root, res) {
  let curr = root.left;
  while (curr) {
    if (!isLeaf(curr)) {
      res.push(curr.val);
    }
    if (curr.left) {
      curr = curr.left;
    } else {
      curr = curr.right;
    }
  }
}

function addLeaves(node, res) {
  if (!node) return;
  if (isLeaf(node)) {
    res.push(node.val);
    return;
  }
  addLeaves(node.left, res);
  addLeaves(node.right, res);
}

function addRightBoundary(root, res) {
  let curr = root.right;
  const temp = [];
  while (curr) {
    if (!isLeaf(curr)) {
      temp.push(curr.val);
    }
    if (curr.right) {
      curr = curr.right;
    } else {
      curr = curr.left;
    }
  }
  for (let i = temp.length - 1; i >= 0; i--) {
    res.push(temp[i]);
  }
}

function solveBoundaryTraversal(input) {
  const root = parseTree(input);
  if (!root) return "";

  const res = [];
  if (!isLeaf(root)) {
    res.push(root.val);
  }

  addLeftBoundary(root, res);
  addLeaves(root, res);
  addRightBoundary(root, res);

  return res.join(" ");
}

const staticCases = [
  { input: "1 2 3 4 5 -1 6 -1 -1 7 8 -1 -1 -1 -1 -1 -1", isExample: true },
  { input: "1 -1 2 3 4 -1 -1 -1 -1", isExample: true },
  { input: "10", isExample: true }
];

// Binary tree generator helper
function generateRandomTreeInput(nodeCount) {
  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    nodes.push(Math.floor(Math.random() * 1000) + 1);
  }
  // Inject nulls at random positions
  const serialized = [String(nodes[0])];
  let queue = [0];
  let ptr = 1;

  while (queue.length > 0 && ptr < nodeCount) {
    const parentIdx = queue.shift();
    // left child
    if (Math.random() < 0.15) {
      serialized.push("-1");
    } else {
      serialized.push(String(nodes[ptr]));
      queue.push(ptr);
      ptr++;
    }
    // right child
    if (ptr < nodeCount) {
      if (Math.random() < 0.15) {
        serialized.push("-1");
      } else {
        serialized.push(String(nodes[ptr]));
        queue.push(ptr);
        ptr++;
      }
    }
  }
  return serialized.join(" ");
}

async function main() {
  const testSets = [];

  // 1. Add static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const expected = solveBoundaryTraversal(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Generate 10 edge cases
  console.log("Generating edge cases...");
  const edgeCases = [
    // Linear left-heavy
    "1 2 -1 3 -1 4 -1 5 -1 -1 -1",
    // Linear right-heavy
    "1 -1 2 -1 3 -1 4 -1 5 -1 -1",
    // Perfect symmetric tree
    "1 2 2 3 4 4 3 -1 -1 -1 -1 -1 -1 -1 -1",
    // Star tree: root with left and right child as leaves
    "1 2 3 -1 -1 -1 -1",
    // Left boundary is empty (root.left is null)
    "1 -1 2 3 4 -1 -1 -1 -1",
    // Right boundary is empty (root.right is null)
    "1 2 -1 3 4 -1 -1 -1 -1"
  ];

  for (const ec of edgeCases) {
    const expected = solveBoundaryTraversal(ec);
    testSets.push({
      input: ec,
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

    const input = generateRandomTreeInput(n);
    const expected = solveBoundaryTraversal(input);

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
    const expected = solveBoundaryTraversal(tc.input);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Input: "${tc.input}", Expected: "${expected}", Got: "${tc.expectedOutput}"`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "striver-boundary-traversal-website" },
    update: {
      title: "Boundary Traversal of Binary Tree - takeUforward",
      url: "https://takeuforward.org/data-structure/boundary-traversal-of-a-binary-tree/",
      type: "WEBSITE",
      topic: "Tree",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-boundary-traversal-website",
      title: "Boundary Traversal of Binary Tree - takeUforward",
      url: "https://takeuforward.org/data-structure/boundary-traversal-of-a-binary-tree/",
      type: "WEBSITE",
      topic: "Tree",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver website resource ready.");

  const res2 = await prisma.learningResource.upsert({
    where: { id: "striver-boundary-traversal-video" },
    update: {
      title: "Striver's Boundary Traversal of Binary Tree Video guide",
      url: "https://www.youtube.com/watch?v=0ca1nvR0be4",
      type: "VIDEO",
      topic: "Tree",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-boundary-traversal-video",
      title: "Striver's Boundary Traversal of Binary Tree Video guide",
      url: "https://www.youtube.com/watch?v=0ca1nvR0be4",
      type: "VIDEO",
      topic: "Tree",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver video resource ready.");

  // 6. Upsert problem record
  console.log("Upserting problem 'Boundary Traversal of Binary Tree' in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "boundary-traversal-of-binary-tree" },
    update: {
      title: "Boundary Traversal of Binary Tree",
      difficulty: "Medium",
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
      slug: "boundary-traversal-of-binary-tree",
      title: "Boundary Traversal of Binary Tree",
      difficulty: "Medium",
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

  console.log("🎉 Successfully created/updated 'Boundary Traversal of Binary Tree'!");
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
