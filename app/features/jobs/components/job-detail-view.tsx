"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { apiClient } from "@/lib/api/api-client";
import { hydrator } from "@/lib/hydration";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplyModal } from "./apply-modal";
import { CompanyPreviewCard } from "@/components/shared/company-preview-card";
import { SaveJobButton } from "@/app/features/user/components/save-job-button";
import { useSession } from "@/app/features/auth/libs/auth-client";
import type { PublicJobDetail } from "@/app/features/jobs/queries/public-job-queries";
import { MapPinIcon, BriefcaseIcon, ArrowLeftIcon, AlertCircleIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function JobDetailView({ jobId }: { jobId?: string }) {
  const params = useParams();
  const rawId = jobId ?? params.id;
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";
  const { data: session } = useSession();
  const [showApply, setShowApply] = useState(false);
  const [now] = useState(() => Date.now());
  const hydrated = useSyncExternalStore(
    hydrator.subscribe,
    hydrator.getSnapshot,
    hydrator.getServerSnapshot,
  );

  const fmt = (n: number) =>
    hydrated === "client" ? n.toLocaleString() : n.toLocaleString("en-US");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => (await apiClient<{ data: PublicJobDetail }>(`/api/jobs/${id}`)).data,
    enabled: !!id,
  });

  useEffect(() => {
    if (!id) return;
    const c = new AbortController();
    fetch(`/api/jobs/${id}/view`, { method: "POST", signal: c.signal }).catch(() => {});
    return () => c.abort();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-16 text-center">
        <p className="text-text-muted">Job not found</p>
        <Link href="/jobs" className="text-brand hover:underline text-sm mt-2 inline-block">
          Browse all jobs
        </Link>
      </div>
    );
  }
  const dl = data.applicationDeadline ? new Date(data.applicationDeadline).getTime() : null;
  const ds = dl !== null && dl - now < 7 * 86400000 && dl > now;
  const dp = dl !== null && dl < now;
  const ii = !data.isActive || data.status !== "active";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6"
    >
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-body mb-6 transition-colors"
      >
        <ArrowLeftIcon className="size-4" /> Back to jobs
      </Link>

      <div className="flex items-start gap-4 mb-6">
        <div className="size-14 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0 text-2xl font-bold">
          {data.companyLogo ? (
            <Image
              src={data.companyLogo}
              alt={`${data.companyName || "Company"} logo`}
              width={36}
              height={36}
              className="size-9 object-contain"
            />
          ) : (
            data.companyName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-heading">{data.title}</h1>
          <p className="text-text-muted mt-1">{data.companyName}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {data.locations.length > 0 && (
          <span className="inline-flex items-center gap-1 text-sm text-text-muted bg-bg-muted px-3 py-1.5 rounded-lg">
            <MapPinIcon className="size-4" />
            {data.locations.join(", ")}
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-sm text-text-muted bg-bg-muted px-3 py-1.5 rounded-lg">
          <BriefcaseIcon className="size-4" />
          {data.workMode.replaceAll("_", " ")}
        </span>
        <span className="text-sm font-medium px-3 py-1.5 rounded-lg bg-bg-muted text-text-muted">
          {data.employmentType.replaceAll("_", " ")}
        </span>
        <span className="text-sm font-medium px-3 py-1.5 rounded-lg bg-bg-muted text-text-muted">
          {data.experienceLevel}
        </span>
      </div>

      {ds && (
        <div className="flex items-center gap-2 text-sm text-warning bg-warning/5 border border-warning/20 rounded-lg px-4 py-3 mb-6">
          <AlertCircleIcon className="size-4 shrink-0" /> Apply soon
        </div>
      )}
      {dp && (
        <div className="flex items-center gap-2 text-sm text-text-muted bg-bg-muted border border-border-subtle rounded-lg px-4 py-3 mb-6">
          <AlertCircleIcon className="size-4 shrink-0" /> Application deadline has passed
        </div>
      )}
      {ii && (
        <div className="flex items-center gap-2 text-sm text-text-muted bg-bg-muted border border-border-subtle rounded-lg px-4 py-3 mb-6">
          <AlertCircleIcon className="size-4 shrink-0" /> This job is no longer accepting
          applications
        </div>
      )}

      {data.salaryMin != null || data.salaryMax != null ? (
        <p className="text-lg font-semibold text-text-heading mb-4">
          {data.salaryMin != null && data.salaryMax != null
            ? `${data.salaryCurrency ?? "USD"}${fmt(data.salaryMin)} - ${fmt(data.salaryMax)}`
            : data.salaryMin != null
              ? `${data.salaryCurrency ?? "USD"}${fmt(data.salaryMin)}+`
              : `Up to ${data.salaryCurrency ?? "USD"}${fmt(data.salaryMax!)}`}
        </p>
      ) : null}

      <div className="mb-6">
        <CompanyPreviewCard
          name={data.companyName}
          logo={data.companyLogo}
          website={data.companyWebsite}
          description={data.companyDescription}
          locations={data.locations}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-2">
          Description
        </h2>
        <div className="text-sm text-text-body whitespace-pre-line leading-relaxed">
          {data.description}
        </div>
      </div>

      {data.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-2">
            Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s) => (
              <span
                key={s}
                className="text-xs bg-brand/5 text-brand border border-brand/10 px-2.5 py-1 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.tags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-2">
            Tags
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {data.tags.map((t) => (
              <span
                key={t}
                className="text-xs bg-bg-muted text-text-muted px-2.5 py-1 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-6 border-t border-border-subtle">
        <SaveJobButton jobId={data.id} size="md" />
        {session?.user ? (
          <button
            type="button"
            onClick={() => setShowApply(true)}
            disabled={dp || ii}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Now
          </button>
        ) : (
          <Link
            href={`/login?returnUrl=${encodeURIComponent(`/jobs/${id}`)}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand/90 rounded-lg transition-colors"
          >
            Log in to Apply
          </Link>
        )}
        <span className="text-xs text-text-muted">
          {data.applicationCount} applicant{data.applicationCount !== 1 ? "s" : ""}
        </span>
      </div>

      {showApply && <ApplyModal jobId={data.id} onClose={() => setShowApply(false)} />}
    </motion.div>
  );
}
