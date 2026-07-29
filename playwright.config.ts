import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

if (process.env.DATABASE_URL_TEST && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
}

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e/specs",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  globalSetup: "./e2e/global.setup.ts",
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: "auth.setup.ts",
    },
    {
      name: "anonymous",
      use: { ...devices["Desktop Chromium"] },
    },
    {
      name: "user",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chromium"],
        storageState: "./e2e/.auth/user.json",
      },
    },
    {
      name: "recruiter",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chromium"],
        storageState: "./e2e/.auth/recruiter.json",
      },
    },
    {
      name: "admin",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chromium"],
        storageState: "./e2e/.auth/admin.json",
      },
    },
  ],
  webServer: {
    command: process.env.E2E_PROD === "1" ? `npx next start -p 3000` : `npx next dev -p 3000`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120_000,
  },
});
