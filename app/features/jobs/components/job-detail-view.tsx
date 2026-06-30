"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplyModal } from "./apply-modal";
import {
  MapPinIcon,
  BriefcaseIcon,
  Building2Icon,
  GlobeIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  AlertCircleIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SaveJobButton } from "@/app/features/user/components/save-job-button";

export function JobDetailView({ jobId: propId }: { jobId?: string }) {
  const params = useParams();
  const id = propId ?? (params.id as string);
  const [showApply, setShowApply] = useState(false);
  const [now] = useState(() => Date.now());

  const { data, isLoading, isError } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const res = (await apiClient(`/api/jobs/${id}`)) as { data: Record<string, unknown> };
      return res.data;
    },
    enabled: !!id,
  });

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

  const d = data as Record<string, unknown>;
  const dln = d.applicationDeadline ? new Date(d.applicationDeadline as string) : null;
  const deadlineSoon =
    dln !== null && dln.getTime() - now < 7 * 86400000 && dln.getTime() > now;
  const deadlinePassed = dln !== null && dln.getTime() < now;
  const sMin = d.salaryMin as number | null;
  const sMax = d.salaryMax as number | null;
  const salaryText =
    sMin != null || sMax != null
      ? String(d.salaryCurrency ?? "USD") +
        (sMin?.toLocaleString() ?? "") +
        " - " +
        String(d.salaryCurrency ?? "USD") +
        (sMax?.toLocaleString() ?? "")
      : null;
  const locs = (d.locations ?? []) as string[];
  const skills = (d.skills ?? []) as string[];
  const tags = (d.tags ?? []) as string[];
  const compDesc = d.companyDescription as string | null | undefined;
  const compWeb = d.companyWebsite as string | null | undefined;
  const isJobInactive = (d.isActive as boolean) !== true || (d.status as string) !== "active";

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-body mb-6 transition-colors"
      >
        <ArrowLeftIcon className="size-4" /> Back to jobs
      </Link>

      <div className="flex items-start gap-4 mb-6">
        <div className="size-14 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0 text-2xl font-bold">
          {d.companyLogo ? (
            <Image
              src={d.companyLogo as string}
              alt=""
              width={36}
              height={36}
              className="size-9 object-contain"
            />
          ) : (
            String(d.companyName ?? "?")
              .charAt(0)
              .toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-heading">
            {String(d.title ?? "")}
          </h1>
          <p className="text-text-muted mt-1">{String(d.companyName ?? "")}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {locs.length > 0 ? (
          <span className="inline-flex items-center gap-1 text-sm text-text-muted bg-bg-muted px-3 py-1.5 rounded-lg">
            <MapPinIcon className="size-4" />
            {locs.join(", ")}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 text-sm text-text-muted bg-bg-muted px-3 py-1.5 rounded-lg">
          <BriefcaseIcon className="size-4" />
          {String(d.workMode ?? "").replace("_", " ")}
        </span>
        <span className="text-sm font-medium px-3 py-1.5 rounded-lg bg-bg-muted text-text-muted">
          {String(d.employmentType ?? "").replace("_", " ")}
        </span>
        <span className="text-sm font-medium px-3 py-1.5 rounded-lg bg-bg-muted text-text-muted">
          {String(d.experienceLevel ?? "")}
        </span>
      </div>

      {deadlineSoon ? (
        <div className="flex items-center gap-2 text-sm text-warning bg-warning/5 border border-warning/20 rounded-lg px-4 py-3 mb-6">
          <AlertCircleIcon className="size-4 shrink-0" />
          Apply soon
        </div>
      ) : null}
      {deadlinePassed ? (
        <div className="flex items-center gap-2 text-sm text-text-muted bg-bg-muted border border-border-subtle rounded-lg px-4 py-3 mb-6">
          <AlertCircleIcon className="size-4 shrink-0" />
          Application deadline has passed
        </div>
      ) : null}
      {isJobInactive ? (
        <div className="flex items-center gap-2 text-sm text-text-muted bg-bg-muted border border-border-subtle rounded-lg px-4 py-3 mb-6">
          <AlertCircleIcon className="size-4 shrink-0" />
          This job is no longer accepting applications
        </div>
      ) : null}
      {salaryText !== null ? (
        <p className="text-lg font-semibold text-text-heading mb-4">{salaryText}</p>
      ) : null}

      {compDesc != null ? (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-2 flex items-center gap-2">
            <Building2Icon className="size-4" /> About the Company
          </h2>
          <p className="text-sm text-text-body">{compDesc}</p>
          {compWeb != null ? (
            <a
              href={compWeb}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-brand hover:underline mt-2"
            >
              <GlobeIcon className="size-3.5" /> Visit website{" "}
              <ChevronRightIcon className="size-3.5" />
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-2">
          Description
        </h2>
        <div className="text-sm text-text-body whitespace-pre-line leading-relaxed">
          {String(d.description ?? "")}
        </div>
      </div>

      {skills.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-2">
            Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span
                key={s}
                className="text-xs bg-brand/5 text-brand border border-brand/10 px-2.5 py-1 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {tags.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-2">
            Tags
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="text-xs bg-bg-muted text-text-muted px-2.5 py-1 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-3 pt-6 border-t border-border-subtle">
        <SaveJobButton jobId={String(d.id ?? id)} size="md" />
        <button
          type="button"
          onClick={() => setShowApply(true)}
          disabled={deadlinePassed || isJobInactive}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply Now
        </button>
        <span className="text-xs text-text-muted">
          {String(d.applicationCount ?? "0")} applicant
          {Number(d.applicationCount ?? 0) !== 1 ? "s" : ""}
        </span>
      </div>

      {showApply ? (
        <ApplyModal jobId={String(d.id ?? id)} onClose={() => setShowApply(false)} />
      ) : null}
    </div>
  );
}
