import prisma from "@/lib/prisma";
import { buildOffsetMeta, parseOffsetParams } from "@/lib/pagination";
import type { ListApplicantsParams } from "../schema/application.schema";

export type ApplicantRow = {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: string;
  appliedAt: Date;
  updatedAt: Date;
};

export type ApplicantListResult = {
  applicants: ApplicantRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export async function listApplicants(
  jobId: string,
  companyId: string,
  params: ListApplicantsParams,
): Promise<ApplicantListResult> {
  const { skip, take, page, pageSize } = parseOffsetParams(
    { page: params.page, pageSize: params.pageSize },
    20,
  );

  const where: Record<string, unknown> = {
    jobId,
    job: { companyId },
  };

  if (params.search) {
    where.user = {
      OR: [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ],
    };
  }

  if (params.status) {
    where.status = params.status;
  }

  const orderBy: Record<string, string> = {};
  const sortBy = params.sortBy ?? "appliedAt";
  orderBy[sortBy] = params.sortOrder ?? "desc";

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        userId: true,
        status: true,
        appliedAt: true,
        updatedAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.application.count({ where }),
  ]);

  const applicants: ApplicantRow[] = applications.map((a) => ({
    id: a.id,
    userId: a.userId,
    name: a.user.name,
    email: a.user.email,
    status: a.status,
    appliedAt: a.appliedAt,
    updatedAt: a.updatedAt,
  }));

  return { applicants, ...buildOffsetMeta(total, page, pageSize) };
}

export async function getApplicationById(
  applicationId: string,
  companyId: string,
): Promise<{
  id: string;
  jobId: string;
  userId: string;
  status: string;
  rejectionReason: string | null;
  recruiterNote: string | null;
  interviewDate: Date | null;
  meetingLink: string | null;
  offerDetails: string | null;
  appliedAt: Date;
  updatedAt: Date;
  applicantName: string;
  applicantEmail: string;
} | null> {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      jobId: true,
      userId: true,
      status: true,
      rejectionReason: true,
      recruiterNote: true,
      interviewDate: true,
      meetingLink: true,
      offerDetails: true,
      appliedAt: true,
      updatedAt: true,
      user: { select: { name: true, email: true } },
      job: { select: { companyId: true } },
    },
  });

  if (!app || app.job.companyId !== companyId) return null;

  return {
    id: app.id,
    jobId: app.jobId,
    userId: app.userId,
    status: app.status,
    rejectionReason: app.rejectionReason,
    recruiterNote: app.recruiterNote,
    interviewDate: app.interviewDate,
    meetingLink: app.meetingLink,
    offerDetails: app.offerDetails,
    appliedAt: app.appliedAt,
    updatedAt: app.updatedAt,
    applicantName: app.user.name,
    applicantEmail: app.user.email,
  };
}
