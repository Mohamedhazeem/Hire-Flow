import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireAdmin } from "@/app/features/admin/api/require-admin";
import { AdminBanUserSchema } from "@/app/features/admin/schema/admin.schema";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/features/auth/libs/auth";
import { sendEmail } from "@/app/features/auth/libs/email";
import { ValidationError, NotFoundError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";

async function handlePOST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminUser = await requireAdmin();
  const { id } = await params;

  if (adminUser.id === id) {
    throw new ValidationError("You cannot ban yourself");
  }

  const body = await request.json().catch(() => ({}));
  const input = AdminBanUserSchema.safeParse(body);

  if (!input.success) {
    throw new ValidationError("Invalid ban parameters");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { email: true, name: true },
  });

  if (!targetUser) {
    throw new NotFoundError("User not found");
  }

  await auth.api.banUser({
    body: {
      userId: id,
      banReason: input.data.banReason,
      banExpiresIn: input.data.banExpiresIn,
    },
    headers: request.headers,
  });

  const expiresInDays = input.data.banExpiresIn
    ? Math.ceil(input.data.banExpiresIn / 86400)
    : undefined;

  await sendEmail({
    to: targetUser.email,
    subject: "Your HireFlow account has been suspended",
    type: "ban-notification",
    invitedByName: adminUser.name ?? adminUser.email,
    banDetails: {
      reason: input.data.banReason,
      expiresInDays,
    },
  });

  return ok({ banned: true });
}

export const POST = withErrorHandler(handlePOST);
