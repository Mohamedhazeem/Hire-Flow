"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DashboardData } from "../queries/dashboard-queries";
import {
  LayoutDashboardIcon,
  BriefcaseIcon,
  FileTextIcon,
  ClockIcon,
  TrendingUpIcon,
  PlusIcon,
  UserPlusIcon,
  ArrowRightIcon,
  BarChart3Icon,
} from "lucide-react";

type RecruiterDashboardProps = {
  data: DashboardData;
};

const recentColumns: ColumnDef<DashboardData["recentApplications"][number]>[] = [
  {
    key: "userName",
    header: "Applicant",
    align: "center",
    cell: (row) => <span className="font-medium text-text-heading text-sm">{row.userName ?? "—"}</span>,
  },
  {
    key: "jobTitle",
    header: "Job",
    align: "center",
    cell: (row) => (
      <span className="flex items-center justify-center text-text-body text-sm truncate max-w-45 w-full mx-auto">
        {row.jobTitle}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "appliedAt",
    header: "Applied",
    align: "center",
    cell: (row) => (
      <span className="text-text-muted text-xs whitespace-nowrap">
        {new Date(row.appliedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </span>
    ),
  },
];

export function RecruiterDashboard({ data }: RecruiterDashboardProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your recruiting activity"
        icon={<LayoutDashboardIcon className="size-5" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/recruiter/jobs/new"
          className="rounded-2xl border border-border-subtle bg-bg-surface p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand/30 transition-all flex items-center gap-3"
        >
          <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <PlusIcon className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-heading">Create New Job</p>
            <p className="text-xs text-text-muted">Post a new position</p>
          </div>
        </Link>

        <Link
          href="/recruiter/team"
          className="rounded-2xl border border-border-subtle bg-bg-surface p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand/30 transition-all flex items-center gap-3"
        >
          <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <UserPlusIcon className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-heading">Invite Team Member</p>
            <p className="text-xs text-text-muted">Add a recruiter to your company</p>
          </div>
        </Link>

        <Link
          href="/recruiter/jobs"
          className="rounded-2xl border border-border-subtle bg-bg-surface p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand/30 transition-all flex items-center gap-3"
        >
          <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
            <BriefcaseIcon className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-heading">View All Jobs</p>
            <p className="text-xs text-text-muted">Manage your job listings</p>
          </div>
        </Link>

        <Link
          href="/recruiter/analytics"
          className="rounded-2xl border border-border-subtle bg-bg-surface p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand/30 transition-all flex items-center gap-3"
        >
          <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <BarChart3Icon className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-heading">View Analytics</p>
            <p className="text-xs text-text-muted">Insights and metrics</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Jobs"
          value={data.totalJobs}
          icon={<BriefcaseIcon className="size-5" />}
          description={data.totalJobs === 1 ? "1 job posted" : `${data.totalJobs} jobs posted`}
          gradient="from-emerald-500/10 via-emerald-500/5 to-transparent"
        />
        <StatCard
          title="Applications"
          value={data.totalApplications}
          icon={<FileTextIcon className="size-5" />}
          description="Across all job postings"
          gradient="from-purple-500/10 via-purple-500/5 to-transparent"
        />
        <StatCard
          title="Pending Reviews"
          value={data.pendingReviews}
          icon={<ClockIcon className="size-5" />}
          description={data.pendingReviews > 0 ? "Awaiting your decision" : "No pending reviews"}
          gradient="from-amber-500/10 via-amber-500/5 to-transparent"
        />
        <StatCard
          title="New This Week"
          value={data.newThisWeek}
          icon={<TrendingUpIcon className="size-5" />}
          description={data.newThisWeek > 0 ? "Last 7 days" : "No new applications this week"}
          gradient="from-blue-500/10 via-blue-500/5 to-transparent"
        />
      </div>

      <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-text-heading">Recent Applications</h2>
            <p className="text-[11px] text-text-muted mt-0.5">Latest 5 applications across all jobs</p>
          </div>
          {data.recentApplications.length > 0 && (
            <Link href="/recruiter/jobs" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
              View All Jobs
              <ArrowRightIcon className="size-3" />
            </Link>
          )}
        </div>
        <DataTable
          columns={recentColumns}
          data={data.recentApplications}
          emptyMessage={
            data.totalJobs === 0
              ? "Post your first job to start receiving applications."
              : "No applications received yet."
          }
        />
      </div>
    </div>
  );
}
