"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  FileTextIcon,
  MapPinIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  EyeIcon,
  DownloadIcon,
  AlertCircleIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { SectionCard } from "@/components/shared/section-card";
import { ProfileHeader } from "@/components/shared/profile-header";
import { AccountCard } from "@/components/shared/account-card";
import { InfoRow } from "@/components/shared/info-row";
import { ShowMoreToggle } from "@/components/shared/show-more-toggle";
import { ResumePreviewDialog } from "@/components/shared/resume-preview-dialog";
import { useAdminUserApplications } from "@/app/features/admin/hooks/use-admin-users";

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const isPdfOrImage = (url: string) => {
  const e = url.split(".").pop()?.toLowerCase();
  return e === "pdf" || ["jpg", "jpeg", "png", "webp", "gif"].includes(e ?? "");
};

type App = { id: string; jobTitle: string; status: string; appliedAt: string };
function ApplicationsTable({ apps }: { apps: App[] }) {
  return (
    <table className="w-full text-center">
      <thead>
        <tr className="border-b border-border-subtle bg-bg-elevated/50">
          {["Job", "Status", "Applied", ""].map((h) => (
            <th
              key={h}
              className="text-center text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3"
            >
              {h || "\u00A0"}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border-subtle">
        {apps.map((a) => (
          <tr key={a.id} className="hover:bg-bg-elevated/50 transition-colors text-center">
            <td className="px-6 py-3">
              <Link
                href={`/admin/applications/${a.id}`}
                className="text-sm font-medium text-text-heading hover:text-brand truncate block max-w-60"
              >
                {a.jobTitle}
              </Link>
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={a.status} />
            </td>
            <td className="px-4 py-3 text-sm text-text-muted">{fmtDate(new Date(a.appliedAt))}</td>
            <td className="px-6 py-3">
              <Link
                href={`/admin/applications/${a.id}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                View <ExternalLinkIcon className="size-3" />
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

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

export function AdminUserProfileView({ user }: AdminUserProfileViewProps) {
  const [preview, setPreview] = useState<{ url: string | null; label: string } | null>(null);
  const [dlError, setDlError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const LIMIT = 10;

  const download = useCallback(async (url: string) => {
    try {
      const res = await fetch(`/api/files/download?path=${encodeURIComponent(url)}`);
      if (!res.ok) {
        setDlError("File unavailable \u2014 removed by applicant");
        setTimeout(() => setDlError(null), 5000);
        return;
      }
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = url.split("/").pop() ?? "resume";
      a.click();
    } catch {
      setDlError("Download failed.");
      setTimeout(() => setDlError(null), 5000);
    }
  }, []);

  const p = user.profile;
  const exp =
    p?.experiences != null && Array.isArray(p.experiences) ? (p.experiences as unknown[]) : null;
  const { data: ad, isLoading } = useAdminUserApplications(user.id);
  const apps = ad?.data?.applications ?? [];
  const displayed = showAll ? apps : apps.slice(0, LIMIT);

  return (
    <div className="space-y-6 mt-4">
      <ProfileHeader {...user} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 lg:self-start">
          <AccountCard
            email={user.email}
            emailVerified={user.emailVerified}
            createdAt={user.createdAt}
            role={user.role}
          />
          <SectionCard title="Profile">
            <div className="space-y-4">
              {p?.headline && <p className="text-lg text-text-body font-medium">{p.headline}</p>}
              {p?.bio && <p className="text-sm text-text-muted leading-relaxed">{p.bio}</p>}
              <InfoRow
                icon={<MapPinIcon />}
                label="Location"
                value={p?.location ?? "Not specified"}
              />
              <InfoRow
                icon={<GraduationCapIcon />}
                label="Expected CTC"
                value={
                  p?.ctc != null
                    ? `$${p.ctc.toLocaleString()}`
                    : p?.basePay != null
                      ? `$${p.basePay.toLocaleString()}/yr`
                      : "Not specified"
                }
              />
              {p?.skills && p.skills.length > 0 && (
                <div>
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.skills.map((s, i) => (
                      <SkillChip key={i} label={s} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
          {exp && exp.length > 0 && (
            <SectionCard title="Experience" count={exp.length} countLabel="entries">
              <div className="space-y-3">
                {exp.map((item, i) => {
                  const e = item as {
                    title?: string;
                    company?: string;
                    startDate?: string;
                    endDate?: string;
                  };
                  return (
                    <div key={i} className="border-l-2 border-border-subtle pl-3">
                      {e.title && <p className="text-sm font-medium text-text-body">{e.title}</p>}
                      {e.company && <p className="text-xs text-text-muted">{e.company}</p>}
                      {e.startDate && (
                        <p className="text-xs text-text-muted mt-0.5">
                          {e.startDate} {"\u2013"} {e.endDate ?? "Present"}
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
                {user.resumes.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated border border-border-subtle"
                  >
                    <FileTextIcon className="size-5 text-brand shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-text-heading truncate">{r.label}</p>
                        {r.isPrimary && (
                          <Badge variant="outline" className="text-[10px] leading-none px-2 py-0.5">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-text-muted">
                        Uploaded {fmtDate(new Date(r.createdAt))}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {r.fileUrl && (
                        <>
                          {isPdfOrImage(r.fileUrl) && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Preview"
                              onClick={() => setPreview({ url: r.fileUrl, label: r.label })}
                            >
                              <EyeIcon className="size-4 text-text-muted hover:text-brand" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Download"
                            onClick={() => download(r.fileUrl!)}
                          >
                            <DownloadIcon className="size-4 text-text-muted hover:text-brand" />
                          </Button>
                        </>
                      )}
                      {!r.fileUrl && (
                        <span className="text-xs text-text-muted italic">No file</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {dlError && (
                <div className="flex items-center gap-2 text-xs text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2 mt-3">
                  <AlertCircleIcon className="size-3.5 shrink-0" />
                  {dlError}
                </div>
              )}
            </SectionCard>
          )}
          <SectionCard title="Applications" count={apps.length} countLabel="applications">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : apps.length > 0 ? (
              <>
                <div className="overflow-x-auto -mx-6 -mb-6 -mt-6">
                  <ApplicationsTable apps={displayed} />
                </div>
                <ShowMoreToggle
                  totalCount={apps.length}
                  visibleCount={LIMIT}
                  showAll={showAll}
                  onToggle={() => setShowAll(true)}
                  label="applications"
                />
              </>
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
        open={preview !== null}
        onOpenChange={(o) => {
          if (!o) setPreview(null);
        }}
        fileUrl={preview?.url ?? null}
        label={preview?.label ?? "Resume"}
        onDownload={preview?.url ? () => download(preview.url!) : undefined}
      />
    </div>
  );
}

function SkillChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand/10 text-brand border border-brand/20 px-2.5 py-0.5 text-xs font-medium">
      {label}
    </span>
  );
}
