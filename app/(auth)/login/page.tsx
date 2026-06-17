import { LoginForm } from "@/app/features/auth/components/login-form";

export const metadata = {
  title: "Login",
  description: "Sign in to your account",
};

type Props = {
  searchParams: Promise<{
    verified?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <>
      {params.verified === "success" && (
        <div className="mb-6 rounded-lg border border-success/50 bg-success/10 px-4 py-3 text-sm text-success">
          Email verified successfully. Please sign in.
        </div>
      )}

      <LoginForm />
    </>
  );
}
