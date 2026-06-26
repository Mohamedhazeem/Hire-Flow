"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecruiterJobDetail } from "@/app/features/recruiter/queries/job-queries";
import type { ApiResponse } from "@/lib/api-response";
import {
  ArrowLeftIcon,
  PencilIcon,
  MapPinIcon,
  ClockIcon,
  BriefcaseIcon,
  GlobeIcon,
  DollarSignIcon,
  CalendarIcon,
  EyeIcon,
  WrenchIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";

const STATUS_BADGE: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
  draft: { variant: "secondary", label: "Draft" },
  active: { variant: "default", label: "Active" },
  archived: { variant: "outline", label: "Archived" },
};

type JobDetailProps = {
  jobId: string;
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-5 shrink-0 text-text-muted mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{label}</p>
        <div className="text-sm text-text-body mt-0.5">{value}</div>
      </div>
    </div>
  );
}

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
        <button onClick={() => router.push("/recruiter/jobs")} className="text-brand underline">
          Back to jobs
        </button>
      </div>
    );
  }

  const job = data.data.job;
  const statusConfig = STATUS_BADGE[job.status] ?? { variant: "secondary" as const, label: job.status };

  const salaryDisplay =
    job.salaryMin != null || job.salaryMax != null
      ? `${job.salaryMin != null ? `$${job.salaryMin.toLocaleString()}` : ""}${job.salaryMin != null && job.salaryMax != null ? " – " : ""}${job.salaryMax != null ? `$${job.salaryMax.toLocaleString()}` : ""} ${job.salaryCurrency}`
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/recruiter/jobs"
            className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] hover:bg-muted hover:text-foreground size-8 transition-all"
          >
            <ArrowLeftIcon className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text-heading">{job.title}</h1>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {job.status !== "archived" && (
            <Link
              href={`/recruiter/jobs/${job.id}/edit`}
              className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] border border-border bg-background shadow-xs hover:bg-muted hover:text-foreground h-8 gap-1 px-2.5 text-sm font-medium whitespace-nowrap transition-all"
            >
              <PencilIcon className="size-4" />
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoRow
          icon={<MapPinIcon className="size-5" />}
          label="Locations"
          value={
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {job.locations.map((loc, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-radius-full border border-border-subtle bg-bg-elevated px-2.5 py-0.5 text-xs font-medium text-text-body"
                >
                  {loc}
                </span>
              ))}
            </div>
          }
        />
        <InfoRow
          icon={<BriefcaseIcon className="size-5" />}
          label="Work Mode"
          value={<span className="capitalize">{job.workMode}</span>}
        />
        <InfoRow
          icon={<ClockIcon className="size-5" />}
          label="Employment Type"
          value={<span className="capitalize">{job.employmentType.replace(/_/g, " ")}</span>}
        />
        <InfoRow
          icon={<GlobeIcon className="size-5" />}
          label="Timezone"
          value={job.timezone ?? "—"}
        />
        <InfoRow
          icon={<WrenchIcon className="size-5" />}
          label="Skills"
          value={
            job.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {job.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-radius-full bg-brand/10 text-brand border border-brand/20 px-2.5 py-0.5 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              "—"
            )
          }
        />
        <InfoRow
          icon={<TagIcon className="size-5" />}
          label="Tags"
          value={
            job.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {job.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-radius-full bg-bg-elevated border border-border-subtle px-2.5 py-0.5 text-xs font-medium text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              "—"
            )
          }
        />
        <InfoRow
          icon={<UsersIcon className="size-5" />}
          label="Experience Level"
          value={job.experienceLevel}
        />
        <InfoRow
          icon={<DollarSignIcon className="size-5" />}
          label="Salary"
          value={salaryDisplay ?? "Not specified"}
        />
        <InfoRow
          icon={<CalendarIcon className="size-5" />}
          label="Application Deadline"
          value={job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : "No deadline"}
        />
        <InfoRow
          icon={<EyeIcon className="size-5" />}
          label="Views"
          value={job.viewCount}
        />
      </div>

      <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
        <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-3">Description</h2>
        <p className="text-sm text-text-body whitespace-pre-wrap leading-relaxed">{job.description}</p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider">
            Applicants ({job.applicationCount})
          </h2>
          <Link
            href={`/recruiter/jobs/${job.id}/applicants`}
            className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
          >
            <UsersIcon className="size-3.5" />
            View All
          </Link>
        </div>
        {job.applicationCount > 0 ? (
          <p className="text-sm text-text-muted">
            {job.applicationCount} applicant{job.applicationCount !== 1 ? "s" : ""}{" "}
            have applied to this position.
          </p>
        ) : (
          <p className="text-sm text-text-muted">No applicants yet for this position.</p>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
        <span>Updated: {new Date(job.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
