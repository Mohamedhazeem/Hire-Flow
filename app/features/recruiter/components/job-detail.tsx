"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecruiterJobDetail } from "@/app/features/recruiter/queries/job-queries";
import type { ApiResponse } from "@/lib/api-response";
import { ArrowLeftIcon, PencilIcon, UsersIcon, BarChart3Icon } from "lucide-react";
import Link from "next/link";
import { JobDetailTabs } from "@/components/shared/job-detail-tabs";
import { JobMetaGrid } from "@/components/shared/job-meta-grid";
import { SectionCard } from "@/components/shared/section-card";

const STATUS_BADGE: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
  draft: { variant: "secondary", label: "Draft" },
  active: { variant: "default", label: "Active" },
  archived: { variant: "outline", label: "Archived" },
};

const TABS = [
  { href: "", label: "View Details", icon: ArrowLeftIcon },
  { href: "/applicants", label: "Applicants", icon: UsersIcon },
  { href: "/analytics", label: "Analytics", icon: BarChart3Icon },
];

type JobDetailProps = { jobId: string };

export function JobDetail({ jobId }: JobDetailProps) {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery<ApiResponse<{ job: RecruiterJobDetail }>>({
    queryKey: ["recruiter", "job", jobId],
    queryFn: () => apiClient(`/api/recruiter/jobs/${jobId}`),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-4 w-96 rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (isError || !data?.data?.job) {
    return (
      <div className="text-destructive text-sm py-8 text-center">
        Failed to load job details.{" "}
        <button onClick={() => router.push("/recruiter/jobs")} className="text-brand underline">Back to jobs</button>
      </div>
    );
  }

  const job = data.data.job;
  const statusConfig = STATUS_BADGE[job.status] ?? { variant: "secondary" as const, label: job.status };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/recruiter/jobs" className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] hover:bg-muted hover:text-foreground size-8 transition-all">
            <ArrowLeftIcon className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text-heading">{job.title}</h1>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </div>
          </div>
        </div>
        {job.status !== "archived" && (
          <Link href={`/recruiter/jobs/${job.id}/edit`} className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] border border-border bg-background shadow-xs hover:bg-muted hover:text-foreground h-8 gap-1 px-2.5 text-sm font-medium whitespace-nowrap transition-all">
            <PencilIcon className="size-4" /> Edit
          </Link>
        )}
      </div>

      <JobDetailTabs tabs={TABS} baseHref={`/recruiter/jobs/${jobId}`} />

      <JobMetaGrid job={job} />

      <SectionCard title="Description">
        <p className="text-sm text-text-body whitespace-pre-wrap leading-relaxed">{job.description}</p>
      </SectionCard>

      <SectionCard title="Applicants" count={job.applicationCount} countLabel="applicants">
        {job.applicationCount > 0 ? (
          <p className="text-sm text-text-muted">
            {job.applicationCount} applicant{job.applicationCount !== 1 ? "s" : ""} have applied to this position.
          </p>
        ) : (
          <p className="text-sm text-text-muted">No applicants yet for this position.</p>
        )}
        <Link href={`/recruiter/jobs/${job.id}/applicants`} className="inline-flex items-center gap-1 text-xs text-brand hover:underline mt-2">
          <UsersIcon className="size-3.5" /> View All
        </Link>
      </SectionCard>

      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
        <span>Updated: {new Date(job.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
