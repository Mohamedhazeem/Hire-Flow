import { z } from "zod/v4";

export const APPLICATION_STATUSES = [
  "applied",
  "reviewing",
  "shortlisted",
  "interview_scheduled",
  "offered",
  "hired",
  "rejected",
  "withdrawn",
] as const;

export const UserApplicationStatusSchema = z.enum(APPLICATION_STATUSES);
export type UserApplicationStatus = z.infer<typeof UserApplicationStatusSchema>;
