import { describe, it, expect } from "vitest";
import { ProfileSchema } from "@/app/features/user/schema/profile.schema";

const validProfile = {
  headline: "Senior Engineer",
  bio: "Full-stack developer with 10 years of experience.",
  location: "San Francisco",
  skills: ["React", "TypeScript", "Node.js"],
  workMode: "remote",
  basePay: 100000,
  ctc: 120000,
  ectc: 150000,
  experiences: [
    {
      company: "Google",
      title: "Engineer",
      startDate: "2020-01",
      endDate: null,
      description: "Worked on web",
    },
  ],
  socialLinks: [{ platform: "linkedin" as const, url: "https://linkedin.com/in/test" }],
};

describe("ProfileSchema", () => {
  it("accepts a valid full payload", () => {
    const result = ProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it("accepts payload with only skills (all other fields optional with defaults)", () => {
    const result = ProfileSchema.safeParse({ skills: ["React"] });
    expect(result.success).toBe(true);
  });

  it("rejects headline exceeding 200 chars", () => {
    const result = ProfileSchema.safeParse({ ...validProfile, headline: "A".repeat(201) });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("headline");
  });

  it("rejects bio exceeding 2000 chars", () => {
    const result = ProfileSchema.safeParse({ ...validProfile, bio: "A".repeat(2001) });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("bio");
  });

  it("accepts Unicode/emoji in headline", () => {
    const result = ProfileSchema.safeParse({
      ...validProfile,
      headline: "Software Engineer 🚀 @ Google",
    });
    expect(result.success).toBe(true);
  });

  it("accepts Unicode/emoji in bio", () => {
    const result = ProfileSchema.safeParse({ ...validProfile, bio: "I ❤️ TypeScript" });
    expect(result.success).toBe(true);
  });

  it("accepts an empty skills array", () => {
    const result = ProfileSchema.safeParse({ ...validProfile, skills: [] });
    expect(result.success).toBe(true);
  });

  it("rejects skills with 51 items", () => {
    const result = ProfileSchema.safeParse({
      ...validProfile,
      skills: Array.from({ length: 51 }, (_, i) => `Skill${i}`),
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("skills");
  });

  it("deduplicates duplicate skills", () => {
    const result = ProfileSchema.parse({
      ...validProfile,
      skills: ["React", "React", "TypeScript"],
    });
    expect(result.skills).toEqual(["React", "TypeScript"]);
  });

  it("rejects experiences with 21 items", () => {
    const exp = { company: "C", title: "T", startDate: "2020-01", endDate: null };
    const result = ProfileSchema.safeParse({
      ...validProfile,
      experiences: Array.from({ length: 21 }, () => exp),
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("experiences");
  });

  it("rejects socialLinks with 11 items", () => {
    const link = { platform: "linkedin" as const, url: "https://linkedin.com/in/test" };
    const result = ProfileSchema.safeParse({
      ...validProfile,
      socialLinks: Array.from({ length: 11 }, () => link),
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("socialLinks");
  });

  it("accepts zero-value salary fields (nonnegative)", () => {
    const result = ProfileSchema.safeParse({ ...validProfile, basePay: 0, ctc: 0, ectc: 0 });
    expect(result.success).toBe(true);
  });

  it("rejects negative salary", () => {
    const result = ProfileSchema.safeParse({ ...validProfile, basePay: -100 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("basePay");
  });

  it("rejects location exceeding 200 chars", () => {
    const result = ProfileSchema.safeParse({ ...validProfile, location: "A".repeat(201) });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("location");
  });

  it("rejects invalid workMode enum", () => {
    const result = ProfileSchema.safeParse({ ...validProfile, workMode: "invalid" });
    expect(result.success).toBe(false);
  });

  it("accepts null workMode", () => {
    const result = ProfileSchema.safeParse({ ...validProfile, workMode: null });
    expect(result.success).toBe(true);
  });
});
