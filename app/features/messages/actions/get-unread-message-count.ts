"use server";

import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";

export async function getUnreadMessageCount(): Promise<number> {
  const user = await requireRole(["user", "recruiter", "admin", "super_admin"]);
  return prisma.message.count({
    where: {
      receiverId: user.id,
      read: false,
      deletedAt: null,
      NOT: { hiddenFor: { has: user.id } },
    },
  });
}
