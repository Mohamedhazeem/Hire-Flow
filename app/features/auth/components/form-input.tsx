"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UseFormRegisterReturn, FieldError } from "react-hook-form";

interface FormInputProps {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
}

export function FormInput({ label, id, error, register, ...props }: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const passwordInput = props.type === "password";

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-text-heading">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          {...props}
          {...register}
          id={id}
          type={passwordInput ? (showPassword ? "text" : "password") : props.type}
          className={`w-full rounded-lg bg-input-bg border px-4 py-3 text-text-body placeholder-text-muted transition-colors focus:outline-none ${
            passwordInput ? "pr-12" : ""
          } ${
            error
              ? "border-error/50 focus:border-error focus:ring-2 focus:ring-error/20"
              : "border-border-subtle focus:border-input-focus focus:ring-2 focus:ring-brand/20"
          }`}
        />

        {passwordInput && (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="absolute right-2 inline-flex h-10 w-10 items-center justify-center  bg-transparent text-text-muted transition-colors hover:bg-input-bg/90 hover:text-text-heading focus-visible:ring-2 focus-visible:ring-brand/20"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        )}
      </div>
      {error && (
        <p className="text-sm text-error flex items-center gap-1">
          <span className="text-error">*</span>
          {error.message}
        </p>
      )}
    </div>
  );
}
