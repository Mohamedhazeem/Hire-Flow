// One-time backfill script to create ApplicationStatusChange records for existing applications.
// Run: npx tsx prisma/scripts/backfill-status-changes.ts
// Safe to run multiple times — skips applications that already have records.
/* eslint-disable no-console */

import { PrismaClient } from "../../app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Backfilling ApplicationStatusChange records...");

  const applications = await prisma.application.findMany({
    select: { id: true, userId: true, status: true, appliedAt: true },
  });

  let created = 0;
  let skipped = 0;

  for (const app of applications) {
    const existing = await prisma.applicationStatusChange.findFirst({
      where: { applicationId: app.id },
    });

    if (existing) {
      skipped++;
      continue;
    }

    // Create initial "applied" record
    await prisma.applicationStatusChange.create({
      data: {
        applicationId: app.id,
        fromStatus: "applied",
        toStatus: app.status,
        changedById: app.userId,
        createdAt: app.appliedAt,
      },
    });
    created++;
  }

  console.log(`Done. Created ${created} records, skipped ${skipped} applications (already have records).`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Backfill failed:", e);
  prisma.$disconnect();
  process.exit(1);
});
