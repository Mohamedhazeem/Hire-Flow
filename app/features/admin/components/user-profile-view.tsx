"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  DownloadIcon,
  FileTextIcon,
  MapPinIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  EyeIcon,
  AlertCircleIcon,
  ExternalLinkIcon,
  CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { ResumePreviewDialog } from "@/components/shared/resume-preview-dialog";
import { useAdminUserApplications } from "@/app/features/admin/hooks/use-admin-users";

type AdminUserProfileViewProps = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    banned: boolean;
    banReason: string | null;
    banExpiresAt: string | null;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
    updatedAt: string;
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
    resumes: {
      id: string;
      label: string;
      fileUrl: string | null;
      isPrimary: boolean;
      createdAt: string;
    }[];
  };
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

export function AdminUserProfileView({ user }: AdminUserProfileViewProps) {
  const router = useRouter();
  const [previewResume, setPreviewResume] = useState<{
    fileUrl: string | null;
    label: string;
  } | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = useCallback(async (fileUrl: string) => {
    try {
      const res = await fetch(`/api/files/download?path=${encodeURIComponent(fileUrl)}`);
      if (!res.ok) {
        setDownloadError("File unavailable — removed by applicant");
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

  const profile = user.profile;
  const experiencesArray =
    profile?.experiences != null && Array.isArray(profile.experiences)
      ? (profile.experiences as unknown[])
      : null;

  const { data: appsData, isLoading: appsLoading } = useAdminUserApplications(user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <h1 className="text-2xl font-bold text-text-heading">{user.name}</h1>
            <Badge variant="outline" className="capitalize text-xs font-medium">
              {user.role}
            </Badge>
            {user.banned && <Badge variant="destructive">Banned</Badge>}
            {!user.emailVerified && <Badge variant="outline">Unverified</Badge>}
          </div>
          <p className="text-sm text-text-muted mt-0.5">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            Resumes
          </h2>
          {user.resumes && user.resumes.length > 0 ? (
            <div className="space-y-3">
              {user.resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated border border-border-subtle"
                >
                  <FileTextIcon className="size-5 text-brand shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-text-heading truncate">
                        {resume.label}
                      </p>
                      {resume.isPrimary && (
                        <span className="inline-flex items-center rounded-full bg-bg-elevated text-text-muted border border-border-subtle px-2 py-0.5 text-[10px] font-medium leading-none">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted">
                      Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {resume.fileUrl && (
                      <>
                        {(() => {
                          const resumeExt = resume.fileUrl.split(".").pop()?.toLowerCase() ?? "";
                          const isPdfOrImage = resumeExt === "pdf" || ["jpg", "jpeg", "png", "webp", "gif"].includes(resumeExt);
                          return isPdfOrImage ? (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Preview"
                              onClick={() =>
                                setPreviewResume({ fileUrl: resume.fileUrl, label: resume.label })
                              }
                            >
                              <EyeIcon className="size-4 text-text-muted hover:text-brand" />
                            </Button>
                          ) : null;
                        })()}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Download"
                          onClick={() => handleDownload(resume.fileUrl!)}
                        >
                          <DownloadIcon className="size-4 text-text-muted hover:text-brand" />
                        </Button>
                      </>
                    )}
                    {!resume.fileUrl && (
                      <span className="text-xs text-text-muted italic">No file</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <FileTextIcon className="size-8 text-text-muted" />
              <p className="text-sm text-text-muted">No resumes uploaded.</p>
            </div>
          )}

          {downloadError && (
            <div className="flex items-center gap-2 text-xs text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2 mt-3">
              <AlertCircleIcon className="size-3.5 shrink-0" />
              {downloadError}
            </div>
          )}
        </div>
      </div>

      {/* Applications Card */}
      <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
        <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4">
          Applications
        </h2>
        {appsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        ) : appsData?.data?.applications && appsData.data.applications.length > 0 ? (
          <div className="space-y-2">
            {appsData.data.applications.map((app) => (
              <Link
                key={app.id}
                href={`/admin/applications/${app.id}`}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-bg-elevated border border-border-subtle hover:bg-bg-elevated/80 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-text-heading truncate">
                      {app.jobTitle}
                    </p>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
                    <CalendarIcon className="size-3" />
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </div>
                </div>
                <ExternalLinkIcon className="size-4 text-text-muted shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <BriefcaseIcon className="size-8 text-text-muted" />
            <p className="text-sm text-text-muted">No applications found.</p>
          </div>
        )}
      </div>

      <ResumePreviewDialog
        open={previewResume !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewResume(null);
        }}
        fileUrl={previewResume?.fileUrl ?? null}
        label={previewResume?.label ?? "Resume"}
        onDownload={previewResume?.fileUrl ? () => handleDownload(previewResume.fileUrl!) : undefined}
      />
    </div>
  );
}
