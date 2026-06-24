import { z } from "zod/v4";

export const BulkEmailsSchema = z
  .string()
  .min(1, "At least one email is required")
  .transform((raw) =>
    raw
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0),
  )
  .pipe(
    z
      .array(z.string().email("Invalid email address"))
      .min(1, "At least one valid email is required")
      .max(50, "Maximum 50 emails at a time")
      .transform((emails) => [...new Set(emails)]),
  );

export type BulkEmailsInput = z.infer<typeof BulkEmailsSchema>;
