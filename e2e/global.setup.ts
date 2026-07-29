/**
 * Playwright global setup — runs once before any project's test suite.
 *
 * Responsibilities:
 *   1. Apply migrations + seed the test database.
 *   2. Start the AI mock server for Journey 7.
 */
import { type FullConfig } from "@playwright/test";
import { startAiMockServer } from "./ai-mock-server";
import { execSync } from "child_process";
import path from "path";
import dotenv from "dotenv";

export default async function globalSetup(_config: FullConfig) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });
  if (process.env.DATABASE_URL_TEST) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
  }

  const DB_URL = process.env.DATABASE_URL;
  if (!DB_URL) {
    console.warn("No DATABASE_URL — skipping DB setup for e2e tests");
    return;
  }

  console.warn("Running migrations on e2e test DB...");
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
  } catch {
    console.warn("Migrations may already be applied; continuing...");
  }

  console.warn("Seeding e2e test DB...");
  execSync("npx tsx prisma/seed.ts", {
    stdio: "inherit",
    env: { ...process.env, ALLOW_SEED: "true" },
  });

  const aiPort = Number(process.env.E2E_AI_MOCK_PORT || "8787");
  process.env.AI_PROVIDER = "anthropic";
  process.env.ANTHROPIC_API_KEY = "e2e-stub";
  process.env.ANTHROPIC_API_URL = `http://localhost:${aiPort}`;
  await startAiMockServer(aiPort);

  console.warn("Global setup complete: DB seeded, AI mock running.");
}
