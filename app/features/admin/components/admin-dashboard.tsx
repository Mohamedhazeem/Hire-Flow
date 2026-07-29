"use client";

import { useAdminDashboard } from "@/app/features/admin/hooks/use-admin-dashboard";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardLoading } from "@/components/shared/dashboard-loading";
import { DashboardError } from "@/components/shared/dashboard-error";
import { ChartCard } from "@/components/shared/chart-card";
import { WorkModeBarChart } from "@/components/shared/workmode-bar-chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "var(--color-bg-surface)",
    border: "1px solid var(--color-border-subtle)",
    borderRadius: "12px",
    boxShadow: "var(--shadow-md)",
    fontSize: "12px",
  },
};

function LineChartCard({
  data,
  color,
}: {
  data: { date: string; count: number }[];
  color: string;
}) {
  if (data.length === 0)
    return <p className="text-text-muted text-sm py-12 text-center">No data yet</p>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border-subtle)"
          strokeOpacity={0.5}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
          tickFormatter={(val: string) =>
            new Date(val + "T00:00:00").toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })
          }
        />
        <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} allowDecimals={false} />
        <Tooltip {...CHART_TOOLTIP_STYLE} />
        <Line
          type="monotone"
          dataKey="count"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "var(--color-bg-surface)" }}
          activeDot={{ r: 6, fill: color, strokeWidth: 2, stroke: "var(--color-bg-surface)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function createRecentUserColumns(): ColumnDef<{
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
}>[] {
  return [
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
}

export function AdminDashboard() {
  const { data, isLoading, isError } = useAdminDashboard();

  if (isLoading) return <DashboardLoading />;
  if (isError || !data) return <DashboardError />;

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <ChartCard
          icon={<TrendingUpIcon className="size-4" />}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="Applications"
          subtitle="Last 14 days"
        >
          <LineChartCard data={data.applicationsLast14Days} color="#3b82f6" />
        </ChartCard>
        <ChartCard
          icon={<UserPlusIcon className="size-4" />}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-500"
          title="Signups"
          subtitle="Last 14 days"
        >
          <LineChartCard data={data.signupsLast14Days} color="#10b981" />
        </ChartCard>
        <ChartCard
          icon={<ActivityIcon className="size-4" />}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
          title="Jobs by Work Mode"
          subtitle="Distribution"
        >
          <WorkModeBarChart data={data.jobsByWorkMode} />
        </ChartCard>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-text-heading">Recent Signups</h2>
            <p className="text-[11px] text-text-muted mt-0.5">Latest users to join the platform</p>
          </div>
        </div>
        <DataTable
          columns={createRecentUserColumns()}
          data={data.recentUsers}
          emptyMessage="No users signed up yet"
        />
      </div>
    </div>
  );
}
