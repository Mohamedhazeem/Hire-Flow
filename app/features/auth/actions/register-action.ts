"use server";

import { SignUpSchema } from "@/app/features/auth/schema/auth.schema";
import { validateWithZod } from "@/lib/validator";
import { auth } from "@/app/features/auth/libs/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ActionResult, RegisterInputType } from "../schema/auth.type";
import { authError } from "../utils/authError";
import { getRedirectPath } from "../utils/getRedirectPath";
import { verifyUserStatus } from "../libs/verification";

export async function registerAction(data: unknown): Promise<ActionResult> {
  // 1. Validate form fields first
  const validation = validateWithZod<RegisterInputType>(SignUpSchema, data);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.fieldErrors,
    };
  }

  const { role, ...safeSignupBody } = validation.data as RegisterInputType;
  void role;

  let redirectUrl: string | null = null;

  try {
    const userStatus = await verifyUserStatus(validation.data.email);

    switch (userStatus.status) {
      case "NOT_FOUND":
        break; // continue signup

      case "UNVERIFIED":
        return {
          success: false,
          errors: {
            form: [
              "Your account already exists but is not verified. A new verification email has been sent.",
            ],
          },
        };

      case "VERIFIED":
        return {
          success: false,
          errors: {
            form: ["An account with this email already exists."],
          },
        };
    }

    const response = await auth.api.signUpEmail({
      body: safeSignupBody,
      headers: await headers(),
    });

    if (response?.token && response.user?.role) {
      redirectUrl = getRedirectPath(response.user);
    } else if (response?.user) {
      return { success: true };
    }
  } catch (error: unknown) {
    const parsedAuthError = authError(error, "SIGNUP");
    if (parsedAuthError) return parsedAuthError;
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return {
    success: false,
    errors: { form: ["Unable to create your account. Please try again later."] },
  };
}
