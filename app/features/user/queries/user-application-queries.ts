import prisma from "@/lib/prisma";
import { buildOffsetMeta, parseOffsetParams } from "@/lib/pagination";

export type UserApplicationRow = {
  id: string;
  jobId: string;
  jobSlug: string | null;
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
    { page: params.page, pageSize: params.pageSize },
    20,
  );

  const where: Record<string, unknown> = { userId };
  if (params.status) where.status = params.status;
  if (params.search) where.job = { title: { contains: params.search, mode: "insensitive" } };

  const [apps, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip,
      take,
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
      jobSlug: job.slug as string | null,
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

  return mapApplication(raw);
}

export async function getUserApplicationByJobSlug(
  userId: string,
  slug: string,
): Promise<UserApplicationDetail | null> {
  const raw = await prisma.application.findFirst({
    where: { userId, job: { slug } },
    include: {
      job: { include: { company: { select: { name: true, logoUrl: true } } } },
      statusChanges: {
        orderBy: { createdAt: "asc" },
        select: { id: true, fromStatus: true, toStatus: true, createdAt: true },
      },
    },
  });

  if (!raw) return null;

  return mapApplication(raw);
}

function mapApplication(raw: Record<string, unknown>): UserApplicationDetail {
  const job = raw.job as Record<string, unknown>;
  const company = job.company as Record<string, string | null>;
  const changes = raw.statusChanges as Array<Record<string, unknown>>;

  return {
    id: raw.id as string,
    jobId: raw.jobId as string,
    jobTitle: job.title as string,
    jobCompanyName: company.name ?? "Unknown",
    jobCompanyLogo: company.logoUrl,
    jobLocations: job.locations as string[],
    jobWorkMode: job.workMode as string,
    jobSalaryMin: job.salaryMin as number | null,
    jobSalaryMax: job.salaryMax as number | null,
    jobSalaryCurrency: (job.salaryCurrency as string) ?? "USD",
    jobActive: job.isActive as boolean,
    status: raw.status as string,
    resumeSnapshotUrl: raw.resumeSnapshotUrl as string | null,
    resumeSnapshotBuilderData: raw.resumeSnapshotBuilderData,
    rejectionReason: raw.rejectionReason as string | null,
    interviewDate: raw.interviewDate as Date | null,
    meetingLink: raw.meetingLink as string | null,
    offerDetails: raw.offerDetails as string | null,
    appliedAt: raw.appliedAt as Date,
    updatedAt: raw.updatedAt as Date,
    statusChanges: changes.map((sc) => ({
      id: sc.id as string,
      fromStatus: sc.fromStatus as string | null,
      toStatus: sc.toStatus as string,
      createdAt: sc.createdAt as Date,
    })),
  };
}

export async function getUserApplicationStats(userId: string) {
  const activeStatuses = ["applied", "reviewing", "shortlisted"];
  const interviewStatus = "interview_scheduled";
  const offerStatuses = ["offered", "hired"];

  const [total, active, interviews, offers] = await Promise.all([
    prisma.application.count({ where: { userId } }),
    prisma.application.count({ where: { userId, status: { in: activeStatuses } } }),
    prisma.application.count({ where: { userId, status: interviewStatus } }),
    prisma.application.count({ where: { userId, status: { in: offerStatuses } } }),
  ]);

  return { total, active, interviews, offers };
}
