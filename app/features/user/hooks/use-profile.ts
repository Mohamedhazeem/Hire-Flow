import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import type { ProfileOutput } from "@/app/features/user/schema/profile.schema";

export function useProfile() {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      const res = await apiClient<{ data: ProfileOutput }>("/api/user/profile");
      return res.data;
    },
  });
}
