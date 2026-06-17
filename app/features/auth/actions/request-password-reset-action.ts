"use server";

import { RequestPasswordResetSchema } from "@/app/features/auth/schema/auth.schema";
import { validateWithZod } from "@/app/lib/validator";
import { auth } from "@/app/features/auth/libs/auth";
import { prisma } from "@/app/lib/prisma";
import { headers } from "next/headers";
import { env } from "@/app/utils/env";
import type { ActionResult } from "@/app/features/auth/schema/auth.type";
import type { z } from "zod";
import { logger } from "@/app/utils/logger";

type RequestPasswordResetInput = z.infer<typeof RequestPasswordResetSchema>;

export async function requestPasswordResetAction(data: unknown): Promise<ActionResult> {
  const validation = validateWithZod<RequestPasswordResetInput>(RequestPasswordResetSchema, data);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.fieldErrors,
    };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: validation.data.email },
    });

    if (!existingUser) {
      return {
        success: false,
        errors: {
          email: ["Email address not found. Please register first."],
        },
      };
    }

    const appUrl = env.data?.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      logger.server.error("Missing NEXT_PUBLIC_APP_URL environment variable.");
    }

    await auth.api.requestPasswordReset({
      body: {
        email: validation.data.email,
        redirectTo: `${appUrl}/reset-password`,
      },
      headers: await headers(),
    });

    return { success: true };
  } catch {
    return {
      success: false,
      errors: {
        form: ["Unable to send reset instructions. Please try again later."],
      },
    };
  }
}
