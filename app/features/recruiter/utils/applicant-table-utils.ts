import type { ApplicantRow } from "@/app/features/recruiter/queries/application-queries";
import { ALLOWED_TRANSITIONS } from "@/app/features/recruiter/schema/application.schema";
import { BULK_ACTION_LABELS, type BulkActionDef } from "./applicant-table-constants";

const MAX_ACTIONED_IDS = 1000;

export function addActionedIds(prev: Set<string>, ids: string[]): Set<string> {
  const next = new Set(prev);
  for (const id of ids) {
    if (next.size >= MAX_ACTIONED_IDS) break;
    next.add(id);
  }
  if (next.size !== prev.size + ids.length) {
    const entries = [...next];
    const evictCount = Math.floor(entries.length * 0.2);
    for (let i = 0; i < evictCount; i++) next.delete(entries[i]);
  }
  return next;
}

/** Compute intersection of allowed bulk actions across all selected applicants */
export function getBulkActions(selectedApplicants: ApplicantRow[]): BulkActionDef[] {
  if (selectedApplicants.length === 0) return [];

  const statusCounts: Record<string, number> = {};
  for (const a of selectedApplicants) {
    statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1;
  }
  const uniqueStatuses = Object.keys(statusCounts);

  const allAllowed = uniqueStatuses.map((s) => ALLOWED_TRANSITIONS[s] ?? []);
  const intersection = allAllowed.reduce((acc, allowed) =>
    acc.filter((s) => allowed.includes(s)),
  );

  return intersection.map((status) => ({
    label: BULK_ACTION_LABELS[status] ?? status,
    status,
  }));
}
