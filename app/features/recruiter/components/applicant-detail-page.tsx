"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  DownloadIcon,
  FileTextIcon,
  MapPinIcon,
  BriefcaseIcon,
  MessageSquareTextIcon,
  GraduationCapIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useApplicantDetail,
  useTransitionStatusWithRefresh,
} from "@/app/features/recruiter/hooks/use-applicant-detail";
import { StatusTimeline } from "@/components/shared/status-timeline";
import {
  ReviewDialog,
  ShortlistDialog,
  ScheduleInterviewDialog,
  SendOfferDialog,
  RejectDialog,
} from "@/app/features/recruiter/components/application-dialogs";
import { useState } from "react";
import type { ApplicantRow } from "@/app/features/recruiter/queries/application-queries";

const NEXT_ACTIONS: Record<string, { label: string; status: string }[]> = {
  applied: [
    { label: "Start Review", status: "reviewing" },
    { label: "Reject", status: "rejected" },
  ],
  reviewing: [
    { label: "Shortlist", status: "shortlisted" },
    { label: "Reject", status: "rejected" },
  ],
  shortlisted: [
    { label: "Schedule Interview", status: "interview_scheduled" },
    { label: "Reject", status: "rejected" },
  ],
  interview_scheduled: [
    { label: "Send Offer", status: "offered" },
    { label: "Reject", status: "rejected" },
  ],
  offered: [
    { label: "Mark Hired", status: "hired" },
    { label: "Reject", status: "rejected" },
  ],
  hired: [],
  rejected: [],
};

type ApplicantDetailPageProps = {
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

export function ApplicantDetailPage({ applicationId }: ApplicantDetailPageProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useApplicantDetail(applicationId);
  const transitionStatus = useTransitionStatusWithRefresh(applicationId);
  const [dialog, setDialog] = useState<{
    type: string;
    applicant: ApplicantRow | null;
  }>({ type: "", applicant: null });

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
        <Skeleton className="h-16 rounded-2xl" />
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

  const detail = data.data;
  const { application, applicant, statusTimeline, recentMessages } = detail;
  const profile = applicant.profile;
  const experiencesArray =
    profile?.experiences != null && Array.isArray(profile.experiences)
      ? (profile.experiences as unknown[])
      : null;
  const threadId = [application.userId, application.userId].sort().join("_");

  const actions = NEXT_ACTIONS[application.status] ?? [];
  const primaryResume = profile?.resumes?.find((r) => r.isPrimary) ?? profile?.resumes?.[0];

  const applicantRowForDialog: ApplicantRow = {
    id: application.id,
    userId: applicant.id,
    name: applicant.name,
    email: applicant.email,
    status: application.status,
    appliedAt: application.appliedAt,
    updatedAt: application.updatedAt,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
          href={`/recruiter/jobs/${application.job.id}`}
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand transition-colors"
        >
          <BriefcaseIcon className="size-4" />
          {application.job.title}
          <ExternalLinkIcon className="size-3" />
        </Link>
      </div>

      {/* Main content: two columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Profile */}
        <div className="space-y-6">
          {/* Profile Card */}
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

          {/* Resume Card */}
          <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
            <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4">
              Resume
            </h2>
            {primaryResume ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated border border-border-subtle">
                  <FileTextIcon className="size-5 text-brand shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-heading truncate">
                      {primaryResume.label}
                    </p>
                    <p className="text-xs text-text-muted">
                      {primaryResume.isPrimary ? "Primary Resume" : "Resume"}
                    </p>
                  </div>
                  {primaryResume.fileUrl && (
                    <a
                      href={`/api/files/download?path=${encodeURIComponent(primaryResume.fileUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md bg-brand text-white hover:bg-brand/90 h-8 gap-1.5 px-3 text-xs font-medium transition-all"
                    >
                      <DownloadIcon className="size-4" />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                  )}
                </div>
                {profile?.resumes && profile.resumes.length > 1 && (
                  <p className="text-xs text-text-muted">
                    {profile.resumes.length - 1} more resume
                    {profile.resumes.length > 2 ? "s" : ""} uploaded
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No resume uploaded.</p>
            )}
          </div>
        </div>

        {/* Right column: Timeline + Messages */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
            <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4">
              Timeline
            </h2>
            <StatusTimeline entries={statusTimeline} />
          </div>

          {/* Recent Messages */}
          <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider">
                Recent Messages
              </h2>
              <Link
                href={`/recruiter/messages?thread=${threadId}`}
                className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
              >
                <MessageSquareTextIcon className="size-3.5" />
                View All
              </Link>
            </div>
            {recentMessages.length > 0 ? (
              <div className="space-y-2">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 rounded-xl bg-bg-elevated border border-border-subtle"
                  >
                    <p className="text-sm text-text-body line-clamp-2">
                      {msg.content || (msg.fileUrl ? "📎 File" : "")}
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
              <div className="text-center py-4">
                <p className="text-sm text-text-muted mb-2">No messages yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/recruiter/messages?thread=${threadId}`)}
                >
                  <MessageSquareTextIcon className="size-4 mr-1.5" />
                  Start Conversation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Actions */}
      {actions.length > 0 && (
        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
          <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4">
            Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            {actions.map((action) => {
              const variant = action.status === "rejected" ? "destructive" : "default";
              return (
                <Button
                  key={action.status}
                  variant={variant}
                  disabled={transitionStatus.isPending}
                  onClick={() =>
                    setDialog({
                      type: action.status,
                      applicant: applicantRowForDialog,
                    })
                  }
                >
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ReviewDialog
        open={dialog.type === "reviewing"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "", applicant: null });
        }}
        applicant={dialog.applicant}
      />
      <ShortlistDialog
        open={dialog.type === "shortlisted"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "", applicant: null });
        }}
        applicant={dialog.applicant}
      />
      <ScheduleInterviewDialog
        open={dialog.type === "interview_scheduled"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "", applicant: null });
        }}
        applicant={dialog.applicant}
      />
      <SendOfferDialog
        open={dialog.type === "offered"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "", applicant: null });
        }}
        applicant={dialog.applicant}
      />
      <RejectDialog
        open={dialog.type === "rejected"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "", applicant: null });
        }}
        applicant={dialog.applicant}
      />
    </div>
  );
}
