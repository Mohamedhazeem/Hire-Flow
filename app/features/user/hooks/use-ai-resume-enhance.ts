"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { applyAiSuggestions as applyAiSuggestionsAction } from "@/app/features/user/actions/apply-ai-suggestions";
import type { EnhancementsResponse, ResumeSuggestion } from "@/app/features/user/schema/resume-ai.schema";

export function useAiResumeEnhance(resumeId: string) {
  return useMutation({
    mutationFn: async (): Promise<{ data: EnhancementsResponse | null; message?: string }> =>
      apiClient(`/api/user/resumes/${resumeId}/ai-enhance`, { method: "POST" }),
  });
}

export function useApplyAiSuggestions(resumeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { suggestions: ResumeSuggestion[] }) =>
      applyAiSuggestionsAction({ resumeId, suggestions: input.suggestions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "resumes"] });
    },
  });
}
