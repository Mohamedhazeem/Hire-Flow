"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  TimerOffIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SaveJobButton } from "@/app/features/user/components/save-job-button";

export type JobCardProps = {
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
};

export function JobCard({
  id,
  title,
  companyName,
  companyLogo,
  locations,
  workMode,
  employmentType,
  salaryMin,
  salaryMax,
  salaryCurrency,
  skills,
  experienceLevel,
  applicationDeadline,
  createdAt,
}: JobCardProps) {
  const router = useRouter();

  const salaryText =
    salaryMin != null || salaryMax != null
      ? `${salaryCurrency}${salaryMin?.toLocaleString() ?? ""} - ${salaryCurrency}${salaryMax?.toLocaleString() ?? ""}`
      : null;

  const [now] = useState(() =>
    typeof window !== "undefined" ? Date.now() : 0,
  );

  const daysAgo = now
    ? Math.floor((now - new Date(createdAt).getTime()) / 86400000)
    : 0;
  const isExpired =
    now != null &&
    applicationDeadline != null &&
    new Date(applicationDeadline).getTime() < now;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/jobs/${id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/jobs/${id}`);
        }
      }}
      className="w-full text-left rounded-xl border border-border-subtle bg-bg-surface p-5 hover:border-brand/30 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4 min-w-0">
        <div className="size-11 rounded-lg bg-brand/10 flex items-center justify-center text-brand shrink-0 text-lg font-bold">
          {companyLogo ? (
            <Image
              src={companyLogo}
              alt=""
              width={28}
              height={28}
              className="size-7 object-contain"
            />
          ) : (
            (companyName[0]?.toUpperCase() ?? "?")
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-text-heading truncate">{title}</h3>
          <p className="text-sm text-text-muted mt-0.5">{companyName}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isExpired ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted bg-bg-muted px-2 py-1 rounded-full shrink-0">
              <TimerOffIcon className="size-3" />
              Expired
            </span>
          ) : null}
          <SaveJobButton jobId={id} />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {locations[0] && (
          <span className="inline-flex items-center gap-1 text-xs text-text-muted bg-bg-muted px-2 py-1 rounded-md">
            <MapPinIcon className="size-3" />
            {locations[0]}
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-xs text-text-muted bg-bg-muted px-2 py-1 rounded-md">
          <BriefcaseIcon className="size-3" />
          {workMode.replace("_", " ")}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-text-muted bg-bg-muted px-2 py-1 rounded-md">
          <ClockIcon className="size-3" />
          {daysAgo === 0
            ? "Today"
            : daysAgo === 1
              ? "1d ago"
              : `${daysAgo}d ago`}
        </span>
      </div>

      {salaryText && (
        <p className="text-sm font-medium text-text-body mt-2">{salaryText}</p>
      )}

      <div className="flex items-center gap-1.5 mt-2">
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            "bg-bg-muted text-text-muted border border-border-subtle",
          )}
        >
          {experienceLevel}
        </span>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            "bg-bg-muted text-text-muted border border-border-subtle",
          )}
        >
          {employmentType.replace("_", " ")}
        </span>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 overflow-hidden max-h-6">
          {skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="text-[11px] text-text-muted bg-bg-muted px-1.5 py-0.5 rounded"
            >
              {s}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="text-[11px] text-text-muted">
              +{skills.length - 4}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
