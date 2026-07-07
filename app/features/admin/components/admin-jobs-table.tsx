"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useState, useCallback } from "react";
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
  useAdminJobs,
  useDeleteJob,
  useToggleJobStatus,
} from "@/app/features/admin/hooks/use-admin-jobs";
import type { AdminListJobsParams } from "@/app/features/admin/schema/admin.schema";
import {
  Trash2Icon,
  ToggleLeftIcon,
  ToggleRightIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import type { AdminJobRow } from "@/app/features/admin/queries/job-queries";

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

type AdminJobsTableProps = {
  statusFilter?: "active" | "inactive" | "all";
};

export function AdminJobsTable({ statusFilter = "all" }: AdminJobsTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(statusFilter);
  const [workMode, setWorkMode] = useState<string>("all");
  const [employmentType, setEmploymentType] = useState<string>("all");
  const params: AdminListJobsParams = {
    page,
    pageSize: 20,
    sortBy: "createdAt" as const,
    sortOrder: "desc" as const,
    search: search || undefined,
    status: status === "all" ? "all" : (status as "active" | "inactive"),
    workMode: workMode === "all" ? undefined : (workMode as "remote" | "hybrid" | "onsite"),
    employmentType:
      employmentType === "all"
        ? undefined
        : (employmentType as "full_time" | "part_time" | "contract" | "internship" | "freelance"),
  };
  const { data, isLoading, isError } = useAdminJobs(params);
  const deleteJob = useDeleteJob();
  const toggleStatus = useToggleJobStatus();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const responseData = data?.data;
  const jobs = responseData?.jobs ?? [];
  const totalPages = responseData?.totalPages ?? 1;
  const hasNextPage = responseData?.hasNextPage ?? false;
  const hasPrevPage = responseData?.hasPrevPage ?? false;

  const handleToggle = useCallback(
    (jobId: string, currentActive: boolean) => {
      toggleStatus.mutate({ jobId, isActive: !currentActive });
    },
    [toggleStatus],
  );

  const columns: ColumnDef<AdminJobRow>[] = [
    {
      key: "title",
      header: "Title",
      align: "center",
      cell: (row) => (
        <span className="font-medium text-text-heading max-w-xs truncate block">{row.title}</span>
      ),
    },
    {
      key: "company",
      header: "Company",
      align: "center",
      cell: (row) => <span className="text-text-body">{row.companyName ?? "—"}</span>,
    },
    {
      key: "recruiter",
      header: "Recruiter",
      align: "center",
      cell: (row) => (
        <span className="text-text-body">{row.recruiterName ?? row.recruiterEmail}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (row) => (
        <Badge variant={row.isActive ? "default" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "applications",
      header: "Apps",
      align: "center",
      cell: (row) => (
        <span className="text-text-body text-center block">{row.applicationCount}</span>
      ),
    },
    {
      key: "views",
      header: "Views",
      align: "center",
      cell: (row) => <span className="text-text-body text-center block">{row.viewCount}</span>,
    },
    {
      key: "workMode",
      header: "Mode",
      align: "center",
      cell: (row) => <span className="text-text-body capitalize">{row.workMode}</span>,
    },
    {
      key: "employmentType",
      header: "Type",
      align: "center",
      cell: (row) => (
        <span className="text-text-body capitalize">{row.employmentType.replace(/_/g, " ")}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      align: "center",
      cell: (row) => (
        <span className="text-text-muted text-xs whitespace-nowrap">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            title={row.isActive ? "Deactivate" : "Activate"}
            onClick={() => handleToggle(row.id, row.isActive)}
            disabled={toggleStatus.isPending}
          >
            {row.isActive ? (
              <ToggleRightIcon className="size-6 text-success" />
            ) : (
              <ToggleLeftIcon className="size-6 text-text-muted" />
            )}
          </Button>
          <ConfirmActionButton
            dialogVariant="destructive"
            title="Delete Job"
            description={`Are you sure you want to delete "${row.title}"? This action cannot be undone and will remove all associated applications.`}
            confirmLabel="Delete"
            action={() => {
              setDeletingId(row.id);
              deleteJob.mutate(row.id, {
                onSuccess: () => setDeletingId(null),
                onError: () => setDeletingId(null),
              });
            }}
            isPending={deletingId === row.id && deleteJob.isPending}
            variant="ghost"
            size="icon-sm"
            tooltip="Delete job"
          >
            <Trash2Icon className="size-5 text-destructive" />
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
          <Skeleton className="h-9 w-full sm:w-36 rounded-md" />
          <Skeleton className="h-9 w-full sm:w-40 rounded-md" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
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
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 rounded-xl bg-bg-elevated border-border-subtle"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue>
              {status === "all" ? "All Status" : status === "active" ? "Active" : "Inactive"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={workMode}
          onValueChange={(v) => {
            setWorkMode(v ?? "all");
            setPage(1);
          }}
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
          onValueChange={(v) => {
            setEmploymentType(v ?? "all");
            setPage(1);
          }}
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
        emptyMessage="No jobs found matching your filters."
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
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeftIcon className="size-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
