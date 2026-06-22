import { z } from "zod/v4";
import { RoleSchema } from "@/app/features/auth/schema/role.schema";

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
