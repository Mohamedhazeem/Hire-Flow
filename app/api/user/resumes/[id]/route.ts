import { NextRequest, NextResponse } from "next/server";
import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/api/api-error";
import { withErrorHandler } from "@/lib/api/api-wrapper";

async function handlePATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["user"]);
  const { id } = await params;

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume) throw new NotFoundError("Resume not found");
  if (resume.userId !== session.id) throw new ForbiddenError("You do not own this resume");

  const body = await request.json().catch(() => ({}));

  if (body.action === "set-primary") {
    await prisma.$transaction([
      prisma.resume.updateMany({
        where: { userId: session.id, isPrimary: true },
        data: { isPrimary: false },
      }),
      prisma.resume.update({
        where: { id },
        data: { isPrimary: true },
      }),
    ]);

    const updated = await prisma.resume.findUnique({ where: { id } });
    return ok(updated);
  }

  throw new ValidationError('Unknown action. Use "set-primary".');
}

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["user"]);
  const { id } = await params;

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume) throw new NotFoundError("Resume not found");
  if (resume.userId !== session.id) throw new ForbiddenError("You do not own this resume");

  await prisma.resume.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}

export const PATCH = withErrorHandler(handlePATCH);
export const DELETE = withErrorHandler(handleDELETE);
