"use client";

import { AlertCircleIcon } from "lucide-react";
import Image from "next/image";
import { SaveJobButton } from "./save-job-button";

type DisabledJobCardProps = {
  job: {
    id: string;
    title: string;
    companyName: string;
    companyLogo: string | null;
  };
};

export function DisabledJobCard({ job }: DisabledJobCardProps) {
  return (
    <div className="w-full rounded-xl border border-border-subtle bg-bg-surface p-5 opacity-50 cursor-default select-none">
      <div className="flex items-start gap-4 min-w-0">
        <div className="size-11 rounded-lg bg-bg-muted flex items-center justify-center text-text-muted shrink-0 text-lg font-bold">
          {job.companyLogo ? (
            <Image
              src={job.companyLogo}
              alt=""
              width={28}
              height={28}
              className="size-7 object-contain grayscale"
            />
          ) : (
            job.companyName[0]?.toUpperCase() ?? "?"
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-text-muted truncate">
            {job.title}
          </h3>
          <p className="text-sm text-text-muted/60 mt-0.5">
            {job.companyName}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted bg-bg-muted px-2 py-1 rounded-full">
            <AlertCircleIcon className="size-3" />
            No longer available
          </span>
          <SaveJobButton jobId={job.id} />
        </div>
      </div>
    </div>
  );
}
