"use server";

import { SignUpSchema } from "@/app/features/auth/schema/auth.schema";
import { validateWithZod } from "@/app/lib/validator";
import { auth } from "@/app/features/auth/libs/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ActionResult, RegisterInput } from "../schema/auth.type";
import { authError } from "../utils/authError";
import { getRedirectPath } from "../utils/getRedirectPath";

export async function registerAction(data: unknown): Promise<ActionResult> {
  const validation = validateWithZod<RegisterInput>(SignUpSchema, data);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.fieldErrors,
    };
  }
  let redirectUrl: string | null = null;

  try {
    const { role, ...safeSignupBody } = validation.data as RegisterInput;
    void role;

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
    if (parsedAuthError) {
      return parsedAuthError;
    }
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return {
    success: false,
    errors: { form: ["Unable to create your account. Please try again later."] },
  };
}
