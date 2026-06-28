"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RotateCcwIcon,
  ChevronDownIcon,
  MapPinIcon,
  SlidersHorizontalIcon,
  CheckIcon,
  XIcon,
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

// Sub-component: Status Dot
function StatusDot({ status }: { status: string }) {
  const color = CHART_COLORS[status] ?? "#6b7280";
  return (
    <span
      className="inline-block size-2 rounded-full shrink-0"
      style={{ backgroundColor: color }}
    />
  );
}

// Sub-component: Active Badge Counter
function ActiveBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-1.5 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
      {count}
    </span>
  );
}

// Sub-component: Consistent Dropdown Trigger
const DropdownTrigger = ({
  label,
  isActive,
  badgeCount = 0,
}: {
  label: string;
  isActive: boolean;
  badgeCount?: number;
}) => (
  <div
    className={cn(
      "group flex h-9 w-full sm:w-auto cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 text-sm transition-all hover:bg-bg-subtle",
      isActive
        ? "border-brand/50 bg-brand/5 text-brand dark:border-brand/30"
        : "border-border bg-background text-text-body dark:border-border/60",
    )}
  >
    <span className="truncate max-w-30">{label}</span>
    {badgeCount > 0 && <ActiveBadge count={badgeCount} />}
    <ChevronDownIcon className="size-3.5 shrink-0 opacity-50 transition-transform group-data-[state=open]:rotate-180" />
  </div>
);

// Sub-component: Unified Single Select
function SingleSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <Popover>
      <PopoverTrigger className="w-full sm:w-auto text-left outline-none">
        <DropdownTrigger label={selectedLabel ?? label} isActive={!!value} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-50 p-1">
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => onChange("")}
            className={cn(
              "flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-bg-subtle",
              !value && "bg-brand/10 text-brand font-medium",
            )}
          >
            All {label}s
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-bg-subtle",
                value === option.value ? "bg-brand/10 text-brand font-medium" : "text-text-body",
              )}
            >
              {option.label}
              {value === option.value && <CheckIcon className="size-3.5" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Sub-component: Unified Multi Select (For Status)
function MultiSelect({
  label,
  values,
  options,
  onToggle,
}: {
  label: string;
  values: string[];
  options: Array<{ value: string; label: string; dot?: boolean }>;
  onToggle: (value: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger className="w-full sm:w-auto text-left outline-none">
        <DropdownTrigger label={label} isActive={values.length > 0} badgeCount={values.length} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-55 p-1">
        <div className="flex flex-col gap-0.5 max-h-75 overflow-y-auto">
          {options.map((option) => {
            const isSelected = values.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => onToggle(option.value)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-bg-subtle",
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
                {option.dot && <StatusDot status={option.value} />}
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Main Component
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

  // Formatting options for sub-components
  const jobDropdownOptions = jobOptions?.map((j) => ({ value: j.id, label: j.title })) || [];
  const statusOptions = APPLICATION_STATUSES.map((s) => ({
    value: s,
    label: s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    dot: true,
  }));

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-bg-surface p-3 shadow-sm transition-all sm:p-4">
      {/* Top Row: Core Controls & Mobile Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <DateRangePicker
            value={{ from: currentDateFrom || undefined, to: currentDateTo || undefined }}
            onChange={handleDateRangeChange}
            placeholder="Select date range"
            className="w-full sm:w-[240px]"
          />

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="flex h-9 w-full sm:hidden items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-text-body transition-colors hover:bg-bg-subtle"
          >
            <SlidersHorizontalIcon className="size-4" />
            Filters {hasFilters ? <ActiveBadge count={1} /> : null}
            <ChevronDownIcon
              className={cn(
                "size-4 ml-auto transition-transform",
                isMobileExpanded && "rotate-180",
              )}
            />
          </button>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-text-muted transition-colors hover:bg-bg-subtle hover:text-text-heading"
          >
            <RotateCcwIcon className="size-3.5" />
            Clear filters
          </button>
        )}
      </div>

      {/* Expandable/Responsive Filters Row */}
      <div
        className={cn(
          "flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 overflow-hidden transition-all duration-300 ease-in-out",
          isMobileExpanded
            ? "max-h-125 opacity-100 mt-2"
            : "max-h-0 opacity-0 sm:max-h-25 sm:opacity-100 sm:mt-0",
        )}
      >
        {showJobFilter && jobOptions && (
          <SingleSelect
            label="Job"
            value={currentJobId}
            options={jobDropdownOptions}
            onChange={(v) => updateParam("jobId", v)}
          />
        )}

        <MultiSelect
          label="Status"
          values={activeStatusArray}
          options={statusOptions}
          onToggle={(v) => toggleMultiValue("status", v)}
        />

        <SingleSelect
          label="Work Mode"
          value={currentWorkMode}
          options={[
            { value: "remote", label: "Remote" },
            { value: "hybrid", label: "Hybrid" },
            { value: "onsite", label: "Onsite" },
          ]}
          onChange={(v) => updateParam("workMode", v)}
        />

        <SingleSelect
          label="Type"
          value={currentEmploymentType}
          options={[
            { value: "full_time", label: "Full Time" },
            { value: "part_time", label: "Part Time" },
            { value: "contract", label: "Contract" },
            { value: "internship", label: "Internship" },
          ]}
          onChange={(v) => updateParam("employmentType", v)}
        />

        {/* Location Input wrapped to match pill aesthetic */}
        <div
          className={cn(
            "group relative flex h-9 w-full sm:w-45 items-center rounded-lg border transition-all focus-within:ring-2 focus-within:ring-brand/30",
            currentLocation
              ? "border-brand/50 bg-brand/5 dark:border-brand/30"
              : "border-border bg-background hover:bg-bg-subtle",
          )}
        >
          <MapPinIcon
            className={cn(
              "absolute left-3 size-3.5 pointer-events-none transition-colors",
              currentLocation ? "text-brand" : "text-text-muted",
            )}
          />
          <input
            type="text"
            value={currentLocation}
            onChange={(e) => updateParam("location", e.target.value)}
            placeholder="Location..."
            className="h-full w-full bg-transparent pl-8 pr-8 text-sm text-text-body placeholder:text-text-muted/70 focus:outline-none"
          />
          {currentLocation && (
            <button
              onClick={() => updateParam("location", "")}
              aria-label="location filter"
              className="absolute right-2 flex size-5 items-center justify-center rounded-full text-text-muted hover:bg-black/10 hover:text-text-heading dark:hover:bg-white/10"
            >
              <XIcon className="size-3" />
            </button>
          )}
        </div>

        {/* Clear filters button inside mobile view */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="sm:hidden mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-bg-subtle px-3 text-sm font-medium text-text-heading transition-colors"
          >
            <RotateCcwIcon className="size-3.5" />
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
