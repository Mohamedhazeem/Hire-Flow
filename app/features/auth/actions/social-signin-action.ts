"use server";

import { auth } from "@/app/features/auth/libs/auth";
import { logger } from "@/app/utils/logger";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type SocialProvider = "google" | "facebook";

export async function socialSignInAction(provider: SocialProvider) {
  const response = await auth.api.signInSocial({
    body: {
      provider,
      disableRedirect: true,
    },
    headers: await headers(),
  });

  if (response?.url) {
    redirect(response.url);
  }

  logger.server.warn("Unable to redirect to social provider.");
}
