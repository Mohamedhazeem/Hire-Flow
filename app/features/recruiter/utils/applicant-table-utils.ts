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

/** Pipeline order for rendering bulk action buttons */
const PIPELINE_ORDER: Record<string, number> = {
  invited: 0,
  reviewing: 1,
  shortlisted: 2,
  interview_scheduled: 3,
  offered: 4,
  hired: 5,
  rejected: 6,
};

/** Compute union of allowed bulk actions across all selected applicants */
export function getBulkActions(selectedApplicants: ApplicantRow[]): BulkActionDef[] {
  if (selectedApplicants.length === 0) return [];

  const total = selectedApplicants.length;

  // Union: collect all unique allowed transitions
  const unionSet = new Set<string>();
  const statusCounts: Record<string, number> = {};
  for (const a of selectedApplicants) {
    const allowed = ALLOWED_TRANSITIONS[a.status] ?? [];
    for (const s of allowed) {
      unionSet.add(s);
      statusCounts[s] = (statusCounts[s] ?? 0) + 1;
    }
  }

  return [...unionSet]
    .sort((a, b) => (PIPELINE_ORDER[a] ?? 99) - (PIPELINE_ORDER[b] ?? 99))
    .map((status) => ({
      label: BULK_ACTION_LABELS[status] ?? status,
      status,
      count: statusCounts[status] ?? 0,
      disabled: (statusCounts[status] ?? 0) < total,
    }));
}
