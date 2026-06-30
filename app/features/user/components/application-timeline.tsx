"use client";

import { Building2Icon } from "lucide-react";

type StatusChange = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  createdAt: string;
};

type Props = { statusChanges: StatusChange[] };

export function ApplicationTimeline({ statusChanges }: Props) {
  const timeline = statusChanges.length > 0
    ? statusChanges
    : [{ id: "i", fromStatus: null, toStatus: "applied", createdAt: new Date().toISOString() }];

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl p-5">
      <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4 flex items-center gap-2">
        <Building2Icon className="size-4" />
        Status Timeline
      </h2>
      {timeline.map((sc, i) => (
        <div key={sc.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`size-2.5 rounded-full mt-1.5 ${i === timeline.length - 1 ? "bg-brand" : "bg-border-subtle"}`} />
            {i < timeline.length - 1 && <div className="w-px flex-1 bg-border-subtle min-h-6" />}
          </div>
          <div className="pb-4">
            <p className="text-sm text-text-body">
              {sc.fromStatus ? (
                <>
                  <span className="capitalize">{sc.fromStatus.replace(/_/g, " ")}</span> &rarr;{" "}
                  <span className="font-medium capitalize">{sc.toStatus.replace(/_/g, " ")}</span>
                </>
              ) : (
                <span className="font-medium text-text-heading">Applied</span>
              )}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {new Date(sc.createdAt).toLocaleDateString(undefined, {
                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
