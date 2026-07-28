import prisma from "@/lib/prisma";
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

function defaultDateRange(): { dateFrom: string; dateTo: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10),
  };
}

type ClauseResult = { sql: string; params: unknown[] };

function buildWhereClauses(params: {
  companyId: string;
  dateFrom: string;
  dateTo: string;
  status?: string;
  workMode?: string;
  employmentType?: string;
  location?: string;
  jobId?: string;
}): ClauseResult {
  const clauses: string[] = [
    `j."companyId" = $1::text`,
    `a."appliedAt" >= $2::date`,
    `a."appliedAt" < ($3::date + interval '1 day')`,
  ];
  const values: unknown[] = [params.companyId, params.dateFrom, params.dateTo];
  const p = (value: unknown) => {
    values.push(value);
    return `$${values.length}`;
  };

  if (params.status) {
    const items = params.status
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length > 0) {
      clauses.push(`a."status" IN (${items.map((_, i) => `${p(items[i])}::text`).join(",")})`);
    }
  }

  if (params.workMode) {
    const items = params.workMode
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    if (items.length > 0) {
      clauses.push(
        `j."workMode"::text IN (${items.map((_, i) => `${p(items[i])}::text`).join(",")})`,
      );
    }
  }

  if (params.employmentType) {
    const items = params.employmentType
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (items.length > 0) {
      clauses.push(
        `j."employmentType"::text IN (${items.map((_, i) => `${p(items[i])}::text`).join(",")})`,
      );
    }
  }

  if (params.location) {
    const items = params.location
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);
    if (items.length > 0) {
      clauses.push(
        `j."locations" && ARRAY[${items.map((_, i) => `${p(items[i])}::text`).join(",")}]`,
      );
    }
  }

  if (params.jobId) {
    clauses.push(`a."jobId" = ${p(params.jobId)}::text`);
  }

  return { sql: clauses.join(" AND "), params: values };
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

function joinClauseFromWhere(whereSql: string): string {
  let sql = whereSql.replace(/^j\."companyId" = \$1::text AND /, "");
  sql = sql.replace(/AND a\."jobId" = \$\d+::text\s*$/, "");
  sql = sql.replace(/a\."jobId" = \$\d+::text AND /, "");
  return sql;
}

export async function getAnalytics(
  companyId: string,
  filter: AnalyticsFilter,
): Promise<AnalyticsResponse> {
  const defaults = defaultDateRange();
  const from = filter.dateFrom ?? defaults.dateFrom;
  const to = filter.dateTo ?? defaults.dateTo;

  const where = buildWhereClauses({
    companyId,
    dateFrom: from,
    dateTo: to,
    status: filter.status,
    workMode: filter.workMode,
    employmentType: filter.employmentType,
    location: filter.location,
    jobId: filter.jobId,
  });

  const whereSQL = "WHERE " + where.sql;

  const totalJobsSQL = filter.jobId
    ? `SELECT COUNT(*)::BIGINT AS v FROM "job" j WHERE j."companyId" = $1::text AND j."id" = $2::text`
    : `SELECT COUNT(*)::BIGINT AS v FROM "job" j WHERE j."companyId" = $1::text`;
  const totalJobsParams = filter.jobId ? [where.params[0], filter.jobId] : [where.params[0]];

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
    prisma.$queryRawUnsafe<[{ count: bigint }?]>(
      `SELECT COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${whereSQL}`,
      ...where.params,
    ),
    prisma.$queryRawUnsafe<[{ count: bigint }?]>(
      `SELECT COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${whereSQL} AND a."status" = 'hired'`,
      ...where.params,
    ),
    prisma.$queryRawUnsafe<RawTrendRow[]>(
      `SELECT TO_CHAR(a."appliedAt", 'YYYY-MM-DD') AS date, COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${whereSQL} GROUP BY TO_CHAR(a."appliedAt", 'YYYY-MM-DD') ORDER BY date ASC`,
      ...where.params,
    ),
    prisma.$queryRawUnsafe<Array<{ status: string; count: bigint }>>(
      `SELECT a."status", COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${whereSQL} GROUP BY a."status" ORDER BY count DESC`,
      ...where.params,
    ),
    prisma.$queryRawUnsafe<Array<{ workMode: string; count: bigint }>>(
      `SELECT j."workMode"::text, COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${whereSQL} GROUP BY j."workMode"::text ORDER BY count DESC`,
      ...where.params,
    ),
    prisma.$queryRawUnsafe<Array<{ employmentType: string; count: bigint }>>(
      `SELECT j."employmentType"::text, COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${whereSQL} GROUP BY j."employmentType"::text ORDER BY count DESC`,
      ...where.params,
    ),
    prisma.$queryRawUnsafe<Array<{ jobId: string; title: string; count: bigint }>>(
      `SELECT a."jobId" AS "jobId", j."title", COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${whereSQL} GROUP BY a."jobId", j."title" ORDER BY count DESC LIMIT 10`,
      ...where.params,
    ),
    prisma.$queryRawUnsafe<RawFunnelRow[]>(
      `SELECT asc_ref."toStatus" AS stage, COUNT(DISTINCT asc_ref."applicationId")::BIGINT AS "uniqueApplications" FROM "application_status_change" asc_ref JOIN "application" a ON asc_ref."applicationId" = a."id" JOIN "job" j ON a."jobId" = j."id" ${whereSQL} GROUP BY asc_ref."toStatus" ORDER BY MIN(asc_ref."createdAt") ASC`,
      ...where.params,
    ),
    prisma.$queryRawUnsafe<RawConversionRow[]>(
      `SELECT asc_ref."fromStatus" AS "fromStage", asc_ref."toStatus" AS "toStage", COUNT(*)::BIGINT AS count FROM "application_status_change" asc_ref JOIN "application" a ON asc_ref."applicationId" = a."id" JOIN "job" j ON a."jobId" = j."id" ${whereSQL} GROUP BY asc_ref."fromStatus", asc_ref."toStatus" ORDER BY count DESC`,
      ...where.params,
    ),
    prisma.$queryRawUnsafe<[{ avg: string | null }?]>(
      `SELECT AVG(EXTRACT(EPOCH FROM (a."updatedAt" - a."appliedAt")) / 86400)::TEXT AS avg FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${whereSQL} AND a."status" = 'hired'`,
      ...where.params,
    ),
    prisma.$queryRawUnsafe<RawJobBreakdownRow[]>(
      `SELECT j."id" AS "jobId", j."title", COUNT(DISTINCT a."id")::BIGINT AS "totalApplications", COUNT(DISTINCT CASE WHEN a."status" = 'hired' THEN a."id" END)::BIGINT AS hired, j."viewCount"::BIGINT AS "viewCount" FROM "job" j LEFT JOIN "application" a ON a."jobId" = j."id" AND (${joinClauseFromWhere(where.sql)}) WHERE j."companyId" = $1::text GROUP BY j."id", j."title", j."viewCount" ORDER BY "totalApplications" DESC LIMIT 50`,
      ...(filter.jobId ? where.params.slice(0, -1) : where.params),
    ),
    prisma.$queryRawUnsafe<[{ v: bigint }?]>(totalJobsSQL, ...totalJobsParams),
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
