"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useApplicants,
  useBulkTransitionStatus,
  useRevertStatus,
} from "@/app/features/recruiter/hooks/use-applications";
import {
  ShortlistDialog,
  ScheduleInterviewDialog,
  SendOfferDialog,
  RejectDialog,
} from "@/app/features/recruiter/components/application-dialogs";
import { BulkRejectDialog } from "@/app/features/recruiter/components/bulk-reject-dialog";
import { RevertConfirmDialog } from "@/app/features/recruiter/components/revert-dialog";
import { ALLOWED_TRANSITIONS } from "@/app/features/recruiter/schema/application.schema";
import type { ListApplicantsParams, BulkStatusTransitionInput } from "@/app/features/recruiter/schema/application.schema";
import type { ApplicantRow } from "@/app/features/recruiter/queries/application-queries";
import { useSession } from "@/app/features/auth/libs/auth-client";
import { cn } from "@/lib/utils";
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  CheckCircle2Icon,
  CalendarIcon,
  SendIcon,
  XCircleIcon,
  MessageSquareTextIcon,
  RotateCcwIcon,
  Undo2Icon,
  XIcon,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "applied", label: "Applied" },
  { value: "reviewing", label: "Reviewing" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview_scheduled", label: "Interview" },
  { value: "offered", label: "Offered" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NEXT_ACTIONS: Record<string, { label: string; status: string }[]> = {
  applied: [
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

type BulkActionDef = { label: string; status: string };

const MAX_ACTIONED_IDS = 1000;

function addActionedIds(prev: Set<string>, ids: string[]): Set<string> {
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

const STATUS_DOT_COLORS: Record<string, string> = {
  all: "bg-muted",
  applied: "bg-brand",
  reviewing: "bg-info",
  shortlisted: "bg-accent",
  interview_scheduled: "bg-warning",
  offered: "bg-success",
  hired: "bg-success",
  rejected: "bg-error",
};

const BULK_ACTION_LABELS: Record<string, string> = {
  reviewing: "Start Review",
  shortlisted: "Shortlist",
  interview_scheduled: "Schedule Interview",
  offered: "Send Offer",
  hired: "Mark Hired",
  rejected: "Reject",
};

/** Compute intersection of allowed bulk actions across all selected applicants */
function getBulkActions(selectedApplicants: ApplicantRow[]): BulkActionDef[] {
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

type ApplicantsTableProps = {
  jobId: string;
};

export function ApplicantsTable({ jobId }: ApplicantsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const recruiterId = (session?.user as { id?: string })?.id ?? "";

  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";

  const [searchInput, setSearchInput] = useState(search);

  const [dialog, setDialog] = useState<{
    type: string;
    applicant: ApplicantRow | null;
  }>({ type: "", applicant: null });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDialog, setBulkDialog] = useState<string>("");
  const [actionedIds, setActionedIds] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [revertTarget, setRevertTarget] = useState<ApplicantRow | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bulkTransition = useBulkTransitionStatus();
  const revertTransition = useRevertStatus();

  const params: ListApplicantsParams = {
    page,
    pageSize: 20,
    sortBy: "appliedAt",
    sortOrder: "desc",
    search: search || undefined,
    status: status === "all" ? undefined : (status as ListApplicantsParams["status"]),
  };

  const { data, isLoading, isError } = useApplicants(jobId, params);

  const responseData = data?.data;
  const totalPages = Math.max(1, responseData?.totalPages ?? 1);
  const hasNextPage = responseData?.hasNextPage ?? false;
  const hasPrevPage = responseData?.hasPrevPage ?? false;

  const applicants = useMemo(
    () => responseData?.applicants ?? [],
    [responseData?.applicants],
  );

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value && value !== "all") {
          sp.set(key, value);
        } else {
          sp.delete(key);
        }
      }
      router.push(`/recruiter/jobs/${jobId}/applicants?${sp.toString()}`);
    },
    [router, searchParams, jobId],
  );

  const selectedRows = useMemo(
    () => applicants.filter((a) => selectedIds.has(a.id) && !actionedIds.has(a.id)),
    [applicants, selectedIds, actionedIds],
  );

  const bulkActions = useMemo(() => getBulkActions(selectedRows), [selectedRows]);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  const showFeedback = useCallback((type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 5000);
  }, []);

  const handleBulkAction = useCallback(
    (targetStatus: string) => {
      const needsReason = targetStatus === "rejected";

      if (needsReason) {
        setBulkDialog("reject");
        return;
      }

      const ids = [...selectedIds].filter((id) => !actionedIds.has(id));

      bulkTransition.mutate(
        { applicationIds: ids, status: targetStatus as BulkStatusTransitionInput["status"], email: false },
        {
          onSuccess: () => {
            showFeedback("success", `${ids.length} applicant${ids.length > 1 ? "s" : ""} moved to "${BULK_ACTION_LABELS[targetStatus] ?? targetStatus}"`);
            setActionedIds((prev) => addActionedIds(prev, ids));
            setSelectedIds(new Set());
          },
          onError: (error: Error) => {
            showFeedback("error", (error as { message?: string }).message ?? "Bulk action failed");
          },
        },
      );
    },
    [selectedIds, actionedIds, bulkTransition, showFeedback],
  );

  const handleBulkRejectConfirm = useCallback(
    (rejectionReason: string) => {
      const ids = [...selectedIds].filter((id) => !actionedIds.has(id));

      bulkTransition.mutate(
        { applicationIds: ids, status: "rejected", rejectionReason, email: false },
        {
          onSuccess: () => {
            showFeedback("success", `${ids.length} applicant${ids.length > 1 ? "s" : ""} rejected`);
            setActionedIds((prev) => addActionedIds(prev, ids));
            setSelectedIds(new Set());
            setBulkDialog("");
          },
          onError: (error: Error) => {
            showFeedback("error", (error as { message?: string }).message ?? "Bulk rejection failed");
          },
        },
      );
    },
    [selectedIds, actionedIds, bulkTransition, showFeedback],
  );

  const handleRevert = useCallback(
    (applicantId: string) => {
      revertTransition.mutate(
        { applicationId: applicantId },
        {
          onSuccess: () => {
            setActionedIds((prev) => { const n = new Set(prev); n.delete(applicantId); return n; });
            showFeedback("success", "Applicant reverted to previous status");
          },
          onError: (error: Error) => {
            showFeedback("error", (error as { message?: string }).message ?? "Revert failed");
          },
        },
      );
    },
    [revertTransition, showFeedback],
  );

  const columns: ColumnDef<ApplicantRow>[] = [
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <span className="font-medium text-text-heading max-w-xs truncate block">
          {row.name}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (row) => <span className="text-text-body text-sm">{row.email}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "appliedAt",
      header: "Applied",
      cell: (row) => (
        <span className="text-text-muted text-xs whitespace-nowrap">
          {new Date(row.appliedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (row) => {
        const threadId =
          recruiterId && row.userId
            ? [recruiterId, row.userId].sort().join("_")
            : null;

        const isActioned = actionedIds.has(row.id);

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              title="View Details"
              onClick={() =>
                router.push(`/recruiter/applicants/${row.id}`)
              }
            >
              <EyeIcon className="size-4 text-text-muted hover:text-brand" />
            </Button>
            {threadId && (
              <Button
                variant="ghost"
                size="icon-sm"
                title="Message"
                onClick={() =>
                  router.push(`/recruiter/messages?thread=${threadId}`, { scroll: false })
                }
              >
                <MessageSquareTextIcon className="size-4 text-text-muted hover:text-brand" />
              </Button>
            )}
            {isActioned ? (
              <Button
                variant="ghost"
                size="icon-sm"
                title="Revert"
                onClick={() => setRevertTarget(row)}
              >
                <Undo2Icon className="size-4 text-warning" />
              </Button>
            ) : (
              <>
                {row.status === "reviewing" && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Shortlist"
                    onClick={() => setDialog({ type: "shortlist", applicant: row })}
                  >
                    <CheckCircle2Icon className="size-4 text-accent" />
                  </Button>
                )}
                {row.status === "shortlisted" && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Schedule Interview"
                    onClick={() => setDialog({ type: "schedule_interview", applicant: row })}
                  >
                    <CalendarIcon className="size-4 text-warning" />
                  </Button>
                )}
                {row.status === "interview_scheduled" && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Send Offer"
                    onClick={() => setDialog({ type: "send_offer", applicant: row })}
                  >
                    <SendIcon className="size-4 text-success" />
                  </Button>
                )}
                {row.status !== "hired" && row.status !== "rejected" && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Reject"
                    onClick={() => setDialog({ type: "reject", applicant: row })}
                  >
                    <XCircleIcon className="size-4 text-destructive" />
                  </Button>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <Skeleton className="h-9 w-full sm:w-36 rounded-md" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive text-sm py-8 text-center">
        Failed to load applicants. Please try again.
      </div>
    );
  }

  const selectedApplicant = dialog.applicant;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 min-w-0">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
          <Input
            placeholder="Search applicants..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams({ search: searchInput, page: "1" });
              }
            }}
            className="pl-10 rounded-xl bg-bg-elevated border-border-subtle"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => updateParams({ status: v ?? "all", page: "1" })}
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue>
              {STATUS_OPTIONS.find((o) => o.value === status)?.label ?? "All Status"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", STATUS_DOT_COLORS[opt.value] ?? "bg-muted")} />
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={applicants}
        enableSelection
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(row) => (row as ApplicantRow).id}
        disabledIds={actionedIds}
        emptyMessage={
          Object.keys(Object.fromEntries(searchParams)).length > 1
            ? "No applicants match your filters. Try clearing the filters."
            : "No applicants yet for this job."
        }
      />

      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-subtle bg-bg-surface shadow-xl p-4 sm:static sm:border sm:rounded-2xl sm:shadow-xs">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-text-heading whitespace-nowrap">
                {selectedIds.size} selected
              </span>
              {selectedIds.size < (responseData?.total ?? 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newSet = new Set(applicants.filter((a) => !actionedIds.has(a.id)).map((a) => a.id));
                    setSelectedIds(newSet);
                  }}
                  className="text-xs"
                >
                  Select all {applicants.filter((a) => !actionedIds.has(a.id)).length} on this page
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs"
              >
                <RotateCcwIcon className="size-3 mr-1" />
                Clear
              </Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {bulkActions.length === 0 ? (
                <span className="text-xs text-text-muted">
                  No bulk actions available for this selection
                </span>
              ) : (
                bulkActions.map((action) => (
                  <Button
                    key={action.status}
                    size="sm"
                    variant={action.status === "rejected" ? "destructive" : "default"}
                    onClick={() => handleBulkAction(action.status)}
                    disabled={bulkTransition.isPending}
                  >
                    {action.label}
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <div
          className={cn(
            "flex items-center justify-between rounded-xl px-4 py-2.5 text-sm",
            feedback.type === "success" && "bg-success/10 text-success border border-success/20",
            feedback.type === "error" && "bg-error/10 text-error border border-error/20",
          )}
        >
          <span className="flex items-center gap-2">
            {feedback.type === "success" && <CheckCircle2Icon className="size-4" />}
            {feedback.type === "error" && <XCircleIcon className="size-4" />}
            {feedback.message}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setFeedback(null)}
          >
            <XIcon className="size-3" />
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-text-muted gap-2">
        <span className="hidden sm:inline">
          Page {responseData?.page ?? 1} of {totalPages}
          {responseData && ` (${responseData.total} total)`}
        </span>
        <span className="sm:hidden text-xs">
          {responseData?.page ?? 1}/{totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrevPage}
            onClick={() => updateParams({ page: String(Math.max(1, page - 1)) })}
          >
            <ChevronLeftIcon className="size-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage}
            onClick={() => updateParams({ page: String(page + 1) })}
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>

      <ShortlistDialog
        open={dialog.type === "shortlist"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "", applicant: null });
        }}
        applicant={selectedApplicant}
      />

      <ScheduleInterviewDialog
        open={dialog.type === "schedule_interview"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "", applicant: null });
        }}
        applicant={selectedApplicant}
      />

      <SendOfferDialog
        open={dialog.type === "send_offer"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "", applicant: null });
        }}
        applicant={selectedApplicant}
      />

      <RejectDialog
        open={dialog.type === "reject"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "", applicant: null });
        }}
        applicant={selectedApplicant}
      />

      <BulkRejectDialog
        open={bulkDialog === "reject"}
        onOpenChange={(open) => {
          if (!open) setBulkDialog("");
        }}
        selectedCount={selectedIds.size}
        onConfirm={handleBulkRejectConfirm}
        isPending={bulkTransition.isPending}
      />

      <RevertConfirmDialog
        open={revertTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRevertTarget(null);
        }}
        applicantName={revertTarget?.name ?? ""}
        currentStatus={revertTarget?.status ?? ""}
        onConfirm={() => {
          if (!revertTarget) return;
          handleRevert(revertTarget.id);
          setRevertTarget(null);
        }}
        isPending={revertTransition.isPending}
      />
    </div>
  );
}
