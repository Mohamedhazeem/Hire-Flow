"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterIcon, RotateCcwIcon } from "lucide-react";
import { APPLICATION_STATUSES } from "../../schema/application.schema";
import { CHART_COLORS } from "../../schema/analytics.schema";
import { cn } from "@/lib/utils";

type AnalyticsFilterBarProps = {
  jobOptions?: Array<{ id: string; title: string }>;
  showJobFilter?: boolean;
};

function StatusDot({ status }: { status: string }) {
  const color = CHART_COLORS[status] ?? "#6b7280";
  return (
    <span
      className="inline-block size-2 rounded-full shrink-0 bg-(--dot-color)"
      style={{ "--dot-color": color } as React.CSSProperties}
    />
  );
}

export function AnalyticsFilterBar({ jobOptions, showJobFilter }: AnalyticsFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentJobId = searchParams.get("jobId") ?? "";
  const currentDateFrom = searchParams.get("dateFrom") ?? "";
  const currentDateTo = searchParams.get("dateTo") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentWorkMode = searchParams.get("workMode") ?? "";
  const currentEmploymentType = searchParams.get("employmentType") ?? "";
  const currentLocation = searchParams.get("location") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const clearFilters = useCallback(() => {
    router.push("?", { scroll: false });
  }, [router]);

  const toggleMultiValue = useCallback(
    (key: string, value: string) => {
      const current = searchParams.get(key) ?? "";
      const values = current ? current.split(",").filter(Boolean) : [];
      const idx = values.indexOf(value);
      if (idx >= 0) {
        values.splice(idx, 1);
      } else {
        values.push(value);
      }
      updateParam(key, values.join(","));
    },
    [searchParams, updateParam],
  );

  const hasFilters =
    currentDateFrom ||
    currentDateTo ||
    currentStatus ||
    currentWorkMode ||
    currentEmploymentType ||
    currentLocation ||
    currentJobId;

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-4 sm:p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <FilterIcon className="size-4 text-text-muted" />
        <span className="text-xs font-semibold text-text-heading uppercase tracking-wider">
          Filters
        </span>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-heading transition-colors"
          >
            <RotateCcwIcon className="size-3" />
            Clear
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 items-end">
        {showJobFilter && jobOptions && (
          <div className="w-full">
            <label className="block text-[11px] font-medium text-text-muted mb-1">Job</label>
            <select
              value={currentJobId}
              onChange={(e) => updateParam("jobId", e.target.value)}
              className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm text-text-body focus:outline-none focus:ring-2 focus:ring-brand/30"
              aria-label="Select job"
            >
              <option value="">All Jobs</option>
              {jobOptions.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="w-full">
          <label className="block text-[11px] font-medium text-text-muted mb-1">From</label>
          <input
            type="date"
            value={currentDateFrom}
            onChange={(e) => updateParam("dateFrom", e.target.value)}
            className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm text-text-body focus:outline-none focus:ring-2 focus:ring-brand/30"
            aria-label="Select start date"
          />
        </div>

        <div className="w-full">
          <label className="block text-[11px] font-medium text-text-muted mb-1">To</label>
          <input
            type="date"
            value={currentDateTo}
            onChange={(e) => updateParam("dateTo", e.target.value)}
            className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm text-text-body focus:outline-none focus:ring-2 focus:ring-brand/30"
            aria-label="Select end date"
          />
        </div>

        <div className="w-full">
          <label className="block text-[11px] font-medium text-text-muted mb-1">Status</label>
          <div className="flex flex-wrap gap-1.5">
            {APPLICATION_STATUSES.map((status) => {
              const selected = currentStatus.split(",").includes(status);
              return (
                <button
                  key={status}
                  onClick={() => toggleMultiValue("status", status)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-all",
                    selected
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border text-text-muted hover:border-border-subtle hover:text-text-body",
                  )}
                >
                  <StatusDot status={status} />
                  <span className="capitalize">{status.replace(/_/g, " ")}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full">
          <label className="block text-[11px] font-medium text-text-muted mb-1">Work Mode</label>
          <select
            value={currentWorkMode}
            onChange={(e) => updateParam("workMode", e.target.value)}
            className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm text-text-body focus:outline-none focus:ring-2 focus:ring-brand/30"
            aria-label="Select work mode"
          >
            <option value="">All</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
        </div>

        <div className="w-full">
          <label className="block text-[11px] font-medium text-text-muted mb-1">Type</label>
          <select
            value={currentEmploymentType}
            onChange={(e) => updateParam("employmentType", e.target.value)}
            className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm text-text-body focus:outline-none focus:ring-2 focus:ring-brand/30"
            aria-label="Select employment type"
          >
            <option value="">All</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        <div className="w-full">
          <label className="block text-[11px] font-medium text-text-muted mb-1">Location</label>
          <input
            type="text"
            value={currentLocation}
            onChange={(e) => updateParam("location", e.target.value)}
            placeholder="e.g. New York"
            className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm text-text-body placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </div>
    </div>
  );
}
