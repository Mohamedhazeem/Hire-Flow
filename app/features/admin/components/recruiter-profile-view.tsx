"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
import { IconBox } from "@/components/shared/icon-box";
import { cn } from "@/lib/utils";

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
    image: string | null;
    createdAt: string;
    companyMembership: {
      role: string;
      companyName: string;
      companyId: string;
      companyLogo: string | null;
    } | null;
    jobs: CompanyJob[];
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
                <MailIcon className="size-5 shrink-0 text-text-muted mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                    Email
                  </p>
                  <p className="text-sm text-text-body mt-0.5 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BadgeCheckIcon className="size-5 shrink-0 text-text-muted mt-0.5" />
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
                <CalendarIcon className="size-5 shrink-0 text-text-muted mt-0.5" />
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
                <UserIcon className="size-5 shrink-0 text-text-muted mt-0.5" />
                <div>
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                    Role
                  </p>
                  <p className="text-sm text-text-body mt-0.5 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </SectionCard>

          {user.companyMembership && (
            <SectionCard title="Company">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {user.companyMembership.companyLogo ? (
                    <Image
                      src={user.companyMembership.companyLogo}
                      alt={user.companyMembership.companyName}
                      width={40}
                      height={40}
                      className="rounded-lg object-contain size-10 shrink-0"
                    />
                  ) : (
                    <IconBox>
                      <Building2Icon className="size-5" />
                    </IconBox>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                      Company
                    </p>
                    <Link
                      href={`/admin/company/${user.companyMembership.companyId}`}
                      className="text-sm font-medium text-text-heading hover:text-brand truncate block mt-0.5"
                    >
                      {user.companyMembership.companyName}
                    </Link>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <IconBox>
                    <ShieldCheckIcon className="size-5" />
                  </IconBox>
                  <div>
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                      Member Role
                    </p>
                    <p className="text-sm text-text-body mt-0.5 capitalize">
                      {user.companyMembership.role}
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {user.companyMembership && user.jobs.length > 0 && (
            <SectionCard title="Company Jobs" count={user.jobs.length} countLabel="jobs">
              <div className="overflow-x-auto -mx-6 -my-6">
                <table className="w-full text-center">
                  <thead>
                    <tr className="border-b border-border-subtle bg-bg-elevated/50">
                      <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">
                        Title
                      </th>
                      <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                        Status
                      </th>
                      <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                        Applicants
                      </th>
                      <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                        Deadline
                      </th>
                      <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {user.jobs.map((job) => {
                      const deadline = job.applicationDeadline
                        ? new Date(job.applicationDeadline).getTime()
                        : null;
                      const expired = deadline !== null && deadline < now;

                      return (
                        <tr
                          key={job.id}
                          className="hover:bg-bg-elevated/50 transition-colors text-center"
                        >
                          <td className="px-6 py-3">
                            <Link
                              href={`/admin/jobs/${job.id}`}
                              className="text-sm font-medium text-text-heading hover:text-brand truncate block max-w-60"
                            >
                              {job.title}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <JobStatusBadge status={job.status} isActive={job.isActive} />
                              {expired && (
                                <Badge variant="outline" className="text-warning border-warning/30">
                                  Expired
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-text-body">
                            {job.applicationCount}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-muted">
                            {deadline
                              ? new Date(deadline).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="px-6 py-3">
                            <Link
                              href={`/admin/jobs/${job.id}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                            >
                              View <ExternalLinkIcon className="size-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {user.companyMembership && user.jobs.length === 0 && (
            <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6 text-center">
              <Building2Icon className="size-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-muted">No jobs from this company.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
