import { z } from "zod/v4";

export const BuilderEducationSchema = z.object({
  school: z.string().min(1, "School is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field of study is required"),
  graduationYear: z.coerce.number().int().min(1950).max(2099),
});

export const BuilderExperienceSchema = z.object({
  company: z.string().min(1, "Company is required"),
  title: z.string().min(1, "Title is required"),
  startYear: z.coerce.number().int().min(1950).max(2099),
  endYear: z.coerce.number().int().min(1950).max(2099).nullable(),
  description: z.string().max(2000).optional(),
});

export const BuilderResumeSchema = z.object({
  label: z.string().min(1, "Label is required").max(255),
  summary: z.string().max(2000).optional(),
  educations: z.array(BuilderEducationSchema).max(10).optional().default([]),
  experiences: z.array(BuilderExperienceSchema).max(10).optional().default([]),
  skills: z.array(z.string().min(1)).max(50).optional().default([]),
});

export type BuilderEducationInput = z.input<typeof BuilderEducationSchema>;
export type BuilderExperienceInput = z.input<typeof BuilderExperienceSchema>;
export type BuilderResumeInput = z.input<typeof BuilderResumeSchema>;
