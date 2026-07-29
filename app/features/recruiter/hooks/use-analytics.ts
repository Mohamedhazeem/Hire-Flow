import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import type { ApiResponse } from "@/lib/api/api-response";
import type { AnalyticsFilter, AnalyticsResponse } from "../schema/analytics.schema";

function filterToParams(filter: AnalyticsFilter): Record<string, string> {
  const params: Record<string, string> = {};
  if (filter.jobId) params.jobId = filter.jobId;
  if (filter.dateFrom) params.dateFrom = filter.dateFrom;
  if (filter.dateTo) params.dateTo = filter.dateTo;
  if (filter.status) params.status = filter.status;
  if (filter.workMode) params.workMode = filter.workMode;
  if (filter.employmentType) params.employmentType = filter.employmentType;
  if (filter.location) params.location = filter.location;
  return params;
}

export function useAnalytics(filter: AnalyticsFilter) {
  return useQuery<AnalyticsResponse>({
    queryKey: ["recruiter", "analytics", filter],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<AnalyticsResponse>>("/api/recruiter/analytics", {
        params: filterToParams(filter),
      });
      return res.data;
    },
  });
}

export function useJobAnalytics(jobId: string, filter: AnalyticsFilter) {
  return useQuery<AnalyticsResponse>({
    queryKey: ["recruiter", "analytics", jobId, filter],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<AnalyticsResponse>>(`/api/recruiter/jobs/${jobId}/analytics`, {
        params: filterToParams(filter),
      });
      return res.data;
    },
    enabled: !!jobId,
  });
}
