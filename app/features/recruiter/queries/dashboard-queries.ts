import prisma from "@/lib/prisma";

export type RecentApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  userName: string | null;
  userId: string;
  status: string;
  appliedAt: Date;
};

export type DashboardData = {
  totalJobs: number;
  totalApplications: number;
  pendingReviews: number;
  newThisWeek: number;
  recentApplications: RecentApplication[];
};

export async function getRecruiterDashboardStats(companyId: string): Promise<DashboardData> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [totalJobs, totalApplications, pendingReviews, newThisWeek, recentApplications] =
    await Promise.all([
      prisma.job.count({ where: { companyId } }),
      prisma.application.count({ where: { job: { companyId } } }),
      prisma.application.count({
        where: {
          job: { companyId },
          status: { in: ["applied", "reviewing"] },
        },
      }),
      prisma.application.count({
        where: {
          job: { companyId },
          appliedAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.application.findMany({
        where: { job: { companyId } },
        orderBy: { appliedAt: "desc" },
        take: 5,
        select: {
          id: true,
          status: true,
          appliedAt: true,
          job: { select: { id: true, title: true } },
          user: { select: { id: true, name: true } },
        },
      }),
    ]);

  return {
    totalJobs,
    totalApplications,
    pendingReviews,
    newThisWeek,
    recentApplications: recentApplications.map((a) => ({
      id: a.id,
      jobId: a.job.id,
      jobTitle: a.job.title,
      userName: a.user.name,
      userId: a.user.id,
      status: a.status,
      appliedAt: a.appliedAt,
    })),
  };
}
