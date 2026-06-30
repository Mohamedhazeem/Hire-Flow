import prisma from "@/lib/prisma";
import { buildOffsetMeta, parseOffsetParams } from "@/lib/pagination";

export type PublicJobRow = {
  id: string;
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
  status?: "open" | "expired" | "all";
  sortBy?: string;
  sortOrder?: string;
};

export async function listPublicJobs(params: PublicJobListParams): Promise<PublicJobListResult> {
  const { skip, take, page, pageSize } = parseOffsetParams({ page: params.page, pageSize: params.pageSize }, 20);

  const where: Record<string, unknown> = {
    status: "active",
    isActive: true,
  };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params.workMode) where.workMode = params.workMode;
  if (params.employmentType) where.employmentType = params.employmentType;
  if (params.experienceLevel) where.experienceLevel = params.experienceLevel;

  if (params.status === "open") {
    where.applicationDeadline = { gte: new Date() };
  } else if (params.status === "expired") {
    where.applicationDeadline = { lt: new Date() };
  }
  // "all" or undefined — no deadline filter

  const sortBy = params.sortBy ?? "createdAt";
  const sortOrder = params.sortOrder ?? "desc";

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where, skip, take,
      orderBy: { [sortBy]: sortOrder },
      include: { company: { select: { name: true, logoUrl: true } } },
    }),
    prisma.job.count({ where }),
  ]);

  const rows: PublicJobRow[] = jobs.map((job) => ({
    id: job.id,
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

export async function getPublicJobById(id: string): Promise<PublicJobDetail | null> {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: { select: { name: true, logoUrl: true, website: true, description: true } },
      _count: { select: { applications: { where: { status: { not: "withdrawn" } } } } },
    },
  });

  if (!job || job.status !== "active" || !job.isActive) return null;
  return {
    id: job.id,
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
    createdAt: job.createdAt,
  };
}
