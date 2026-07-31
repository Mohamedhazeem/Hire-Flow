"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api/api-client";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  FileTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  XIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const STATUSES = [
  "applied",
  "reviewing",
  "shortlisted",
  "interview_scheduled",
  "offered",
  "hired",
  "rejected",
];
type AppRow = {
  id: string;
  jobId: string;
  jobSlug: string | null;
  jobTitle: string;
  companyName: string;
  companyLogo: string | null;
  status: string;
  appliedAt: string;
  updatedAt: string;
};

function daysAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}

export function ApplicationsPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const params = useMemo(
    () => ({
      page: sp.get("page") || undefined,
      pageSize: "20",
      status: sp.get("status") || undefined,
      search: sp.get("search") || undefined,
    }),
    [sp],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", "applications", params],
    queryFn: async () => {
      const res = await apiClient<{
        data: {
          applications: AppRow[];
          total: number;
          totalPages: number;
          page: number;
          hasNextPage: boolean;
          hasPrevPage: boolean;
        };
      }>("/api/user/applications", { params });
      return res.data;
    },
  });

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      const np = new URLSearchParams(sp.toString());
      if (value) np.set(key, value);
      else np.delete(key);
      if (key !== "page") np.delete("page");
      router.push(`/user/applications?${np.toString()}`);
    },
    [router, sp],
  );

  const hasFilters = !!(params.status || params.search);

  return (
    <div>
      <PageHeader
        title="My Applications"
        description={data ? `${data.total} application${data.total !== 1 ? "s" : ""}` : undefined}
        icon={<FileTextIcon className="size-5" />}
      />
      <div className="px-4 md:px-6 lg:px-8 py-6">
        <div className="relative flex-1 min-w-0 mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by job title..."
            defaultValue={params.search ?? ""}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                setParam("search", (e.target as HTMLInputElement).value || undefined);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-bg-surface border border-border-subtle rounded-lg text-text-body placeholder:text-text-muted focus:outline-none focus:border-brand/50"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setParam("status", undefined)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!params.status ? "bg-brand/10 text-brand border-brand/20 font-medium" : "bg-bg-surface text-text-muted border-border-subtle hover:bg-bg-muted"}`}
          >
            All
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setParam("status", s === params.status ? undefined : s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${params.status === s ? "bg-brand/10 text-brand border-brand/20 font-medium" : "bg-bg-surface text-text-muted border-border-subtle hover:bg-bg-muted"}`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        )}
        {isError && (
          <div className="text-center py-16">
            <p className="text-text-muted">Failed to load applications.</p>
          </div>
        )}

        {data && data.applications.length === 0 && (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">
              {hasFilters ? "No applications match your filters" : "No applications yet"}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={() => router.push("/user/applications")}
                className="inline-flex items-center gap-1 mt-3 text-sm text-brand hover:underline"
              >
                <XIcon className="size-3.5" /> Clear filters
              </button>
            )}
            {!hasFilters && (
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-white bg-brand hover:bg-brand/90 px-4 py-2 rounded-lg transition-colors"
              >
                <ExternalLinkIcon className="size-3.5" /> Browse Jobs
              </Link>
            )}
          </div>
        )}

        {data && data.applications.length > 0 && (
          <>
            <div className="overflow-x-auto min-w-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-center font-medium text-text-muted pb-3 pr-4 whitespace-nowrap">
                      Job
                    </th>
                    <th className="text-center font-medium text-text-muted pb-3 pr-4 whitespace-nowrap hidden sm:table-cell">
                      Company
                    </th>
                    <th className="text-center font-medium text-text-muted pb-3 pr-4 whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-center font-medium text-text-muted pb-3 pr-4 whitespace-nowrap hidden md:table-cell">
                      Applied
                    </th>
                    <th className="text-center font-medium text-text-muted pb-3 pr-4 whitespace-nowrap hidden lg:table-cell">
                      Updated
                    </th>
                    <th className="text-center font-medium text-text-muted pb-3 whitespace-nowrap" />
                  </tr>
                </thead>
                <tbody>
                  {data.applications.map((app) => (
                    <tr
                      key={app.id}
                      className="border-b border-border-subtle hover:bg-bg-muted/40 transition-colors"
                    >
                      <td className="py-3 pr-4 text-center">
                        <Link
                          href={app.jobSlug ? `/user/applications/${app.jobSlug}` : `/user/applications/${app.id}`}
                          className="font-medium text-text-heading hover:text-brand transition-colors"
                        >
                          {app.jobTitle}
                        </Link>
                      </td>
                       <td className="py-3 pr-4 hidden sm:table-cell text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="size-6 rounded-full bg-brand/10 flex items-center justify-center text-brand text-[10px] font-bold shrink-0 overflow-hidden">
                            {app.companyLogo ? (
                              <Image
                                src={app.companyLogo}
                                alt=""
                                width={24}
                                height={24}
                                className="size-full rounded-full object-cover"
                              />
                            ) : (
                              (app.companyName[0]?.toUpperCase() ?? "?")
                            )}
                          </div>
                          <span className="text-text-muted">{app.companyName}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3 pr-4 text-text-muted hidden md:table-cell text-center">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4 text-text-muted hidden lg:table-cell whitespace-nowrap text-center capitalize">
                        {daysAgo(app.updatedAt)}
                      </td>
                      <td className="py-3 text-center">
                        <Link
                          href={app.jobSlug ? `/user/applications/${app.jobSlug}` : `/user/applications/${app.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-brand hover:bg-brand/90 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setParam("page", String(Number(params.page ?? 1) - 1))}
                  disabled={!data.hasPrevPage}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-border-subtle disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-muted transition-colors"
                >
                  <ChevronLeftIcon className="size-4" /> Previous
                </button>
                <span className="text-sm text-text-muted">
                  Page {data.page} of {data.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setParam("page", String(Number(params.page ?? 1) + 1))}
                  disabled={!data.hasNextPage}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-border-subtle disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-muted transition-colors"
                >
                  Next <ChevronRightIcon className="size-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
