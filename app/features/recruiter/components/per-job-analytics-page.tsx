"use client";

import { useSearchParams } from "next/navigation";
import { useJobAnalytics } from "../hooks/use-analytics";
import { StatCard } from "@/components/ui/stat-card";
import { TrendChart } from "./charts/trend-chart";
import { DistributionBarChart } from "./charts/distribution-bar-chart";
import { FunnelChart } from "./charts/funnel-chart";
import { CHART_COLORS } from "../schema/analytics.schema";
import { FileTextIcon, TrendingUpIcon, ClockIcon, BarChart3Icon } from "lucide-react";
import type { AnalyticsFilter, AnalyticsResponse } from "../schema/analytics.schema";

type PerJobAnalyticsPageProps = {
  jobId: string;
};

function filterFromParams(params: URLSearchParams): AnalyticsFilter {
  const f: AnalyticsFilter = {};
  const dateFrom = params.get("dateFrom");
  const dateTo = params.get("dateTo");
  if (dateFrom) f.dateFrom = dateFrom;
  if (dateTo) f.dateTo = dateTo;
  return f;
}

function statusBarData(data: AnalyticsResponse) {
  const statusMap = new Map((data.applicationsByStatus ?? []).map((s) => [s.stage, s.count]));
  return (Object.entries(CHART_COLORS) as Array<[string, string]>)
    .filter(([key]) => statusMap.has(key))
    .map(([key, color]) => ({
      label: key.replace(/_/g, " "),
      value: statusMap.get(key) ?? 0,
      color,
    }));
}

export function PerJobAnalyticsPage({ jobId }: PerJobAnalyticsPageProps) {
  const searchParams = useSearchParams();
  const filter = filterFromParams(searchParams);

  const { data, isLoading, isError } = useJobAnalytics(jobId, filter);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-bg-surface border border-border-subtle animate-pulse"
            />
          ))}
        </div>
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            <p className="text-text-muted text-sm">Loading job analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="size-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-3">
            <BarChart3Icon className="size-6 text-error" />
          </div>
          <p className="text-destructive text-sm font-medium">Failed to load analytics</p>
          <p className="text-text-muted text-xs mt-1">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Applications"
          value={data.summary.totalApplications}
          icon={<FileTextIcon className="size-5" />}
          gradient="from-purple-500/10 via-purple-500/5 to-transparent"
        />
        <StatCard
          title="Hired"
          value={data.summary.totalHired}
          icon={<TrendingUpIcon className="size-5" />}
          gradient="from-emerald-500/10 via-emerald-500/5 to-transparent"
        />
        <StatCard
          title="Avg Fulfillment"
          value={
            data.summary.avgFulfillmentDays !== null ? `${data.summary.avgFulfillmentDays}d` : "—"
          }
          icon={<ClockIcon className="size-5" />}
          description={
            data.summary.avgFulfillmentDays !== null ? "Avg days to hire" : "No hires yet"
          }
          gradient="from-amber-500/10 via-amber-500/5 to-transparent"
        />
      </div>

      <AnalyticsFilterBarPerJob />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        <TrendChart
          data={data.applicationTrend ?? []}
          color="#3b82f6"
          title="Applications Trend"
          subtitle={`${data.dateRange.from} to ${data.dateRange.to}`}
          gradientId="jobAppTrendGradient"
          emptyMessage="No applications in this period"
        />
        <DistributionBarChart
          data={statusBarData(data)}
          colorMap={Object.fromEntries(
            (Object.entries(CHART_COLORS) as Array<[string, string]>).map(([k, v]) => [
              k.replace(/_/g, " "),
              v,
            ]),
          )}
          title="Applications by Status"
          emptyMessage="No applications yet"
        />
      </div>

      <FunnelChart
        current={data.funnelCurrent ?? []}
        historical={data.funnelHistorical ?? []}
        emptyMessage="No pipeline data available"
      />
    </div>
  );
}

function AnalyticsFilterBarPerJob() {
  const searchParams = useSearchParams();

  const currentDateFrom = searchParams.get("dateFrom") ?? "";
  const currentDateTo = searchParams.get("dateTo") ?? "";

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:w-36">
          <label className="block text-[11px] font-medium text-text-muted mb-1">From</label>
          <input
            type="date"
            value={currentDateFrom}
            aria-label="Date from"
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              if (e.target.value) params.set("dateFrom", e.target.value);
              else params.delete("dateFrom");
              window.history.replaceState(null, "", `?${params.toString()}`);
            }}
            className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm text-text-body focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div className="w-full sm:w-36">
          <label className="block text-[11px] font-medium text-text-muted mb-1">To</label>
          <input
            type="date"
            value={currentDateTo}
            aria-label="Date to"
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              if (e.target.value) params.set("dateTo", e.target.value);
              else params.delete("dateTo");
              window.history.replaceState(null, "", `?${params.toString()}`);
            }}
            className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm text-text-body focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </div>
    </div>
  );
}
