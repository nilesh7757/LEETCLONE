const { marked } = require("marked");
const DOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const window = new JSDOM("").window;
const purify = DOMPurify(window);

const description = `
<h1>Coin Change</h1>

<p>Return fewest coins...</p>

<svg width="450" height="160" viewBox="0 0 450 160" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <defs>
    <!-- Arrowhead markers -->
    <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
    </marker>
  </defs>
  <!-- Available Coins -->
  <text x="75" y="24" font-size="10" font-weight="bold" fill="#3b82f6" text-anchor="middle">Available Coins</text>
  <!-- Coin 1 -->
  <circle cx="35" cy="55" r="14" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />
</svg>
`;

async function main() {
  const parsed = await marked.parse(description);
  console.log("=== MARKED PARSED ===");
  console.log(parsed);

  const sanitized = purify.sanitize(parsed, {
    ADD_TAGS: ["svg", "defs", "marker", "circle", "line", "path", "text", "rect", "g", "tspan"],
    ADD_ATTR: ["width", "height", "viewBox", "x", "y", "rx", "ry", "fill", "stroke", "stroke-width", "font-size", "font-weight", "text-anchor", "cx", "cy", "r", "x1", "y1", "x2", "y2", "d", "fill-opacity", "stroke-dasharray", "stroke-opacity", "marker-end", "id", "orient", "refX", "refY", "markerWidth", "markerHeight", "style"]
  });
  console.log("=== SANITIZED ===");
  console.log(sanitized);
}

main();
