"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  Building2Icon,
  CalendarIcon,
  ShieldCheckIcon,
  MailIcon,
  BadgeCheckIcon,
  UserIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

type CompanyJob = {
  id: string;
  title: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  applicationDeadline: string | null;
  applicationCount: number;
};

type AdminRecruiterProfileViewProps = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    banned: boolean;
    banReason: string | null;
    banExpiresAt: string | null;
    emailVerified: boolean;
    createdAt: string;
    companyMembership: {
      role: string;
      companyName: string;
      companyId: string;
    } | null;
    jobs: CompanyJob[];
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

function JobStatusBadge({ status, isActive }: { status: string; isActive: boolean }) {
  if (!isActive) return <Badge variant="destructive">Disabled</Badge>;
  if (status === "active") return <Badge variant="default">Active</Badge>;
  if (status === "draft") return <Badge variant="outline">Draft</Badge>;
  if (status === "archived") return <Badge variant="secondary">Archived</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export function AdminRecruiterProfileView({ user }: AdminRecruiterProfileViewProps) {
  const router = useRouter();
  const [now] = useState(() => Date.now());

  return (
    <div className="space-y-6">
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
        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
          <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4">
            Company
          </h2>
          {user.companyMembership ? (
            <div className="space-y-4">
              <InfoRow
                icon={<Building2Icon className="size-5" />}
                label="Company"
                value={
                  <Link
                    href={`/admin/company/${user.companyMembership.companyId}`}
                    className="text-brand hover:underline inline-flex items-center gap-1"
                  >
                    {user.companyMembership.companyName}
                    <ExternalLinkIcon className="size-3" />
                  </Link>
                }
              />
              <InfoRow
                icon={<ShieldCheckIcon className="size-5" />}
                label="Member Role"
                value={<span className="capitalize">{user.companyMembership.role}</span>}
              />
            </div>
          ) : (
            <p className="text-sm text-text-muted">No company affiliation.</p>
          )}
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
          <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4">
            Account
          </h2>
          <div className="space-y-4">
            <InfoRow icon={<MailIcon className="size-5" />} label="Email" value={user.email} />
            <InfoRow
              icon={<BadgeCheckIcon className="size-5" />}
              label="Email Verified"
              value={
                user.emailVerified ? (
                  <span className="text-success">Verified</span>
                ) : (
                  <span className="text-warning">Not verified</span>
                )
              }
            />
            <InfoRow
              icon={<CalendarIcon className="size-5" />}
              label="Member Since"
              value={new Date(user.createdAt).toLocaleDateString()}
            />
            <InfoRow
              icon={<UserIcon className="size-5" />}
              label="Role"
              value={<span className="capitalize">{user.role}</span>}
            />
          </div>
        </div>
      </div>

      {user.companyMembership && user.jobs.length > 0 && (
        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
          <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4">
            Company Jobs
          </h2>
          <div className="space-y-2">
            {user.jobs.map((job) => {
              const deadline = job.applicationDeadline
                ? new Date(job.applicationDeadline).getTime()
                : null;
              const expired = deadline !== null && deadline < now;

              return (
                <Link
                  key={job.id}
                  href={`/admin/jobs/${job.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-bg-elevated border border-border-subtle hover:bg-bg-elevated/80 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-text-heading truncate">
                        {job.title}
                      </span>
                      <JobStatusBadge status={job.status} isActive={job.isActive} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                      <span>
                        {job.applicationCount} applicant{job.applicationCount !== 1 ? "s" : ""}
                      </span>
                      {expired && <span className="text-warning">Expired</span>}
                    </div>
                  </div>
                  <ExternalLinkIcon className="size-4 text-text-muted shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
