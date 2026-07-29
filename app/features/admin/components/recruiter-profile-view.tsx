"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2Icon, ExternalLinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProfileHeader } from "@/components/shared/profile-header";
import { AccountCard } from "@/components/shared/account-card";
import { CompanyCard } from "@/components/shared/company-card";
import { DataTableSection } from "@/components/shared/data-table-section";

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

function JobStatusBadge({ status, isActive }: { status: string; isActive: boolean }) {
  if (!isActive) return <Badge variant="destructive">Disabled</Badge>;
  return (
    <Badge
      variant={status === "active" ? "default" : status === "archived" ? "secondary" : "outline"}
    >
      {status === "draft" ? "Draft" : status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function CompanyJobsTable({ jobs, now }: { jobs: CompanyJob[]; now: number }) {
  return (
    <table className="w-full text-center">
      <thead>
        <tr className="border-b border-border-subtle bg-bg-elevated/50">
          {["Title", "Status", "Applicants", "Deadline", ""].map((h) => (
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
        {jobs.map((job) => {
          const deadline = job.applicationDeadline
            ? new Date(job.applicationDeadline).getTime()
            : null;
          const expired = deadline !== null && deadline < now;
          return (
            <tr key={job.id} className="hover:bg-bg-elevated/50 transition-colors text-center">
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
              <td className="px-4 py-3 text-sm text-text-body">{job.applicationCount}</td>
              <td className="px-4 py-3 text-sm text-text-muted">
                {deadline ? fmtDate(new Date(deadline)) : "\u2014"}
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
  );
}

export function AdminRecruiterProfileView({ user }: AdminRecruiterProfileViewProps) {
  const [now] = useState(() => Date.now());
  const [showAllJobs, setShowAllJobs] = useState(false);
  const LIMIT = 10;
  const jobs = user.jobs;
  const displayedJobs = showAllJobs ? jobs : jobs.slice(0, LIMIT);
  const m = user.companyMembership;

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
          {m && (
            <CompanyCard
              companyId={m.companyId}
              companyName={m.companyName}
              companyLogo={m.companyLogo}
              memberRole={m.role}
            />
          )}
        </div>
        <div className="lg:col-span-2 space-y-6">
          {m && jobs.length > 0 ? (
            <DataTableSection
              title="Company Jobs"
              count={jobs.length}
              countLabel="jobs"
              totalCount={jobs.length}
              visibleCount={LIMIT}
              showAll={showAllJobs}
              onShowAll={() => setShowAllJobs(true)}
            >
              <CompanyJobsTable jobs={displayedJobs} now={now} />
            </DataTableSection>
          ) : m && jobs.length === 0 ? (
            <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6 text-center">
              <Building2Icon className="size-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-muted">No jobs from this company.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
