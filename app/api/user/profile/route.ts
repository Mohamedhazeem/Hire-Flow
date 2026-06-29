import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";

export async function GET() {
  const session = await requireRole(["user"]);

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.id },
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

  return ok({ data: profile });
}
