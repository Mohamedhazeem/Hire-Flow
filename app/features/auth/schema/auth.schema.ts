import { env } from "@/app/utils/env";
import { z } from "zod";
import { Roles, RoleSchema } from "./role.schema";
import disposableDomains from "disposable-email-domains";

const disposableSet = new Set(disposableDomains);

const ENABLE_TEMP_MAIL_CHECK = env.data?.NEXT_PUBLIC_ENABLE_TEMP_CHECK !== "false";

const emailSchema = z.email("Invalid email address").refine((email) => {
  if (!ENABLE_TEMP_MAIL_CHECK) return true;
  const domain = email.split("@")[1]?.toLowerCase();
  return !disposableSet.has(domain);
});

export const PasswordSchema = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters long")
  .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/, "Password must contain letters and numbers");

export const SignInSchema = z.object({
  email: emailSchema,
  password: PasswordSchema,
});

export const SignUpSchema = SignInSchema.extend({
  name: z.string().min(4, "Name must be at least 4 characters long"),
  role: RoleSchema.default(Roles.USER),
});

export const ForgotPasswordSchema = z.object({
  email: emailSchema,
});

export const RequestPasswordResetSchema = ForgotPasswordSchema;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Invalid reset token"),
  newPassword: PasswordSchema,
});
