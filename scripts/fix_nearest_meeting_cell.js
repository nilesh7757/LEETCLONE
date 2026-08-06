const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const descriptionHtml = `<p>You are given a directed graph of <code>n</code> nodes numbered from <code>0</code> to <code>n - 1</code>, where each node has <strong>at most one</strong> outgoing edge.</p>

<p>The graph is represented with a given <strong>0-indexed</strong> array <code>edges</code> of size <code>n</code>, indicating that there is a directed edge from node <code>i</code> to node <code>edges[i]</code>. If there is no outgoing edge from <code>i</code>, then <code>edges[i] == -1</code>.</p>

<p>You are also given two integers <code>node1</code> and <code>node2</code>.</p>

<p>Return <em>the <strong>index</strong> of the node that can be reached from both <code>node1</code> and <code>node2</code>, such that the <strong>maximum</strong> between the distance from <code>node1</code> to that node, and from <code>node2</code> to that node is <strong>minimized</strong></em>.</p>

<p>If there are multiple answers, return the node with the <strong>smallest</strong> index, and if no possible answer exists, return <code>-1</code>.</p>

<p>Note that the distance between two nodes is the number of edges in the path between them.</p>

<div style="margin-top: 20px;">
  <h3 class="text-xl font-bold mb-4">Visualization of Nearest Meeting Cell</h3>
  <svg viewBox="0 0 600 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="300" fill="#1e1e1e" rx="10"/><text x="300" y="40" fill="#ffffff" font-family="monospace" font-size="18" text-anchor="middle">edges = [2, 2, 3, -1], node1 = 0, node2 = 1</text><circle cx="150" cy="120" r="25" fill="#3b82f6" stroke="#1d4ed8" stroke-width="3"/><text x="150" y="126" fill="#ffffff" font-family="monospace" font-size="18" text-anchor="middle" font-weight="bold">0</text><circle cx="150" cy="220" r="25" fill="#ef4444" stroke="#b91c1c" stroke-width="3"/><text x="150" y="226" fill="#ffffff" font-family="monospace" font-size="18" text-anchor="middle" font-weight="bold">1</text><circle cx="300" cy="170" r="25" fill="#22c55e" stroke="#15803d" stroke-width="3"/><text x="300" y="176" fill="#ffffff" font-family="monospace" font-size="18" text-anchor="middle" font-weight="bold">2</text><circle cx="450" cy="170" r="25" fill="#4b5563" stroke="#374151" stroke-width="3"/><text x="450" y="176" fill="#ffffff" font-family="monospace" font-size="18" text-anchor="middle" font-weight="bold">3</text><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="25" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#aaaaaa" /></marker></defs><path d="M 172 133 L 278 157" stroke="#aaaaaa" stroke-width="2" fill="none" marker-end="url(#arrow)"/><path d="M 172 207 L 278 183" stroke="#aaaaaa" stroke-width="2" fill="none" marker-end="url(#arrow)"/><path d="M 325 170 L 425 170" stroke="#aaaaaa" stroke-width="2" fill="none" marker-end="url(#arrow)"/><text x="150" y="90" fill="#3b82f6" font-family="monospace" font-size="14" text-anchor="middle">node1</text><text x="150" y="265" fill="#ef4444" font-family="monospace" font-size="14" text-anchor="middle">node2</text><text x="300" y="130" fill="#22c55e" font-family="monospace" font-size="14" text-anchor="middle">Meeting Node</text><rect x="50" y="260" width="500" height="30" fill="none" stroke="#22c55e" stroke-dasharray="4" rx="5"/><text x="300" y="280" fill="#ffffff" font-family="sans-serif" font-size="14" text-anchor="middle">Max dist: max(dist(0,2), dist(1,2)) = max(1, 1) = 1</text></svg>
</div>`;

async function main() {
    const problem = await prisma.problem.findUnique({
        where: { slug: "nearest-meeting-cell" },
        select: { testSets: true }
    });

    if (!problem) {
        console.error("Problem not found!");
        return;
    }

    let tests = typeof problem.testSets === 'string' ? JSON.parse(problem.testSets) : problem.testSets;
    
    // Set isExample true for only the first 2 tests
    tests = tests.map((t, idx) => ({
        ...t,
        isExample: idx < 2
    }));

    await prisma.problem.update({
        where: { slug: "nearest-meeting-cell" },
        data: {
            description: descriptionHtml,
            testSets: tests
        }
    });
    
    console.log("Successfully fixed Nearest Meeting Cell description and examples!");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
