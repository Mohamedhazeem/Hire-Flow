import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { CompactJobCard } from "./compact-job-card";
import type { CompactJobRow } from "@/app/features/jobs/queries/public-job-queries";

export function CompanyJobsPanel({
  companyName,
  companyId,
  jobs,
}: {
  companyName: string;
  companyId: string;
  jobs: CompactJobRow[];
}) {
  if (jobs.length === 0) return null;

  return (
    <aside className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-heading uppercase tracking-wider">
          More from {companyName}
        </h3>
      </div>

      <div className="space-y-2">
        {jobs.map((job) => (
          <CompactJobCard key={job.id} job={job} />
        ))}
      </div>

      <Link
        href={`/jobs?companyId=${companyId}`}
        className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-brand transition-colors"
      >
        View all jobs
        <ArrowRightIcon className="size-3" />
      </Link>
    </aside>
  );
}
