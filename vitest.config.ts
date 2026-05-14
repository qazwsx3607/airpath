import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts", "apps/**/*.test.tsx"],
    globals: true
  },
  resolve: {
    alias: {
      "@airpath/scenario-schema": resolve(__dirname, "packages/scenario-schema/src/index.ts"),
      "@airpath/solver-core": resolve(__dirname, "packages/solver-core/src/index.ts"),
      "@airpath/report-engine": resolve(__dirname, "packages/report-engine/src/index.ts")
    }
  }
});
