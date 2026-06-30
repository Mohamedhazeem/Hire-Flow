import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type ResumeListItem = {
  id: string;
  label: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  builderData: unknown;
  isPrimary: boolean;
  createdAt: string;
};

type ListResponse = { data: ResumeListItem[] };

export function useResumes() {
  return useQuery({
    queryKey: ["user", "resumes"],
    queryFn: async () => {
      const res = await apiClient<ListResponse>("/api/user/resumes");
      return res.data;
    },
  });
}

export function useUploadResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiClient<{ data: ResumeListItem }>("/api/user/resumes", {
        method: "POST",
        body: formData,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "resumes"] });
    },
  });
}

export function useSetPrimaryResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient<{ data: ResumeListItem }>(`/api/user/resumes/${id}`, {
        method: "PATCH",
        body: { action: "set-primary" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "resumes"] });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient(`/api/user/resumes/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "resumes"] });
    },
  });
}

export function useUpdateBuilderData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await apiClient<{ data: ResumeListItem }>(`/api/user/resumes/${id}/builder-data`, {
        method: "PATCH",
        body: data,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "resumes"] });
    },
  });
}
