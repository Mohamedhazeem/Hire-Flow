import prisma from "@/lib/prisma";

export type BookmarkJob = {
  id: string;
  title: string;
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
  isActive: boolean;
  status: string;
  companyId: string;
  company: { id: string; name: string; logoUrl: string | null };
};

export async function listUserBookmarks(userId: string) {
  return prisma.bookmark.findMany({
    where: { userId },
    include: {
      job: {
        select: {
          id: true,
          title: true,
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
          isActive: true,
          status: true,
          companyId: true,
          company: { select: { id: true, name: true, logoUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function checkBookmark(userId: string, jobId: string) {
  const bookmark = await prisma.bookmark.findUnique({
    where: { userId_jobId: { userId, jobId } },
  });
  return { bookmarked: !!bookmark };
}
