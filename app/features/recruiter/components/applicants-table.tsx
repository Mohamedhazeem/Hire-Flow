"use client";

import { useState, useCallback } from "react";
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
} from "@/app/features/recruiter/hooks/use-applications";
import {
  ShortlistDialog,
  ScheduleInterviewDialog,
  SendOfferDialog,
  RejectDialog,
} from "@/app/features/recruiter/components/application-dialogs";
import type { ListApplicantsParams } from "@/app/features/recruiter/schema/application.schema";
import type { ApplicantRow } from "@/app/features/recruiter/queries/application-queries";
import { useSession } from "@/app/features/auth/libs/auth-client";
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
  const applicants = responseData?.applicants ?? [];
  const totalPages = responseData?.totalPages ?? 1;
  const hasNextPage = responseData?.hasNextPage ?? false;
  const hasPrevPage = responseData?.hasPrevPage ?? false;

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
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={applicants}
        emptyMessage={
          Object.keys(Object.fromEntries(searchParams)).length > 1
            ? "No applicants match your filters. Try clearing the filters."
            : "No applicants yet for this job."
        }
      />

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
    </div>
  );
}
