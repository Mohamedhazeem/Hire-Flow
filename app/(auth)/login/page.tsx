import { LoginForm } from "@/app/features/auth/components/login-form";

export const metadata = {
  title: "Login",
  description: "Sign in to your account",
};

type Props = {
  searchParams: Promise<{
    verified?: string;
    reset?: string; // 👈 1. Declare the password reset query string type
  }>;
};
export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const pageMessage =
    params.verified === "success"
      ? "Email verified successfully. Please sign in."
      : params.reset === "success"
        ? "Password updated successfully! Please sign in with your new password."
        : undefined;

  return <LoginForm pageMessage={pageMessage} />;
}
