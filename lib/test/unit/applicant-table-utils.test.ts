import { describe, it, expect } from "vitest";
import { addActionedIds, getBulkActions } from "@/app/features/recruiter/utils/applicant-table-utils";
import type { ApplicantRow } from "@/app/features/recruiter/queries/application-queries";

function makeApplicant(status: string, overrides: Partial<ApplicantRow> = {}): ApplicantRow {
  return {
    id: `id-${status}-${Math.random().toString(36).slice(2)}`,
    userId: `user-${Date.now()}`,
    name: "Test",
    email: "test@test.com",
    status,
    appliedAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("addActionedIds", () => {
  it("appends new ids to the set", () => {
    const prev = new Set(["a", "b"]);
    const result = addActionedIds(prev, ["c", "d"]);
    expect(result.size).toBe(4);
    expect(result.has("c")).toBe(true);
    expect(result.has("d")).toBe(true);
  });

  it("deduplicates when adding existing ids", () => {
    const prev = new Set(["a", "b"]);
    const result = addActionedIds(prev, ["b", "c"]);
    expect(result.size).toBe(3);
  });

  it("evicts oldest 20% when size would exceed MAX_ACTIONED_IDS", () => {
    const ids = Array.from({ length: 1000 }, (_, i) => `id-${i}`);
    const prev = new Set(ids);
    const result = addActionedIds(prev, ["new-1", "new-2"]);
    expect(result.size).toBeLessThan(1000 + 2);
    expect(result.has("new-1")).toBe(false);
    expect(result.has("new-2")).toBe(false);
  });
});

describe("getBulkActions", () => {
  it("returns empty array for empty selection", () => {
    expect(getBulkActions([])).toEqual([]);
  });

  it("returns allowed transitions for a single applicant", () => {
    const apps = [makeApplicant("applied")];
    const actions = getBulkActions(apps);
    expect(actions.length).toBeGreaterThan(0);
    expect(actions.map((a) => a.status)).toEqual(
      expect.arrayContaining(["reviewing", "rejected"]),
    );
  });

  it("returns same transitions for two applicants with same status", () => {
    const apps = [makeApplicant("reviewing"), makeApplicant("reviewing")];
    const actions = getBulkActions(apps);
    expect(actions.map((a) => a.status)).toEqual(
      expect.arrayContaining(["shortlisted", "rejected"]),
    );
  });

  it("returns intersection for applicants with different statuses", () => {
    const apps = [makeApplicant("applied"), makeApplicant("reviewing")];
    const actions = getBulkActions(apps);
    const statuses = actions.map((a) => a.status);
    expect(statuses).toContain("rejected");
    expect(statuses).not.toContain("shortlisted");
  });

  it("returns empty intersection when no statuses overlap", () => {
    const apps = [makeApplicant("hired"), makeApplicant("rejected")];
    const actions = getBulkActions(apps);
    expect(actions).toEqual([]);
  });

  it("applies BULK_ACTION_LABELS labels", () => {
    const apps = [makeApplicant("applied")];
    const actions = getBulkActions(apps);
    const rejected = actions.find((a) => a.status === "rejected");
    expect(rejected?.label).toBe("Reject");
  });
});
