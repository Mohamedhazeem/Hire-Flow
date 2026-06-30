"use server";

import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/api-error";
import { ApplyAiSuggestionsSchema } from "@/app/features/user/schema/resume-ai.schema";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@/app/generated/prisma/client";

export async function applyAiSuggestions(input: { resumeId: string; suggestions: unknown[] }) {
  const session = await requireRole(["user"]);

  const parsed = ApplyAiSuggestionsSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { resumeId, suggestions } = parsed.data;

  const resume = await prisma.resume.findUnique({ where: { id: resumeId, deletedAt: null } });
  if (!resume) throw new NotFoundError("Resume not found");
  if (resume.userId !== session.id) throw new ForbiddenError("You do not own this resume");
  if (resume.fileUrl !== null) {
    throw new ValidationError(
      "File-uploaded resumes cannot apply suggestions automatically. Download the resume, apply the changes, and re-upload.",
    );
  }
  if (resume.builderData === null) {
    throw new ValidationError(
      "File-uploaded resumes cannot apply suggestions automatically. Download the resume, apply the changes, and re-upload.",
    );
  }

  const builderData = resume.builderData as Record<string, unknown>;
  const skills: string[] = (builderData.skills as string[]) ?? [];
  const experiences = (builderData.experiences as Record<string, unknown>[]) ?? [];
  let appliedCount = 0;
  let skippedCount = 0;

  for (const s of suggestions) {
    if (s.section === "summary") {
      builderData.summary = s.suggestion;
      appliedCount++;
    } else if (s.section === "skills") {
      if (!skills.includes(s.suggestion)) {
        skills.push(s.suggestion);
        appliedCount++;
      }
    } else if (s.section === "experience") {
      if (!s.original) {
        skippedCount++;
        continue;
      }
      let matched = false;
      for (const exp of experiences) {
        if (exp.description === s.original) {
          exp.description = s.suggestion;
          appliedCount++;
          matched = true;
          break;
        }
      }
      if (!matched) skippedCount++;
    } else {
      skippedCount++;
    }
  }

  builderData.skills = skills;

  await prisma.resume.update({
    where: { id: resumeId },
    data: { builderData: builderData as unknown as Prisma.InputJsonValue },
  });

  revalidatePath("/user/resumes");

  return { success: true, appliedCount, skippedCount };
}
