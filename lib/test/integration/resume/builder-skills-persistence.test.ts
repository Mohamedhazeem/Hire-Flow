import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetDb, createTestUser } from "@/lib/test";
import { mockSession } from "@/lib/test/auth-fixtures";
import { mockGetSession } from "@/lib/test/shared-auth-mock";

describe("Resume builder skills persistence (DB round-trip)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("persists skills from saveResumeBuilder server action", async () => {
    const user = await createTestUser({ role: "user" });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { saveResumeBuilder } = await import(
      "@/app/features/user/actions/save-resume-builder"
    );
    const result = await saveResumeBuilder({
      label: "My Resume",
      summary: "Summary",
      educations: [],
      experiences: [],
      skills: ["Python"],
    });

    const dbResume = await prisma.resume.findUnique({
      where: { id: result.resume.id },
      select: { builderData: true },
    });
    const bd = dbResume!.builderData as Record<string, unknown> | null;
    expect(bd?.skills).toContain("Python");
  });

  it("updates skills via builder-data PATCH and persists them", async () => {
    const user = await createTestUser({ role: "user" });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { saveResumeBuilder } = await import(
      "@/app/features/user/actions/save-resume-builder"
    );
    const createResult = await saveResumeBuilder({
      label: "My Resume",
      summary: "A summary",
      educations: [],
      experiences: [],
      skills: ["Python"],
    });
    const resumeId = createResult.resume.id;

    const { PATCH } = await import(
      "@/app/api/user/resumes/[id]/builder-data/route"
    );
    const patchReq = new NextRequest(
      `http://localhost/api/user/resumes/${resumeId}/builder-data`,
      {
        method: "PATCH",
        body: JSON.stringify({
          label: "My Resume",
          summary: "A summary",
          educations: [],
          experiences: [],
          skills: ["Python", "TypeScript", "Go"],
        }),
      },
    );
    const patchRes = await PATCH(patchReq, {
      params: Promise.resolve({ id: resumeId }),
    });
    expect(patchRes.status).toBe(200);

    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    const builderData = resume!.builderData as Record<string, unknown> | null;
    expect(builderData?.skills).toEqual(
      expect.arrayContaining(["Python", "TypeScript", "Go"]),
    );
  });

  it("handles empty skills array correctly", async () => {
    const user = await createTestUser({ role: "user" });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { saveResumeBuilder } = await import(
      "@/app/features/user/actions/save-resume-builder"
    );
    const result = await saveResumeBuilder({
      label: "My Resume",
      summary: "",
      educations: [],
      experiences: [],
      skills: [],
    });

    const dbResume = await prisma.resume.findUnique({
      where: { id: result.resume.id },
      select: { builderData: true },
    });
    const bd = dbResume!.builderData as Record<string, unknown> | null;
    expect(bd?.skills).toEqual([]);
  });
});
