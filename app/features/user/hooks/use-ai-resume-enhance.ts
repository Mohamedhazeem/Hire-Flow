"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import type { EnhancementsResponse } from "@/app/features/user/schema/resume-ai.schema";

export function useAiResumeEnhance(resumeId: string) {
  return useMutation({
    mutationFn: async (): Promise<EnhancementsResponse | null> =>
      apiClient<{ data: EnhancementsResponse | null }>(`/api/user/resumes/${resumeId}/ai-enhance`, {
        method: "POST",
      }).then((r) => r.data),
  });
}
