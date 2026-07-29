"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import type { ApiResponse } from "@/lib/api/api-response";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { BarChart3Icon, FileTextIcon, BriefcaseIcon, TrendingUpIcon, ClockIcon } from "lucide-react";
import { TrendChart } from "./charts/trend-chart";
import { DistributionBarChart } from "./charts/distribution-bar-chart";
import { FunnelChart } from "./charts/funnel-chart";
import { AnalyticsFilterBar } from "./filters/analytics-filter-bar";
import { AnalyticsStatRow } from "@/components/shared/analytics-stat-row";
import { CHART_COLORS } from "../schema/analytics.schema";
import type { AnalyticsFilter, AnalyticsResponse, JobBreakdownRow } from "../schema/analytics.schema";

function filterFromParams(params: URLSearchParams): AnalyticsFilter {
  const f: AnalyticsFilter = {};
  for (const key of ["jobId", "dateFrom", "dateTo", "status", "workMode", "employmentType", "location"] as const) {
    const v = params.get(key);
    if (v) (f as Record<string, string>)[key] = v;
  }
  return f;
}

function statusBarData(data: AnalyticsResponse) {
  const statusMap = new Map(data.applicationsByStatus.map((s) => [s.stage, s.count]));
  return (Object.entries(CHART_COLORS) as Array<[string, string]>)
    .filter(([key]) => statusMap.has(key))
    .map(([key, color]) => ({
      label: key.replace(/_/g, " "),
      value: statusMap.get(key) ?? 0,
      color,
    }));
}

function workModeBarData(data: AnalyticsResponse) {
  return data.applicationsByWorkMode.map((w) => ({
    label: w.workMode.charAt(0).toUpperCase() + w.workMode.slice(1),
    value: w.count,
  }));
}

function employmentTypeBarData(data: AnalyticsResponse) {
  return data.applicationsByEmploymentType.map((e) => ({
    label: e.employmentType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value: e.count,
  }));
}

const jobBreakdownColumns: ColumnDef<JobBreakdownRow>[] = [
  {
    key: "title",
    header: "Job Title",
    cell: (row) => <span className="font-medium text-text-heading text-sm">{row.title}</span>,
  },
  {
    key: "totalApplications",
    header: "Applications",
    align: "center",
    cell: (row) => <span className="text-text-body text-sm tabular-nums">{row.totalApplications}</span>,
  },
  {
    key: "hired",
    header: "Hired",
    align: "center",
    cell: (row) => <span className="text-text-body text-sm tabular-nums">{row.hired}</span>,
  },
  {
    key: "conversionRate",
    header: "Conv. %",
    align: "center",
    cell: (row) => <span className="text-text-body text-sm tabular-nums">{row.conversionRate.toFixed(1)}%</span>,
  },
  {
    key: "avgFulfillmentDays",
    header: "Avg Days",
    align: "center",
    cell: (row) => (
      <span className="text-text-body text-sm tabular-nums">
        {row.avgFulfillmentDays !== null ? `${row.avgFulfillmentDays}` : "—"}
      </span>
    ),
  },
  {
    key: "viewCount",
    header: "Views",
    align: "center",
    cell: (row) => <span className="text-text-body text-sm tabular-nums">{row.viewCount}</span>,
  },
];

export function RecruiterAnalyticsPage() {
  const searchParams = useSearchParams();
  const filter = filterFromParams(searchParams);

  const { data, isLoading, isError } = useQuery<AnalyticsResponse>({
    queryKey: ["recruiter", "analytics", filter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      for (const [k, v] of Object.entries(filter)) {
        if (v) params[k] = v;
      }
      const res = await apiClient<ApiResponse<AnalyticsResponse>>("/api/recruiter/analytics", {
        params,
      });
      return res.data;
    },
  });

  const { data: jobList } = useQuery<ApiResponse<{ jobs: Array<{ id: string; title: string }> }>>({
    queryKey: ["recruiter", "jobs", "list"],
    queryFn: () => apiClient("/api/recruiter/jobs", { params: { pageSize: "100" } }),
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Analytics"
          description="Recruiter analytics and insights"
          icon={<BarChart3Icon className="size-5" />}
        />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            <p className="text-text-muted text-sm">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Analytics"
          description="Recruiter analytics and insights"
          icon={<BarChart3Icon className="size-5" />}
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="size-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-3">
              <BarChart3Icon className="size-6 text-error" />
            </div>
            <p className="text-destructive text-sm font-medium">Failed to load analytics data</p>
            <p className="text-text-muted text-xs mt-1">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  const jobOptions = jobList?.data?.jobs?.map((j) => ({ id: j.id, title: j.title })) ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Company-wide recruiting metrics and insights"
        icon={<BarChart3Icon className="size-5" />}
      />
      <AnalyticsFilterBar jobOptions={jobOptions} showJobFilter />

      <AnalyticsStatRow
        items={[
          {
            title: "Total Applications",
            value: data.summary.totalApplications,
            icon: <FileTextIcon className="size-5" />,
            gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
          },
          {
            title: "Active Jobs",
            value: data.summary.totalJobs,
            icon: <BriefcaseIcon className="size-5" />,
            gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
          },
          {
            title: "Conversion Rate",
            value: `${data.summary.conversionRate.toFixed(1)}%`,
            icon: <TrendingUpIcon className="size-5" />,
            gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
          },
          {
            title: "Avg Fulfillment",
            value: data.summary.avgFulfillmentDays !== null ? `${data.summary.avgFulfillmentDays}d` : "—",
            icon: <ClockIcon className="size-5" />,
            description: data.summary.avgFulfillmentDays !== null ? "Avg days to hire" : "No hires yet",
            gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        <TrendChart
          data={data.applicationTrend}
          color="#3b82f6"
          title="Applications Trend"
          subtitle={`${data.dateRange.from} to ${data.dateRange.to}`}
          gradientId="appTrendGradient"
          emptyMessage="No applications in this period"
        />
        <DistributionBarChart
          data={statusBarData(data)}
          colorMap={Object.fromEntries(
            (Object.entries(CHART_COLORS) as Array<[string, string]>).map(([k, v]) => [k.replace(/_/g, " "), v]),
          )}
          title="Applications by Status"
          emptyMessage="No applications yet"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        <FunnelChart
          current={data.funnelCurrent}
          historical={data.funnelHistorical}
          emptyMessage="No pipeline data available"
        />
        <div className="flex flex-col gap-3">
          <DistributionBarChart
            data={workModeBarData(data)}
            colorMap={{ Remote: "#22c55e", Hybrid: "#a855f7", Onsite: "#f97316" }}
            title="Applications by Work Mode"
            emptyMessage="No applications yet"
          />
          <DistributionBarChart
            data={employmentTypeBarData(data)}
            colorMap={{
              "Full Time": "#3b82f6",
              "Part Time": "#f59e0b",
              Contract: "#a855f7",
              Internship: "#06b6d4",
            }}
            title="Applications by Employment Type"
            emptyMessage="No applications yet"
          />
        </div>
      </div>

      {data.jobBreakdown.length > 0 && (
        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6 shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-text-heading">Per-Job Breakdown</h2>
            <p className="text-[11px] text-text-muted mt-0.5">Metrics across all your job postings</p>
          </div>
          <DataTable columns={jobBreakdownColumns} data={data.jobBreakdown} emptyMessage="No jobs found" />
        </div>
      )}
    </div>
  );
}
