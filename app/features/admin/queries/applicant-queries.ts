import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/api-error";

type ResumeInfo = {
  id: string;
  label: string;
  fileUrl: string | null;
  isPrimary: boolean;
  createdAt: Date;
};

type DeletedResume = { source: "deleted" };

export type AdminApplicantDetailResponse = {
  application: {
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
    job: { id: string; title: string };
    resumeId: string | null;
  };
  applicant: {
    id: string;
    name: string;
    email: string;
    role: string;
    profile: {
      headline: string | null;
      bio: string | null;
      skills: string[];
      experiences: unknown;
      location: string | null;
      basePay: number | null;
      ctc: number | null;
      socialLinks: unknown;
    } | null;
  };
  applicantResume: (ResumeInfo & { source: "application" | "current_profile" }) | DeletedResume | null;
  statusTimeline: {
    id: string;
    type: "application_submitted" | "status_change";
    fromStatus: string | null;
    toStatus: string | null;
    label: string;
    changedByName: string | null;
    note: string | null;
    createdAt: string;
    isUpcoming: boolean;
  }[];
  recentMessages: {
    id: string;
    content: string;
    fileUrl: string | null;
    fileName: string | null;
    senderId: string;
    createdAt: Date;
  }[];
};

const STATUS_LABELS: Record<string, string> = {
  applied: "Application Submitted",
  reviewing: "Under Review",
  shortlisted: "Shortlisted",
  interview_scheduled: "Interview Scheduled",
  offered: "Offer Sent",
  hired: "Hired",
  rejected: "Rejected",
};

export async function getAdminApplicantDetail(
  applicationId: string,
): Promise<AdminApplicantDetailResponse> {
  const application = await prisma.application.findUnique({
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
      resumeId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profile: {
            select: {
              headline: true,
              bio: true,
              skills: true,
              experiences: true,
              location: true,
              basePay: true,
              ctc: true,
              socialLinks: true,
              resumes: {
                select: {
                  id: true,
                  label: true,
                  fileUrl: true,
                  isPrimary: true,
                  createdAt: true,
                },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      },
      job: { select: { id: true, title: true } },
    },
  });

  if (!application) {
    throw new NotFoundError("Application not found");
  }

  const profileResumes = application.user.profile?.resumes ?? [];

  let resolvedResume: (ResumeInfo & { source: "application" | "current_profile" }) | DeletedResume | null = null;

  if (application.resumeId) {
    const matched = profileResumes.find((r) => r.id === application.resumeId);
    if (matched) {
      resolvedResume = { ...matched, source: "application" };
    } else {
      resolvedResume = { source: "deleted" } as DeletedResume;
    }
  }

  if (!resolvedResume || resolvedResume.source === "deleted") {
    if (profileResumes.length > 0) {
      const fallback = profileResumes.find((r) => r.isPrimary) ?? profileResumes[0];
      resolvedResume = { ...fallback, source: "current_profile" };
    } else if (resolvedResume?.source === "deleted") {
    } else {
      resolvedResume = null;
    }
  }

  const [statusChanges, recentMessages] = await Promise.all([
    prisma.applicationStatusChange.findMany({
      where: { applicationId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        fromStatus: true,
        toStatus: true,
        note: true,
        createdAt: true,
        changedBy: { select: { name: true } },
      },
    }),
    prisma.message.findMany({
      where: {
        OR: [
          { threadId: { startsWith: `${application.userId}_` } },
          { threadId: { endsWith: `_${application.userId}` } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        content: true,
        fileUrl: true,
        fileName: true,
        senderId: true,
        createdAt: true,
      },
    }),
  ]);

  const now = new Date();
  const timeline: AdminApplicantDetailResponse["statusTimeline"] = [];

  timeline.push({
    id: `submitted-${application.id}`,
    type: "application_submitted",
    fromStatus: null,
    toStatus: "applied",
    label: "Application Submitted",
    changedByName: null,
    note: null,
    createdAt: application.appliedAt.toISOString(),
    isUpcoming: false,
  });

  for (const change of statusChanges) {
    timeline.push({
      id: change.id,
      type: "status_change",
      fromStatus: change.fromStatus,
      toStatus: change.toStatus,
      label: STATUS_LABELS[change.toStatus] ?? change.toStatus,
      changedByName: change.changedBy.name,
      note: change.note,
      createdAt: change.createdAt.toISOString(),
      isUpcoming: false,
    });
  }

  if (application.interviewDate && application.interviewDate > now) {
    timeline.push({
      id: `upcoming-interview-${application.id}`,
      type: "status_change",
      fromStatus: "interview_scheduled",
      toStatus: "interview_scheduled",
      label: "Interview Scheduled",
      changedByName: null,
      note: application.meetingLink
        ? `Meeting link: ${application.meetingLink}`
        : null,
      createdAt: application.interviewDate.toISOString(),
      isUpcoming: true,
    });
  }

  return {
    application: {
      id: application.id,
      jobId: application.jobId,
      userId: application.userId,
      status: application.status,
      rejectionReason: application.rejectionReason,
      recruiterNote: application.recruiterNote,
      interviewDate: application.interviewDate,
      meetingLink: application.meetingLink,
      offerDetails: application.offerDetails,
      appliedAt: application.appliedAt,
      updatedAt: application.updatedAt,
      job: application.job,
      resumeId: application.resumeId,
    },
    applicant: {
      id: application.user.id,
      name: application.user.name,
      email: application.user.email,
      role: application.user.role,
      profile: application.user.profile ?? null,
    },
    applicantResume: resolvedResume,
    statusTimeline: timeline,
    recentMessages: recentMessages,
  };
}

export type AdminUserApplicationsResponse = {
  applications: {
    id: string;
    jobId: string;
    jobTitle: string;
    status: string;
    appliedAt: Date;
    updatedAt: Date;
  }[];
};

export async function getUserApplications(userId: string): Promise<AdminUserApplicationsResponse> {
  const applications = await prisma.application.findMany({
    where: { userId },
    orderBy: { appliedAt: "desc" },
    select: {
      id: true,
      jobId: true,
      status: true,
      appliedAt: true,
      updatedAt: true,
      job: { select: { title: true } },
    },
  });

  return {
    applications: applications.map((a) => ({
      id: a.id,
      jobId: a.jobId,
      jobTitle: a.job.title,
      status: a.status,
      appliedAt: a.appliedAt,
      updatedAt: a.updatedAt,
    })),
  };
}
