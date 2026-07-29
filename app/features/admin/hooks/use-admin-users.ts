import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import type { AdminListUsersParams, AdminBanUserInput } from "@/app/features/admin/schema/admin.schema";
import type { AdminUserListResult, AdminUserDetail } from "@/app/features/admin/queries/user-queries";
import type { ApiResponse } from "@/lib/api/api-response";

export function useAdminUsers(params: AdminListUsersParams) {
  return useQuery<AdminUserListResult>({
    queryKey: ["admin", "users", params],
    queryFn: () => apiClient("/api/admin/users", { params: params as Record<string, unknown> }),
  });
}

export function useAdminUser(id: string) {
  return useQuery<AdminUserDetail>({
    queryKey: ["admin", "users", id],
    queryFn: () => apiClient(`/api/admin/users/${id}`),
    enabled: !!id,
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, ...input }: AdminBanUserInput & { userId: string }) =>
      apiClient(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      apiClient(`/api/admin/users/${userId}/unban`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => apiClient(`/api/admin/users/${userId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useSetUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiClient(`/api/admin/users/${userId}/role`, {
        method: "POST",
        body: { role },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useRevokeUserSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => apiClient(`/api/admin/users/${userId}/sessions`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: Error) => {
      console.error("Failed to revoke sessions:", error.message);
    },
  });
}

export function useAdminUserApplications(userId: string) {
  return useQuery<
    ApiResponse<{
      applications: {
        id: string;
        jobId: string;
        jobTitle: string;
        status: string;
        appliedAt: string;
        updatedAt: string;
      }[];
    }>
  >({
    queryKey: ["admin", "user-applications", userId],
    queryFn: () => apiClient(`/api/admin/users/${userId}/applications`),
    enabled: !!userId,
  });
}
