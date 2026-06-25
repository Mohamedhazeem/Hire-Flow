"use client";

import { useAdminDashboard } from "@/app/features/admin/hooks/use-admin-dashboard";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Rectangle,
} from "recharts";
import {
  UsersIcon,
  BriefcaseIcon,
  FileTextIcon,
  UserCogIcon,
  TrendingUpIcon,
  ActivityIcon,
  UserPlusIcon,
  LayoutDashboardIcon,
} from "lucide-react";

const WORKMODE_COLORS: Record<string, string> = {
  remote: "#22c55e",
  hybrid: "#a855f7",
  onsite: "#f97316",
};

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "var(--color-bg-surface)",
    border: "1px solid var(--color-border-subtle)",
    borderRadius: "12px",
    boxShadow: "var(--shadow-md)",
    fontSize: "12px",
  },
};

export function AdminDashboard() {
  const { data, isLoading, isError } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-text-muted text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="size-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-3">
            <ActivityIcon className="size-6 text-error" />
          </div>
          <p className="text-destructive text-sm font-medium">Failed to load dashboard data</p>
          <p className="text-text-muted text-xs mt-1">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const recentUserColumns: ColumnDef<(typeof data.recentUsers)[number]>[] = [
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-bold">
            {row.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-text-heading text-sm truncate">{row.name ?? "—"}</p>
            <p className="text-text-muted text-xs truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      align: "center",
      cell: (row) => (
        <Badge variant="outline" className="capitalize text-[11px] font-semibold px-2.5 py-0.5">
          {row.role}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      align: "center",
      cell: (row) => (
        <span className="text-text-muted text-xs whitespace-nowrap">
          {new Date(row.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Platform overview and key metrics at a glance"
        icon={<LayoutDashboardIcon className="size-5" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={data.totalUsers}
          icon={<UsersIcon className="size-5" />}
          description={`${data.totalRecruiters} recruiters`}
          gradient="from-blue-500/10 via-blue-500/5 to-transparent"
        />
        <StatCard
          title="Total Jobs"
          value={data.totalJobs}
          icon={<BriefcaseIcon className="size-5" />}
          description={`${data.activeJobs} active`}
          gradient="from-emerald-500/10 via-emerald-500/5 to-transparent"
        />
        <StatCard
          title="Applications"
          value={data.totalApplications}
          icon={<FileTextIcon className="size-5" />}
          gradient="from-purple-500/10 via-purple-500/5 to-transparent"
        />
        <StatCard
          title="Recruiters"
          value={data.totalRecruiters}
          icon={<UserCogIcon className="size-5" />}
          description={`${((data.totalRecruiters / Math.max(data.totalUsers, 1)) * 100).toFixed(1)}% of users`}
          gradient="from-amber-500/10 via-amber-500/5 to-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 ">
        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-brand/30">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="size-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <TrendingUpIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-heading">Applications</h2>
              <p className="text-[11px] text-text-muted">Last 14 days</p>
            </div>
          </div>
          {data.applicationsLast14Days.length === 0 ? (
            <p className="text-text-muted text-sm py-12 text-center">No applications yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.applicationsLast14Days}>
                <defs>
                  <linearGradient id="appGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border-subtle)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  tickFormatter={(val: string) => {
                    const d = new Date(val + "T00:00:00");
                    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  allowDecimals={false}
                />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "var(--color-bg-surface)" }}
                  activeDot={{
                    r: 6,
                    fill: "#3b82f6",
                    strokeWidth: 2,
                    stroke: "var(--color-bg-surface)",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-brand/30">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="size-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <UserPlusIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-heading">Signups</h2>
              <p className="text-[11px] text-text-muted">Last 14 days</p>
            </div>
          </div>
          {data.signupsLast14Days.length === 0 ? (
            <p className="text-text-muted text-sm py-12 text-center">No signups yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.signupsLast14Days}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border-subtle)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  tickFormatter={(val: string) => {
                    const d = new Date(val + "T00:00:00");
                    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  allowDecimals={false}
                />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "var(--color-bg-surface)" }}
                  activeDot={{
                    r: 6,
                    fill: "#10b981",
                    strokeWidth: 2,
                    stroke: "var(--color-bg-surface)",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-brand/30">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="size-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <ActivityIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-heading">Jobs by Work Mode</h2>
              <p className="text-[11px] text-text-muted">Distribution</p>
            </div>
          </div>
          {data.jobsByWorkMode.length === 0 ? (
            <p className="text-text-muted text-sm py-12 text-center">No jobs posted yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.jobsByWorkMode} barCategoryGap="20%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border-subtle)"
                  strokeOpacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="workMode"
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  tickFormatter={(val: string) => val.charAt(0).toUpperCase() + val.slice(1)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {data.jobsByWorkMode.map((entry) => (
                    <Rectangle
                      key={entry.workMode}
                      fill={WORKMODE_COLORS[entry.workMode] ?? "#6b7280"}
                      fillOpacity={0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-text-heading">Recent Signups</h2>
            <p className="text-[11px] text-text-muted mt-0.5">Latest users to join the platform</p>
          </div>
        </div>
        <DataTable
          columns={recentUserColumns}
          data={data.recentUsers}
          emptyMessage="No users signed up yet"
        />
      </div>
    </div>
  );
}
