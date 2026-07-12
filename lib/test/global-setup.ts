/**
 * Vitest globalSetup — runs ONCE before any test worker starts.
 *
 * Responsibilities:
 *  1. Load `.env.test` into the main process environment.
 *  2. Remap DATABASE_URL_TEST → DATABASE_URL so `prisma migrate deploy` targets the test DB.
 *  3. Apply all pending migrations to `hireflow_test`.
 */
import { execSync } from "child_process";
import dotenv from "dotenv";
import path from "path";

export default async function globalSetup() {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

  if (process.env.DATABASE_URL_TEST) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
  }

  console.log("Database URL targeted for test migrations:", process.env.DATABASE_URL);
  console.log("--- Global Setup Starting ---");

  try {
    console.log("Running Prisma migrations on the test database...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("Prisma migrations applied successfully.");
  } catch (error) {
    console.error("Error during test database migrations:", error);
    throw error;
  }

  console.log("--- Global Setup Completed ---");
}
