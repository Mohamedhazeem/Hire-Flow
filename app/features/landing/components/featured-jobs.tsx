import { listPublicJobs } from "@/app/features/jobs/queries/public-job-queries";
import { FeaturedJobsGrid } from "./featured-jobs-grid";
import Link from "next/link";
import { BriefcaseIcon } from "lucide-react";

export async function FeaturedJobs() {
  const result = await listPublicJobs({ pageSize: 6 });

  return (
    <section className="py-12 sm:py-16 text-slate-950 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8 text-center sm:text-left">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold">Featured Jobs</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Recent opportunities from top companies
              </p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              View all jobs &rarr;
            </Link>
          </div>
        </div>

        {result.jobs.length === 0 ? (
          <div className="text-center py-12 rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <BriefcaseIcon className="size-8 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-700 dark:text-slate-300">No featured jobs right now</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              Check back later or browse all listings
            </p>
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
