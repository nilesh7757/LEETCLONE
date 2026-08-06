const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const checkerCode = `
try {
  const normExpected = expectedOutput.trim().toLowerCase();
  const normActual = actualOutput.trim().toLowerCase();

  if (normExpected === "none" || normExpected === "") {
    result = (normActual === "none" || normActual === "");
  } else {
    const parseNodes = (text) => {
      const set = new Set();
      const tokens = text.split(/\\s+/).filter(Boolean);
      for (const tok of tokens) {
        const node = parseInt(tok);
        if (!isNaN(node)) {
          set.add(node);
        }
      }
      return set;
    };

    const expectedSet = parseNodes(expectedOutput);
    const actualSet = parseNodes(actualOutput);

    if (expectedSet.size === 0) {
      result = (normActual === "none" || normActual === "" || actualSet.size === 0);
    } else {
      if (expectedSet.size !== actualSet.size) {
        result = false;
      } else {
        let match = true;
        for (const node of expectedSet) {
          if (!actualSet.has(node)) {
            match = false;
            break;
          }
        }
        result = match;
      }
    }
  }
} catch (e) {
  result = false;
}
`.trim();

async function main() {
  const result = await prisma.problem.update({
    where: { slug: "articulation-point-in-graph" },
    data: {
      customChecker: checkerCode
    }
  });
  console.log("Successfully updated customChecker for Articulation Point in Graph!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
