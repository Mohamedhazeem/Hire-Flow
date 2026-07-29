"use client";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { STATUS_OPTIONS, STATUS_DOT_COLORS } from "../utils/applicant-table-constants";
import { SearchIcon, DownloadIcon } from "lucide-react";

type ApplicantTableToolbarProps = {
  searchInput: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  status: string;
  onStatusChange: (value: string) => void;
  exportUrl: string;
};

export function ApplicantTableToolbar({
  searchInput,
  onSearchChange,
  onSearchSubmit,
  status,
  onStatusChange,
  exportUrl,
}: ApplicantTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <div className="relative flex-1 min-w-0">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
        <Input
          placeholder="Search applicants..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearchSubmit();
          }}
          className="pl-10 rounded-xl bg-bg-elevated border-border-subtle"
        />
      </div>
      <Select
        value={status}
        onValueChange={(v: string | null) => {
          if (v !== null) onStatusChange(v);
        }}
      >
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue>{STATUS_OPTIONS.find((o) => o.value === status)?.label ?? "All Status"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <span className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", STATUS_DOT_COLORS[opt.value] ?? "bg-muted")} />
                {opt.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <a
        href={exportUrl}
        download
        className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-bg-elevated border border-border-subtle text-sm font-medium text-text-body hover:bg-bg-elevated/80 transition-colors whitespace-nowrap"
      >
        <DownloadIcon className="size-4" />
        <span className="hidden sm:inline">Export CSV</span>
      </a>
    </div>
  );
}
