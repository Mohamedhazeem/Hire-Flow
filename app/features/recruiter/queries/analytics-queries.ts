import prisma from "@/lib/prisma";
import type {
  AnalyticsFilter,
  AnalyticsResponse,
  TrendPoint,
  FunnelStage,
  FunnelHistorical,
  StageConversion,
  SummaryStats,
  JobBreakdownRow,
} from "../schema/analytics.schema";
import { FUNNEL_STAGE_ORDER } from "../schema/analytics.schema";

function defaultDateRange(): { dateFrom: string; dateTo: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10),
  };
}

type RawTrendRow = { date: string; count: bigint };
type RawCountRow = { count: bigint };

function buildWhereClauses(
  companyId: string,
  filter: AnalyticsFilter,
  tableAliases: { application: string; job: string },
): string[] {
  const clauses: string[] = [];
  clauses.push(`${tableAliases.job}."companyId" = '${companyId}'`);

  const defaults = defaultDateRange();
  const from = filter.dateFrom ?? defaults.dateFrom;
  const to = filter.dateTo ?? defaults.dateTo;

  clauses.push(`${tableAliases.application}."appliedAt" >= '${from}T00:00:00Z'`);
  clauses.push(`${tableAliases.application}."appliedAt" <= '${to}T23:59:59Z'`);

  if (filter.status) {
    const statuses = filter.status
      .split(",")
      .map((s) => `'${s.trim()}'`)
      .filter(Boolean);
    if (statuses.length > 0) {
      clauses.push(`${tableAliases.application}."status" IN (${statuses.join(",")})`);
    }
  }

  if (filter.workMode) {
    const modes = filter.workMode
      .split(",")
      .map((m) => `'${m.trim()}'`)
      .filter(Boolean);
    if (modes.length > 0) {
      clauses.push(`${tableAliases.job}."workMode" IN (${modes.join(",")})`);
    }
  }

  if (filter.employmentType) {
    const types = filter.employmentType
      .split(",")
      .map((t) => `'${t.trim()}'`)
      .filter(Boolean);
    if (types.length > 0) {
      clauses.push(`${tableAliases.job}."employmentType" IN (${types.join(",")})`);
    }
  }

  if (filter.location) {
    const locs = filter.location
      .split(",")
      .map((l) => `'${l.trim()}'`)
      .filter(Boolean);
    if (locs.length > 0) {
      clauses.push(`(${tableAliases.job}."locations" && ARRAY[${locs.join(",")}]::text[])`);
    }
  }

  if (filter.jobId) {
    clauses.push(`${tableAliases.application}."jobId" = '${filter.jobId}'`);
  }

  return clauses;
}

function whereSQL(companyId: string, filter: AnalyticsFilter): string {
  const clauses = buildWhereClauses(companyId, filter, { application: "a", job: "j" });
  return "WHERE " + clauses.join(" AND ");
}

function buildJobBreakdownSQL(companyId: string, filter: AnalyticsFilter): string {
  const clauses = buildWhereClauses(companyId, filter, { application: "a", job: "j" });
  const joinClauses = clauses.filter((c) => !c.includes(`j."companyId"`));
  const joinSQL = joinClauses.length > 0 ? " AND " + joinClauses.join(" AND ") : "";
  const cleanJoinSQL = filter.jobId
    ? joinSQL
        .replace(`a."jobId" = '${filter.jobId}'`, "")
        .replace(" AND  AND ", " AND ")
        .replace(/^ AND /, "")
    : joinSQL;
  return `
    SELECT
      j."id" AS "jobId",
      j."title",
      COUNT(DISTINCT a."id")::BIGINT AS "totalApplications",
      COUNT(DISTINCT CASE WHEN a."status" = 'hired' THEN a."id" END)::BIGINT AS hired,
      j."viewCount"::BIGINT AS "viewCount"
    FROM "job" j
    LEFT JOIN "application" a ON a."jobId" = j."id" ${cleanJoinSQL}
    WHERE j."companyId" = '${companyId}'
    GROUP BY j."id", j."title", j."viewCount"
    ORDER BY "totalApplications" DESC
    LIMIT 50
  `;
}

export async function getAnalytics(
  companyId: string,
  filter: AnalyticsFilter,
): Promise<AnalyticsResponse> {
  const defaults = defaultDateRange();
  const from = filter.dateFrom ?? defaults.dateFrom;
  const to = filter.dateTo ?? defaults.dateTo;

  const [
    summaryResult,
    trendRaw,
    statusRaw,
    workModeRaw,
    employmentTypeRaw,
    topJobsRaw,
    funnelHistoricalRaw,
    conversionsRaw,
    jobBreakdownRaw,
    fulfillmentRaw,
  ] = await (async () => {
    // Run each query independently so we can identify which one fails
    const r1 = prisma.$queryRawUnsafe<RawCountRow[]>(
      `SELECT COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${whereSQL(companyId, { ...filter })}`,
    );
    const r2 = prisma.$queryRawUnsafe<RawTrendRow[]>(
      `SELECT TO_CHAR(a."appliedAt", 'YYYY-MM-DD') AS date, COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${whereSQL(companyId, filter)} GROUP BY TO_CHAR(a."appliedAt", 'YYYY-MM-DD') ORDER BY date ASC`,
    );
    const r3 = prisma.$queryRawUnsafe<Array<{ status: string; count: bigint }>>(
      `SELECT a."status", COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${whereSQL(companyId, filter)} GROUP BY a."status" ORDER BY count DESC`,
    );
    const r4 = prisma.$queryRawUnsafe<Array<{ workMode: string; count: bigint }>>(
      `SELECT j."workMode", COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${whereSQL(companyId, filter)} GROUP BY j."workMode" ORDER BY count DESC`,
    );
    const r5 = prisma.$queryRawUnsafe<Array<{ employmentType: string; count: bigint }>>(
      `SELECT j."employmentType", COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${whereSQL(companyId, filter)} GROUP BY j."employmentType" ORDER BY count DESC`,
    );
    const r6 = prisma.$queryRawUnsafe<Array<{ jobId: string; title: string; count: bigint }>>(
      `SELECT a."jobId" AS "jobId", j."title", COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${whereSQL(companyId, filter)} GROUP BY a."jobId", j."title" ORDER BY count DESC LIMIT 10`,
    );
    const r7 = prisma.$queryRawUnsafe<Array<{ stage: string; uniqueApplications: bigint }>>(
      `SELECT asc_ref."toStatus" AS stage, COUNT(DISTINCT asc_ref."applicationId")::BIGINT AS "uniqueApplications" FROM "application_status_change" asc_ref JOIN "application" a ON asc_ref."applicationId" = a."id" JOIN "job" j ON a."jobId" = j."id" ${whereSQL(companyId, filter)} GROUP BY asc_ref."toStatus" ORDER BY MIN(asc_ref."createdAt") ASC`,
    );
    const r8 = prisma.$queryRawUnsafe<Array<{ fromStage: string; toStage: string; count: bigint }>>(
      `SELECT asc_ref."fromStatus" AS "fromStage", asc_ref."toStatus" AS "toStage", COUNT(*)::BIGINT AS count FROM "application_status_change" asc_ref JOIN "application" a ON asc_ref."applicationId" = a."id" JOIN "job" j ON a."jobId" = j."id" ${whereSQL(companyId, filter)} GROUP BY asc_ref."fromStatus", asc_ref."toStatus" ORDER BY count DESC`,
    );
    const r9 = prisma.$queryRawUnsafe<
      Array<{
        jobId: string;
        title: string;
        totalApplications: bigint;
        hired: bigint;
        viewCount: bigint;
      }>
    >(buildJobBreakdownSQL(companyId, filter));
    const r10 = prisma.$queryRawUnsafe<Array<{ avg: string | null }>>(
      `SELECT AVG(EXTRACT(EPOCH FROM (a."updatedAt" - a."appliedAt")) / 86400)::TEXT AS avg FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${whereSQL(companyId, filter)} AND a."status" = 'hired'`,
    );

    return Promise.all([r1, r2, r3, r4, r5, r6, r7, r8, r9, r10]);
  })();

  const totalApplications = Number(summaryResult[0]?.count ?? 0);
  const hiredCount = Number(
    (
      await prisma.$queryRawUnsafe<RawCountRow[]>(
        `SELECT COUNT(*)::BIGINT AS count FROM "application" a JOIN "job" j ON a."jobId" = j."id" ${whereSQL(companyId, filter)} AND a."status" = 'hired'`,
      )
    )[0]?.count ?? 0,
  );

  const totalJobs = await prisma.job.count({
    where: {
      companyId,
      ...(filter.jobId ? { id: filter.jobId } : {}),
    },
  });

  const totalViews = jobBreakdownRaw.reduce((sum, row) => sum + Number(row.viewCount), 0);

  const avgFulfillmentDays = fulfillmentRaw[0]?.avg ? parseFloat(fulfillmentRaw[0].avg) : null;

  const summary: SummaryStats = {
    totalApplications,
    totalJobs,
    totalHired: hiredCount,
    conversionRate: totalApplications > 0 ? (hiredCount / totalApplications) * 100 : 0,
    avgFulfillmentDays:
      avgFulfillmentDays !== null ? Math.round(avgFulfillmentDays * 10) / 10 : null,
    totalViews,
  };

  const applicationTrend: TrendPoint[] = trendRaw.map((r) => ({
    date: r.date,
    count: Number(r.count),
  }));

  const statusMap = new Map(statusRaw.map((r) => [r.status, Number(r.count)]));
  const applicationsByStatus: FunnelStage[] = FUNNEL_STAGE_ORDER.map((stage) => ({
    stage,
    count: statusMap.get(stage) ?? 0,
  }));
  const rejectedCount = statusMap.get("rejected") ?? 0;
  if (rejectedCount > 0) {
    applicationsByStatus.push({ stage: "rejected", count: rejectedCount });
  }

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

  const historicalMap = new Map(
    funnelHistoricalRaw.map((r) => [r.stage, Number(r.uniqueApplications)]),
  );
  const funnelHistorical: FunnelHistorical[] = FUNNEL_STAGE_ORDER.map((stage) => ({
    stage,
    uniqueApplications: historicalMap.get(stage) ?? 0,
  }));

  const stageConversions: StageConversion[] = conversionsRaw.map((r) => ({
    fromStage: r.fromStage,
    toStage: r.toStage,
    count: Number(r.count),
  }));

  const jobBreakdown: JobBreakdownRow[] = jobBreakdownRaw.map((r) => ({
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
    summary,
    applicationTrend,
    applicationsByStatus,
    applicationsByWorkMode,
    applicationsByEmploymentType,
    topJobsByApplications,
    funnelCurrent: applicationsByStatus.filter((s) => s.stage !== "rejected"),
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
