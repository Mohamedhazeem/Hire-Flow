"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FilterIcon,
  RotateCcwIcon,
  ChevronDownIcon,
  SlidersHorizontalIcon,
  CheckIcon,
  XIcon,
  BriefcaseIcon,
  WorkflowIcon,
  GlobeIcon,
  ClockIcon,
  MapPinIcon,
} from "lucide-react";
import { APPLICATION_STATUSES } from "../../schema/application.schema";
import { CHART_COLORS } from "../../schema/analytics.schema";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type AnalyticsFilterBarProps = {
  jobOptions?: Array<{ id: string; title: string }>;
  showJobFilter?: boolean;
};

function StatusDot({ status }: { status: string }) {
  const color = CHART_COLORS[status] ?? "#6b7280";
  return (
    <span
      className="inline-block size-2 rounded-full shrink-0"
      style={{ backgroundColor: color }}
    />
  );
}

function FilterButton({
  icon,
  label,
  isActive,
  badgeCount,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  badgeCount?: number;
  children?: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger className="outline-none" aria-label={label}>
        <div
          className={cn(
            "relative flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 transition-all",
            isActive
              ? "border-brand/50 bg-brand/5 text-brand"
              : "border-border bg-background text-text-muted hover:border-border-strong hover:text-text-body hover:bg-bg-subtle dark:border-border/60",
          )}
          title={label}
        >
          {icon}
          <span className="text-xs font-medium">{label}</span>
          {badgeCount !== undefined && badgeCount > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
              {badgeCount}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" sideOffset={6} className="w-52 p-1">
        {children}
      </PopoverContent>
    </Popover>
  );
}

export function AnalyticsFilterBar({ jobOptions, showJobFilter }: AnalyticsFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const currentJobId = searchParams.get("jobId") ?? "";
  const currentDateFrom = searchParams.get("dateFrom") ?? "";
  const currentDateTo = searchParams.get("dateTo") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentWorkMode = searchParams.get("workMode") ?? "";
  const currentEmploymentType = searchParams.get("employmentType") ?? "";
  const currentLocation = searchParams.get("location") ?? "";

  const activeStatusArray = currentStatus ? currentStatus.split(",").filter(Boolean) : [];

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
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
      if (idx >= 0) values.splice(idx, 1);
      else values.push(value);
      updateParam(key, values.join(","));
    },
    [searchParams, updateParam],
  );

  const handleDateRangeChange = useCallback(
    (range: { from?: string; to?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (range.from) params.set("dateFrom", range.from);
      else params.delete("dateFrom");
      if (range.to) params.set("dateTo", range.to);
      else params.delete("dateTo");
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const hasFilters =
    currentDateFrom ||
    currentDateTo ||
    currentStatus ||
    currentWorkMode ||
    currentEmploymentType ||
    currentLocation ||
    currentJobId;

  const jobDropdownOptions = jobOptions?.map((j) => ({ value: j.id, label: j.title })) || [];
  const statusOptions = APPLICATION_STATUSES.map((s) => ({
    value: s,
    label: s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  }));

  return (
    <div className="flex flex-col justify-center rounded-xl border border-border-subtle bg-bg-surface p-3 shadow-sm sm:p-4">
      <div className="flex flex-row gap-1.5 h-9 items-center text-text-muted shrink-0">
        <div
          className="size-11 rounded-xl shrink-0 flex items-center justify-center 
            bg-linear-to-br
            from-brand/10 via-brand/5 to-transparent
            text-brand"
        >
          <FilterIcon className="size-3.5" />
        </div>
        <span className="text-sm font-semibold text-text-heading">Filters</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <DateRangePicker
            value={{ from: currentDateFrom || undefined, to: currentDateTo || undefined }}
            onChange={handleDateRangeChange}
            placeholder="Date range"
            className="w-full sm:w-52"
          />

          <div className="hidden sm:flex items-center gap-3">
            {showJobFilter && jobOptions && (
              <FilterButton
                icon={<BriefcaseIcon className="size-4" />}
                label="Job"
                isActive={!!currentJobId}
              >
                <button
                  onClick={() => updateParam("jobId", "")}
                  className={cn(
                    "flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-bg-elevated",
                    !currentJobId && "bg-brand/10 text-brand font-medium",
                  )}
                >
                  All Jobs
                </button>
                {jobDropdownOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateParam("jobId", option.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-bg-elevated",
                      currentJobId === option.value
                        ? "bg-brand/10 text-brand font-medium"
                        : "text-text-body",
                    )}
                  >
                    {option.label}
                    {currentJobId === option.value && <CheckIcon className="size-3.5" />}
                  </button>
                ))}
              </FilterButton>
            )}

            <FilterButton
              icon={<WorkflowIcon className="size-4" />}
              label="Status"
              isActive={activeStatusArray.length > 0}
              badgeCount={activeStatusArray.length}
            >
              {statusOptions.map((option) => {
                const isSelected = activeStatusArray.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleMultiValue("status", option.value)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-bg-elevated",
                      isSelected ? "bg-brand/10 text-brand font-medium" : "text-text-body",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border text-white transition-colors",
                        isSelected ? "border-brand bg-brand" : "border-border-strong",
                      )}
                    >
                      {isSelected && <CheckIcon className="size-3" />}
                    </div>
                    <StatusDot status={option.value} />
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })}
            </FilterButton>

            <FilterButton
              icon={<GlobeIcon className="size-4" />}
              label="Work Mode"
              isActive={!!currentWorkMode}
            >
              <button
                onClick={() => updateParam("workMode", "")}
                className={cn(
                  "flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-bg-elevated",
                  !currentWorkMode && "bg-brand/10 text-brand font-medium",
                )}
              >
                All
              </button>
              {[
                { value: "remote", label: "Remote" },
                { value: "hybrid", label: "Hybrid" },
                { value: "onsite", label: "Onsite" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateParam("workMode", option.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-bg-elevated",
                    currentWorkMode === option.value
                      ? "bg-brand/10 text-brand font-medium"
                      : "text-text-body",
                  )}
                >
                  {option.label}
                  {currentWorkMode === option.value && <CheckIcon className="size-3.5" />}
                </button>
              ))}
            </FilterButton>

            <FilterButton
              icon={<ClockIcon className="size-4" />}
              label="Type"
              isActive={!!currentEmploymentType}
            >
              <button
                onClick={() => updateParam("employmentType", "")}
                className={cn(
                  "flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-bg-elevated",
                  !currentEmploymentType && "bg-brand/10 text-brand font-medium",
                )}
              >
                All
              </button>
              {[
                { value: "full_time", label: "Full Time" },
                { value: "part_time", label: "Part Time" },
                { value: "contract", label: "Contract" },
                { value: "internship", label: "Internship" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateParam("employmentType", option.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-bg-elevated",
                    currentEmploymentType === option.value
                      ? "bg-brand/10 text-brand font-medium"
                      : "text-text-body",
                  )}
                >
                  {option.label}
                  {currentEmploymentType === option.value && <CheckIcon className="size-3.5" />}
                </button>
              ))}
            </FilterButton>

            <FilterButton
              icon={<MapPinIcon className="size-4" />}
              label="Location"
              isActive={!!currentLocation}
            >
              <div className="px-2 pt-1">
                <input
                  type="text"
                  autoFocus
                  value={currentLocation}
                  onChange={(e) => updateParam("location", e.target.value)}
                  placeholder="Enter location..."
                  className="w-full h-8 rounded-md border border-border bg-background px-2 text-sm text-text-body placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-border/60"
                />
              </div>
              {currentLocation && (
                <button
                  onClick={() => updateParam("location", "")}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-body"
                >
                  <XIcon className="size-3.5" />
                  Clear location
                </button>
              )}
            </FilterButton>
          </div>

          <button
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="flex h-9 w-full sm:hidden items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-text-body transition-colors hover:bg-bg-subtle"
          >
            <SlidersHorizontalIcon className="size-4" />
            Filters {hasFilters && <span className="text-brand font-bold">{">"}</span>}
            <ChevronDownIcon
              className={cn(
                "size-4 ml-auto transition-transform",
                isMobileExpanded && "rotate-180",
              )}
            />
          </button>
        </div>

        <button
          onClick={clearFilters}
          className="hidden sm:inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-text-muted transition-colors hover:bg-bg-subtle hover:text-text-heading"
        >
          <RotateCcwIcon className="size-3.5" />
          Clear
        </button>
      </div>

      <div
        className={cn(
          "flex flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out",
          isMobileExpanded ? "max-h-200 opacity-100" : "max-h-0 opacity-0 sm:max-h-0 sm:opacity-0",
        )}
      >
        {showJobFilter && jobOptions && (
          <div>
            <label className="block text-[11px] font-medium text-text-muted my-2">Job</label>
            <select
              value={currentJobId}
              onChange={(e) => updateParam("jobId", e.target.value)}
              className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm text-text-body focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-border/60"
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

        <div>
          <label className="block text-[11px] font-medium text-text-muted mb-1">Status</label>
          <div className="flex flex-wrap gap-1.5">
            {APPLICATION_STATUSES.map((status) => {
              const selected = activeStatusArray.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => toggleMultiValue("status", status)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-all",
                    selected
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border text-text-muted hover:border-border-subtle hover:text-text-body dark:border-border/60",
                  )}
                >
                  <StatusDot status={status} />
                  <span className="capitalize">{status.replace(/_/g, " ")}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-text-muted mb-1">Work Mode</label>
          <select
            value={currentWorkMode}
            onChange={(e) => updateParam("workMode", e.target.value)}
            aria-label="Select work mode"
            className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm text-text-body focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-border/60"
          >
            <option value="">All</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-text-muted mb-1">Type</label>
          <select
            value={currentEmploymentType}
            aria-label="Select employment type"
            onChange={(e) => updateParam("employmentType", e.target.value)}
            className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm text-text-body focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-border/60"
          >
            <option value="">All</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-text-muted mb-1">Location</label>
          <input
            type="text"
            value={currentLocation}
            onChange={(e) => updateParam("location", e.target.value)}
            placeholder="e.g. New York"
            className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm text-text-body placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-border/60"
          />
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-bg-subtle px-3 text-sm font-medium text-text-heading transition-colors"
          >
            <RotateCcwIcon className="size-3.5" />
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
