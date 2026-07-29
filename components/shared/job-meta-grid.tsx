import { InfoRow } from "@/components/shared/info-row";
import { TagChip } from "@/components/shared/tag-chip";
import type { ReactNode } from "react";
import {
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  GlobeIcon,
  WrenchIcon,
  TagIcon,
  UsersIcon,
  DollarSignIcon,
  CalendarIcon,
  EyeIcon,
} from "lucide-react";

type JobMeta = {
  locations: string[];
  workMode: string;
  employmentType: string;
  timezone: string | null;
  skills: string[];
  tags: string[];
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  applicationDeadline: string | Date | null;
  viewCount: number;
};

export function salaryDisplay(
  salaryMin: number | null,
  salaryMax: number | null,
  salaryCurrency: string | null,
): string | null {
  if (salaryMin == null && salaryMax == null) return null;
  const cur = salaryCurrency ?? "USD";
  const parts: string[] = [];
  if (salaryMin != null) parts.push(`$${salaryMin.toLocaleString()}`);
  if (salaryMax != null) parts.push(`$${salaryMax.toLocaleString()}`);
  return `${parts.join(" – ")} ${cur}`;
}

export function chipList(items: string[], variant: "default" | "brand" | "muted" = "default"): ReactNode {
  if (items.length === 0) return "—";
  return (
    <div className="flex flex-wrap gap-1.5 mt-0.5">
      {items.map((item, i) => (
        <TagChip key={i} variant={variant}>
          {item}
        </TagChip>
      ))}
    </div>
  );
}

type JobMetaGridProps = { job: JobMeta };

export function JobMetaGrid({ job }: JobMetaGridProps) {
  const salary = salaryDisplay(job.salaryMin, job.salaryMax, job.salaryCurrency);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InfoRow icon={<MapPinIcon className="size-5" />} label="Locations" value={chipList(job.locations)} />
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
      <InfoRow icon={<GlobeIcon className="size-5" />} label="Timezone" value={job.timezone ?? "—"} />
      <InfoRow icon={<WrenchIcon className="size-5" />} label="Skills" value={chipList(job.skills, "brand")} />
      <InfoRow icon={<TagIcon className="size-5" />} label="Tags" value={chipList(job.tags, "muted")} />
      <InfoRow icon={<UsersIcon className="size-5" />} label="Experience Level" value={job.experienceLevel} />
      <InfoRow icon={<DollarSignIcon className="size-5" />} label="Salary" value={salary ?? "Not specified"} />
      <InfoRow
        icon={<CalendarIcon className="size-5" />}
        label="Application Deadline"
        value={job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : "No deadline"}
      />
      <InfoRow icon={<EyeIcon className="size-5" />} label="Views" value={job.viewCount} />
    </div>
  );
}
