import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import type { ApiResponse } from "@/lib/api/api-response";
import type { DashboardStats } from "@/app/features/admin/queries/dashboard-queries";

export function useAdminDashboard() {
  return useQuery<DashboardStats>({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<DashboardStats>>("/api/admin/dashboard");
      return res.data;
    },
  });
}
