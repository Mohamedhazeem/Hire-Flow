"use server";

import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { UnauthorizedError, ForbiddenError } from "@/lib/api/api-error";

export async function getUnreadMessageCount(): Promise<number> {
  try {
    const user = await requireRole(["user", "recruiter", "admin", "super_admin"]);
    return prisma.message.count({
      where: {
        receiverId: user.id,
        read: false,
        deletedAt: null,
        NOT: { hiddenFor: { has: user.id } },
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) return 0;
    throw error;
  }
}
