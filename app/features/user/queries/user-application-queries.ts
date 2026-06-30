import prisma from "@/lib/prisma";
import { buildOffsetMeta, parseOffsetParams } from "@/lib/pagination";

export type UserApplicationRow = {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string | null;
  status: string;
  appliedAt: Date;
  updatedAt: Date;
};

export type UserApplicationDetail = {
  id: string;
  jobId: string;
  jobTitle: string;
  jobCompanyName: string;
  jobCompanyLogo: string | null;
  jobLocations: string[];
  jobWorkMode: string;
  jobSalaryMin: number | null;
  jobSalaryMax: number | null;
  jobSalaryCurrency: string;
  jobActive: boolean;
  status: string;
  resumeSnapshotUrl: string | null;
  resumeSnapshotBuilderData: unknown;
  rejectionReason: string | null;
  interviewDate: Date | null;
  meetingLink: string | null;
  offerDetails: string | null;
  appliedAt: Date;
  updatedAt: Date;
  statusChanges: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    createdAt: Date;
  }>;
};

export type UserApplicationListResult = {
  applications: UserApplicationRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export async function listUserApplications(
  userId: string,
  params: { page?: number; pageSize?: number; status?: string; search?: string },
): Promise<UserApplicationListResult> {
  const { skip, take, page, pageSize } = parseOffsetParams(
    { page: params.page, pageSize: params.pageSize }, 20,
  );

  const where: Record<string, unknown> = { userId };
  if (params.status) where.status = params.status;
  if (params.search) where.job = { title: { contains: params.search, mode: "insensitive" } };

  const [apps, total] = await Promise.all([
    prisma.application.findMany({
      where, skip, take,
      orderBy: { appliedAt: "desc" },
      include: { job: { include: { company: { select: { name: true, logoUrl: true } } } } },
    }),
    prisma.application.count({ where }),
  ]);

  const applications = (apps as unknown[]).map((a) => {
    const record = a as Record<string, unknown>;
    const job = record.job as Record<string, unknown>;
    const company = job.company as Record<string, string | null>;
    return {
      id: record.id as string,
      jobId: record.jobId as string,
      jobTitle: job.title as string,
      companyName: company.name ?? "Unknown",
      companyLogo: company.logoUrl,
      status: record.status as string,
      appliedAt: record.appliedAt as Date,
      updatedAt: record.updatedAt as Date,
    };
  });

  return { applications, ...buildOffsetMeta(total, page, pageSize) };
}

export async function getUserApplicationDetail(
  id: string,
  userId: string,
): Promise<UserApplicationDetail | null> {
  const raw = await prisma.application.findUnique({
    where: { id },
    include: {
      job: { include: { company: { select: { name: true, logoUrl: true } } } },
      statusChanges: {
        orderBy: { createdAt: "asc" },
        select: { id: true, fromStatus: true, toStatus: true, createdAt: true },
      },
    },
  });

  if (!raw || raw.userId !== userId) return null;

  const d = raw as unknown as Record<string, unknown>;
  const job = d.job as Record<string, unknown>;
  const company = job.company as Record<string, string | null>;
  const changes = d.statusChanges as Array<Record<string, unknown>>;

  return {
    id: d.id as string,
    jobId: d.jobId as string,
    jobTitle: job.title as string,
    jobCompanyName: company.name ?? "Unknown",
    jobCompanyLogo: company.logoUrl,
    jobLocations: job.locations as string[],
    jobWorkMode: job.workMode as string,
    jobSalaryMin: (job.salaryMin as number | null),
    jobSalaryMax: (job.salaryMax as number | null),
    jobSalaryCurrency: (job.salaryCurrency as string) ?? "USD",
    jobActive: job.isActive as boolean,
    status: d.status as string,
    resumeSnapshotUrl: d.resumeSnapshotUrl as string | null,
    resumeSnapshotBuilderData: d.resumeSnapshotBuilderData,
    rejectionReason: d.rejectionReason as string | null,
    interviewDate: d.interviewDate as Date | null,
    meetingLink: d.meetingLink as string | null,
    offerDetails: d.offerDetails as string | null,
    appliedAt: d.appliedAt as Date,
    updatedAt: d.updatedAt as Date,
    statusChanges: changes.map((sc) => ({
      id: sc.id as string,
      fromStatus: sc.fromStatus as string | null,
      toStatus: sc.toStatus as string,
      createdAt: sc.createdAt as Date,
    })),
  };
}
