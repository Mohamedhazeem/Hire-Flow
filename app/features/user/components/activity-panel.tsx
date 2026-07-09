"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  BriefcaseIcon,
  FileTextIcon,
  CalendarCheckIcon,
  StarIcon,
  ExternalLinkIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type AppRow = {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string | null;
  status: string;
  appliedAt: string;
  updatedAt: string;
};
type Stats = { total: number; active: number; interviews: number; offers: number };

const statConfig: { key: keyof Stats; label: string; icon: React.ReactNode; color: string }[] = [
  {
    key: "total",
    label: "Total Applications",
    icon: <FileTextIcon className="size-4" />,
    color: "bg-brand/10 text-brand",
  },
  {
    key: "active",
    label: "Active",
    icon: <BriefcaseIcon className="size-4" />,
    color: "bg-warning/10 text-warning",
  },
  {
    key: "interviews",
    label: "Interviews",
    icon: <CalendarCheckIcon className="size-4" />,
    color: "bg-accent/10 text-accent",
  },
  {
    key: "offers",
    label: "Offers",
    icon: <StarIcon className="size-4" />,
    color: "bg-success/10 text-success",
  },
];

export function ActivityPanel() {
  const {
    data: stats,
    isLoading: statsLoad,
    isError: statsErr,
  } = useQuery({
    queryKey: ["user", "applications", "stats"],
    queryFn: async () => {
      const res = await apiClient<{ data: Stats }>("/api/user/applications/stats");
      return res.data;
    },
  });

  const {
    data: appsData,
    isLoading: appsLoad,
    isError: appsErr,
  } = useQuery({
    queryKey: ["user", "applications", "recent"],
    queryFn: async () => {
      const res = await apiClient<{ data: { applications: AppRow[]; total: number } }>(
        "/api/user/applications",
        { params: { page: "1", pageSize: "5" } },
      );
      return res.data;
    },
  });

  return (
    <div>
      <div className="px-4 md:px-6 lg:px-8 pt-6 pb-2">
        <h1 className="text-xl sm:text-2xl font-bold text-text-heading">Activity</h1>
        <p className="text-sm text-text-muted mt-1">Track your job applications and activity</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 md:px-6 lg:px-8 py-4">
        {statsLoad
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-bg-surface border border-border-subtle rounded-xl p-4">
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-7 w-10" />
              </div>
            ))
          : statsErr
            ? statConfig.map((s) => (
                <div
                  key={s.key}
                  className="bg-bg-surface border border-border-subtle rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="size-7 rounded-lg flex items-center justify-center bg-bg-muted text-text-muted">
                      {s.icon}
                    </div>
                    <span className="text-xs text-text-muted">{s.label}</span>
                  </div>
                  <p className="text-xl font-bold text-text-heading">&mdash;</p>
                </div>
              ))
            : statConfig.map((s) => (
                <div
                  key={s.key}
                  className="bg-bg-surface border border-border-subtle rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`size-7 rounded-lg flex items-center justify-center ${s.color}`}
                    >
                      {s.icon}
                    </div>
                    <span className="text-xs text-text-muted">{s.label}</span>
                  </div>
                  <p className="text-xl font-bold text-text-heading">{stats?.[s.key] ?? 0}</p>
                </div>
              ))}
      </div>

      <div className="px-4 md:px-6 lg:px-8 py-2">
        <h2 className="text-sm font-semibold text-text-heading mb-3">Recent Activity</h2>

        {appsLoad && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        )}

        {appsErr && (
          <div className="bg-error/5 border border-error/20 rounded-xl px-4 py-6 text-center">
            <p className="text-sm text-text-muted">Failed to load recent activity.</p>
          </div>
        )}

        {appsData && appsData.applications.length === 0 && (
          <div className="bg-bg-surface border border-border-subtle rounded-xl px-4 py-10 text-center">
            <FileTextIcon className="size-8 text-text-muted/30 mx-auto mb-3" />
            <p className="text-sm text-text-muted mb-3">No applications yet</p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-brand hover:bg-brand/90 px-4 py-2 rounded-lg transition-colors"
            >
              <ExternalLinkIcon className="size-3.5" /> Browse Jobs
            </Link>
          </div>
        )}

        {appsData && appsData.applications.length > 0 && (
          <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden">
            {appsData.applications.map((app) => (
              <Link
                key={app.id}
                href={`/user/applications/${app.id}`}
                className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle last:border-b-0 hover:bg-bg-muted/40 transition-colors"
              >
                <div className="size-9 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-xs font-bold shrink-0">
                  {app.companyLogo ? (
                    <Image
                      src={app.companyLogo}
                      alt=""
                      width={20}
                      height={20}
                      className="size-5 object-contain"
                    />
                  ) : (
                    (app.companyName[0]?.toUpperCase() ?? "?")
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-heading truncate">{app.jobTitle}</p>
                  <p className="text-xs text-text-muted truncate">{app.companyName}</p>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={app.status} />
                </div>
              </Link>
            ))}
          </div>
        )}

        {appsData && appsData.applications.length > 0 && (
          <Link
            href="/user/applications"
            className="inline-flex items-center gap-1 text-sm text-brand hover:underline mt-3"
          >
            <ExternalLinkIcon className="size-3.5" /> View all applications
          </Link>
        )}
      </div>
    </div>
  );
}
