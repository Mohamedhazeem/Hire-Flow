import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { NotFoundError, ValidationError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { getUserApplicationDetail } from "@/app/features/user/queries/user-application-queries";
import { revalidatePath } from "next/cache";

async function handleGET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["user"]);
  const { id } = await params;

  const detail = await getUserApplicationDetail(id, session.id);
  if (!detail) throw new NotFoundError("Application not found");

  return ok({ data: detail });
}

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["user"]);
  const { id } = await params;

  const application = await prisma.application.findUnique({ where: { id } });
  if (!application || application.userId !== session.id) {
    throw new NotFoundError("Application not found");
  }

  if (application.status !== "applied" && application.status !== "reviewing") {
    throw new ValidationError("Can only withdraw applications that are in 'applied' or 'reviewing' status");
  }

  await prisma.application.delete({ where: { id } });

  revalidatePath("/user/applications");

  return ok({ success: true });
}

export const GET = withErrorHandler(handleGET);
export const DELETE = withErrorHandler(handleDELETE);
