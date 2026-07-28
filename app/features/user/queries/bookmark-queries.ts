import prisma from "@/lib/prisma";
import {
  buildOffsetMeta,
  parseOffsetParams,
} from "@/lib/pagination";

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

export type BookmarkListResult = {
  bookmarks: BookmarkJob[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export async function listUserBookmarks(
  userId: string,
  params?: { page?: number; pageSize?: number },
): Promise<BookmarkJob[] | BookmarkListResult> {
  const selectJob = {
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
  } as const;

  const mapToBookmarkJob = (
    b: { job: Record<string, unknown> },
  ): BookmarkJob => b.job as unknown as BookmarkJob;

  if (!params?.page) {
    const rows = await prisma.bookmark.findMany({
      where: { userId },
      include: { job: { select: selectJob } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapToBookmarkJob);
  }

  const { skip, take, page, pageSize } = parseOffsetParams(
    { page: params.page, pageSize: params.pageSize },
    20,
  );

  const [rows, total] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId },
      skip,
      take,
      include: { job: { select: selectJob } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bookmark.count({ where: { userId } }),
  ]);

  return {
    bookmarks: rows.map(mapToBookmarkJob),
    ...buildOffsetMeta(total, page, pageSize),
  };
}

export async function checkBookmark(
  userId: string,
  jobId: string,
): Promise<{ bookmarked: boolean }> {
  const bookmark = await prisma.bookmark.findUnique({
    where: { userId_jobId: { userId, jobId } },
  });
  return { bookmarked: !!bookmark };
}
