"use client";

import { useAdminDashboard } from "@/app/features/admin/hooks/use-admin-dashboard";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
};

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <div className="rounded-radius-lg border border-border-subtle bg-bg-surface p-5 flex items-start gap-4">
      <div className="size-10 rounded-radius-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-muted">{title}</p>
        <p className="text-2xl font-bold text-text-heading mt-1">{value}</p>
        {description && <p className="text-xs text-text-muted mt-1">{description}</p>}
      </div>
    </div>
  );
}

const WORKMODE_COLORS: Record<string, string> = {
  remote: "#3b82f6",
  hybrid: "#8b5cf6",
  onsite: "#f59e0b",
};

export function AdminDashboard() {
  const { data, isLoading, isError } = useAdminDashboard();

  if (isLoading) {
    return <div className="text-text-muted text-sm py-12 text-center">Loading dashboard...</div>;
  }

  if (isError || !data) {
    return (
      <div className="text-destructive text-sm py-12 text-center">
        Failed to load dashboard data.
      </div>
    );
  }

  const recentUserColumns: ColumnDef<(typeof data.recentUsers)[number]>[] = [
    {
      key: "name",
      header: "Name",
      cell: (row) => <span className="font-medium text-text-heading">{row.name ?? "—"}</span>,
    },
    {
      key: "email",
      header: "Email",
      cell: (row) => <span className="text-text-body text-sm">{row.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      cell: (row) => (
        <Badge variant={row.role === "recruiter" ? "default" : "secondary"}>{row.role}</Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      cell: (row) => (
        <span className="text-text-muted text-xs whitespace-nowrap">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const recentAppColumns: ColumnDef<(typeof data.recentApplications)[number]>[] = [
    {
      key: "jobTitle",
      header: "Job",
      cell: (row) => (
        <span className="font-medium text-text-heading max-w-50 truncate block">
          {row.jobTitle}
        </span>
      ),
    },
    {
      key: "userName",
      header: "Applicant",
      cell: (row) => <span className="text-text-body">{row.userName ?? "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <Badge
          variant={
            row.status === "accepted"
              ? "default"
              : row.status === "rejected"
                ? "destructive"
                : "secondary"
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: "appliedAt",
      header: "Applied",
      cell: (row) => (
        <span className="text-text-muted text-xs whitespace-nowrap">
          {new Date(row.appliedAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-heading">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">Platform overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={data.totalUsers}
          icon={<UsersIcon className="size-5" />}
          description={`${data.totalRecruiters} recruiters`}
        />
        <StatCard
          title="Total Jobs"
          value={data.totalJobs}
          icon={<BriefcaseIcon className="size-5" />}
          description={`${data.activeJobs} active`}
        />
        <StatCard
          title="Applications"
          value={data.totalApplications}
          icon={<FileTextIcon className="size-5" />}
        />
        <StatCard
          title="Recruiters"
          value={data.totalRecruiters}
          icon={<UserCogIcon className="size-5" />}
          description={`${((data.totalRecruiters / Math.max(data.totalUsers, 1)) * 100).toFixed(1)}% of users`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-radius-lg border border-border-subtle bg-bg-surface p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUpIcon className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-text-heading">Applications (Last 14 Days)</h2>
          </div>
          {data.applicationsLast14Days.length === 0 ? (
            <p className="text-text-muted text-sm py-8 text-center">
              No applications in the last 14 days.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.applicationsLast14Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle, #e5e7eb)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--color-text-muted, #9ca3af)" }}
                  tickFormatter={(val: string) => {
                    const d = new Date(val + "T00:00:00");
                    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-text-muted, #9ca3af)" }}
                  allowDecimals={false}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#3b82f6" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-radius-lg border border-border-subtle bg-bg-surface p-5">
          <div className="flex items-center gap-2 mb-4">
            <ActivityIcon className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-text-heading">Jobs by Work Mode</h2>
          </div>
          {data.jobsByWorkMode.length === 0 ? (
            <p className="text-text-muted text-sm py-8 text-center">No jobs posted yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.jobsByWorkMode}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle, #e5e7eb)" />
                <XAxis
                  dataKey="workMode"
                  tick={{ fontSize: 11, fill: "var(--color-text-muted, #9ca3af)" }}
                  tickFormatter={(val: string) => val.charAt(0).toUpperCase() + val.slice(1)}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-text-muted, #9ca3af)" }}
                  allowDecimals={false}
                />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.jobsByWorkMode.map((entry) => (
                    <Rectangle
                      key={entry.workMode}
                      fill={WORKMODE_COLORS[entry.workMode] ?? "#6b7280"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-text-heading mb-3">Recent Signups</h2>
        <DataTable
          columns={recentUserColumns}
          data={data.recentUsers}
          emptyMessage="No users signed up yet."
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-text-heading mb-3">Recent Applications</h2>
        <DataTable
          columns={recentAppColumns}
          data={data.recentApplications}
          emptyMessage="No applications yet."
        />
      </div>
    </div>
  );
}
