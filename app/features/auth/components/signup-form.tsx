"use client";

import Link from "next/link";
import { AuthLayout } from "./auth-layout";
import { FormButton } from "./form-button";
import { FormInput } from "./form-input";
import { SocialSignInButtons } from "./social-signin-buttons";
import { registerAction } from "../actions/register-action";
import { useForm } from "react-hook-form";
import { SignUpSchema } from "../schema/auth.schema";
import { z } from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Roles, RoleType } from "../schema/role.schema";

type RegisterInput = z.input<typeof SignUpSchema>;

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(SignUpSchema),
    mode: "onChange",
    defaultValues: { role: Roles.USER },
  });

  const [selectedRole, setSelectedRole] = useState<RoleType>("USER");

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const result = await registerAction(data);
      if (result.success) {
        setSuccessMessage(
          "Account created. Check your email to verify your account before signing in.",
        );
      } else {
        const firstError = Object.values(result.errors)[0]?.[0];
        if (firstError) setFormError(firstError);
      }
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <AuthLayout title="Create an account" subtitle="Start your hiring flow with a secure login">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Role tabs */}
        <div className="flex gap-2 bg-input-bg/30 p-1 rounded-2xl border border-border-subtle">
          <button
            type="button"
            onClick={() => {
              setSelectedRole("RECRUITER");
              setValue("role", "RECRUITER", { shouldDirty: true, shouldTouch: true });
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
              selectedRole === "RECRUITER"
                ? "bg-brand text-text-inverse shadow-sm shadow-brand/20"
                : "text-text-body hover:bg-bg-surface"
            }`}
          >
            Looking to hire
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole("USER");
              setValue("role", "USER", { shouldDirty: true, shouldTouch: true });
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
              selectedRole === "USER"
                ? "bg-brand text-text-inverse shadow-sm shadow-brand/20"
                : "text-text-body hover:bg-bg-surface"
            }`}
          >
            Looking for job
          </button>
        </div>

        {/* hidden role input registered with RHF */}
        <input type="hidden" {...register("role")} />
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
          label="Full Name"
          id="name"
          type="text"
          placeholder="John Doe"
          register={register("name")}
          error={errors.name}
        />
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

        <FormButton isLoading={isLoading} loadingText="Creating account..." submitText="Sign Up" />
      </form>

      <div className="relative">
        <div className="absolute inset-x-0 top-1/2 h-px bg-border-subtle" />
        <p className="relative mx-auto w-fit bg-bg-elevated px-3 text-sm text-text-muted">
          or continue with
        </p>
      </div>
      <SocialSignInButtons />
      <div className="text-center">
        <p className="text-text-muted text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-text-link hover:text-text-heading font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
