import { z } from "zod/v4";
import { RoleSchema } from "@/app/features/auth/schema/role.schema";
import { WorkMode, EmploymentType } from "@/app/generated/prisma/enums";

export const AdminListUsersParamsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  role: RoleSchema.optional(),
  banned: z
    .union([z.literal("true"), z.literal("false"), z.literal("all")])
    .optional()
    .default("all"),
  sortBy: z.enum(["name", "email", "role", "createdAt", "updatedAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type AdminListUsersParams = z.infer<typeof AdminListUsersParamsSchema>;

export const AdminBanUserSchema = z.object({
  banReason: z.string().max(500).optional(),
  banExpiresIn: z.coerce.number().int().positive().optional(),
});

export type AdminBanUserInput = z.infer<typeof AdminBanUserSchema>;

export const AdminInviteSchema = z.object({
  email: z.string().email(),
});

export type AdminInviteInput = z.infer<typeof AdminInviteSchema>;

export const AdminAcceptInviteSchema = z.object({
  token: z.string().min(1),
});

export type AdminAcceptInviteInput = z.infer<typeof AdminAcceptInviteSchema>;


// ------ Bulk Invite Schema ------

// Raw form value — textarea stores a single string
export const AdminBulkInviteFormSchema = z.object({
  emailsRaw: z.string().min(1, "At least one email is required"),
});

export type AdminBulkInviteFormInput = z.infer<typeof AdminBulkInviteFormSchema>;

// Server-side validated result — parsed + deduplicated array
export const AdminBulkInviteSchema = z.object({
  emails: z
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
    ),
});

export type AdminBulkInviteInput = z.infer<typeof AdminBulkInviteSchema>;

// ------ Admin Job List Schema ------

export const AdminListJobsParamsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  status: z.enum(["active", "inactive", "all"]).optional().default("all"),
  workMode: z.nativeEnum(WorkMode).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  experienceLevel: z.string().optional(),
  sortBy: z.enum(["title", "createdAt", "updatedAt", "viewCount", "isActive"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type AdminListJobsParams = z.infer<typeof AdminListJobsParamsSchema>;

// ------ Admin Toggle Job Status Schema ------

export const AdminToggleJobStatusSchema = z.object({
  isActive: z.boolean(),
});

export type AdminToggleJobStatusInput = z.infer<typeof AdminToggleJobStatusSchema>;