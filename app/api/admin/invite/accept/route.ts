import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { AdminAcceptInviteSchema } from "@/app/features/admin/schema/admin.schema";
import { withErrorHandler } from "@/lib/api-wrapper";
import { NotFoundError } from "@/lib/api-error";

async function handlePOST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const input = AdminAcceptInviteSchema.safeParse(body);

  if (!input.success) {
    return fail("Invalid token", 400);
  }

  const invite = await prisma.adminInvite.findUnique({
    where: { token: input.data.token },
  });

  if (!invite || invite.acceptedAt) {
    throw new NotFoundError("Invalid or expired invitation token");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: invite.email },
      data: { role: "admin" },
    }),
    prisma.adminInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return ok({ accepted: true });
}

export const POST = withErrorHandler(handlePOST);
