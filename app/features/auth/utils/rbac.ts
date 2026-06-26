import { auth } from "@/app/features/auth/libs/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RoleType, RoleSchema } from "../schema/role.schema";
import { prisma } from "@/lib/prisma";

export async function checkRole(allowedRoles: RoleType[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const userRole = RoleSchema.safeParse((session.user as { role: string }).role);

  if (userRole.success && allowedRoles.includes(userRole.data)) {
    return session.user;
  }

  if (allowedRoles.includes("recruiter")) {
    const membership = await prisma.companyTeamMember.findUnique({
      where: { userId: (session.user as { id: string }).id },
    });

    if (membership) {
      return session.user;
    }
  }

  redirect("/unauthorized");
}
