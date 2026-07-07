import { prisma } from "@/lib/prisma";

export type ProfileOutput = {
  headline: string | null;
  bio: string | null;
  location: string | null;
  skills: string[];
  workMode: string | null;
  basePay: number | null;
  ctc: number | null;
  ectc: number | null;
  experiences: unknown;
  socialLinks: unknown;
} | null;

export async function getUserProfile(userId: string): Promise<ProfileOutput> {
  return prisma.userProfile.findUnique({
    where: { userId },
    select: {
      headline: true,
      bio: true,
      location: true,
      skills: true,
      workMode: true,
      basePay: true,
      ctc: true,
      ectc: true,
      experiences: true,
      socialLinks: true,
    },
  });
}
