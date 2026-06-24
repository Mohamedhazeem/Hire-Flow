import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-wrapper";
import { NotFoundError, ValidationError } from "@/lib/api-error";

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireRole(["admin", "super_admin"]);

  const { id } = await params;

  const job = await prisma.job.findUnique({ where: { id }, select: { id: true } });

  if (!job) {
    throw new NotFoundError("Job not found");
  }

  await prisma.job.delete({ where: { id } });

  return ok({ deleted: true });
}

async function handlePATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;

  const job = await prisma.job.findUnique({ where: { id }, select: { id: true } });

  if (!job) {
    throw new NotFoundError("Job not found");
  }

  const body = await request.json().catch(() => ({}));
  const { isActive } = body;

  if (typeof isActive !== "boolean") {
    throw new ValidationError("isActive must be a boolean");
  }

  await prisma.job.update({
    where: { id },
    data: { isActive },
  });

  return ok({ toggled: true, isActive });
}

export const DELETE = withErrorHandler(handleDELETE);
export const PATCH = withErrorHandler(handlePATCH);
