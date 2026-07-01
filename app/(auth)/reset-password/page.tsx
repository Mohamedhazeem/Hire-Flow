import { Suspense } from "react";
import { ResetPasswordForm } from "@/app/features/auth/components/reset-password-form";

export const metadata = {
  title: "Reset Password",
  description: "Choose a new password for your account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
