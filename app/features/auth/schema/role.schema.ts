import { z } from "zod";

export const Roles = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  RECRUITER: "recruiter",
  USER: "user",
} as const;

export const RoleSchema = z.enum([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.RECRUITER, Roles.USER]);

export type RoleType = z.infer<typeof RoleSchema>;
