import { z } from "zod/v4";
import { BulkEmailsSchema } from "@/lib/batch-helpers";

export const RecruiterInviteSchema = z.object({
  email: z.string().email(),
});

export type RecruiterInviteInput = z.infer<typeof RecruiterInviteSchema>;

export const RecruiterAcceptInviteSchema = z.object({
  token: z.string().min(1),
});

export type RecruiterAcceptInviteInput = z.infer<typeof RecruiterAcceptInviteSchema>;

export const RecruiterBulkInviteFormSchema = z.object({
  emailsRaw: z.string().min(1, "At least one email is required"),
});

export type RecruiterBulkInviteFormInput = z.infer<typeof RecruiterBulkInviteFormSchema>;

export const RecruiterBulkInviteSchema = z.object({
  emails: BulkEmailsSchema,
});

export type RecruiterBulkInviteInput = z.infer<typeof RecruiterBulkInviteSchema>;
