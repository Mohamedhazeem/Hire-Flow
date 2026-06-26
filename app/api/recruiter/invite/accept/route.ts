import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { RecruiterAcceptInviteSchema } from "@/app/features/recruiter/schema/team.schema";
import { withErrorHandler } from "@/lib/api-wrapper";
import { NotFoundError } from "@/lib/api-error";

async function handlePOST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const input = RecruiterAcceptInviteSchema.safeParse(body);

  if (!input.success) {
    return fail("Invalid token", 400);
  }

  const invite = await prisma.recruiterInvite.findUnique({
    where: { token: input.data.token },
  });

  if (!invite || invite.acceptedAt) {
    throw new NotFoundError("Invalid or expired invitation token");
  }

  const user = await prisma.user.findUnique({
    where: { email: invite.email },
    select: { id: true },
  });

  if (!user) {
    return fail("No account found with this email. Please sign up first.", 400);
  }

  const existingMembership = await prisma.companyTeamMember.findUnique({
    where: { userId: user.id },
  });

  if (existingMembership) {
    throw new NotFoundError("You are already a member of a company team");
  }

  await prisma.$transaction([
    prisma.companyTeamMember.create({
      data: {
        companyId: invite.companyId,
        userId: user.id,
        role: "member",
      },
    }),
    prisma.recruiterInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return ok({ accepted: true });
}

export const POST = withErrorHandler(handlePOST);
