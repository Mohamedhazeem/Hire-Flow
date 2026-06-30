import { z } from "zod/v4";

export const ResumeSuggestionSchema = z.object({
  type: z.enum(["bullet_improvement", "skill_addition", "section_expansion", "ats_optimization", "grammar"]),
  section: z.string(),
  original: z.string().optional(),
  suggestion: z.string(),
  reasoning: z.string().max(500),
  priority: z.enum(["high", "medium", "low"]),
});

export const EnhancementsResponseSchema = z.object({
  suggestions: z.array(ResumeSuggestionSchema),
  overallScore: z.number().min(0).max(100),
  keyStrengths: z.array(z.string()),
  improvementAreas: z.array(z.string()),
});

export const AiEnhanceRequestSchema = z.object({
  resumeId: z.string(),
});

export const ApplyAiSuggestionsSchema = z.object({
  resumeId: z.string(),
  suggestions: z.array(ResumeSuggestionSchema),
});

export type ResumeSuggestion = z.infer<typeof ResumeSuggestionSchema>;
export type EnhancementsResponse = z.infer<typeof EnhancementsResponseSchema>;
