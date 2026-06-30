"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import {
  ArrowLeftIcon,
  MapPinIcon,
  BriefcaseIcon,
  Building2Icon,
  FileTextIcon,
  AlertCircleIcon,
  Trash2Icon,
  ExternalLinkIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function ApplicationDetailView({ applicationId: propId }: { applicationId?: string }) {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const id = propId ?? (params.id as string);
  const [wdErr, setWdErr] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", "application", id],
    queryFn: async () => {
      const res = (await apiClient(`/api/user/applications/${id}`)) as {
        data: Record<string, unknown>;
      };
      return res.data;
    },
    enabled: !!id,
  });

  const wd = useMutation({
    mutationFn: async () => {
      await apiClient(`/api/user/applications/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", "applications"] });
      router.push("/user/applications");
    },
    onError: (err: Error) => setWdErr(err.message),
  });

  if (isLoading)
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  if (isError || !data)
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-16 text-center">
        <p className="text-text-muted">Application not found</p>
        <Link
          href="/user/applications"
          className="text-brand hover:underline text-sm mt-2 inline-block"
        >
          Back to my applications
        </Link>
      </div>
    );

  const d = data as Record<string, unknown>;
  const jobTitle = String(d.jobTitle ?? (d.job as Record<string, unknown>)?.title ?? "");
  const companyName = String(
    d.jobCompanyName ??
      ((d.job as Record<string, unknown>)?.company as Record<string, unknown>)?.name ??
      "",
  );
  const companyLogo = (d.jobCompanyLogo ??
    ((d.job as Record<string, unknown>)?.company as Record<string, unknown>)?.logoUrl ??
    null) as string | null;
  const locations = (d.jobLocations ?? []) as string[];
  const workMode = String(d.jobWorkMode ?? "");
  const salaryMin = d.jobSalaryMin as number | null;
  const salaryMax = d.jobSalaryMax as number | null;
  const salaryCurrency = String(d.jobSalaryCurrency ?? "USD");
  const salaryText =
    salaryMin != null || salaryMax != null
      ? `${salaryCurrency}${salaryMin?.toLocaleString() ?? ""} - ${salaryCurrency}${salaryMax?.toLocaleString() ?? ""}`
      : null;
  const status = String(d.status ?? "");
  const statusChanges = (d.statusChanges ?? []) as Array<Record<string, unknown>>;
  const appliedAt = String(d.appliedAt ?? new Date().toISOString());
  const timeline =
    statusChanges.length > 0
      ? statusChanges
      : [{ id: "i", fromStatus: null, toStatus: "applied", createdAt: appliedAt }];
  const canWithdraw = status === "applied" || status === "reviewing";
  const builderData =
    d.resumeSnapshotBuilderData && typeof d.resumeSnapshotBuilderData === "object"
      ? (d.resumeSnapshotBuilderData as Record<string, unknown>)
      : null;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6">
      <Link
        href="/user/applications"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-body mb-6 transition-colors"
      >
        <ArrowLeftIcon className="size-4" /> Back to applications
      </Link>
      {!d.jobActive && (
        <div className="flex items-center gap-2 text-sm text-text-muted bg-bg-muted border border-border-subtle rounded-lg px-4 py-3 mb-6">
          <AlertCircleIcon className="size-4 shrink-0" /> This job is no longer active
        </div>
      )}

      <div className="flex items-start gap-4 mb-6">
        <div className="size-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0 text-xl font-bold">
          {companyLogo ? (
            <Image src={companyLogo} alt="" className="size-8 object-contain" />
          ) : (
            (companyName[0]?.toUpperCase() ?? "?")
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-text-heading">{jobTitle}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-text-muted">{companyName}</span>
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {(locations.length > 0 || workMode || salaryText) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {locations[0] && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted bg-bg-muted px-2.5 py-1.5 rounded-lg">
              <MapPinIcon className="size-3.5" />
              {locations.join(", ")}
            </span>
          )}
          {workMode && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted bg-bg-muted px-2.5 py-1.5 rounded-lg">
              <BriefcaseIcon className="size-3.5" />
              {workMode.replace("_", " ")}
            </span>
          )}
          {salaryText && (
            <span className="text-xs font-medium bg-bg-muted px-2.5 py-1.5 rounded-lg text-text-muted">
              {salaryText}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building2Icon className="size-4" />
            Status Timeline
          </h2>
          {timeline.map((sc, i) => (
            <div key={sc.id as string} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`size-2.5 rounded-full mt-1.5 ${i === timeline.length - 1 ? "bg-brand" : "bg-border-subtle"}`}
                />
                {i < timeline.length - 1 && (
                  <div className="w-px flex-1 bg-border-subtle min-h-6" />
                )}
              </div>
              <div className="pb-4">
                <p className="text-sm text-text-body">
                  {sc.fromStatus ? (
                    <>
                      <span className="capitalize">
                        {(sc.fromStatus as string).replace(/_/g, " ")}
                      </span>{" "}
                      →{" "}
                      <span className="font-medium capitalize">
                        {(sc.toStatus as string).replace(/_/g, " ")}
                      </span>
                    </>
                  ) : (
                    <span className="font-medium text-text-heading">Applied</span>
                  )}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {new Date(sc.createdAt as string).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {d.rejectionReason != null ? (
          <div className="bg-error/5 border border-error/20 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-2">
              Rejection Reason
            </h2>
            <p className="text-sm text-text-body">{String(d.rejectionReason)}</p>
          </div>
        ) : null}
        {d.interviewDate != null
          ? (() => {
              const dt = String(d.interviewDate);
              const ml = d.meetingLink as string | null | undefined;
              return (
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-5">
                  <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-2">
                    Interview
                  </h2>
                  <p className="text-sm text-text-body">
                    {new Date(dt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {ml != null ? (
                    <a
                      href={ml}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-brand hover:underline mt-2"
                    >
                      <ExternalLinkIcon className="size-3.5" /> Join Meeting
                    </a>
                  ) : null}
                </div>
              );
            })()
          : null}
        {d.offerDetails != null ? (
          <div className="bg-success/5 border border-success/20 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-2">
              Offer Details
            </h2>
            <p className="text-sm text-text-body whitespace-pre-line">{String(d.offerDetails)}</p>
          </div>
        ) : null}
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 mb-8">
        <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4 flex items-center gap-2">
          <FileTextIcon className="size-4" />
          Resume Submitted
        </h2>
        {builderData ? (
          <div className="space-y-2 text-sm text-text-body">
            {builderData.label ? (
              <p>
                <span className="text-text-muted">Label:</span> {String(builderData.label)}
              </p>
            ) : null}
            {builderData.skills &&
            Array.isArray(builderData.skills) &&
            (builderData.skills as string[]).length > 0 ? (
              <p>
                <span className="text-text-muted">Skills:</span>{" "}
                {(builderData.skills as string[]).join(", ")}
              </p>
            ) : null}
            {builderData.experiences && Array.isArray(builderData.experiences) ? (
              <p>
                <span className="text-text-muted">Experience:</span>{" "}
                {(builderData.experiences as unknown[]).length} entr
                {(builderData.experiences as unknown[]).length === 1 ? "y" : "ies"}
              </p>
            ) : null}
          </div>
        ) : d.resumeSnapshotUrl ? (
          <a
            href={`/api/files/download?file=${encodeURIComponent(d.resumeSnapshotUrl as string)}`}
            className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
          >
            <FileTextIcon className="size-4" />
            Download Resume
          </a>
        ) : (
          <p className="text-sm text-text-muted">Resume data not available</p>
        )}
      </div>

      {wdErr && (
        <div className="flex items-start gap-2 text-sm text-error bg-error/5 border border-error/20 rounded-lg px-4 py-3 mb-4">
          <AlertCircleIcon className="size-4 shrink-0 mt-0.5" />
          <span>{wdErr}</span>
        </div>
      )}
      {canWithdraw && (
        <ConfirmActionButton
          action={() => wd.mutate()}
          isPending={wd.isPending}
          title="Withdraw Application"
          description="Are you sure you want to withdraw this application? You can re-apply later."
          confirmLabel="Yes, withdraw"
          variant="destructive"
        >
          <Trash2Icon className="size-4" /> Withdraw Application
        </ConfirmActionButton>
      )}
    </div>
  );
}
