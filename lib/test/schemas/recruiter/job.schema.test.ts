import { describe, it, expect } from "vitest";
import {
  JobCreateSchema,
  JobUpdateSchema,
  RecruiterListJobsParamsSchema,
} from "@/app/features/recruiter/schema/job.schema";

const validCreate = {
  title: "Senior Frontend Engineer",
  description: "We are looking for a senior frontend engineer.",
  locations: ["New York", "London"],
  workMode: "remote" as const,
  employmentType: "full_time" as const,
  timezone: "EST",
  skills: ["React", "TypeScript"],
  tags: ["engineering", "frontend"],
  experienceLevel: "Senior",
  salaryMin: 100000,
  salaryMax: 150000,
  salaryCurrency: "USD",
  applicationDeadline: "2026-12-31",
};

describe("JobCreateSchema", () => {
  it("accepts a valid create payload", () => {
    const result = JobCreateSchema.safeParse(validCreate);
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = JobCreateSchema.safeParse({ ...validCreate, title: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("title");
  });

  it("rejects empty description", () => {
    const result = JobCreateSchema.safeParse({ ...validCreate, description: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("description");
  });

  it("rejects empty locations", () => {
    const result = JobCreateSchema.safeParse({ ...validCreate, locations: [] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("locations");
  });

  it("rejects empty experienceLevel", () => {
    const result = JobCreateSchema.safeParse({ ...validCreate, experienceLevel: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("experienceLevel");
  });

  it("rejects negative salaryMin", () => {
    const result = JobCreateSchema.safeParse({ ...validCreate, salaryMin: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects negative salaryMax", () => {
    const result = JobCreateSchema.safeParse({ ...validCreate, salaryMax: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects salaryMin > salaryMax via refine", () => {
    const result = JobCreateSchema.safeParse({
      ...validCreate,
      salaryMin: 200000,
      salaryMax: 100000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("salaryMin");
      expect(result.error.issues[0].message).toMatch(/salary min/i);
    }
  });

  it("accepts salaryMin <= salaryMax", () => {
    const result = JobCreateSchema.safeParse({
      ...validCreate,
      salaryMin: 50000,
      salaryMax: 100000,
    });
    expect(result.success).toBe(true);
  });

  it("accepts salaryMin undefined with salaryMax set", () => {
    const result = JobCreateSchema.safeParse({
      ...validCreate,
      salaryMin: undefined,
    });
    expect(result.success).toBe(true);
  });

  it("accepts Unicode in title", () => {
    const result = JobCreateSchema.safeParse({ ...validCreate, title: "ソフトウェアエンジニア" });
    expect(result.success).toBe(true);
  });

  it("accepts HTML entities in title (escaping is rendering concern)", () => {
    const result = JobCreateSchema.safeParse({
      ...validCreate,
      title: "<script>alert('xss')</script>",
    });
    expect(result.success).toBe(true);
  });

  it("accepts markdown in description", () => {
    const result = JobCreateSchema.safeParse({
      ...validCreate,
      description: "# Hello\n\nThis is **bold**",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty skills array", () => {
    const result = JobCreateSchema.safeParse({ ...validCreate, skills: [] });
    expect(result.success).toBe(true);
  });

  it("accepts empty tags array", () => {
    const result = JobCreateSchema.safeParse({ ...validCreate, tags: [] });
    expect(result.success).toBe(true);
  });

  it("accepts past applicationDeadline (legacy posts)", () => {
    const result = JobCreateSchema.safeParse({ ...validCreate, applicationDeadline: "2020-01-01" });
    expect(result.success).toBe(true);
  });

  it("accepts valid workMode enum", () => {
    const result = JobCreateSchema.safeParse({ ...validCreate, workMode: "onsite" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid workMode", () => {
    const result = JobCreateSchema.safeParse({ ...validCreate, workMode: "invalid" });
    expect(result.success).toBe(false);
  });

  it("accepts valid employmentType enum", () => {
    const result = JobCreateSchema.safeParse({ ...validCreate, employmentType: "internship" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid employmentType", () => {
    const result = JobCreateSchema.safeParse({ ...validCreate, employmentType: "invalid" });
    expect(result.success).toBe(false);
  });

  it("accepts very long title (10K chars, no maxLength)", () => {
    const result = JobCreateSchema.safeParse({ ...validCreate, title: "A".repeat(10000) });
    expect(result.success).toBe(true);
  });
});

describe("JobUpdateSchema", () => {
  it("accepts a valid partial update", () => {
    const result = JobUpdateSchema.safeParse({ title: "Updated Title" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (all optional)", () => {
    const result = JobUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects salaryMin > salaryMax", () => {
    const result = JobUpdateSchema.safeParse({ salaryMin: 200000, salaryMax: 50000 });
    expect(result.success).toBe(false);
  });

  it("accepts salaryMin undefined with salaryMax set", () => {
    const result = JobUpdateSchema.safeParse({ salaryMax: 100000 });
    expect(result.success).toBe(true);
  });
});

describe("RecruiterListJobsParamsSchema", () => {
  it("provides defaults for empty input", () => {
    const result = RecruiterListJobsParamsSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.status).toBe("all");
    expect(result.sortBy).toBe("createdAt");
    expect(result.sortOrder).toBe("desc");
  });
});
