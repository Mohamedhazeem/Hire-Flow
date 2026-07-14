import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    globalSetup: "./lib/test/global-setup.ts",
    setupFiles: ["./lib/test/vitest.setup.ts"],
    environmentMatchGlobs: [
      ["**/*.dom.test.tsx", "jsdom"],
      ["**/*.dom.test.ts", "jsdom"],
    ],
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 35,
        functions: 35,
        statements: 35,
        branches: 30,
      },
      exclude: [
        "node_modules/**",
        ".next/**",
        "app/generated/**",
        "lib/test/**",
        "vitest.config.ts",
      ],
    },
  },
});
