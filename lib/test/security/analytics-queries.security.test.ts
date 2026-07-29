import { describe, it, expect } from "vitest";
import { AnalyticsFilterSchema } from "@/app/features/recruiter/schema/analytics.schema";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

describe("AnalyticsFilterSchema — SQL injection protection", () => {
  it("rejects SQL injection in status (not in enum)", () => {
    const result = AnalyticsFilterSchema.safeParse({
      status: '\'; DROP TABLE "application"; --',
    });
    expect(result.success).toBe(false);
  });

  it("rejects SQL injection in workMode (not in enum)", () => {
    const result = AnalyticsFilterSchema.safeParse({
      workMode: "' OR '1'='1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects SQL injection in employmentType (not in enum)", () => {
    const result = AnalyticsFilterSchema.safeParse({
      employmentType: '\'; SELECT * FROM "user"; --',
    });
    expect(result.success).toBe(false);
  });

  it("rejects SQL injection in dateFrom (not valid ISO date)", () => {
    const result = AnalyticsFilterSchema.safeParse({
      dateFrom: '\'; DROP TABLE "application"; --',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("dateFrom");
  });

  it("rejects SQL injection in dateTo (not valid ISO date)", () => {
    const result = AnalyticsFilterSchema.safeParse({
      dateTo: '\'; DROP TABLE "application"; --',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("dateTo");
  });

  it("rejects non-UUID in jobId", () => {
    const result = AnalyticsFilterSchema.safeParse({ jobId: "not-a-uuid" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("jobId");
  });

  it("accepts valid UUID jobId", () => {
    const result = AnalyticsFilterSchema.safeParse({ jobId: validUuid });
    expect(result.success).toBe(true);
  });

  it("passes SQL metacharacters in location (free-text field)", () => {
    const result = AnalyticsFilterSchema.safeParse({
      location: "'; DROP TABLE --",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid status enum value", () => {
    const result = AnalyticsFilterSchema.safeParse({ status: "applied" });
    expect(result.success).toBe(true);
  });
});
