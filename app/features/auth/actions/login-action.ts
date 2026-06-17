"use server";

import { SignInSchema } from "@/app/features/auth/schema/auth.schema";
import { validateWithZod } from "@/app/lib/validator";
import { auth } from "@/app/features/auth/libs/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authError } from "../utils/authError";
import { getRedirectPath } from "../utils/getRedirectPath";
import { ActionResult, LoginInputType } from "../schema/auth.type";
import { hasUserNotVerified } from "../libs/verification";

export async function loginAction(data: unknown): Promise<ActionResult> {
  const validation = validateWithZod<LoginInputType>(SignInSchema, data);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.fieldErrors,
    };
  }
  let redirectUrl: string | null = null;
  try {
    const result = await hasUserNotVerified(validation.data.email);

    if (result.success) {
      return result;
    }
    if (result.errors?.form) {
      return result;
    }
    const response = await auth.api.signInEmail({
      body: {
        email: validation.data.email,
        password: validation.data.password,
      },
      headers: await headers(),
    });

    if (response?.token && response.user?.role) {
      redirectUrl = getRedirectPath(response.user);
    }
  } catch (error: unknown) {
    const parsedAuthError = authError(error, "LOGIN");
    if (parsedAuthError) {
      return parsedAuthError;
    }
  }
  if (redirectUrl) {
    redirect(redirectUrl);
  }
  return {
    success: false,
    errors: {
      form: ["Unable to sign in. Please try again later."],
    },
  };
}
