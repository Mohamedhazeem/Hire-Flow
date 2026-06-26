"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";
import type { ApplicantDetailResponse } from "@/app/features/recruiter/libs/get-applicant-detail";
import type { StatusTransitionInput } from "@/app/features/recruiter/schema/application.schema";

export function useApplicantDetail(applicationId: string) {
  return useQuery<ApiResponse<ApplicantDetailResponse>>({
    queryKey: ["recruiter", "applicant-detail", applicationId],
    queryFn: () =>
      apiClient(`/api/recruiter/applications/${applicationId}/detail`),
    enabled: !!applicationId,
  });
}

export function useTransitionStatusWithRefresh(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: StatusTransitionInput }) =>
      apiClient(`/api/recruiter/applications/${applicationId}/status`, {
        method: "PATCH",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recruiter", "applicant-detail", applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["recruiter", "applicants"] });
    },
  });
}
