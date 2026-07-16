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
        lines: 15,
        functions: 60,
        statements: 15,
        branches: 60,
      },
      exclude: [
        "node_modules/**",
        ".next/**",
        "app/generated/**",
        "lib/test/**",
        "**/*.perf.test.ts",
        "**/*.dom.test.tsx",
        "vitest.config.ts",
      ],
    },
    projects: [
      {
        plugins: sharedPlugins,
        resolve: sharedResolve,
        test: {
          name: "default",
          environment: "node",
          setupFiles: ["./lib/test/vitest.setup.ts"],
          include: ["app/**/*.test.{ts,tsx}", "lib/**/*.test.{ts,tsx}"],
          exclude: ["**/node_modules/**", "**/*.perf.test.ts", "**/*.dom.test.tsx"],
        },
      },
      {
        plugins: sharedPlugins,
        resolve: sharedResolve,
        test: {
          name: "dom",
          environment: "jsdom",
          setupFiles: ["./lib/test/vitest.setup.ts"],
          include: ["**/*.dom.test.tsx"],
          exclude: ["**/node_modules/**"],
        },
      },
      {
        plugins: sharedPlugins,
        resolve: sharedResolve,
        test: {
          name: "perf",
          environment: "node",
          include: ["**/*.perf.test.ts"],
          exclude: ["**/node_modules/**"],
          testTimeout: 300_000,
          hookTimeout: 300_000,
        },
      },
    ],
  },
});
