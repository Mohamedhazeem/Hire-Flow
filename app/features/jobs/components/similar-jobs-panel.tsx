import { CompactJobCard } from "./compact-job-card";
import type { CompactJobRow } from "@/app/features/jobs/queries/public-job-queries";

export function SimilarJobsPanel({ jobs }: { jobs: CompactJobRow[] }) {
  if (jobs.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-text-heading mb-4">Similar Jobs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {jobs.map((job) => (
          <CompactJobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}
