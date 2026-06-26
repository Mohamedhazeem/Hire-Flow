"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import {
  useRecruiterJobs,
  useDeleteJob,
  useToggleJobStatus,
} from "@/app/features/recruiter/hooks/use-recruiter-jobs";
import type { JobListParams } from "@/app/features/recruiter/schema/job.schema";
import type { RecruiterJobRow } from "@/app/features/recruiter/queries/job-queries";
import {
  Trash2Icon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  PencilIcon,
  PlayIcon,
  ArchiveIcon,
  Loader2Icon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_BADGE: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
  draft: { variant: "secondary", label: "Draft" },
  active: { variant: "default", label: "Active" },
  archived: { variant: "outline", label: "Archived" },
};

const WORK_MODE_LABELS: Record<string, string> = {
  all: "All Modes",
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  all: "All Types",
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  freelance: "Freelance",
};

export function RecruiterJobsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const workMode = searchParams.get("workMode") ?? "all";
  const employmentType = searchParams.get("employmentType") ?? "all";

  const [searchInput, setSearchInput] = useState(search);

  const params: JobListParams = {
    page,
    pageSize: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
    search: search || undefined,
    status: status === "all" ? "all" : (status as "draft" | "active" | "archived"),
    workMode: workMode === "all" ? undefined : (workMode as "remote" | "hybrid" | "onsite"),
    employmentType:
      employmentType === "all"
        ? undefined
        : (employmentType as "full_time" | "part_time" | "contract" | "internship" | "freelance"),
  };

  const { data, isLoading, isError } = useRecruiterJobs(params);
  const deleteJob = useDeleteJob();
  const toggleStatus = useToggleJobStatus();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const responseData = data?.data;
  const jobs = responseData?.jobs ?? [];
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
      router.push(`/recruiter/jobs?${sp.toString()}`);
    },
    [router, searchParams],
  );

  const handleToggle = useCallback(
    (jobId: string, currentStatus: string) => {
      const nextStatus = currentStatus === "draft" ? "active" : "archived";
      toggleStatus.mutate({ id: jobId, status: nextStatus });
    },
    [toggleStatus],
  );

  const handleDelete = useCallback(
    (job: RecruiterJobRow) => {
      const force = job.status === "archived";
      setDeletingId(job.id);
      deleteJob.mutate(
        { id: job.id, force },
        {
          onSettled: () => setDeletingId(null),
        },
      );
    },
    [deleteJob],
  );

  const columns: ColumnDef<RecruiterJobRow>[] = [
    {
      key: "title",
      header: "Title",
      cell: (row) => (
        <button
          onClick={() => router.push(`/recruiter/jobs/${row.id}`)}
          className="font-medium text-text-heading max-w-xs truncate block hover:text-brand transition-colors text-left"
        >
          {row.title}
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => {
        const config = STATUS_BADGE[row.status] ?? { variant: "secondary" as const, label: row.status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "workMode",
      header: "Mode",
      cell: (row) => <span className="text-text-body capitalize">{row.workMode}</span>,
    },
    {
      key: "employmentType",
      header: "Type",
      cell: (row) => (
        <span className="text-text-body capitalize">{row.employmentType.replace(/_/g, " ")}</span>
      ),
    },
    {
      key: "applications",
      header: "Apps",
      className: "text-center",
      cell: (row) => (
        <span className="text-text-body text-center block">{row.applicationCount}</span>
      ),
    },
    {
      key: "views",
      header: "Views",
      className: "text-center",
      cell: (row) => <span className="text-text-body text-center block">{row.viewCount}</span>,
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row) => (
        <span className="text-text-muted text-xs whitespace-nowrap">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            title="View details"
            onClick={() => router.push(`/recruiter/jobs/${row.id}`)}
          >
            <ExternalLinkIcon className="size-4 text-text-muted" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Edit"
            onClick={() => router.push(`/recruiter/jobs/${row.id}/edit`)}
          >
            <PencilIcon className="size-4 text-text-muted" />
          </Button>
          {(row.status === "draft" || row.status === "active") && (
            <Button
              variant="ghost"
              size="icon-sm"
              title={row.status === "draft" ? "Publish" : "Archive"}
              onClick={() => handleToggle(row.id, row.status)}
              disabled={toggleStatus.isPending}
            >
              {row.status === "draft" ? (
                <PlayIcon className="size-4 text-success" />
              ) : (
                <ArchiveIcon className="size-4 text-warning" />
              )}
            </Button>
          )}
          <ConfirmActionButton
            dialogVariant={row.status === "archived" ? "destructive" : "warning"}
            title={row.status === "archived" ? "Permanently Delete Job" : row.status === "draft" ? "Delete Job" : "Archive Job"}
            description={
              row.status === "archived"
                ? `Permanently delete "${row.title}"? All associated applications will be removed.`
                : row.status === "draft"
                  ? `Delete draft "${row.title}"? This cannot be undone.`
                  : `Archive "${row.title}"? Applications will be preserved.`
            }
            confirmLabel={row.status === "archived" ? "Permanently Delete" : row.status === "draft" ? "Delete" : "Archive"}
            action={() => handleDelete(row)}
            isPending={deletingId === row.id && deleteJob.isPending}
            variant="ghost"
            size="icon-sm"
            tooltip={row.status === "archived" ? "Permanently delete" : "Delete"}
          >
            <Trash2Icon className="size-4 text-destructive" />
          </ConfirmActionButton>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <Skeleton className="h-9 w-full sm:w-36 rounded-md" />
          <Skeleton className="h-9 w-full sm:w-36 rounded-md" />
          <Skeleton className="h-9 w-full sm:w-40 rounded-md" />
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
        Failed to load jobs. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 min-w-0">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
          <Input
            placeholder="Search jobs..."
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
              {status === "all" ? "All Status" : status === "draft" ? "Draft" : status === "active" ? "Active" : "Archived"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={workMode}
          onValueChange={(v) => updateParams({ workMode: v ?? "all", page: "1" })}
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue>{WORK_MODE_LABELS[workMode] ?? workMode}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="onsite">On-site</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={employmentType}
          onValueChange={(v) => updateParams({ employmentType: v ?? "all", page: "1" })}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue>{EMPLOYMENT_TYPE_LABELS[employmentType] ?? employmentType}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full_time">Full-time</SelectItem>
            <SelectItem value="part_time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
            <SelectItem value="freelance">Freelance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={jobs}
        emptyMessage={
          Object.keys(Object.fromEntries(searchParams)).length > 1
            ? "No jobs match your filters. Try clearing the filters."
            : "No jobs found. Create your first job posting."
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
    </div>
  );
}
