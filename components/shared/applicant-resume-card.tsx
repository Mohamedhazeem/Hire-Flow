"use client";

import { AlertCircleIcon, FileTextIcon, EyeIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type ResumeInfo = {
  id?: string;
  label?: string;
  fileUrl?: string | null;
  source: string;
} | null;

type ApplicantResumeCardProps = {
  resume: ResumeInfo;
  downloadError: string | null;
  onPreview: () => void;
  onDownload: (fileUrl: string) => void;
  onDismissError?: () => void;
};

function renderResumeSourceBadge(source: string | undefined) {
  if (source === "application") {
    return (
      <span className="inline-flex items-center rounded-full bg-brand/10 text-brand border border-brand/20 px-2 py-0.5 text-[10px] font-medium leading-none">
        Resume Used for This Application
      </span>
    );
  }
  if (source === "current_profile") {
    return (
      <span className="inline-flex items-center rounded-full bg-bg-elevated text-text-muted border border-border-subtle px-2 py-0.5 text-[10px] font-medium leading-none">
        Current Resume
      </span>
    );
  }
  return null;
}

function isPreviewableType(fileUrl: string | null | undefined): boolean {
  if (!fileUrl) return false;
  const ext = fileUrl.split(".").pop()?.toLowerCase() ?? "";
  return ext === "pdf" || ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
}

export function ApplicantResumeCard({ resume, downloadError, onPreview, onDownload }: ApplicantResumeCardProps) {
  const isPreviewable = isPreviewableType(resume?.fileUrl);

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
      <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4">Resume</h2>

      {resume?.source === "deleted" ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <AlertCircleIcon className="size-8 text-text-muted" />
          <p className="text-sm text-text-muted">Resume was removed by the applicant.</p>
        </div>
      ) : resume ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated border border-border-subtle">
            <FileTextIcon className="size-5 text-brand shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-text-heading truncate">{resume.label}</p>
                {renderResumeSourceBadge(resume.source)}
              </div>
            </div>
          </div>

          {downloadError && (
            <div className="flex items-center gap-2 text-xs text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
              <AlertCircleIcon className="size-3.5 shrink-0" />
              {downloadError}
            </div>
          )}

          <div className="flex items-center gap-2">
            {resume.fileUrl ? (
              <>
                {isPreviewable ? (
                  <Button variant="default" size="sm" onClick={onPreview}>
                    <EyeIcon className="size-4 mr-1.5" />
                    Preview
                  </Button>
                ) : (
                  <Button variant="default" size="sm" onClick={() => resume.fileUrl && onDownload(resume.fileUrl)}>
                    <DownloadIcon className="size-4 mr-1.5" />
                    Download
                  </Button>
                )}
                {isPreviewable && resume.fileUrl && (
                  <Button variant="outline" size="sm" onClick={() => onDownload(resume.fileUrl!)}>
                    <DownloadIcon className="size-4 mr-1.5" />
                    Download
                  </Button>
                )}
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-text-muted bg-bg-elevated border border-border-subtle rounded-lg px-2.5 py-1">
                <AlertCircleIcon className="size-3" />
                File not available
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <FileTextIcon className="size-8 text-text-muted" />
          <p className="text-sm text-text-muted">No resume attached to this application.</p>
        </div>
      )}
    </div>
  );
}
