"use server";

import { ResetPasswordSchema } from "@/app/features/auth/schema/auth.schema";
import { validateWithZod } from "@/lib/validator";
import { auth } from "@/app/features/auth/libs/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionResult, ResetPasswordType } from "@/app/features/auth/schema/auth.type";
import { verifyUserStatus } from "../libs/verification";
import prisma from "@/lib/prisma";

export async function resetPasswordAction(data: unknown): Promise<ActionResult> {
  // 1. Structural schema validation
  const validation = validateWithZod<ResetPasswordType>(ResetPasswordSchema, data);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.fieldErrors,
    };
  }

  let shouldRedirect = false;

  try {
    // 1. Verify that the entered email belongs to an existing, verified account.
    const verificationRecord = await prisma.verification.findFirst({
      where: {
        identifier: {
          contains: validation.data.token,
        },
      },
    });

    if (!verificationRecord || new Date() > verificationRecord.expiresAt) {
      return {
        success: false,
        errors: {
          form: ["Your reset token has expired or is invalid. Please request a new link."],
        },
      };
    }

    // 4. Extract the target user's ID out of Better Auth's prefixed identifier string
    // Better Auth formats this field as: "reset-password:USER_ID_HERE"

    // 5. Query the User table using that ID to get their clean email address
    const targetUser = await prisma.user.findUnique({
      where: { id: verificationRecord.value },
    });

    if (!targetUser) {
      return {
        success: false,
        errors: {
          form: ["This account no longer exists in our database."],
        },
      };
    }

    // 6. Pass the retrieved email to your custom verifyUserStatus helper
    const userState = await verifyUserStatus(targetUser.email, "/login");

    if (userState.status === "NOT_FOUND") {
      return {
        success: false,
        errors: {
          form: ["This account no longer exists in our database."],
        },
      };
    }

    if (userState.status === "UNVERIFIED") {
      return {
        success: false,
        errors: {
          form: [
            "Your email must be verified first. We have sent a new verification link to your inbox.",
          ],
        },
      };
    }

    // 3. If they are VERIFIED, proceed with changing the password safely
    await auth.api.resetPassword({
      body: {
        token: validation.data.token,
        newPassword: validation.data.newPassword,
      },
      headers: await headers(),
    });

    shouldRedirect = true;
  } catch {
    return {
      success: false,
      errors: {
        form: ["Unable to reset your password right now. Please try again later."],
      },
    };
  }

  // 4. Redirect cleanly outside the try/catch block
  if (shouldRedirect) {
    redirect("/login?reset=success");
  }

  return {
    success: false,
    errors: {
      form: ["Unable to reset your password. Please try again later."],
    },
  };
}
