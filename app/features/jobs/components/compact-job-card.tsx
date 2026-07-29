import Link from "next/link";
import Image from "next/image";
import { BriefcaseIcon, MapPinIcon } from "lucide-react";
import type { CompactJobRow } from "@/app/features/jobs/queries/public-job-queries";

function formatSalary(currency: string, min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  const c = currency || "USD";
  if (min != null && max != null)
    return `${c}${min.toLocaleString()} - ${c}${max.toLocaleString()}`;
  if (min != null) return `${c}${min.toLocaleString()}+`;
  return `Up to ${c}${max!.toLocaleString()}`;
}

export function CompactJobCard({ job }: { job: CompactJobRow }) {
  const href = job.slug ? `/jobs/${job.slug}` : `/jobs/${job.id}`;
  const salary = formatSalary(job.salaryCurrency, job.salaryMin, job.salaryMax);

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border-subtle bg-bg-surface p-3 transition-colors hover:border-brand/30 hover:bg-brand/5">
      <div className="size-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand shrink-0 text-sm font-bold">
        {job.companyLogo ? (
          <Image
            src={job.companyLogo}
            alt={`${job.companyName} logo`}
            width={40}
            height={40}
            className="size-full rounded-lg object-cover border border-white/10"
          />
        ) : (
          job.companyName.charAt(0).toUpperCase()
        )}
      </div>

      <div className="flex-1 min-w-0">
        <Link
          href={href}
          className="block text-sm font-medium text-text-heading hover:text-brand truncate"
        >
          {job.title}
        </Link>
        <p className="text-xs text-text-muted truncate">{job.companyName}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-text-muted">
          {job.locations.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="size-3 shrink-0" />
              <span className="truncate">{job.locations[0]}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <BriefcaseIcon className="size-3 shrink-0" />
            <span>{job.workMode.replaceAll("_", " ")}</span>
          </span>
          <span>{job.experienceLevel}</span>
          {salary && <span className="text-text-heading font-medium">{salary}</span>}
        </div>
      </div>

      <Link
        href={href}
        className="inline-flex items-center justify-center h-8 px-2.5 text-xs font-medium text-white bg-brand hover:bg-brand/90 rounded-md transition-colors shrink-0"
      >
        Apply
      </Link>
    </div>
  );
}
