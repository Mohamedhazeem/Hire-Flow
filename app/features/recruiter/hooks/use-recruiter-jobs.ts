import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import type { JobListParams, JobFormInput } from "@/app/features/recruiter/schema/job.schema";
import type { RecruiterJobListResult } from "@/app/features/recruiter/queries/job-queries";
import type { ApiResponse } from "@/lib/api/api-response";

export function useRecruiterJobs(params: JobListParams) {
  return useQuery<ApiResponse<RecruiterJobListResult>>({
    queryKey: ["recruiter", "jobs", params],
    queryFn: () => apiClient(`/api/recruiter/jobs`, { params: params as Record<string, unknown> }),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: JobFormInput) => apiClient("/api/recruiter/jobs", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter", "jobs"] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<JobFormInput> }) =>
      apiClient(`/api/recruiter/jobs/${id}`, { method: "PATCH", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter", "jobs"] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) =>
      apiClient(`/api/recruiter/jobs/${id}`, {
        method: "DELETE",
        params: force ? { force: "true" } : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter", "jobs"] });
    },
  });
}

export function useToggleJobStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "archived" }) =>
      apiClient(`/api/recruiter/jobs/${id}/toggle`, {
        method: "PATCH",
        body: { status },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter", "jobs"] });
    },
  });
}
