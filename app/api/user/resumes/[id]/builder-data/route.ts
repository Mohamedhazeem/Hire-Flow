import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/api-error";
import { BuilderResumeSchema } from "@/app/features/user/schema/resume.schema";
import { withErrorHandler } from "@/lib/api-wrapper";

async function handlePATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["user"]);
  const { id } = await params;

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume) throw new NotFoundError("Resume not found");
  if (resume.userId !== session.id) throw new ForbiddenError("You do not own this resume");
  if (resume.fileUrl !== null) {
    throw new ValidationError("Cannot edit builder data of a file-uploaded resume.");
  }

  const body = await request.json().catch(() => ({}));
  const parsed = BuilderResumeSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid resume data");
  }

  const { label, summary, educations, experiences, skills } = parsed.data;

  const updated = await prisma.resume.update({
    where: { id },
    data: {
      label,
      builderData: { summary, educations, experiences, skills },
    },
  });

  return ok(updated);
}

export const PATCH = withErrorHandler(handlePATCH);
