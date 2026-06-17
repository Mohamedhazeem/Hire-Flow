"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "./auth-layout";
import { FormButton } from "./form-button";
import { FormInput } from "./form-input";
import { resetPasswordAction } from "@/app/features/auth/actions/reset-password-action";
import { ResetPasswordSchema } from "@/app/features/auth/schema/auth.schema";
import { z } from "zod";

type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: "onChange",
    defaultValues: { token },
  });

  // Sync token value dynamically if URL finishes parsing late
  useEffect(() => {
    if (token) {
      setValue("token", token, { shouldValidate: true });
    }
  }, [token, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    setFormError(null);

    try {
      const result = await resetPasswordAction(data);
      if (!result.success) {
        const firstError = Object.values(result.errors ?? {})[0]?.[0];
        if (firstError) setFormError(firstError);
      }
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Create a strong new password for your account."
    >
      <form onSubmit={onSubmit} className="space-y-6">
        {formError && (
          <div className="bg-error/10 border border-error/50 text-error px-4 py-3 rounded-lg text-sm">
            {formError}
          </div>
        )}

        {/* Secretly tracks the token without showing it to the user */}
        <input type="hidden" {...register("token")} />

        <FormInput
          label="New Password"
          id="newPassword"
          type="password"
          placeholder="••••••••"
          register={register("newPassword")}
          error={errors.newPassword}
        />

        <FormButton
          isLoading={isLoading}
          loadingText="Resetting password..."
          submitText="Reset Password"
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
