import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireAdmin } from "@/app/features/admin/api/require-admin";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-wrapper";
import { NotFoundError, ValidationError } from "@/lib/api-error";

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminUser = await requireAdmin();
  const { id } = await params;

  if (adminUser.id === id) {
    throw new ValidationError("You cannot remove yourself from the admin team");
  }

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });

  if (!user || user.role !== "admin") {
    throw new NotFoundError("Admin not found");
  }

  await prisma.user.update({
    where: { id },
    data: { role: "user" },
  });

  return ok({ removed: true });
}

export const DELETE = withErrorHandler(handleDELETE);
