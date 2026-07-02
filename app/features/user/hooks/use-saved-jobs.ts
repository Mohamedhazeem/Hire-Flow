import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

type ToggleResponse = { bookmarked: boolean; id: string };
type CheckResponse = { bookmarked: boolean };

export function useBookmarkedIds() {
  return useQuery<string[]>({
    queryKey: ["user", "bookmarks", "ids"],
    queryFn: async () => {
      const res = await apiClient("/api/user/bookmarks") as { data: Array<{ jobId: string }> };
      return res.data.map((b) => b.jobId);
    },
    staleTime: 30_000,
  });
}

export function useBookmarkedJobs() {
  return useQuery({
    queryKey: ["user", "bookmarks", "jobs"],
    queryFn: async () => {
      const res = await apiClient("/api/user/bookmarks") as { data: Array<Record<string, unknown>> };
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useCheckBookmark(jobId: string) {
  return useQuery<CheckResponse>({
    queryKey: ["user", "bookmarks", "check", jobId],
    queryFn: async () => {
      const res = await apiClient<{ data: CheckResponse }>(`/api/user/bookmarks/${jobId}`);
      return res.data;
    },
    enabled: !!jobId,
    staleTime: 30_000,
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation<{ data: ToggleResponse }, Error, string>({
    mutationFn: async (jobId) => {
      return await apiClient<{ data: ToggleResponse }>("/api/user/bookmarks", {
        method: "POST",
        body: JSON.stringify({ jobId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "bookmarks", "ids"] });
      queryClient.invalidateQueries({ queryKey: ["user", "bookmarks", "jobs"] });
      queryClient.invalidateQueries({ queryKey: ["user", "bookmarks", "check"] });
    },
  });
}
