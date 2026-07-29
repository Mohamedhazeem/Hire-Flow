"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon } from "lucide-react";

const WORK_MODE_LABELS: Record<string, string> = {
  all: "All Modes",
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  all: "All Types",
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  freelance: "Freelance",
};

type JobTableToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string | null) => void;
  workMode: string;
  onWorkModeChange: (value: string | null) => void;
  employmentType: string;
  onEmploymentTypeChange: (value: string | null) => void;
};

export function JobTableToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  workMode,
  onWorkModeChange,
  employmentType,
  onEmploymentTypeChange,
}: JobTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <div className="relative flex-1 min-w-0">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
        <Input
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 rounded-xl bg-bg-elevated border-border-subtle"
        />
      </div>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue>{status === "all" ? "All Status" : status === "active" ? "Active" : "Inactive"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
      <Select value={workMode} onValueChange={onWorkModeChange}>
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue>{WORK_MODE_LABELS[workMode] ?? workMode}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Modes</SelectItem>
          <SelectItem value="remote">Remote</SelectItem>
          <SelectItem value="hybrid">Hybrid</SelectItem>
          <SelectItem value="onsite">On-site</SelectItem>
        </SelectContent>
      </Select>
      <Select value={employmentType} onValueChange={onEmploymentTypeChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue>{EMPLOYMENT_TYPE_LABELS[employmentType] ?? employmentType}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="full_time">Full-time</SelectItem>
          <SelectItem value="part_time">Part-time</SelectItem>
          <SelectItem value="contract">Contract</SelectItem>
          <SelectItem value="internship">Internship</SelectItem>
          <SelectItem value="freelance">Freelance</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
