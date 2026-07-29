import prisma from "@/lib/prisma";

export type DashboardStats = {
  totalUsers: number;
  totalRecruiters: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: Date;
  }>;
  recentApplications: Array<{
    id: string;
    jobTitle: string;
    userName: string | null;
    status: string;
    appliedAt: Date;
  }>;
  applicationsLast14Days: Array<{
    date: string;
    count: number;
  }>;
  signupsLast14Days: Array<{
    date: string;
    count: number;
  }>;
  jobsByWorkMode: Array<{
    workMode: string;
    count: number;
  }>;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalUsers,
    totalRecruiters,
    totalJobs,
    activeJobs,
    totalApplications,
    recentUsers,
    recentApplications,
    applicationTrend,
    signupTrend,
    jobsByWorkMode,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "recruiter" } }),
    prisma.job.count(),
    prisma.job.count({ where: { isActive: true } }),
    prisma.application.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.application.findMany({
      orderBy: { appliedAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        appliedAt: true,
        job: { select: { title: true } },
        user: { select: { name: true } },
      },
    }),
    prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT
        TO_CHAR("appliedAt", 'YYYY-MM-DD') AS date,
        COUNT(*)::BIGINT AS count
      FROM "application"
      WHERE "appliedAt" >= NOW() - INTERVAL '14 days'
      GROUP BY TO_CHAR("appliedAt", 'YYYY-MM-DD')
      ORDER BY date ASC
    `,
    prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM-DD') AS date,
        COUNT(*)::BIGINT AS count
      FROM "user"
      WHERE "createdAt" >= NOW() - INTERVAL '14 days'
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
      ORDER BY date ASC
    `,
    prisma.job.groupBy({
      by: ["workMode"],
      _count: { workMode: true },
    }),
  ]);

  return {
    totalUsers,
    totalRecruiters,
    totalJobs,
    activeJobs,
    totalApplications,
    recentUsers,
    recentApplications: recentApplications.map((a) => ({
      id: a.id,
      jobTitle: a.job.title,
      userName: a.user.name,
      status: a.status,
      appliedAt: a.appliedAt,
    })),
    applicationsLast14Days: applicationTrend.map((r) => ({
      date: r.date,
      count: Number(r.count),
    })),
    signupsLast14Days: signupTrend.map((r) => ({
      date: r.date,
      count: Number(r.count),
    })),
    jobsByWorkMode: jobsByWorkMode.map((g) => ({
      workMode: g.workMode,
      count: g._count.workMode,
    })),
  };
}
