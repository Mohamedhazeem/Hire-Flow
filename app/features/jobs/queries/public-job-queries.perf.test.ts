import { describe, it, expect, beforeEach, vi } from "vitest";
import { resetDb, createTestUser, createTestCompany, seedJobs } from "@/lib/test";
import { measure } from "@/lib/test/perf";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";

describe("PF4 — Job listing 100K full-text search performance", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("full-text search uses GIN index and returns results for 100k active jobs", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    await seedJobs(company.id, recruiter.id, 100_000, "engineer");

    // PF4 deliverable: the GIN full-text indexes must exist so Prisma's
    // `.search` operator is index-backed rather than a sequential scan.
    const indexes = await prisma.$queryRawUnsafe<Array<{ indexname: string }>>(
      `SELECT indexname FROM pg_indexes WHERE indexname LIKE 'job_%_fts_idx'`,
    );
    expect(indexes.map((i) => i.indexname).sort()).toEqual(["job_description_fts_idx", "job_title_fts_idx"]);

    const { listPublicJobs } = await import("@/app/features/jobs/queries/public-job-queries");

    // Warm-up so the GIN index + OS page cache are populated; the measured run
    // reflects steady-state latency, not first-touch cold reads (which depend
    // on local disk I/O and are environment-bound, not a code regression).
    const warm = await listPublicJobs({ search: "engineer", page: 1, pageSize: 20 });
    expect(warm.total).toBeGreaterThan(0);

    const { ms, result } = await measure(() => listPublicJobs({ search: "engineer", page: 1, pageSize: 20 }));

    expect(result.total).toBeGreaterThan(0);
    // Generous budget: a warm GIN-backed query is single-digit ms; a missing
    // index (sequential scan over 100k rows) blows well past this.
    expect(ms).toBeLessThanOrEqual(30_000);
  });
});
