"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { PeopleTablePagination } from "@/components/shared/people-table-pagination";
import { useRecruiterJobs, useDeleteJob, useToggleJobStatus } from "@/app/features/recruiter/hooks/use-recruiter-jobs";
import type { JobListParams } from "@/app/features/recruiter/schema/job.schema";
import type { RecruiterJobRow } from "@/app/features/recruiter/queries/job-queries";
import { createRecruiterJobColumns } from "./recruiter-job-columns";
import { SearchIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SkillFilter } from "@/app/features/jobs/components/skill-filter";

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
  const rawSkills = searchParams.get("skills") ?? "";
  const skills = rawSkills ? rawSkills.split(",").filter(Boolean) : [];
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
    skills: skills.length > 0 ? skills : undefined,
  };

  const { data, isLoading, isError } = useRecruiterJobs(params);
  const deleteJob = useDeleteJob();
  const toggleStatus = useToggleJobStatus();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const responseData = data?.data;
  const jobs = responseData?.jobs ?? [];
  const totalPages = responseData?.totalPages ?? 1;
  const total = responseData?.total ?? 0;

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value && value !== "all") sp.set(key, value);
        else sp.delete(key);
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
      deleteJob.mutate({ id: job.id, force }, { onSettled: () => setDeletingId(null) });
    },
    [deleteJob],
  );

  const columns = createRecruiterJobColumns({
    onView: (id) => router.push(`/recruiter/jobs/${id}`),
    onEdit: (id) => router.push(`/recruiter/jobs/${id}/edit`),
    onToggle: handleToggle,
    onDelete: handleDelete,
    isPending: toggleStatus.isPending,
    deletingId,
    isDeleting: deleteJob.isPending,
  });

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
    return <div className="text-destructive text-sm py-8 text-center">Failed to load jobs. Please try again.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 min-w-0">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
          <Input
            placeholder="Search jobs..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParams({ search: searchInput, page: "1" });
            }}
            className="pl-10 rounded-xl bg-bg-elevated border-border-subtle"
          />
        </div>
        <Select value={status} onValueChange={(v) => updateParams({ status: v ?? "all", page: "1" })}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue>
              {status === "all"
                ? "All Status"
                : status === "draft"
                  ? "Draft"
                  : status === "active"
                    ? "Active"
                    : "Archived"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={workMode} onValueChange={(v) => updateParams({ workMode: v ?? "all", page: "1" })}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue>{WORK_MODE_LABELS[workMode] ?? workMode}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(WORK_MODE_LABELS).map(([k, l]) => (
              <SelectItem key={k} value={k}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={employmentType} onValueChange={(v) => updateParams({ employmentType: v ?? "all", page: "1" })}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue>{EMPLOYMENT_TYPE_LABELS[employmentType] ?? employmentType}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([k, l]) => (
              <SelectItem key={k} value={k}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <SkillFilter
          value={skills}
          onChange={(next) =>
            updateParams({
              skills: next.join(","),
            })
          }
        />
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

      <PeopleTablePagination
        page={responseData?.page ?? 1}
        totalPages={totalPages}
        totalUsers={total}
        pageSize={20}
        onPageChange={(p) => updateParams({ page: String(p) })}
      />
    </div>
  );
}
