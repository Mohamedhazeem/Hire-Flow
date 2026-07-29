/**
 * Vitest globalSetup — runs ONCE before any test worker starts.
 *
 * Responsibilities:
 *  1. Load `.env.test` into the main process environment.
 *  2. Remap DATABASE_URL_TEST → DATABASE_URL so `prisma migrate deploy` targets the test DB.
 *  3. Apply all pending migrations to `hireflow_test`.
 *
 * Note: This setup is optional — pure unit tests (schemas, security) run fine without DB.
 * If the test DB is unavailable, this logs a warning and continues.
 */
import { execSync } from "child_process";
import dotenv from "dotenv";
import path from "path";
import { globalTeardown } from "./perf-teardown";

export default async function globalSetup() {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

  if (process.env.DATABASE_URL_TEST) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
  }

  if (!process.env.DATABASE_URL) {
    console.warn("No DATABASE_URL found — skipping test DB setup (unit tests only)");
    return;
  }

  try {
    console.warn("--- Global Setup Starting ---");
    console.warn("Running Prisma migrations on the test database...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.warn("Prisma migrations applied successfully.");
    console.warn("--- Global Setup Completed ---");
  } catch (error) {
    console.warn("Test database unavailable — skipping migrations (unit tests can still run)");
    console.warn(error);
  }

  return globalTeardown;
}
