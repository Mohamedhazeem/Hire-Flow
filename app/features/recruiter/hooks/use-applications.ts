"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import type {
  ListApplicantsParams,
  StatusTransitionInput,
  BulkStatusTransitionInput,
} from "@/app/features/recruiter/schema/application.schema";
import type { ApplicantListResult } from "@/app/features/recruiter/queries/application-queries";
import type { ApiResponse } from "@/lib/api/api-response";

export function useApplicants(jobId: string, params: ListApplicantsParams) {
  return useQuery<ApiResponse<ApplicantListResult>>({
    queryKey: ["recruiter", "applicants", jobId, params],
    queryFn: () =>
      apiClient(`/api/recruiter/jobs/${jobId}/applicants`, {
        params: params as Record<string, unknown>,
      }),
    enabled: !!jobId,
  });
}

export function useTransitionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: string; data: StatusTransitionInput }) =>
      apiClient(`/api/recruiter/applications/${applicationId}/status`, {
        method: "PATCH",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter", "applicants"] });
    },
  });
}

export function useBulkTransitionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkStatusTransitionInput) =>
      apiClient("/api/recruiter/applications/bulk/status", {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter", "applicants"] });
    },
  });
}

export function useRevertStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId }: { applicationId: string }) =>
      apiClient(`/api/recruiter/applications/${applicationId}/revert`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter", "applicants"] });
    },
  });
}
