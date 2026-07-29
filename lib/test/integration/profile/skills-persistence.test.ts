/**
 * Integration test — verifies skills survive the full round-trip:
 *   form submit → server action → DB → page reload
 *
 * Unlike DOM tests (which mock the action), this test exercises the real
 * `upsertProfile` server action and queries the actual test database.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { resetDb, createTestUser } from "@/lib/test";
import { mockSession } from "@/lib/test/auth-fixtures";
import { mockGetSession } from "@/lib/test/shared-auth-mock";

describe("Profile skills persistence (DB round-trip)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("saves skills via upsertProfile and returns them on re-fetch", async () => {
    // Arrange: create a real user in the test DB
    const user = await createTestUser({ role: "user" });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    // Act: call upsertProfile with a skill
    const { upsertProfile } = await import("@/app/features/user/actions/upsert-profile");
    const result = await upsertProfile({
      headline: "Test Engineer",
      bio: "",
      location: "",
      skills: ["Python"],
      workMode: null,
      basePay: null,
      ctc: null,
      ectc: null,
      experiences: [],
      socialLinks: [],
    });

    expect(result.success).toBe(true);

    // Simulate page refresh: re-fetch from DB
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { skills: true },
    });

    expect(profile).not.toBeNull();
    expect(profile!.skills).toContain("Python");
  });

  it("persists multiple skills and returns all of them", async () => {
    const user = await createTestUser({ role: "user" });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { upsertProfile } = await import("@/app/features/user/actions/upsert-profile");
    await upsertProfile({
      headline: "Full Stack",
      bio: "",
      location: "",
      skills: ["Python", "React", "TypeScript", "Go"],
      workMode: null,
      basePay: null,
      ctc: null,
      ectc: null,
      experiences: [],
      socialLinks: [],
    });

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { skills: true },
    });

    expect(profile!.skills).toEqual(expect.arrayContaining(["Python", "React", "TypeScript", "Go"]));
    expect(profile!.skills).toHaveLength(4);
  });

  it("replaces old skills with new ones on subsequent save", async () => {
    const user = await createTestUser({ role: "user" });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { upsertProfile } = await import("@/app/features/user/actions/upsert-profile");

    // First save
    await upsertProfile({
      headline: "Engineer",
      bio: "",
      location: "",
      skills: ["Python"],
      workMode: null,
      basePay: null,
      ctc: null,
      ectc: null,
      experiences: [],
      socialLinks: [],
    });

    // Second save with different skills
    await upsertProfile({
      headline: "Engineer",
      bio: "",
      location: "",
      skills: ["Rust", "Go"],
      workMode: null,
      basePay: null,
      ctc: null,
      ectc: null,
      experiences: [],
      socialLinks: [],
    });

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { skills: true },
    });

    // Python should no longer be there — it was replaced
    expect(profile!.skills).not.toContain("Python");
    expect(profile!.skills).toContain("Rust");
    expect(profile!.skills).toContain("Go");
    expect(profile!.skills).toHaveLength(2);
  });

  it("deduplicates skills before saving (Zod transform)", async () => {
    const user = await createTestUser({ role: "user" });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { upsertProfile } = await import("@/app/features/user/actions/upsert-profile");
    await upsertProfile({
      headline: "Engineer",
      bio: "",
      location: "",
      skills: ["Python", "Python", "React"],
      workMode: null,
      basePay: null,
      ctc: null,
      ectc: null,
      experiences: [],
      socialLinks: [],
    });

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { skills: true },
    });

    expect(profile!.skills).toHaveLength(2);
    expect(profile!.skills).toContain("Python");
    expect(profile!.skills).toContain("React");
  });
});
