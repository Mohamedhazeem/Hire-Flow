"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FilterIcon,
  RotateCcwIcon,
  ChevronDownIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { cn } from "@/lib/utils";
import { DesktopFilters } from "./desktop-filters";
import { MobileFilters } from "./mobile-filters";

type AnalyticsFilterBarProps = {
  jobOptions?: Array<{ id: string; title: string }>;
  showJobFilter?: boolean;
};

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

  const hasFilters = !!(currentDateFrom || currentDateTo || currentStatus || currentWorkMode || currentEmploymentType || currentLocation || currentJobId);

  const jobDropdownOptions = jobOptions?.map((j) => ({ value: j.id, label: j.title })) || [];

  return (
    <div className="flex flex-col justify-center rounded-xl border border-border-subtle bg-bg-surface p-3 shadow-sm sm:p-4">
      <div className="flex flex-row gap-1.5 h-9 items-center text-text-muted shrink-0">
        <div className="size-11 rounded-xl shrink-0 flex items-center justify-center bg-linear-to-br from-brand/10 via-brand/5 to-transparent text-brand">
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

          <DesktopFilters
            showJobFilter={!!showJobFilter}
            jobOptions={jobDropdownOptions}
            currentJobId={currentJobId}
            activeStatusArray={activeStatusArray}
            currentWorkMode={currentWorkMode}
            currentEmploymentType={currentEmploymentType}
            currentLocation={currentLocation}
            onUpdateParam={updateParam}
            onToggleMultiValue={toggleMultiValue}
          />

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

      <MobileFilters
        showJobFilter={!!showJobFilter}
        jobOptions={jobOptions ?? []}
        currentJobId={currentJobId}
        activeStatusArray={activeStatusArray}
        currentWorkMode={currentWorkMode}
        currentEmploymentType={currentEmploymentType}
        currentLocation={currentLocation}
        hasFilters={!!hasFilters}
        isExpanded={isMobileExpanded}
        onUpdateParam={updateParam}
        onToggleMultiValue={toggleMultiValue}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
