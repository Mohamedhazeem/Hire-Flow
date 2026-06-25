"use client";

import { useMemo, useState, useCallback } from "react";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
  AlertTriangleIcon,
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
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  const params = useMemo(
    () =>
      ({
        page,
        pageSize: 20,
        sortBy: "createdAt" as const,
        sortOrder: "desc" as const,
        search: search || undefined,
        status: status !== "all" ? (status as "active" | "inactive") : undefined,
        workMode: workMode !== "all" ? workMode : undefined,
        employmentType: employmentType !== "all" ? employmentType : undefined,
      }) as AdminListJobsParams,
    [page, search, status, workMode, employmentType],
  );

  const { data, isLoading, isError } = useAdminJobs(params);
  const deleteJob = useDeleteJob();
  const toggleStatus = useToggleJobStatus();

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

  const handleDelete = useCallback(() => {
    if (deleteJobId) {
      deleteJob.mutate(deleteJobId, {
        onSuccess: () => setDeleteJobId(null),
      });
    }
  }, [deleteJob, deleteJobId]);

  const columns: ColumnDef<AdminJobRow>[] = useMemo(
    () => [
      {
        key: "title",
        header: "Title",
        cell: (row) => (
          <span className="font-medium text-text-heading max-w-xs truncate block">{row.title}</span>
        ),
      },
      {
        key: "company",
        header: "Company",
        cell: (row) => <span className="text-text-body">{row.companyName ?? "—"}</span>,
      },
      {
        key: "recruiter",
        header: "Recruiter",
        cell: (row) => (
          <span className="text-text-body">{row.recruiterName ?? row.recruiterEmail}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => (
          <Badge variant={row.isActive ? "default" : "secondary"}>
            {row.isActive ? "Active" : "Inactive"}
          </Badge>
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
              title={row.isActive ? "Deactivate" : "Activate"}
              onClick={() => handleToggle(row.id, row.isActive)}
              disabled={toggleStatus.isPending}
            >
              {row.isActive ? (
                <ToggleRightIcon className="size-4 text-success" />
              ) : (
                <ToggleLeftIcon className="size-4 text-text-muted" />
              )}
            </Button>
            <Dialog
              open={deleteJobId === row.id}
              onOpenChange={(open) => !open && setDeleteJobId(null)}
            >
              <DialogTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Delete job"
                    onClick={() => setDeleteJobId(row.id)}
                  >
                    <Trash2Icon className="size-4 text-destructive" />
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangleIcon className="size-5 text-destructive" />
                    Delete Job
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete &quot;{row.title}&quot;? This action cannot be
                    undone and will remove all associated applications.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 pt-4">
                  <DialogClose render={<Button variant="outline">Cancel</Button>} />
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteJob.isPending}
                  >
                    {deleteJob.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ),
      },
    ],
    [handleToggle, toggleStatus.isPending, deleteJobId, deleteJob.isPending, handleDelete],
  );

  if (isLoading) {
    return <div className="text-text-muted text-sm py-8 text-center">Loading jobs...</div>;
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
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-35">
            <SelectValue>{status === "all" ? "All Status" : status === "active" ? "Active" : "Inactive"}</SelectValue>
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
          <SelectTrigger className="w-full sm:w-35">
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
          <SelectTrigger className="w-full sm:w-37.5">
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
