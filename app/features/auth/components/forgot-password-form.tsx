"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "./auth-layout";
import { FormButton } from "./form-button";
import { FormInput } from "./form-input";
import { requestPasswordResetAction } from "@/app/features/auth/actions/request-password-reset-action";
import { ForgotPasswordSchema } from "@/app/features/auth/schema/auth.schema";
import type { z } from "zod";

type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const result = await requestPasswordResetAction(data);
      if (!result.success) {
        const firstError = Object.values(result.errors ?? {})[0]?.[0];
        if (firstError) {
          setFormError(firstError);
        }
      } else {
        setSuccessMessage(
          "If that email is registered, you will receive a link to reset your password shortly.",
        );
      }
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email to receive reset instructions."
    >
      <form onSubmit={onSubmit} className="space-y-6">
        {successMessage ? (
          <div className="bg-success/10 border border-success/50 text-success px-4 py-3 rounded-lg text-sm">
            {successMessage}
          </div>
        ) : null}

        {formError && (
          <div className="bg-error/10 border border-error/50 text-error px-4 py-3 rounded-lg text-sm">
            {formError}
          </div>
        )}

        <FormInput
          label="Email Address"
          id="email"
          type="email"
          placeholder="you@example.com"
          register={register("email")}
          error={errors.email}
        />

        <FormButton
          isLoading={isLoading}
          loadingText="Sending reset link..."
          submitText="Send Reset Link"
        />

        <div className="text-center">
          <p className="text-text-muted text-sm">
            Remembered your password?{" "}
            <Link
              href="/login"
              className="text-text-link hover:text-text-heading font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
