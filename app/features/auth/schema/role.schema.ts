import { z } from "zod";

export const Roles = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  USER: "user",
} as const;

export const RoleSchema = z.enum([Roles.ADMIN, Roles.RECRUITER, Roles.USER]);

export type RoleType = z.infer<typeof RoleSchema>;
