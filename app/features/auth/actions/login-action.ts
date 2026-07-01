"use server";

import { SignInSchema } from "@/app/features/auth/schema/auth.schema";
import { validateWithZod } from "@/lib/validator";
import { auth } from "@/app/features/auth/libs/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authError } from "../utils/authError";
import { getRedirectPath } from "../utils/getRedirectPath";
import { ActionResult } from "../schema/auth.type";
import { verifyUserStatus } from "../libs/verification";
import { z } from "zod";

const LoginActionSchema = SignInSchema.extend({
  returnUrl: z.string().optional(),
});
type LoginActionInput = z.infer<typeof LoginActionSchema>;

export async function loginAction(data: unknown): Promise<ActionResult> {
  const validation = validateWithZod<LoginActionInput>(LoginActionSchema, data);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.fieldErrors,
    };
  }
  let redirectUrl: string | null = null;
  try {
    const userStatus = await verifyUserStatus(validation.data.email);

    switch (userStatus.status) {
      case "NOT_FOUND":
        return {
          success: false,
          errors: {
            email: ["No account found with this email."],
          },
        };

      case "UNVERIFIED":
        return {
          success: false,
          errors: {
            email: ["Your email is not verified. A new verification email has been sent."],
          },
        };

      case "VERIFIED":
        break;
    }

    const response = await auth.api.signInEmail({
      body: {
        email: validation.data.email,
        password: validation.data.password,
      },
      headers: await headers(),
    });

    if (response?.token && response.user?.role) {
      redirectUrl = getRedirectPath(response.user, validation.data.returnUrl);
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
