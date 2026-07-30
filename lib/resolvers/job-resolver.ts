import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

/**
 * Resolve a job by slug OR id.
 *
 * Public variant: only returns jobs where `isActive = true` and `status = "active"`.
 * Returns the full job record (all columns) for the caller to select from.
 */
export async function resolvePublicJob(slugOrId: string) {
  return prisma.job.findFirst({
    where: {
      OR: [{ slug: slugOrId }, { id: slugOrId }],
      isActive: true,
      status: "active",
    },
  });
}

/**
 * Resolve a job by slug OR id, with company ownership check.
 * Used by recruiter-side routes that need to verify access.
 */
export async function resolveOwnedJob(slugOrId: string, companyId: string) {
  return prisma.job.findFirst({
    where: {
      OR: [{ slug: slugOrId }, { id: slugOrId }],
      companyId,
    },
  });
}

/**
 * Check if a slug already exists (for slug uniqueness).
 */
export async function slugExists(slug: string): Promise<boolean> {
  const job = await prisma.job.findUnique({
    where: { slug },
    select: { id: true },
  });
  return job !== null;
}
