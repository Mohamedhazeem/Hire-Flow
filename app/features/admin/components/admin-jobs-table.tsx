"use client";

import { useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { PeopleTablePagination } from "@/components/shared/people-table-pagination";
import { JobTableToolbar } from "./job-table-toolbar";
import { createJobTableColumns } from "./job-table-columns";
import { useAdminJobs, useDeleteJob, useToggleJobStatus } from "@/app/features/admin/hooks/use-admin-jobs";
import type { AdminListJobsParams } from "@/app/features/admin/schema/admin.schema";

type AdminJobsTableProps = {
  statusFilter?: "active" | "inactive" | "all";
};

export function AdminJobsTable({ statusFilter = "all" }: AdminJobsTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(statusFilter);
  const [workMode, setWorkMode] = useState<string>("all");
  const [employmentType, setEmploymentType] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const resetPage = useCallback(() => setPage(1), []);

  const filterChange = useCallback(
    (setter: (v: string) => void) => (value: string | null) => {
      setter(value ?? "all");
      resetPage();
    },
    [resetPage],
  );

  const handleToggle = useCallback(
    (jobId: string, currentActive: boolean) => toggleStatus.mutate({ jobId, isActive: !currentActive }),
    [toggleStatus],
  );

  const handleDelete = useCallback(
    (jobId: string) => {
      setDeletingId(jobId);
      deleteJob.mutate(jobId, { onSettled: () => setDeletingId(null) });
    },
    [deleteJob],
  );

  const columns = createJobTableColumns({
    onToggle: handleToggle,
    onDelete: handleDelete,
    isToggling: toggleStatus.isPending,
    deletingId,
    isDeleting: deleteJob.isPending,
  });

  const responseData = data?.data;
  const jobs = responseData?.jobs ?? [];
  const totalPages = responseData?.totalPages ?? 1;
  const total = responseData?.total ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-destructive text-sm py-8 text-center">Failed to load jobs. Please try again.</div>;
  }

  return (
    <div className="space-y-4">
      <JobTableToolbar
        search={search}
        onSearchChange={filterChange(setSearch)}
        status={status}
        onStatusChange={filterChange(setStatus)}
        workMode={workMode}
        onWorkModeChange={filterChange(setWorkMode)}
        employmentType={employmentType}
        onEmploymentTypeChange={filterChange(setEmploymentType)}
      />

      <DataTable columns={columns} data={jobs} emptyMessage="No jobs found matching your filters." />

      <PeopleTablePagination
        page={responseData?.page ?? 1}
        totalPages={totalPages}
        totalUsers={total}
        pageSize={20}
        onPageChange={setPage}
      />
    </div>
  );
}
