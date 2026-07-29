import { z } from "zod/v4";
import { WorkMode } from "@/app/generated/prisma/enums";

export const ExperienceSchema = z.object({
  company: z.string().min(1, "Company is required"),
  title: z.string().min(1, "Title is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().nullable(),
  description: z.string().max(2000).optional(),
});

export const SocialLinkSchema = z.object({
  platform: z.enum(["linkedin", "github", "portfolio", "other"]),
  url: z.string().url("Must be a valid URL"),
  label: z.string().max(100).optional(),
});

export const ProfileSchema = z.object({
  headline: z.string().max(200).optional().or(z.literal("")).default(""),
  bio: z.string().max(2000).optional().or(z.literal("")).default(""),
  location: z.string().max(200).optional().or(z.literal("")).default(""),
  skills: z
    .array(z.string().min(1))
    .max(50)
    .transform((arr) => [...new Set(arr)]),
  workMode: z.nativeEnum(WorkMode).nullable().optional(),
  basePay: z.coerce.number().int().nonnegative().optional().nullable(),
  ctc: z.coerce.number().int().nonnegative().optional().nullable(),
  ectc: z.coerce.number().int().nonnegative().optional().nullable(),
  experiences: z.array(ExperienceSchema).max(20).optional().default([]),
  socialLinks: z.array(SocialLinkSchema).max(10).optional().default([]),
});

export type ProfileInput = z.input<typeof ProfileSchema>;
export type ProfileOutput = z.output<typeof ProfileSchema>;
export type ExperienceInput = z.input<typeof ExperienceSchema>;
export type SocialLinkInput = z.input<typeof SocialLinkSchema>;
