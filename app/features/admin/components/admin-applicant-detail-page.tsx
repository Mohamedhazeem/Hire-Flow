"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useCallback } from "react";
import { ArrowLeftIcon, ExternalLinkIcon, BriefcaseIcon } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAdminApplicantDetail } from "@/app/features/admin/hooks/use-applicant-detail";
import type { AdminApplicantDetailResponse } from "@/app/features/admin/queries/applicant-queries";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { ResumePreviewDialog } from "@/components/shared/resume-preview-dialog";
import { ApplicantProfileCard } from "@/components/shared/applicant-profile-card";
import { ApplicantResumeCard } from "@/components/shared/applicant-resume-card";
import { RecentMessagesCard } from "@/components/shared/recent-messages-card";
import { ApplicantDetailSkeleton } from "@/app/features/recruiter/components/applicant-detail-skeleton";
import { downloadResume } from "@/lib/download-resume";

type AdminApplicantDetailPageProps = { applicationId: string };

export function AdminApplicantDetailPage({ applicationId }: AdminApplicantDetailPageProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useAdminApplicantDetail(applicationId);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const showDownloadError = useCallback((msg: string) => {
    setDownloadError(msg);
    setTimeout(() => setDownloadError(null), 5000);
  }, []);
  const handleDownload = useCallback(
    (fileUrl: string) => downloadResume(fileUrl, showDownloadError),
    [showDownloadError],
  );

  if (isLoading) return <ApplicantDetailSkeleton />;

  if (isError || !data?.data) {
    return (
      <div className="text-destructive text-sm py-8 text-center">
        Failed to load applicant details.{" "}
        <button onClick={() => router.back()} className="text-brand underline">
          Go back
        </button>
      </div>
    );
  }

  const detail = data.data as AdminApplicantDetailResponse;

  const { application, applicant, statusTimeline, recentMessages, applicantResume } = detail;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] hover:bg-muted hover:text-foreground size-8 transition-all"
            aria-label="back"
          >
            <ArrowLeftIcon className="size-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-text-heading">{applicant.name}</h1>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-sm text-text-muted mt-0.5">{applicant.email}</p>
          </div>
        </div>
        <Link
          href={`/admin/jobs/${application.job.id}`}
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand transition-colors"
        >
          <BriefcaseIcon className="size-4" />
          {application.job.title}
          <ExternalLinkIcon className="size-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ApplicantProfileCard
            headline={applicant.profile?.headline}
            bio={applicant.profile?.bio}
            location={applicant.profile?.location}
            ctc={applicant.profile?.ctc}
            basePay={applicant.profile?.basePay}
            skills={applicant.profile?.skills}
            experiences={applicant.profile?.experiences}
          />
          <ApplicantResumeCard
            resume={
              applicantResume as {
                id: string;
                label: string;
                fileUrl: string | null;
                source: "application" | "current_profile" | "deleted";
              } | null
            }
            downloadError={downloadError}
            onPreview={() => setPreviewOpen(true)}
            onDownload={handleDownload}
          />
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
            <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4">
              Timeline
            </h2>
            <StatusTimeline entries={statusTimeline} />
          </div>
          <RecentMessagesCard
            messages={
              recentMessages as unknown as {
                id: string;
                content: string;
                fileUrl: string | null;
                createdAt: string;
              }[]
            }
            threadId=""
            messagesBasePath=""
          />
        </div>
      </div>

      <ResumePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        fileUrl={(applicantResume as { fileUrl?: string | null } | null)?.fileUrl ?? null}
        label={(applicantResume as { label?: string } | null)?.label ?? "Resume"}
        onDownload={() => {
          const url = (applicantResume as { fileUrl?: string | null } | null)?.fileUrl;
          if (url) handleDownload(url);
        }}
        downloadError={downloadError}
      />
    </div>
  );
}
