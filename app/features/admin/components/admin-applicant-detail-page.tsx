"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useCallback } from "react";
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  DownloadIcon,
  FileTextIcon,
  MapPinIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  EyeIcon,
  AlertCircleIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAdminApplicantDetail } from "@/app/features/admin/hooks/use-applicant-detail";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { ResumePreviewDialog } from "@/components/shared/resume-preview-dialog";

type AdminApplicantDetailPageProps = {
  applicationId: string;
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-5 shrink-0 text-text-muted mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{label}</p>
        <div className="text-sm text-text-body mt-0.5">{value}</div>
      </div>
    </div>
  );
}

export function AdminApplicantDetailPage({ applicationId }: AdminApplicantDetailPageProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useAdminApplicantDetail(applicationId);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = useCallback(async (fileUrl: string) => {
    try {
      const res = await fetch(`/api/files/download?path=${encodeURIComponent(fileUrl)}`);
      if (!res.ok) {
        setDownloadError("File unavailable — removed by applicant");
        setTimeout(() => setDownloadError(null), 5000);
        return;
      }
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType || contentType.startsWith("text/html")) {
        setDownloadError("Server returned an unexpected response");
        setTimeout(() => setDownloadError(null), 5000);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileUrl.split("/").pop() ?? "resume";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Download failed. Please try again.");
      setTimeout(() => setDownloadError(null), 5000);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-md" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-48 rounded-md" />
            <Skeleton className="h-4 w-72 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-5 w-28 rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

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

  const detail = data.data as {
    application: {
      id: string;
      jobId: string;
      userId: string;
      status: string;
      rejectionReason: string | null;
      recruiterNote: string | null;
      interviewDate: string | null;
      meetingLink: string | null;
      offerDetails: string | null;
      appliedAt: string;
      updatedAt: string;
      job: { id: string; title: string };
      resumeId: string | null;
    };
    applicant: {
      id: string;
      name: string;
      email: string;
      role: string;
      profile: {
        headline: string | null;
        bio: string | null;
        skills: string[];
        experiences: unknown;
        location: string | null;
        basePay: number | null;
        ctc: number | null;
        socialLinks: unknown;
      } | null;
    };
    applicantResume: {
      id: string;
      label: string;
      fileUrl: string | null;
      isPrimary: boolean;
      createdAt: string;
      source: "application" | "current_profile" | "deleted";
    } | null;
    statusTimeline: {
      id: string;
      type: "application_submitted" | "status_change";
      fromStatus: string | null;
      toStatus: string | null;
      label: string;
      changedByName: string | null;
      note: string | null;
      createdAt: string;
      isUpcoming: boolean;
    }[];
    recentMessages: {
      id: string;
      content: string;
      fileUrl: string | null;
      fileName: string | null;
      senderId: string;
      createdAt: string;
    }[];
  };

  const { application, applicant, statusTimeline, recentMessages, applicantResume } = detail;
  const profile = applicant.profile;
  const experiencesArray =
    profile?.experiences != null && Array.isArray(profile.experiences)
      ? (profile.experiences as unknown[])
      : null;

  const ext = applicantResume?.fileUrl?.split(".").pop()?.toLowerCase() ?? "";
  const isPreviewable = ext === "pdf" || ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);

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
          <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
            <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4">
              Profile
            </h2>
            <div className="space-y-4">
              {profile?.headline && (
                <p className="text-sm text-text-body font-medium">{profile.headline}</p>
              )}
              {profile?.bio && (
                <p className="text-sm text-text-muted leading-relaxed">{profile.bio}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow
                  icon={<MapPinIcon className="size-5" />}
                  label="Location"
                  value={profile?.location ?? "Not specified"}
                />
                <InfoRow
                  icon={<GraduationCapIcon className="size-5" />}
                  label="Expected CTC"
                  value={
                    profile?.ctc != null
                      ? `$${profile.ctc.toLocaleString()}`
                      : profile?.basePay != null
                        ? `$${profile.basePay.toLocaleString()}/yr`
                        : "Not specified"
                  }
                />
              </div>
              {profile?.skills && profile.skills.length > 0 && (
                <div>
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-radius-full bg-brand/10 text-brand border border-brand/20 px-2.5 py-0.5 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {experiencesArray && experiencesArray.length > 0 && (
                <div>
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2">
                    Experience
                  </p>
                  <div className="space-y-2">
                    {experiencesArray.map((item, i) => {
                      const exp = item as {
                        title?: string;
                        company?: string;
                        startDate?: string;
                        endDate?: string;
                      };
                      return (
                        <div
                          key={i}
                          className="text-sm text-text-body border-l-2 border-border-subtle pl-3"
                        >
                          {exp.title && <p className="font-medium">{exp.title}</p>}
                          {exp.company && <p className="text-text-muted text-xs">{exp.company}</p>}
                          {exp.startDate && (
                            <p className="text-text-muted text-xs">
                              {exp.startDate} – {exp.endDate ?? "Present"}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
            <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4">
              Resume
            </h2>

            {applicantResume?.source === "deleted" ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <AlertCircleIcon className="size-8 text-text-muted" />
                <p className="text-sm text-text-muted">
                  Resume was removed by the applicant.
                </p>
              </div>
            ) : applicantResume ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated border border-border-subtle">
                  <FileTextIcon className="size-5 text-brand shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-text-heading truncate">
                        {applicantResume.label}
                      </p>
                      {renderResumeSourceBadge(applicantResume.source)}
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
                  {applicantResume.fileUrl ? (
                    <>
                      {isPreviewable ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setPreviewOpen(true)}
                        >
                          <EyeIcon className="size-4 mr-1.5" />
                          Preview
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => applicantResume.fileUrl && handleDownload(applicantResume.fileUrl)}
                        >
                          <DownloadIcon className="size-4 mr-1.5" />
                          Download
                        </Button>
                      )}
                      {isPreviewable && applicantResume.fileUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(applicantResume.fileUrl!)}
                        >
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
                <p className="text-sm text-text-muted">
                  No resume attached to this application.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
            <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4">
              Timeline
            </h2>
            <StatusTimeline entries={statusTimeline} />
          </div>

          <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider">
                Recent Messages
              </h2>
            </div>
            {recentMessages.length > 0 ? (
              <div className="space-y-2">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 rounded-xl bg-bg-elevated border border-border-subtle"
                  >
                    <p className="text-sm text-text-body line-clamp-2">
                      {msg.content || (msg.fileUrl ? "File attachment" : "")}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {new Date(msg.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-4">
                No messages for this application.
              </p>
            )}
          </div>
        </div>
      </div>

      <ResumePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        fileUrl={applicantResume?.fileUrl ?? null}
        label={applicantResume?.label ?? "Resume"}
        onDownload={applicantResume?.fileUrl ? () => handleDownload(applicantResume.fileUrl!) : undefined}
        downloadError={downloadError}
      />
    </div>
  );
}
