"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/features/auth/libs/auth";
import { sendEmail } from "@/app/features/auth/libs/email";
import { AdminBulkInviteSchema } from "@/app/features/admin/schema/admin.schema";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/api-error";
import { revalidatePath } from "next/cache";
import { RoleSchema } from "@/app/features/auth/schema/role.schema";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";

export type BulkInviteResult = {
  sent: number;
  skipped: { email: string; reason: string }[];
  errors: { email: string; error: string }[];
};

export async function bulkInviteAdmins(formData: FormData): Promise<BulkInviteResult> {
  const session = await getSession();

  if (!session?.user) {
    throw new UnauthorizedError();
  }

  const role = RoleSchema.safeParse((session.user as { role?: string }).role);
  if (!role.success || role.data !== "admin") {
    throw new ForbiddenError();
  }

  const raw = formData.get("emails");
  const parsed = AdminBulkInviteSchema.safeParse({ emails: raw });

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const emails = parsed.data.emails;
  const baseUrl = env.data?.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const invitedByName = session.user.name ?? session.user.email;

  const [existingUsers, existingInvites] = await Promise.all([
    prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true, role: true },
    }),
    prisma.adminInvite.findMany({
      where: { email: { in: emails }, acceptedAt: null },
      select: { email: true },
    }),
  ]);

  const adminEmails = new Set(existingUsers.filter((u) => u.role === "admin").map((u) => u.email));
  const pendingInviteEmails = new Set(existingInvites.map((i) => i.email));
  const pendingEmails = new Set<string>();

  const skipped: { email: string; reason: string }[] = [];

  for (const email of emails) {
    if (adminEmails.has(email)) {
      skipped.push({ email, reason: "Already an admin" });
    } else if (pendingInviteEmails.has(email)) {
      skipped.push({ email, reason: "Pending invite already exists" });
    } else {
      pendingEmails.add(email);
    }
  }

  const invitesToCreate = Array.from(pendingEmails).map((email) => ({
    email,
    invitedById: session.user.id,
    token: crypto.randomUUID(),
  }));

  if (invitesToCreate.length > 0) {
    await prisma.adminInvite.createMany({ data: invitesToCreate });
  }

  const errors: { email: string; error: string }[] = [];
  const emailPromises = invitesToCreate.map(async (invite) => {
    try {
      const acceptUrl = `${baseUrl}/admin-invite?token=${invite.token}`;
      await sendEmail({
        to: invite.email,
        subject: "You've been invited to join the admin team on HireFlow",
        url: acceptUrl,
        type: "admin-invite",
        invitedByName,
      });
    } catch (err) {
      logger.server.error(`Failed to send admin invite email to ${invite.email}:`, err);
      errors.push({ email: invite.email, error: err instanceof Error ? err.message : "Email send failed" });
    }
  });

  await Promise.allSettled(emailPromises);

  revalidatePath("/admin/team");

  return {
    sent: invitesToCreate.length,
    skipped,
    errors,
  };
}
