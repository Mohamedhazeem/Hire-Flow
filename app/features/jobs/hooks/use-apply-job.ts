"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import type { ApplyInput } from "@/app/features/jobs/schema/application-submit.schema";

export function useApplyJob(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ApplyInput) =>
      apiClient<{ data: { id: string; status: string } }>(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
    },
  });
}
