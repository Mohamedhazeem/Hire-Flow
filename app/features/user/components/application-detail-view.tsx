"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ApplicationHeader } from "./application-header";
import { ApplicationTimeline } from "./application-timeline";
import { ApplicationSections } from "./application-sections";
import { ApplicationResumeSection } from "./application-resume-section";
import { ApplicationActions } from "./application-actions";

export function ApplicationDetailView({ applicationId: propId }: { applicationId?: string }) {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const id = propId ?? (params.id as string);
  const [wdErr, setWdErr] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", "application", id],
    queryFn: async () => {
      const res = await apiClient<{ data: Record<string, unknown> }>(`/api/user/applications/${id}`);
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

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-4">
      <Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-72" /><Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );

  if (isError || !data) return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-16 text-center">
      <p className="text-text-muted">Application not found</p>
      <Link href="/user/applications" className="text-brand hover:underline text-sm mt-2 inline-block">Back to my applications</Link>
    </div>
  );

  const d = data as Record<string, unknown>;
  const jobTitle = String(d.jobTitle ?? (d.job as Record<string, unknown>)?.title ?? "");
  const companyName = String(d.jobCompanyName ?? ((d.job as Record<string, unknown>)?.company as Record<string, unknown>)?.name ?? "");
  const companyLogo = (d.jobCompanyLogo ?? ((d.job as Record<string, unknown>)?.company as Record<string, unknown>)?.logoUrl ?? null) as string | null;
  const locations = (d.jobLocations ?? []) as string[];
  const workMode = String(d.jobWorkMode ?? "");
  const salaryMin = d.jobSalaryMin as number | null;
  const salaryMax = d.jobSalaryMax as number | null;
  const salaryText = salaryMin != null || salaryMax != null ? `${String(d.jobSalaryCurrency ?? "USD")}${salaryMin?.toLocaleString("en-US") ?? ""} - ${String(d.jobSalaryCurrency ?? "USD")}${salaryMax?.toLocaleString("en-US") ?? ""}` : null;
  const status = String(d.status ?? "");
  const statusChanges = (d.statusChanges ?? []) as Array<Record<string, unknown>>;
  const timeline = statusChanges.map((sc) => ({ id: sc.id as string, fromStatus: sc.fromStatus as string | null, toStatus: sc.toStatus as string, createdAt: sc.createdAt as string }));
  const canWithdraw = status === "applied" || status === "reviewing";
  const builderData = d.resumeSnapshotBuilderData && typeof d.resumeSnapshotBuilderData === "object" ? (d.resumeSnapshotBuilderData as Record<string, unknown>) : null;
  const resumeSnapshotUrl = d.resumeSnapshotUrl as string | null;
  const rejectionReason = d.rejectionReason as string | null;
  const interviewDate = d.interviewDate as string | null;
  const meetingLink = d.meetingLink as string | null;
  const offerDetails = d.offerDetails as string | null;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6">
      <ApplicationHeader jobTitle={jobTitle} companyName={companyName} companyLogo={companyLogo} locations={locations} workMode={workMode} salaryText={salaryText} status={status} jobActive={d.jobActive as boolean} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ApplicationTimeline statusChanges={timeline} />
        <ApplicationSections rejectionReason={rejectionReason} interviewDate={interviewDate} meetingLink={meetingLink} offerDetails={offerDetails} />
      </div>
      <ApplicationResumeSection builderData={builderData} resumeSnapshotUrl={resumeSnapshotUrl} />
      <ApplicationActions canWithdraw={canWithdraw} isPending={wd.isPending} error={wdErr} onWithdraw={() => wd.mutate()} />
    </div>
  );
}
