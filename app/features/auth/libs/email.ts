import { env } from "@/app/utils/env";
import { Resend } from "resend";
import { VerificationEmail } from "../components/email/verfication-email";
import { ResetPasswordEmail } from "../components/email/reset-password-email";
import React from "react";
import { render } from "react-email";
import { logger } from "@/app/utils/logger";

const resend = new Resend(env.data?.RESEND_API_KEY || "dummy-key");
const emailFrom = env.data?.EMAIL_FROM || "onboarding@resend.dev";

interface SendEmailArgs {
  to: string;
  subject: string;
  url: string;
  type: "verification" | "reset";
}

export async function sendEmail({ to, subject, url, type }: SendEmailArgs): Promise<void> {
  // Graceful fallback for local development setup checks
  if (!env.data?.RESEND_API_KEY) {
    logger.server.warn(
      `⚠️ [sendEmail] Missing RESEND_API_KEY. Email simulation to <${to}>:\nSubject: ${subject}\nBody: ${url}\n`,
    );
    return;
  }

  try {
    const emailComponent = type === "reset" ? ResetPasswordEmail : VerificationEmail;
    const htmlComponent = await render(React.createElement(emailComponent, { url }));
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
