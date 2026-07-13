import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Pre-existing unused imports in DSA visualizer files — warn only, don't block build
      "@typescript-eslint/no-unused-vars": "warn",
      // Missing deps in visualizer useMemo hooks — warn only
      "react-hooks/exhaustive-deps": "warn",
    },
  },
]);

export default eslintConfig;
