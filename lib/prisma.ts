import { env } from "@/utils/env";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const pool = new pg.Pool({
  connectionString: env.data?.DATABASE_URL ?? process.env.DATABASE_URL,
  connectionTimeoutMillis: 15_000,
  idleTimeoutMillis: 30_000,
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (env.data?.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
