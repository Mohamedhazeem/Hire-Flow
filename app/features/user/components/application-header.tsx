"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import { MapPinIcon, BriefcaseIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Props = {
  jobTitle: string;
  companyName: string;
  companyLogo: string | null;
  locations: string[];
  workMode: string;
  salaryText: string | null;
  status: string;
  jobActive: boolean;
};

export function ApplicationHeader({ jobTitle, companyName, companyLogo, locations, workMode, salaryText, status, jobActive }: Props) {
  return (
    <>
      <Link
        href="/user/applications"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-body mb-6 transition-colors"
      >
        &larr; Back to applications
      </Link>
      {!jobActive && (
        <div className="flex items-center gap-2 text-sm text-text-muted bg-bg-muted border border-border-subtle rounded-lg px-4 py-3 mb-6">
          <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          This job is no longer active
        </div>
      )}

      <div className="flex items-start gap-4 mb-6">
        <div className="size-12 sm:size-14 lg:size-16 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0 text-xl sm:text-2xl lg:text-3xl font-bold">
          {companyLogo ? (
            <Image src={companyLogo} alt="" className="size-8 sm:size-10 lg:size-12 object-contain" />
          ) : (
            (companyName[0]?.toUpperCase() ?? "?")
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-heading">{jobTitle}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-text-muted">{companyName}</span>
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {(locations.length > 0 || workMode || salaryText) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {locations[0] && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted bg-bg-muted px-2.5 py-1.5 rounded-lg">
              <MapPinIcon className="size-3.5" />
              {locations.join(", ")}
            </span>
          )}
          {workMode && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted bg-bg-muted px-2.5 py-1.5 rounded-lg">
              <BriefcaseIcon className="size-3.5" />
              {workMode.replace("_", " ")}
            </span>
          )}
          {salaryText && (
            <span className="text-xs font-medium bg-bg-muted px-2.5 py-1.5 rounded-lg text-text-muted">
              {salaryText}
            </span>
          )}
        </div>
      )}
    </>
  );
}
