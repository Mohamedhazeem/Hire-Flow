import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ok } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-wrapper";
import { requireRole } from "@/app/features/shared/api/require-role";
import { ValidationError } from "@/lib/api-error";

const ToggleSchema = z.object({
  jobId: z.string().min(1),
});

async function handleGET() {
  const session = await requireRole(["user"]);
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.id },
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
  return ok({ data: bookmarks });
}

async function handlePOST(request: NextRequest) {
  const session = await requireRole(["user"]);
  const body = await request.json();
  const parsed = ToggleSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid jobId");
  const { jobId } = parsed.data;

  const existing = await prisma.bookmark.findUnique({
    where: { userId_jobId: { userId: session.id, jobId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return ok({ bookmarked: false, id: existing.id });
  }

  const created = await prisma.bookmark.create({
    data: { userId: session.id, jobId },
  });
  return ok({ bookmarked: true, id: created.id });
}

export const GET = withErrorHandler(handleGET);
export const POST = withErrorHandler(handlePOST);
