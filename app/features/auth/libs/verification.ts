// app/features/auth/utils/verifyUserStatus.ts
import prisma from "@/app/lib/prisma";
import { auth } from "../libs/auth";
import { headers } from "next/headers";

type UserStatusResult = { status: "NOT_FOUND" } | { status: "UNVERIFIED" } | { status: "VERIFIED" };

export async function verifyUserStatus(
  email: string,
  callbackURL: string,
): Promise<UserStatusResult> {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    return { status: "NOT_FOUND" };
  }

  if (!existingUser.emailVerified) {
    await auth.api.sendVerificationEmail({
      body: {
        email,
        callbackURL,
      },
      headers: await headers(),
    });
    return { status: "UNVERIFIED" };
  }

  return { status: "VERIFIED" };
}
