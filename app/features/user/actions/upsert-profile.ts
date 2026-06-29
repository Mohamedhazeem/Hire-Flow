"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/app/features/shared/api/require-role";
import { ProfileSchema } from "@/app/features/user/schema/profile.schema";
import { ValidationError } from "@/lib/api-error";
import { revalidatePath } from "next/cache";
import type { ProfileInput } from "@/app/features/user/schema/profile.schema";

export async function upsertProfile(input: ProfileInput) {
  const session = await requireRole(["user"]);

  const parsed = ProfileSchema.safeParse(input);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid profile data");
  }

  const {
    headline,
    bio,
    location,
    skills,
    workMode,
    basePay,
    ctc,
    ectc,
    experiences,
    socialLinks,
  } = parsed.data;

  const profile = await prisma.userProfile.upsert({
    where: { userId: session.id },
    create: {
      userId: session.id,
      headline: headline || null,
      bio: bio || null,
      location: location || null,
      skills,
      workMode: workMode ?? null,
      basePay: basePay ?? null,
      ctc: ctc ?? null,
      ectc: ectc ?? null,
      experiences: experiences ?? [],
      socialLinks: socialLinks ?? [],
    },
    update: {
      headline: headline || null,
      bio: bio || null,
      location: location || null,
      skills,
      workMode: workMode ?? null,
      basePay: basePay ?? null,
      ctc: ctc ?? null,
      ectc: ectc ?? null,
      experiences: experiences ?? [],
      socialLinks: socialLinks ?? [],
    },
  });

  revalidatePath("/user/profile");

  return { success: true, profile };
}
