import { z } from "zod";
import { WorkMode, EmploymentType } from "@/app/generated/prisma/enums";

export const JobCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  locations: z.array(z.string()).min(1, "At least one location is required"),
  workMode: z.nativeEnum(WorkMode),
  employmentType: z.nativeEnum(EmploymentType),
  timezone: z.string().optional().or(z.literal("")).default(""),
  skills: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  experienceLevel: z.string().min(1, "Experience level is required"),
  salaryMin: z.coerce.number().int().min(0).optional(),
  salaryMax: z.coerce.number().int().min(0).optional(),
  salaryCurrency: z.string().default("USD"),
  applicationDeadline: z.string().optional().or(z.literal("")).default(""),
});

export const JobUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  locations: z.array(z.string()).min(1, "At least one location is required").optional(),
  workMode: z.nativeEnum(WorkMode).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  timezone: z.string().optional().or(z.literal("")).default("").optional(),
  skills: z.array(z.string()).default([]).optional(),
  tags: z.array(z.string()).default([]).optional(),
  experienceLevel: z.string().min(1, "Experience level is required").optional(),
  salaryMin: z.coerce.number().int().min(0).optional(),
  salaryMax: z.coerce.number().int().min(0).optional(),
  salaryCurrency: z.string().default("USD").optional(),
  applicationDeadline: z.string().optional().or(z.literal("")).default("").optional(),
});

export const RecruiterListJobsParamsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  status: z.enum(["draft", "active", "archived", "all"]).optional().default("all"),
  workMode: z.nativeEnum(WorkMode).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  experienceLevel: z.string().optional(),
  sortBy: z
    .enum(["title", "createdAt", "updatedAt", "viewCount", "status"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const RecruiterToggleJobStatusSchema = z.object({
  status: z.enum(["active", "archived"]),
});

export type JobFormInput = z.infer<typeof JobCreateSchema>;
export type JobUpdateInput = z.infer<typeof JobUpdateSchema>;
export type JobListParams = z.infer<typeof RecruiterListJobsParamsSchema>;
export type JobToggleInput = z.infer<typeof RecruiterToggleJobStatusSchema>;
