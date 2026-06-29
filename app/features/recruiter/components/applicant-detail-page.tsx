"use client";

import { useSession } from "@/app/features/auth/libs/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useCallback } from "react";
import { ArrowLeftIcon, ExternalLinkIcon, BriefcaseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useApplicantDetail, useTransitionStatusWithRefresh } from "@/app/features/recruiter/hooks/use-applicant-detail";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { ResumePreviewDialog } from "@/components/shared/resume-preview-dialog";
import { ApplicantProfileCard } from "@/components/shared/applicant-profile-card";
import { ApplicantResumeCard } from "@/components/shared/applicant-resume-card";
import { RecentMessagesCard } from "@/components/shared/recent-messages-card";
import { ApplicantDetailSkeleton } from "@/app/features/recruiter/components/applicant-detail-skeleton";
import { ApplicantDetailDialogs } from "@/app/features/recruiter/components/applicant-detail-dialogs";
import { NEXT_ACTIONS } from "@/app/features/recruiter/components/applicant-table-constants";
import type { ApplicantRow } from "@/app/features/recruiter/queries/application-queries";

type ApplicantDetailPageProps = { applicationId: string };

async function downloadFile(fileUrl: string, onError: (msg: string) => void) {
  try {
    const res = await fetch(`/api/files/download?path=${encodeURIComponent(fileUrl)}`);
    if (!res.ok) { onError("File unavailable — removed by applicant"); return; }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct || ct.startsWith("text/html")) { onError("Server returned an unexpected response"); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = fileUrl.split("/").pop() ?? "resume"; a.click();
    URL.revokeObjectURL(url);
  } catch { onError("Download failed. Please try again."); }
}

export function ApplicantDetailPage({ applicationId }: ApplicantDetailPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const recruiterId = (session?.user as { id?: string })?.id ?? "";
  const { data, isLoading, isError } = useApplicantDetail(applicationId);
  const transitionStatus = useTransitionStatusWithRefresh(applicationId);
  const [dialog, setDialog] = useState<{ type: string; applicant: ApplicantRow | null }>({ type: "", applicant: null });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const showDownloadError = useCallback((msg: string) => { setDownloadError(msg); setTimeout(() => setDownloadError(null), 5000); }, []);
  const handleDownload = useCallback((fileUrl: string) => downloadFile(fileUrl, showDownloadError), [showDownloadError]);

  if (isLoading) return <ApplicantDetailSkeleton />;

  if (isError || !data?.data) {
    return (
      <div className="text-destructive text-sm py-8 text-center">
        Failed to load applicant details.{" "}
        <button onClick={() => router.back()} className="text-brand underline">Go back</button>
      </div>
    );
  }

  const detail = data.data;
  const { application, applicant, statusTimeline, recentMessages, applicantResume } = detail;
  const profile = applicant.profile;
  const threadId = [recruiterId, application.userId].sort().join("_");
  const actions = NEXT_ACTIONS[application.status] ?? [];

  const messagesForCard = recentMessages.map((m) => ({
    ...m,
    createdAt: typeof m.createdAt === "string" ? m.createdAt : new Date(m.createdAt).toISOString(),
  }));

  const resumeFileUrl = applicantResume && "fileUrl" in applicantResume ? (applicantResume as { fileUrl?: string | null }).fileUrl ?? null : null;
  const resumeLabel = applicantResume && "label" in applicantResume ? (applicantResume as { label?: string }).label ?? "Resume" : "Resume";

  const applicantRowForDialog: ApplicantRow = {
    id: application.id, userId: applicant.id, name: applicant.name,
    email: applicant.email, status: application.status,
    appliedAt: application.appliedAt, updatedAt: application.updatedAt,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] hover:bg-muted hover:text-foreground size-8 transition-all" aria-label="back">
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
        <Link href={`/recruiter/jobs/${application.job.id}`} className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand transition-colors">
          <BriefcaseIcon className="size-4" />{application.job.title}<ExternalLinkIcon className="size-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ApplicantProfileCard headline={profile?.headline} bio={profile?.bio} location={profile?.location} ctc={profile?.ctc} basePay={profile?.basePay} skills={profile?.skills} experiences={profile?.experiences} />
          <ApplicantResumeCard resume={applicantResume} downloadError={downloadError} onPreview={() => setPreviewOpen(true)} onDownload={handleDownload} />
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
            <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4">Timeline</h2>
            <StatusTimeline entries={statusTimeline} />
          </div>
          <RecentMessagesCard messages={messagesForCard} threadId={threadId} messagesBasePath="/recruiter/messages" hasStartButton onStartConversation={() => router.push(`/recruiter/messages?thread=${threadId}`)} />
        </div>
      </div>

      {actions.length > 0 && (
        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
          <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {actions.map((action) => (
              <Button key={action.status} variant={action.status === "rejected" ? "destructive" : "default"} disabled={transitionStatus.isPending} onClick={() => setDialog({ type: action.status, applicant: applicantRowForDialog })}>
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <ApplicantDetailDialogs dialog={dialog} onDialogClose={() => setDialog({ type: "", applicant: null })} />

      <ResumePreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} fileUrl={resumeFileUrl} label={resumeLabel} onDownload={resumeFileUrl ? () => handleDownload(resumeFileUrl) : undefined} downloadError={downloadError} />
    </div>
  );
}
