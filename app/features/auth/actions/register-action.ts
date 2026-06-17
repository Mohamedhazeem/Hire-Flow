"use server";

import { SignUpSchema } from "@/app/features/auth/schema/auth.schema";
import { validateWithZod } from "@/app/lib/validator";
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
    // 2. Run the unverified user intercept check right here
    const status = await verifyUserStatus(validation.data.email, "/");

    if (status.status === "UNVERIFIED") {
      return {
        success: false,
        errors: {
          form: [
            "This email is already registered but not verified. A new verification link has been sent.",
          ],
        },
      };
    }

    if (status.status === "VERIFIED") {
      return {
        success: false,
        errors: {
          form: ["This email is already registered. Please sign in instead."],
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
    console.log(error);
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
