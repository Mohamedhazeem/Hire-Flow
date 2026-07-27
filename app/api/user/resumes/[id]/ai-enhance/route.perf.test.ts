import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  mockSession,
  resetDb,
  createTestUser,
  createTestResume,
  mockAiClient,
} from "@/lib/test";
import { mockGetSession } from "@/lib/test/shared-auth-mock";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";

describe("PF5 — Concurrent AI enhancement rate limit", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("concurrent requests do not double-count beyond 5/day", async () => {
    const user = await createTestUser({ role: Role.user });
    const resume = await createTestResume(user.id, {
      label: "Test Resume",
      isPrimary: true,
      builderData: { summary: "Test", educations: [], experiences: [], skills: [] },
    });

    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));
    mockAiClient(
      JSON.stringify({
        suggestions: [],
        overallScore: 80,
        projectedScore: 85,
        keyStrengths: [],
        improvementAreas: [],
      }),
    );

    const { POST } = await import(
      "@/app/api/user/resumes/[id]/ai-enhance/route"
    );

    const makeRequest = () => {
      const req = new NextRequest(
        `http://localhost/api/user/resumes/${resume.id}/ai-enhance`,
        { method: "POST" },
      );
      return POST(req, { params: Promise.resolve({ id: resume.id }) });
    };

    await Promise.allSettled([
      makeRequest(),
      makeRequest(),
      makeRequest(),
      makeRequest(),
      makeRequest(),
      makeRequest(),
    ]);

    const dailyLogs = await prisma.resumeEnhancementLog.count({
      where: { userId: user.id },
    });

    expect(dailyLogs).toBeLessThanOrEqual(5);
  });
});
