"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";

export function useAdminApplicantDetail(applicationId: string) {
  return useQuery<ApiResponse<unknown>>({
    queryKey: ["admin", "applicant-detail", applicationId],
    queryFn: () =>
      apiClient(`/api/admin/applications/${applicationId}/detail`),
    enabled: !!applicationId,
  });
}
