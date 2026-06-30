"use client";

import { Building2Icon } from "lucide-react";
import { StatusTimeline, type StatusTimelineEntry } from "@/components/shared/status-timeline";

type StatusChange = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  createdAt: string;
};

type Props = { statusChanges: StatusChange[] };

function statusLabel(from: string | null, to: string): string {
  if (!from) return "Applied";
  const fmt = (s: string) => s.replace(/_/g, " ");
  return `${fmt(from)} → ${fmt(to)}`;
}

export function ApplicationTimeline({ statusChanges }: Props) {
  const entries: StatusTimelineEntry[] = statusChanges.length > 0
    ? statusChanges.map((sc) => ({
        id: sc.id,
        type: "status_change" as const,
        fromStatus: sc.fromStatus,
        toStatus: sc.toStatus,
        label: statusLabel(sc.fromStatus, sc.toStatus),
        changedByName: null,
        note: null,
        createdAt: sc.createdAt,
      }))
    : [{
        id: "initial",
        type: "application_submitted" as const,
        fromStatus: null,
        toStatus: "applied",
        label: "Applied",
        changedByName: null,
        note: null,
        createdAt: new Date().toISOString(),
      }];

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl p-5">
      <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4 flex items-center gap-2">
        <Building2Icon className="size-4" />
        Status Timeline
      </h2>
      <StatusTimeline entries={entries} />
    </div>
  );
}
