"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/features/auth/libs/auth";
import { sendEmail } from "@/app/features/auth/libs/email";
import { AdminInviteSchema } from "@/app/features/admin/schema/admin.schema";
import { ValidationError, UnauthorizedError, ForbiddenError } from "@/lib/api-error";
import { revalidatePath } from "next/cache";
import { RoleSchema } from "@/app/features/auth/schema/role.schema";
import { env } from "@/utils/env";

export async function inviteAdmin(formData: FormData) {
  const session = await getSession();

  if (!session?.user) {
    throw new UnauthorizedError();
  }

  const role = RoleSchema.safeParse((session.user as { role?: string }).role);
  if (!role.success || role.data !== "admin") {
    throw new ForbiddenError();
  }

  const email = formData.get("email");
  const parsed = AdminInviteSchema.safeParse({ email });

  if (!parsed.success) {
    throw new ValidationError("Invalid email address");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, role: true },
  });

  if (existingUser && existingUser.role === "admin") {
    throw new ValidationError("User is already an admin");
  }

  const existingInvite = await prisma.adminInvite.findFirst({
    where: { email: parsed.data.email, acceptedAt: null },
  });

  if (existingInvite) {
    throw new ValidationError("An active invite already exists for this email");
  }

  const token = crypto.randomUUID();
  const baseUrl = env.data?.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const acceptUrl = `${baseUrl}/admin-invite?token=${token}`;
  const invitedByName = session.user.name ?? session.user.email;

  await prisma.adminInvite.create({
    data: {
      email: parsed.data.email,
      invitedById: session.user.id,
      token,
    },
  });

  await sendEmail({
    to: parsed.data.email,
    subject: `You've been invited to join the admin team on HireFlow`,
    url: acceptUrl,
    type: "admin-invite",
    invitedByName,
  });

  revalidatePath("/admin/team");
  return { success: true, message: "Invitation sent successfully" };
}
