import prisma from "@/lib/prisma";
import { buildOffsetMeta, parseOffsetParams } from "@/lib/pagination";
import type { AdminListJobsParams } from "../schema/admin.schema";

export type AdminJobRow = {
  id: string;
  title: string;
  isActive: boolean;
  viewCount: number;
  applicationCount: number;
  companyName: string | null;
  recruiterName: string | null;
  recruiterEmail: string;
  workMode: string;
  employmentType: string;
  experienceLevel: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminJobListResult = {
  jobs: AdminJobRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export async function listJobs(params: AdminListJobsParams): Promise<AdminJobListResult> {
  const { skip, take, page, pageSize } = parseOffsetParams(
    { page: params.page, pageSize: params.pageSize },
    20,
  );

  const where: Record<string, unknown> = {};

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { company: { name: { contains: params.search, mode: "insensitive" } } },
    ];
  }

  if (params.status === "active") {
    where.isActive = true;
  } else if (params.status === "inactive") {
    where.isActive = false;
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

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take,
      orderBy: { [params.sortBy ?? "createdAt"]: params.sortOrder ?? "desc" },
      select: {
        id: true,
        title: true,
        isActive: true,
        viewCount: true,
        workMode: true,
        employmentType: true,
        experienceLevel: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { applications: true } },
        company: { select: { name: true } },
        recruiter: { select: { name: true, email: true } },
      },
    }),
    prisma.job.count({ where }),
  ]);

  const rows: AdminJobRow[] = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    isActive: job.isActive,
    viewCount: job.viewCount,
    applicationCount: job._count.applications,
    companyName: job.company?.name ?? null,
    recruiterName: job.recruiter?.name ?? null,
    recruiterEmail: job.recruiter?.email ?? "",
    workMode: job.workMode,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  }));

  return { jobs: rows, ...buildOffsetMeta(total, page, pageSize) };
}
