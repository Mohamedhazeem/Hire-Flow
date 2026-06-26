import { z } from "zod/v4";

export const CompanyProfileSchema = z.object({
  name: z.string().min(1, "Company name is required").max(255),
  description: z.string().max(2000).optional().or(z.literal("")).default(""),
  website: z.string("Must be a valid URL").optional().or(z.literal("")).default(""),
  logoUrl: z.string().optional().or(z.literal("")).default(""),
  industry: z.string().max(100).optional().or(z.literal("")).default(""),
});

export type CompanyProfileInput = z.input<typeof CompanyProfileSchema>;
export type CompanyProfileOutput = z.output<typeof CompanyProfileSchema>;
