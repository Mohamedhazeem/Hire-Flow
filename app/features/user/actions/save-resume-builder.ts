"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/app/features/shared/api/require-role";
import { BuilderResumeSchema } from "@/app/features/user/schema/resume.schema";
import { ValidationError } from "@/lib/api-error";
import { revalidatePath } from "next/cache";
import type { BuilderResumeInput } from "@/app/features/user/schema/resume.schema";

export async function saveResumeBuilder(input: BuilderResumeInput) {
  const session = await requireRole(["user"]);

  const parsed = BuilderResumeSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid resume data");
  }

  const existingCount = await prisma.resume.count({
    where: { userId: session.id, deletedAt: null },
  });
  if (existingCount >= 5) {
    throw new ValidationError("Resume limit reached (5). Please delete an existing resume before creating a new one.");
  }

  const { label, summary, educations, experiences, skills } = parsed.data;

  const resume = await prisma.resume.create({
    data: {
      userId: session.id,
      label,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      fileType: null,
      builderData: { summary, educations, experiences, skills },
    },
  });

  revalidatePath("/user/resumes");
  return { success: true, resume };
}
