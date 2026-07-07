"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  MailIcon,
  BadgeCheckIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { ResumePreviewDialog } from "@/components/shared/resume-preview-dialog";
import { useAdminUserApplications } from "@/app/features/admin/hooks/use-admin-users";
import { cn } from "@/lib/utils";
import { IconBox } from "@/components/shared/icon-box";

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

function SectionCard({
  title,
  count,
  countLabel,
  children,
  className,
}: {
  title: string;
  count?: number;
  countLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border-subtle bg-bg-surface overflow-hidden transition-shadow duration-200 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      <div className="flex items-center justify-between px-6 py-3.5 bg-bg-elevated/60 border-b border-border-subtle">
        <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider">
          {title}
        </h2>
        {count != null && (
          <span className="text-xs text-text-muted">
            {count} {countLabel ?? ""}
          </span>
        )}
      </div>
      <div className="border-t border-border-subtle/40" />
      <div className="p-6">{children}</div>
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

  const initials = user.name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-radius-md hover:bg-bg-elevated hover:text-text-heading size-8 transition-all"
          aria-label="back"
        >
          <ArrowLeftIcon className="size-5" />
        </button>
        <div className="flex items-center gap-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={48}
              height={48}
              className="rounded-full object-cover shrink-0 size-12"
            />
          ) : (
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
              {initials}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <SectionCard title="Account">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <IconBox>
                  <MailIcon className="size-5 shrink-0 text-text-muted mt-0.5" />
                </IconBox>
                <div className="min-w-0">
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                    Email
                  </p>
                  <p className="text-sm text-text-body mt-0.5 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IconBox>
                  <BadgeCheckIcon className="size-5 shrink-0 text-text-muted mt-0.5" />
                </IconBox>
                <div>
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                    Verified
                  </p>
                  <p className="text-sm mt-0.5">
                    {user.emailVerified ? (
                      <span className="text-success">Verified</span>
                    ) : (
                      <span className="text-warning">Not verified</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IconBox>
                  <CalendarIcon className="size-5 shrink-0 text-text-muted mt-0.5" />
                </IconBox>
                <div>
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                    Member Since
                  </p>
                  <p className="text-sm text-text-body mt-0.5">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IconBox>
                  <UserIcon className="size-5 shrink-0 text-text-muted mt-0.5" />
                </IconBox>
                <div>
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                    Role
                  </p>
                  <p className="text-sm text-text-body mt-0.5 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Profile">
            <div className="space-y-4">
              {profile?.headline && (
                <p className="text-lg text-text-body font-medium">{profile.headline}</p>
              )}
              {profile?.bio && (
                <p className="text-sm text-text-muted leading-relaxed">{profile.bio}</p>
              )}
              <div className="flex items-start gap-3">
                <IconBox>
                  <MapPinIcon className="size-5 shrink-0 text-text-muted mt-0.5" />
                </IconBox>

                <div>
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                    Location
                  </p>
                  <p className="text-sm text-text-body mt-0.5">
                    {profile?.location ?? "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IconBox>
                  <GraduationCapIcon className="size-5 shrink-0 text-text-muted mt-0.5" />
                </IconBox>
                <div>
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                    Expected CTC
                  </p>
                  <p className="text-sm text-text-body mt-0.5">
                    {profile?.ctc != null
                      ? `$${profile.ctc.toLocaleString()}`
                      : profile?.basePay != null
                        ? `$${profile.basePay.toLocaleString()}/yr`
                        : "Not specified"}
                  </p>
                </div>
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
                        className="inline-flex items-center rounded-full bg-brand/10 text-brand border border-brand/20 px-2.5 py-0.5 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {experiencesArray && experiencesArray.length > 0 && (
            <SectionCard title="Experience" count={experiencesArray.length} countLabel="entries">
              <div className="space-y-3">
                {experiencesArray.map((item, i) => {
                  const exp = item as {
                    title?: string;
                    company?: string;
                    startDate?: string;
                    endDate?: string;
                  };
                  return (
                    <div key={i} className="border-l-2 border-border-subtle pl-3">
                      {exp.title && (
                        <p className="text-sm font-medium text-text-body">{exp.title}</p>
                      )}
                      {exp.company && <p className="text-xs text-text-muted">{exp.company}</p>}
                      {exp.startDate && (
                        <p className="text-xs text-text-muted mt-0.5">
                          {exp.startDate} – {exp.endDate ?? "Present"}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {user.resumes.length > 0 && (
            <SectionCard title="Resumes" count={user.resumes.length} countLabel="files">
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
                        Uploaded{" "}
                        {new Date(resume.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {resume.fileUrl && (
                        <>
                          {(() => {
                            const resumeExt = resume.fileUrl.split(".").pop()?.toLowerCase() ?? "";
                            const isPdfOrImage =
                              resumeExt === "pdf" ||
                              ["jpg", "jpeg", "png", "webp", "gif"].includes(resumeExt);
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
              {downloadError && (
                <div className="flex items-center gap-2 text-xs text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2 mt-3">
                  <AlertCircleIcon className="size-3.5 shrink-0" />
                  {downloadError}
                </div>
              )}
            </SectionCard>
          )}

          <SectionCard
            title="Applications"
            count={appsData?.data?.applications?.length}
            countLabel="applications"
          >
            {appsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : appsData?.data?.applications && appsData.data.applications.length > 0 ? (
              <div className="overflow-x-auto -mx-6 -my-6">
                <table className="w-full text-center">
                  <thead>
                    <tr className="border-b border-border-subtle bg-bg-elevated/50">
                      <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">
                        Job
                      </th>
                      <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                        Status
                      </th>
                      <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                        Applied
                      </th>
                      <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {appsData.data.applications.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-bg-elevated/50 transition-colors text-center"
                      >
                        <td className="px-6 py-3">
                          <Link
                            href={`/admin/applications/${app.id}`}
                            className="text-sm font-medium text-text-heading hover:text-brand truncate block max-w-60"
                          >
                            {app.jobTitle}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-4 py-3 text-sm text-text-muted">
                          {new Date(app.appliedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-3">
                          <Link
                            href={`/admin/applications/${app.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                          >
                            View <ExternalLinkIcon className="size-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <BriefcaseIcon className="size-8 text-text-muted" />
                <p className="text-sm text-text-muted">No applications found.</p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      <ResumePreviewDialog
        open={previewResume !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewResume(null);
        }}
        fileUrl={previewResume?.fileUrl ?? null}
        label={previewResume?.label ?? "Resume"}
        onDownload={
          previewResume?.fileUrl ? () => handleDownload(previewResume.fileUrl!) : undefined
        }
      />
    </div>
  );
}
