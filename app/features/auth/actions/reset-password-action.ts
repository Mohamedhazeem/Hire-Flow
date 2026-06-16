"use server";

import { ResetPasswordSchema } from "@/app/features/auth/schema/auth.schema";
import { validateWithZod } from "@/app/lib/validator";
import { auth } from "@/app/features/auth/libs/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/app/features/auth/schema/auth.type";
import type { z } from "zod";

type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export async function resetPasswordAction(data: unknown): Promise<ActionResult> {
  const validation = validateWithZod<ResetPasswordInput>(ResetPasswordSchema, data);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.fieldErrors,
    };
  }

  try {
    const response = await auth.api.resetPassword({
      body: {
        token: validation.data.token,
        newPassword: validation.data.newPassword,
      },
      headers: await headers(),
    });

    if (response?.status) {
      redirect("/login");
    }
  } catch {
    return {
      success: false,
      errors: {
        form: ["Unable to reset your password. Please try again later."],
      },
    };
  }

  return {
    success: false,
    errors: {
      form: ["Unable to reset your password. Please try again later."],
    },
  };
}
