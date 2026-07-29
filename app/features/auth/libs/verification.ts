import prisma from "@/lib/prisma";
import { auth } from "../libs/auth";
import { headers } from "next/headers";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";

type UserStatusResult = { status: "NOT_FOUND" } | { status: "UNVERIFIED" } | { status: "VERIFIED" };

export async function verifyUserStatus(
  email: string,
  callbackPath = "/verify-email",
): Promise<UserStatusResult> {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    return { status: "NOT_FOUND" };
  }

  if (!existingUser.emailVerified) {
    const appUrl = env.data?.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      logger.server.error("Missing NEXT_PUBLIC_APP_URL");
    }

    const callbackURL = `${appUrl}${callbackPath.startsWith("/") ? callbackPath : `/${callbackPath}`}`;
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
