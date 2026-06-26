import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertCompany } from "@/app/features/recruiter/actions/upsert-company";
import type { CompanyProfileInput } from "@/app/features/recruiter/schema/company.schema";

export function useCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CompanyProfileInput) => {
      const result = await upsertCompany(input);

      if (!result.success) {
        throw new Error("Failed to save company profile");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter", "company"] });
    },
  });
}
