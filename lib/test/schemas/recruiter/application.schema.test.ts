import { describe, it, expect } from "vitest";
import {
  ApplicationStatusSchema,
  ScheduleInterviewSchema,
  SendOfferSchema,
  RejectSchema,
  StatusTransitionSchema,
  BulkStatusTransitionSchema,
} from "@/app/features/recruiter/schema/application.schema";

describe("ApplicationStatusSchema", () => {
  it("accepts valid status strings", () => {
    for (const s of [
      "applied",
      "invited",
      "reviewing",
      "shortlisted",
      "interview_scheduled",
      "offered",
      "hired",
      "rejected",
      "withdrawn",
    ]) {
      expect(ApplicationStatusSchema.safeParse(s).success).toBe(true);
    }
  });

  it("rejects an invalid status string", () => {
    expect(ApplicationStatusSchema.safeParse("invalid").success).toBe(false);
  });
});

describe("StatusTransitionSchema", () => {
  it("accepts a valid shortlist (reviewing)", () => {
    const result = StatusTransitionSchema.safeParse({ status: "reviewing" });
    expect(result.success).toBe(true);
  });

  it("accepts a valid schedule interview", () => {
    const result = StatusTransitionSchema.safeParse({
      status: "interview_scheduled",
      interviewDate: "2026-08-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid offer with details", () => {
    const result = StatusTransitionSchema.safeParse({
      status: "offered",
      offerDetails: "Stock options + salary of $120k",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty offer details (via SendOfferSchema directly)", () => {
    const result = SendOfferSchema.safeParse({ status: "offered", offerDetails: "" });
    expect(result.success).toBe(false);
  });

  it("rejects reject without reason (via RejectSchema directly)", () => {
    const result = RejectSchema.safeParse({ status: "rejected" });
    expect(result.success).toBe(false);
  });

  it("accepts reject with reason", () => {
    const result = StatusTransitionSchema.safeParse({
      status: "rejected",
      rejectionReason: "Not qualified",
    });
    expect(result.success).toBe(true);
  });
});

describe("BulkStatusTransitionSchema", () => {
  it("accepts a valid bulk request", () => {
    const result = BulkStatusTransitionSchema.safeParse({
      applicationIds: ["id1", "id2"],
      status: "hired",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty applicationIds", () => {
    const result = BulkStatusTransitionSchema.safeParse({
      applicationIds: [],
      status: "hired",
    });
    expect(result.success).toBe(false);
  });

  it("rejects bulk with 51 IDs (max 50)", () => {
    const result = BulkStatusTransitionSchema.safeParse({
      applicationIds: Array.from({ length: 51 }, (_, i) => `id-${i}`),
      status: "reviewing",
    });
    expect(result.success).toBe(false);
  });

  it("rejects bulk reject without reason via superRefine", () => {
    const result = BulkStatusTransitionSchema.safeParse({
      applicationIds: ["id1"],
      status: "rejected",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("rejectionReason");
    }
  });

  it("accepts bulk reject with reason", () => {
    const result = BulkStatusTransitionSchema.safeParse({
      applicationIds: ["id1"],
      status: "rejected",
      rejectionReason: "Not a fit",
    });
    expect(result.success).toBe(true);
  });
});
