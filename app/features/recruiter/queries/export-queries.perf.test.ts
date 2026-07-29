import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  resetDb,
  createTestUser,
  createTestCompany,
  createTestJob,
  seedApplications,
} from "@/lib/test";
import { measure, publishBenchmark } from "@/lib/test/perf";
import { Role } from "@/app/generated/prisma/client";

describe("PF3 — CSV export 50K rows performance", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("completes within 30s and does not exceed 512MB RSS delta", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);
    await seedApplications(job.id, company.id, { count: 50_000 });

    const { exportApplicantsAsCsv } =
      await import("@/app/features/recruiter/queries/export-queries");

    const beforeRSS = process.memoryUsage().rss;
    let totalBytes = 0;

    const { ms } = await measure(async () => {
      const stream = await exportApplicantsAsCsv(job.id, company.id, {});
      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.byteLength;
      }
    });

    const afterRSS = process.memoryUsage().rss;
    const deltaMB = (afterRSS - beforeRSS) / 1024 / 1024;

    publishBenchmark({
      suite: "PF3-csv-export-50k",
      meanMs: ms,
      p50Ms: ms,
      p95Ms: ms,
      sampleCount: 1,
    });

    expect(ms).toBeLessThanOrEqual(30_000);
    expect(totalBytes).toBeGreaterThan(0);
    expect(deltaMB).toBeLessThanOrEqual(512);
  });
});
