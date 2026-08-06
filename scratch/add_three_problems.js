const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ==========================================
// 1. HEIGHT OF BINARY TREE
// ==========================================

const heightHtmlDescription = `
<h1>Height of Binary Tree</h1>

<p>Given the root of a binary tree, find its height.</p>

<p>The <strong>height</strong> of a binary tree is defined as the number of nodes on the longest path from the root node down to the farthest leaf node.</p>
<p>Note: An empty tree has a height of <code>0</code>, and a tree with only a root node has a height of <code>1</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Tree Levels for Example 1:</h3>
<svg width="320" height="180" viewBox="0 0 320 180" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Level guidelines -->
  <line x1="20" y1="30" x2="300" y2="30" stroke="#334155" stroke-dasharray="2,2" />
  <line x1="20" y1="90" x2="300" y2="90" stroke="#334155" stroke-dasharray="2,2" />
  <line x1="20" y1="150" x2="300" y2="150" stroke="#334155" stroke-dasharray="2,2" />

  <!-- Level labels -->
  <text x="270" y="24" font-size="8" font-weight="bold" fill="#64748b">Level 1</text>
  <text x="270" y="84" font-size="8" font-weight="bold" fill="#64748b">Level 2</text>
  <text x="270" y="144" font-size="8" font-weight="bold" fill="#64748b">Level 3</text>

  <!-- Edges -->
  <line x1="160" y1="30" x2="90" y2="90" stroke="#10b981" stroke-width="2" />
  <line x1="160" y1="30" x2="230" y2="90" stroke="#475569" stroke-width="1.5" />
  <line x1="90" y1="90" x2="50" y2="150" stroke="#10b981" stroke-width="2" />
  <line x1="90" y1="90" x2="130" y2="150" stroke="#475569" stroke-width="1.5" />

  <!-- Nodes -->
  <!-- Node 1 -->
  <circle cx="160" cy="30" r="14" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="160" y="34" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>

  <!-- Node 2 -->
  <circle cx="90" cy="90" r="14" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="90" y="94" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>

  <!-- Node 3 -->
  <circle cx="230" cy="90" r="14" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="230" y="94" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">3</text>

  <!-- Node 4 -->
  <circle cx="50" cy="150" r="14" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="50" y="154" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>

  <!-- Node 5 -->
  <circle cx="130" cy="150" r="14" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="130" y="154" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">5</text>
</svg>
<p><strong>Explanation for Example 1:</strong> The longest path from root is <code>1 &rarr; 2 &rarr; 4</code> (or <code>1 &rarr; 2 &rarr; 5</code>), which passes through <code>3</code> nodes. Thus, the height of the tree is <code>3</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li>A single line containing space-separated integers representing the level-order traversal of the tree (where <code>-1</code> represents a null node).</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer representing the height of the tree.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>0 &le; number of nodes &le; 10^5</code></li>
  <li><code>-10^5 &le; Node.val &le; 10^5</code></li>
</ul>
`.trim();

const heightCppSolution = `
#include <iostream>
#include <vector>
#include <queue>
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

int getHeight(TreeNode* node) {
    if (!node) return 0;
    return max(getHeight(node->left), getHeight(node->right)) + 1;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    string line;
    if (getline(cin, line)) {
        TreeNode* root = parseTree(line);
        cout << getHeight(root) << "\\n";
    }
    return 0;
}
`.trim();

// ==========================================
// 2. FIRST REPEATING CHARACTER
// ==========================================

const firstRepeatingHtmlDescription = `
<h1>First Repeating Character</h1>

<p>Given a string <code>s</code>, find the repeating character that occurs first in the string.</p>

<p>In other words, among all characters that appear more than once in <code>s</code>, return the one whose <strong>first occurrence index</strong> is the smallest.</p>
<p>If no repeating character exists, return <code>#</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>First Index Matching for Example 1 (<code>s = "geeksforgeeks"</code>):</h3>
<svg width="450" height="120" viewBox="0 0 450 120" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Characters -->
  <!-- g (0) -->
  <rect x="15" y="45" width="22" height="22" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="26" y="59" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">g</text>
  <text x="26" y="80" font-size="8" font-weight="bold" fill="#10b981" text-anchor="middle">0</text>

  <!-- e (1) -->
  <rect x="42" y="45" width="22" height="22" rx="4" fill="#1e293b" stroke="#f97316" stroke-width="1.5" />
  <text x="53" y="59" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">e</text>
  <text x="53" y="80" font-size="8" font-weight="bold" fill="#f97316" text-anchor="middle">1</text>

  <!-- e (2) -->
  <rect x="69" y="45" width="22" height="22" rx="4" fill="#1e293b" stroke="#f97316" stroke-width="1.5" />
  <text x="80" y="59" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">e</text>
  <text x="80" y="80" font-size="8" font-weight="bold" fill="#f97316" text-anchor="middle">2</text>

  <!-- k (3) -->
  <rect x="96" y="45" width="22" height="22" rx="4" fill="#1e293b" stroke="#f97316" stroke-width="1.5" />
  <text x="107" y="59" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">k</text>
  <text x="107" y="80" font-size="8" font-weight="bold" fill="#f97316" text-anchor="middle">3</text>

  <!-- s (4) -->
  <rect x="123" y="45" width="22" height="22" rx="4" fill="#1e293b" stroke="#f97316" stroke-width="1.5" />
  <text x="134" y="59" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">s</text>
  <text x="134" y="80" font-size="8" font-weight="bold" fill="#f97316" text-anchor="middle">4</text>

  <!-- f (5) -->
  <rect x="150" y="45" width="22" height="22" rx="4" fill="#1e293b" stroke="#475569" stroke-width="1" />
  <text x="161" y="59" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">f</text>
  <text x="161" y="80" font-size="8" font-weight="bold" fill="#475569" text-anchor="middle">5</text>

  <!-- o (6) -->
  <rect x="177" y="45" width="22" height="22" rx="4" fill="#1e293b" stroke="#475569" stroke-width="1" />
  <text x="188" y="59" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">o</text>
  <text x="188" y="80" font-size="8" font-weight="bold" fill="#475569" text-anchor="middle">6</text>

  <!-- r (7) -->
  <rect x="204" y="45" width="22" height="22" rx="4" fill="#1e293b" stroke="#475569" stroke-width="1" />
  <text x="215" y="59" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">r</text>
  <text x="215" y="80" font-size="8" font-weight="bold" fill="#475569" text-anchor="middle">7</text>

  <!-- g (8) -->
  <rect x="231" y="45" width="22" height="22" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="242" y="59" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">g</text>
  <text x="242" y="80" font-size="8" font-weight="bold" fill="#10b981" text-anchor="middle">8</text>

  <!-- e (9) -->
  <rect x="258" y="45" width="22" height="22" rx="4" fill="#1e293b" stroke="#f97316" stroke-width="1.5" />
  <text x="269" y="59" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">e</text>
  <text x="269" y="80" font-size="8" font-weight="bold" fill="#f97316" text-anchor="middle">9</text>

  <!-- e (10) -->
  <rect x="285" y="45" width="22" height="22" rx="4" fill="#1e293b" stroke="#f97316" stroke-width="1.5" />
  <text x="296" y="59" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">e</text>
  <text x="296" y="80" font-size="8" font-weight="bold" fill="#f97316" text-anchor="middle">10</text>

  <!-- k (11) -->
  <rect x="312" y="45" width="22" height="22" rx="4" fill="#1e293b" stroke="#f97316" stroke-width="1.5" />
  <text x="323" y="59" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">k</text>
  <text x="323" y="80" font-size="8" font-weight="bold" fill="#f97316" text-anchor="middle">11</text>

  <!-- s (12) -->
  <rect x="339" y="45" width="22" height="22" rx="4" fill="#1e293b" stroke="#f97316" stroke-width="1.5" />
  <text x="350" y="59" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">s</text>
  <text x="350" y="80" font-size="8" font-weight="bold" fill="#f97316" text-anchor="middle">12</text>

  <!-- Curved arrow connection for g (0 -> 8) -->
  <path d="M 26 35 Q 134 -10 242 35" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="3,2" />
  <text x="134" y="20" font-size="10" font-weight="bold" fill="#10b981" text-anchor="middle">First repeat (index 0)</text>
</svg>
<p><strong>Explanation for Example 1:</strong> In <code>"geeksforgeeks"</code>, the repeating characters are <code>'g'</code>, <code>'e'</code>, <code>'k'</code>, and <code>'s'</code>. 
<ul>
  <li>First occurrence of <code>'g'</code> is at index <code>0</code>.</li>
  <li>First occurrence of <code>'e'</code> is at index <code>1</code>.</li>
  <li>First occurrence of <code>'k'</code> is at index <code>3</code>.</li>
  <li>First occurrence of <code>'s'</code> is at index <code>4</code>.</li>
</ul>
Since <code>'g'</code> has the smallest first occurrence index (0), it is returned.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li>A single line containing the string <code>s</code>.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print the first repeating character, or <code>#</code> if no characters repeat.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; s.length &le; 10^5</code></li>
  <li><code>s</code> consists of lowercase English letters only.</li>
</ul>
`.trim();

const firstRepeatingCppSolution = `
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    string s;
    if (cin >> s) {
        unordered_map<char, int> counts;
        for (char c : s) {
            counts[c]++;
        }
        char ans = '#';
        for (char c : s) {
            if (counts[c] > 1) {
                ans = c;
                break;
            }
        }
        cout << ans << "\\n";
    }
    return 0;
}
`.trim();

// ==========================================
// 3. NUMBER OF ISLANDS
// ==========================================

const islandsHtmlDescription = `
<h1>Number of Islands</h1>

<p>Given an <code>m x n</code> 2D grid map of <code>'1'</code>s (land) and <code>'0'</code>s (water), return the <strong>number of islands</strong>.</p>

<p>An <strong>island</strong> is surrounded by water and is formed by connecting adjacent lands horizontally or vertically (4-way connectivity). You may assume all four edges of the grid are all surrounded by water.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Grid Layout & Islands for Example 1:</h3>
<svg width="300" height="200" viewBox="0 0 300 200" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Row 0 -->
  <!-- (0,0) land (Island 1) -->
  <rect x="20" y="20" width="30" height="30" rx="4" fill="#10b981" fill-opacity="0.3" stroke="#10b981" stroke-width="1.5" />
  <text x="35" y="38" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <!-- (0,1) land (Island 1) -->
  <rect x="60" y="20" width="30" height="30" rx="4" fill="#10b981" fill-opacity="0.3" stroke="#10b981" stroke-width="1.5" />
  <text x="75" y="38" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <!-- (0,2) water -->
  <rect x="100" y="20" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="115" y="38" font-size="12" fill="#475569" text-anchor="middle">0</text>
  <!-- (0,3) water -->
  <rect x="140" y="20" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="155" y="38" font-size="12" fill="#475569" text-anchor="middle">0</text>
  <!-- (0,4) water -->
  <rect x="180" y="20" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="195" y="38" font-size="12" fill="#475569" text-anchor="middle">0</text>

  <!-- Row 1 -->
  <!-- (1,0) land (Island 1) -->
  <rect x="20" y="60" width="30" height="30" rx="4" fill="#10b981" fill-opacity="0.3" stroke="#10b981" stroke-width="1.5" />
  <text x="35" y="78" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <!-- (1,1) land (Island 1) -->
  <rect x="60" y="60" width="30" height="30" rx="4" fill="#10b981" fill-opacity="0.3" stroke="#10b981" stroke-width="1.5" />
  <text x="75" y="78" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <!-- (1,2) water -->
  <rect x="100" y="60" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="115" y="78" font-size="12" fill="#475569" text-anchor="middle">0</text>
  <!-- (1,3) water -->
  <rect x="140" y="60" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="155" y="78" font-size="12" fill="#475569" text-anchor="middle">0</text>
  <!-- (1,4) water -->
  <rect x="180" y="60" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="195" y="78" font-size="12" fill="#475569" text-anchor="middle">0</text>

  <!-- Row 2 -->
  <!-- (2,0) water -->
  <rect x="20" y="100" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="35" y="118" font-size="12" fill="#475569" text-anchor="middle">0</text>
  <!-- (2,1) water -->
  <rect x="60" y="100" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="75" y="118" font-size="12" fill="#475569" text-anchor="middle">0</text>
  <!-- (2,2) land (Island 2) -->
  <rect x="100" y="100" width="30" height="30" rx="4" fill="#3b82f6" fill-opacity="0.3" stroke="#3b82f6" stroke-width="1.5" />
  <text x="115" y="118" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <!-- (2,3) water -->
  <rect x="140" y="100" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="155" y="118" font-size="12" fill="#475569" text-anchor="middle">0</text>
  <!-- (2,4) water -->
  <rect x="180" y="100" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="195" y="118" font-size="12" fill="#475569" text-anchor="middle">0</text>

  <!-- Row 3 -->
  <!-- (3,0) water -->
  <rect x="20" y="140" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="35" y="158" font-size="12" fill="#475569" text-anchor="middle">0</text>
  <!-- (3,1) water -->
  <rect x="60" y="140" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="75" y="158" font-size="12" fill="#475569" text-anchor="middle">0</text>
  <!-- (3,2) water -->
  <rect x="100" y="140" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="115" y="158" font-size="12" fill="#475569" text-anchor="middle">0</text>
  <!-- (3,3) land (Island 3) -->
  <rect x="140" y="140" width="30" height="30" rx="4" fill="#a855f7" fill-opacity="0.3" stroke="#a855f7" stroke-width="1.5" />
  <text x="155" y="158" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <!-- (3,4) land (Island 3) -->
  <rect x="180" y="140" width="30" height="30" rx="4" fill="#a855f7" fill-opacity="0.3" stroke="#a855f7" stroke-width="1.5" />
  <text x="195" y="158" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>

  <!-- Labels -->
  <text x="230" y="40" font-size="10" font-weight="bold" fill="#10b981">Island 1</text>
  <text x="230" y="120" font-size="10" font-weight="bold" fill="#3b82f6">Island 2</text>
  <text x="230" y="160" font-size="10" font-weight="bold" fill="#a855f7">Island 3</text>
</svg>
<p><strong>Explanation for Example 1:</strong> The lands colored in green, blue, and purple form three distinct islands, separated by water (0s). Land cells are connected 4-directionally. Thus, the total number of islands is <code>3</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> Two space-separated integers <code>rows</code> and <code>cols</code> representing the grid dimensions.</li>
  <li><strong>Next <code>rows</code> lines:</strong> <code>cols</code> space-separated integers/characters (<code>1</code> for land, <code>0</code> for water).</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer: the number of islands.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; rows, cols &le; 300</code></li>
  <li>Grid cells contain only <code>'0'</code> or <code>'1'</code>.</li>
</ul>
`.trim();

const islandsCppSolution = `
#include <iostream>
#include <vector>
#include <string>
#include <queue>

using namespace std;

void dfs(vector<vector<char>>& grid, int r, int c, int rows, int cols) {
    grid[r][c] = '0';
    int dr[] = {0, 0, 1, -1};
    int dc[] = {1, -1, 0, 0};
    for (int i = 0; i < 4; ++i) {
        int nr = r + dr[i];
        int nc = c + dc[i];
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '1') {
            dfs(grid, nr, nc, rows, cols);
        }
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int rows, cols;
    if (!(cin >> rows >> cols)) return 0;
    
    vector<vector<char>> grid(rows, vector<char>(cols));
    for (int i = 0; i < rows; ++i) {
        for (int j = 0; j < cols; ++j) {
            cin >> grid[i][j];
        }
    }
    
    int count = 0;
    for (int i = 0; i < rows; ++i) {
        for (int j = 0; j < cols; ++j) {
            if (grid[i][j] == '1') {
                count++;
                dfs(grid, i, j, rows, cols);
            }
        }
    }
    
    cout << count << "\\n";
    return 0;
}
`.trim();

// ==========================================
// SOLVER HELPERS & TREE PARSER
// ==========================================

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

// 1. Height Solver
function solveHeight(input) {
  const root = parseTree(input);
  if (!root) return 0;
  function getHeight(node) {
    if (!node) return 0;
    return Math.max(getHeight(node.left), getHeight(node.right)) + 1;
  }
  return getHeight(root);
}

// 2. First Repeating Solver
function solveFirstRepeating(s) {
  const counts = new Map();
  for (const char of s) {
    counts.set(char, (counts.get(char) || 0) + 1);
  }
  for (const char of s) {
    if (counts.get(char) > 1) {
      return char;
    }
  }
  return "#";
}

// 3. Islands Solver
function solveIslands(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0) return 0;
  const header = lines[0].trim().split(/\s+/);
  const rows = parseInt(header[0]);
  const cols = parseInt(header[1]);

  const grid = [];
  for (let i = 0; i < rows; i++) {
    if (!lines[1 + i]) continue;
    grid.push(lines[1 + i].trim().split(/\s+/));
  }

  if (grid.length === 0) return 0;

  const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));
  let count = 0;

  function dfs(r, c) {
    visited[r][c] = true;
    const directions = [[0,1], [0,-1], [1,0], [-1,0]];
    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc] && grid[nr][nc] === '1') {
        dfs(nr, nc);
      }
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1' && !visited[r][c]) {
        count++;
        dfs(r, c);
      }
    }
  }

  return count;
}

// ==========================================
// TEST GENERATORS
// ==========================================

function generateRandomTree(nodeCount) {
  const nodes = Array.from({ length: nodeCount }, (_, i) => i + 1);
  const serialized = [String(nodes[0])];
  let queue = [0];
  let ptr = 1;

  while (queue.length > 0 && ptr < nodeCount) {
    queue.shift();
    if (Math.random() < 0.1) {
      serialized.push("-1");
    } else {
      serialized.push(String(nodes[ptr]));
      queue.push(ptr);
      ptr++;
    }
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
  return serialized.join(" ");
}

function generateRandomString(len) {
  const pool = "abcdefghijklmnopqrstuvwxyz";
  let s = "";
  for (let i = 0; i < len; i++) {
    s += pool[Math.floor(Math.random() * pool.length)];
  }
  return s;
}

function generateRandomGrid(rows, cols, landProb = 0.3) {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push(Math.random() < landProb ? "1" : "0");
    }
    grid.push(row);
  }
  return grid;
}

function gridToInput(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const lines = [`${rows} ${cols}`];
  for (let i = 0; i < rows; i++) {
    lines.push(grid[i].join(" "));
  }
  return lines.join("\n");
}

async function seedHeight() {
  const testSets = [];
  // 3 Examples
  testSets.push({ input: "1 2 3 4 5 -1 -1 -1 -1 -1 -1", expectedOutput: "3", isExample: true });
  testSets.push({ input: "1 -1 2 -1 3 -1 -1", expectedOutput: "3", isExample: true });
  testSets.push({ input: "10", expectedOutput: "1", isExample: true });

  // 10 Edge cases
  const edgeTrees = [
    "-1", // empty
    "1 2 -1 3 -1 4 -1 5 -1 -1 -1", // left-skewed
    "1 -1 2 -1 3 -1 4 -1 5 -1 -1", // right-skewed
    "1 2 3 -1 -1 -1 -1", // complete
    "1 2 2 3 3 3 3 -1 -1 -1 -1 -1 -1 -1 -1"
  ];
  for (const et of edgeTrees) {
    testSets.push({ input: et, expectedOutput: String(solveHeight(et)), isExample: false });
  }

  // 42 Random cases
  for (let i = 0; i < 42; i++) {
    const n = Math.floor(Math.random() * 30) + 5;
    const tree = generateRandomTree(n);
    testSets.push({ input: tree, expectedOutput: String(solveHeight(tree)), isExample: false });
  }

  // Upsert Resources
  const res1 = await prisma.learningResource.upsert({
    where: { id: "striver-height-binary-tree-website" },
    update: {
      title: "Maximum Depth of Binary Tree - takeUforward",
      url: "https://takeuforward.org/data-structure/maximum-depth-in-a-binary-tree/",
      type: "WEBSITE",
      topic: "Tree",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-height-binary-tree-website",
      title: "Maximum Depth of Binary Tree - takeUforward",
      url: "https://takeuforward.org/data-structure/maximum-depth-in-a-binary-tree/",
      type: "WEBSITE",
      topic: "Tree",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });

  await prisma.problem.upsert({
    where: { slug: "height-of-binary-tree" },
    update: {
      title: "Height of Binary Tree",
      difficulty: "Easy",
      category: "Trees",
      description: heightHtmlDescription,
      referenceSolution: heightCppSolution,
      testSets: testSets,
      resources: { connect: [{ id: res1.id }] }
    },
    create: {
      slug: "height-of-binary-tree",
      title: "Height of Binary Tree",
      difficulty: "Easy",
      category: "Trees",
      description: heightHtmlDescription,
      referenceSolution: heightCppSolution,
      testSets: testSets,
      resources: { connect: [{ id: res1.id }] }
    }
  });
  console.log("   ✅ Height of Binary Tree ready.");
}

async function seedFirstRepeating() {
  const testSets = [];
  // 3 Examples
  testSets.push({ input: "geeksforgeeks", expectedOutput: "g", isExample: true });
  testSets.push({ input: "hello", expectedOutput: "l", isExample: true });
  testSets.push({ input: "abcd", expectedOutput: "#", isExample: true });

  // 10 Edge cases
  const edgeStrings = [
    "a",
    "aa",
    "aba",
    "bbbbb",
    "abcdefghijklmnopqrstuvwxyz",
    "abcdefghijklmnopqrstuvwxyza",
    "zabcdefghijklmnopqrstuvwxyzz",
    "zyxwvutsrqponmlkjihgfedcba",
    "leetcode",
    "algorithm"
  ];
  for (const es of edgeStrings) {
    testSets.push({ input: es, expectedOutput: solveFirstRepeating(es), isExample: false });
  }

  // 42 Random cases
  for (let i = 0; i < 42; i++) {
    const len = Math.floor(Math.random() * 80) + 10;
    const str = generateRandomString(len);
    testSets.push({ input: str, expectedOutput: solveFirstRepeating(str), isExample: false });
  }

  await prisma.problem.upsert({
    where: { slug: "first-repeating-character" },
    update: {
      title: "First Repeating Character",
      difficulty: "Easy",
      category: "Strings",
      description: firstRepeatingHtmlDescription,
      referenceSolution: firstRepeatingCppSolution,
      testSets: testSets
    },
    create: {
      slug: "first-repeating-character",
      title: "First Repeating Character",
      difficulty: "Easy",
      category: "Strings",
      description: firstRepeatingHtmlDescription,
      referenceSolution: firstRepeatingCppSolution,
      testSets: testSets
    }
  });
  console.log("   ✅ First Repeating Character ready.");
}

async function seedIslands() {
  const testSets = [];
  // 3 Examples
  const ex1 = [
    ["1", "1", "0", "0", "0"],
    ["1", "1", "0", "0", "0"],
    ["0", "0", "1", "0", "0"],
    ["0", "0", "0", "1", "1"]
  ];
  testSets.push({ input: gridToInput(ex1), expectedOutput: "3", isExample: true });

  const ex2 = [
    ["1", "1", "1", "1", "0"],
    ["1", "1", "0", "1", "0"],
    ["1", "1", "0", "0", "0"],
    ["0", "0", "0", "0", "0"]
  ];
  testSets.push({ input: gridToInput(ex2), expectedOutput: "1", isExample: true });

  const ex3 = [
    ["0", "0", "0"],
    ["0", "0", "0"]
  ];
  testSets.push({ input: gridToInput(ex3), expectedOutput: "0", isExample: true });

  // 10 Edge cases
  const edgeGrids = [
    [["1"]],
    [["0"]],
    [["1", "0", "1"]],
    [["1"], ["0"], ["1"]],
    [["1", "1"], ["1", "1"]],
    [["0", "0"], ["0", "0"]]
  ];
  for (const eg of edgeGrids) {
    const input = gridToInput(eg);
    testSets.push({ input, expectedOutput: String(solveIslands(input)), isExample: false });
  }

  // 42 Random cases
  for (let i = 0; i < 42; i++) {
    const rows = Math.floor(Math.random() * 12) + 3;
    const cols = Math.floor(Math.random() * 12) + 3;
    const grid = generateRandomGrid(rows, cols, 0.4);
    const input = gridToInput(grid);
    testSets.push({ input, expectedOutput: String(solveIslands(input)), isExample: false });
  }

  // Upsert Resources
  const res1 = await prisma.learningResource.upsert({
    where: { id: "neetcode-number-of-islands" },
    update: {
      title: "Number of Islands - LeetCode 200 - NeetCode",
      url: "https://www.youtube.com/watch?v=pV2kpPD66nE",
      type: "VIDEO",
      topic: "Graph",
      creator: "NeetCode",
      isPublic: true,
    },
    create: {
      id: "neetcode-number-of-islands",
      title: "Number of Islands - LeetCode 200 - NeetCode",
      url: "https://www.youtube.com/watch?v=pV2kpPD66nE",
      type: "VIDEO",
      topic: "Graph",
      creator: "NeetCode",
      isPublic: true,
    }
  });

  await prisma.problem.upsert({
    where: { slug: "number-of-islands" },
    update: {
      title: "Number of Islands",
      difficulty: "Medium",
      category: "Graphs",
      description: islandsHtmlDescription,
      referenceSolution: islandsCppSolution,
      testSets: testSets,
      resources: { connect: [{ id: res1.id }] }
    },
    create: {
      slug: "number-of-islands",
      title: "Number of Islands",
      difficulty: "Medium",
      category: "Graphs",
      description: islandsHtmlDescription,
      referenceSolution: islandsCppSolution,
      testSets: testSets,
      resources: { connect: [{ id: res1.id }] }
    }
  });
  console.log("   ✅ Number of Islands ready.");
}

async function main() {
  console.log("Starting batch problem seeding (Height of tree, First repeating, Islands)...");
  await seedHeight();
  await seedFirstRepeating();
  await seedIslands();
  console.log("🎉 Seeding batch complete!");
}

main()
  .catch(e => {
    console.error("❌ Batch seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
