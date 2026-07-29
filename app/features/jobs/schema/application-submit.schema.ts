import { z } from "zod/v4";

export const ApplySchema = z.object({
  resumeId: z.string().min(1, "Resume is required"),
  coverLetter: z
    .string()
    .max(5000)
    .optional()
    .transform((v) => v?.trim() || undefined),
});

export type ApplyInput = z.infer<typeof ApplySchema>;
