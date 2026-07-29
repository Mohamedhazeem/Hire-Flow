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

  it("returns all allowed transitions for a single applicant", () => {
    const apps = [makeApplicant("applied")];
    const actions = getBulkActions(apps);
    expect(actions.length).toBeGreaterThan(0);
    const statuses = actions.map((a) => a.status);
    expect(statuses).toEqual(expect.arrayContaining(["invited", "reviewing", "rejected"]));
  });

  it("returns all allowed transitions for two applicants with same status", () => {
    const apps = [makeApplicant("reviewing"), makeApplicant("reviewing")];
    const actions = getBulkActions(apps);
    expect(actions.map((a) => a.status)).toEqual(expect.arrayContaining(["shortlisted", "rejected"]));
  });

  it("returns union (not intersection) for applicants with different statuses", () => {
    const apps = [makeApplicant("applied"), makeApplicant("reviewing")];
    const actions = getBulkActions(apps);
    const statuses = actions.map((a) => a.status);
    expect(statuses).toEqual(expect.arrayContaining(["invited", "reviewing", "shortlisted", "rejected"]));
  });

  it("marks action as disabled when not all applicants support it", () => {
    const apps = [makeApplicant("applied"), makeApplicant("reviewing")];
    const actions = getBulkActions(apps);
    const invited = actions.find((a) => a.status === "invited")!;
    const rejected = actions.find((a) => a.status === "rejected")!;
    expect(invited.disabled).toBe(true);
    expect(invited.count).toBe(1);
    expect(rejected.disabled).toBe(false);
    expect(rejected.count).toBe(2);
  });

  it("all buttons are enabled when all applicants share the same status", () => {
    const apps = [makeApplicant("interview_scheduled"), makeApplicant("interview_scheduled")];
    const actions = getBulkActions(apps);
    for (const a of actions) {
      expect(a.disabled).toBe(false);
      expect(a.count).toBe(2);
    }
  });

  it("returns empty for applicants in terminal states", () => {
    const apps = [makeApplicant("hired"), makeApplicant("rejected")];
    const actions = getBulkActions(apps);
    expect(actions).toEqual([]);
  });

  it("applies BULK_ACTION_LABELS labels and includes count/disabled", () => {
    const apps = [makeApplicant("applied")];
    const actions = getBulkActions(apps);
    const rejected = actions.find((a) => a.status === "rejected");
    expect(rejected?.label).toBe("Reject");
    expect(rejected).toHaveProperty("count");
    expect(rejected).toHaveProperty("disabled");
  });
});
