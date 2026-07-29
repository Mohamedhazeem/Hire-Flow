"use client";

import {
  BriefcaseIcon,
  WorkflowIcon,
  GlobeIcon,
  ClockIcon,
  MapPinIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterButton } from "./filter-button";
import {
  StatusDot,
  getStatusOptions,
  WORK_MODE_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
} from "./filter-options";

type DesktopFiltersProps = {
  showJobFilter: boolean;
  jobOptions: { value: string; label: string }[];
  currentJobId: string;
  activeStatusArray: string[];
  currentWorkMode: string;
  currentEmploymentType: string;
  currentLocation: string;
  onUpdateParam: (key: string, value: string) => void;
  onToggleMultiValue: (key: string, value: string) => void;
};

function itemCls(active: boolean) {
  return cn(
    "flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-bg-elevated",
    active ? "bg-brand/10 text-brand font-medium" : "text-text-body",
  );
}

export function DesktopFilters({
  showJobFilter,
  jobOptions,
  currentJobId,
  activeStatusArray,
  currentWorkMode,
  currentEmploymentType,
  currentLocation,
  onUpdateParam,
  onToggleMultiValue,
}: DesktopFiltersProps) {
  const statusOptions = getStatusOptions();

  return (
    <div className="hidden sm:flex items-center gap-3">
      {showJobFilter && (
        <FilterButton
          icon={<BriefcaseIcon className="size-4" />}
          label="Job"
          isActive={!!currentJobId}
        >
          <button onClick={() => onUpdateParam("jobId", "")} className={itemCls(!currentJobId)}>
            All Jobs
          </button>
          {jobOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdateParam("jobId", opt.value)}
              className={cn(itemCls(currentJobId === opt.value), "justify-between")}
            >
              {opt.label}
              {currentJobId === opt.value && <CheckIcon className="size-3.5" />}
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
        {statusOptions.map((opt) => {
          const selected = activeStatusArray.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => onToggleMultiValue("status", opt.value)}
              className={itemCls(selected)}
            >
              <div
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded border text-white transition-colors",
                  selected ? "border-brand bg-brand" : "border-border-strong",
                )}
              >
                {selected && <CheckIcon className="size-3" />}
              </div>
              <StatusDot status={opt.value} />
              <span className="truncate ml-2">{opt.label}</span>
            </button>
          );
        })}
      </FilterButton>

      <FilterButton
        icon={<GlobeIcon className="size-4" />}
        label="Work Mode"
        isActive={!!currentWorkMode}
      >
        <button onClick={() => onUpdateParam("workMode", "")} className={itemCls(!currentWorkMode)}>
          All
        </button>
        {WORK_MODE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onUpdateParam("workMode", opt.value)}
            className={cn(itemCls(currentWorkMode === opt.value), "justify-between")}
          >
            {opt.label}
            {currentWorkMode === opt.value && <CheckIcon className="size-3.5" />}
          </button>
        ))}
      </FilterButton>

      <FilterButton
        icon={<ClockIcon className="size-4" />}
        label="Type"
        isActive={!!currentEmploymentType}
      >
        <button
          onClick={() => onUpdateParam("employmentType", "")}
          className={itemCls(!currentEmploymentType)}
        >
          All
        </button>
        {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onUpdateParam("employmentType", opt.value)}
            className={cn(itemCls(currentEmploymentType === opt.value), "justify-between")}
          >
            {opt.label}
            {currentEmploymentType === opt.value && <CheckIcon className="size-3.5" />}
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
            onChange={(e) => onUpdateParam("location", e.target.value)}
            placeholder="Enter location..."
            className="w-full h-8 rounded-md border border-border bg-background px-2 text-sm text-text-body placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-border/60"
          />
        </div>
        {currentLocation && (
          <button
            onClick={() => onUpdateParam("location", "")}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-body"
          >
            <XIcon className="size-3.5" /> Clear location
          </button>
        )}
      </FilterButton>
    </div>
  );
}
