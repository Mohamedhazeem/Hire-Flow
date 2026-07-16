/**
 * e2e/seed-e2e.ts
 *
 * Thin wrapper around the production seed script (prisma/seed.ts).
 * Single source of truth — avoids account drift between dev and test databases.
 *
 * Run:  npx tsx e2e/seed-e2e.ts
 */
import { execSync } from "child_process";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set. Ensure .env.test has DATABASE_URL_TEST.");
  process.exit(1);
}

console.warn("Seeding e2e test database...");
execSync("npx tsx prisma/seed.ts", { stdio: "inherit", env: { ...process.env, ALLOW_SEED: "true" } });
console.warn("e2e seed complete.");
