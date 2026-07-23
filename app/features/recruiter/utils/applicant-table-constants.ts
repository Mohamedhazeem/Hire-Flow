import type { ALLOWED_TRANSITIONS } from "@/app/features/recruiter/schema/application.schema";

export const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "applied", label: "Applied" },
  { value: "invited", label: "Invited" },
  { value: "reviewing", label: "Reviewing" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview_scheduled", label: "Interview" },
  { value: "offered", label: "Offered" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

 
export const NEXT_ACTIONS: Record<string, { label: string; status: string }[]> = {
  applied: [
    { label: "Invite", status: "invited" },
    { label: "Start Review", status: "reviewing" },
    { label: "Reject", status: "rejected" },
  ],
  invited: [
    { label: "Start Review", status: "reviewing" },
    { label: "Reject", status: "rejected" },
  ],
  reviewing: [
    { label: "Shortlist", status: "shortlisted" },
    { label: "Reject", status: "rejected" },
  ],
  shortlisted: [
    { label: "Schedule Interview", status: "interview_scheduled" },
    { label: "Reject", status: "rejected" },
  ],
  interview_scheduled: [
    { label: "Send Offer", status: "offered" },
    { label: "Reject", status: "rejected" },
  ],
  offered: [
    { label: "Mark Hired", status: "hired" },
    { label: "Reject", status: "rejected" },
  ],
  hired: [],
  rejected: [],
};

export type BulkActionDef = {
  label: string;
  status: string;
  count: number;
  disabled: boolean;
};

export const STATUS_DOT_COLORS: Record<string, string> = {
  all: "bg-muted",
  applied: "bg-brand",
  invited: "bg-info/60",
  reviewing: "bg-info",
  shortlisted: "bg-accent",
  interview_scheduled: "bg-warning",
  offered: "bg-success",
  hired: "bg-success",
  rejected: "bg-error",
};

export const BULK_ACTION_LABELS: Record<string, string> = {
  invited: "Invite",
  reviewing: "Start Review",
  shortlisted: "Shortlist",
  interview_scheduled: "Schedule Interview",
  offered: "Send Offer",
  hired: "Mark Hired",
  rejected: "Reject",
};
