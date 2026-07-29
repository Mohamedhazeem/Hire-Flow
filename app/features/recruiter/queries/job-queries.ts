import prisma from "@/lib/prisma";
import { buildOffsetMeta, parseOffsetParams } from "@/lib/pagination";
import type { JobListParams } from "../schema/job.schema";

export type RecruiterJobRow = {
  id: string;
  title: string;
  status: string;
  workMode: string;
  employmentType: string;
  experienceLevel: string;
  viewCount: number;
  applicationCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type RecruiterJobDetail = {
  id: string;
  recruiterId: string;
  companyId: string;
  title: string;
  description: string;
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
  status: string;
  isActive: boolean;
  viewCount: number;
  applicationCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type RecruiterJobListResult = {
  jobs: RecruiterJobRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export async function listJobs(
  companyId: string,
  params: JobListParams,
): Promise<RecruiterJobListResult> {
  const { skip, take, page, pageSize } = parseOffsetParams(
    { page: params.page, pageSize: params.pageSize },
    20,
  );

  const where: Record<string, unknown> = {
    companyId,
  };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (params.status && params.status !== "all") {
    where.status = params.status;
  }

  if (params.workMode) {
    where.workMode = params.workMode;
  }

  if (params.employmentType) {
    where.employmentType = params.employmentType;
  }

  if (params.experienceLevel) {
    where.experienceLevel = params.experienceLevel;
  }

  if (params.skills?.length) {
    where.skills = { hasSome: params.skills };
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take,
      orderBy: { [params.sortBy ?? "createdAt"]: params.sortOrder ?? "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        viewCount: true,
        workMode: true,
        employmentType: true,
        experienceLevel: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { applications: true } },
      },
    }),
    prisma.job.count({ where }),
  ]);

  const rows: RecruiterJobRow[] = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    status: job.status,
    viewCount: job.viewCount,
    applicationCount: job._count.applications,
    workMode: job.workMode,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  }));

  return { jobs: rows, ...buildOffsetMeta(total, page, pageSize) };
}

export async function getJobById(
  id: string,
  companyId: string,
): Promise<RecruiterJobDetail | null> {
  const job = await prisma.job.findUnique({
    where: { id },
    select: {
      id: true,
      recruiterId: true,
      companyId: true,
      title: true,
      description: true,
      locations: true,
      workMode: true,
      employmentType: true,
      timezone: true,
      skills: true,
      tags: true,
      experienceLevel: true,
      salaryMin: true,
      salaryMax: true,
      salaryCurrency: true,
      applicationDeadline: true,
      status: true,
      isActive: true,
      viewCount: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { applications: true } },
    },
  });

  if (!job || job.companyId !== companyId) return null;

  return {
    id: job.id,
    recruiterId: job.recruiterId,
    companyId: job.companyId,
    title: job.title,
    description: job.description,
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
    status: job.status,
    isActive: job.isActive,
    viewCount: job.viewCount,
    applicationCount: job._count.applications,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}
