"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/app/features/shared/api/require-role";
import { sendEmail } from "@/app/features/auth/libs/email";
import { RecruiterBulkInviteSchema } from "@/app/features/recruiter/schema/team.schema";
import { ValidationError } from "@/lib/api/api-error";
import { revalidatePath } from "next/cache";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";

export type BulkInviteResult = {
  sent: number;
  skipped: { email: string; reason: string }[];
  errors: { email: string; error: string }[];
};

export async function bulkInviteRecruiters(formData: FormData): Promise<BulkInviteResult> {
  const session = await requireRole(["recruiter"]);

  const companyId =
    session.companyId ??
    (
      await prisma.company.findUniqueOrThrow({
        where: { recruiterId: session.id },
        select: { id: true },
      })
    ).id;

  const raw = formData.get("emails");
  const parsed = RecruiterBulkInviteSchema.safeParse({ emails: raw });

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const emails = parsed.data.emails;
  const baseUrl = env.data?.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const invitedByName = session.name ?? session.email;

  const [existingMembers, existingInvites] = await Promise.all([
    prisma.companyTeamMember.findMany({
      where: {
        companyId,
        user: { email: { in: emails } },
      },
      select: { user: { select: { email: true } } },
    }),
    prisma.recruiterInvite.findMany({
      where: { email: { in: emails }, companyId, acceptedAt: null },
      select: { email: true },
    }),
  ]);

  const memberEmails = new Set(existingMembers.map((m) => m.user.email));
  const pendingInviteEmails = new Set(existingInvites.map((i) => i.email));
  const pendingEmails = new Set<string>();

  const skipped: { email: string; reason: string }[] = [];

  for (const email of emails) {
    if (memberEmails.has(email)) {
      skipped.push({ email, reason: "Already a team member" });
    } else if (pendingInviteEmails.has(email)) {
      skipped.push({ email, reason: "Pending invite already exists" });
    } else {
      pendingEmails.add(email);
    }
  }

  const invitesToCreate = Array.from(pendingEmails).map((email) => ({
    email,
    companyId,
    invitedById: session.id,
    token: crypto.randomUUID(),
  }));

  if (invitesToCreate.length > 0) {
    await prisma.recruiterInvite.createMany({ data: invitesToCreate });
  }

  const errors: { email: string; error: string }[] = [];
  const emailPromises = invitesToCreate.map(async (invite) => {
    try {
      const acceptUrl = `${baseUrl}/recruiter-invite?token=${invite.token}`;
      await sendEmail({
        to: invite.email,
        subject: "You've been invited to join a team on HireFlow",
        url: acceptUrl,
        type: "recruiter-invite",
        invitedByName,
      });
    } catch (err) {
      logger.server.error(`Failed to send recruiter invite email to ${invite.email}:`, err);
      errors.push({
        email: invite.email,
        error: err instanceof Error ? err.message : "Email send failed",
      });
    }
  });

  await Promise.allSettled(emailPromises);

  revalidatePath("/recruiter/team");

  return {
    sent: invitesToCreate.length,
    skipped,
    errors,
  };
}
