"use client";

import Link from "next/link";
import { AuthLayout } from "./auth-layout";
import { FormButton } from "./form-button";
import { FormInput } from "./form-input";
import { SocialSignInButtons } from "./social-signin-buttons";
import { loginAction } from "../actions/login-action";
import { requestPasswordResetAction } from "../actions/request-password-reset-action";
import { useForm } from "react-hook-form";
import { SignInSchema } from "../schema/auth.schema";
import { z } from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

type SignInInput = z.infer<typeof SignInSchema>;

type LoginFormProps = {
  pageMessage?: string;
};

// LoginForm.tsx
export function LoginForm({ pageMessage }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
    mode: "onChange",
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    setFormError(null);

    try {
      const result = await loginAction(data);
      if (result && !result.success) {
        const firstError = Object.values(result.errors ?? {})[0]?.[0];
        if (firstError) setFormError(firstError);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        return;
      }

      setFormError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  });

  const handleForgotPassword = async () => {
    setIsLoading(true);
    setFormError(null);
    setSuccessMessage(null);

    const email = getValues("email");
    if (!email) {
      setFormError("Please enter your email address to reset your password.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await requestPasswordResetAction({ email });
      if (!result.success) {
        const firstError = Object.values(result.errors ?? {})[0]?.[0];
        if (firstError) {
          setFormError(firstError);
        }
      } else {
        setSuccessMessage(
          result.message ??
            "If that email is registered, reset instructions have been sent.",
        );
      }
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
      {pageMessage ? (
        <div className="mb-4 rounded-lg border border-success/50 bg-success/10 px-4 py-3 text-sm text-success">
          {pageMessage}
        </div>
      ) : null}
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

        <FormInput
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          register={register("password")}
          error={errors.password}
        />

        <FormButton
          isLoading={isLoading}
          loadingText="Signing in..."
          submitText="Sign In"
        />

        <div className="flex justify-between text-sm text-text-muted">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-text-link hover:text-text-heading font-semibold transition-colors"
          >
            Forgot password?
          </button>
          <Link
            href="/register"
            className="text-text-link hover:text-text-heading font-semibold transition-colors"
          >
            Sign up
          </Link>
        </div>
      </form>

      <div className="relative ">
        <div className="absolute inset-x-0 top-1/2 h-px bg-border-subtle" />
        <p className="relative mx-auto w-fit bg-bg-elevated px-3 text-sm text-text-muted">
          or continue with
        </p>
      </div>

      <SocialSignInButtons isVertical={true} />
    </AuthLayout>
  );
}
