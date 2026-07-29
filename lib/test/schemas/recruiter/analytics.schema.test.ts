import { describe, it, expect } from "vitest";
import { AnalyticsFilterSchema } from "@/app/features/recruiter/schema/analytics.schema";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

describe("AnalyticsFilterSchema", () => {
  it("accepts a valid full payload", () => {
    const result = AnalyticsFilterSchema.safeParse({
      jobId: validUuid,
      dateFrom: "2024-01-01",
      dateTo: "2024-01-31",
      status: "applied",
      workMode: "remote",
      employmentType: "full_time",
      location: "New York",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty payload (all optional)", () => {
    const result = AnalyticsFilterSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects an invalid status value", () => {
    const result = AnalyticsFilterSchema.safeParse({ status: "invalid_status" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("status");
    }
  });

  it("rejects an invalid workMode value", () => {
    const result = AnalyticsFilterSchema.safeParse({ workMode: "invalid" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("workMode");
    }
  });

  it("rejects an invalid employmentType value", () => {
    const result = AnalyticsFilterSchema.safeParse({ employmentType: "invalid" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("employmentType");
    }
  });

  it("rejects a non-date string in dateFrom", () => {
    const result = AnalyticsFilterSchema.safeParse({ dateFrom: "not-a-date" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("dateFrom");
    }
  });

  it("rejects a non-date string in dateTo", () => {
    const result = AnalyticsFilterSchema.safeParse({ dateTo: "also-not-a-date" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("dateTo");
    }
  });

  it("rejects dateFrom after dateTo via refine", () => {
    const result = AnalyticsFilterSchema.safeParse({
      dateFrom: "2024-01-31",
      dateTo: "2024-01-01",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("dateFrom");
    }
  });

  it("accepts comma-separated status values", () => {
    const result = AnalyticsFilterSchema.safeParse({ status: "applied,invited" });
    expect(result.success).toBe(true);
  });

  it("rejects a non-UUID jobId", () => {
    const result = AnalyticsFilterSchema.safeParse({ jobId: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("jobId");
    }
  });

  it("accepts a valid UUID jobId", () => {
    const result = AnalyticsFilterSchema.safeParse({ jobId: validUuid });
    expect(result.success).toBe(true);
  });

  it("rejects an empty string status (not in enum)", () => {
    const result = AnalyticsFilterSchema.safeParse({ status: "" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid filter params simultaneously", () => {
    const result = AnalyticsFilterSchema.safeParse({
      jobId: validUuid,
      dateFrom: "2024-01-01",
      dateTo: "2024-01-31",
      status: "hired",
      workMode: "hybrid",
      employmentType: "contract",
      location: "London",
    });
    expect(result.success).toBe(true);
  });

  it("accepts dateFrom without dateTo", () => {
    const result = AnalyticsFilterSchema.safeParse({ dateFrom: "2024-06-01" });
    expect(result.success).toBe(true);
  });

  it("accepts dateTo without dateFrom", () => {
    const result = AnalyticsFilterSchema.safeParse({ dateTo: "2024-06-01" });
    expect(result.success).toBe(true);
  });
});
