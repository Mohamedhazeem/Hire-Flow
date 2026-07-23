import prisma from "@/lib/prisma";
import { buildOffsetMeta, parseOffsetParams } from "@/lib/pagination";

export type PublicJobRow = {
  id: string;
  slug: string | null;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo: string | null;
  locations: string[];
  workMode: string;
  employmentType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  skills: string[];
  experienceLevel: string;
  applicationDeadline: Date | null;
  createdAt: Date;
};

export type PublicJobDetail = {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  companyLogo: string | null;
  companyWebsite: string | null;
  companyDescription: string | null;
  locations: string[];
  workMode: string;
  employmentType: string;
  timezone: string | null;
  skills: string[];
  tags: string[];
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  applicationDeadline: Date | null;
  applicationCount: number;
  isActive: boolean;
  status: string;
  viewCount: number;
  createdAt: Date;
};

export type PublicJobListResult = {
  jobs: PublicJobRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type PublicJobListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  workMode?: string;
  employmentType?: string;
  experienceLevel?: string;
  industry?: string;
  companyId?: string;
  status?: "open" | "expired" | "all";
  sortBy?: string;
  sortOrder?: string;
};

const MAX_SEARCH_TOKENS = 20;
const MAX_SEARCH_LENGTH = 200;

export function formatSearchQuery(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const truncated = trimmed.slice(0, MAX_SEARCH_LENGTH);
  // Split on any run of non-word characters (unicode-aware) so that
  // punctuation-joined terms like "C++/Java" become separate tokens rather
  // than being silently concatenated ("CJava"). This also strips every
  // tsquery/SQL metacharacter as a side effect.
  const tokens = truncated
    .split(/[^\p{L}\p{N}_]+/u)
    .filter(Boolean)
    .slice(0, MAX_SEARCH_TOKENS);
  return tokens.join(" | ");
}

const ALLOWED_SORT_FIELDS = new Set([
  "createdAt",
  "salaryMin",
  "salaryMax",
  "title",
  "applicationDeadline",
]);
const ALLOWED_SORT_ORDERS = new Set(["asc", "desc"]);

export async function listPublicJobs(params: PublicJobListParams): Promise<PublicJobListResult> {
  const { skip, take, page, pageSize } = parseOffsetParams(
    { page: params.page, pageSize: params.pageSize },
    20,
  );

  const where: Record<string, unknown> = {
    status: "active",
    isActive: true,
  };

  if (params.search) {
    const formattedQuery = formatSearchQuery(params.search);
    if (formattedQuery) {
      where.OR = [
        { title: { search: formattedQuery } },
        { description: { search: formattedQuery } },
      ];
    }
  }
  if (params.workMode) where.workMode = params.workMode;
  if (params.employmentType) where.employmentType = params.employmentType;
  if (params.experienceLevel) where.experienceLevel = params.experienceLevel;
  if (params.industry) where.company = { industry: params.industry };
  if (params.companyId) where.companyId = params.companyId;

  if (params.status === "open") {
    where.applicationDeadline = { gte: new Date() };
  } else if (params.status === "expired") {
    where.applicationDeadline = { lt: new Date() };
  }
  // "all" or undefined — no deadline filter

  const sortBy = ALLOWED_SORT_FIELDS.has(params.sortBy ?? "")
    ? (params.sortBy as string)
    : "createdAt";
  const sortOrder = ALLOWED_SORT_ORDERS.has(params.sortOrder ?? "")
    ? (params.sortOrder as string)
    : "desc";

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        slug: true,
        title: true,
        companyId: true,
        company: { select: { name: true, logoUrl: true } },
        locations: true,
        workMode: true,
        employmentType: true,
        salaryMin: true,
        salaryMax: true,
        salaryCurrency: true,
        skills: true,
        experienceLevel: true,
        applicationDeadline: true,
        createdAt: true,
      },
    }),
    prisma.job.count({ where }),
  ]);

  const rows: PublicJobRow[] = jobs.map((job) => ({
    id: job.id,
    slug: job.slug,
    title: job.title,
    companyId: job.companyId,
    companyName: job.company.name ?? "Unknown",
    companyLogo: job.company.logoUrl,
    locations: job.locations,
    workMode: job.workMode,
    employmentType: job.employmentType,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    skills: job.skills,
    experienceLevel: job.experienceLevel,
    applicationDeadline: job.applicationDeadline,
    createdAt: job.createdAt,
  }));

  return { jobs: rows, ...buildOffsetMeta(total, page, pageSize) };
}

export async function getPublicJobById(slugOrId: string): Promise<PublicJobDetail | null> {
  const job = await prisma.job.findFirst({
    where: {
      OR: [{ slug: slugOrId }, { id: slugOrId }],
      isActive: true,
      status: "active",
    },
    include: {
      company: { select: { name: true, logoUrl: true, website: true, description: true } },
      _count: { select: { applications: { where: { status: { not: "withdrawn" } } } } },
    },
  });

  if (!job) return null;
  return {
    id: job.id,
    slug: job.slug,
    title: job.title,
    description: job.description,
    companyId: job.companyId,
    companyName: job.company.name ?? "Unknown",
    companyLogo: job.company.logoUrl,
    companyWebsite: job.company.website,
    companyDescription: job.company.description,
    locations: job.locations,
    workMode: job.workMode,
    employmentType: job.employmentType,
    timezone: job.timezone,
    skills: job.skills,
    tags: job.tags,
    experienceLevel: job.experienceLevel,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    applicationDeadline: job.applicationDeadline,
    applicationCount: job._count.applications,
    isActive: job.isActive,
    status: job.status,
    viewCount: job.viewCount,
    createdAt: job.createdAt,
  };
}
