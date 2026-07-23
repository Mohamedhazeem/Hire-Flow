"use client";

import {
  SendIcon,
  SearchIcon,
  CheckCircle2Icon,
  CalendarIcon,
  BriefcaseIcon,
  XCircleIcon,
  ClockIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusTimelineEntry = {
  id: string;
  type: "application_submitted" | "status_change";
  fromStatus: string | null | undefined;
  toStatus: string | null | undefined;
  label: string;
  changedByName: string | null | undefined;
  note: string | null | undefined;
  createdAt: string;
  isUpcoming?: boolean;
};

type Props = {
  entries: StatusTimelineEntry[];
  className?: string;
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  applied: null,
  reviewing: <SearchIcon className="size-4" />,
  shortlisted: <CheckCircle2Icon className="size-4" />,
  interview_scheduled: <CalendarIcon className="size-4" />,
  offered: <SendIcon className="size-4" />,
  hired: <BriefcaseIcon className="size-4" />,
  rejected: <XCircleIcon className="size-4" />,
};

const STATUS_COLORS: Record<string, string> = {
  applied: "border-brand text-brand bg-brand/10",
  reviewing: "border-warning text-warning bg-warning/10",
  shortlisted: "border-accent text-accent bg-accent/10",
  interview_scheduled: "border-info text-info bg-info/10",
  offered: "border-success text-success bg-success/10",
  hired: "border-success text-success bg-success/10",
  rejected: "border-destructive text-destructive bg-destructive/10",
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 0) return "upcoming";
  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getIcon(entry: StatusTimelineEntry): React.ReactNode {
  if (entry.type === "application_submitted") {
    return <SendIcon className="size-4" />;
  }
  const status = entry.toStatus ?? "";
  return STATUS_ICONS[status] ?? <ClockIcon className="size-4" />;
}

function getColor(entry: StatusTimelineEntry): string {
  if (entry.type === "application_submitted") return STATUS_COLORS.applied;
  return STATUS_COLORS[entry.toStatus ?? ""] ?? "border-text-muted text-text-muted bg-bg-elevated";
}

export function StatusTimeline({ entries, className }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-sm text-text-muted py-6 text-center">No status history available.</div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {entries.map((entry, idx) => {
        const isLast = idx === entries.length - 1;
        const color = getColor(entry);
        const upcoming = entry.isUpcoming;

        return (
          <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                  color,
                  upcoming && "opacity-50",
                )}
              >
                {getIcon(entry)}
              </div>
              {!isLast && <div className="mt-1 w-px flex-1 bg-border-subtle" />}
            </div>
            <div className={cn("min-w-0 flex-1 pt-0.5", upcoming && "opacity-50")}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-text-heading">{entry.label}</span>
                <span className="text-xs text-text-muted whitespace-nowrap">
                  {relativeTime(entry.createdAt)}
                </span>
                {upcoming && (
                  <span className="inline-flex items-center rounded-full bg-info/10 text-info border border-info/20 px-2 py-0.5 text-xs font-medium">
                    Upcoming
                  </span>
                )}
              </div>
              {entry.changedByName && (
                <p className="text-xs text-text-muted mt-0.5">by {entry.changedByName}</p>
              )}
              {entry.note && (
                <p className="text-xs text-text-body mt-1 italic bg-bg-elevated rounded-md px-2 py-1 border border-border-subtle">
                  {entry.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
