"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/app/features/shared/api/require-role";
import { redirect } from "next/navigation";

export async function upgradeToRecruiter() {
  const session = await requireRole(["user"]);

  await prisma.user.update({
    where: { id: session.id },
    data: { role: "recruiter" },
  });

  redirect("/recruiter");
}
