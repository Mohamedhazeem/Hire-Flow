/**
 * Dedicated Prisma client for the test database.
 *
 * This is intentionally a separate PrismaClient instance from `lib/prisma.ts`.
 * - `lib/prisma.ts`  → production / development DB (DATABASE_URL)
 * - `lib/test/test-db.ts` → test DB (DATABASE_URL_TEST)
 *
 * Never import `testDb` in application code. It is test-only.
 */
import { PrismaClient } from "../../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL_TEST or DATABASE_URL environment variable is required for testing.");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const testDb = new PrismaClient({ adapter });
