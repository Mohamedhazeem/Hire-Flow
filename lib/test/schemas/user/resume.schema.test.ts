import { describe, it, expect } from "vitest";
import { BuilderResumeSchema } from "@/app/features/user/schema/resume.schema";

const validResume = {
  label: "My Resume",
  summary: "Experienced software engineer.",
  educations: [{ school: "MIT", degree: "BSc", field: "Computer Science", graduationYear: 2020 }],
  experiences: [
    {
      company: "Google",
      title: "Engineer",
      startYear: 2020,
      endYear: 2024,
      description: "Built stuff",
    },
  ],
  skills: ["React", "TypeScript"],
};

describe("BuilderResumeSchema", () => {
  it("accepts a valid full payload", () => {
    const result = BuilderResumeSchema.safeParse(validResume);
    expect(result.success).toBe(true);
  });

  it("rejects empty label", () => {
    const result = BuilderResumeSchema.safeParse({ ...validResume, label: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("label");
  });

  it("accepts Unicode/special chars in label", () => {
    const result = BuilderResumeSchema.safeParse({ ...validResume, label: "My Résumé — 2024" });
    expect(result.success).toBe(true);
  });

  it("accepts empty educations array", () => {
    const result = BuilderResumeSchema.safeParse({ ...validResume, educations: [] });
    expect(result.success).toBe(true);
  });

  it("accepts empty experiences array", () => {
    const result = BuilderResumeSchema.safeParse({ ...validResume, experiences: [] });
    expect(result.success).toBe(true);
  });

  it("accepts empty skills array", () => {
    const result = BuilderResumeSchema.safeParse({ ...validResume, skills: [] });
    expect(result.success).toBe(true);
  });

  it("rejects skills with 51 items", () => {
    const result = BuilderResumeSchema.safeParse({
      ...validResume,
      skills: Array.from({ length: 51 }, (_, i) => `Skill${i}`),
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("skills");
  });

  it("rejects educations with 11 items", () => {
    const edu = { school: "S", degree: "BSc", field: "CS", graduationYear: 2020 };
    const result = BuilderResumeSchema.safeParse({
      ...validResume,
      educations: Array.from({ length: 11 }, () => edu),
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("educations");
  });

  it("rejects experiences with 11 items", () => {
    const exp = { company: "C", title: "T", startYear: 2020, endYear: 2024 };
    const result = BuilderResumeSchema.safeParse({
      ...validResume,
      experiences: Array.from({ length: 11 }, () => exp),
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("experiences");
  });

  it("rejects education missing required field (degree)", () => {
    const result = BuilderResumeSchema.safeParse({
      ...validResume,
      educations: [{ school: "MIT" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("degree"));
      expect(issue).toBeDefined();
    }
  });

  it("accepts experience with null endYear", () => {
    const result = BuilderResumeSchema.safeParse({
      ...validResume,
      experiences: [{ company: "C", title: "T", startYear: 2020, endYear: null }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects summary exceeding 2000 chars", () => {
    const result = BuilderResumeSchema.safeParse({ ...validResume, summary: "A".repeat(2001) });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("summary");
  });

  it("rejects graduationYear below 1950", () => {
    const result = BuilderResumeSchema.safeParse({
      ...validResume,
      educations: [{ school: "S", degree: "BSc", field: "CS", graduationYear: 1900 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects graduationYear above 2099", () => {
    const result = BuilderResumeSchema.safeParse({
      ...validResume,
      educations: [{ school: "S", degree: "BSc", field: "CS", graduationYear: 2100 }],
    });
    expect(result.success).toBe(false);
  });
});
