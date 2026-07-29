import { z } from "zod/v4";

export const APPLICATION_STATUSES = [
  "applied",
  "invited",
  "reviewing",
  "shortlisted",
  "interview_scheduled",
  "offered",
  "hired",
  "rejected",
  "withdrawn",
] as const;

export const ApplicationStatusSchema = z.enum(APPLICATION_STATUSES);

/** Status transition rules — maps current status → allowed next statuses */
export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  applied: ["invited", "reviewing", "rejected"],
  invited: ["reviewing", "rejected"],
  reviewing: ["shortlisted", "rejected"],
  shortlisted: ["interview_scheduled", "rejected"],
  interview_scheduled: ["offered", "rejected"],
  offered: ["hired", "rejected"],
  hired: [],
  rejected: [],
};

export const TransitionStatusSchema = z.enum(APPLICATION_STATUSES);

// ── List Applicants Params (from URL searchParams) ──────────────────────────

export const ListApplicantsParamsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  status: ApplicationStatusSchema.optional(),
  sortBy: z.enum(["appliedAt", "updatedAt", "status"]).optional().default("appliedAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type ListApplicantsParams = z.infer<typeof ListApplicantsParamsSchema>;

// ── Status Transition Body ────────────────────────────────────────────────

const baseTransitionSchema = z.object({
  status: ApplicationStatusSchema,
  updatedAt: z.iso.datetime({ offset: true }).optional(),
  email: z.boolean().optional().default(false),
});

export const ShortlistSchema = baseTransitionSchema;

export const ScheduleInterviewSchema = baseTransitionSchema.extend({
  interviewDate: z.iso.datetime({ offset: true }),
  meetingLink: z.string().optional().or(z.literal("")).default(""),
});

export const SendOfferSchema = baseTransitionSchema.extend({
  offerDetails: z.string().min(1, "Offer details are required"),
});

export const RejectSchema = baseTransitionSchema.extend({
  rejectionReason: z.string().min(1, "Rejection reason is required"),
});

export const StatusTransitionSchema = z.union([
  RejectSchema,
  ScheduleInterviewSchema,
  SendOfferSchema,
  ShortlistSchema,
]);

export type StatusTransitionInput = z.infer<typeof StatusTransitionSchema>;

// ── Bulk Status Transition Body ──────────────────────────────────────────

export const BulkStatusTransitionSchema = z
  .object({
    applicationIds: z.array(z.string()).min(1).max(50),
    status: ApplicationStatusSchema,
    rejectionReason: z.string().min(1).max(500).optional(),
    email: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (
      data.status === "rejected" &&
      (!data.rejectionReason || data.rejectionReason.trim().length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Rejection reason is required when rejecting",
        path: ["rejectionReason"],
      });
    }
  });

export type BulkStatusTransitionInput = z.infer<typeof BulkStatusTransitionSchema>;
