"use client";

import { cn } from "@/lib/utils";
import { FileTextIcon } from "lucide-react";

type Props = {
  builderData: Record<string, unknown> | null;
  resumeSnapshotUrl: string | null;
  className?: string;
};

export function ApplicationResumeSection({ builderData, resumeSnapshotUrl, className }: Props) {
  return (
    <div className={cn("bg-bg-surface border border-border-subtle rounded-xl p-4 sm:p-5", className)}>
      <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4 flex items-center gap-2">
        <FileTextIcon className="size-4" />
        Resume Submitted
      </h2>

      {builderData ? (
        <div className="space-y-2 text-sm text-text-body">
          {builderData.label ? (
            <p><span className="text-text-muted">Label:</span> {String(builderData.label)}</p>
          ) : null}
          {builderData.skills && Array.isArray(builderData.skills) && (builderData.skills as string[]).length > 0 ? (
            <p><span className="text-text-muted">Skills:</span> {(builderData.skills as string[]).join(", ")}</p>
          ) : null}
          {builderData.experiences && Array.isArray(builderData.experiences) ? (
            <p><span className="text-text-muted">Experience:</span> {(builderData.experiences as unknown[]).length} entr{(builderData.experiences as unknown[]).length === 1 ? "y" : "ies"}</p>
          ) : null}
        </div>
      ) : resumeSnapshotUrl ? (
        <a
          href={`/api/files/download?file=${encodeURIComponent(resumeSnapshotUrl)}`}
          className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
        >
          <FileTextIcon className="size-4" /> Download Resume
        </a>
      ) : (
        <p className="text-sm text-text-muted">Resume data not available</p>
      )}
    </div>
  );
}
