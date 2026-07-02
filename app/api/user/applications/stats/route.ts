import { ok } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-wrapper";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";

async function handleGET() {
  const session = await requireRole(["user"]);
  const userId = session.id;

  const activeStatuses = ["applied", "reviewing", "shortlisted"];
  const interviewStatus = "interview_scheduled";
  const offerStatuses = ["offered", "hired"];

  const [total, active, interviews, offers] = await Promise.all([
    prisma.application.count({ where: { userId } }),
    prisma.application.count({ where: { userId, status: { in: activeStatuses } } }),
    prisma.application.count({ where: { userId, status: interviewStatus } }),
    prisma.application.count({ where: { userId, status: { in: offerStatuses } } }),
  ]);

  return ok({ total, active, interviews, offers });
}

export const GET = withErrorHandler(handleGET);
