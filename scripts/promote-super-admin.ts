import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "@/utils/env";

const pool = new pg.Pool({ connectionString: env.data?.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const emails = process.argv.slice(2);

  if (emails.length === 0) {
    console.error("Usage: npx tsx scripts/promote-super-admin.ts <email1> <email2> ...");
    console.error("Example: npx tsx scripts/promote-super-admin.ts admin@hireflow.dev bob@acmecorp.dev");
    process.exit(1);
  }

  console.warn(`\u{1F531} Promoting ${emails.length} user(s) to super_admin...\n`);

  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.warn(`  \u26A0 User not found: ${email}`);
      continue;
    }
    await prisma.user.update({
      where: { email },
      data: { role: "super_admin" },
    });
    console.warn(`  \u2714 ${email} \u2192 super_admin`);
  }

  console.warn("\n\u2705 Done.");
}

main()
  .catch((e) => {
    console.error("\u274C Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
