import type { ReactNode } from "react";
import type { FieldError } from "react-hook-form";

type FormFieldProps = {
  label: string;
  required?: boolean;
  error?: FieldError;
  children: ReactNode;
};

export function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-heading mb-1">
        {label} {required && "*"}
      </label>
      {children}
      {error && <p className="text-sm text-destructive mt-1">{error.message}</p>}
    </div>
  );
}
