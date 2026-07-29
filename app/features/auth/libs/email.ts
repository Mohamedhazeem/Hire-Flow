import { env } from "@/utils/env";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { VerificationEmail } from "../components/email/verfication-email";
import { ResetPasswordEmail } from "../components/email/reset-password-email";
import { AdminInviteEmail } from "@/app/features/admin/components/email/admin-invite-email";
import { BanNotificationEmail } from "@/app/features/admin/components/email/ban-notification-email";
import { RecruiterInviteEmail } from "@/app/features/recruiter/components/email/recruiter-invite-email";
import React from "react";
import { render } from "react-email";
import { logger } from "@/utils/logger";

const resend = new Resend(env.data?.RESEND_API_KEY || "dummy-key");
const emailFrom = env.data?.EMAIL_FROM || "onboarding@resend.dev";

interface SendEmailArgs {
  to: string;
  subject: string;
  url?: string;
  type:
    | "verification"
    | "reset"
    | "admin-invite"
    | "ban-notification"
    | "recruiter-invite"
    | "application_status";
  invitedByName?: string;
  banDetails?: {
    reason?: string | null;
    expiresInDays?: number | null;
  };
  /** When set, the recipient user is checked for a ban before sending (M1). */
  userId?: string;
}

export async function sendEmail({
  to,
  subject,
  url,
  type,
  invitedByName,
  banDetails,
  userId,
}: SendEmailArgs): Promise<void> {
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { banned: true },
    });
    if (user?.banned) {
      logger.server.warn(
        `⚠️ [sendEmail] Skipping email to banned user <${to}> (userId: ${userId}).`,
      );
      return;
    }
  }

  if (!env.data?.RESEND_API_KEY) {
    logger.server.warn(
      `⚠️ [sendEmail] Missing RESEND_API_KEY. Email simulation to <${to}>:\nSubject: ${subject}\nBody: ${url}\n`,
    );
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: [to],
      subject: subject,
      html:
        type === "application_status"
          ? `<p>Your application status has been updated.</p>`
          : await (async () => {
              const emailComponent =
                type === "reset"
                  ? ResetPasswordEmail
                  : type === "admin-invite"
                    ? AdminInviteEmail
                    : type === "ban-notification"
                      ? BanNotificationEmail
                      : type === "recruiter-invite"
                        ? RecruiterInviteEmail
                        : VerificationEmail;
              return type === "admin-invite" || type === "recruiter-invite"
                ? await render(
                    React.createElement(emailComponent as typeof RecruiterInviteEmail, {
                      url: url!,
                      invitedByName: invitedByName!,
                    }),
                  )
                : type === "ban-notification"
                  ? await render(
                      React.createElement(emailComponent as typeof BanNotificationEmail, {
                        adminName: invitedByName!,
                        reason: banDetails?.reason,
                        expiresInDays: banDetails?.expiresInDays,
                      }),
                    )
                  : await render(
                      React.createElement(emailComponent as typeof VerificationEmail, {
                        url: url!,
                      }),
                    );
            })(),
    });

    if (error) {
      logger.server.error(`❌ [sendEmail] Provider Error while emailing ${to}: ${error.message}`);
      return;
    }
    logger.server.info(`✅ [sendEmail] Dispatched successfully! ID: ${data?.id}`);
  } catch (error) {
    logger.server.error(`❌ [sendEmail] Fatal exception during delivery to ${to}:`, error);
  }
}
