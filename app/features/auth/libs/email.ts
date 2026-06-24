import { env } from "@/utils/env";
import { Resend } from "resend";
import { VerificationEmail } from "../components/email/verfication-email";
import { ResetPasswordEmail } from "../components/email/reset-password-email";
import { AdminInviteEmail } from "@/app/features/admin/components/email/admin-invite-email";
import React from "react";
import { render } from "react-email";
import { logger } from "@/utils/logger";

const resend = new Resend(env.data?.RESEND_API_KEY || "dummy-key");
const emailFrom = env.data?.EMAIL_FROM || "onboarding@resend.dev";

interface SendEmailArgs {
  to: string;
  subject: string;
  url: string;
  type: "verification" | "reset" | "admin-invite";
  invitedByName?: string;
}

export async function sendEmail({ to, subject, url, type, invitedByName }: SendEmailArgs): Promise<void> {
  if (!env.data?.RESEND_API_KEY) {
    logger.server.warn(
      `⚠️ [sendEmail] Missing RESEND_API_KEY. Email simulation to <${to}>:\nSubject: ${subject}\nBody: ${url}\n`,
    );
    return;
  }

  try {
    const emailComponent = type === "reset"
      ? ResetPasswordEmail
      : type === "admin-invite"
        ? AdminInviteEmail
        : VerificationEmail;
    const htmlComponent = type === "admin-invite"
      ? await render(React.createElement(emailComponent as typeof AdminInviteEmail, { url, invitedByName: invitedByName! }))
      : await render(React.createElement(emailComponent as typeof VerificationEmail, { url }));
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: [to],
      subject: subject,
      html: htmlComponent,
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
