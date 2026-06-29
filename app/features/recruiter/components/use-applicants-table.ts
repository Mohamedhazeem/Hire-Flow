"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useApplicants,
  useBulkTransitionStatus,
  useRevertStatus,
} from "@/app/features/recruiter/hooks/use-applications";
import type { ListApplicantsParams, BulkStatusTransitionInput } from "@/app/features/recruiter/schema/application.schema";
import type { ApplicantRow } from "@/app/features/recruiter/queries/application-queries";
import { useSession } from "@/app/features/auth/libs/auth-client";
import { BULK_ACTION_LABELS } from "./applicant-table-constants";
import { addActionedIds } from "./applicant-table-utils";

export function useApplicantsTable(jobId: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const recruiterId = (session?.user as { id?: string })?.id ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";

  const [searchInput, setSearchInput] = useState(search);
  const [dialog, setDialog] = useState<{ type: string; applicant: ApplicantRow | null }>({ type: "", applicant: null });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDialog, setBulkDialog] = useState<string>("");
  const [actionedIds, setActionedIds] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [revertTarget, setRevertTarget] = useState<ApplicantRow | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bulkTransition = useBulkTransitionStatus();
  const revertTransition = useRevertStatus();

  const params: ListApplicantsParams = {
    page, pageSize: 20, sortBy: "appliedAt", sortOrder: "desc",
    search: search || undefined,
    status: status === "all" ? undefined : (status as ListApplicantsParams["status"]),
  };
  const { data, isLoading, isError } = useApplicants(jobId, params);

  const responseData = data?.data;
  const applicants = useMemo(() => responseData?.applicants ?? [], [responseData?.applicants]);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value && value !== "all") sp.set(key, value);
        else sp.delete(key);
      }
      router.push(`/recruiter/jobs/${jobId}/applicants?${sp.toString()}`);
    },
    [router, searchParams, jobId],
  );

  const selectedRows = useMemo(
    () => applicants.filter((a) => selectedIds.has(a.id) && !actionedIds.has(a.id)),
    [applicants, selectedIds, actionedIds],
  );

  useEffect(() => () => { if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current); }, []);

  const showFeedback = useCallback((type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 5000);
  }, []);

  const handleBulkAction = useCallback(
    (targetStatus: string) => {
      if (targetStatus === "rejected") { setBulkDialog("reject"); return; }
      const ids = [...selectedIds].filter((id) => !actionedIds.has(id));
      bulkTransition.mutate(
        { applicationIds: ids, status: targetStatus as BulkStatusTransitionInput["status"], email: false },
        {
          onSuccess: () => {
            showFeedback("success", `${ids.length} applicant${ids.length > 1 ? "s" : ""} moved to "${BULK_ACTION_LABELS[targetStatus] ?? targetStatus}"`);
            setActionedIds((prev) => addActionedIds(prev, ids)); setSelectedIds(new Set());
          },
          onError: (error: Error) => showFeedback("error", (error as { message?: string }).message ?? "Bulk action failed"),
        },
      );
    },
    [selectedIds, actionedIds, bulkTransition, showFeedback],
  );

  const handleBulkRejectConfirm = useCallback(
    (rejectionReason: string) => {
      const ids = [...selectedIds].filter((id) => !actionedIds.has(id));
      bulkTransition.mutate(
        { applicationIds: ids, status: "rejected", rejectionReason, email: false },
        {
          onSuccess: () => {
            showFeedback("success", `${ids.length} applicant${ids.length > 1 ? "s" : ""} rejected`);
            setActionedIds((prev) => addActionedIds(prev, ids)); setSelectedIds(new Set()); setBulkDialog("");
          },
          onError: (error: Error) => showFeedback("error", (error as { message?: string }).message ?? "Bulk rejection failed"),
        },
      );
    },
    [selectedIds, actionedIds, bulkTransition, showFeedback],
  );

  const handleRevert = useCallback(
    (applicantId: string) => {
      revertTransition.mutate({ applicationId: applicantId }, {
        onSuccess: () => { setActionedIds((prev) => { const n = new Set(prev); n.delete(applicantId); return n; }); showFeedback("success", "Applicant reverted to previous status"); },
        onError: (error: Error) => showFeedback("error", (error as { message?: string }).message ?? "Revert failed"),
      });
    },
    [revertTransition, showFeedback],
  );

  return {
    recruiterId, page, search, status, searchInput, setSearchInput,
    dialog, setDialog, selectedIds, setSelectedIds, bulkDialog, setBulkDialog,
    actionedIds, feedback, setFeedback, revertTarget, setRevertTarget,
    bulkTransition, revertTransition,
    responseData, applicants, isLoading, isError,
    selectedRows, updateParams,
    handleBulkAction, handleBulkRejectConfirm, handleRevert,
    searchParams,
  };
}
