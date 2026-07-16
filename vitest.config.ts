import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const sharedPlugins = [react(), tsconfigPaths()];

const sharedResolve = {
  alias: {
    "@": rootDir,
  },
};

export default defineConfig({
  plugins: sharedPlugins,
  resolve: sharedResolve,
  test: {
    environment: "node",
    globals: true,
    globalSetup: "./lib/test/global-setup.ts",
    setupFiles: ["./lib/test/vitest.setup.ts"],
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    fileParallelism: false,
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
    projects: [
      {
        plugins: sharedPlugins,
        resolve: sharedResolve,
        test: {
          name: "default",
          environmentMatchGlobs: [
            ["**/*.dom.test.tsx", "jsdom"],
            ["**/*.dom.test.ts", "jsdom"],
          ],
          exclude: ["**/*.perf.test.ts"],
        },
      },
      {
        plugins: sharedPlugins,
        resolve: sharedResolve,
        test: {
          name: "perf",
          include: ["**/*.perf.test.ts"],
          testTimeout: 300_000,
          hookTimeout: 300_000,
        },
      },
    ],
  },
});
