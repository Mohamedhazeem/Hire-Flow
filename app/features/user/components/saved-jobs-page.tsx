"use client";

import { BookmarkIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { JobCard } from "@/app/features/jobs/components/job-card";
import { Skeleton } from "@/components/ui/skeleton";
import { DisabledJobCard } from "./disabled-job-card";
import { useBookmarkedJobs } from "../hooks/use-saved-jobs";

type SavedJobData = {
  id: string;
  title: string;
  companyName: string;
  companyLogo: string | null;
  locations: string[];
  workMode: string;
  employmentType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  skills: string[];
  experienceLevel: string;
  applicationDeadline: string | null;
  createdAt: string;
  isActive: boolean;
  status: string;
};

export function SavedJobsPage() {
  const { data: bookmarks, isLoading, isError, refetch } = useBookmarkedJobs();

  const jobs: SavedJobData[] =
    bookmarks?.map((b: Record<string, unknown>) => {
      const job = b.job as Record<string, unknown> | undefined;
      const company = (job?.company as Record<string, unknown>) ?? {};
      const dln = job?.applicationDeadline ? new Date(job.applicationDeadline as string).toISOString() : null;
      const createdAt = job?.createdAt ? new Date(job.createdAt as string).toISOString() : new Date().toISOString();
      return {
        id: (job?.id as string) ?? "",
        title: (job?.title as string) ?? "Untitled",
        companyName: (company?.name as string) ?? "",
        companyLogo: (company?.logoUrl as string) ?? null,
        locations: (job?.locations as string[]) ?? [],
        workMode: (job?.workMode as string) ?? "",
        employmentType: (job?.employmentType as string) ?? "",
        salaryMin: (job?.salaryMin as number | null) ?? null,
        salaryMax: (job?.salaryMax as number | null) ?? null,
        salaryCurrency: (job?.salaryCurrency as string) ?? "USD",
        skills: (job?.skills as string[]) ?? [],
        experienceLevel: (job?.experienceLevel as string) ?? "",
        applicationDeadline: dln,
        createdAt,
        isActive: (job?.isActive as boolean) ?? false,
        status: (job?.status as string) ?? "",
      };
    }) ?? [];

  const isUnavailable = (j: SavedJobData) => !j.id || j.isActive !== true || j.status !== "active";

  const availableJobs = jobs.filter((j) => !isUnavailable(j));
  const unavailableJobs = jobs.filter(isUnavailable);

  return (
    <div className="min-w-0">
      <PageHeader
        title="Saved Jobs"
        description="Jobs you've bookmarked for later"
        icon={<BookmarkIcon className="size-5" />}
      />

      <div className="px-4 md:px-6 lg:px-8 pt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <p className="text-text-muted mb-4">Failed to load saved jobs</p>
            <button type="button" onClick={() => refetch()} className="text-sm text-brand hover:underline">
              Try again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <BookmarkIcon className="size-12 mx-auto text-text-muted/40" />
            <h2 className="text-lg font-semibold text-text-heading">No saved jobs yet</h2>
            <p className="text-sm text-text-muted max-w-xs mx-auto">
              Bookmark jobs you&apos;re interested in and they&apos;ll show up here
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 text-sm font-medium text-white bg-brand hover:bg-brand/90 px-4 py-2 rounded-lg transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {availableJobs.length > 0 && (
              <div>
                {unavailableJobs.length > 0 && (
                  <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-3">
                    Available ({availableJobs.length})
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableJobs.map((job) => (
                    <JobCard key={job.id} {...job} />
                  ))}
                </div>
              </div>
            )}

            {unavailableJobs.length > 0 && (
              <div>
                {availableJobs.length > 0 && (
                  <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-3">
                    Unavailable ({unavailableJobs.length})
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unavailableJobs.map((job) => (
                    <DisabledJobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
