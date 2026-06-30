"use client";

import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { apiClient } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "./job-card";
import { JobSearchBar } from "./job-search-bar";
import { FilterSelect } from "./filter-select";
import { BriefcaseIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";

const WORK_MODES = ["remote", "hybrid", "onsite"] as const;
const EMPLOYMENT_TYPES = ["full_time", "part_time", "contract", "freelance", "internship"] as const;
const EXPERIENCE_LEVELS = ["entry", "mid", "senior", "lead"] as const;
const STATUS_OPTIONS = ["open", "expired"] as const;
const FILTER_LABELS: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "Internship",
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior",
  lead: "Lead",
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function JobListPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const params = useMemo(
    () => ({
      page: sp.get("page") || undefined,
      pageSize: "20",
      search: sp.get("search") || undefined,
      workMode: sp.get("workMode") || undefined,
      employmentType: sp.get("employmentType") || undefined,
      experienceLevel: sp.get("experienceLevel") || undefined,
      status: sp.get("status") || undefined,
    }),
    [sp],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public", "jobs", params],
    queryFn: async () => {
      const res = (await apiClient("/api/jobs", { params })) as {
        data: {
          jobs: Record<string, unknown>[];
          total: number;
          totalPages: number;
          page: number;
          hasNextPage: boolean;
          hasPrevPage: boolean;
        };
      };
      return res.data;
    },
  });

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      const np = new URLSearchParams(sp.toString());
      if (value) np.set(key, value);
      else np.delete(key);
      if (key !== "page") np.delete("page");
      router.push(`/jobs?${np.toString()}`);
    },
    [router, sp],
  );

  const hasFilters = !!(
    params.search ||
    params.workMode ||
    params.employmentType ||
    params.experienceLevel ||
    params.status
  );

  return (
    <div className="min-h-screen bg-bg-base">
      <PageHeader
        title="Browse Jobs"
        description="Find your next opportunity"
        icon={<BriefcaseIcon className="size-5" />}
      />
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <JobSearchBar />
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              label="Work Mode"
              paramKey="workMode"
              options={WORK_MODES}
              value={params.workMode}
              onChange={setParam}
              labels={FILTER_LABELS}
            />
            <FilterSelect
              label="Type"
              paramKey="employmentType"
              options={EMPLOYMENT_TYPES}
              value={params.employmentType}
              onChange={setParam}
              labels={FILTER_LABELS}
            />
            <FilterSelect
              label="Level"
              paramKey="experienceLevel"
              options={EXPERIENCE_LEVELS}
              value={params.experienceLevel}
              onChange={setParam}
              labels={FILTER_LABELS}
            />
            <FilterSelect
              label="Status"
              paramKey="status"
              options={STATUS_OPTIONS}
              value={params.status}
              onChange={setParam}
              labels={FILTER_LABELS}
            />
          </div>
        </div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </motion.div>
        )}
        {isError && (
          <div className="text-center py-16">
            <p className="text-text-muted">Failed to load jobs. Please try again.</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {data && data.jobs.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <p className="text-text-muted text-lg">
                {hasFilters
                  ? "No jobs found matching your criteria"
                  : "No jobs available right now"}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => router.push("/jobs")}
                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-brand hover:underline"
                >
                  <XIcon className="size-3.5" /> Clear filters
                </button>
              )}
              {!hasFilters && (
                <p className="text-sm text-text-muted mt-1">
                  Check back later for new opportunities
                </p>
              )}
            </motion.div>
          )}

          {data && data.jobs.length > 0 && (
            <motion.div
              key={`page-${data.page}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {data.jobs.map((job) => (
                <motion.div key={job.id as string} variants={cardVariants}>
                  <JobCard
                    id={job.id as string}
                    title={job.title as string}
                    companyName={job.companyName as string}
                    companyLogo={job.companyLogo as string | null}
                    locations={job.locations as string[]}
                    workMode={job.workMode as string}
                    employmentType={job.employmentType as string}
                    salaryMin={job.salaryMin as number | null}
                    salaryMax={job.salaryMax as number | null}
                    salaryCurrency={job.salaryCurrency as string}
                    skills={job.skills as string[]}
                    experienceLevel={job.experienceLevel as string}
                    applicationDeadline={job.applicationDeadline as string | null}
                    createdAt={job.createdAt as string}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
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
      </div>
    </div>
  );
}
