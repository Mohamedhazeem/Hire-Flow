"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ListApplicantsParams, StatusTransitionInput } from "@/app/features/recruiter/schema/application.schema";
import type { ApplicantListResult } from "@/app/features/recruiter/queries/application-queries";
import type { ApiResponse } from "@/lib/api-response";

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
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: StatusTransitionInput;
    }) =>
      apiClient(`/api/recruiter/applications/${applicationId}/status`, {
        method: "PATCH",
        body: data,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["recruiter", "applicants"] });
    },
  });
}
