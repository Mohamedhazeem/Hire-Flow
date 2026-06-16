import { APIError } from "better-auth/api";
import { ActionResult, AuthType } from "../schema/auth.type";

export function authError(error: unknown, authType: AuthType = "SIGNUP"): ActionResult {
  if (error instanceof APIError) {
    if (
      error.body?.code?.toLowerCase().includes("already_exists") ||
      error.status === "UNPROCESSABLE_ENTITY"
    ) {
      return {
        success: false,
        errors: {
          email: [
            error.body?.message || "This email is already registered. Please use another email.",
          ],
        },
      };
    } else if (error.body?.code?.toLowerCase() === "email_not_found") {
      return {
        success: false,
        errors: {
          form: [
            "Your social provider did not share an email address. Please make sure your email is public in your social account or sign up with an email and password.",
          ],
        },
      };
    } else if (error.status === "TOO_MANY_REQUESTS") {
      return {
        success: false,
        errors: {
          form: [
            error.body?.message ||
              "You have made too many attempts. Please wait a moment before trying again.",
          ],
        },
      };
    }
  }
  return {
    success: false,
    errors: {
      form: [
        authType === "SIGNUP"
          ? "Unable to create your account. Please try again later."
          : "Unable to sign in. Please verify your credentials or try again later.",
      ],
    },
  };
}
