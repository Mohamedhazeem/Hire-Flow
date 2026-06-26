import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-wrapper";
import { NotFoundError, ValidationError, ForbiddenError } from "@/lib/api-error";

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["super_admin"]);
  const { id } = await params;

  if (id === session.id) {
    throw new ValidationError("You cannot remove yourself from the admin team");
  }

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    throw new NotFoundError("Admin not found");
  }

  if (user.role === "super_admin") {
    throw new ForbiddenError("Cannot remove another super admin");
  }

  await prisma.user.update({
    where: { id },
    data: { role: "user" },
  });

  return ok({ removed: true });
}

export const DELETE = withErrorHandler(handleDELETE);
