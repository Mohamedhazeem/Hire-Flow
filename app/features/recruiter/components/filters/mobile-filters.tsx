"use client";

import { cn } from "@/lib/utils";
import { APPLICATION_STATUSES } from "../../schema/application.schema";
import { StatusDot, WORK_MODE_OPTIONS, EMPLOYMENT_TYPE_OPTIONS } from "./filter-options";
import { RotateCcwIcon } from "lucide-react";

type MobileFiltersProps = {
  showJobFilter: boolean;
  jobOptions: { id: string; title: string }[];
  currentJobId: string;
  activeStatusArray: string[];
  currentWorkMode: string;
  currentEmploymentType: string;
  currentLocation: string;
  hasFilters: boolean;
  isExpanded: boolean;
  onUpdateParam: (key: string, value: string) => void;
  onToggleMultiValue: (key: string, value: string) => void;
  onClearFilters: () => void;
};

export function MobileFilters({
  showJobFilter,
  jobOptions,
  currentJobId,
  activeStatusArray,
  currentWorkMode,
  currentEmploymentType,
  currentLocation,
  hasFilters,
  isExpanded,
  onUpdateParam,
  onToggleMultiValue,
  onClearFilters,
}: MobileFiltersProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out",
        isExpanded ? "max-h-200 opacity-100" : "max-h-0 opacity-0 sm:max-h-0 sm:opacity-0",
      )}
    >
      {showJobFilter && (
        <div>
          <label className="block text-[11px] font-medium text-text-muted my-2">Job</label>
          <select
            value={currentJobId}
            onChange={(e) => onUpdateParam("jobId", e.target.value)}
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
                onClick={() => onToggleMultiValue("status", status)}
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
          onChange={(e) => onUpdateParam("workMode", e.target.value)}
          aria-label="Select work mode"
          className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm text-text-body focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-border/60"
        >
          <option value="">All</option>
          {WORK_MODE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-text-muted mb-1">Type</label>
        <select
          value={currentEmploymentType}
          aria-label="Select employment type"
          onChange={(e) => onUpdateParam("employmentType", e.target.value)}
          className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm text-text-body focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-border/60"
        >
          <option value="">All</option>
          {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-text-muted mb-1">Location</label>
        <input
          type="text"
          value={currentLocation}
          onChange={(e) => onUpdateParam("location", e.target.value)}
          placeholder="e.g. New York"
          className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm text-text-body placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-border/60"
        />
      </div>

      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-bg-subtle px-3 text-sm font-medium text-text-heading transition-colors"
        >
          <RotateCcwIcon className="size-3.5" />
          Clear all filters
        </button>
      )}
    </div>
  );
}
