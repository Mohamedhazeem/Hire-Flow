import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AdminListJobsParams } from "@/app/features/admin/schema/admin.schema";
import type { AdminJobListResult } from "@/app/features/admin/queries/job-queries";
import { ApiResponse } from "@/lib/api-response";

export function useAdminJobs(params: AdminListJobsParams) {
  return useQuery<ApiResponse<AdminJobListResult>>({
    queryKey: ["admin", "jobs", params],
    queryFn: () => apiClient(`/api/admin/jobs`, { params: params as Record<string, unknown> }),
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => apiClient(`/api/admin/jobs/${jobId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
    },
  });
}

export function useToggleJobStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, isActive }: { jobId: string; isActive: boolean }) =>
      apiClient(`/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        body: { isActive },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
    },
  });
}
