"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/app/features/shared/api/require-role";
import { sendEmail } from "@/app/features/auth/libs/email";
import { RecruiterInviteSchema } from "@/app/features/recruiter/schema/team.schema";
import { ValidationError } from "@/lib/api-error";
import { revalidatePath } from "next/cache";
import { env } from "@/utils/env";

export async function inviteRecruiter(formData: FormData) {
  const session = await requireRole(["recruiter"]);

  const companyId =
    session.companyId ??
    (
      await prisma.company.findUniqueOrThrow({
        where: { recruiterId: session.id },
        select: { id: true },
      })
    ).id;

  const email = formData.get("email");
  const parsed = RecruiterInviteSchema.safeParse({ email });

  if (!parsed.success) {
    throw new ValidationError("Invalid email address");
  }

  const existingMember = await prisma.companyTeamMember.findFirst({
    where: {
      companyId,
      user: { email: parsed.data.email },
    },
  });

  if (existingMember) {
    throw new ValidationError("User is already a member of this team");
  }

  const existingInvite = await prisma.recruiterInvite.findFirst({
    where: { email: parsed.data.email, companyId, acceptedAt: null },
  });

  if (existingInvite) {
    throw new ValidationError("An active invite already exists for this email");
  }

  const token = crypto.randomUUID();
  const baseUrl = env.data?.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const acceptUrl = `${baseUrl}/recruiter-invite?token=${token}`;
  const invitedByName = session.name ?? session.email;

  await prisma.recruiterInvite.create({
    data: {
      email: parsed.data.email,
      companyId,
      invitedById: session.id,
      token,
    },
  });

  await sendEmail({
    to: parsed.data.email,
    subject: `You've been invited to join a team on HireFlow`,
    url: acceptUrl,
    type: "recruiter-invite",
    invitedByName,
  });

  revalidatePath("/recruiter/team");
  return { success: true, message: "Invitation sent successfully" };
}
