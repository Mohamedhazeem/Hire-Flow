import { listPublicJobs } from "@/app/features/jobs/queries/public-job-queries";
import { FeaturedJobsGrid } from "./featured-jobs-grid";
import Link from "next/link";
import { BriefcaseIcon } from "lucide-react";

export async function FeaturedJobs() {
  const result = await listPublicJobs({ pageSize: 6 });

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-heading">Featured Jobs</h2>
            <p className="text-sm text-text-muted mt-1">Recent opportunities from top companies</p>
          </div>
          <Link
            href="/jobs"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
          >
            View all jobs &rarr;
          </Link>
        </div>

        {result.jobs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border-subtle rounded-xl">
            <BriefcaseIcon className="size-8 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">No featured jobs right now</p>
            <p className="text-sm text-text-muted mt-1">Check back later or browse all listings</p>
            <Link
              href="/jobs"
              className="inline-block mt-4 text-sm font-medium text-brand hover:underline"
            >
              Browse all jobs &rarr;
            </Link>
          </div>
        ) : (
          <FeaturedJobsGrid jobs={result.jobs} />
        )}

        <Link
          href="/jobs"
          className="sm:hidden flex items-center justify-center gap-1 mt-6 text-sm font-medium text-brand"
        >
          View all jobs &rarr;
        </Link>
      </div>
    </section>
  );
}
