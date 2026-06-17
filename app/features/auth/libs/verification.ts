import { headers } from "next/headers";
import prisma from "@/app/lib/prisma"; // adjust path
import { ActionResult } from "../schema/auth.type";
import { auth } from "./auth";

export async function hasUserNotVerified(email: string): Promise<ActionResult> {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    return {
      success: false,
      errors: {
        form: ["No account found with this email."],
      },
    };
  }

  if (!existingUser.emailVerified) {
    await auth.api.sendVerificationEmail({
      body: {
        email,
        callbackURL: "/",
      },
      headers: await headers(),
    });

    return {
      success: true,
    };
  }

  return {
    success: false,
    errors: {
      email: ["An account with this email already exists."],
    },
  };
}
