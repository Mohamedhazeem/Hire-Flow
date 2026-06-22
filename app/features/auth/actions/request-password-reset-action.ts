// app/features/auth/actions/requestPasswordResetAction.ts
"use server";

import { ForgotPasswordSchema } from "@/app/features/auth/schema/auth.schema";
import { validateWithZod } from "@/lib/validator";
import { auth } from "@/app/features/auth/libs/auth";
import { headers } from "next/headers";
import { logger } from "@/utils/logger";

import type { ActionResult, ForgotPasswordType } from "@/app/features/auth/schema/auth.type";
import { verifyUserStatus } from "../libs/verification";

export async function requestPasswordResetAction(data: unknown): Promise<ActionResult> {
  const validation = validateWithZod<ForgotPasswordType>(ForgotPasswordSchema, data);

  if (!validation.success) {
    return { success: false, errors: validation.error.fieldErrors };
  }

  const email = validation.data.email;

  try {
    // Execute shared database checking and email verification routing rules
    const userState = await verifyUserStatus(email, `/login`);

    if (userState.status === "NOT_FOUND") {
      return {
        success: false,
        errors: { email: ["Email address not found. Please register first."] },
      };
    }

    if (userState.status === "UNVERIFIED") {
      return {
        success: true,
        message: "Your email is not verified. A fresh verification link has been sent.",
      };
    }

    // If status is "VERIFIED", proceed safely with the core reset pipeline
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: `/reset-password`,
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: "If that email is registered, reset instructions have been sent.",
    };
  } catch (error) {
    logger.server.error("Password reset failure exception:", error);
    return {
      success: false,
      errors: { form: ["Unable to send reset instructions. Please try again later."] },
    };
  }
}
