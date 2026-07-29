import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import type {
  AnalyticsFilter,
  AnalyticsResponse,
  TrendPoint,
  FunnelStage,
  FunnelHistorical,
  StageConversion,
  JobBreakdownRow,
} from "../schema/analytics.schema";
import { FUNNEL_STAGE_ORDER } from "../schema/analytics.schema";

const BI_ZERO = BigInt(0);

type RawTrendRow = { date: string; count: bigint };
type RawFunnelRow = { stage: string; uniqueApplications: bigint };
type RawConversionRow = { fromStage: string; toStage: string; count: bigint };
type RawJobBreakdownRow = {
  jobId: string;
  title: string;
  totalApplications: bigint;
  hired: bigint;
  viewCount: bigint;
};

type Fragments = {
  all: Prisma.Sql[];
  allNoJobId: Prisma.Sql[];
  joinConditions: Prisma.Sql[];
  companyCondition: Prisma.Sql;
};

function defaultDateRange(): { dateFrom: string; dateTo: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10),
  };
}

function buildWhereFragments(params: {
  companyId: string;
  dateFrom: string;
  dateTo: string;
  status?: string;
  workMode?: string;
  employmentType?: string;
  location?: string;
  jobId?: string;
}): Fragments {
  const companyCondition = Prisma.sql`j."companyId" = ${params.companyId}::text`;
  const timeConditions: Prisma.Sql[] = [
    Prisma.sql`a."appliedAt" >= ${params.dateFrom}::date`,
    Prisma.sql`a."appliedAt" < (${params.dateTo}::date + interval '1 day')`,
  ];
  const filters: Prisma.Sql[] = [];

  if (params.status) {
    const items = params.status
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length > 0) {
      filters.push(
        Prisma.sql`a."status" IN (${Prisma.join(items.map((i) => Prisma.sql`${i}::text`))})`,
      );
    }
  }

  if (params.workMode) {
    const items = params.workMode
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    if (items.length > 0) {
      filters.push(
        Prisma.sql`j."workMode"::text IN (${Prisma.join(items.map((i) => Prisma.sql`${i}::text`))})`,
      );
    }
  }

  if (params.employmentType) {
    const items = params.employmentType
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (items.length > 0) {
      filters.push(
        Prisma.sql`j."employmentType"::text IN (${Prisma.join(items.map((i) => Prisma.sql`${i}::text`))})`,
      );
    }
  }

  if (params.location) {
    const items = params.location
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);
    if (items.length > 0) {
      filters.push(
        Prisma.sql`j."locations" && ARRAY[${Prisma.join(items.map((i) => Prisma.sql`${i}::text`))}]`,
      );
    }
  }

  const jobIdFilter = params.jobId ? Prisma.sql`a."jobId" = ${params.jobId}::text` : null;

  const all = jobIdFilter
    ? [companyCondition, ...timeConditions, ...filters, jobIdFilter]
    : [companyCondition, ...timeConditions, ...filters];
  const allNoJobId = [companyCondition, ...timeConditions, ...filters];
  const joinConditions = [...timeConditions, ...filters];

  return { all, allNoJobId, joinConditions, companyCondition };
}

function whereFrom(fragments: Prisma.Sql[]): Prisma.Sql {
  if (fragments.length === 0) return Prisma.sql``;
  return Prisma.sql`WHERE ${Prisma.join(fragments, " AND ")}`;
}

function reconstructFunnelOrder(raw: Array<{ status: string; count: bigint }>): FunnelStage[] {
  const map = new Map(raw.map((r) => [r.status, Number(r.count)]));
  const ordered: FunnelStage[] = FUNNEL_STAGE_ORDER.map((stage) => ({
    stage,
    count: map.get(stage) ?? 0,
  }));
  const rejected = map.get("rejected") ?? 0;
  if (rejected > 0) {
    ordered.push({ stage: "rejected", count: rejected });
  }
  return ordered;
}

export async function getAnalytics(
  companyId: string,
  filter: AnalyticsFilter,
): Promise<AnalyticsResponse> {
  const defaults = defaultDateRange();
  const from = filter.dateFrom ?? defaults.dateFrom;
  const to = filter.dateTo ?? defaults.dateTo;

  const frags = buildWhereFragments({
    companyId,
    dateFrom: from,
    dateTo: to,
    status: filter.status,
    workMode: filter.workMode,
    employmentType: filter.employmentType,
    location: filter.location,
    jobId: filter.jobId,
  });

  const appWhere = whereFrom(frags.all);

  const breakdownJoin =
    frags.joinConditions.length > 0
      ? Prisma.sql` AND (${Prisma.join(frags.joinConditions, " AND ")})`
      : Prisma.sql``;

  const totalJobsSQL = filter.jobId
    ? Prisma.sql`SELECT COUNT(*)::BIGINT AS v FROM "job" j WHERE j."companyId" = ${companyId}::text AND j."id" = ${filter.jobId}::text`
    : Prisma.sql`SELECT COUNT(*)::BIGINT AS v FROM "job" j WHERE j."companyId" = ${companyId}::text`;

  const [
    totalApplications,
    hiredCount,
    trendRaw,
    statusRaw,
    workModeRaw,
    employmentTypeRaw,
    topJobsRaw,
    funnelHistoricalRaw,
    conversionsRaw,
    fulfillmentRaw,
    breakdownRaw,
    totalJobsRaw,
  ] = await Promise.all([
    prisma.$queryRaw<[{ count: bigint }?]>(Prisma.sql`
      SELECT COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${appWhere}
    `),
    prisma.$queryRaw<[{ count: bigint }?]>(Prisma.sql`
      SELECT COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${appWhere} AND a."status" = 'hired'
    `),
    prisma.$queryRaw<RawTrendRow[]>(Prisma.sql`
      SELECT TO_CHAR(a."appliedAt", 'YYYY-MM-DD') AS date, COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${appWhere} GROUP BY TO_CHAR(a."appliedAt", 'YYYY-MM-DD') ORDER BY date ASC
    `),
    prisma.$queryRaw<Array<{ status: string; count: bigint }>>(Prisma.sql`
      SELECT a."status", COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${appWhere} GROUP BY a."status" ORDER BY count DESC
    `),
    prisma.$queryRaw<Array<{ workMode: string; count: bigint }>>(Prisma.sql`
      SELECT j."workMode"::text, COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${appWhere} GROUP BY j."workMode"::text ORDER BY count DESC
    `),
    prisma.$queryRaw<Array<{ employmentType: string; count: bigint }>>(Prisma.sql`
      SELECT j."employmentType"::text, COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${appWhere} GROUP BY j."employmentType"::text ORDER BY count DESC
    `),
    prisma.$queryRaw<Array<{ jobId: string; title: string; count: bigint }>>(Prisma.sql`
      SELECT a."jobId" AS "jobId", j."title", COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${appWhere} GROUP BY a."jobId", j."title" ORDER BY count DESC LIMIT 10
    `),
    prisma.$queryRaw<RawFunnelRow[]>(Prisma.sql`
      SELECT asc_ref."toStatus" AS stage, COUNT(DISTINCT asc_ref."applicationId")::BIGINT AS "uniqueApplications" FROM "application_status_change" asc_ref JOIN "application" a ON asc_ref."applicationId" = a."id" JOIN "job" j ON a."jobId" = j."id" ${appWhere} GROUP BY asc_ref."toStatus" ORDER BY MIN(asc_ref."createdAt") ASC
    `),
    prisma.$queryRaw<RawConversionRow[]>(Prisma.sql`
      SELECT asc_ref."fromStatus" AS "fromStage", asc_ref."toStatus" AS "toStage", COUNT(*)::BIGINT AS count FROM "application_status_change" asc_ref JOIN "application" a ON asc_ref."applicationId" = a."id" JOIN "job" j ON a."jobId" = j."id" ${appWhere} GROUP BY asc_ref."fromStatus", asc_ref."toStatus" ORDER BY count DESC
    `),
    prisma.$queryRaw<[{ avg: string | null }?]>(Prisma.sql`
      SELECT AVG(EXTRACT(EPOCH FROM (a."updatedAt" - a."appliedAt")) / 86400)::TEXT AS avg FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${appWhere} AND a."status" = 'hired'
    `),
    prisma.$queryRaw<RawJobBreakdownRow[]>(Prisma.sql`
      SELECT j."id" AS "jobId", j."title",
        COUNT(DISTINCT a."id")::BIGINT AS "totalApplications",
        COUNT(DISTINCT CASE WHEN a."status" = 'hired' THEN a."id" END)::BIGINT AS hired,
        j."viewCount"::BIGINT AS "viewCount"
      FROM "job" j
      LEFT JOIN "application" a ON a."jobId" = j."id"
      ${breakdownJoin}
      WHERE j."companyId" = ${companyId}::text
      GROUP BY j."id", j."title", j."viewCount"
      ORDER BY "totalApplications" DESC
      LIMIT 50
    `),
    prisma.$queryRaw<[{ v: bigint }?]>(totalJobsSQL),
  ]);

  const totalApps = Number(totalApplications?.[0]?.count ?? BI_ZERO);
  const hired = Number(hiredCount?.[0]?.count ?? BI_ZERO);
  const conversionRate = totalApps > 0 ? (hired / totalApps) * 100 : 0;
  const avgFulfillmentDays = fulfillmentRaw?.[0]?.avg
    ? Math.round(parseFloat(fulfillmentRaw[0].avg) * 10) / 10
    : null;

  const totalViews = breakdownRaw.reduce((sum, row) => sum + Number(row.viewCount), 0);
  const totalJobs = Number(totalJobsRaw?.[0]?.v ?? BI_ZERO);

  const applicationTrend: TrendPoint[] = trendRaw.map((r) => ({
    date: r.date,
    count: Number(r.count),
  }));

  const applicationsByStatus: FunnelStage[] = reconstructFunnelOrder(statusRaw);
  const funnelCurrent = applicationsByStatus.filter((s) => s.stage !== "rejected");

  const applicationsByWorkMode = workModeRaw.map((r) => ({
    workMode: r.workMode,
    count: Number(r.count),
  }));

  const applicationsByEmploymentType = employmentTypeRaw.map((r) => ({
    employmentType: r.employmentType,
    count: Number(r.count),
  }));

  const topJobsByApplications = topJobsRaw.map((r) => ({
    jobId: r.jobId,
    title: r.title,
    count: Number(r.count),
  }));

  const funnelHistorical: FunnelHistorical[] = funnelHistoricalRaw.map((r) => ({
    stage: r.stage,
    uniqueApplications: Number(r.uniqueApplications),
  }));

  const stageConversions: StageConversion[] = conversionsRaw.map((r) => ({
    fromStage: r.fromStage,
    toStage: r.toStage,
    count: Number(r.count),
  }));

  const jobBreakdown: JobBreakdownRow[] = breakdownRaw.map((r) => ({
    jobId: r.jobId,
    title: r.title,
    totalApplications: Number(r.totalApplications),
    hired: Number(r.hired),
    conversionRate:
      Number(r.totalApplications) > 0 ? (Number(r.hired) / Number(r.totalApplications)) * 100 : 0,
    avgFulfillmentDays: null,
    viewCount: Number(r.viewCount),
  }));

  return {
    dateRange: { from, to },
    summary: {
      totalApplications: totalApps,
      totalJobs,
      totalHired: hired,
      conversionRate,
      avgFulfillmentDays,
      totalViews,
    },
    applicationTrend,
    applicationsByStatus,
    applicationsByWorkMode,
    applicationsByEmploymentType,
    topJobsByApplications,
    funnelCurrent,
    funnelHistorical,
    stageConversions,
    jobBreakdown,
  };
}

export async function getJobAnalytics(
  companyId: string,
  jobId: string,
  filter: AnalyticsFilter,
): Promise<AnalyticsResponse> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, companyId: true },
  });

  if (!job || job.companyId !== companyId) {
    const { NotFoundError } = await import("@/lib/api/api-error");
    throw new NotFoundError("Job not found");
  }

  return getAnalytics(companyId, { ...filter, jobId });
}
