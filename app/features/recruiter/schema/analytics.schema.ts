import { z } from "zod";
import { WorkMode, EmploymentType } from "@/app/generated/prisma/enums";
import { APPLICATION_STATUSES } from "./application.schema";

export const AnalyticsFilterSchema = z
  .object({
    jobId: z.uuid().optional(),
    dateFrom: z.iso.date().optional(),
    dateTo: z.iso.date().optional(),
    status: z.string().optional(),
    workMode: z.enum(Object.values(WorkMode) as [string, ...string[]]).optional(),
    employmentType: z.enum(Object.values(EmploymentType) as [string, ...string[]]).optional(),
    location: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
      }
      return true;
    },
    { message: "dateFrom must be before dateTo", path: ["dateFrom"] },
  )
  .refine(
    (data) => {
      if (data.status === undefined) return true;
      if (data.status.trim() === "") return false;
      return data.status.split(",").every((s) => APPLICATION_STATUSES.includes(s as (typeof APPLICATION_STATUSES)[number]));
    },
    { message: "Invalid status value", path: ["status"] },
  );

export type AnalyticsFilter = z.infer<typeof AnalyticsFilterSchema>;

export type TrendPoint = {
  date: string;
  count: number;
};

export type FunnelStage = {
  stage: string;
  count: number;
};

export type FunnelHistorical = {
  stage: string;
  uniqueApplications: number;
};

export type StageConversion = {
  fromStage: string;
  toStage: string;
  count: number;
};

export type SummaryStats = {
  totalApplications: number;
  totalJobs: number;
  totalHired: number;
  conversionRate: number;
  avgFulfillmentDays: number | null;
  totalViews: number;
};

export type JobBreakdownRow = {
  jobId: string;
  title: string;
  totalApplications: number;
  hired: number;
  conversionRate: number;
  avgFulfillmentDays: number | null;
  viewCount: number;
};

export type AnalyticsResponse = {
  dateRange: { from: string; to: string };
  summary: SummaryStats;
  applicationTrend: TrendPoint[];
  applicationsByStatus: FunnelStage[];
  applicationsByWorkMode: Array<{ workMode: string; count: number }>;
  applicationsByEmploymentType: Array<{ employmentType: string; count: number }>;
  topJobsByApplications: Array<{ jobId: string; title: string; count: number }>;
  funnelCurrent: FunnelStage[];
  funnelHistorical: FunnelHistorical[];
  stageConversions: StageConversion[];
  jobBreakdown: JobBreakdownRow[];
};

export const FUNNEL_STAGE_ORDER = [...APPLICATION_STATUSES.filter((s) => s !== "rejected")];

export const CHART_COLORS: Record<string, string> = {
  applied: "#3b82f6",
  reviewing: "#a855f7",
  shortlisted: "#f59e0b",
  interview_scheduled: "#06b6d4",
  offered: "#22c55e",
  hired: "#10b981",
  rejected: "#ef4444",
};

export const WORKMODE_COLORS: Record<string, string> = {
  remote: "#22c55e",
  hybrid: "#a855f7",
  onsite: "#f97316",
};

export const EMPLOYMENT_TYPE_COLORS: Record<string, string> = {
  full_time: "#3b82f6",
  part_time: "#f59e0b",
  contract: "#a855f7",
  internship: "#06b6d4",
};
