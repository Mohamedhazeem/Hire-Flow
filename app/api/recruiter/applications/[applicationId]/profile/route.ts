import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";

async function handleGET(
  _request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  const recruiter = await requireRole(["recruiter"]);
  const { applicationId } = await params;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      userId: true,
      job: {
        select: {
          recruiterId: true,
          company: {
            select: {
              teamMembers: { where: { userId: recruiter.id }, select: { userId: true } },
            },
          },
        },
      },
      user: {
        select: { name: true, email: true },
      },
    },
  });

  if (!application) throw new NotFoundError("Application not found");

  const isAuthorized =
    application.job.recruiterId === recruiter.id ||
    application.job.company.teamMembers.length > 0;

  if (!isAuthorized) throw new NotFoundError("Application not found");

  return ok({
    userId: application.userId,
    name: application.user.name,
    email: application.user.email,
  });
}

export const GET = withErrorHandler(handleGET);
