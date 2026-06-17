"use server";

import { ResetPasswordSchema } from "@/app/features/auth/schema/auth.schema";
import { validateWithZod } from "@/app/lib/validator";
import { auth } from "@/app/features/auth/libs/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionResult, ResetPasswordType } from "@/app/features/auth/schema/auth.type";
import { verifyUserStatus } from "../libs/verification";

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
    const userState = await verifyUserStatus(validation.data.email, "/login");

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
  } catch (error: unknown) {
    console.error("Password reset failure exception:", error);
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
