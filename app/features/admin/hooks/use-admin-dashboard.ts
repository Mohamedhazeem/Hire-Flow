import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { DashboardStats } from "@/app/features/admin/queries/dashboard-queries";

export function useAdminDashboard() {
  return useQuery<DashboardStats>({
    queryKey: ["admin", "dashboard"],
    queryFn: () => apiClient("/api/admin/dashboard"),
  });
}